'use strict';

/**
 * @ngdoc service
 * @name publicApp.Room
 * @description
 * # Room
 * Factory in the publicApp.
 */
angular.module('publicApp')
  .factory('Room', function ($q, Io, config) {
    var socket = Io.connect(config.SIGNALIG_SERVER_URL),
        connected = false;
    return {
      joinRoom: function (roomId) {
        if (!connected) {
          socket.emit('init', { room: roomId });
          connected = true;
        }
      },
      createRoom: function () {
        var d = $q.defer();
        socket.emit('init', null, function (roomId) {
          d.resolve(roomId);
          connected = true;
        });
        return d.promise;
      }
    };
  });
