var express = require('express'),
    expressApp = express(),
    socketio = require('socket.io'),
    http = require('http'),
    server = http.createServer(expressApp),
    rooms = {},
    roomId = 1,
    userIds = {};

expressApp.use(express.static(__dirname + '/../public/'));

exports.run = function (config) {

  server.listen(config.PORT);
  console.log('Listening on', config.PORT);
  socketio.listen(server, { log: false })
  .on('connection', function (socket) {

    var currentRoom, id;

    socket.on('init', function (data, fn) {
      currentRoom = (data || {}).room || roomId++;
      var room = rooms[currentRoom];
      if (!data) {
        rooms[currentRoom] = [socket];
        id = userIds[currentRoom] = 0;
        fn(currentRoom, id);
        console.log('Room created, with #', currentRoom);
      } else {
        if (!room) {
          return;
        }
        userIds[currentRoom] += 1;
        id = userIds[currentRoom];
        fn(currentRoom, id);
        room.forEach(function (s) {
          s.emit('peer.connected', { id: id });
        });
        room.push(socket);
        console.log('Peer connected to room', currentRoom, 'with #', id);
      }
    });

    socket.on('msg', function (data) {
      var to = parseInt(data.to, 10);
      if (rooms[currentRoom] && rooms[currentRoom][to]) {
        console.log('Redirecting message to', to, 'by', data.by);
        rooms[currentRoom][to].emit('msg', data);
      } else {
        console.warn('Invalid user');
      }
    });

    socket.on('disconnect', function () {
      if (!currentRoom || !rooms[currentRoom]) {
        return;
      }
      rooms[currentRoom] = rooms[currentRoom].filter(function (s) {
        return s !== socket;
      });
      rooms[currentRoom].forEach(function (socket) {
        socket.emit('peer.disconnected', { id: id });
      });
    });
  });
};
