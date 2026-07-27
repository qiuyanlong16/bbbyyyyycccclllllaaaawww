import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const input = process.env.BYCLAW_VIDEO_SRC
  ? resolve(root, process.env.BYCLAW_VIDEO_SRC)
  : resolve(root, 'raw/lxbyznt_home_video.mp4');
const outDir = resolve(root, 'public/videos');
const imgDir = resolve(root, 'public/images');

const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';

// sanity-check the binary is callable
const probe = spawnSync(ffmpeg, ['-version'], { stdio: 'pipe' });
if (probe.status !== 0 || probe.error) {
  console.error(`[prepare-video] 找不到可用的 ffmpeg: ${ffmpeg}`);
  console.error('请安装 ffmpeg（如 winget install Gyan.FFmpeg 或 choco install ffmpeg），或设置 FFMPEG_PATH 指向 ffmpeg.exe。');
  process.exit(1);
}

if (!input || !existsSync(input)) {
  console.error(`[prepare-video] 源视频不存在: ${input}`);
  console.error('请把原片放到 raw/lxbyznt_home_video.mp4，或设 BYCLAW_VIDEO_SRC');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
mkdirSync(imgDir, { recursive: true });

function run(args) {
  console.log(`[prepare-video] ffmpeg ${args.join(' ')}`);
  const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`[prepare-video] 失败 (status=${r.status})`);
    process.exit(r.status ?? 1);
  }
}

// 1) hero loop: 6s, 720p, no audio, faststart
run([
  '-y', '-ss', '0', '-t', '6', '-i', input,
  '-vf', 'scale=1280:-2',
  '-an',
  '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-crf', '24', '-movflags', '+faststart',
  resolve(outDir, 'hero-loop.mp4'),
]);

// 2) full: 720p, audio aac, faststart
run([
  '-y', '-i', input,
  '-vf', 'scale=1280:-2',
  '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '128k', '-crf', '26', '-movflags', '+faststart',
  resolve(outDir, 'hero-full.mp4'),
]);

// 3) poster frame
run([
  '-y', '-ss', '0.5', '-i', input,
  '-vframes', '1', '-q:v', '3',
  resolve(imgDir, 'poster.png'),
]);

console.log('[prepare-video] done.');
