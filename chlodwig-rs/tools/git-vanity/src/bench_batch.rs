//! Benchmark: Midstate vs Full Hash with emoji nonce encoding.

use sha1::block_api::compress;
use sha1::{Digest, Sha1};
use std::time::Instant;

const SHA1_BLOCK_SIZE: usize = 64;
const SHA1_DIGEST_SIZE: usize = 20;
const SHA1_INIT: [u32; 5] = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

// ── Emoji alphabet (same as main.rs) ──

const EMOJI_ALPHABET: [&str; 256] = [
    "🌀","🌁","🌂","🌃","🌄","🌅","🌆","🌇","🌈","🌉","🌊","🌋","🌌","🌍","🌎","🌏",
    "🌐","🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘","🌙","🌚","🌛","🌜","🌝","🌞","🌟",
    "🌠","🌡","🌢","🌣","🌤","🌥","🌦","🌧","🌨","🌩","🌪","🌫","🌬","🌭","🌮","🌯",
    "🌰","🌱","🌲","🌳","🌴","🌵","🌶","🌷","🌸","🌹","🌺","🌻","🌼","🌽","🌾","🌿",
    "🍀","🍁","🍂","🍃","🍄","🍅","🍆","🍇","🍈","🍉","🍊","🍋","🍌","🍍","🍎","🍏",
    "🍐","🍑","🍒","🍓","🍔","🍕","🍖","🍗","🍘","🍙","🍚","🍛","🍜","🍝","🍞","🍟",
    "🍠","🍡","🍢","🍣","🍤","🍥","🍦","🍧","🍨","🍩","🍪","🍫","🍬","🍭","🍮","🍯",
    "🍰","🍱","🍲","🍳","🍴","🍵","🍶","🍷","🍸","🍹","🍺","🍻","🍼","🍽","🍾","🍿",
    "🎀","🎁","🎂","🎃","🎄","🎅","🎆","🎇","🎈","🎉","🎊","🎋","🎌","🎍","🎎","🎏",
    "🎐","🎑","🎒","🎓","🎔","🎕","🎖","🎗","🎘","🎙","🎚","🎛","🎜","🎝","🎞","🎟",
    "🎠","🎡","🎢","🎣","🎤","🎥","🎦","🎧","🎨","🎩","🎪","🎫","🎬","🎭","🎮","🎯",
    "🎰","🎱","🎲","🎳","🎴","🎵","🎶","🎷","🎸","🎹","🎺","🎻","🎼","🎽","🎾","🎿",
    "🏀","🏁","🏂","🏃","🏄","🏅","🏆","🏇","🏈","🏉","🏊","🏋","🏌","🏍","🏎","🏏",
    "🏐","🏑","🏒","🏓","🏔","🏕","🏖","🏗","🏘","🏙","🏚","🏛","🏜","🏝","🏞","🏟",
    "🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏧","🏨","🏩","🏪","🏫","🏬","🏭","🏮","🏯",
    "🏰","🏱","🏲","🏳","🏴","🏵","🏶","🏷","🏸","🏹","🏺","🏻","🏼","🏽","🏾","🏿",
];

const EMOJI_CHAR_BYTES: usize = 4;

#[inline]
fn fmt_u64_to_emoji_buf(n: u64, buf: &mut [u8]) -> usize {
    if n == 0 {
        let emoji = EMOJI_ALPHABET[0].as_bytes();
        buf[..EMOJI_CHAR_BYTES].copy_from_slice(emoji);
        return EMOJI_CHAR_BYTES;
    }
    let bytes = n.to_be_bytes();
    let first_nonzero = bytes.iter().position(|&b| b != 0).unwrap();
    let mut pos = 0;
    for &b in &bytes[first_nonzero..] {
        let emoji = EMOJI_ALPHABET[b as usize].as_bytes();
        buf[pos..pos + EMOJI_CHAR_BYTES].copy_from_slice(emoji);
        pos += EMOJI_CHAR_BYTES;
    }
    pos
}

#[inline]
fn emoji_byte_count(n: u64) -> usize {
    if n == 0 {
        return EMOJI_CHAR_BYTES;
    }
    let significant_bytes = 8 - (n.leading_zeros() as usize / 8);
    significant_bytes * EMOJI_CHAR_BYTES
}

// ── SHA-1 helpers ──

fn compute_midstate(data: &[u8]) -> [u32; 5] {
    assert!(data.len() % SHA1_BLOCK_SIZE == 0);
    let mut state = SHA1_INIT;
    for block in data.chunks_exact(SHA1_BLOCK_SIZE) {
        let block_arr: [u8; 64] = block.try_into().unwrap();
        compress(&mut state, &[block_arr]);
    }
    state
}

fn finalize_sha1_with_midstate(
    midstate: &[u32; 5],
    tail: &[u8],
    total_len: u64,
) -> [u8; SHA1_DIGEST_SIZE] {
    let total_bits = total_len * 8;
    let tail_len = tail.len();
    let needed = tail_len + 1 + 8;
    let padded_len = if needed <= SHA1_BLOCK_SIZE { SHA1_BLOCK_SIZE } else { SHA1_BLOCK_SIZE * 2 };
    let mut padded = [0u8; SHA1_BLOCK_SIZE * 2];
    padded[..tail_len].copy_from_slice(tail);
    padded[tail_len] = 0x80;
    padded[padded_len - 8..padded_len].copy_from_slice(&total_bits.to_be_bytes());
    let mut state = *midstate;
    for block in padded[..padded_len].chunks_exact(SHA1_BLOCK_SIZE) {
        let block_arr: [u8; 64] = block.try_into().unwrap();
        compress(&mut state, &[block_arr]);
    }
    let mut digest = [0u8; SHA1_DIGEST_SIZE];
    for (i, &word) in state.iter().enumerate() {
        digest[i * 4..(i + 1) * 4].copy_from_slice(&word.to_be_bytes());
    }
    digest
}

#[inline]
fn fmt_u64_to_buf(mut n: u64, buf: &mut [u8]) -> usize {
    if n == 0 { buf[0] = b'0'; return 1; }
    let mut tmp = [0u8; 20];
    let mut pos = 20;
    while n > 0 { pos -= 1; tmp[pos] = b'0' + (n % 10) as u8; n /= 10; }
    let len = 20 - pos;
    buf[..len].copy_from_slice(&tmp[pos..20]);
    len
}

fn fmt_u64_into(buf: &mut Vec<u8>, n: u64) {
    let mut tmp = [0u8; 20];
    let len = fmt_u64_to_buf(n, &mut tmp);
    buf.extend_from_slice(&tmp[..len]);
}

#[inline(always)]
fn check_prefix(hash: &[u8], target: &[(u8, bool)]) -> bool {
    for (i, &(byte, full)) in target.iter().enumerate() {
        if full { if hash[i] != byte { return false; } }
        else { if (hash[i] & 0xF0) != byte { return false; } }
    }
    true
}

// ── Realistic commit object setup ──

fn make_static_obj_part() -> Vec<u8> {
    b"tree 4b825dc642cb6eb9a060e54bf899d8b5820f74aa\n\
parent d92257fb6bd71a1b3c2e4f890abcdef1234567890\n\
author Test User <test@example.com> 1700000000 +0000\n\
committer Test User <test@example.com> 1700000000 +0000\n\
\n\
Add git-vanity: brute-force vanity commit hash prefixes\n\
\n\
\nvanity: ".to_vec()
}

// Impossible target to never exit early
fn impossible_target() -> Vec<(u8, bool)> {
    vec![(0xFF, true), (0xFF, true), (0xFF, true), (0xFF, true), (0xFF, true)]
}

// ── Strategy 1: OLD — full hash every iteration with emoji nonce, inline check ──

fn bench_old_full_hash(total: u64) -> f64 {
    let static_obj_part = make_static_obj_part();
    let target = impossible_target();
    let base_len = static_obj_part.len();

    let mut buf = Vec::with_capacity(base_len + 80);
    let mut nonce_buf = [0u8; 64];

    let nonce_start: u64 = 1_000_000_000;
    let start = Instant::now();

    for i in 0..total {
        let nonce = nonce_start + i;
        let nonce_len = fmt_u64_to_emoji_buf(nonce, &mut nonce_buf);
        let nonce_bytes = &nonce_buf[..nonce_len];
        let obj_len = base_len + nonce_len;

        buf.clear();
        buf.extend_from_slice(b"commit ");
        fmt_u64_into(&mut buf, obj_len as u64);
        buf.push(0);
        buf.extend_from_slice(&static_obj_part);
        buf.extend_from_slice(nonce_bytes);

        let mut hasher = Sha1::new();
        hasher.update(&buf);
        let result = hasher.finalize();

        if check_prefix(&result, &target) {
            std::hint::black_box(&result);
        }
    }

    let elapsed = start.elapsed().as_secs_f64();
    total as f64 / elapsed
}

// ── Strategy 2: NEW — midstate + batch, configurable batch size, emoji nonce ──

fn bench_midstate_batch(batch_size: usize, total: u64) -> f64 {
    let static_obj_part = make_static_obj_part();
    let target = impossible_target();

    let sample_nonce_len = emoji_byte_count(1_000_000_000); // 5 emojis = 20 bytes
    let obj_len = static_obj_part.len() + sample_nonce_len;
    let mut header = Vec::new();
    header.extend_from_slice(b"commit ");
    header.extend_from_slice(obj_len.to_string().as_bytes());
    header.push(0);
    header.extend_from_slice(&static_obj_part);

    let shared_prefix_len = header.len();
    let midstate_blocks = shared_prefix_len / SHA1_BLOCK_SIZE;
    let midstate_byte_count = midstate_blocks * SHA1_BLOCK_SIZE;
    let midstate = compute_midstate(&header[..midstate_byte_count]);
    let tail_prefix = header[midstate_byte_count..].to_vec();

    let mut results = vec![[0u8; SHA1_DIGEST_SIZE]; batch_size];
    let mut nonce_buf = [0u8; 64];
    let mut tail_buf = [0u8; SHA1_BLOCK_SIZE * 2 + 64];

    let nonce_base: u64 = 1_000_000_000;
    let num_batches = (total as usize + batch_size - 1) / batch_size;

    let start = Instant::now();

    for batch_idx in 0..num_batches {
        let nonce_start = nonce_base + (batch_idx * batch_size) as u64;

        // Phase 1: HASH
        for i in 0..batch_size {
            let nonce = nonce_start + i as u64;
            let nonce_len = fmt_u64_to_emoji_buf(nonce, &mut nonce_buf);
            let tail_data_len = tail_prefix.len() + nonce_len;
            tail_buf[..tail_prefix.len()].copy_from_slice(&tail_prefix);
            tail_buf[tail_prefix.len()..tail_prefix.len() + nonce_len]
                .copy_from_slice(&nonce_buf[..nonce_len]);
            let total_msg_len = midstate_byte_count + tail_data_len;
            results[i] = finalize_sha1_with_midstate(&midstate, &tail_buf[..tail_data_len], total_msg_len as u64);
        }

        // Phase 2: CHECK
        for i in 0..batch_size {
            if check_prefix(&results[i], &target) {
                std::hint::black_box(i);
            }
        }
    }

    let elapsed = start.elapsed().as_secs_f64();
    let actual = num_batches * batch_size;
    actual as f64 / elapsed
}

// ── Strategy 3: Midstate + inline check (no batch), emoji nonce ──

fn bench_midstate_inline(total: u64) -> f64 {
    let static_obj_part = make_static_obj_part();
    let target = impossible_target();

    let sample_nonce_len = emoji_byte_count(1_000_000_000);
    let obj_len = static_obj_part.len() + sample_nonce_len;
    let mut header = Vec::new();
    header.extend_from_slice(b"commit ");
    header.extend_from_slice(obj_len.to_string().as_bytes());
    header.push(0);
    header.extend_from_slice(&static_obj_part);

    let shared_prefix_len = header.len();
    let midstate_blocks = shared_prefix_len / SHA1_BLOCK_SIZE;
    let midstate_byte_count = midstate_blocks * SHA1_BLOCK_SIZE;
    let midstate = compute_midstate(&header[..midstate_byte_count]);
    let tail_prefix = header[midstate_byte_count..].to_vec();

    let mut nonce_buf = [0u8; 64];
    let mut tail_buf = [0u8; SHA1_BLOCK_SIZE * 2 + 64];

    let nonce_base: u64 = 1_000_000_000;
    let start = Instant::now();

    for i in 0..total {
        let nonce = nonce_base + i;
        let nonce_len = fmt_u64_to_emoji_buf(nonce, &mut nonce_buf);
        let tail_data_len = tail_prefix.len() + nonce_len;
        tail_buf[..tail_prefix.len()].copy_from_slice(&tail_prefix);
        tail_buf[tail_prefix.len()..tail_prefix.len() + nonce_len]
            .copy_from_slice(&nonce_buf[..nonce_len]);
        let total_msg_len = midstate_byte_count + tail_data_len;
        let result = finalize_sha1_with_midstate(&midstate, &tail_buf[..tail_data_len], total_msg_len as u64);

        if check_prefix(&result, &target) {
            std::hint::black_box(&result);
        }
    }

    let elapsed = start.elapsed().as_secs_f64();
    total as f64 / elapsed
}

fn main() {
    let total: u64 = 10_000_000;

    println!("═══════════════════════════════════════════════════════════════");
    println!(" SHA-1 Vanity Hash Benchmark (emoji nonce) — single thread, {}M hashes", total / 1_000_000);
    println!("═══════════════════════════════════════════════════════════════");
    println!();

    // Show nonce encoding info
    let mut demo_buf = [0u8; 64];
    let demo_len = fmt_u64_to_emoji_buf(1_000_000_000, &mut demo_buf);
    let demo_str = std::str::from_utf8(&demo_buf[..demo_len]).unwrap();
    println!("📋 Nonce encoding: base-256 emoji (U+1F300..1F3FF)");
    println!("   Example: 1000000000 → {} ({} bytes, {} emojis)", demo_str, demo_len, demo_len / 4);
    println!();

    // ── 1. Old: full hash + inline check ──
    print!("Warming up OLD (full hash + emoji)...");
    let _ = bench_old_full_hash(1_000_000);
    println!(" done");
    let old_rate = bench_old_full_hash(total);
    println!("OLD (full hash, inline check):   {:>6.2} M/s", old_rate / 1e6);
    println!();

    // ── 2. New: midstate + inline check (no batch) ──
    print!("Warming up MIDSTATE (inline + emoji)...");
    let _ = bench_midstate_inline(1_000_000);
    println!(" done");
    let mid_inline_rate = bench_midstate_inline(total);
    println!(
        "MIDSTATE (inline check):         {:>6.2} M/s  ({:.1}x vs old)",
        mid_inline_rate / 1e6,
        mid_inline_rate / old_rate
    );
    println!();

    // ── 3. New: midstate + batch, varying batch size ──
    println!("MIDSTATE + BATCH (hash/check separation):");
    println!("{:>12} {:>12} {:>10} {:>10}", "batch_size", "M/s", "vs old", "vs inline");
    println!("{:-<12} {:-<12} {:-<10} {:-<10}", "", "", "", "");

    let batch_sizes: Vec<usize> = vec![
        64, 256, 1_000, 4_000, 8_000, 16_000, 32_000, 64_000,
        100_000, 200_000, 500_000, 1_000_000, 2_000_000, 4_000_000,
    ];

    let mut best_rate = 0.0f64;
    let mut best_bs = 0usize;

    for &bs in &batch_sizes {
        let _ = bench_midstate_batch(bs, 1_000_000); // warmup
        let rate = bench_midstate_batch(bs, total);
        let marker = if rate > best_rate { best_rate = rate; best_bs = bs; " ◀" } else { "" };
        println!(
            "{:>12} {:>12.2} {:>9.1}x {:>9.2}x{}",
            bs,
            rate / 1e6,
            rate / old_rate,
            rate / mid_inline_rate,
            marker
        );
    }

    println!();
    println!("═══════════════════════════════════════════════════════════════");
    println!("                        SUMMARY");
    println!("═══════════════════════════════════════════════════════════════");
    println!("OLD (full hash):        {:>6.2} M/s (baseline)", old_rate / 1e6);
    println!("MIDSTATE inline:        {:>6.2} M/s ({:.1}x)", mid_inline_rate / 1e6, mid_inline_rate / old_rate);
    println!("MIDSTATE batch (best):  {:>6.2} M/s ({:.1}x) @ batch_size={}", best_rate / 1e6, best_rate / old_rate, best_bs);
    println!();

    let cores = std::thread::available_parallelism().map(|n| n.get()).unwrap_or(8);
    println!("Projected {}-thread throughput:", cores);
    println!("  OLD:    ~{:.1} M/s", old_rate / 1e6 * cores as f64 * 0.9);
    println!("  NEW:    ~{:.1} M/s", best_rate.max(mid_inline_rate) / 1e6 * cores as f64 * 0.9);
    println!();

    let target_9 = 16f64.powi(9);
    let best_overall = best_rate.max(mid_inline_rate);
    println!("ETA for 9-digit prefix (133731173, ~{:.1}B attempts):", target_9 / 1e9);
    println!("  OLD:    ~{:.0} min", target_9 / (old_rate * cores as f64 * 0.9) / 60.0);
    println!("  NEW:    ~{:.0} min", target_9 / (best_overall * cores as f64 * 0.9) / 60.0);
}
