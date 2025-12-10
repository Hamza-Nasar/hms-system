import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return new Response(
    JSON.stringify({ 
      message: 'Socket.io server endpoint',
      note: 'For full real-time functionality, use the custom server: npm run dev:server'
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function POST(req: NextRequest) {
  return new Response(
    JSON.stringify({ 
      message: 'Socket.io server endpoint',
      note: 'For full real-time functionality, use the custom server: npm run dev:server'
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
