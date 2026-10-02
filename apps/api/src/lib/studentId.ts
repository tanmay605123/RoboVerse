import QRCode from 'qrcode';
import crypto from 'crypto';
import { ENV } from '../config/env';

export interface GeneratedStudentIdData {
  studentId: string;
  verificationHash: string;
  qrCodeDataUrl: string;
  verificationUrl: string;
  issuedAt: Date;
  validUntil: Date;
}

export async function generateStudentIdRecord(
  sequenceNumber: number,
  year = 2026
): Promise<GeneratedStudentIdData> {
  const paddedSeq = sequenceNumber.toString().padStart(6, '0');
  const studentId = `RV-${year}-${paddedSeq}`;

  // Cryptographic hash for verification
  const verificationHash = crypto
    .createHmac('sha256', ENV.JWT_ACCESS_SECRET)
    .update(`${studentId}:${Date.now()}`)
    .digest('hex')
    .slice(0, 24);

  const verificationUrl = `${ENV.CLIENT_WEB_URL}/verify/student/${studentId}?hash=${verificationHash}`;

  // Generate high-resolution QR code
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#07110D', // dark green/black
      light: '#39FF6A', // neon green
    },
    width: 300,
  });

  const issuedAt = new Date();
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 4); // 4-year validity by default

  return {
    studentId,
    verificationHash,
    qrCodeDataUrl,
    verificationUrl,
    issuedAt,
    validUntil,
  };
}

export async function generateCertificateQrCode(
  certificateNumber: string
): Promise<{ qrCodeDataUrl: string; verificationUrl: string }> {
  const verificationUrl = `${ENV.CLIENT_WEB_URL}/verify/certificate/${certificateNumber}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#07110D',
      light: '#7FE7D6', // teal robot highlight for certificates
    },
    width: 300,
  });

  return { qrCodeDataUrl, verificationUrl };
}
