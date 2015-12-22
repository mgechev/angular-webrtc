/* global RTCIceCandidate, RTCSessionDescription, RTCPeerConnection, EventEmitter */
'use strict';

/**
 * @ngdoc service
 * @name publicApp.Room
 * @description
 * # Room
 * Factory in the publicApp.
 */
angular.module('publicApp')
  .factory('Room', function ($rootScope, $q, Io, config) {

    var iceConfig = { 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]},
        peerConnections = {},
        currentId, roomId,
        stream;

    function getPeerConnection(id) {
      if (peerConnections[id]) {
        return peerConnections[id];
      }
      var pc = new RTCPeerConnection(iceConfig);
      peerConnections[id] = pc;
      pc.addStream(stream);
      pc.onicecandidate = function (evnt) {
        socket.emit('msg', { by: currentId, to: id, ice: evnt.candidate, type: 'ice' });
      };
      pc.onaddstream = function (evnt) {
        console.log('Received new stream');
        api.trigger('peer.stream', [{
          id: id,
          stream: evnt.stream
        }]);
        if (!$rootScope.$$digest) {
          $rootScope.$apply();
        }
      };
      return pc;
    }

    function makeOffer(id) {
      var pc = getPeerConnection(id);
      pc.createOffer(function (sdp) {
        pc.setLocalDescription(sdp);
        console.log('Creating an offer for', id);
        socket.emit('msg', { by: currentId, to: id, sdp: sdp, type: 'sdp-offer' });
      }, function (e) {
        console.log(e);
      },
      { mandatory: { offerToReceiveVideo: true, offerToReceiveAudio: true }});
    }

    function handleMessage(data) {
      var pc = getPeerConnection(data.by);
      switch (data.type) {
        case 'sdp-offer':
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            console.log('Setting remote description by offer');
            pc.createAnswer(function (sdp) {
              pc.setLocalDescription(sdp);
              socket.emit('msg', { by: currentId, to: data.by, sdp: sdp, type: 'sdp-answer' });
            }, function (e) {
              console.log(e);
            });
          }, function (e) {
            console.log(e);
          });
          break;
        case 'sdp-answer':
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            console.log('Setting remote description by answer');
          }, function (e) {
            console.error(e);
          });
          break;
        case 'ice':
          if (data.ice) {
            console.log('Adding ice candidates');
            pc.addIceCandidate(new RTCIceCandidate(data.ice));
          }
          break;
      }
    }

    var socket = Io.connect(config.SIGNALIG_SERVER_URL),
        connected = false;

    function addHandlers(socket) {
      socket.on('peer.connected', function (params) {
        makeOffer(params.id);
      });
      socket.on('peer.disconnected', function (data) {
        api.trigger('peer.disconnected', [data]);
        if (!$rootScope.$$digest) {
          $rootScope.$apply();
        }
      });
      socket.on('msg', function (data) {
        handleMessage(data);
      });
    }

    var api = {
      joinRoom: function (r) {
        if (!connected) {
          socket.emit('init', { room: r }, function (roomid, id) {
            currentId = id;
            roomId = roomid;
          });
          connected = true;
        }
      },
      createRoom: function () {
        var d = $q.defer();
        socket.emit('init', null, function (roomid, id) {
          d.resolve(roomid);
          roomId = roomid;
          currentId = id;
          connected = true;
        });
        return d.promise;
      },
      init: function (s) {
        stream = s;
      }
    };
    EventEmitter.call(api);
    Object.setPrototypeOf(api, EventEmitter.prototype);

    addHandlers(socket);
    return api;
  });
