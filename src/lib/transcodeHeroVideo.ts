/**
 * Client-side hero-video transcoder using ffmpeg.wasm (single-threaded build).
 *
 * Enforces the standard hero-loop spec so every video uploaded via
 * /admin/videos lands on disk the same shape:
 *
 *   Container  : MP4 (H.264, no audio)
 *   Resolution : 1280x720 max (scale down only, preserve aspect, pad to even)
 *   Frame rate : 24 fps
 *   Bitrate    : CRF 30, x264 preset slow → typically 800–1500 kbps
 *   Duration   : trimmed to 10s
 *   Audio      : stripped (-an)
 *   Faststart  : moov atom moved to front for instant playback
 *
 * Equivalent CLI:
 *   ffmpeg -i input -vf "scale=1280:-2,fps=24"
 *     -c:v libx264 -profile:v main -preset slow -crf 30 -pix_fmt yuv420p
 *     -movflags +faststart -an -t 10 hero-720p.mp4
 *
 * Notes:
 * - Single-threaded core works without SharedArrayBuffer (no COOP/COEP needed).
 * - ffmpeg is lazy-loaded (~30 MB wasm) on first transcode only.
 * - Caller can subscribe to progress (0–1) for UI.
 */
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegSingleton: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

const CORE_VERSION = "0.12.10";
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegSingleton) return ffmpegSingleton;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ff = new FFmpeg();
    // Optional: surface log lines in dev for debugging
    if (import.meta.env.DEV) {
      ff.on("log", ({ message }) => console.debug("[ffmpeg]", message));
    }
    await ff.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${CORE_BASE}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });
    ffmpegSingleton = ff;
    return ff;
  })();

  return loadPromise;
}

export interface TranscodeOptions {
  /** Called with progress 0–1 as ffmpeg encodes. */
  onProgress?: (progress: number) => void;
  /** Max duration in seconds (default 10). */
  maxDurationSec?: number;
  /** Max width in px (default 1280). */
  maxWidth?: number;
  /** Target fps (default 24). */
  fps?: number;
  /** x264 CRF (default 30 — lower = larger/higher quality). */
  crf?: number;
}

export interface TranscodeResult {
  /** Optimized MP4 blob, audio stripped, faststart enabled. */
  blob: Blob;
  /** Output size in bytes. */
  sizeBytes: number;
  /** Original input size in bytes (for before/after reporting). */
  inputSizeBytes: number;
  /** A File you can drop straight into the existing upload pipeline. */
  file: File;
}

/**
 * Transcode any browser-accepted video file (mp4/webm/mov) into the
 * standard hero-loop MP4. Designed to be a drop-in replacement for the
 * original File in the upload flow.
 */
export async function transcodeHeroVideo(
  input: File | Blob,
  desiredFileName: string,
  opts: TranscodeOptions = {},
): Promise<TranscodeResult> {
  const {
    onProgress,
    maxDurationSec = 10,
    maxWidth = 1280,
    fps = 24,
    crf = 30,
  } = opts;

  const ff = await getFFmpeg();

  const inputSizeBytes = input.size;
  // Pick an input extension ffmpeg can route — actual demuxer is content-based.
  const inputName = "input.bin";
  const outputName = "output.mp4";

  const progressHandler = ({ progress }: { progress: number }) => {
    if (!onProgress) return;
    // ffmpeg sometimes overshoots 1.0 near the end; clamp.
    onProgress(Math.max(0, Math.min(1, progress)));
  };
  ff.on("progress", progressHandler);

  try {
    await ff.writeFile(inputName, await fetchFile(input));

    // scale=min(maxWidth,iw):-2 → only downscale, never upscale; force even height.
    const vf = `scale='min(${maxWidth},iw)':-2,fps=${fps}`;

    const args = [
      "-i", inputName,
      "-vf", vf,
      "-c:v", "libx264",
      "-profile:v", "main",
      "-preset", "veryfast", // wasm is ~10× slower than native; "slow" is impractical client-side
      "-crf", String(crf),
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-an",
      "-t", String(maxDurationSec),
      "-y",
      outputName,
    ];

    await ff.exec(args);

    const data = await ff.readFile(outputName);
    const outputBuffer =
      data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
    const blob = new Blob([outputBuffer], { type: "video/mp4" });

    // Best-effort cleanup so the in-memory FS doesn't grow across runs.
    try {
      await ff.deleteFile(inputName);
      await ff.deleteFile(outputName);
    } catch {
      /* ignore */
    }

    const baseName = desiredFileName.replace(/\.[^.]+$/, "");
    const file = new File([blob], `${baseName}-720p.mp4`, { type: "video/mp4" });

    return {
      blob,
      file,
      sizeBytes: blob.size,
      inputSizeBytes,
    };
  } finally {
    ff.off("progress", progressHandler);
  }
}

/** Human-readable MB string for toast messages. */
export function formatMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
