var express = require('express'),
    expressApp = express(),
    socketio = require('socket.io'),
    http = require('http'),
    server = http.createServer(expressApp),
    rooms = {},
    roomId = 0,
    userIds = {};

expressApp.use(express.static(__dirname + '/../public/'));

exports.run = function (config) {

  server.listen(config.PORT);
  console.log('Listening on', config.PORT);
  socketio.listen(server, { log: false })
  .on('connection', function (socket) {

    var socketRoom, id;

    socket.on('init', function (data, fn) {
      socketRoom = ({} || data).room || roomId++;
      var room = rooms[socketRoom];
      if (!room) {
        rooms[socketRoom] = [socket];
        userIds[socketRoom] = 0;
        fn(socketRoom);
      } else {
        userIds[socketRoom] += 1;
        id = userIds[socketRoom];
        room.forEach(function (s) {
          s.emit('peer.connected', { id: id });
        });
        room.push(socket);
      }
    });

    socket.on('msg', function (data) {
      var room = socketRoom;
      rooms[room].forEach(function (socket) {
        target.emit('msg', data);
      });
    });

    socket.on('disconnect', function () {
      var room = socketRoom;
      room[socketRoom] = room[socketRoom].filter(function (s) {
        return s !== socket;
      });
      rooms[room].forEach(function (socket) {
        target.emit('peer.disconnected', { id: id });
      });
    });
  });
};
