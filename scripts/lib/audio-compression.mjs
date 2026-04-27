import { mkdtemp, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const BITRATE_TOLERANCE = 4000;

export async function compressSpeechMp3(filePath, { bitrate = '64k', sampleRate = '44100' } = {}) {
  const targetBitrate = parseBitrate(bitrate);
  const targetSampleRate = Number(sampleRate);
  const audio = await probeAudio(filePath);

  if (isTargetSpeechMp3(audio, { targetBitrate, targetSampleRate })) {
    return { skipped: true, reason: 'already-compressed' };
  }

  const tempDir = await mkdtemp(path.join(path.dirname(filePath), '.radar-audio-'));
  const tempPath = path.join(tempDir, path.basename(filePath));

  try {
    await runCommand('ffmpeg', [
      '-y',
      '-loglevel',
      'error',
      '-i',
      filePath,
      '-vn',
      '-ac',
      '1',
      '-ar',
      sampleRate,
      '-c:a',
      'libmp3lame',
      '-b:a',
      bitrate,
      '-map_metadata',
      '0',
      '-id3v2_version',
      '3',
      tempPath,
    ]);

    await rename(tempPath, filePath);
    return { skipped: false };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function probeAudio(filePath) {
  const { stdout } = await runCommand('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=format_name,bit_rate',
    '-show_entries',
    'stream=codec_name,sample_rate,channels,bit_rate',
    '-of',
    'json',
    filePath,
  ]);
  const payload = JSON.parse(stdout);
  const stream = payload.streams?.find((item) => item.codec_name) ?? {};

  return {
    codecName: stream.codec_name,
    sampleRate: Number(stream.sample_rate),
    channels: Number(stream.channels),
    bitRate: Number(stream.bit_rate ?? payload.format?.bit_rate),
  };
}

function isTargetSpeechMp3(audio, { targetBitrate, targetSampleRate }) {
  return (
    audio.codecName === 'mp3' &&
    audio.channels === 1 &&
    audio.sampleRate === targetSampleRate &&
    Math.abs(audio.bitRate - targetBitrate) <= BITRATE_TOLERANCE
  );
}

function parseBitrate(value) {
  const match = String(value).match(/^(\d+)(k)?$/i);

  if (!match) {
    throw new Error(`Unsupported audio bitrate: ${value}`);
  }

  return Number(match[1]) * (match[2] ? 1000 : 1);
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error(`Missing required command \`${command}\`. Install ffmpeg and try again.`));
        return;
      }

      reject(error);
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}
