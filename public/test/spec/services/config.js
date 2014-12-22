'use strict';

describe('Service: config', function () {

  // load the service's module
  beforeEach(module('publicApp'));

  // instantiate service
  var config;
  beforeEach(inject(function (_config_) {
    config = _config_;
  }));

  it('should do something', function () {
    expect(!!config).toBe(true);
  });

});
