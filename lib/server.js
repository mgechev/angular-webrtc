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

    var currentRoom, id;

    socket.on('init', function (data, fn) {
      currentRoom = ({} || data).room || roomId++;
      var room = rooms[currentRoom];
      if (!room) {
        rooms[currentRoom] = [socket];
        id = userIds[currentRoom] = 0;
        fn(currentRoom, id);
      } else {
        userIds[currentRoom] += 1;
        id = userIds[currentRoom];
        fn(currentRoom, id);
        room.forEach(function (s) {
          s.emit('peer.connected', { id: id });
        });
        room.push(socket);
      }
    });

    socket.on('msg', function (data) {
      var peerid = data.peerid;
      rooms[currentRoom][peerid].emit('msg', data);
    });

    socket.on('disconnect', function () {
      rooms[currentRoom] = rooms[currentRoom].filter(function (s) {
        return s !== socket;
      });
      rooms[currentRoom].forEach(function (socket) {
        target.emit('peer.disconnected', { id: id });
      });
    });
  });
};
