'use strict';

/**
 * @ngdoc directive
 * @name publicApp.directive:VideoPlayer
 * @description
 * # VideoPlayer
 */
angular.module('publicApp')
  .directive('videoPlayer', function ($sce) {
    return {
      template: '<video ng-src="{{trustSrc()}}" autoplay></video>',
      restrict: 'E',
      replace: true,
      scope: {
        vidSrc: '@'
      },
      link: function (scope) {
        console.log('Initializing video-player');
        scope.trustSrc = function () {
          if (!scope.vidSrc) {
            return undefined;
          }
          return $sce.trustAsResourceUrl(scope.vidSrc);
        };
      }
    };
  });
