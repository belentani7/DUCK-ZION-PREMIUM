// BELENTANI OMEGA ULTRA
// Autoría: Pedro Belentani
// Fecha: 2026-08-14
import { Server } from 'socket.io';

const allowedOrigins = (process.env.CHAT_ORIGINS || 'http://127.0.0.1:3000,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server({
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

const userSockets = new Map<string, string>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register', (userId: string) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('send-message', (data: { message: unknown; recipientId: string }) => {
    const recipientSocketId = userSockets.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new-message', data.message);
    }
  });

  socket.on('typing', (data: { userId: string; recipientId: string; isTyping: boolean }) => {
    const recipientSocketId = userSockets.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user-typing', {
        userId: data.userId,
        isTyping: data.isTyping,
      });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = Number(process.env.CHAT_PORT || 3004);
io.listen(PORT);
console.log(`Chat service running on port ${PORT}`);
