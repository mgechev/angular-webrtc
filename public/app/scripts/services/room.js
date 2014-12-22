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
  .factory('Room', function ($q, Io, config) {

    var iceConfig = { 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]},
        peerConnections = {},
        currentId, roomId,
        stream;

    function getPeerConnection(id) {
      if (peerConnections[id]) {
        return peerConnections[id];
      }
      var pc = new RTCPeerConnection(iceConfig);
      pc.addStream(stream);
      peerConnections[id] = pc;
      pc.onicecandidate = function (evnt) {
        socket.emit('msg', { by: currentId, peerid: id, room: roomId, ice: evnt.candidate, type: 'ice' });
      };
      pc.onaddstream = function (evnt) {
        api.trigger('peer.stream', [{
          id: id,
          stream: evnt.stream
        }]);
      };
      return pc;
    }

    function makeOffer(id) {
      var pc = getPeerConnection();
      pc.createOffer(function (sdp) {
        pc.setLocalDescription(sdp);
        socket.emit('msg', { by: currentId, peerid: id, sdp: sdp, type: 'sdp-offer' });
      }, null,
      {'mandatory': { 'OfferToReceiveVideo': true, 'OfferToReceiveAudio': true }});
    }

    function handleMessage(data) {
      var pc = getPeerConnection(data.by);
      switch (data.type) {
        case 'sdp-offer':
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            pc.createAnswer(function (sdp) {
              pc.setLocalDescription(sdp, function () {
                socket.emit('msg', { by: currentId, peerid: data.by, room: roomId, sdp: sdp, type: 'sdp-answer' });
              });
            });
          });
          break;
        case 'sdp-answer':
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          break;
        case 'ice':
          if (data.ice) {
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
        api.trigger.bind('peer.disconnected', [data]);
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
