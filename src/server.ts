import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initializeSocket } from './lib/socket.server';
import { setSocketInstance } from './lib/socket-server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io (async)
  initializeSocket(httpServer).then((io) => {
    // Make io available for API routes
    setSocketInstance(io);
    (global as any).io = io;
  }).catch((err) => {
    console.error('Failed to initialize Socket.io:', err);
    // Continue without Socket.io if it fails
  });

  httpServer
    .once('error', (err: any) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log('> Socket.io server initialized');
      console.log(`> WebSocket endpoint: ws://${hostname}:${port}/api/socket`);
    });
});

