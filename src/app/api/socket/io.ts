// Socket.io API route handler
// This is used when running with standard Next.js (without custom server)
// For full functionality, use the custom server (npm run dev:server)

import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return new Response(
    JSON.stringify({
      message: 'Socket.io server',
      note: 'For full real-time functionality, use the custom server: npm run dev:server',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}




