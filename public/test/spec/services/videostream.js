'use strict';

describe('Service: VideoStream', function () {

  // load the service's module
  beforeEach(module('publicApp'));

  // instantiate service
  var VideoStream;
  beforeEach(inject(function (_VideoStream_) {
    VideoStream = _VideoStream_;
  }));

  it('should do something', function () {
    expect(!!VideoStream).toBe(true);
  });

});
