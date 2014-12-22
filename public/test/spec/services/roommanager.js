'use strict';

describe('Service: RoomManager', function () {

  // load the service's module
  beforeEach(module('publicApp'));

  // instantiate service
  var RoomManager;
  beforeEach(inject(function (_RoomManager_) {
    RoomManager = _RoomManager_;
  }));

  it('should do something', function () {
    expect(!!RoomManager).toBe(true);
  });

});
