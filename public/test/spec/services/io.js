'use strict';

describe('Service: Io', function () {

  // load the service's module
  beforeEach(module('publicApp'));

  // instantiate service
  var Io;
  beforeEach(inject(function (_Io_) {
    Io = _Io_;
  }));

  it('should do something', function () {
    expect(!!Io).toBe(true);
  });

});
