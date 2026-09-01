const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const db = new sqlite3.Database('chat.db');

db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server TEXT,
    channel TEXT,
    username TEXT,
    text TEXT
  )
`);

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join channel', (data) => {
    // A "room" now needs to combine server + channel, since
    // "general" in Server A must be separate from "general" in Server B
    const room = data.server + ':' + data.channel;
    socket.join(room);

    db.all(
      'SELECT server, channel, username, text FROM messages WHERE server = ? AND channel = ? ORDER BY id DESC LIMIT 50',
      [data.server, data.channel],
      (err, rows) => {
        if (err) {
          console.log('Error loading messages:', err);
          return;
        }
        const messages = rows.reverse();
        socket.emit('load messages', messages);
      }
    );
  });

  socket.on('chat message', (data) => {
    console.log('Message received:', data);
    db.run(
      'INSERT INTO messages (server, channel, username, text) VALUES (?, ?, ?, ?)',
      [data.server, data.channel, data.username, data.text]
    );
    const room = data.server + ':' + data.channel;
    io.to(room).emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running! Go to http://localhost:3000 in your browser');
});