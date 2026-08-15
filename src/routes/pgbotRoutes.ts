import { Router } from 'express';
import { spawn } from 'child_process';
import { AppError } from '../utils/errors.js';

const router = Router();

// Helper to run pgbot CLI commands
function runPgbotCommand(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const pgbot = spawn('pgbot', args, {
      env: { ...process.env },
      timeout: 30000,
    });

    let stdout = '';
    let stderr = '';

    pgbot.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pgbot.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pgbot.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new AppError(500, 'PGBOT_ERROR', `pgbot exited with code ${code}: ${stderr}`));
      }
    });

    pgbot.on('error', (err) => {
      reject(new AppError(500, 'PGBOT_NOT_FOUND', 'pgbot CLI not found. Install from https://pgbot.dev'));
    });
  });
}

// Health check / inspect
router.get('/inspect', async (req, res, next) => {
  try {
    const output = await runPgbotCommand(['inspect', '--json']);
    res.json(JSON.parse(output));
  } catch (error) {
    next(error);
  }
});

// Index analysis
router.get('/indexes', async (req, res, next) => {
  try {
    const output = await runPgbotCommand(['indexes', '--json']);
    res.json(JSON.parse(output));
  } catch (error) {
    next(error);
  }
});

// Query analysis
router.get('/queries', async (req, res, next) => {
  try {
    const output = await runPgbotCommand(['queries', '--json']);
    res.json(JSON.parse(output));
  } catch (error) {
    next(error);
  }
});

// Vacuum health
router.get('/vacuum', async (req, res, next) => {
  try {
    const output = await runPgbotCommand(['vacuum', '--json']);
    res.json(JSON.parse(output));
  } catch (error) {
    next(error);
  }
});

export default router;
