import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app';
import { ENV } from './config/env';

const server = http.createServer(app);

// Initialize Socket.io for real-time live classes, simulator sync, and notifications
export const io = new SocketIOServer(server, {
  cors: {
    origin: [ENV.CLIENT_WEB_URL, ENV.CLIENT_MOBILE_URL, 'http://localhost:3000', 'http://localhost:8081'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`🔌 Client connected to Socket.io: ${socket.id}`);
  }

  // Join circuit simulator room
  socket.on('join_project', (projectId: string) => {
    socket.join(`project:${projectId}`);
    socket.emit('joined_project', { projectId, status: 'ready' });
  });

  // Simulator component update broadcast
  socket.on('simulator_sync', (data: { projectId: string; state: any }) => {
    socket.to(`project:${data.projectId}`).emit('simulator_updated', data);
  });

  // Join live class room
  socket.on('join_live_class', (classId: string) => {
    socket.join(`class:${classId}`);
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(ENV.PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                  🤖 ROBOVERSE API SERVER                     ║
║              Learn it. Build it. Simulate it.                ║
╠═══════════════════════════════════════════════════════════════╣
║  🌐 Server URL:        http://localhost:${ENV.PORT}                  ║
║  📄 Swagger API Docs:  http://localhost:${ENV.PORT}/api/docs         ║
║  📊 Health Check:      http://localhost:${ENV.PORT}/api/health       ║
║  ⚙️  Environment:       ${ENV.NODE_ENV.padEnd(30)}║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });
}

// Graceful shutdown
const shutdown = () => {
  console.log('Stopping RoboVerse API server gracefully...');
  server.close(() => {
    console.log('RoboVerse API stopped.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { server };
