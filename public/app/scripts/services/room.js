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

    function createPeerConnection(id) {
      var pc = peerConnections[id] || new RTCPeerConnection(iceConfig);
      peerConnections[id] = pc;
      pc.onicecandidate = function (evnt) {
        socket.emit('msg', { by: currentId, peerid: id, room: roomId, ice: evnt.candidate, type: 'ice' });
      };
      pc.onaddstream = function (evnt) {
        api.trigger('peer.stream', {
          id: id,
          stream: evnt.stream
        });
      };
      return pc;
    }

    function makeOffer(id) {
      var pc = createPeerConnection();
      pc.createOffer(function (sdp) {
        pc.setLocalDescription(sdp);
        socket.emit('msg', { by: currentId, peerid: id, sdp: sdp, type: 'sdp-offer' });
      }, null,
      {'mandatory': { 'OfferToReceiveVideo': true, 'OfferToReceiveAudio': true }});
    }

    function handleMessage(data) {
      var pc = createPeerConnection(data.by);
      switch (data.type) {
        case 'sdp-offer':
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          pc.createAnswer(function (sdp) {
            pc.setLocalDescription(sdp);
            socket.emit('msg', { by: currentId, peerid: data.by, room: roomId, sdp: sdp, type: 'sdp-answer' });
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
      socket.on('peer.disconnected', api.trigger.bind('peer.disconnected'));
      socket.on('msg', function (data) {
        handleMessage(data);
      });
    }

    var api = {
      joinRoom: function (roomId) {
        if (!connected) {
          socket.emit('init', { room: roomId }, function (roomid, id) {
            currentId = id;
            roomId = roomId;
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
