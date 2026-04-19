//! Emoji rendering via macOS CoreText.
//!
//! PangoCairo (Pango 1.x) cannot render color emoji fonts — `cairo_show_glyphs()`
//! has no color font support. This module bypasses PangoCairo entirely by
//! rendering emoji characters directly through Apple's CoreText API, which
//! fully supports SBIX color emoji (Apple Color Emoji font).
//!
//! The workflow:
//! 1. Detect emoji characters in text (via Unicode emoji properties)
//! 2. Render each unique emoji to an RGBA bitmap via CoreText
//! 3. Wrap the bitmap in a `GdkMemoryTexture` (implements `GdkPaintable`)
//! 4. Insert into `GtkTextBuffer` via `insert_paintable()`
//!
//! Non-emoji text is inserted normally via Pango (which handles it correctly).

#[cfg(target_os = "macos")]
pub(crate) mod platform {
    use std::collections::HashMap;

    /// Raw RGBA bitmap for a rendered emoji.
    pub struct EmojiBitmap {
        pub width: i32,
        pub height: i32,
        /// Integer scale factor (1 = normal, 2 = Retina/HiDPI).
        pub scale: i32,
        /// RGBA premultiplied pixel data, row-major, 4 bytes per pixel.
        pub data: Vec<u8>,
    }

    impl EmojiBitmap {
        /// Logical width (for layout purposes). Pixel width / scale.
        pub fn logical_width(&self) -> i32 {
            self.width / self.scale
        }
        /// Logical height (for layout purposes). Pixel height / scale.
        pub fn logical_height(&self) -> i32 {
            self.height / self.scale
        }
    }

    // CoreText/CoreGraphics FFI declarations
    #[allow(non_camel_case_types, dead_code)]
    mod ffi {
        use std::ffi::c_void;

        pub type CFStringRef = *const c_void;
        pub type CFAttributedStringRef = *const c_void;
        pub type CFDictionaryRef = *const c_void;
        pub type CTFontRef = *const c_void;
        pub type CTLineRef = *const c_void;
        pub type CGContextRef = *mut c_void;
        pub type CGColorSpaceRef = *const c_void;
        pub type CGFloat = f64;

        #[repr(C)]
        #[derive(Debug, Clone, Copy)]
        pub struct CGRect {
            pub origin: CGPoint,
            pub size: CGSize,
        }
        #[repr(C)]
        #[derive(Debug, Clone, Copy)]
        pub struct CGPoint {
            pub x: CGFloat,
            pub y: CGFloat,
        }
        #[repr(C)]
        #[derive(Debug, Clone, Copy)]
        pub struct CGSize {
            pub width: CGFloat,
            pub height: CGFloat,
        }

        // CFDictionaryKeyCallBacks / CFDictionaryValueCallBacks
        #[repr(C)]
        pub struct CFDictionaryKeyCallBacks {
            pub version: isize,
            pub retain: *const c_void,
            pub release: *const c_void,
            pub copy_description: *const c_void,
            pub equal: *const c_void,
            pub hash: *const c_void,
        }
        #[repr(C)]
        pub struct CFDictionaryValueCallBacks {
            pub version: isize,
            pub retain: *const c_void,
            pub release: *const c_void,
            pub copy_description: *const c_void,
            pub equal: *const c_void,
        }

        pub const K_CF_STRING_ENCODING_UTF8: u32 = 0x08000100;
        pub const K_CG_IMAGE_ALPHA_PREMULTIPLIED_LAST: u32 = 1; // kCGImageAlphaPremultipliedLast

        #[link(name = "CoreFoundation", kind = "framework")]
        extern "C" {
            // CoreFoundation
            pub static kCFTypeDictionaryKeyCallBacks: CFDictionaryKeyCallBacks;
            pub static kCFTypeDictionaryValueCallBacks: CFDictionaryValueCallBacks;

            pub fn CFStringCreateWithBytes(
                alloc: *const c_void,
                bytes: *const u8,
                num_bytes: isize,
                encoding: u32,
                is_external: bool,
            ) -> CFStringRef;
            pub fn CFDictionaryCreate(
                alloc: *const c_void,
                keys: *const *const c_void,
                values: *const *const c_void,
                num_values: isize,
                key_callbacks: *const CFDictionaryKeyCallBacks,
                value_callbacks: *const CFDictionaryValueCallBacks,
            ) -> CFDictionaryRef;
            pub fn CFAttributedStringCreate(
                alloc: *const c_void,
                string: CFStringRef,
                attributes: CFDictionaryRef,
            ) -> CFAttributedStringRef;
            pub fn CFRelease(cf: *const c_void);
        }

        #[link(name = "CoreText", kind = "framework")]
        extern "C" {
            pub static kCTFontAttributeName: *const c_void;
            pub fn CTFontCreateWithName(
                name: CFStringRef,
                size: CGFloat,
                matrix: *const c_void,
            ) -> CTFontRef;
            pub fn CTLineCreateWithAttributedString(
                attr_string: CFAttributedStringRef,
            ) -> CTLineRef;
            pub fn CTLineDraw(line: CTLineRef, context: CGContextRef);
            pub fn CTLineGetBoundsWithOptions(
                line: CTLineRef,
                options: u64,
            ) -> CGRect;
        }

        #[link(name = "CoreGraphics", kind = "framework")]
        extern "C" {
            pub fn CGColorSpaceCreateDeviceRGB() -> CGColorSpaceRef;
            pub fn CGColorSpaceRelease(space: CGColorSpaceRef);
            pub fn CGBitmapContextCreate(
                data: *mut c_void,
                width: usize,
                height: usize,
                bits_per_component: usize,
                bytes_per_row: usize,
                space: CGColorSpaceRef,
                bitmap_info: u32,
            ) -> CGContextRef;
            pub fn CGBitmapContextGetData(context: CGContextRef) -> *mut u8;
            pub fn CGContextRelease(context: CGContextRef);
            pub fn CGContextSetRGBFillColor(
                context: CGContextRef,
                r: CGFloat, g: CGFloat, b: CGFloat, a: CGFloat,
            );
            pub fn CGContextFillRect(context: CGContextRef, rect: CGRect);
            pub fn CGContextSetTextPosition(
                context: CGContextRef,
                x: CGFloat, y: CGFloat,
            );
        }

        /// Create a CFString from a Rust &str.
        pub unsafe fn cfstring_from_str(s: &str) -> CFStringRef {
            CFStringCreateWithBytes(
                std::ptr::null(),
                s.as_ptr(),
                s.len() as isize,
                K_CF_STRING_ENCODING_UTF8,
                false,
            )
        }
    }

    /// Render a single emoji string to an RGBA bitmap using CoreText.
    ///
    /// `size` is the font size in points (e.g. 20.0 for inline emoji).
    /// `scale` is the integer scale factor (1 = normal, 2 = Retina/HiDPI).
    /// At scale=2, the bitmap is rendered at 2x pixel resolution but
    /// `logical_width()`/`logical_height()` return the 1x layout size.
    /// Returns `None` if the rendering produces 0 visible pixels.
    pub fn render_emoji_coretext(emoji: &str, size: f64, scale: i32) -> Option<EmojiBitmap> {
        let render_size = size * (scale as f64);
        unsafe {
            let cf_str = ffi::cfstring_from_str(emoji);
            let font_name = ffi::cfstring_from_str("Apple Color Emoji");
            let font = ffi::CTFontCreateWithName(font_name, render_size, std::ptr::null());

            let keys: [*const std::ffi::c_void; 1] = [ffi::kCTFontAttributeName];
            let values: [*const std::ffi::c_void; 1] = [font];
            let attrs = ffi::CFDictionaryCreate(
                std::ptr::null(),
                keys.as_ptr(),
                values.as_ptr(),
                1,
                &ffi::kCFTypeDictionaryKeyCallBacks,
                &ffi::kCFTypeDictionaryValueCallBacks,
            );
            let attr_str = ffi::CFAttributedStringCreate(std::ptr::null(), cf_str, attrs);
            let line = ffi::CTLineCreateWithAttributedString(attr_str);

            let bounds = ffi::CTLineGetBoundsWithOptions(line, 0);

            // Add padding to avoid clipping
            let padding = 2.0;
            let w = (bounds.size.width + 2.0 * padding).ceil() as i32;
            let h = (bounds.size.height + 2.0 * padding).ceil() as i32;
            let w = w.max(4);
            let h = h.max(4);

            let color_space = ffi::CGColorSpaceCreateDeviceRGB();
            let ctx = ffi::CGBitmapContextCreate(
                std::ptr::null_mut(),
                w as usize,
                h as usize,
                8,
                (w as usize) * 4,
                color_space,
                ffi::K_CG_IMAGE_ALPHA_PREMULTIPLIED_LAST,
            );

            // Transparent background (all zeros = transparent black)
            // CGBitmapContextCreate with NULL data gives zero-initialized memory

            // Position text: CoreGraphics has Y going up from bottom
            let x = padding - bounds.origin.x;
            let y = padding - bounds.origin.y;
            ffi::CGContextSetTextPosition(ctx, x, y);
            ffi::CTLineDraw(line, ctx);

            // Copy pixel data before releasing the context.
            // `data_ptr` points to CG-internal memory that becomes invalid after
            // CGContextRelease, so we must copy first.
            let data_ptr = ffi::CGBitmapContextGetData(ctx);
            let byte_count = (w * h * 4) as usize;
            let raw_data = std::slice::from_raw_parts(data_ptr, byte_count).to_vec();

            // Cleanup CoreText/CoreGraphics resources (safe now, data is copied)
            ffi::CGContextRelease(ctx);
            ffi::CGColorSpaceRelease(color_space);
            ffi::CFRelease(line);
            ffi::CFRelease(attr_str);
            ffi::CFRelease(attrs);
            ffi::CFRelease(font);
            ffi::CFRelease(font_name);
            ffi::CFRelease(cf_str);

            // Tight-crop: find the bounding box of visible (non-transparent) pixels.
            // CoreText renders with extra space above and below the glyph (descender/
            // ascender space). Without cropping, GtkTextView positions the emoji too
            // high because the transparent padding shifts the visible content upward.
            let wu = w as usize;
            let hu = h as usize;
            let mut top = hu;    // first row with visible pixels
            let mut bottom = 0;  // last row with visible pixels
            let mut left = wu;   // leftmost visible column
            let mut right = 0;   // rightmost visible column

            for row in 0..hu {
                for col in 0..wu {
                    let idx = (row * wu + col) * 4;
                    if raw_data[idx + 3] > 0 {
                        if row < top { top = row; }
                        if row > bottom { bottom = row; }
                        if col < left { left = col; }
                        if col > right { right = col; }
                    }
                }
            }

            let visible = top <= bottom;

            if visible {
                // Crop to the tight bounding box of visible pixels
                let crop_w = (right - left + 1) as i32;
                let crop_h = (bottom - top + 1) as i32;
                let mut cropped = Vec::with_capacity((crop_w * crop_h * 4) as usize);
                for row in top..=bottom {
                    let src_start = (row * wu + left) * 4;
                    let src_end = src_start + (crop_w as usize) * 4;
                    cropped.extend_from_slice(&raw_data[src_start..src_end]);
                }
                Some(EmojiBitmap { width: crop_w, height: crop_h, scale, data: cropped })
            } else {
                None
            }
        }
    }

    /// Cache for rendered emoji bitmaps.
    ///
    /// Key: (emoji_string, font_size_tenths, scale) to avoid floating-point key issues.
    /// Font size is stored as tenths of a point (e.g. 200 = 20.0pt).
    pub struct EmojiCache {
        cache: HashMap<(String, u32, i32), Option<EmojiBitmap>>,
    }

    impl EmojiCache {
        pub fn new() -> Self {
            Self { cache: HashMap::new() }
        }

        /// Get or render an emoji bitmap. Returns `None` if the emoji
        /// cannot be rendered (e.g. not a valid emoji, or CoreText fails).
        /// `scale` is the integer scale factor (1 = normal, 2 = Retina/HiDPI).
        pub fn get_or_render(&mut self, emoji: &str, size: f64, scale: i32) -> Option<&EmojiBitmap> {
            let key = (emoji.to_string(), (size * 10.0) as u32, scale);
            self.cache
                .entry(key)
                .or_insert_with_key(|k| render_emoji_coretext(&k.0, size, scale))
                .as_ref()
        }
    }
}

#[cfg(not(target_os = "macos"))]
pub(crate) mod platform {
    pub struct EmojiBitmap {
        pub width: i32,
        pub height: i32,
        pub scale: i32,
        pub data: Vec<u8>,
    }

    impl EmojiBitmap {
        pub fn logical_width(&self) -> i32 { self.width / self.scale }
        pub fn logical_height(&self) -> i32 { self.height / self.scale }
    }

    pub struct EmojiCache;

    impl EmojiCache {
        pub fn new() -> Self { Self }
        pub fn get_or_render(&mut self, _emoji: &str, _size: f64, _scale: i32) -> Option<&EmojiBitmap> {
            None // No CoreText on non-macOS
        }
    }
}

pub use platform::{EmojiBitmap, EmojiCache};

// ── Emoji detection ────────────────────────────────────────────────

/// Check if a character is an emoji that needs bitmap rendering.
///
/// Returns `true` for characters that PangoCairo cannot render because
/// CoreText maps them to Apple Color Emoji (a color SBIX font that
/// Cairo's `cairo_show_glyphs()` cannot handle).
///
/// This uses the Unicode `Emoji_Presentation` property AND the
/// `Extended_Pictographic` property: characters that are rendered as
/// emoji by default, OR that become emoji with VS16 (U+FE0F), OR that
/// are components of ZWJ emoji sequences (♂ U+2642, ♀ U+2640).
///
/// Characters like ✓ (U+2713), ▶ (U+25B6), → (U+2192) are NOT included
/// because Pango maps them to system fonts (Lucida Grande, etc.) that
/// Cairo renders correctly.
pub fn is_emoji_char(c: char) -> bool {
    matches!(c,
        // === Characters with Emoji_Presentation=Yes ===
        // (default emoji rendering, no VS16 needed)

        // Misc Technical (specific emoji-presentation chars only)
        '\u{231A}'..='\u{231B}' | // ⌚⌛ Watch, Hourglass
        '\u{23E9}'..='\u{23F3}' | // ⏩⏪⏫⏬⏭⏮⏯⏰⏱⏲⏳
        '\u{23F8}'..='\u{23FA}' | // ⏸⏹⏺

        // === Extended_Pictographic chars (emoji with VS16) ===
        // These are NOT Emoji_Presentation=Yes by default, but become
        // color emoji when followed by VS16 (U+FE0F). They also appear
        // as components of ZWJ emoji sequences.

        // Misc Symbols — weather, celestial
        '\u{2600}'..='\u{2604}' | // ☀☁☂☃☄ Sun, Cloud, Umbrella, Snowman, Comet
        '\u{260E}' |              // ☎ Black Telephone
        '\u{2611}' |              // ☑ Ballot Box With Check
        '\u{2614}'..='\u{2615}' | // ☔☕
        '\u{2618}' |              // ☘ Shamrock
        '\u{261D}' |              // ☝ White Up Pointing Index
        '\u{2620}' |              // ☠ Skull and Crossbones
        '\u{2622}'..='\u{2623}' | // ☢☣ Radioactive, Biohazard
        '\u{2626}' |              // ☦ Orthodox Cross
        '\u{262A}' |              // ☪ Star and Crescent
        '\u{262E}'..='\u{262F}' | // ☮☯ Peace Symbol, Yin Yang
        '\u{2638}'..='\u{263A}' | // ☸☹☺ Wheel of Dharma, Frowning, Smiling
        '\u{2640}' |              // ♀ Female Sign (ZWJ component)
        '\u{2642}' |              // ♂ Male Sign (ZWJ component)
        '\u{2648}'..='\u{2653}' | // ♈..♓ Zodiac
        '\u{265F}'..='\u{2660}' | // ♟♠ Chess Pawn, Black Spade
        '\u{2663}' |              // ♣ Black Club Suit
        '\u{2665}'..='\u{2666}' | // ♥♦ Black Heart/Diamond Suit
        '\u{2668}' |              // ♨ Hot Springs
        '\u{267B}' |              // ♻ Recycling Symbol
        '\u{267E}'..='\u{267F}' | // ♾♿ Infinity, Wheelchair
        '\u{2692}'..='\u{2697}' | // ⚒⚓⚔⚕⚖⚗ Tools, Scales, Alembic
        '\u{2699}' |              // ⚙ Gear
        '\u{269B}'..='\u{269C}' | // ⚛⚜ Atom, Fleur-de-lis
        '\u{26A0}'..='\u{26A1}' | // ⚠⚡ Warning, Lightning
        '\u{26A7}' |              // ⚧ Transgender Symbol
        '\u{26AA}'..='\u{26AB}' | // ⚪⚫
        '\u{26B0}'..='\u{26B1}' | // ⚰⚱ Coffin, Funeral Urn
        '\u{26BD}'..='\u{26BE}' | // ⚽⚾
        '\u{26C4}'..='\u{26C5}' | // ⛄⛅
        '\u{26C8}' |              // ⛈ Thunder Cloud and Rain
        '\u{26CE}'..='\u{26CF}' | // ⛎⛏ Ophiuchus, Pick
        '\u{26D1}' |              // ⛑ Helmet with White Cross
        '\u{26D3}'..='\u{26D4}' | // ⛓⛔ Chains, No Entry
        '\u{26E9}'..='\u{26EA}' | // ⛩⛪ Shinto Shrine, Church
        '\u{26F0}'..='\u{26F5}' | // ⛰⛱⛲⛳⛴⛵ Mountain..Sailboat
        '\u{26F7}'..='\u{26FA}' | // ⛷⛸⛹⛺ Skier..Tent
        '\u{26FD}' |              // ⛽

        // Dingbats (specific emoji-presentation chars)
        '\u{2702}' |              // ✂
        '\u{2705}' |              // ✅
        '\u{2708}'..='\u{270D}' | // ✈✉✊✋✌✍
        '\u{270F}' |              // ✏
        '\u{2712}' |              // ✒
        '\u{2714}' |              // ✔  (but ✓ U+2713 is NOT emoji)
        '\u{2716}' |              // ✖
        '\u{271D}' |              // ✝
        '\u{2721}' |              // ✡
        '\u{2728}' |              // ✨
        '\u{2733}'..='\u{2734}' | // ✳✴
        '\u{2744}' |              // ❄
        '\u{2747}' |              // ❇
        '\u{274C}' |              // ❌
        '\u{274E}' |              // ❎
        '\u{2753}'..='\u{2755}' | // ❓❔❕
        '\u{2757}' |              // ❗
        '\u{2763}'..='\u{2764}' | // ❣❤
        '\u{2795}'..='\u{2797}' | // ➕➖➗
        '\u{27A1}' |              // ➡
        '\u{27B0}' |              // ➰
        '\u{27BF}' |              // ➿

        // Supplemental Arrows-B
        '\u{2934}'..='\u{2935}' | // ⤴⤵

        // Misc Symbols and Arrows
        '\u{2B05}'..='\u{2B07}' | // ⬅⬆⬇
        '\u{2B1B}'..='\u{2B1C}' | // ⬛⬜
        '\u{2B50}' |              // ⭐
        '\u{2B55}' |              // ⭕

        // CJK Symbols
        '\u{3030}' |              // 〰
        '\u{303D}' |              // 〽
        '\u{3297}' |              // ㊗
        '\u{3299}' |              // ㊙

        // === Supplemental Multilingual Plane emoji ===
        // (all chars in these ranges are Emoji_Presentation=Yes)

        // Mahjong Tiles
        '\u{1F004}' |             // 🀄

        // Playing Cards
        '\u{1F0CF}' |             // 🃏

        // Enclosed Alphanumeric Supplement
        '\u{1F170}'..='\u{1F171}' | // 🅰🅱
        '\u{1F17E}'..='\u{1F17F}' | // 🅾🅿
        '\u{1F18E}' |               // 🆎
        '\u{1F191}'..='\u{1F19A}' | // 🆑..🆚

        // Enclosed Ideographic Supplement
        '\u{1F201}'..='\u{1F202}' | // 🈁🈂
        '\u{1F21A}' |               // 🈚
        '\u{1F22F}' |               // 🈯
        '\u{1F232}'..='\u{1F23A}' | // 🈲..🈺
        '\u{1F250}'..='\u{1F251}' | // 🉐🉑

        // Miscellaneous Symbols and Pictographs
        '\u{1F300}'..='\u{1F321}' | // 🌀..🌡
        '\u{1F324}'..='\u{1F393}' | // 🌤..🎓
        '\u{1F396}'..='\u{1F397}' | // 🎖🎗
        '\u{1F399}'..='\u{1F39B}' | // 🎙🎚🎛
        '\u{1F39E}'..='\u{1F3F0}' | // 🎞..🏰
        '\u{1F3F3}'..='\u{1F3F5}' | // 🏳🏴🏵
        '\u{1F3F7}'..='\u{1F4FD}' | // 🏷..📽
        '\u{1F4FF}'..='\u{1F53D}' | // 📿..🔽
        '\u{1F549}'..='\u{1F54E}' | // 🕉..🕎
        '\u{1F550}'..='\u{1F567}' | // 🕐..🕧
        '\u{1F56F}'..='\u{1F570}' | // 🕯🕰
        '\u{1F573}'..='\u{1F57A}' | // 🕳..🕺
        '\u{1F587}' |               // 🖇
        '\u{1F58A}'..='\u{1F58D}' | // 🖊🖋🖌🖍
        '\u{1F590}' |               // 🖐
        '\u{1F595}'..='\u{1F596}' | // 🖕🖖
        '\u{1F5A4}'..='\u{1F5A5}' | // 🖤🖥
        '\u{1F5A8}' |               // 🖨
        '\u{1F5B1}'..='\u{1F5B2}' | // 🖱🖲
        '\u{1F5BC}' |               // 🖼
        '\u{1F5C2}'..='\u{1F5C4}' | // 🗂🗃🗄
        '\u{1F5D1}'..='\u{1F5D3}' | // 🗑🗒🗓
        '\u{1F5DC}'..='\u{1F5DE}' | // 🗜🗝🗞
        '\u{1F5E1}' |               // 🗡
        '\u{1F5E3}' |               // 🗣
        '\u{1F5E8}' |               // 🗨
        '\u{1F5EF}' |               // 🗯
        '\u{1F5F3}' |               // 🗳
        '\u{1F5FA}'..='\u{1F5FF}' | // 🗺..🗿

        // Transport and Map Symbols
        '\u{1F600}'..='\u{1F64F}' | // 😀..🙏 Emoticons

        // Transport and Map
        '\u{1F680}'..='\u{1F6C5}' | // 🚀..🛅
        '\u{1F6CB}'..='\u{1F6D2}' | // 🛋..🛒
        '\u{1F6D5}'..='\u{1F6D7}' | // 🛕🛖🛗
        '\u{1F6DC}'..='\u{1F6E5}' | // 🛜..🛥
        '\u{1F6E9}' |               // 🛩
        '\u{1F6EB}'..='\u{1F6EC}' | // 🛫🛬
        '\u{1F6F0}' |               // 🛰
        '\u{1F6F3}'..='\u{1F6FC}' | // 🛳..🛼

        // Supplemental Symbols and Pictographs
        '\u{1F7E0}'..='\u{1F7EB}' | // 🟠..🟫
        '\u{1F7F0}' |               // 🟰
        '\u{1F90C}'..='\u{1F93A}' | // 🤌..🤺
        '\u{1F93C}'..='\u{1F945}' | // 🤼..🥅
        '\u{1F947}'..='\u{1F9FF}' | // 🥇..🧿

        // Symbols and Pictographs Extended-A
        '\u{1FA00}'..='\u{1FA53}' | // 🨀..🩓
        '\u{1FA60}'..='\u{1FA6D}' | // 🩠..🩭
        '\u{1FA70}'..='\u{1FA7C}' | // 🩰..🩼
        '\u{1FA80}'..='\u{1FA89}' | // 🪀..🪉
        '\u{1FA8F}'..='\u{1FAC6}' | // 🪏..🫆
        '\u{1FACE}'..='\u{1FADC}' | // 🫎..🫜
        '\u{1FADF}'..='\u{1FAE9}' | // 🫟..🫩
        '\u{1FAF0}'..='\u{1FAF8}' | // 🫰..🫸

        // Flags (Regional Indicator Symbols)
        '\u{1F1E0}'..='\u{1F1FF}' | // 🇦..🇿

        // Skin tone modifiers (already covered by ranges above, kept as comment)
        // '\u{1F3FB}'..='\u{1F3FF}' // 🏻🏼🏽🏾🏿

        // Component characters that should be treated as emoji when
        // they follow an emoji (handled by is_emoji_modifier)
        '\u{200D}' |               // ZWJ
        '\u{FE0F}'                  // VS16 (emoji presentation selector)
    )
}

/// Compute the logical width for an emoji in a monospace context.
///
/// Emojis occupy 2 character columns (unicode_width = 2).
/// `mono_char_width` is the pixel width of a single monospace character.
/// Returns `2 * mono_char_width`, which is the correct width for table alignment.
pub fn monospace_emoji_width(mono_char_width: i32) -> i32 {
    2 * mono_char_width
}

/// Check if a character is a modifier that extends an emoji sequence.
///
/// These characters modify the preceding emoji but are not emoji themselves
/// when standalone. They include variation selectors, ZWJ, keycap combiner,
/// and skin tone modifiers.
pub fn is_emoji_modifier(c: char) -> bool {
    matches!(c,
        '\u{FE0E}' |                // VS15 (text presentation)
        '\u{FE0F}' |                // VS16 (emoji presentation)
        '\u{200D}' |                // ZWJ (Zero Width Joiner)
        '\u{20E3}' |                // Combining Enclosing Keycap
        '\u{1F3FB}'..='\u{1F3FF}'   // Skin tone modifiers
    )
}

/// Split text into segments of plain text and emoji sequences.
///
/// Each segment is either:
/// - `TextSegment::Plain(str)` — renderable by Pango
/// - `TextSegment::Emoji(str)` — needs CoreText bitmap rendering
#[derive(Debug, Clone, PartialEq)]
pub enum TextSegment {
    Plain(String),
    Emoji(String),
}

/// Check if a character is a Regional Indicator Symbol (U+1F1E6..U+1F1FF).
/// Two consecutive regional indicators form a flag emoji (e.g. 🇩🇪 = 🇩+🇪).
fn is_regional_indicator(c: char) -> bool {
    ('\u{1F1E0}'..='\u{1F1FF}').contains(&c)
}

/// Split text into plain and emoji segments.
///
/// Each visual emoji (including ZWJ sequences and VS16 combinations)
/// becomes its own `Emoji` segment. Adjacent standalone emojis like
/// `😀😀😀` produce 3 separate segments — NOT one merged segment.
/// This is critical because the overlay system allocates 2 placeholder
/// spaces per segment; merging N emojis into one segment squishes
/// N emojis into a single 2-space slot.
pub fn split_emoji_segments(text: &str) -> Vec<TextSegment> {
    let mut segments = Vec::new();
    let mut plain = String::new();
    let mut emoji = String::new();

    let chars: Vec<char> = text.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        let c = chars[i];

        if is_emoji_char(c) {
            // Flush plain text
            if !plain.is_empty() {
                segments.push(TextSegment::Plain(std::mem::take(&mut plain)));
            }

            // Start a new emoji sequence with this base character.
            emoji.push(c);
            i += 1;

            // Special case: regional indicators form flag pairs.
            // If the base is a regional indicator and the next char is also one,
            // consume it as part of the same flag emoji.
            if is_regional_indicator(c) {
                if i < chars.len() && is_regional_indicator(chars[i]) {
                    emoji.push(chars[i]);
                    i += 1;
                }
            }

            // Consume modifiers that extend THIS emoji (VS16, skin tones,
            // keycap combiner). If we hit a ZWJ, consume it AND the next
            // emoji character (which is part of the same ZWJ sequence).
            // But a new base emoji WITHOUT a preceding ZWJ starts a new segment.
            while i < chars.len() {
                let next = chars[i];
                if next == '\u{200D}' {
                    // ZWJ: consume it + the following emoji base + its modifiers
                    emoji.push(next);
                    i += 1;
                    // Consume the emoji base after ZWJ
                    if i < chars.len() && is_emoji_char(chars[i]) {
                        emoji.push(chars[i]);
                        i += 1;
                    }
                    // Continue loop to pick up modifiers after the ZWJ-joined char
                } else if is_emoji_modifier(next) {
                    // VS16, skin tone, keycap combiner — extends current emoji
                    emoji.push(next);
                    i += 1;
                } else {
                    // Not a modifier, not ZWJ → end of this emoji sequence
                    break;
                }
            }

            // Flush this emoji as its own segment
            segments.push(TextSegment::Emoji(std::mem::take(&mut emoji)));
        } else if is_emoji_modifier(c) {
            // Standalone modifier (e.g. VS16 after a non-emoji char like ❤)
            // Treat as part of plain text
            plain.push(c);
            i += 1;
        } else {
            plain.push(c);
            i += 1;
        }
    }

    // Flush remaining
    if !plain.is_empty() {
        segments.push(TextSegment::Plain(plain));
    }
    if !emoji.is_empty() {
        segments.push(TextSegment::Emoji(emoji));
    }

    segments
}
