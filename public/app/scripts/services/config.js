'use strict';

/**
 * @ngdoc service
 * @name publicApp.config
 * @description
 * # config
 * Factory in the publicApp.
 */
angular.module('publicApp')
  .factory('config', function () {
    return {
      SIGNALIG_SERVER_URL: 'http://localhost:5555'
    };
  });
