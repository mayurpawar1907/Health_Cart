import { BadRequestException, Injectable } from '@nestjs/common';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';
import { randomBytes } from 'crypto';

const ALLOWED_EXT = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt']);
const MAX_BYTES = 10 * 1024 * 1024;

@Injectable()
export class StorageService {
  private readonly root = join(process.cwd(), 'uploads');

  ensureDir(subdir: string) {
    const dir = join(this.root, subdir);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  saveReportFile(file: Express.Multer.File, appointmentId: string) {
    if (!file?.buffer?.length) {
      throw new BadRequestException({ message: 'Report file is required', error: 'FILE_REQUIRED' });
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException({ message: 'File must be under 10 MB', error: 'FILE_TOO_LARGE' });
    }

    const ext = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      throw new BadRequestException({
        message: 'Allowed formats: PDF, PNG, JPG, WEBP, TXT',
        error: 'INVALID_FILE_TYPE',
      });
    }

    const safeBase = basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]+/g, '-').slice(0, 60);
    const token = randomBytes(4).toString('hex');
    const storedName = `${appointmentId}-${Date.now()}-${token}-${safeBase}${ext}`;
    const dir = this.ensureDir('reports');
    const absolutePath = join(dir, storedName);

    writeFileSync(absolutePath, file.buffer);

    return {
      storagePath: join('reports', storedName),
      fileName: file.originalname,
      fileMimeType: file.mimetype || 'application/octet-stream',
      fileSize: file.size,
    };
  }

  resolveAbsolute(storagePath: string) {
    const normalized = storagePath.replace(/\\/g, '/').replace(/^\/+/, '');
    if (normalized.includes('..')) {
      throw new BadRequestException({ message: 'Invalid file path', error: 'INVALID_PATH' });
    }
    return join(this.root, normalized);
  }
}
