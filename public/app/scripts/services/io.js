'use strict';

/**
 * @ngdoc service
 * @name publicApp.Io
 * @description
 * # Io
 * Factory in the publicApp.
 */
angular.module('publicApp')
  .factory('Io', function () {
    if (typeof io === 'undefined') {
      throw new Error('Socket.io required');
    }
    return io;
  });
