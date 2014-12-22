'use strict';

/**
 * @ngdoc directive
 * @name publicApp.directive:VideoList
 * @description
 * # VideoList
 */
angular.module('publicApp')
  .directive('videoList', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the VideoList directive');
      }
    };
  });
