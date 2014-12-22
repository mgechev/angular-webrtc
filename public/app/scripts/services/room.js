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
        stream;

    peerConnection.onicecandidate = function (evnt) {
      socket.emit('msg', { room: roomId, ice: evnt.candidate, type: 'ice' });
    };

    peerConnection.onaddstream = function (evnt) {
      localVideo.classList.remove('active');
      remoteVideo.src = URL.createObjectURL(evnt.stream);
    };

    function makeOffer(id) {
      var pc = new RTCPeerConnection(iceConfig);
      peerConnections[id] = pc;
      pc.createOffer(function (sdp) {
        pc.setLocalDescription(sdp);
        socket.emit('msg', { peerid: id, sdp: sdp, type: 'sdp-offer' });
      }, null,
      {'mandatory': { 'OfferToReceiveVideo': true, 'OfferToReceiveAudio': true }});
    }

    function handleMessage(data) {
      switch (data.type) {
        case 'sdp-offer':
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        peerConnection.createAnswer(function (sdp) {
          peerConnection.setLocalDescription(sdp);
          socket.emit('msg', { room: roomId, sdp: sdp, type: 'sdp-answer' });
        });
        break;
        case 'sdp-answer':
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        break;
        case 'ice':
        if (data.ice)
          peerConnection.addIceCandidate(new RTCIceCandidate(data.ice));
        break;
      }
    }

    var socket = Io.connect(config.SIGNALIG_SERVER_URL),
        connected = false;

    function addHandlers(socket) {
      socket.on('peer.connected', function (params) {
        makeOffer(params.id);
      });
      socket.on('peer.disconnected', api.trigger.bind('peer.disconnected'));
      socket.on('msg', function (data) {
        handleMessage(data);
      });
    }

    var api = {
      joinRoom: function (roomId) {
        if (!connected) {
          socket.emit('init', { room: roomId });
          connected = true;
        }
      },
      createRoom: function () {
        var d = $q.defer();
        socket.emit('init', null, function (roomId) {
          d.resolve(roomId);
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
