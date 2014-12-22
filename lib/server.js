var express = require('express'),
    expressApp = express(),
    socketio = require('socket.io'),
    http = require('http'),
    server = http.createServer(expressApp),
    rooms = {},
    roomId = 0;

expressApp.use(express.static(__dirname + '/../public'));

expressApp.get('/', function (req, res) {
  return res.redirect(302, '/chat.html?room=' + roomId++);
});


exports.run = function (config) {

  server.listen(config.PORT);
  console.log('Listening on', config.PORT);
  socketio.listen(server, { log: false })
  .sockets.on('connection', function (socket) {

    var socketRoom;

    socket.on('init', function (data) {
      socketRoom = data.room;
      var room = rooms[socketRoom];
      if (!room) {
        rooms[socketRoom] = [socket];
      } else {
        room.forEach(function (s) {
          s.emit('peer.connected');
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
  });

};
