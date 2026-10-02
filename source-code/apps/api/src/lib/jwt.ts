import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { AuthJwtPayload, AuthTokens } from '@roboverse/shared';

export function signAccessToken(payload: AuthJwtPayload): string {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: (ENV.JWT_ACCESS_EXPIRES_IN || '1h') as any,
  });
}

export function signRefreshToken(payload: AuthJwtPayload): string {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: (ENV.JWT_REFRESH_EXPIRES_IN || '7d') as any,
  });
}

export function verifyAccessToken(token: string): AuthJwtPayload {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as AuthJwtPayload;
}

export function verifyRefreshToken(token: string): AuthJwtPayload {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as AuthJwtPayload;
}

export function generateAuthTokens(payload: AuthJwtPayload): AuthTokens {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600, // 1 hour in seconds
  };
}
