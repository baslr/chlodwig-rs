use sha1::block_api::compress;
use sha1::{Digest, Sha1};
use std::process::Command;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::time::Instant;

/// Default target prefix for the commit hash (hex string).
const TARGET_PREFIX: &str = "133731173";

/// SHA-1 block size in bytes.
const SHA1_BLOCK_SIZE: usize = 64;

/// SHA-1 digest size in bytes.
const SHA1_DIGEST_SIZE: usize = 20;

/// How often each thread checks the `found` flag (bitmask: every ~1M nonces).
const FOUND_CHECK_MASK: u64 = (1 << 20) - 1; // 0xF_FFFF

/// Cache-line padded atomic counter — one per thread to avoid false sharing.
#[repr(align(128))]
struct PaddedCounter(AtomicU64);

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let thread_override = parse_thread_count(&args);

    // First positional arg that's not --threads or its value
    let target = args.iter().skip(1)
        .filter(|a| *a != "--threads")
        .find(|a| !a.starts_with('-') || a.chars().all(|c| c.is_ascii_hexdigit() || c == '-'))
        .and_then(|a| {
            // Skip the number right after --threads
            let idx = args.iter().position(|x| x == a).unwrap();
            if idx > 0 && args[idx - 1] == "--threads" {
                None
            } else {
                Some(a.clone())
            }
        })
        .unwrap_or_else(|| TARGET_PREFIX.to_string());

    // Validate target is valid hex
    if !target.chars().all(|c| c.is_ascii_hexdigit()) {
        eprintln!("❌ Target prefix must be hex characters [0-9a-f]: {target}");
        std::process::exit(1);
    }
    let target = target.to_ascii_lowercase();

    let target_bytes = encode_target_prefix(&target);

    println!("🎯 Target prefix: {target} ({} hex digits)", target.len());
    println!(
        "🎲 Probability per attempt: 1/{} ({:.2e})",
        16u64.pow(target.len() as u32),
        1.0 / 16f64.powi(target.len() as i32)
    );
    println!(
        "📊 Expected attempts: ~{:.1} billion",
        16f64.powi(target.len() as i32) / 1e9
    );

    // Get current commit info from git
    let commit_obj = git_cat_file("HEAD");
    let actual_hash = git_rev_parse("HEAD").trim().to_string();
    println!("📝 Current HEAD: {actual_hash}");

    // Split commit: prefix ends with "vanity: ", suffix is empty.
    // Emoji nonce is appended at the very end → maximum midstate reuse.
    let (static_obj_part, _suffix) = build_static_parts(&commit_obj);

    // Verify base reconstruction (nonce 0 = first emoji as test)
    {
        let mut emoji_buf = [0u8; 64];
        let emoji_len = fmt_u64_to_emoji_buf(0, &mut emoji_buf);
        let test_obj: Vec<u8> = [&static_obj_part[..], &emoji_buf[..emoji_len]].concat();
        let test_hash = git_hash_object(&test_obj);
        let test_emoji = std::str::from_utf8(&emoji_buf[..emoji_len]).unwrap();
        println!("✅ Reconstruction verified (test nonce=0/{test_emoji} → {test_hash})");
    }

    let num_cores = thread_override.unwrap_or_else(|| {
        // Leave one core free so the OS / interactive apps stay responsive.
        // Even with `nice 19`, saturating ALL cores starves the scheduler on
        // macOS — opening a new terminal can take many seconds.
        let total = std::thread::available_parallelism()
            .map(|n| n.get())
            .unwrap_or(8);
        if total > 1 { total - 1 } else { 1 }
    });
    println!("🚀 Using {num_cores} threads (lock-free, no rayon)");
    println!("📦 Strategy: SHA-1 midstate (computed once) + inline check (emoji nonce)");
    println!();

    // ─── Pre-compute midstate ONCE for all threads ───
    //
    // The nonce range we'll search starts at 0. For small nonces (0..255),
    // the emoji encoding is 4 bytes (1 emoji). As nonces grow, the byte count
    // increases at powers of 256. We compute the initial midstate for the
    // first emoji byte count. When a thread hits a byte-count boundary, it
    // recomputes (extremely rare: ~8 times across the entire u64 range).
    let initial_nonce_len = emoji_byte_count(0); // 4 bytes (1 emoji)
    let obj_len_for_initial = static_obj_part.len() + initial_nonce_len;

    let mut header_buf = [0u8; 30];
    header_buf[..7].copy_from_slice(b"commit ");
    let digits = fmt_u64_to_buf(obj_len_for_initial as u64, &mut header_buf[7..]);
    let header_len = 7 + digits;
    header_buf[header_len] = 0;
    let header_total = header_len + 1;

    let mut shared_prefix = Vec::with_capacity(header_total + static_obj_part.len());
    shared_prefix.extend_from_slice(&header_buf[..header_total]);
    shared_prefix.extend_from_slice(&static_obj_part);

    let shared_prefix_len = shared_prefix.len();
    let midstate_blocks = shared_prefix_len / SHA1_BLOCK_SIZE;
    let midstate_byte_count = midstate_blocks * SHA1_BLOCK_SIZE;
    let initial_midstate = compute_midstate(&shared_prefix[..midstate_byte_count]);
    let tail_prefix_bytes = shared_prefix[midstate_byte_count..].to_vec();

    // ─── Shared state ───
    let found = AtomicBool::new(false);
    let counters: Vec<PaddedCounter> = (0..num_cores)
        .map(|_| PaddedCounter(AtomicU64::new(0)))
        .collect();
    let start = Instant::now();

    // ─── Partition nonce space: each thread gets an equal contiguous range ───
    let range_per_thread = u64::MAX / num_cores as u64;

    let result: Option<(u64, [u8; SHA1_DIGEST_SIZE], usize)> = std::thread::scope(|s| {
        // Progress reporter thread
        let found_ref = &found;
        let counters_ref = &counters;
        let target_ref = &target;
        s.spawn(move || {
            let mut last_total = 0u64;
            loop {
                std::thread::sleep(std::time::Duration::from_secs(2));
                if found_ref.load(Ordering::Relaxed) {
                    break;
                }
                let total: u64 = counters_ref
                    .iter()
                    .map(|c| c.0.load(Ordering::Relaxed))
                    .sum();
                let elapsed = start.elapsed().as_secs_f64();
                let rate = total as f64 / elapsed;
                let expected = 16f64.powi(target_ref.len() as i32);
                let eta = format_eta(expected, total as f64, rate);
                let inst_rate = (total - last_total) as f64 / 2.0;
                println!(
                    "   ⏱  {:.1}s | {:.2}B tried | {:.1}M/s (inst: {:.1}M/s) | ETA: {}",
                    elapsed,
                    total as f64 / 1e9,
                    rate / 1e6,
                    inst_rate / 1e6,
                    eta
                );
                last_total = total;
            }
        });

        // Worker threads — each gets a contiguous nonce range, no synchronization
        let handles: Vec<_> = (0..num_cores)
            .map(|tid| {
                let found_ref = &found;
                let counter_ref = &counters[tid];
                let target_ref = &target_bytes;
                let static_obj_ref = &static_obj_part;
                let initial_midstate_ref = &initial_midstate;
                let tail_prefix_ref = &tail_prefix_bytes;

                s.spawn(move || -> Option<(u64, [u8; SHA1_DIGEST_SIZE], usize)> {
                    let my_start = tid as u64 * range_per_thread;
                    let my_end = if tid == num_cores - 1 {
                        u64::MAX
                    } else {
                        my_start + range_per_thread
                    };

                    // Thread-local stack buffers — zero heap allocation in the hot loop
                    let mut nonce_buf = [0u8; 64];
                    let mut tail_buf = [0u8; SHA1_BLOCK_SIZE * 2 + 64];

                    // Current midstate (recomputed when nonce byte-count changes)
                    let mut current_midstate = *initial_midstate_ref;
                    let mut current_midstate_byte_count = midstate_byte_count;
                    let mut current_tail_prefix = tail_prefix_ref.clone();
                    let mut current_nonce_len = emoji_byte_count(my_start);

                    // If this thread's start nonce has a different byte count than
                    // the initial midstate, recompute once.
                    if current_nonce_len != initial_nonce_len {
                        recompute_midstate_for_nonce_len(
                            static_obj_ref,
                            current_nonce_len,
                            &mut current_midstate,
                            &mut current_midstate_byte_count,
                            &mut current_tail_prefix,
                        );
                    }

                    // Hoist tail_prefix copy: write once before the loop.
                    // Only re-copy when nonce byte-count changes (extremely rare).
                    let mut nonce_offset = current_tail_prefix.len();
                    tail_buf[..nonce_offset].copy_from_slice(&current_tail_prefix);

                    let mut local_count: u64 = 0;

                    let mut nonce = my_start;
                    while nonce < my_end {
                        let nonce_len = fmt_u64_to_emoji_buf(nonce, &mut nonce_buf);

                        let digest = if nonce_len != current_nonce_len {
                            // Nonce byte-count changed — recompute midstate (extremely rare)
                            current_nonce_len = nonce_len;
                            recompute_midstate_for_nonce_len(
                                static_obj_ref,
                                current_nonce_len,
                                &mut current_midstate,
                                &mut current_midstate_byte_count,
                                &mut current_tail_prefix,
                            );
                            // Re-copy tail_prefix for new epoch
                            nonce_offset = current_tail_prefix.len();
                            tail_buf[..nonce_offset].copy_from_slice(&current_tail_prefix);
                            // Hash with new midstate
                            let tail_data_len = nonce_offset + nonce_len;
                            tail_buf[nonce_offset..nonce_offset + nonce_len]
                                .copy_from_slice(&nonce_buf[..nonce_len]);
                            let total_msg_len = current_midstate_byte_count + tail_data_len;
                            finalize_sha1_with_midstate(
                                &current_midstate,
                                &tail_buf[..tail_data_len],
                                total_msg_len as u64,
                            )
                        } else {
                            // Fast path: tail_prefix already in tail_buf, only write nonce
                            let tail_data_len = nonce_offset + nonce_len;
                            tail_buf[nonce_offset..nonce_offset + nonce_len]
                                .copy_from_slice(&nonce_buf[..nonce_len]);
                            let total_msg_len = current_midstate_byte_count + tail_data_len;
                            finalize_sha1_with_midstate(
                                &current_midstate,
                                &tail_buf[..tail_data_len],
                                total_msg_len as u64,
                            )
                        };

                        if check_prefix(&digest, target_ref) {
                            found_ref.store(true, Ordering::Relaxed);
                            return Some((nonce, digest, nonce_len));
                        }

                        local_count += 1;
                        nonce += 1;

                        // Every ~1M nonces: update counter + check if another thread found it
                        if local_count & FOUND_CHECK_MASK == 0 {
                            counter_ref.0.store(local_count, Ordering::Relaxed);
                            if found_ref.load(Ordering::Relaxed) {
                                return None;
                            }
                        }
                    }
                    None
                })
            })
            .collect();

        // Collect results
        let mut winner = None;
        for handle in handles {
            if let Some(result) = handle.join().unwrap() {
                winner = Some(result);
            }
        }
        winner
    });

    if let Some((nonce, digest, nonce_len)) = result {
        let elapsed = start.elapsed().as_secs_f64();
        let total: u64 = counters.iter().map(|c| c.0.load(Ordering::Relaxed)).sum();
        let hash_hex = hex_encode(&digest);
        let mut nonce_buf = [0u8; 64];
        let _ = fmt_u64_to_emoji_buf(nonce, &mut nonce_buf);
        let emoji_str = std::str::from_utf8(&nonce_buf[..nonce_len]).unwrap_or("?");
        println!();
        println!("🎯 FOUND! nonce={nonce} ({emoji_str}) hash={hash_hex}");
        println!(
            "   {:.2}B attempts in {:.1}s ({:.1}M/s)",
            total as f64 / 1e9,
            elapsed,
            total as f64 / elapsed / 1e6
        );

        let obj: Vec<u8> = [&static_obj_part[..], &nonce_buf[..nonce_len]].concat();
        apply_commit(&obj);
    } else {
        println!("❌ Not found in search range");
        std::process::exit(1);
    }
}

// ─── Midstate Recomputation ───

/// Recompute the midstate when the nonce byte-count changes.
/// This happens at most ~8 times across the entire u64 range (at powers of 256).
fn recompute_midstate_for_nonce_len(
    static_obj_part: &[u8],
    nonce_len: usize,
    midstate: &mut [u32; 5],
    midstate_byte_count: &mut usize,
    tail_prefix: &mut Vec<u8>,
) {
    let obj_len = static_obj_part.len() + nonce_len;
    let mut header_buf = [0u8; 30];
    header_buf[..7].copy_from_slice(b"commit ");
    let digits = fmt_u64_to_buf(obj_len as u64, &mut header_buf[7..]);
    let header_len = 7 + digits;
    header_buf[header_len] = 0;
    let header_total = header_len + 1;

    let mut shared_prefix = Vec::with_capacity(header_total + static_obj_part.len());
    shared_prefix.extend_from_slice(&header_buf[..header_total]);
    shared_prefix.extend_from_slice(static_obj_part);

    let blocks = shared_prefix.len() / SHA1_BLOCK_SIZE;
    *midstate_byte_count = blocks * SHA1_BLOCK_SIZE;
    *midstate = compute_midstate(&shared_prefix[..*midstate_byte_count]);
    *tail_prefix = shared_prefix[*midstate_byte_count..].to_vec();
}

// ─── SHA-1 Midstate Functions ───

/// Initial SHA-1 state (H0..H4).
const SHA1_INIT: [u32; 5] = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

/// Compute the SHA-1 midstate after processing `data` (must be a multiple of 64 bytes).
fn compute_midstate(data: &[u8]) -> [u32; 5] {
    assert!(
        data.len() % SHA1_BLOCK_SIZE == 0,
        "midstate data must be block-aligned"
    );
    let mut state = SHA1_INIT;
    for block in data.chunks_exact(SHA1_BLOCK_SIZE) {
        let block_arr: [u8; 64] = block.try_into().unwrap();
        compress(&mut state, &[block_arr]);
    }
    state
}

/// Finalize a SHA-1 hash given a midstate, the remaining tail data, and the
/// total message length (midstate bytes + tail bytes).
///
/// Applies SHA-1 padding (0x80 + zeros + 64-bit big-endian bit count) and
/// compresses the remaining 1-2 blocks.
fn finalize_sha1_with_midstate(
    midstate: &[u32; 5],
    tail: &[u8],
    total_len: u64,
) -> [u8; SHA1_DIGEST_SIZE] {
    let total_bits = total_len * 8;
    let tail_len = tail.len();

    // tail + 0x80 + zeros + 8-byte length must fill to a multiple of 64
    let needed = tail_len + 1 + 8;
    let padded_len = if needed <= SHA1_BLOCK_SIZE {
        SHA1_BLOCK_SIZE
    } else {
        SHA1_BLOCK_SIZE * 2
    };

    let mut padded = [0u8; SHA1_BLOCK_SIZE * 2];
    padded[..tail_len].copy_from_slice(tail);
    padded[tail_len] = 0x80;
    let bit_count_pos = padded_len - 8;
    padded[bit_count_pos..padded_len].copy_from_slice(&total_bits.to_be_bytes());

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

/// Prepare a pre-filled padded buffer for `finalize_sha1_prepadded`.
///
/// Within a nonce-length epoch, everything in the padded buffer is constant
/// EXCEPT the nonce bytes at offset `tail_prefix.len()..tail_prefix.len()+nonce_len`.
/// This function fills in: tail_prefix, 0x80 padding byte, zero fill, and the
/// 64-bit big-endian bit count. The caller only needs to overwrite the nonce
/// bytes before each call to `finalize_sha1_prepadded`.
///
/// Returns (padded_buf, padded_len) where padded_len is the number of bytes
/// to process (always a multiple of 64).
///
/// NOTE: Benchmarked but NOT used in the hot loop — the overhead of passing
/// `&[u8; 128]` to `finalize_sha1_prepadded` prevents the compiler from
/// optimizing as well as the dynamic-slice approach in `finalize_sha1_with_midstate`.
/// Kept for tests and as documentation of the attempted optimization.
#[cfg(test)]
fn prepare_padded_buf(
    tail_prefix: &[u8],
    nonce_len: usize,
    midstate_byte_count: usize,
) -> ([u8; SHA1_BLOCK_SIZE * 2], usize) {
    let tail_data_len = tail_prefix.len() + nonce_len;
    let total_msg_len = midstate_byte_count + tail_data_len;
    let total_bits = (total_msg_len as u64) * 8;

    let needed = tail_data_len + 1 + 8;
    let padded_len = if needed <= SHA1_BLOCK_SIZE {
        SHA1_BLOCK_SIZE
    } else {
        SHA1_BLOCK_SIZE * 2
    };

    let mut padded = [0u8; SHA1_BLOCK_SIZE * 2];
    padded[..tail_prefix.len()].copy_from_slice(tail_prefix);
    // Nonce bytes at [tail_prefix.len()..tail_prefix.len()+nonce_len] — left for caller
    padded[tail_data_len] = 0x80;
    // Zero fill is already there from [0u8; 128] init
    let bit_count_pos = padded_len - 8;
    padded[bit_count_pos..padded_len].copy_from_slice(&total_bits.to_be_bytes());

    (padded, padded_len)
}

/// Finalize SHA-1 using a pre-filled padded buffer (from `prepare_padded_buf`).
///
/// See `prepare_padded_buf` for why this is not used in the hot loop.
#[cfg(test)]
fn finalize_sha1_prepadded(
    midstate: &[u32; 5],
    padded: &[u8; SHA1_BLOCK_SIZE * 2],
    padded_len: usize,
) -> [u8; SHA1_DIGEST_SIZE] {
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

/// Full SHA-1 hash for fallback (when nonce digit count changes mid-chunk).
///
/// Computes: SHA-1("commit <len>\0" + prefix + nonce + suffix)
fn full_sha1_hash(prefix: &[u8], nonce_bytes: &[u8], suffix: &[u8]) -> [u8; SHA1_DIGEST_SIZE] {
    let obj_len = prefix.len() + nonce_bytes.len() + suffix.len();
    let mut hasher = Sha1::new();
    hasher.update(b"commit ");
    let mut len_buf = [0u8; 20];
    let len_digits = fmt_u64_to_buf(obj_len as u64, &mut len_buf);
    hasher.update(&len_buf[..len_digits]);
    hasher.update(&[0u8]);
    hasher.update(prefix);
    hasher.update(nonce_bytes);
    hasher.update(suffix);
    let result = hasher.finalize();
    let mut digest = [0u8; SHA1_DIGEST_SIZE];
    digest.copy_from_slice(&result);
    digest
}

// ─── Batch hash/check (available but not used in hot loop) ───
//
// Benchmarked: batch separation provides no measurable speedup for this
// workload because the check phase (5 byte comparisons) is trivially cheap
// compared to SHA-1 compression. The midstate optimization alone provides
// the 4.1x speedup. Batch code is kept for reference and potential future
// use with more expensive check logic.

/// Compute a batch of SHA-1 hashes using midstate, writing results into `out`.
/// Returns the number of hashes computed.
#[allow(dead_code)]
fn hash_batch(
    midstate: &[u32; 5],
    midstate_byte_count: usize,
    tail_prefix: &[u8],
    prefix_part: &[u8],
    suffix_part: &[u8],
    first_nonce_len: usize,
    nonce_start: u64,
    batch_size: usize,
    out: &mut [[u8; SHA1_DIGEST_SIZE]],
) -> usize {
    let mut nonce_buf = [0u8; 20];
    let tail_buf_size = tail_prefix.len() + 20 + suffix_part.len();
    let mut tail_buf = vec![0u8; tail_buf_size];

    for i in 0..batch_size {
        let nonce = nonce_start + i as u64;
        let nonce_len = fmt_u64_to_buf(nonce, &mut nonce_buf);
        let nonce_bytes = &nonce_buf[..nonce_len];

        if nonce_len != first_nonce_len {
            out[i] = full_sha1_hash(prefix_part, nonce_bytes, suffix_part);
            continue;
        }

        let tail_data_len = tail_prefix.len() + nonce_len + suffix_part.len();
        tail_buf[..tail_prefix.len()].copy_from_slice(tail_prefix);
        let nonce_offset = tail_prefix.len();
        tail_buf[nonce_offset..nonce_offset + nonce_len].copy_from_slice(nonce_bytes);
        let suffix_offset = nonce_offset + nonce_len;
        tail_buf[suffix_offset..suffix_offset + suffix_part.len()].copy_from_slice(suffix_part);
        let total_msg_len = midstate_byte_count + tail_data_len;
        out[i] = finalize_sha1_with_midstate(
            midstate,
            &tail_buf[..tail_data_len],
            total_msg_len as u64,
        );
    }
    batch_size
}

/// Check a batch of hashes for a matching prefix. Returns the index of the
/// first match, or `None`.
#[allow(dead_code)]
fn check_batch(
    results: &[[u8; SHA1_DIGEST_SIZE]],
    count: usize,
    target: &[(u8, bool)],
) -> Option<usize> {
    for i in 0..count {
        if check_prefix(&results[i], target) {
            return Some(i);
        }
    }
    None
}

// ─── Prefix Matching ───

/// Encode a hex target prefix into byte pairs for fast comparison.
/// Each entry is (byte_value, is_full_byte).
/// If odd number of hex digits, the last entry only matches the high nibble.
fn encode_target_prefix(hex: &str) -> Vec<(u8, bool)> {
    let nibbles: Vec<u8> = hex
        .bytes()
        .map(|b| match b {
            b'0'..=b'9' => b - b'0',
            b'a'..=b'f' => b - b'a' + 10,
            _ => unreachable!(),
        })
        .collect();

    let mut v = Vec::new();
    let mut i = 0;
    while i + 1 < nibbles.len() {
        v.push(((nibbles[i] << 4) | nibbles[i + 1], true));
        i += 2;
    }
    if i < nibbles.len() {
        v.push(((nibbles[i] << 4), false));
    }
    v
}

/// Check if SHA-1 hash bytes match the target prefix.
#[inline(always)]
fn check_prefix(hash: &[u8], target: &[(u8, bool)]) -> bool {
    for (i, &(byte, full)) in target.iter().enumerate() {
        if full {
            if hash[i] != byte {
                return false;
            }
        } else {
            if (hash[i] & 0xF0) != byte {
                return false;
            }
        }
    }
    true
}

// ─── Emoji Nonce Encoding ───

/// 256 unique emojis — each encodes one byte value (base-256 digit system).
/// All are 4-byte UTF-8 codepoints (U+1F300..U+1F3FF range = Miscellaneous Symbols and Pictographs).
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

/// Bytes per emoji in UTF-8. All emojis in our alphabet are 4-byte codepoints.
const EMOJI_CHAR_BYTES: usize = 4;

/// Encode a u64 as a sequence of emojis (base-256 encoding).
/// Each byte of the big-endian u64 maps to one emoji.
/// Leading zero bytes are skipped (like leading zeros in decimal).
/// Returns the number of bytes written to `buf`.
#[inline]
fn fmt_u64_to_emoji_buf(n: u64, buf: &mut [u8]) -> usize {
    if n == 0 {
        let emoji = EMOJI_ALPHABET[0].as_bytes();
        buf[..EMOJI_CHAR_BYTES].copy_from_slice(emoji);
        return EMOJI_CHAR_BYTES;
    }
    let bytes = n.to_be_bytes(); // 8 bytes, big-endian
    let first_nonzero = bytes.iter().position(|&b| b != 0).unwrap();
    let mut pos = 0;
    for &b in &bytes[first_nonzero..] {
        let emoji = EMOJI_ALPHABET[b as usize].as_bytes();
        buf[pos..pos + EMOJI_CHAR_BYTES].copy_from_slice(emoji);
        pos += EMOJI_CHAR_BYTES;
    }
    pos
}

/// Predict the byte count of the emoji encoding for a given nonce.
/// Used to detect when the nonce "digit count" changes (triggers midstate recompute).
#[inline]
fn emoji_byte_count(n: u64) -> usize {
    if n == 0 {
        return EMOJI_CHAR_BYTES; // 1 emoji
    }
    // Number of significant bytes in big-endian representation
    let significant_bytes = 8 - (n.leading_zeros() as usize / 8);
    significant_bytes * EMOJI_CHAR_BYTES
}

// ─── Number Formatting ───

/// Format u64 as decimal ASCII into a buffer. Returns number of bytes written.
#[inline]
fn fmt_u64_to_buf(mut n: u64, buf: &mut [u8]) -> usize {
    if n == 0 {
        buf[0] = b'0';
        return 1;
    }
    let mut tmp = [0u8; 20];
    let mut pos = 20;
    while n > 0 {
        pos -= 1;
        tmp[pos] = b'0' + (n % 10) as u8;
        n /= 10;
    }
    let len = 20 - pos;
    buf[..len].copy_from_slice(&tmp[pos..20]);
    len
}

/// Count decimal digits of a u64.
#[cfg(test)]
fn decimal_digit_count(n: u64) -> usize {
    if n == 0 {
        return 1;
    }
    (n as f64).log10().floor() as usize + 1
}

/// Format ETA for progress display. Returns "overdue" when past expected attempts,
/// "∞" when rate is zero.
fn format_eta(expected: f64, tried: f64, rate: f64) -> String {
    if rate <= 0.0 {
        return "∞".to_string();
    }
    let remaining = expected - tried;
    if remaining <= 0.0 {
        return "overdue".to_string();
    }
    format!("{:.0}s", remaining / rate)
}

/// Parse optional `--threads N` from CLI args.
fn parse_thread_count(args: &[String]) -> Option<usize> {
    let pos = args.iter().position(|a| a == "--threads")?;
    args.get(pos + 1)?.parse().ok()
}

fn hex_encode(bytes: &[u8]) -> String {
    let mut s = String::with_capacity(bytes.len() * 2);
    for &b in bytes {
        s.push(char::from_digit((b >> 4) as u32, 16).unwrap());
        s.push(char::from_digit((b & 0xf) as u32, 16).unwrap());
    }
    s
}

// ─── Commit Object Manipulation ───

/// Split a commit object into (prefix, suffix) for nonce injection at the end.
///
/// The nonce is appended after the commit message, separated by two blank lines:
///
///   tree ...\ncommitter ...\n\n<message>\n\n\nvanity: <EMOJIS>
///
/// Returns (prefix, suffix) where prefix ends with "vanity: " and suffix is empty.
/// The caller concatenates: prefix + emoji_nonce_bytes + suffix.
///
/// If a previous nonce/vanity label (either `\n\n\nnonce: <X>` / `\n\n\nvanity: <X>`
/// at end of message or `nonce <X>` as hidden header) already exists, it is stripped first.
fn build_static_parts(commit_obj: &[u8]) -> (Vec<u8>, Vec<u8>) {
    let obj_str = std::str::from_utf8(commit_obj)
        .expect("commit object must be valid UTF-8");

    // Find the blank line separating headers from message
    let header_end = obj_str
        .find("\n\n")
        .expect("commit object must contain \\n\\n separator");

    let header_part = &obj_str[..header_end];
    let message_part = &obj_str[header_end + 2..]; // skip the "\n\n"

    // Strip any existing nonce hidden header (from previous implementation)
    let cleaned_headers: Vec<&str> = header_part
        .split('\n')
        .filter(|line| !line.starts_with("nonce "))
        .collect();
    let cleaned_header = cleaned_headers.join("\n");

    // Strip any existing nonce/vanity from end of message (all old formats)
    let cleaned_message = if let Some(pos) = message_part.rfind("\n\n\nvanity: ") {
        &message_part[..pos]
    } else if let Some(pos) = message_part.rfind("\n\n\nnonce: ") {
        &message_part[..pos]
    } else if let Some(pos) = message_part.rfind("\nvanity: ") {
        &message_part[..pos]
    } else if let Some(pos) = message_part.rfind("\nnonce: ") {
        &message_part[..pos]
    } else {
        message_part
    };

    // Build prefix: headers + "\n\n" + message + "\n\n\nvanity: "
    let mut prefix = Vec::with_capacity(cleaned_header.len() + 2 + cleaned_message.len() + 12);
    prefix.extend_from_slice(cleaned_header.as_bytes());
    prefix.extend_from_slice(b"\n\n");
    prefix.extend_from_slice(cleaned_message.as_bytes());
    prefix.extend_from_slice(b"\n\n\nvanity: ");

    // suffix is empty — nonce goes at the very end
    let suffix = Vec::new();

    (prefix, suffix)
}

// ─── Git Plumbing ───

fn git_cat_file(rev: &str) -> Vec<u8> {
    let out = Command::new("git")
        .args(["cat-file", "-p", rev])
        .output()
        .expect("git cat-file failed");
    assert!(out.status.success(), "git cat-file failed");
    out.stdout
}

fn git_rev_parse(rev: &str) -> String {
    let out = Command::new("git")
        .args(["rev-parse", rev])
        .output()
        .expect("git rev-parse failed");
    String::from_utf8(out.stdout).unwrap()
}

fn git_hash_object(data: &[u8]) -> String {
    use std::io::Write;
    let mut child = Command::new("git")
        .args(["hash-object", "--stdin", "-t", "commit"])
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .spawn()
        .expect("git hash-object failed");
    child.stdin.as_mut().unwrap().write_all(data).unwrap();
    let out = child.wait_with_output().unwrap();
    String::from_utf8(out.stdout).unwrap().trim().to_string()
}

fn apply_commit(obj: &[u8]) {
    use std::io::Write;

    let mut child = Command::new("git")
        .args(["hash-object", "-w", "--stdin", "-t", "commit"])
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .spawn()
        .expect("git hash-object -w failed");
    child.stdin.as_mut().unwrap().write_all(obj).unwrap();
    let out = child.wait_with_output().unwrap();
    let new_hash = String::from_utf8(out.stdout).unwrap().trim().to_string();

    let status = Command::new("git")
        .args(["update-ref", "HEAD", &new_hash])
        .status()
        .expect("git update-ref failed");
    assert!(status.success(), "git update-ref failed");

    println!("✅ Applied! New HEAD: {new_hash}");
    let out = Command::new("git")
        .args(["log", "--oneline", "-1"])
        .output()
        .expect("git log failed");
    println!("   {}", String::from_utf8_lossy(&out.stdout).trim());
}

// ─── Tests ───

#[cfg(test)]
mod tests {
    use super::*;

    // ── fmt_u64_to_buf ──

    #[test]
    fn test_fmt_u64_zero() {
        let mut buf = [0u8; 20];
        let len = fmt_u64_to_buf(0, &mut buf);
        assert_eq!(&buf[..len], b"0");
    }

    #[test]
    fn test_fmt_u64_single_digit() {
        let mut buf = [0u8; 20];
        let len = fmt_u64_to_buf(7, &mut buf);
        assert_eq!(&buf[..len], b"7");
    }

    #[test]
    fn test_fmt_u64_large_number() {
        let mut buf = [0u8; 20];
        let len = fmt_u64_to_buf(1234567890, &mut buf);
        assert_eq!(&buf[..len], b"1234567890");
    }

    #[test]
    fn test_fmt_u64_max() {
        let mut buf = [0u8; 20];
        let len = fmt_u64_to_buf(u64::MAX, &mut buf);
        assert_eq!(&buf[..len], b"18446744073709551615");
    }

    // ── decimal_digit_count ──

    #[test]
    fn test_digit_count_zero() {
        assert_eq!(decimal_digit_count(0), 1);
    }

    #[test]
    fn test_digit_count_single() {
        assert_eq!(decimal_digit_count(9), 1);
    }

    #[test]
    fn test_digit_count_boundary() {
        assert_eq!(decimal_digit_count(99), 2);
        assert_eq!(decimal_digit_count(100), 3);
        assert_eq!(decimal_digit_count(999), 3);
        assert_eq!(decimal_digit_count(1000), 4);
    }

    #[test]
    fn test_digit_count_large() {
        assert_eq!(decimal_digit_count(1_000_000_000), 10);
    }

    // ── encode_target_prefix ──

    #[test]
    fn test_encode_even_hex() {
        let result = encode_target_prefix("1337");
        assert_eq!(result, vec![(0x13, true), (0x37, true)]);
    }

    #[test]
    fn test_encode_odd_hex() {
        let result = encode_target_prefix("abc");
        assert_eq!(result, vec![(0xAB, true), (0xC0, false)]);
    }

    #[test]
    fn test_encode_single_char() {
        let result = encode_target_prefix("f");
        assert_eq!(result, vec![(0xF0, false)]);
    }

    // ── check_prefix ──

    #[test]
    fn test_check_prefix_matches() {
        let hash = [0x13, 0x37, 0xAB, 0xCD, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        let target = vec![(0x13, true), (0x37, true)];
        assert!(check_prefix(&hash, &target));
    }

    #[test]
    fn test_check_prefix_no_match() {
        let hash = [0x13, 0x38, 0xAB, 0xCD, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        let target = vec![(0x13, true), (0x37, true)];
        assert!(!check_prefix(&hash, &target));
    }

    #[test]
    fn test_check_prefix_odd_nibble_match() {
        let hash = [0xAB, 0xC7, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        let target = vec![(0xAB, true), (0xC0, false)];
        assert!(check_prefix(&hash, &target));
    }

    #[test]
    fn test_check_prefix_odd_nibble_no_match() {
        let hash = [0xAB, 0xD7, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                     0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        let target = vec![(0xAB, true), (0xC0, false)];
        assert!(!check_prefix(&hash, &target));
    }

    // ── compute_midstate ──

    #[test]
    fn test_midstate_initial_is_sha1_init() {
        let state = compute_midstate(&[]);
        assert_eq!(state, SHA1_INIT);
    }

    #[test]
    fn test_midstate_one_block_matches_sha1() {
        let data = [0x41u8; 64];
        let midstate = compute_midstate(&data);
        let result = finalize_sha1_with_midstate(&midstate, &[], 64);

        let mut hasher = Sha1::new();
        hasher.update(&data);
        let reference = hasher.finalize();
        assert_eq!(&result[..], &reference[..]);
    }

    #[test]
    fn test_midstate_with_tail_matches_sha1() {
        let data = [0x42u8; 80];
        let midstate = compute_midstate(&data[..64]);
        let result = finalize_sha1_with_midstate(&midstate, &data[64..], 80);

        let mut hasher = Sha1::new();
        hasher.update(&data);
        let reference = hasher.finalize();
        assert_eq!(&result[..], &reference[..]);
    }

    #[test]
    fn test_midstate_multi_block_with_tail() {
        let data: Vec<u8> = (0..200).map(|i| (i % 256) as u8).collect();
        let midstate = compute_midstate(&data[..192]);
        let result = finalize_sha1_with_midstate(&midstate, &data[192..], 200);

        let mut hasher = Sha1::new();
        hasher.update(&data);
        let reference = hasher.finalize();
        assert_eq!(&result[..], &reference[..]);
    }

    #[test]
    fn test_midstate_tail_needs_two_padding_blocks() {
        // Tail of 56 bytes → 56 + 1 + 8 = 65 > 64 → needs 2 padding blocks
        let data = [0x43u8; 120];
        let midstate = compute_midstate(&data[..64]);
        let result = finalize_sha1_with_midstate(&midstate, &data[64..], 120);

        let mut hasher = Sha1::new();
        hasher.update(&data);
        let reference = hasher.finalize();
        assert_eq!(&result[..], &reference[..]);
    }

    // ── full_sha1_hash ──

    #[test]
    fn test_full_sha1_hash_matches_git_format() {
        let prefix = b"tree abc\nauthor x\n\nmessage\n\n\nvanity: ";
        let nonce = b"12345";
        let suffix = b"";
        let result = full_sha1_hash(prefix, nonce, suffix);

        let obj_len = prefix.len() + nonce.len() + suffix.len();
        let mut hasher = Sha1::new();
        hasher.update(b"commit ");
        hasher.update(obj_len.to_string().as_bytes());
        hasher.update(&[0u8]);
        hasher.update(prefix);
        hasher.update(nonce);
        hasher.update(suffix);
        let reference = hasher.finalize();
        assert_eq!(&result[..], &reference[..]);
    }

    // ── Batch functions ──

    #[test]
    fn test_hash_batch_matches_full_hash() {
        let static_obj_part = b"tree abc123\nparent def456\nauthor A <a@b> 1700000000 +0000\ncommitter A <a@b> 1700000000 +0000\n\nTest message\n\n\nvanity: ".to_vec();
        let suffix_part = b"".to_vec();
        let nonce_start: u64 = 1000;
        let batch_size = 100;

        // Build midstate
        let first_nonce_len = decimal_digit_count(nonce_start);
        let obj_len = static_obj_part.len() + first_nonce_len + suffix_part.len();
        let mut header = Vec::new();
        header.extend_from_slice(b"commit ");
        let mut len_buf = [0u8; 20];
        let len_digits = fmt_u64_to_buf(obj_len as u64, &mut len_buf);
        header.extend_from_slice(&len_buf[..len_digits]);
        header.push(0);
        header.extend_from_slice(&static_obj_part);
        let midstate_byte_count = (header.len() / SHA1_BLOCK_SIZE) * SHA1_BLOCK_SIZE;
        let midstate = compute_midstate(&header[..midstate_byte_count]);
        let tail_prefix = header[midstate_byte_count..].to_vec();

        let mut out = vec![[0u8; SHA1_DIGEST_SIZE]; batch_size];
        hash_batch(
            &midstate,
            midstate_byte_count,
            &tail_prefix,
            &static_obj_part,
            &suffix_part,
            first_nonce_len,
            nonce_start,
            batch_size,
            &mut out,
        );

        // Verify each against full hash
        for i in 0..batch_size {
            let nonce = nonce_start + i as u64;
            let mut nonce_buf = [0u8; 20];
            let nonce_len = fmt_u64_to_buf(nonce, &mut nonce_buf);
            let reference = full_sha1_hash(&static_obj_part, &nonce_buf[..nonce_len], &suffix_part);
            assert_eq!(
                out[i], reference,
                "Mismatch at nonce {nonce}: batch={} full={}",
                hex_encode(&out[i]),
                hex_encode(&reference)
            );
        }
    }

    #[test]
    fn test_check_batch_finds_match() {
        let mut results = vec![[0u8; SHA1_DIGEST_SIZE]; 10];
        results[7] = [0x13, 0x37, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        let target = vec![(0x13, true), (0x37, true)];
        assert_eq!(check_batch(&results, 10, &target), Some(7));
    }

    #[test]
    fn test_check_batch_no_match() {
        let results = vec![[0u8; SHA1_DIGEST_SIZE]; 10];
        let target = vec![(0x13, true), (0x37, true)];
        assert_eq!(check_batch(&results, 10, &target), None);
    }

    // ── Midstate matches full hash for range ──

    #[test]
    fn test_batch_midstate_matches_full_hash_for_range() {
        let static_obj_part = b"tree abc123\nparent def456\nauthor A <a@b> 1700000000 +0000\ncommitter A <a@b> 1700000000 +0000\n\nTest message\n\n\nvanity: ";
        let nonce_start: u64 = 1000;

        for i in 0..100u64 {
            let nonce = nonce_start + i;
            let mut nonce_buf = [0u8; 20];
            let nonce_len = fmt_u64_to_buf(nonce, &mut nonce_buf);
            let nonce_bytes = &nonce_buf[..nonce_len];

            let reference = full_sha1_hash(static_obj_part, nonce_bytes, b"");

            let obj_len = static_obj_part.len() + nonce_len;
            let mut header = Vec::new();
            header.extend_from_slice(b"commit ");
            let mut len_buf = [0u8; 20];
            let len_digits = fmt_u64_to_buf(obj_len as u64, &mut len_buf);
            header.extend_from_slice(&len_buf[..len_digits]);
            header.push(0);
            header.extend_from_slice(static_obj_part);

            let midstate_byte_count = (header.len() / SHA1_BLOCK_SIZE) * SHA1_BLOCK_SIZE;
            let midstate = compute_midstate(&header[..midstate_byte_count]);
            let tail: Vec<u8> = [&header[midstate_byte_count..], nonce_bytes].concat();
            let total_len = midstate_byte_count + tail.len();

            let result = finalize_sha1_with_midstate(&midstate, &tail, total_len as u64);

            assert_eq!(
                result, reference,
                "Mismatch at nonce {nonce}: midstate={} full={}",
                hex_encode(&result),
                hex_encode(&reference)
            );
        }
    }

    // ── hex_encode ──

    #[test]
    fn test_hex_encode() {
        assert_eq!(hex_encode(&[0x13, 0x37, 0xBE, 0xEF]), "1337beef");
    }

    #[test]
    fn test_hex_encode_zeros() {
        assert_eq!(hex_encode(&[0x00, 0x00]), "0000");
    }

    #[test]
    fn test_hex_encode_ff() {
        assert_eq!(hex_encode(&[0xFF]), "ff");
    }

    // ── build_static_parts (vanity: label, emoji nonce at end of message) ──

    #[test]
    fn test_build_static_parts_appends_vanity_after_two_blank_lines() {
        let commit_obj = b"tree abc123\nparent def456\nauthor A <a@b> 1700000000 +0000\ncommitter A <a@b> 1700000000 +0000\n\nMy commit message";
        let (prefix, suffix) = build_static_parts(commit_obj);
        // suffix should be empty (nonce goes at the very end)
        assert!(suffix.is_empty());
        // prefix ends with the message + two blank lines + "vanity: "
        let reconstructed = [&prefix[..], b"42"].concat();
        let result = String::from_utf8(reconstructed).unwrap();
        assert!(result.contains("My commit message\n\n\nvanity: 42"));
    }

    #[test]
    fn test_build_static_parts_message_is_preserved() {
        let commit_obj = b"tree abc\ncommitter X <x@y> 123 +0000\n\nHello World\n";
        let (prefix, suffix) = build_static_parts(commit_obj);
        let reconstructed = [&prefix[..], b"999", &suffix[..]].concat();
        let result = String::from_utf8(reconstructed).unwrap();
        assert!(result.contains("Hello World\n"));
    }

    #[test]
    fn test_build_static_parts_vanity_at_end() {
        let commit_obj = b"tree abc\ncommitter X <x@y> 123 +0000\n\nOriginal message";
        let (prefix, suffix) = build_static_parts(commit_obj);
        let reconstructed = [&prefix[..], b"7", &suffix[..]].concat();
        let result = String::from_utf8(reconstructed).unwrap();
        // Vanity should be at the very end, after two blank lines
        assert!(result.ends_with("\n\n\nvanity: 7"));
    }

    #[test]
    fn test_build_static_parts_strips_old_nonce() {
        // If a previous run added a nonce: label, it should be stripped
        let commit_obj = b"tree abc\ncommitter X <x@y> 123 +0000\n\nMessage\n\n\nnonce: 99999";
        let (prefix, suffix) = build_static_parts(commit_obj);
        let reconstructed = [&prefix[..], b"1", &suffix[..]].concat();
        let result = String::from_utf8(reconstructed).unwrap();
        // Should not contain old nonce, only new vanity
        assert!(!result.contains("nonce: "), "old nonce: label should be stripped");
        assert_eq!(result.matches("vanity: ").count(), 1);
        assert!(result.ends_with("\n\n\nvanity: 1"));
    }

    #[test]
    fn test_build_static_parts_strips_old_nonce_header_format() {
        // Strip old hidden-header format too (from previous implementation)
        let commit_obj = b"tree abc\ncommitter X <x@y> 123 +0000\nnonce 99999\n\nMessage";
        let (prefix, suffix) = build_static_parts(commit_obj);
        let reconstructed = [&prefix[..], b"1", &suffix[..]].concat();
        let result = String::from_utf8(reconstructed).unwrap();
        assert!(!result.contains("nonce"), "old hidden header nonce should be stripped");
        assert!(result.ends_with("\n\n\nvanity: 1"));
    }

    // ── Emoji nonce encoding ──

    #[test]
    fn test_emoji_encode_zero() {
        // Nonce 0 → single emoji (first in alphabet)
        let mut buf = [0u8; 64];
        let len = fmt_u64_to_emoji_buf(0, &mut buf);
        let s = std::str::from_utf8(&buf[..len]).unwrap();
        assert_eq!(s.chars().count(), 1, "nonce 0 should be 1 emoji");
        assert_eq!(s, EMOJI_ALPHABET[0]);
    }

    #[test]
    fn test_emoji_encode_small_values() {
        // Nonces 0..255 each produce exactly 1 emoji (1 byte → 1 emoji)
        let mut buf = [0u8; 64];
        for i in 0..=255u64 {
            let len = fmt_u64_to_emoji_buf(i, &mut buf);
            let s = std::str::from_utf8(&buf[..len]).unwrap();
            assert_eq!(s.chars().count(), 1, "nonce {i} should be 1 emoji");
            assert_eq!(s, EMOJI_ALPHABET[i as usize]);
        }
    }

    #[test]
    fn test_emoji_encode_256() {
        // 256 = 0x100 → 2 "digits" in base-256: [1, 0] → 2 emojis
        let mut buf = [0u8; 64];
        let len = fmt_u64_to_emoji_buf(256, &mut buf);
        let s = std::str::from_utf8(&buf[..len]).unwrap();
        assert_eq!(s.chars().count(), 2, "nonce 256 should be 2 emojis");
        // 256 = 1*256 + 0 → emoji[1] + emoji[0]
        let expected = format!("{}{}", EMOJI_ALPHABET[1], EMOJI_ALPHABET[0]);
        assert_eq!(s, expected);
    }

    #[test]
    fn test_emoji_encode_deterministic() {
        // Same input → same output
        let mut buf1 = [0u8; 64];
        let mut buf2 = [0u8; 64];
        let len1 = fmt_u64_to_emoji_buf(123456789, &mut buf1);
        let len2 = fmt_u64_to_emoji_buf(123456789, &mut buf2);
        assert_eq!(&buf1[..len1], &buf2[..len2]);
    }

    #[test]
    fn test_emoji_encode_max_u64() {
        // u64::MAX should produce max 8 emojis (8 bytes)
        let mut buf = [0u8; 64];
        let len = fmt_u64_to_emoji_buf(u64::MAX, &mut buf);
        let s = std::str::from_utf8(&buf[..len]).unwrap();
        assert!(s.chars().count() <= 8, "u64::MAX should be at most 8 emojis, got {}", s.chars().count());
        assert!(s.chars().count() >= 1, "must produce at least 1 emoji");
    }

    #[test]
    fn test_emoji_encode_all_valid_utf8() {
        // Ensure output is always valid UTF-8
        let mut buf = [0u8; 64];
        for nonce in [0, 1, 127, 255, 256, 1000, 65535, u32::MAX as u64, u64::MAX] {
            let len = fmt_u64_to_emoji_buf(nonce, &mut buf);
            assert!(std::str::from_utf8(&buf[..len]).is_ok(), "invalid UTF-8 for nonce {nonce}");
        }
    }

    #[test]
    fn test_emoji_byte_count_matches_encode() {
        // emoji_byte_count(n) must match the actual encoded byte length
        let mut buf = [0u8; 64];
        for nonce in [0, 1, 127, 255, 256, 65535, 16777215, 16777216, u32::MAX as u64, u64::MAX] {
            let len = fmt_u64_to_emoji_buf(nonce, &mut buf);
            let expected = emoji_byte_count(nonce);
            assert_eq!(len, expected, "byte count mismatch for nonce {nonce}: encode={len} vs predict={expected}");
        }
    }

    #[test]
    fn test_emoji_alphabet_has_256_entries() {
        assert_eq!(EMOJI_ALPHABET.len(), 256);
    }

    #[test]
    fn test_emoji_alphabet_all_unique() {
        let mut seen = std::collections::HashSet::new();
        for (i, emoji) in EMOJI_ALPHABET.iter().enumerate() {
            assert!(seen.insert(emoji), "duplicate emoji at index {i}: {emoji}");
        }
    }

    #[test]
    fn test_emoji_alphabet_all_4_byte_utf8() {
        // All emojis must be exactly 4 bytes in UTF-8 for consistent sizing
        for (i, emoji) in EMOJI_ALPHABET.iter().enumerate() {
            assert_eq!(emoji.len(), 4, "emoji at index {i} ({emoji}) is {} bytes, expected 4", emoji.len());
        }
    }

    // ── vanity: label (renamed from nonce:) ──

    #[test]
    fn test_build_static_parts_uses_vanity_label() {
        let commit_obj = b"tree abc\ncommitter X <x@y> 123 +0000\n\nOriginal message";
        let (prefix, _suffix) = build_static_parts(commit_obj);
        let prefix_str = std::str::from_utf8(&prefix).unwrap();
        assert!(prefix_str.ends_with("\n\n\nvanity: "), "prefix should end with 'vanity: ', got: {:?}", &prefix_str[prefix_str.len().saturating_sub(20)..]);
    }

    #[test]
    fn test_build_static_parts_strips_old_vanity() {
        // Strip previously added vanity: label
        let commit_obj = b"tree abc\ncommitter X <x@y> 123 +0000\n\nMessage\n\n\nvanity: \xf0\x9f\x98\x80\xf0\x9f\x98\x81";
        let (prefix, _suffix) = build_static_parts(commit_obj);
        let prefix_str = std::str::from_utf8(&prefix).unwrap();
        assert_eq!(prefix_str.matches("vanity: ").count(), 1);
    }

    #[test]
    fn test_build_static_parts_strips_both_old_nonce_and_vanity() {
        // Both old "nonce:" and new "vanity:" formats should be stripped
        let commit_obj = b"tree abc\ncommitter X <x@y> 123 +0000\n\nMessage\n\n\nnonce: 12345";
        let (prefix, _suffix) = build_static_parts(commit_obj);
        let prefix_str = std::str::from_utf8(&prefix).unwrap();
        assert!(!prefix_str.contains("nonce: 12345"), "old nonce should be stripped");
        assert!(prefix_str.ends_with("vanity: "), "should end with vanity:");
    }

    // ── Lock-free architecture tests ──

    #[test]
    fn test_padded_counter_alignment_is_128() {
        // PaddedCounter must be 128-byte aligned to avoid false sharing between
        // cache lines. x86 cache lines are 64 bytes; Apple M-series uses 128 bytes.
        assert_eq!(
            std::mem::align_of::<PaddedCounter>(),
            128,
            "PaddedCounter must be 128-byte aligned to avoid false sharing"
        );
    }

    #[test]
    fn test_padded_counter_size_is_at_least_128() {
        // Due to repr(align(128)), the struct size must be at least 128 bytes.
        // This ensures array elements in Vec<PaddedCounter> don't share cache lines.
        assert!(
            std::mem::size_of::<PaddedCounter>() >= 128,
            "PaddedCounter size must be >= 128 bytes, got {}",
            std::mem::size_of::<PaddedCounter>()
        );
    }

    #[test]
    fn test_thread_range_partitioning_no_overlap_no_gap() {
        // Simulate the range partitioning logic from main()
        let num_cores = 16;
        let range_per_thread = u64::MAX / num_cores as u64;

        let mut ranges: Vec<(u64, u64)> = Vec::new();
        for tid in 0..num_cores {
            let my_start = tid as u64 * range_per_thread;
            let my_end = if tid == num_cores - 1 {
                u64::MAX
            } else {
                my_start + range_per_thread
            };
            ranges.push((my_start, my_end));
        }

        // Check no overlaps: each range starts where the previous one ended
        for i in 1..ranges.len() {
            assert_eq!(
                ranges[i].0, ranges[i - 1].1,
                "gap or overlap between thread {} and {}: prev_end={} this_start={}",
                i - 1, i, ranges[i - 1].1, ranges[i].0
            );
        }

        // First range starts at 0
        assert_eq!(ranges[0].0, 0, "first range must start at 0");

        // Last range ends at u64::MAX
        assert_eq!(ranges[num_cores - 1].1, u64::MAX, "last range must end at u64::MAX");
    }

    #[test]
    fn test_recompute_midstate_for_nonce_len_matches_full_hash() {
        // recompute_midstate_for_nonce_len must produce a midstate that, when
        // finalized with the nonce tail, matches the full SHA-1 hash.
        let static_obj_part = b"tree abc123\nparent def456\nauthor A <a@b> 1700000000 +0000\ncommitter A <a@b> 1700000000 +0000\n\nTest message\n\n\nvanity: ";

        // Test at different nonce byte counts (emoji byte count boundaries)
        let test_nonces: Vec<u64> = vec![
            0,            // 1 emoji = 4 bytes
            255,          // 1 emoji = 4 bytes (last)
            256,          // 2 emojis = 8 bytes
            65535,        // 2 emojis = 8 bytes (last)
            65536,        // 3 emojis = 12 bytes
            16777215,     // 3 emojis = 12 bytes (last)
            16777216,     // 4 emojis = 16 bytes
        ];

        for &nonce in &test_nonces {
            let nonce_len = emoji_byte_count(nonce);
            let mut midstate = [0u32; 5];
            let mut midstate_bc = 0usize;
            let mut tail_prefix = Vec::new();

            recompute_midstate_for_nonce_len(
                static_obj_part,
                nonce_len,
                &mut midstate,
                &mut midstate_bc,
                &mut tail_prefix,
            );

            // Encode the nonce
            let mut nonce_buf = [0u8; 64];
            let actual_nonce_len = fmt_u64_to_emoji_buf(nonce, &mut nonce_buf);
            assert_eq!(actual_nonce_len, nonce_len, "emoji_byte_count mismatch for nonce {nonce}");

            // Finalize with the computed midstate
            let mut tail_buf = vec![0u8; tail_prefix.len() + nonce_len];
            tail_buf[..tail_prefix.len()].copy_from_slice(&tail_prefix);
            tail_buf[tail_prefix.len()..].copy_from_slice(&nonce_buf[..nonce_len]);
            let total_msg_len = midstate_bc + tail_buf.len();
            let midstate_result = finalize_sha1_with_midstate(
                &midstate,
                &tail_buf,
                total_msg_len as u64,
            );

            // Compare with full SHA-1 hash
            let full_result = full_sha1_hash(static_obj_part, &nonce_buf[..nonce_len], b"");

            assert_eq!(
                midstate_result, full_result,
                "midstate mismatch at nonce {nonce} (emoji_bytes={nonce_len}): midstate={} full={}",
                hex_encode(&midstate_result),
                hex_encode(&full_result)
            );
        }
    }

    #[test]
    fn test_recompute_midstate_different_nonce_lens_produce_different_midstates() {
        // Different nonce lengths change the commit header (different obj_len decimal),
        // so the midstates should differ.
        let static_obj_part = b"tree abc\ncommitter X <x@y> 123 +0000\n\nMsg\n\n\nvanity: ";

        let nonce_len_a = emoji_byte_count(0);     // 4 bytes
        let nonce_len_b = emoji_byte_count(256);    // 8 bytes

        let mut midstate_a = [0u32; 5];
        let mut bc_a = 0;
        let mut tp_a = Vec::new();
        recompute_midstate_for_nonce_len(static_obj_part, nonce_len_a, &mut midstate_a, &mut bc_a, &mut tp_a);

        let mut midstate_b = [0u32; 5];
        let mut bc_b = 0;
        let mut tp_b = Vec::new();
        recompute_midstate_for_nonce_len(static_obj_part, nonce_len_b, &mut midstate_b, &mut bc_b, &mut tp_b);

        // Midstates may or may not differ (depends on block alignment), but the
        // tail_prefix or midstate_byte_count should differ since obj_len changed.
        let different = midstate_a != midstate_b || bc_a != bc_b || tp_a != tp_b;
        assert!(
            different,
            "recomputed midstate state should differ for nonce_len {} vs {}",
            nonce_len_a, nonce_len_b
        );
    }

    #[test]
    fn test_emoji_nonce_midstate_matches_full_hash_across_byte_count_boundary() {
        // Simulate what happens at the exact boundary where emoji byte count changes.
        // nonce=255 → 1 emoji (4 bytes), nonce=256 → 2 emojis (8 bytes)
        let static_obj_part = b"tree abc123\nparent def456\nauthor A <a@b> 1700000000 +0000\ncommitter A <a@b> 1700000000 +0000\n\nTest\n\n\nvanity: ";

        for &nonce in &[254u64, 255, 256, 257] {
            let nonce_len = emoji_byte_count(nonce);
            let mut nonce_buf = [0u8; 64];
            let actual_len = fmt_u64_to_emoji_buf(nonce, &mut nonce_buf);
            assert_eq!(actual_len, nonce_len);

            let mut midstate = [0u32; 5];
            let mut midstate_bc = 0;
            let mut tp = Vec::new();
            recompute_midstate_for_nonce_len(static_obj_part, nonce_len, &mut midstate, &mut midstate_bc, &mut tp);

            let mut tail = vec![0u8; tp.len() + nonce_len];
            tail[..tp.len()].copy_from_slice(&tp);
            tail[tp.len()..].copy_from_slice(&nonce_buf[..nonce_len]);
            let total = midstate_bc + tail.len();
            let result = finalize_sha1_with_midstate(&midstate, &tail, total as u64);

            let reference = full_sha1_hash(static_obj_part, &nonce_buf[..nonce_len], b"");
            assert_eq!(
                result, reference,
                "boundary nonce {nonce}: midstate={} full={}",
                hex_encode(&result),
                hex_encode(&reference)
            );
        }
    }

    #[test]
    fn test_format_eta_clamps_negative_to_overdue() {
        // When more attempts have been tried than the expected value, ETA goes negative.
        // format_eta should show "overdue" instead of a negative number.
        assert_eq!(format_eta(1e9, 2e9, 100.0), "overdue");
    }

    #[test]
    fn test_format_eta_positive() {
        // Normal case: remaining attempts / rate = ETA in seconds
        let eta = format_eta(1e9, 0.5e9, 100.0);
        // (1e9 - 0.5e9) / 100 = 5_000_000 seconds
        assert_eq!(eta, "5000000s");
    }

    #[test]
    fn test_format_eta_zero_rate() {
        // Zero rate → can't estimate
        assert_eq!(format_eta(1e9, 0.0, 0.0), "∞");
    }

    #[test]
    fn test_found_check_mask_is_power_of_two_minus_one() {
        // FOUND_CHECK_MASK must be 2^n - 1 for efficient bitwise AND check
        assert_eq!(
            FOUND_CHECK_MASK & (FOUND_CHECK_MASK + 1),
            0,
            "FOUND_CHECK_MASK must be 2^n - 1, got {:#x}",
            FOUND_CHECK_MASK
        );
        // And it should be roughly 1M (2^20 - 1 = 1048575)
        assert_eq!(FOUND_CHECK_MASK, 0xF_FFFF);
    }

    #[test]
    fn test_parse_thread_count_none() {
        // No --threads arg → None (use system default)
        let args: Vec<String> = vec!["git-vanity".into(), "1337".into()];
        assert_eq!(parse_thread_count(&args), None);
    }

    #[test]
    fn test_parse_thread_count_valid() {
        let args: Vec<String> = vec!["git-vanity".into(), "1337".into(), "--threads".into(), "4".into()];
        assert_eq!(parse_thread_count(&args), Some(4));
    }

    #[test]
    fn test_parse_thread_count_at_end() {
        let args: Vec<String> = vec!["git-vanity".into(), "--threads".into(), "8".into(), "1337".into()];
        assert_eq!(parse_thread_count(&args), Some(8));
    }

    // ── Pre-padded finalization tests ──

    #[test]
    fn test_prepare_and_finalize_prepadded_matches_finalize() {
        // prepare_padded_buf + finalize_sha1_prepadded must produce the same
        // result as finalize_sha1_with_midstate for the same inputs.
        let static_obj_part = b"tree abc123\nparent def456\nauthor A <a@b> 1700000000 +0000\ncommitter A <a@b> 1700000000 +0000\n\nTest message\n\n\nvanity: ";

        for &nonce_val in &[0u64, 1, 127, 255, 256, 1000, 65535] {
            let nonce_len = emoji_byte_count(nonce_val);
            let mut midstate = [0u32; 5];
            let mut midstate_bc = 0usize;
            let mut tail_prefix = Vec::new();

            recompute_midstate_for_nonce_len(
                static_obj_part, nonce_len,
                &mut midstate, &mut midstate_bc, &mut tail_prefix,
            );

            // Encode nonce
            let mut nonce_buf = [0u8; 64];
            let actual_len = fmt_u64_to_emoji_buf(nonce_val, &mut nonce_buf);
            assert_eq!(actual_len, nonce_len);

            // Reference: old finalize_sha1_with_midstate
            let mut tail_data = vec![0u8; tail_prefix.len() + nonce_len];
            tail_data[..tail_prefix.len()].copy_from_slice(&tail_prefix);
            tail_data[tail_prefix.len()..].copy_from_slice(&nonce_buf[..nonce_len]);
            let total_msg_len = midstate_bc + tail_data.len();
            let reference = finalize_sha1_with_midstate(&midstate, &tail_data, total_msg_len as u64);

            // New: prepare_padded_buf + finalize_sha1_prepadded
            let nonce_offset = tail_prefix.len();
            let (mut padded, padded_len) = prepare_padded_buf(
                &tail_prefix, nonce_len, midstate_bc,
            );
            // Write nonce bytes
            padded[nonce_offset..nonce_offset + nonce_len]
                .copy_from_slice(&nonce_buf[..nonce_len]);
            let result = finalize_sha1_prepadded(&midstate, &padded, padded_len);

            assert_eq!(
                result, reference,
                "prepadded mismatch at nonce {nonce_val}: prepadded={} reference={}",
                hex_encode(&result), hex_encode(&reference)
            );
        }
    }

    #[test]
    fn test_prepadded_only_nonce_bytes_change_between_iterations() {
        // Within a nonce-length epoch, only the nonce bytes in the padded buffer
        // change. Verify that overwriting just the nonce position works correctly
        // for consecutive nonces.
        let static_obj_part = b"tree abc\ncommitter X <x@y> 123 +0000\n\nMsg\n\n\nvanity: ";
        let nonce_len = emoji_byte_count(100); // 4 bytes (1 emoji)

        let mut midstate = [0u32; 5];
        let mut midstate_bc = 0usize;
        let mut tail_prefix = Vec::new();
        recompute_midstate_for_nonce_len(
            static_obj_part, nonce_len,
            &mut midstate, &mut midstate_bc, &mut tail_prefix,
        );

        let nonce_offset = tail_prefix.len();
        let (mut padded, padded_len) = prepare_padded_buf(
            &tail_prefix, nonce_len, midstate_bc,
        );

        let mut nonce_buf = [0u8; 64];
        for nonce in 100u64..110 {
            let len = fmt_u64_to_emoji_buf(nonce, &mut nonce_buf);
            assert_eq!(len, nonce_len, "nonce length changed unexpectedly");

            // Only overwrite the nonce bytes — rest of padded stays
            padded[nonce_offset..nonce_offset + nonce_len]
                .copy_from_slice(&nonce_buf[..nonce_len]);
            let result = finalize_sha1_prepadded(&midstate, &padded, padded_len);

            // Compare with full hash
            let reference = full_sha1_hash(static_obj_part, &nonce_buf[..nonce_len], b"");
            assert_eq!(
                result, reference,
                "consecutive nonce {nonce}: prepadded={} full={}",
                hex_encode(&result), hex_encode(&reference)
            );
        }
    }

    #[test]
    fn test_build_static_parts_matches_cat_file_content() {
        // Verify that build_static_parts produces bytes consistent with the
        // actual commit object, so that static_obj_part + nonce reconstructs
        // the exact bytes that git hash-object will see.
        let commit_obj = git_cat_file("HEAD");
        let (static_obj_part, _suffix) = build_static_parts(&commit_obj);

        // The commit object should be: static_obj_part + <vanity emoji bytes>
        let obj_str = std::str::from_utf8(&commit_obj).unwrap();
        let vanity_pos = obj_str.rfind("\n\n\nvanity: ").unwrap();
        let vanity_tag_start = vanity_pos + "\n\n\nvanity: ".len();
        let expected_static = &commit_obj[..vanity_tag_start];

        // Debug: print lengths and hex dumps of divergence point
        if static_obj_part != expected_static {
            eprintln!("static_obj_part len: {}", static_obj_part.len());
            eprintln!("expected len: {}", expected_static.len());
            for i in 0..std::cmp::min(static_obj_part.len(), expected_static.len()) {
                if static_obj_part[i] != expected_static[i] {
                    eprintln!("First diff at byte {i}:");
                    let s = if i > 10 { i - 10 } else { 0 };
                    eprintln!("  static:   {:?}", &static_obj_part[s..std::cmp::min(i+20, static_obj_part.len())]);
                    eprintln!("  expected: {:?}", &expected_static[s..std::cmp::min(i+20, expected_static.len())]);
                    break;
                }
            }
        }

        assert_eq!(
            static_obj_part, expected_static,
            "build_static_parts output doesn't match commit object content"
        );
    }

    #[test]
    fn test_sha1_crate_basic_correctness() {
        // Verify the sha1 crate (with asm feature) produces correct results
        let mut hasher = Sha1::new();
        hasher.update(b"hello");
        let result = hasher.finalize();
        let hex: String = result.iter().map(|b| format!("{:02x}", b)).collect();
        assert_eq!(hex, "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d",
            "sha1 crate produces wrong hash for 'hello'");
    }

    #[test]
    fn test_sha1_crate_commit_object() {
        // Test with actual git commit object bytes
        let mut hasher = Sha1::new();
        let blob = b"commit 281\0tree bb3248ab076c5113cb67768f1ba28efa97ebd515\nparent 133731173c96b066a198d12ce615309756254079\nauthor Manuel <baslr@users.noreply.github.com> 1775434871 +0200\ncommitter Manuel <baslr@users.noreply.github.com> 1775435481 +0200\n\nAdd vanity-commit.sh convenience script\n\n\n\nvanity: \xf0\x9f\x8c\x80";
        hasher.update(blob);
        let result = hasher.finalize();
        let hex: String = result.iter().map(|b| format!("{:02x}", b)).collect();

        // Reference from Python hashlib / shasum:
        eprintln!("sha1 crate result: {hex}");
        eprintln!("blob len: {}", blob.len());
    }

    #[test]
    fn test_end_to_end_internal_hash_matches_git_hash_object() {
        // End-to-end regression test: The tool's internal SHA-1 MUST match
        // what `git hash-object` computes for the same bytes.
        // This test uses the actual HEAD commit from the repo.
        let commit_obj = git_cat_file("HEAD");
        let (static_obj_part, _suffix) = build_static_parts(&commit_obj);

        // Test with nonce 0 (simplest case)
        let nonce: u64 = 0;
        let nonce_len = emoji_byte_count(nonce);
        let mut nonce_buf = [0u8; 64];
        let actual_len = fmt_u64_to_emoji_buf(nonce, &mut nonce_buf);
        assert_eq!(actual_len, nonce_len);

        // Build the complete object (same way as main() line 293)
        let obj: Vec<u8> = [&static_obj_part[..], &nonce_buf[..nonce_len]].concat();

        // Git's SHA-1
        let git_hex = git_hash_object(&obj);

        // Internal SHA-1 (full_sha1_hash)
        let internal_hash = full_sha1_hash(&static_obj_part, &nonce_buf[..nonce_len], b"");
        let internal_hex = hex_encode(&internal_hash);

        // Debug output
        eprintln!("obj len: {}", obj.len());
        eprintln!("static_obj_part len: {}", static_obj_part.len());
        eprintln!("nonce_len: {}", nonce_len);
        eprintln!("git_hex:      {}", git_hex);
        eprintln!("internal_hex: {}", internal_hex);

        // Also compute with raw Sha1 hasher for comparison
        let mut hasher = Sha1::new();
        let blob_header = format!("commit {}\0", obj.len());
        hasher.update(blob_header.as_bytes());
        hasher.update(&obj);
        let raw_result = hasher.finalize();
        let raw_hex = hex_encode(&raw_result);
        eprintln!("raw_hex:      {}", raw_hex);

        // And what full_sha1_hash computes as header:
        let full_obj_len = static_obj_part.len() + nonce_len; // + suffix.len()=0
        eprintln!("full_sha1_hash obj_len: {} (should be {})", full_obj_len, obj.len());

        assert_eq!(
            internal_hex, git_hex,
            "SHA-1 mismatch for nonce {nonce}"
        );
    }

    #[test]
    fn test_hotloop_simulation_large_nonces_match_full_hash() {
        // Simulate the EXACT hot loop logic for a thread starting at a large nonce.
        // This catches bugs in tail_buf management, nonce_offset caching, etc.
        let static_obj_part = b"tree bb3248ab076c5113cb67768f1ba28efa97ebd515\n\
            parent 133731173c96b066a198d12ce615309756254079\n\
            author Manuel <baslr@users.noreply.github.com> 1775434871 +0200\n\
            committer Manuel <baslr@users.noreply.github.com> 1775435481 +0200\n\
            \n\
            Add vanity-commit.sh convenience script\n\
            \n\
            \n\
            \n\
            vanity: ";

        // Simulate initial midstate (computed in main() for nonce_len=4)
        let initial_nonce_len = emoji_byte_count(0); // 4
        let obj_len_for_initial = static_obj_part.len() + initial_nonce_len;

        let mut header_buf = [0u8; 30];
        header_buf[..7].copy_from_slice(b"commit ");
        let digits = fmt_u64_to_buf(obj_len_for_initial as u64, &mut header_buf[7..]);
        let header_len = 7 + digits;
        header_buf[header_len] = 0;
        let header_total = header_len + 1;

        let mut shared_prefix = Vec::with_capacity(header_total + static_obj_part.len());
        shared_prefix.extend_from_slice(&header_buf[..header_total]);
        shared_prefix.extend_from_slice(static_obj_part);

        let midstate_blocks = shared_prefix.len() / SHA1_BLOCK_SIZE;
        let midstate_byte_count = midstate_blocks * SHA1_BLOCK_SIZE;
        let initial_midstate = compute_midstate(&shared_prefix[..midstate_byte_count]);
        let tail_prefix_bytes = shared_prefix[midstate_byte_count..].to_vec();

        // Simulate thread 8 of 16 (starts at huge nonce)
        let num_cores = 16usize;
        let range_per_thread = u64::MAX / num_cores as u64;
        let tid = 8;
        let my_start = tid as u64 * range_per_thread;

        // ── Thread init (copy of hot loop setup) ──
        let mut nonce_buf = [0u8; 64];
        let mut tail_buf = [0u8; SHA1_BLOCK_SIZE * 2 + 64];

        let mut current_midstate = initial_midstate;
        let mut current_midstate_byte_count = midstate_byte_count;
        let mut current_tail_prefix = tail_prefix_bytes.clone();
        let mut current_nonce_len = emoji_byte_count(my_start);

        if current_nonce_len != initial_nonce_len {
            recompute_midstate_for_nonce_len(
                static_obj_part,
                current_nonce_len,
                &mut current_midstate,
                &mut current_midstate_byte_count,
                &mut current_tail_prefix,
            );
        }

        let mut nonce_offset = current_tail_prefix.len();
        tail_buf[..nonce_offset].copy_from_slice(&current_tail_prefix);

        // ── Simulate first 100 iterations ──
        for i in 0..100u64 {
            let nonce = my_start + i;
            let nonce_len = fmt_u64_to_emoji_buf(nonce, &mut nonce_buf);

            let digest = if nonce_len != current_nonce_len {
                current_nonce_len = nonce_len;
                recompute_midstate_for_nonce_len(
                    static_obj_part, current_nonce_len,
                    &mut current_midstate, &mut current_midstate_byte_count,
                    &mut current_tail_prefix,
                );
                nonce_offset = current_tail_prefix.len();
                tail_buf[..nonce_offset].copy_from_slice(&current_tail_prefix);
                let tail_data_len = nonce_offset + nonce_len;
                tail_buf[nonce_offset..nonce_offset + nonce_len]
                    .copy_from_slice(&nonce_buf[..nonce_len]);
                let total_msg_len = current_midstate_byte_count + tail_data_len;
                finalize_sha1_with_midstate(
                    &current_midstate, &tail_buf[..tail_data_len], total_msg_len as u64,
                )
            } else {
                let tail_data_len = nonce_offset + nonce_len;
                tail_buf[nonce_offset..nonce_offset + nonce_len]
                    .copy_from_slice(&nonce_buf[..nonce_len]);
                let total_msg_len = current_midstate_byte_count + tail_data_len;
                finalize_sha1_with_midstate(
                    &current_midstate, &tail_buf[..tail_data_len], total_msg_len as u64,
                )
            };

            // Compare with full_sha1_hash reference
            let reference = full_sha1_hash(static_obj_part, &nonce_buf[..nonce_len], b"");
            assert_eq!(
                digest, reference,
                "hot loop diverges at nonce {} (offset +{i}): loop={} full={}",
                nonce, hex_encode(&digest), hex_encode(&reference)
            );
        }
    }

    #[test]
    fn test_midstate_large_nonce_matches_full_hash_real_commit() {
        // Regression test: The lock-free refactoring introduced a bug where
        // threads with large nonces (8 emojis = 32 bytes) computed wrong SHA-1
        // hashes via the midstate path. The tool reported finding hash 133731173...
        // but git hash-object produced 75d748f... for the same object.
        //
        // This test uses the exact commit data from the real failure.
        let static_obj_part = b"tree bb3248ab076c5113cb67768f1ba28efa97ebd515\n\
            parent 133731173c96b066a198d12ce615309756254079\n\
            author Manuel <baslr@users.noreply.github.com> 1775434871 +0200\n\
            committer Manuel <baslr@users.noreply.github.com> 1775435481 +0200\n\
            \n\
            Add vanity-commit.sh convenience script\n\
            \n\
            \n\
            \n\
            vanity: ";

        // Nonce 9223372037001620398 = 8 emojis = 32 bytes
        let nonce: u64 = 9223372037001620398;
        let nonce_len = emoji_byte_count(nonce);
        assert_eq!(nonce_len, 32, "this nonce should be 8 emojis (32 bytes)");

        let mut nonce_buf = [0u8; 64];
        let actual_len = fmt_u64_to_emoji_buf(nonce, &mut nonce_buf);
        assert_eq!(actual_len, 32);

        // Full SHA-1 via full_sha1_hash (reference, known correct)
        let full_hash = full_sha1_hash(static_obj_part, &nonce_buf[..nonce_len], b"");

        // Midstate path (what the hot loop does)
        let mut midstate = [0u32; 5];
        let mut midstate_bc = 0usize;
        let mut tail_prefix = Vec::new();
        recompute_midstate_for_nonce_len(
            static_obj_part, nonce_len,
            &mut midstate, &mut midstate_bc, &mut tail_prefix,
        );

        let mut tail_buf = vec![0u8; tail_prefix.len() + nonce_len];
        tail_buf[..tail_prefix.len()].copy_from_slice(&tail_prefix);
        tail_buf[tail_prefix.len()..].copy_from_slice(&nonce_buf[..nonce_len]);
        let total_msg_len = midstate_bc + tail_buf.len();
        let midstate_hash = finalize_sha1_with_midstate(
            &midstate,
            &tail_buf,
            total_msg_len as u64,
        );

        assert_eq!(
            midstate_hash, full_hash,
            "midstate path diverges from full hash for large nonce!\n  midstate: {}\n  full:     {}",
            hex_encode(&midstate_hash),
            hex_encode(&full_hash)
        );

        // The full hash should NOT start with 133731173 — that was the bogus result
        let full_hex = hex_encode(&full_hash);
        assert!(
            !full_hex.starts_with("133731173"),
            "this nonce should NOT produce a 133731173 prefix (that was the bug)"
        );
    }
}
