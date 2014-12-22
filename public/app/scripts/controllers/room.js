'use strict';

/**
 * @ngdoc function
 * @name publicApp.controller:RoomCtrl
 * @description
 * # RoomCtrl
 * Controller of the publicApp
 */
angular.module('publicApp')
  .controller('RoomCtrl', function ($location, $routeParams, $scope, Room) {
    if (!$routeParams.roomId) {
      Room.createRoom()
      .then(function (roomId) {
        $location.path('/room/' + roomId);
      });
    }
  });
