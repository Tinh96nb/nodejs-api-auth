import * as  crypto from 'crypto';

export function md5(data: any): string {
  return crypto.createHash('md5').update(data, 'utf8').digest("hex");
}

export function sha256(data: any): string{
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}