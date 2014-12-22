'use strict';

/**
 * @ngdoc function
 * @name publicApp.controller:RoomCtrl
 * @description
 * # RoomCtrl
 * Controller of the publicApp
 */
angular.module('publicApp')
  .controller('RoomCtrl', function (VideoStream, $location, $routeParams, $scope, Room) {
    VideoStream.get()
    .then(function (stream) {
      Room.init(stream);
      if (!$routeParams.roomId) {
        Room.createRoom()
        .then(function (roomId) {
          $location.path('/room/' + roomId);
        });
      } else {
        Room.joinRoom(parseInt($routeParams.roomId, 10));
      }
    });
    $scope.streams = [];
    Room.on('peer.stream', function (peer) {
      $scope.streams.push({
        id: peer.id,
        stream: URL.createObjectURL(peer.stream)
      });
    });
    Room.on('peer.disconnected', function (peer) {
      $scope.streams = $scope.streams.filter(function (p) {
        return p.id !== peer.id;
      });
    });
  });
