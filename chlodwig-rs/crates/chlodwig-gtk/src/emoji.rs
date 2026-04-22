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
            pub fn CTLineGetBoundsWithOptions(line: CTLineRef, options: u64) -> CGRect;
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
                r: CGFloat,
                g: CGFloat,
                b: CGFloat,
                a: CGFloat,
            );
            pub fn CGContextFillRect(context: CGContextRef, rect: CGRect);
            pub fn CGContextSetTextPosition(context: CGContextRef, x: CGFloat, y: CGFloat);
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
            let mut top = hu; // first row with visible pixels
            let mut bottom = 0; // last row with visible pixels
            let mut left = wu; // leftmost visible column
            let mut right = 0; // rightmost visible column

            for row in 0..hu {
                for col in 0..wu {
                    let idx = (row * wu + col) * 4;
                    if raw_data[idx + 3] > 0 {
                        if row < top {
                            top = row;
                        }
                        if row > bottom {
                            bottom = row;
                        }
                        if col < left {
                            left = col;
                        }
                        if col > right {
                            right = col;
                        }
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
                Some(EmojiBitmap {
                    width: crop_w,
                    height: crop_h,
                    scale,
                    data: cropped,
                })
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
            Self {
                cache: HashMap::new(),
            }
        }

        /// Get or render an emoji bitmap. Returns `None` if the emoji
        /// cannot be rendered (e.g. not a valid emoji, or CoreText fails).
        /// `scale` is the integer scale factor (1 = normal, 2 = Retina/HiDPI).
        pub fn get_or_render(
            &mut self,
            emoji: &str,
            size: f64,
            scale: i32,
        ) -> Option<&EmojiBitmap> {
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
        pub fn logical_width(&self) -> i32 {
            self.width / self.scale
        }
        pub fn logical_height(&self) -> i32 {
            self.height / self.scale
        }
    }

    pub struct EmojiCache;

    impl EmojiCache {
        pub fn new() -> Self {
            Self
        }
        pub fn get_or_render(
            &mut self,
            _emoji: &str,
            _size: f64,
            _scale: i32,
        ) -> Option<&EmojiBitmap> {
            None // No CoreText on non-macOS
        }
    }
}

pub use platform::{EmojiBitmap, EmojiCache};

// ── Emoji detection ────────────────────────────────────────────────
//
// Unicode distinguishes two presentation defaults for pictographic chars:
//
//   1. `Emoji_Presentation=Yes` — renders as color emoji by default.
//      Examples: 😀 🚀 ⏳ ☕ 🌻. These are ALWAYS emoji, no VS16 needed.
//      → handled by `is_default_emoji()`
//
//   2. `Emoji_Presentation=No` AND `Extended_Pictographic=Yes` — renders
//      as monochrome text by default. Examples: ☀ ☁ ⚡ ♂ ♀ ⛈ ❄. Becomes
//      color emoji ONLY when followed by VS16 (U+FE0F) or as a component
//      of a ZWJ sequence.
//      → handled by `is_text_default_pictographic()`
//
// The two predicates are DISJOINT — every codepoint is in at most one
// bucket. `split_emoji_segments` is the SINGLE source of truth that
// combines them with lookahead context (next char is VS16? continuation
// after ZWJ?) to decide whether a character starts an Emoji segment or
// stays in Plain text.
//
// Why this matters: PangoCairo on macOS cannot render color SBIX fonts
// (Apple Color Emoji), so we route emoji through CoreText bitmap overlay.
// But monochrome glyphs from Sarasa/system fonts render fine through
// Pango — and have the correct unicode-width (1 column for ☀, 2 for ☀️).
// Routing bare ☀ through the overlay produces a 2-column bitmap over a
// 1-column slot, breaking table alignment. That's the bug this layout fixes.

/// Characters with Unicode `Emoji_Presentation=Yes` — emoji by default.
///
/// These render as color emoji even without VS16. They start an Emoji
/// segment unconditionally.
pub fn is_default_emoji(c: char) -> bool {
    matches!(c,
        // Misc Technical (specific emoji-presentation chars only)
        '\u{231A}'..='\u{231B}' | // ⌚⌛ Watch, Hourglass
        '\u{23E9}'..='\u{23EC}' | // ⏩⏪⏫⏬
        '\u{23F0}' |              // ⏰
        '\u{23F3}' |              // ⏳
        // (⏭⏮⏯⏱⏲ are Extended_Pictographic with text default)

        // Misc Symbols — only the ones with Emoji_Presentation=Yes
        '\u{25FD}'..='\u{25FE}' | // ◽◾
        '\u{2614}'..='\u{2615}' | // ☔☕
        '\u{2648}'..='\u{2653}' | // ♈..♓ Zodiac
        '\u{267F}' |              // ♿ Wheelchair
        '\u{2693}' |              // ⚓ Anchor
    //    '\u{26A1}' |              // ⚡ High Voltage
        '\u{26AA}'..='\u{26AB}' | // ⚪⚫
        '\u{26BD}'..='\u{26BE}' | // ⚽⚾
        '\u{26C4}'..='\u{26C5}' | // ⛄⛅
        '\u{26CE}' |              // ⛎ Ophiuchus
        '\u{26D4}' |              // ⛔ No Entry
        '\u{26EA}' |              // ⛪ Church
        '\u{26F2}'..='\u{26F3}' | // ⛲⛳
        '\u{26F5}' |              // ⛵
        '\u{26FA}' |              // ⛺
        '\u{26FD}' |              // ⛽

        // Dingbats with Emoji_Presentation=Yes
        '\u{2705}' |              // ✅
        '\u{270A}'..='\u{270B}' | // ✊✋
        '\u{2728}' |              // ✨
        '\u{274C}' |              // ❌
        '\u{274E}' |              // ❎
        '\u{2753}'..='\u{2755}' | // ❓❔❕
        '\u{2757}' |              // ❗
        '\u{2795}'..='\u{2797}' | // ➕➖➗
        '\u{27B0}' |              // ➰
        '\u{27BF}' |              // ➿

        // Misc Symbols and Arrows
        '\u{2B1B}'..='\u{2B1C}' | // ⬛⬜
        '\u{2B50}' |              // ⭐
        '\u{2B55}' |              // ⭕

        // === Supplemental Multilingual Plane ===
        '\u{1F004}' |             // 🀄
        '\u{1F0CF}' |             // 🃏
        '\u{1F18E}' |             // 🆎
        '\u{1F191}'..='\u{1F19A}' | // 🆑..🆚
        '\u{1F1E6}'..='\u{1F1FF}' | // Regional Indicators (flags)
        '\u{1F201}' |             // 🈁
        '\u{1F21A}' |             // 🈚
        '\u{1F22F}' |             // 🈯
        '\u{1F232}'..='\u{1F236}' | // 🈲..🈶
        '\u{1F238}'..='\u{1F23A}' | // 🈸🈹🈺
        '\u{1F250}'..='\u{1F251}' | // 🉐🉑

        // Miscellaneous Symbols and Pictographs (Emoji_Presentation=Yes ranges)
        '\u{1F300}'..='\u{1F320}' | // 🌀..🌠
        '\u{1F32D}'..='\u{1F335}' | // 🌭..🌵
        '\u{1F337}'..='\u{1F37C}' | // 🌷..🍼
        '\u{1F37E}'..='\u{1F393}' | // 🍾..🎓
        '\u{1F3A0}'..='\u{1F3CA}' | // 🎠..🏊
        '\u{1F3CF}'..='\u{1F3D3}' | // 🏏..🏓
        '\u{1F3E0}'..='\u{1F3F0}' | // 🏠..🏰
        '\u{1F3F4}' |               // 🏴
        '\u{1F3F8}'..='\u{1F4FC}' | // 🏸..📼
        '\u{1F4FF}'..='\u{1F53D}' | // 📿..🔽
        '\u{1F54B}'..='\u{1F54E}' | // 🕋🕌🕍🕎
        '\u{1F550}'..='\u{1F567}' | // 🕐..🕧
        '\u{1F57A}' |               // 🕺
        '\u{1F595}'..='\u{1F596}' | // 🖕🖖
        '\u{1F5A4}' |               // 🖤
        '\u{1F5FB}'..='\u{1F5FF}' | // 🗻..🗿

        // Emoticons
        '\u{1F600}'..='\u{1F64F}' | // 😀..🙏

        // Transport and Map Symbols
        '\u{1F680}'..='\u{1F6C5}' | // 🚀..🛅
        '\u{1F6CC}' |               // 🛌
        '\u{1F6D0}'..='\u{1F6D2}' | // 🛐🛑🛒
        '\u{1F6D5}'..='\u{1F6D7}' | // 🛕🛖🛗
        '\u{1F6DC}'..='\u{1F6DF}' | // 🛜🛝🛞🛟
        '\u{1F6EB}'..='\u{1F6EC}' | // 🛫🛬
        '\u{1F6F4}'..='\u{1F6FC}' | // 🛴..🛼

        // Geometric Shapes Extended
        '\u{1F7E0}'..='\u{1F7EB}' | // 🟠..🟫
        '\u{1F7F0}' |               // 🟰

        // Supplemental Symbols and Pictographs
        '\u{1F90C}'..='\u{1F93A}' | // 🤌..🤺
        '\u{1F93C}'..='\u{1F945}' | // 🤼..🥅
        '\u{1F947}'..='\u{1F9FF}' | // 🥇..🧿

        // Symbols and Pictographs Extended-A
        '\u{1FA70}'..='\u{1FA7C}' | // 🩰..🩼
        '\u{1FA80}'..='\u{1FA89}' | // 🪀..🪉
        '\u{1FA8F}'..='\u{1FAC6}' | // 🪏..🫆
        '\u{1FACE}'..='\u{1FADC}' | // 🫎..🫜
        '\u{1FADF}'..='\u{1FAE9}' | // 🫟..🫩
        '\u{1FAF0}'..='\u{1FAF8}'   // 🫰..🫸
    )
}

/// Characters with `Extended_Pictographic=Yes` AND `Emoji_Presentation=No`.
///
/// These render as monochrome text by default and only become color emoji
/// when followed by VS16 (U+FE0F) or as a component of a ZWJ sequence.
///
/// The splitter checks lookahead: bare codepoint → Plain (Pango renders
/// the monochrome glyph from Sarasa/system fonts at width 1); with VS16
/// or after ZWJ → Emoji (CoreText bitmap at width 2).
///
/// MUST be disjoint from `is_default_emoji()`.
pub fn is_text_default_pictographic(c: char) -> bool {
    matches!(c,
        // Misc Technical — text-default Extended_Pictographic
        '\u{2328}' |              // ⌨ Keyboard
        '\u{23CF}' |              // ⏏ Eject
        '\u{23ED}'..='\u{23EF}' | // ⏭⏮⏯
        '\u{23F1}'..='\u{23F2}' | // ⏱⏲
        '\u{23F8}'..='\u{23FA}' | // ⏸⏹⏺

        // Misc Symbols — weather, celestial, signs (text default)
        '\u{2600}'..='\u{2604}' | // ☀☁☂☃☄
        '\u{260E}' |              // ☎
        '\u{2611}' |              // ☑
        '\u{2618}' |              // ☘
        '\u{261D}' |              // ☝
        '\u{2620}' |              // ☠
        '\u{2622}'..='\u{2623}' | // ☢☣
        '\u{2626}' |              // ☦
        '\u{262A}' |              // ☪
        '\u{262E}'..='\u{262F}' | // ☮☯
        '\u{2638}'..='\u{263A}' | // ☸☹☺
        '\u{2640}' |              // ♀ (ZWJ component)
        '\u{2642}' |              // ♂ (ZWJ component)
        '\u{265F}'..='\u{2660}' | // ♟♠
        '\u{2663}' |              // ♣
        '\u{2665}'..='\u{2666}' | // ♥♦
        '\u{2668}' |              // ♨
        '\u{267B}' |              // ♻
        '\u{267E}' |              // ♾
        '\u{2692}' |              // ⚒
        '\u{2694}'..='\u{2697}' | // ⚔⚕⚖⚗
        '\u{2699}' |              // ⚙
        '\u{269B}'..='\u{269C}' | // ⚛⚜
        '\u{26A0}' |              // ⚠
        '\u{26A7}' |              // ⚧
        '\u{26B0}'..='\u{26B1}' | // ⚰⚱
        '\u{26C8}' |              // ⛈
        '\u{26CF}' |              // ⛏
        '\u{26D1}' |              // ⛑
        '\u{26D3}' |              // ⛓
        '\u{26E9}' |              // ⛩
        '\u{26F0}'..='\u{26F1}' | // ⛰⛱
        '\u{26F4}' |              // ⛴
        '\u{26F7}'..='\u{26F9}' | // ⛷⛸⛹

        // Dingbats — text-default Extended_Pictographic
        '\u{2702}' |              // ✂
        '\u{2708}'..='\u{2709}' | // ✈✉
        '\u{270C}'..='\u{270D}' | // ✌✍
        '\u{270F}' |              // ✏
        '\u{2712}' |              // ✒
        '\u{2714}' |              // ✔ (≠ ✓ U+2713 which is not Extended_Pictographic)
        '\u{2716}' |              // ✖
        '\u{271D}' |              // ✝
        '\u{2721}' |              // ✡
        '\u{2733}'..='\u{2734}' | // ✳✴
        '\u{2744}' |              // ❄
        '\u{2747}' |              // ❇
        '\u{2763}'..='\u{2764}' | // ❣❤
        '\u{27A1}' |              // ➡

        // Supplemental Arrows-B
        '\u{2934}'..='\u{2935}' | // ⤴⤵

        // Misc Symbols and Arrows
        '\u{2B05}'..='\u{2B07}' | // ⬅⬆⬇

        // CJK Symbols
        '\u{3030}' |              // 〰
        '\u{303D}' |              // 〽
        '\u{3297}' |              // ㊗
        '\u{3299}' |              // ㊙

        // Misc Symbols and Pictographs — text-default subranges
        '\u{1F321}' |               // 🌡
        '\u{1F324}'..='\u{1F32C}' | // 🌤🌥🌦🌧🌨🌩🌪🌫🌬
        '\u{1F336}' |               // 🌶
        '\u{1F37D}' |               // 🍽
        '\u{1F396}'..='\u{1F397}' | // 🎖🎗
        '\u{1F399}'..='\u{1F39B}' | // 🎙🎚🎛
        '\u{1F39E}'..='\u{1F39F}' | // 🎞🎟
        '\u{1F3CB}'..='\u{1F3CE}' | // 🏋🏌🏍🏎
        '\u{1F3D4}'..='\u{1F3DF}' | // 🏔..🏟
        '\u{1F3F3}' |               // 🏳
        '\u{1F3F5}' |               // 🏵
        '\u{1F3F7}' |               // 🏷
        '\u{1F43F}' |               // 🐿
        '\u{1F441}' |               // 👁
        '\u{1F4FD}' |               // 📽
        '\u{1F549}'..='\u{1F54A}' | // 🕉🕊
        '\u{1F56F}'..='\u{1F570}' | // 🕯🕰
        '\u{1F573}'..='\u{1F579}' | // 🕳🕴🕵🕶🕷🕸🕹
        '\u{1F587}' |               // 🖇
        '\u{1F58A}'..='\u{1F58D}' | // 🖊🖋🖌🖍
        '\u{1F590}' |               // 🖐
        '\u{1F5A5}' |               // 🖥
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
        '\u{1F5FA}' |               // 🗺
        '\u{1F6CB}' |               // 🛋
        '\u{1F6CD}'..='\u{1F6CF}' | // 🛍🛎🛏
        '\u{1F6E0}'..='\u{1F6E5}' | // 🛠🛡🛢🛣🛤🛥
        '\u{1F6E9}' |               // 🛩
        '\u{1F6F0}' |               // 🛰
        '\u{1F6F3}'                 // 🛳
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
    matches!(
        c,
        '\u{FE0E}' |                // VS15 (text presentation)
        '\u{FE0F}' |                // VS16 (emoji presentation)
        '\u{200D}' |                // ZWJ (Zero Width Joiner)
        '\u{20E3}' |                // Combining Enclosing Keycap
        '\u{1F3FB}'..='\u{1F3FF}' // Skin tone modifiers
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
// ── Codepoint pipeline manifest ─────────────────────────────────────
//
// Some codepoints render via the system fallback (Apple Color Emoji on
// macOS) at a width that disagrees with what `unicode_width` and our
// bundled Sarasa Mono J's hmtx table claim. The cause is always the
// same: the codepoint is text-default presentation (EAW=Neutral,
// `unicode_width = 1`), is missing from Sarasa's cmap, and Pango finds
// it in some system fallback font at an unpredictable width. Either:
//
//   (a) Apple Color Emoji has it as a 2-cell color bitmap → we want to
//       render it as a colored emoji and reserve 2 cells of layout. To
//       trigger emoji-presentation in Apple Color Emoji we usually need
//       to append VS16 (U+FE0F).
//   (b) Apple Color Emoji does NOT have it → CoreText falls back to
//       Menlo / Apple Symbols → blass monochrome glyph at unpredictable
//       width → we substitute a semantically-similar codepoint that IS
//       in Apple Color Emoji.
//
// The manifest is a single table `(source: char, target: &'static str)`.
// `target` is a string so it can include VS16, ZWJ joins, or be a
// completely different codepoint:
//
//   - `(✆, "📞")`            — pure remap (case b)
//   - `(✉, "✉\u{FE0F}")`     — emoji-presentation request (case a)
//   - `(✒, "🖊\u{FE0F}")`    — both at once: different codepoint AND
//                              VS16 because the target is also text-default
//
// Three pure queries over the manifest are the SSoT — no other module
// hardcodes any of these codepoints:
//
//   - `pipeline_remap(c) -> Option<&'static str>`
//        the target sequence, or `None` for non-manifest chars
//   - `is_pipeline_source(c) -> bool`
//        `true` iff `c` has a manifest entry (= remapping needed AND
//        FontMetrics width override applies)
//   - `pipeline_width_overrides() -> impl Iterator<Item=(char, u8)>`
//        every source codepoint with width=2 — feeds
//        `chlodwig_core::FontMetrics::with_width_overrides`
//
// To add a new entry:
//   1. Verify Sarasa lacks it:
//      `python3 -c "from fontTools.ttLib import TTFont;
//       print(0xXXXX in TTFont('crates/chlodwig-gtk/resources/SarasaMonoJ-Regular.ttf').getBestCmap())"`
//   2. Verify Apple Color Emoji presence (check the .ttc, font #0):
//      `from fontTools.ttLib.ttCollection import TTCollection;
//       cmap = list(TTCollection('/System/Library/Fonts/Apple Color Emoji.ttc').fonts)[0].getBestCmap();
//       print(0xXXXX in cmap)`
//      If absent → pick a similar emoji that IS present and remap to that.
//   3. If the target is text-default (Emoji_Presentation=No), append VS16
//      to the target string so Apple Color Emoji selects emoji-presentation.
//   4. Add a test in `tests/pipeline_manifest_tests.rs`.
//
// See Gotcha #56 in `CLAUDE.md`.

/// One entry in the manifest. Tells the splitter what to do when a given
/// source codepoint appears in the input.
///
/// - `emit` = string the splitter pushes into the emoji segment when this
///   entry triggers. May be the same codepoint, the same codepoint plus
///   VS16, or a different codepoint.
/// - `to_color_emoji` = whether this entry triggers ONLY when the next
///   input char is VS16 (`true`) or unconditionally (`false`).
///   * `false`: codepoint is missing from Sarasa cmap → Pango would
///     fallback to Apple Color Emoji bitmap anyway → we route to CoreText
///     and reserve 2 cells, every time.
///   * `true`: codepoint IS in Sarasa with a usable s/w glyph → bare =
///     stays Plain (Sarasa renders); VS16 = user opt-in to color, route
///     to CoreText.
pub struct EmojiSpec {
    pub emit: &'static str,
    pub to_color_emoji: bool,
}

const MANIFEST: &[(char, EmojiSpec)] = &[
    // Telephony / mail / writing — Sarasa cmap-miss, Apple Emoji has them.
    (
        '\u{2706}',
        EmojiSpec {
            emit: "\u{1F4DE}",
            to_color_emoji: false,
        },
    ), // ✆ → 📞 (✆ not in Apple)
    (
        '\u{2708}',
        EmojiSpec {
            emit: "\u{2708}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ✈
    (
        '\u{2709}',
        EmojiSpec {
            emit: "\u{2709}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ✉
    (
        '\u{270F}',
        EmojiSpec {
            emit: "\u{270F}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ✏
    (
        '\u{2712}',
        EmojiSpec {
            emit: "\u{2712}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ✒
    // Decorative stars / hearts / flowers — sources not in Apple Emoji.
    (
        '\u{272A}',
        EmojiSpec {
            emit: "\u{1F31F}",
            to_color_emoji: false,
        },
    ), // ✪ → 🌟
    (
        '\u{2730}',
        EmojiSpec {
            emit: "\u{1F4AB}",
            to_color_emoji: false,
        },
    ), // ✰ → 💫
    (
        '\u{2765}',
        EmojiSpec {
            emit: "\u{1F496}",
            to_color_emoji: false,
        },
    ), // ❥ → 💖
    (
        '\u{2766}',
        EmojiSpec {
            emit: "\u{1F338}",
            to_color_emoji: false,
        },
    ), // ❦ → 🌸
    // Religious / political — semantic remaps.
    (
        '\u{2618}',
        EmojiSpec {
            emit: "\u{2618}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ☘
    (
        '\u{262E}',
        EmojiSpec {
            emit: "\u{262E}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ☮
    // Chess / weapons / scales — emoji-presentation requests.
    (
        '\u{2655}',
        EmojiSpec {
            emit: "\u{1F451}",
            to_color_emoji: false,
        },
    ), // ♕ → 👑
    (
        '\u{2694}',
        EmojiSpec {
            emit: "\u{2694}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ⚔
    (
        '\u{2696}',
        EmojiSpec {
            emit: "\u{2696}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ⚖
    // Weather.
    (
        '\u{26C8}',
        EmojiSpec {
            emit: "\u{26C8}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ⛈
    // ── Auto-generated bulk entries (regen via scripts/regen_pipeline_manifest.py) ──
    //
    // Every codepoint below
    //   (a) is missing from SarasaMonoJ-Regular.ttf cmap,
    //   (b) is present in Apple Color Emoji,
    //   (c) has unicode_width::width_cjk = 1 (so default declared width = 1
    //       even though Apple Emoji renders 2-cell color bitmap → mismatch).
    // The fix is uniform: target = source + VS16, declared width = 2,
    // to_color_emoji = false (unconditional, every occurrence).
    // Run scripts/regen_pipeline_manifest.py after upgrading Sarasa or
    // Apple Color Emoji to refresh this list.

    // BMP — Misc Symbols & Dingbats
    (
        '\u{2604}',
        EmojiSpec {
            emit: "\u{2604}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ☄ COMET
    (
        '\u{2620}',
        EmojiSpec {
            emit: "\u{2620}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ☠ SKULL AND CROSSBONES
    (
        '\u{2622}',
        EmojiSpec {
            emit: "\u{2622}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ☢ RADIOACTIVE SIGN
    (
        '\u{2623}',
        EmojiSpec {
            emit: "\u{2623}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ☣ BIOHAZARD SIGN
    (
        '\u{262A}',
        EmojiSpec {
            emit: "\u{262A}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ☪ STAR AND CRESCENT
    (
        '\u{2638}',
        EmojiSpec {
            emit: "\u{2638}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ☸ WHEEL OF DHARMA
    (
        '\u{265F}',
        EmojiSpec {
            emit: "\u{265F}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ♟ BLACK CHESS PAWN
    (
        '\u{2692}',
        EmojiSpec {
            emit: "\u{2692}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ⚒ HAMMER AND PICK
    (
        '\u{2695}',
        EmojiSpec {
            emit: "\u{2695}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ⚕ STAFF OF AESCULAPIUS
    (
        '\u{2697}',
        EmojiSpec {
            emit: "\u{2697}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ⚗ ALEMBIC
    (
        '\u{269C}',
        EmojiSpec {
            emit: "\u{269C}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ⚜ FLEUR-DE-LIS
    (
        '\u{26A7}',
        EmojiSpec {
            emit: "\u{26A7}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ⚧ MALE WITH STROKE AND MALE AND FEMALE SIGN
    (
        '\u{26B0}',
        EmojiSpec {
            emit: "\u{26B0}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ⚰ COFFIN
    (
        '\u{26B1}',
        EmojiSpec {
            emit: "\u{26B1}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ⚱ FUNERAL URN
    (
        '\u{270C}',
        EmojiSpec {
            emit: "\u{270C}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ✌ VICTORY HAND
    (
        '\u{270D}',
        EmojiSpec {
            emit: "\u{270D}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ✍ WRITING HAND
    (
        '\u{2763}',
        EmojiSpec {
            emit: "\u{2763}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // ❣ HEAVY HEART EXCLAMATION MARK ORNAMENT
    // SMP — Misc Symbols and Pictographs
    (
        '\u{1F321}',
        EmojiSpec {
            emit: "\u{1F321}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🌡 THERMOMETER
    (
        '\u{1F324}',
        EmojiSpec {
            emit: "\u{1F324}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🌤 WHITE SUN WITH SMALL CLOUD
    (
        '\u{1F325}',
        EmojiSpec {
            emit: "\u{1F325}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🌥 WHITE SUN BEHIND CLOUD
    (
        '\u{1F326}',
        EmojiSpec {
            emit: "\u{1F326}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🌦 WHITE SUN BEHIND CLOUD WITH RAIN
    (
        '\u{1F327}',
        EmojiSpec {
            emit: "\u{1F327}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🌧 CLOUD WITH RAIN
    (
        '\u{1F328}',
        EmojiSpec {
            emit: "\u{1F328}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🌨 CLOUD WITH SNOW
    (
        '\u{1F329}',
        EmojiSpec {
            emit: "\u{1F329}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🌩 CLOUD WITH LIGHTNING
    (
        '\u{1F32A}',
        EmojiSpec {
            emit: "\u{1F32A}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🌪 CLOUD WITH TORNADO
    (
        '\u{1F32B}',
        EmojiSpec {
            emit: "\u{1F32B}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🌫 FOG
    (
        '\u{1F32C}',
        EmojiSpec {
            emit: "\u{1F32C}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🌬 WIND BLOWING FACE
    (
        '\u{1F336}',
        EmojiSpec {
            emit: "\u{1F336}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🌶 HOT PEPPER
    (
        '\u{1F37D}',
        EmojiSpec {
            emit: "\u{1F37D}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🍽 FORK AND KNIFE WITH PLATE
    (
        '\u{1F396}',
        EmojiSpec {
            emit: "\u{1F396}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🎖 MILITARY MEDAL
    (
        '\u{1F397}',
        EmojiSpec {
            emit: "\u{1F397}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🎗 REMINDER RIBBON
    (
        '\u{1F399}',
        EmojiSpec {
            emit: "\u{1F399}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🎙 STUDIO MICROPHONE
    (
        '\u{1F39A}',
        EmojiSpec {
            emit: "\u{1F39A}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🎚 LEVEL SLIDER
    (
        '\u{1F39B}',
        EmojiSpec {
            emit: "\u{1F39B}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🎛 CONTROL KNOBS
    (
        '\u{1F39E}',
        EmojiSpec {
            emit: "\u{1F39E}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🎞 FILM FRAMES
    (
        '\u{1F39F}',
        EmojiSpec {
            emit: "\u{1F39F}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🎟 ADMISSION TICKETS
    (
        '\u{1F3CB}',
        EmojiSpec {
            emit: "\u{1F3CB}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏋 WEIGHT LIFTER
    (
        '\u{1F3CC}',
        EmojiSpec {
            emit: "\u{1F3CC}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏌 GOLFER
    (
        '\u{1F3CD}',
        EmojiSpec {
            emit: "\u{1F3CD}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏍 RACING MOTORCYCLE
    (
        '\u{1F3CE}',
        EmojiSpec {
            emit: "\u{1F3CE}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏎 RACING CAR
    (
        '\u{1F3D4}',
        EmojiSpec {
            emit: "\u{1F3D4}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏔 SNOW CAPPED MOUNTAIN
    (
        '\u{1F3D5}',
        EmojiSpec {
            emit: "\u{1F3D5}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏕 CAMPING
    (
        '\u{1F3D6}',
        EmojiSpec {
            emit: "\u{1F3D6}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏖 BEACH WITH UMBRELLA
    (
        '\u{1F3D7}',
        EmojiSpec {
            emit: "\u{1F3D7}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏗 BUILDING CONSTRUCTION
    (
        '\u{1F3D8}',
        EmojiSpec {
            emit: "\u{1F3D8}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏘 HOUSE BUILDINGS
    (
        '\u{1F3D9}',
        EmojiSpec {
            emit: "\u{1F3D9}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏙 CITYSCAPE
    (
        '\u{1F3DA}',
        EmojiSpec {
            emit: "\u{1F3DA}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏚 DERELICT HOUSE BUILDING
    (
        '\u{1F3DB}',
        EmojiSpec {
            emit: "\u{1F3DB}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏛 CLASSICAL BUILDING
    (
        '\u{1F3DC}',
        EmojiSpec {
            emit: "\u{1F3DC}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏜 DESERT
    (
        '\u{1F3DD}',
        EmojiSpec {
            emit: "\u{1F3DD}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏝 DESERT ISLAND
    (
        '\u{1F3DE}',
        EmojiSpec {
            emit: "\u{1F3DE}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏞 NATIONAL PARK
    (
        '\u{1F3DF}',
        EmojiSpec {
            emit: "\u{1F3DF}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏟 STADIUM
    (
        '\u{1F3F3}',
        EmojiSpec {
            emit: "\u{1F3F3}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏳 WAVING WHITE FLAG
    (
        '\u{1F3F5}',
        EmojiSpec {
            emit: "\u{1F3F5}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏵 ROSETTE
    (
        '\u{1F3F7}',
        EmojiSpec {
            emit: "\u{1F3F7}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🏷 LABEL
    (
        '\u{1F43F}',
        EmojiSpec {
            emit: "\u{1F43F}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🐿 CHIPMUNK
    (
        '\u{1F441}',
        EmojiSpec {
            emit: "\u{1F441}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 👁 EYE
    (
        '\u{1F4FD}',
        EmojiSpec {
            emit: "\u{1F4FD}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 📽 FILM PROJECTOR
    (
        '\u{1F549}',
        EmojiSpec {
            emit: "\u{1F549}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🕉 OM SYMBOL
    (
        '\u{1F54A}',
        EmojiSpec {
            emit: "\u{1F54A}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🕊 DOVE OF PEACE
    (
        '\u{1F56F}',
        EmojiSpec {
            emit: "\u{1F56F}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🕯 CANDLE
    (
        '\u{1F570}',
        EmojiSpec {
            emit: "\u{1F570}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🕰 MANTELPIECE CLOCK
    (
        '\u{1F573}',
        EmojiSpec {
            emit: "\u{1F573}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🕳 HOLE
    (
        '\u{1F574}',
        EmojiSpec {
            emit: "\u{1F574}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🕴 MAN IN BUSINESS SUIT LEVITATING
    (
        '\u{1F575}',
        EmojiSpec {
            emit: "\u{1F575}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🕵 SLEUTH OR SPY
    (
        '\u{1F576}',
        EmojiSpec {
            emit: "\u{1F576}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🕶 DARK SUNGLASSES
    (
        '\u{1F577}',
        EmojiSpec {
            emit: "\u{1F577}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🕷 SPIDER
    (
        '\u{1F578}',
        EmojiSpec {
            emit: "\u{1F578}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🕸 SPIDER WEB
    (
        '\u{1F579}',
        EmojiSpec {
            emit: "\u{1F579}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🕹 JOYSTICK
    (
        '\u{1F587}',
        EmojiSpec {
            emit: "\u{1F587}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🖇 LINKED PAPERCLIPS
    (
        '\u{1F58A}',
        EmojiSpec {
            emit: "\u{1F58A}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🖊 LOWER LEFT BALLPOINT PEN
    (
        '\u{1F58B}',
        EmojiSpec {
            emit: "\u{1F58B}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🖋 LOWER LEFT FOUNTAIN PEN
    (
        '\u{1F58C}',
        EmojiSpec {
            emit: "\u{1F58C}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🖌 LOWER LEFT PAINTBRUSH
    (
        '\u{1F58D}',
        EmojiSpec {
            emit: "\u{1F58D}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🖍 LOWER LEFT CRAYON
    (
        '\u{1F590}',
        EmojiSpec {
            emit: "\u{1F590}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🖐 RAISED HAND WITH FINGERS SPLAYED
    (
        '\u{1F5A5}',
        EmojiSpec {
            emit: "\u{1F5A5}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🖥 DESKTOP COMPUTER
    (
        '\u{1F5A8}',
        EmojiSpec {
            emit: "\u{1F5A8}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🖨 PRINTER
    (
        '\u{1F5B1}',
        EmojiSpec {
            emit: "\u{1F5B1}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🖱 THREE BUTTON MOUSE
    (
        '\u{1F5B2}',
        EmojiSpec {
            emit: "\u{1F5B2}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🖲 TRACKBALL
    (
        '\u{1F5BC}',
        EmojiSpec {
            emit: "\u{1F5BC}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🖼 FRAME WITH PICTURE
    (
        '\u{1F5C2}',
        EmojiSpec {
            emit: "\u{1F5C2}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗂 CARD INDEX DIVIDERS
    (
        '\u{1F5C3}',
        EmojiSpec {
            emit: "\u{1F5C3}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗃 CARD FILE BOX
    (
        '\u{1F5C4}',
        EmojiSpec {
            emit: "\u{1F5C4}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗄 FILE CABINET
    (
        '\u{1F5D1}',
        EmojiSpec {
            emit: "\u{1F5D1}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗑 WASTEBASKET
    (
        '\u{1F5D2}',
        EmojiSpec {
            emit: "\u{1F5D2}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗒 SPIRAL NOTE PAD
    (
        '\u{1F5D3}',
        EmojiSpec {
            emit: "\u{1F5D3}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗓 SPIRAL CALENDAR PAD
    (
        '\u{1F5DC}',
        EmojiSpec {
            emit: "\u{1F5DC}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗜 COMPRESSION
    (
        '\u{1F5DD}',
        EmojiSpec {
            emit: "\u{1F5DD}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗝 OLD KEY
    (
        '\u{1F5DE}',
        EmojiSpec {
            emit: "\u{1F5DE}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗞 ROLLED-UP NEWSPAPER
    (
        '\u{1F5E1}',
        EmojiSpec {
            emit: "\u{1F5E1}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗡 DAGGER KNIFE
    (
        '\u{1F5E3}',
        EmojiSpec {
            emit: "\u{1F5E3}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗣 SPEAKING HEAD IN SILHOUETTE
    (
        '\u{1F5E8}',
        EmojiSpec {
            emit: "\u{1F5E8}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗨 LEFT SPEECH BUBBLE
    (
        '\u{1F5EF}',
        EmojiSpec {
            emit: "\u{1F5EF}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗯 RIGHT ANGER BUBBLE
    (
        '\u{1F5F3}',
        EmojiSpec {
            emit: "\u{1F5F3}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗳 BALLOT BOX WITH BALLOT
    (
        '\u{1F5FA}',
        EmojiSpec {
            emit: "\u{1F5FA}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🗺 WORLD MAP
    (
        '\u{1F6CB}',
        EmojiSpec {
            emit: "\u{1F6CB}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛋 COUCH AND LAMP
    (
        '\u{1F6CD}',
        EmojiSpec {
            emit: "\u{1F6CD}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛍 SHOPPING BAGS
    (
        '\u{1F6CE}',
        EmojiSpec {
            emit: "\u{1F6CE}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛎 BELLHOP BELL
    (
        '\u{1F6CF}',
        EmojiSpec {
            emit: "\u{1F6CF}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛏 BED
    (
        '\u{1F6E0}',
        EmojiSpec {
            emit: "\u{1F6E0}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛠 HAMMER AND WRENCH
    (
        '\u{1F6E1}',
        EmojiSpec {
            emit: "\u{1F6E1}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛡 SHIELD
    (
        '\u{1F6E2}',
        EmojiSpec {
            emit: "\u{1F6E2}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛢 OIL DRUM
    (
        '\u{1F6E3}',
        EmojiSpec {
            emit: "\u{1F6E3}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛣 MOTORWAY
    (
        '\u{1F6E4}',
        EmojiSpec {
            emit: "\u{1F6E4}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛤 RAILWAY TRACK
    (
        '\u{1F6E5}',
        EmojiSpec {
            emit: "\u{1F6E5}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛥 MOTOR BOAT
    (
        '\u{1F6E9}',
        EmojiSpec {
            emit: "\u{1F6E9}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛩 SMALL AIRPLANE
    (
        '\u{1F6F0}',
        EmojiSpec {
            emit: "\u{1F6F0}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛰 SATELLITE
    (
        '\u{1F6F3}',
        EmojiSpec {
            emit: "\u{1F6F3}\u{FE0F}",
            to_color_emoji: false,
        },
    ), // 🛳 PASSENGER SHIP
];

/// Look up a codepoint in the manifest. Returns the spec (emit + flag),
/// or `None` if not in the manifest. SSoT: the splitter and the width
/// override both go through this one function.
pub fn lookup(c: char) -> Option<&'static EmojiSpec> {
    MANIFEST.iter().find(|(k, _)| *k == c).map(|(_, v)| v)
}

/// If `c` has a manifest entry, return the target sequence; else `None`.
/// Legacy API — kept because many splitter sites already call it. New
/// code should use `lookup()` to also see the `to_color_emoji` flag.
pub fn pipeline_remap(c: char) -> Option<&'static str> {
    lookup(c).map(|s| s.emit)
}

/// `true` iff `c` has a manifest entry. Used both by the splitter (to
/// force emoji-segment classification regardless of the `is_default_emoji`
/// / `is_text_default_pictographic` Unicode predicates) AND by
/// `FontMetrics` (to override the width to 2 cells).
pub fn is_pipeline_source(c: char) -> bool {
    lookup(c).is_some()
}

/// Iterator over `(char, width_in_cells)` for every manifest source.
/// Always emits width=2 because every manifest target renders as a
/// 2-cell bitmap in the Apple Color Emoji pipeline. Designed to feed
/// `chlodwig_core::FontMetrics::with_width_overrides`.
///
/// HACK: appended `PLAIN_WIDTH_FIXUPS` — codepoints that are NOT in
/// MANIFEST (so the splitter leaves them as Plain → Sarasa renders
/// the s/w glyph), but whose Sarasa hmtx width does not match the
/// visual cell count. Example: ⚡ U+26A1 — Sarasa hmtx says 1 cell
/// but the rendered glyph occupies 2. Without this override the
/// table layouter computes a 1-cell column and the vertical border
/// shifts. Proper fix lives in `docs/EMOJI_V2_PLAN.md`.
const PLAIN_WIDTH_FIXUPS: &[(char, u8)] = &[
    ('\u{26A1}', 2), // ⚡ HIGH VOLTAGE — Sarasa hmtx=1, visually 2 cells
];

pub fn pipeline_width_overrides() -> impl Iterator<Item = (char, u8)> {
    MANIFEST
        .iter()
        .map(|(c, _)| (*c, 2u8))
        .chain(PLAIN_WIDTH_FIXUPS.iter().copied())
}

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
///
/// Classification rules (single source of truth — see Gotcha #54):
///
///   - `is_default_emoji(c)` → ALWAYS starts an Emoji segment
///   - `is_text_default_pictographic(c)` AND next char is VS16
///     → starts an Emoji segment (the VS16 is consumed into it)
///   - `is_text_default_pictographic(c)` after ZWJ
///     → consumed as continuation of the existing Emoji segment
///   - bare `is_text_default_pictographic(c)` (no VS16, no ZWJ)
///     → stays in Plain text — Pango renders the monochrome glyph
///
/// This makes `unicode_width` agree with our render width: bare ☀ has
/// width 1 and is rendered as a 1-column Pango glyph; ☀️ (VS16) has
/// width 2 and is rendered as a 2-column CoreText bitmap.
pub fn split_emoji_segments(text: &str) -> Vec<TextSegment> {
    let mut segments = Vec::new();
    let mut plain = String::new();
    let mut emoji = String::new();

    let chars: Vec<char> = text.chars().collect();
    let mut i = 0;

    // Returns true if `chars[i]` starts a new emoji sequence in PLAIN context.
    // (After ZWJ, the rules are different — see the inner loop.)
    let starts_emoji_in_plain = |i: usize| -> bool {
        let c = chars[i];
        if is_default_emoji(c) {
            return true;
        }
        // Manifest-driven codepoints. The `to_color_emoji` flag decides:
        //   - false → unconditional. Every occurrence becomes Emoji.
        //     (Used for codepoints missing from Sarasa, where bare Pango
        //     fallback would mis-render.)
        //   - true  → opt-in. Only when the next char is VS16 (U+FE0F)
        //     does this become Emoji; bare stays Plain (Sarasa renders
        //     the s/w glyph at the correct width).
        if let Some(spec) = lookup(c) {
            if !spec.to_color_emoji {
                return true;
            }
            return chars.get(i + 1) == Some(&'\u{FE0F}');
        }
        if is_text_default_pictographic(c) {
            // Only opt in to emoji presentation if VS16 follows.
            return chars.get(i + 1) == Some(&'\u{FE0F}');
        }
        false
    };

    while i < chars.len() {
        let c = chars[i];

        if starts_emoji_in_plain(i) {
            // Flush plain text
            if !plain.is_empty() {
                segments.push(TextSegment::Plain(std::mem::take(&mut plain)));
            }

            // Start a new emoji sequence with this base character.
            // Apply the manifest's remap rule here — for source codepoints
            // we push the whole target sequence (which may include VS16
            // and/or substitute a different codepoint) instead of the
            // raw char. The overlay font (Apple Color Emoji) then has
            // the right glyph at 2-cell width.
            if let Some(target) = pipeline_remap(c) {
                emoji.push_str(target);
                // If the source was IMMEDIATELY followed by VS16 in the
                // input AND our target already ends in VS16, drop the
                // input's VS16 to avoid `XFE0FFE0F` doubles.
                let target_ends_in_vs16 = target.ends_with('\u{FE0F}');
                let next_is_vs16 = chars.get(i + 1) == Some(&'\u{FE0F}');
                i += 1;
                if next_is_vs16 && target_ends_in_vs16 {
                    i += 1;
                }
            } else {
                emoji.push(c);
                i += 1;
            }

            // Special case: regional indicators form flag pairs.
            if is_regional_indicator(c) {
                if i < chars.len() && is_regional_indicator(chars[i]) {
                    emoji.push(chars[i]);
                    i += 1;
                }
            }

            // Consume modifiers that extend THIS emoji (VS16, skin tones,
            // keycap combiner). On ZWJ, consume it AND the following
            // pictographic char (which may be text-default like ♂ — that's
            // fine, ZWJ context overrides the bare-codepoint rule).
            while i < chars.len() {
                let next = chars[i];
                if next == '\u{200D}' {
                    emoji.push(next);
                    i += 1;
                    // After ZWJ, ANY pictographic char joins (default or text-default)
                    if i < chars.len()
                        && (is_default_emoji(chars[i]) || is_text_default_pictographic(chars[i]))
                    {
                        emoji.push(chars[i]);
                        i += 1;
                    }
                    // Continue loop to pick up modifiers after the ZWJ-joined char
                } else if is_emoji_modifier(next) {
                    emoji.push(next);
                    i += 1;
                } else {
                    break;
                }
            }

            segments.push(TextSegment::Emoji(std::mem::take(&mut emoji)));
        } else {
            // Either plain text, a bare text-default pictographic (no VS16),
            // or a standalone modifier (e.g. VS16 after a non-pictographic char).
            // All flow into the Plain segment — Pango handles them.
            plain.push(c);
            i += 1;
        }
    }

    if !plain.is_empty() {
        segments.push(TextSegment::Plain(plain));
    }
    if !emoji.is_empty() {
        segments.push(TextSegment::Emoji(emoji));
    }

    segments
}
