import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      messagesUsed: 2,
      messagesLimit: 20,
      messagesRemaining: 18,
      photosUsed: 0,
      photosLimit: 3,
      photosRemaining: 3,
      planTier: 'free',
    },
  });
}
