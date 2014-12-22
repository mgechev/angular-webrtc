'use strict';

describe('Directive: VideoPlayer', function () {

  // load the directive's module
  beforeEach(module('publicApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<-video-player></-video-player>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the VideoPlayer directive');
  }));
});
