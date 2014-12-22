'use strict';

describe('Controller: HomectrlCtrl', function () {

  // load the controller's module
  beforeEach(module('publicApp'));

  var HomectrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HomectrlCtrl = $controller('HomectrlCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
