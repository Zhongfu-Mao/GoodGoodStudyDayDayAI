import { stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';

export async function getAudioFileMetadata(filePath) {
  const [file, probe] = await Promise.all([stat(filePath), probeAudioDuration(filePath)]);

  return {
    duration: probe.duration,
    size: file.size,
  };
}

async function probeAudioDuration(filePath) {
  const { stdout } = await runCommand('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'json',
    filePath,
  ]);
  const payload = JSON.parse(stdout);
  const duration = Math.round(Number(payload.format?.duration));

  return {
    duration: Number.isFinite(duration) && duration > 0 ? duration : null,
  };
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
