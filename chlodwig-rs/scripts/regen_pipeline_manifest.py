#!/usr/bin/env python3
r"""Generate the MANIFEST entries for chlodwig-gtk/src/emoji.rs.

Strategy: every codepoint that
  (a) is missing from Sarasa Mono J,
  (b) is present in Apple Color Emoji,
  (c) has unicode_width::width_cjk = 1
becomes a manifest entry `(c, "c\u{FE0F}")`. Apple Color Emoji selects
emoji-presentation for VS16 and renders 2-wide bitmap.

Excluded categories (handled elsewhere or not standalone):
  - Regional Indicators U+1F1E6..U+1F1FF — already in `is_default_emoji`
    and form flag pairs in `split_emoji_segments`.
  - Tag Letters U+E0061..U+E007F — only used as continuation of subdivision
    flag sequences (🏴+TAG+TAG+...+CANCEL_TAG). Never standalone.
  - Combining Enclosing Keycap U+20E3 — modifier, attaches to preceding char.
  - VS16 U+FE0F itself.
"""
from fontTools.ttLib import TTFont, TTCollection
import unicodedata, sys

SARASA = "/Users/A200114718/ai-tmp/claude-unpacked/chlodwig-rs/crates/chlodwig-gtk/resources/SarasaMonoJ-Regular.ttf"
APPLE = "/System/Library/Fonts/Apple Color Emoji.ttc"

sarasa = TTFont(SARASA)
sarasa_cmap = sarasa.getBestCmap()
hmtx = sarasa["hmtx"]
half = hmtx[sarasa_cmap[ord('M')]][0]

apple_cps = set()
for f in TTCollection(APPLE).fonts:
    apple_cps |= set(f.getBestCmap().keys())

EXCLUDE_RANGES = [
    (0x1F1E6, 0x1F1FF),   # Regional Indicators
    (0xE0061, 0xE007F),   # Tag letters
    (0x20E3, 0x20E3),     # Combining keycap
    (0xFE0F, 0xFE0F),     # VS16
]

def excluded(cp):
    for a, b in EXCLUDE_RANGES:
        if a <= cp <= b:
            return True
    return False

def width_cjk(cp):
    eaw = unicodedata.east_asian_width(chr(cp))
    return 2 if eaw in ("W","F","A") else 1

def declared_width(cp):
    g = sarasa_cmap.get(cp)
    if g is not None:
        return round(hmtx[g][0] / half)
    return width_cjk(cp)

# Already in current MANIFEST (skip; user explicitly tuned them)
ALREADY_IN_MANIFEST = {
    0x2706, 0x2708, 0x2709, 0x270F, 0x2712,
    0x272A, 0x2730, 0x2765, 0x2766,
    0x2618, 0x262E,
    0x2655, 0x2694, 0x2696,
    0x26C8,
}

print("// AUTO-GENERATED via scripts/regen_pipeline_manifest.py")
print("// Do not edit by hand. Run the script to regenerate.")
print("//")
print("// Each entry's source codepoint:")
print("//   - is missing from SarasaMonoJ-Regular.ttf cmap")
print("//   - is present in Apple Color Emoji")
print("//   - has unicode_width::width_cjk = 1 (so default declared width is wrong)")
print("// Target = source + VS16 → Apple Color Emoji renders 2-wide color bitmap.")

count = 0
for cp in sorted(apple_cps):
    if cp in sarasa_cmap: continue
    if declared_width(cp) == 2: continue
    if excluded(cp): continue
    if cp in ALREADY_IN_MANIFEST: continue
    name = unicodedata.name(chr(cp), "?")
    if cp <= 0xFFFF:
        src = "\\u{%04X}" % cp
    else:
        src = "\\u{%X}" % cp
    print(f"    ('{src}', \"{src}\\u{{FE0F}}\"),  // {chr(cp)} {name}")
    count += 1

print(f"\n// Total: {count} new entries", file=sys.stderr)
