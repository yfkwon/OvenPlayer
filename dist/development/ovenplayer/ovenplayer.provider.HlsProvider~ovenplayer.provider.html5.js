(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["ovenplayer.provider.HlsProvider~ovenplayer.provider.html5"],{

/***/ "./src/js/api/provider/html5/Listener.js":
/*!***********************************************!*\
  !*** ./src/js/api/provider/html5/Listener.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _constants = __webpack_require__(/*! api/constants */ "./src/js/api/constants.js");

/**
 * @brief   Trigger on various video events.
 * @param   element elVideo  video
 * @param   Provider provider  html5Provider
 * @param   function provider  html5Provider
 * */

var Listener = function Listener(elVideo, provider, errorCallback) {
    var lowLevelEvents = {};

    var that = {};
    var between = function between(num, min, max) {
        return Math.max(Math.min(num, max), min);
    };

    //Fires when the browser can start playing the audio/video
    lowLevelEvents.canplay = function () {
        provider.setCanSeek(true);
        provider.trigger(_constants.CONTENT_BUFFER_FULL);
    };
    //Fires when the duration of the audio/video is changed
    lowLevelEvents.durationchange = function () {
        lowLevelEvents.progress();
    };
    //Fires when the current playlist is ended
    lowLevelEvents.ended = function () {

        if (provider.getState() != _constants.STATE_IDLE && provider.getState() != _constants.STATE_COMPLETE) {
            provider.trigger(_constants.CONTENT_COMPLETE);
            provider.setState(_constants.STATE_COMPLETE);
        }
    };
    //Fires when the browser has loaded the current frame of the audio/video
    lowLevelEvents.loadeddata = function () {
        //loadedmetadata와 혼돈이 올 수 있으니 아무것도 하지 말즈아
        /*OvenPlayerConsole.log("loadeddata");
        var metadata = {
            duration: elVideo.duration,
            height: elVideo.videoHeight,
            width: elVideo.videoWidth
        };
        //provider.trigger(CONTENT_META, metadata);*/
    };
    //Fires when the browser has loaded meta data for the audio/video
    lowLevelEvents.loadedmetadata = function () {
        var metadata = {
            duration: elVideo.duration,
            height: elVideo.videoHeight,
            width: elVideo.videoWidth,
            type: provider.getCurrentSource() ? provider.getCurrentSource().type : ""
        };
        provider.trigger(_constants.CONTENT_META, metadata);
    };
    //Fires when the audio/video has been paused
    lowLevelEvents.pause = function () {
        if (provider.getState() === _constants.STATE_COMPLETE || provider.getState() === _constants.STATE_ERROR) {
            return false;
        }
        if (elVideo.ended) {
            return false;
        }
        if (elVideo.error) {
            return false;
        }
        if (elVideo.currentTime === elVideo.duration) {
            return false;
        }
        provider.setState(_constants.STATE_PAUSED);
    };
    //Fires when the audio/video has been started or is no longer paused
    lowLevelEvents.play = function () {
        if (!elVideo.paused && provider.getState() !== _constants.STATE_PLAYING) {
            provider.setState(_constants.STATE_LOADING);
        }
    };
    //Fires when the audio/video is playing after having been paused or stopped for buffering
    lowLevelEvents.playing = function () {
        provider.setState(_constants.STATE_PLAYING);
        //provider.trigger(PROVIDER_FIRST_FRAME);
    };
    //Fires when the browser is downloading the audio/video
    lowLevelEvents.progress = function () {
        var timeRanges = elVideo.buffered;
        if (!timeRanges) {
            return false;
        }
        var duration = elVideo.duration;
        var buffered = between((timeRanges.length > 0 ? timeRanges.end(timeRanges.length - 1) : 0) / duration, 0, 1);
        provider.setBuffer(buffered * 100);
        provider.trigger(_constants.CONTENT_BUFFER, {
            bufferPercent: buffered * 100,
            position: elVideo.currentTime,
            duration: duration
        });
    };
    //Fires when the browser is trying to get media data, but data is not available
    lowLevelEvents.stalled = function () {
        OvenPlayerConsole.log("html5 stall");
    };
    //Fires when the current playback position has changed
    lowLevelEvents.timeupdate = function () {
        var position = elVideo.currentTime;
        var duration = elVideo.duration;
        if (isNaN(duration)) {
            return;
        }

        if (!provider.isSeeking() && !elVideo.paused) {
            provider.setState(_constants.STATE_PLAYING);
        }

        if (provider.getState() === _constants.STATE_PLAYING || provider.isSeeking()) {
            provider.trigger(_constants.CONTENT_TIME, {
                position: position,
                duration: duration
            });
        }
    };
    lowLevelEvents.resize = function () {};
    lowLevelEvents.seeking = function () {
        provider.setSeeking(true);
        provider.trigger(_constants.CONTENT_SEEK, {
            position: elVideo.currentTime
        });
    };
    lowLevelEvents.seeked = function () {
        if (!provider.isSeeking()) {
            return;
        }
        provider.setSeeking(false);
        provider.trigger(_constants.CONTENT_SEEKED);
    };

    //Fires when the video stops because it needs to buffer the next frame
    lowLevelEvents.waiting = function () {
        if (provider.isSeeking()) {
            provider.setState(_constants.STATE_LOADING);
        } else if (provider.getState() == _constants.STATE_PLAYING) {
            provider.setState(_constants.STATE_STALLED);
        }
    };

    lowLevelEvents.volumechange = function () {
        provider.trigger(_constants.CONTENT_VOLUME, {
            volume: Math.round(elVideo.volume * 100),
            mute: elVideo.muted
        });
    };

    lowLevelEvents.error = function () {
        var code = elVideo.error && elVideo.error.code || 0;
        var errorCodeGen = {
            0: { code: _constants.PLAYER_UNKNWON_ERROR, reason: "Unknown html5 video error", message: "Unknown html5 video error" },
            1: { code: _constants.PLAYER_UNKNWON_OPERATION_ERROR, reason: "Unknown operation aborted", message: "Unknown operation aborted" },
            2: { code: _constants.PLAYER_UNKNWON_NEWWORK_ERROR, reason: "Unknown network error", message: "Unknown network error" },
            3: { code: _constants.PLAYER_UNKNWON_DECODE_ERROR, reason: "Unknown decode error", message: "Unknown decode error" },
            4: { code: _constants.PLAYER_FILE_ERROR, reason: "File could not be played", message: "File could not be played" }
        }[code] || 0;
        errorCodeGen.error = elVideo.error;
        errorCallback(errorCodeGen);
    };

    Object.keys(lowLevelEvents).forEach(function (eventName) {
        elVideo.removeEventListener(eventName, lowLevelEvents[eventName]);
        elVideo.addEventListener(eventName, lowLevelEvents[eventName]);
    });

    that.destroy = function () {
        Object.keys(lowLevelEvents).forEach(function (eventName) {
            elVideo.removeEventListener(eventName, lowLevelEvents[eventName]);
        });
    };
    return that;
};

exports.default = Listener;

/***/ }),

/***/ "./src/js/api/provider/html5/WebRTCLoader.js":
/*!***************************************************!*\
  !*** ./src/js/api/provider/html5/WebRTCLoader.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _adapter = __webpack_require__(/*! utils/adapter */ "./src/js/utils/adapter.js");

var _adapter2 = _interopRequireDefault(_adapter);

var _promise = __webpack_require__(/*! api/shims/promise */ "./src/js/api/shims/promise.js");

var _promise2 = _interopRequireDefault(_promise);

var _constants = __webpack_require__(/*! api/constants */ "./src/js/api/constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebRTCLoader = function WebRTCLoader(url, errorCallback) {
    var url = url;
    var ws = "";
    var peerConnection = "";
    var config = {
        'iceServers': [{
            'urls': 'stun:stun.l.google.com:19302'
        }]
    };
    var that = {};
    var mySdp = "";

    function initialize(type) {
        var onLocalDescription = function onLocalDescription(id, connection, desc) {
            connection.setLocalDescription(desc).then(function () {
                OvenPlayerConsole.log("setLocalDescription : success");
                // 내 SDP가 생성됨
                var localSDP = connection.localDescription;
                OvenPlayerConsole.log('Local SDP', localSDP);
                mySdp = localSDP; //test code
                // 내 SDP를 서버로 전송
                ws.send(JSON.stringify({
                    id: id,
                    sdp: localSDP
                }));
            }).catch(function (error) {
                closePeer({ code: _constants.PLAYER_WEBRTC_SET_LOCAL_DESC_ERROR, reason: "setLocalDescription error occurred", message: "setLocalDescription error occurred", error: error });
            });
        };

        return new _promise2.default(function (resolve, reject) {
            OvenPlayerConsole.log(url);
            ws = new WebSocket(url);
            ws.onopen = function () {
                ws.send(JSON.stringify({ type: "player" }));
            };
            ws.onmessage = function (e) {
                var message = JSON.parse(e.data);

                if (message.list) {
                    OvenPlayerConsole.log('List received');
                    return;
                }

                if (!message.id) {
                    console.error('ID must be not null');
                    return;
                }

                //OvenPlayerConsole.log('New publisher information received');
                if (!peerConnection) {
                    peerConnection = new RTCPeerConnection(config);

                    peerConnection.onicecandidate = function (e) {
                        if (e.candidate) {
                            // candidate를 서버로 보냄
                            ws.send(JSON.stringify({
                                id: message.id,
                                candidates: [e.candidate]
                            }));
                        }
                    };

                    peerConnection.onnegotiationneeded = function () {
                        peerConnection.createOffer().then(function (desc) {
                            OvenPlayerConsole.log("createOffer : success");
                            onLocalDescription(message.id, peerConnection, desc);
                        }).catch(function (err) {
                            closePeer({ code: _constants.PLAYER_WEBRTC_CREATE_ANSWER_ERROR, reason: "createOffer error occurred", message: "createOffer error occurred", error: error });
                        });
                    };

                    // 원격 스트림이 도착
                    peerConnection.onaddstream = function (e) {
                        //URL.createObjectURL with media streams is deprecated and will be removed in M68, around July 2018. Please use HTMLMediaElement.srcObject instead.
                        /*elVideo.srcObject = e.stream;
                        elVideo.play();*/
                        resolve(e.stream);
                    };
                }

                if (message.sdp) {
                    // 서버에서 상대방의 SDP가 전달되면 remote description 설정

                    peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp)).then(function () {
                        if (peerConnection.remoteDescription.type === 'offer') {
                            // publisher의 offer를 받은 것이라면, answer 생성해서 보내야 함
                            peerConnection.createAnswer().then(function (desc) {
                                OvenPlayerConsole.log("createAnswer : success");
                                onLocalDescription(message.id, peerConnection, desc);
                            }).catch(function (error) {
                                closePeer({ code: _constants.PLAYER_WEBRTC_CREATE_ANSWER_ERROR, reason: "createAnswer error occurred", message: "createAnswer error occurred", error: error });
                            });
                        }
                    }).catch(function (error) {
                        closePeer({ code: _constants.PLAYER_WEBRTC_SET_REMOTE_DESC_ERROR, reason: "setRemoteDescription error occurred", message: "setRemoteDescription error occurred", error: error });
                    });
                }

                if (message.candidates) {
                    // 서버에서 상대방의 ICE candidate가 전달되면
                    for (var i = 0; i < message.candidates.length; i++) {
                        if (message.candidates[i] && message.candidates[i].candidate) {

                            peerConnection.addIceCandidate(new RTCIceCandidate(message.candidates[i])).then(function () {
                                //Do Nothing
                                OvenPlayerConsole.log("addIceCandidate : success");
                            }).catch(function (error) {
                                closePeer({ code: _constants.PLAYER_WEBRTC_ADD_ICECANDIDATE_ERROR, reason: "addIceCandidate error occurred", message: "addIceCandidate error occurred", error: error });
                            });
                        }
                    }
                }
            };
            ws.onerror = function (e) {
                closePeer({ code: _constants.PLAYER_WEBRTC_WS_ERROR, reason: "websocket error occured", message: "websocket error occurred", error: e });
                reject(e);
            };
            ws.onclose = function (e) {
                closePeer({ code: _constants.PLAYER_WEBRTC_WS_CLOSED, reason: "websocket closed", message: "websocket closed", error: e });
                reject(e);
            };
        });
    }

    function closePeer(error) {
        if (!!ws) {
            // 서버에 의해 닫히는 중
            OvenPlayerConsole.log('Disconnected');

            ws.close();
            ws = null;
        }
        if (peerConnection) {
            OvenPlayerConsole.log('Closing peer connection...');
            peerConnection.close();
            peerConnection = null;
        };
        if (error) {
            errorCallback(error);
        }
    }

    that.connect = function () {
        return initialize("player");
    };
    that.destroy = function () {
        closePeer();
    };
    return that;
};

exports.default = WebRTCLoader;

/***/ }),

/***/ "./src/js/utils/adapter.js":
/*!*********************************!*\
  !*** ./src/js/utils/adapter.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var require;var require;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (f) {
  if (( false ? undefined : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (f),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var g; }
})(function () {
  var define, module, exports;return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;if (!u && a) return require(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }return s;
  }({ 1: [function (require, module, exports) {
      /*
       *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var SDPUtils = require('sdp');

      function writeMediaSection(transceiver, caps, type, stream, dtlsRole) {
        var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

        // Map ICE parameters (ufrag, pwd) to SDP.
        sdp += SDPUtils.writeIceParameters(transceiver.iceGatherer.getLocalParameters());

        // Map DTLS parameters to SDP.
        sdp += SDPUtils.writeDtlsParameters(transceiver.dtlsTransport.getLocalParameters(), type === 'offer' ? 'actpass' : dtlsRole || 'active');

        sdp += 'a=mid:' + transceiver.mid + '\r\n';

        if (transceiver.rtpSender && transceiver.rtpReceiver) {
          sdp += 'a=sendrecv\r\n';
        } else if (transceiver.rtpSender) {
          sdp += 'a=sendonly\r\n';
        } else if (transceiver.rtpReceiver) {
          sdp += 'a=recvonly\r\n';
        } else {
          sdp += 'a=inactive\r\n';
        }

        if (transceiver.rtpSender) {
          var trackId = transceiver.rtpSender._initialTrackId || transceiver.rtpSender.track.id;
          transceiver.rtpSender._initialTrackId = trackId;
          // spec.
          var msid = 'msid:' + (stream ? stream.id : '-') + ' ' + trackId + '\r\n';
          sdp += 'a=' + msid;
          // for Chrome. Legacy should no longer be required.
          sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' ' + msid;

          // RTX
          if (transceiver.sendEncodingParameters[0].rtx) {
            sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc + ' ' + msid;
            sdp += 'a=ssrc-group:FID ' + transceiver.sendEncodingParameters[0].ssrc + ' ' + transceiver.sendEncodingParameters[0].rtx.ssrc + '\r\n';
          }
        }
        // FIXME: this should be written by writeRtpDescription.
        sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
        if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
          sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
        }
        return sdp;
      }

      // Edge does not like
      // 1) stun: filtered after 14393 unless ?transport=udp is present
      // 2) turn: that does not have all of turn:host:port?transport=udp
      // 3) turn: with ipv6 addresses
      // 4) turn: occurring muliple times
      function filterIceServers(iceServers, edgeVersion) {
        var hasTurn = false;
        iceServers = JSON.parse(JSON.stringify(iceServers));
        return iceServers.filter(function (server) {
          if (server && (server.urls || server.url)) {
            var urls = server.urls || server.url;
            if (server.url && !server.urls) {
              console.warn('RTCIceServer.url is deprecated! Use urls instead.');
            }
            var isString = typeof urls === 'string';
            if (isString) {
              urls = [urls];
            }
            urls = urls.filter(function (url) {
              var validTurn = url.indexOf('turn:') === 0 && url.indexOf('transport=udp') !== -1 && url.indexOf('turn:[') === -1 && !hasTurn;

              if (validTurn) {
                hasTurn = true;
                return true;
              }
              return url.indexOf('stun:') === 0 && edgeVersion >= 14393 && url.indexOf('?transport=udp') === -1;
            });

            delete server.url;
            server.urls = isString ? urls[0] : urls;
            return !!urls.length;
          }
        });
      }

      // Determines the intersection of local and remote capabilities.
      function getCommonCapabilities(localCapabilities, remoteCapabilities) {
        var commonCapabilities = {
          codecs: [],
          headerExtensions: [],
          fecMechanisms: []
        };

        var findCodecByPayloadType = function findCodecByPayloadType(pt, codecs) {
          pt = parseInt(pt, 10);
          for (var i = 0; i < codecs.length; i++) {
            if (codecs[i].payloadType === pt || codecs[i].preferredPayloadType === pt) {
              return codecs[i];
            }
          }
        };

        var rtxCapabilityMatches = function rtxCapabilityMatches(lRtx, rRtx, lCodecs, rCodecs) {
          var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
          var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
          return lCodec && rCodec && lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
        };

        localCapabilities.codecs.forEach(function (lCodec) {
          for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
            var rCodec = remoteCapabilities.codecs[i];
            if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() && lCodec.clockRate === rCodec.clockRate) {
              if (lCodec.name.toLowerCase() === 'rtx' && lCodec.parameters && rCodec.parameters.apt) {
                // for RTX we need to find the local rtx that has a apt
                // which points to the same local codec as the remote one.
                if (!rtxCapabilityMatches(lCodec, rCodec, localCapabilities.codecs, remoteCapabilities.codecs)) {
                  continue;
                }
              }
              rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
              // number of channels is the highest common number of channels
              rCodec.numChannels = Math.min(lCodec.numChannels, rCodec.numChannels);
              // push rCodec so we reply with offerer payload type
              commonCapabilities.codecs.push(rCodec);

              // determine common feedback mechanisms
              rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function (fb) {
                for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
                  if (lCodec.rtcpFeedback[j].type === fb.type && lCodec.rtcpFeedback[j].parameter === fb.parameter) {
                    return true;
                  }
                }
                return false;
              });
              // FIXME: also need to determine .parameters
              //  see https://github.com/openpeer/ortc/issues/569
              break;
            }
          }
        });

        localCapabilities.headerExtensions.forEach(function (lHeaderExtension) {
          for (var i = 0; i < remoteCapabilities.headerExtensions.length; i++) {
            var rHeaderExtension = remoteCapabilities.headerExtensions[i];
            if (lHeaderExtension.uri === rHeaderExtension.uri) {
              commonCapabilities.headerExtensions.push(rHeaderExtension);
              break;
            }
          }
        });

        // FIXME: fecMechanisms
        return commonCapabilities;
      }

      // is action=setLocalDescription with type allowed in signalingState
      function isActionAllowedInSignalingState(action, type, signalingState) {
        return {
          offer: {
            setLocalDescription: ['stable', 'have-local-offer'],
            setRemoteDescription: ['stable', 'have-remote-offer']
          },
          answer: {
            setLocalDescription: ['have-remote-offer', 'have-local-pranswer'],
            setRemoteDescription: ['have-local-offer', 'have-remote-pranswer']
          }
        }[type][action].indexOf(signalingState) !== -1;
      }

      function maybeAddCandidate(iceTransport, candidate) {
        // Edge's internal representation adds some fields therefore
        // not all fieldѕ are taken into account.
        var alreadyAdded = iceTransport.getRemoteCandidates().find(function (remoteCandidate) {
          return candidate.foundation === remoteCandidate.foundation && candidate.ip === remoteCandidate.ip && candidate.port === remoteCandidate.port && candidate.priority === remoteCandidate.priority && candidate.protocol === remoteCandidate.protocol && candidate.type === remoteCandidate.type;
        });
        if (!alreadyAdded) {
          iceTransport.addRemoteCandidate(candidate);
        }
        return !alreadyAdded;
      }

      function makeError(name, description) {
        var e = new Error(description);
        e.name = name;
        // legacy error codes from https://heycam.github.io/webidl/#idl-DOMException-error-names
        e.code = {
          NotSupportedError: 9,
          InvalidStateError: 11,
          InvalidAccessError: 15,
          TypeError: undefined,
          OperationError: undefined
        }[name];
        return e;
      }

      module.exports = function (window, edgeVersion) {
        // https://w3c.github.io/mediacapture-main/#mediastream
        // Helper function to add the track to the stream and
        // dispatch the event ourselves.
        function addTrackToStreamAndFireEvent(track, stream) {
          stream.addTrack(track);
          stream.dispatchEvent(new window.MediaStreamTrackEvent('addtrack', { track: track }));
        }

        function removeTrackFromStreamAndFireEvent(track, stream) {
          stream.removeTrack(track);
          stream.dispatchEvent(new window.MediaStreamTrackEvent('removetrack', { track: track }));
        }

        function fireAddTrack(pc, track, receiver, streams) {
          var trackEvent = new Event('track');
          trackEvent.track = track;
          trackEvent.receiver = receiver;
          trackEvent.transceiver = { receiver: receiver };
          trackEvent.streams = streams;
          window.setTimeout(function () {
            pc._dispatchEvent('track', trackEvent);
          });
        }

        var RTCPeerConnection = function RTCPeerConnection(config) {
          var pc = this;

          var _eventTarget = document.createDocumentFragment();
          ['addEventListener', 'removeEventListener', 'dispatchEvent'].forEach(function (method) {
            pc[method] = _eventTarget[method].bind(_eventTarget);
          });

          this.canTrickleIceCandidates = null;

          this.needNegotiation = false;

          this.localStreams = [];
          this.remoteStreams = [];

          this.localDescription = null;
          this.remoteDescription = null;

          this.signalingState = 'stable';
          this.iceConnectionState = 'new';
          this.connectionState = 'new';
          this.iceGatheringState = 'new';

          config = JSON.parse(JSON.stringify(config || {}));

          this.usingBundle = config.bundlePolicy === 'max-bundle';
          if (config.rtcpMuxPolicy === 'negotiate') {
            throw makeError('NotSupportedError', 'rtcpMuxPolicy \'negotiate\' is not supported');
          } else if (!config.rtcpMuxPolicy) {
            config.rtcpMuxPolicy = 'require';
          }

          switch (config.iceTransportPolicy) {
            case 'all':
            case 'relay':
              break;
            default:
              config.iceTransportPolicy = 'all';
              break;
          }

          switch (config.bundlePolicy) {
            case 'balanced':
            case 'max-compat':
            case 'max-bundle':
              break;
            default:
              config.bundlePolicy = 'balanced';
              break;
          }

          config.iceServers = filterIceServers(config.iceServers || [], edgeVersion);

          this._iceGatherers = [];
          if (config.iceCandidatePoolSize) {
            for (var i = config.iceCandidatePoolSize; i > 0; i--) {
              this._iceGatherers.push(new window.RTCIceGatherer({
                iceServers: config.iceServers,
                gatherPolicy: config.iceTransportPolicy
              }));
            }
          } else {
            config.iceCandidatePoolSize = 0;
          }

          this._config = config;

          // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
          // everything that is needed to describe a SDP m-line.
          this.transceivers = [];

          this._sdpSessionId = SDPUtils.generateSessionId();
          this._sdpSessionVersion = 0;

          this._dtlsRole = undefined; // role for a=setup to use in answers.

          this._isClosed = false;
        };

        // set up event handlers on prototype
        RTCPeerConnection.prototype.onicecandidate = null;
        RTCPeerConnection.prototype.onaddstream = null;
        RTCPeerConnection.prototype.ontrack = null;
        RTCPeerConnection.prototype.onremovestream = null;
        RTCPeerConnection.prototype.onsignalingstatechange = null;
        RTCPeerConnection.prototype.oniceconnectionstatechange = null;
        RTCPeerConnection.prototype.onconnectionstatechange = null;
        RTCPeerConnection.prototype.onicegatheringstatechange = null;
        RTCPeerConnection.prototype.onnegotiationneeded = null;
        RTCPeerConnection.prototype.ondatachannel = null;

        RTCPeerConnection.prototype._dispatchEvent = function (name, event) {
          if (this._isClosed) {
            return;
          }
          this.dispatchEvent(event);
          if (typeof this['on' + name] === 'function') {
            this['on' + name](event);
          }
        };

        RTCPeerConnection.prototype._emitGatheringStateChange = function () {
          var event = new Event('icegatheringstatechange');
          this._dispatchEvent('icegatheringstatechange', event);
        };

        RTCPeerConnection.prototype.getConfiguration = function () {
          return this._config;
        };

        RTCPeerConnection.prototype.getLocalStreams = function () {
          return this.localStreams;
        };

        RTCPeerConnection.prototype.getRemoteStreams = function () {
          return this.remoteStreams;
        };

        // internal helper to create a transceiver object.
        // (which is not yet the same as the WebRTC 1.0 transceiver)
        RTCPeerConnection.prototype._createTransceiver = function (kind, doNotAdd) {
          var hasBundleTransport = this.transceivers.length > 0;
          var transceiver = {
            track: null,
            iceGatherer: null,
            iceTransport: null,
            dtlsTransport: null,
            localCapabilities: null,
            remoteCapabilities: null,
            rtpSender: null,
            rtpReceiver: null,
            kind: kind,
            mid: null,
            sendEncodingParameters: null,
            recvEncodingParameters: null,
            stream: null,
            associatedRemoteMediaStreams: [],
            wantReceive: true
          };
          if (this.usingBundle && hasBundleTransport) {
            transceiver.iceTransport = this.transceivers[0].iceTransport;
            transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
          } else {
            var transports = this._createIceAndDtlsTransports();
            transceiver.iceTransport = transports.iceTransport;
            transceiver.dtlsTransport = transports.dtlsTransport;
          }
          if (!doNotAdd) {
            this.transceivers.push(transceiver);
          }
          return transceiver;
        };

        RTCPeerConnection.prototype.addTrack = function (track, stream) {
          if (this._isClosed) {
            throw makeError('InvalidStateError', 'Attempted to call addTrack on a closed peerconnection.');
          }

          var alreadyExists = this.transceivers.find(function (s) {
            return s.track === track;
          });

          if (alreadyExists) {
            throw makeError('InvalidAccessError', 'Track already exists.');
          }

          var transceiver;
          for (var i = 0; i < this.transceivers.length; i++) {
            if (!this.transceivers[i].track && this.transceivers[i].kind === track.kind) {
              transceiver = this.transceivers[i];
            }
          }
          if (!transceiver) {
            transceiver = this._createTransceiver(track.kind);
          }

          this._maybeFireNegotiationNeeded();

          if (this.localStreams.indexOf(stream) === -1) {
            this.localStreams.push(stream);
          }

          transceiver.track = track;
          transceiver.stream = stream;
          transceiver.rtpSender = new window.RTCRtpSender(track, transceiver.dtlsTransport);
          return transceiver.rtpSender;
        };

        RTCPeerConnection.prototype.addStream = function (stream) {
          var pc = this;
          if (edgeVersion >= 15025) {
            stream.getTracks().forEach(function (track) {
              pc.addTrack(track, stream);
            });
          } else {
            // Clone is necessary for local demos mostly, attaching directly
            // to two different senders does not work (build 10547).
            // Fixed in 15025 (or earlier)
            var clonedStream = stream.clone();
            stream.getTracks().forEach(function (track, idx) {
              var clonedTrack = clonedStream.getTracks()[idx];
              track.addEventListener('enabled', function (event) {
                clonedTrack.enabled = event.enabled;
              });
            });
            clonedStream.getTracks().forEach(function (track) {
              pc.addTrack(track, clonedStream);
            });
          }
        };

        RTCPeerConnection.prototype.removeTrack = function (sender) {
          if (this._isClosed) {
            throw makeError('InvalidStateError', 'Attempted to call removeTrack on a closed peerconnection.');
          }

          if (!(sender instanceof window.RTCRtpSender)) {
            throw new TypeError('Argument 1 of RTCPeerConnection.removeTrack ' + 'does not implement interface RTCRtpSender.');
          }

          var transceiver = this.transceivers.find(function (t) {
            return t.rtpSender === sender;
          });

          if (!transceiver) {
            throw makeError('InvalidAccessError', 'Sender was not created by this connection.');
          }
          var stream = transceiver.stream;

          transceiver.rtpSender.stop();
          transceiver.rtpSender = null;
          transceiver.track = null;
          transceiver.stream = null;

          // remove the stream from the set of local streams
          var localStreams = this.transceivers.map(function (t) {
            return t.stream;
          });
          if (localStreams.indexOf(stream) === -1 && this.localStreams.indexOf(stream) > -1) {
            this.localStreams.splice(this.localStreams.indexOf(stream), 1);
          }

          this._maybeFireNegotiationNeeded();
        };

        RTCPeerConnection.prototype.removeStream = function (stream) {
          var pc = this;
          stream.getTracks().forEach(function (track) {
            var sender = pc.getSenders().find(function (s) {
              return s.track === track;
            });
            if (sender) {
              pc.removeTrack(sender);
            }
          });
        };

        RTCPeerConnection.prototype.getSenders = function () {
          return this.transceivers.filter(function (transceiver) {
            return !!transceiver.rtpSender;
          }).map(function (transceiver) {
            return transceiver.rtpSender;
          });
        };

        RTCPeerConnection.prototype.getReceivers = function () {
          return this.transceivers.filter(function (transceiver) {
            return !!transceiver.rtpReceiver;
          }).map(function (transceiver) {
            return transceiver.rtpReceiver;
          });
        };

        RTCPeerConnection.prototype._createIceGatherer = function (sdpMLineIndex, usingBundle) {
          var pc = this;
          if (usingBundle && sdpMLineIndex > 0) {
            return this.transceivers[0].iceGatherer;
          } else if (this._iceGatherers.length) {
            return this._iceGatherers.shift();
          }
          var iceGatherer = new window.RTCIceGatherer({
            iceServers: this._config.iceServers,
            gatherPolicy: this._config.iceTransportPolicy
          });
          Object.defineProperty(iceGatherer, 'state', { value: 'new', writable: true });

          this.transceivers[sdpMLineIndex].bufferedCandidateEvents = [];
          this.transceivers[sdpMLineIndex].bufferCandidates = function (event) {
            var end = !event.candidate || Object.keys(event.candidate).length === 0;
            // polyfill since RTCIceGatherer.state is not implemented in
            // Edge 10547 yet.
            iceGatherer.state = end ? 'completed' : 'gathering';
            if (pc.transceivers[sdpMLineIndex].bufferedCandidateEvents !== null) {
              pc.transceivers[sdpMLineIndex].bufferedCandidateEvents.push(event);
            }
          };
          iceGatherer.addEventListener('localcandidate', this.transceivers[sdpMLineIndex].bufferCandidates);
          return iceGatherer;
        };

        // start gathering from an RTCIceGatherer.
        RTCPeerConnection.prototype._gather = function (mid, sdpMLineIndex) {
          var pc = this;
          var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
          if (iceGatherer.onlocalcandidate) {
            return;
          }
          var bufferedCandidateEvents = this.transceivers[sdpMLineIndex].bufferedCandidateEvents;
          this.transceivers[sdpMLineIndex].bufferedCandidateEvents = null;
          iceGatherer.removeEventListener('localcandidate', this.transceivers[sdpMLineIndex].bufferCandidates);
          iceGatherer.onlocalcandidate = function (evt) {
            if (pc.usingBundle && sdpMLineIndex > 0) {
              // if we know that we use bundle we can drop candidates with
              // ѕdpMLineIndex > 0. If we don't do this then our state gets
              // confused since we dispose the extra ice gatherer.
              return;
            }
            var event = new Event('icecandidate');
            event.candidate = { sdpMid: mid, sdpMLineIndex: sdpMLineIndex };

            var cand = evt.candidate;
            // Edge emits an empty object for RTCIceCandidateComplete‥
            var end = !cand || Object.keys(cand).length === 0;
            if (end) {
              // polyfill since RTCIceGatherer.state is not implemented in
              // Edge 10547 yet.
              if (iceGatherer.state === 'new' || iceGatherer.state === 'gathering') {
                iceGatherer.state = 'completed';
              }
            } else {
              if (iceGatherer.state === 'new') {
                iceGatherer.state = 'gathering';
              }
              // RTCIceCandidate doesn't have a component, needs to be added
              cand.component = 1;
              // also the usernameFragment. TODO: update SDP to take both variants.
              cand.ufrag = iceGatherer.getLocalParameters().usernameFragment;

              var serializedCandidate = SDPUtils.writeCandidate(cand);
              event.candidate = _extends(event.candidate, SDPUtils.parseCandidate(serializedCandidate));

              event.candidate.candidate = serializedCandidate;
              event.candidate.toJSON = function () {
                return {
                  candidate: event.candidate.candidate,
                  sdpMid: event.candidate.sdpMid,
                  sdpMLineIndex: event.candidate.sdpMLineIndex,
                  usernameFragment: event.candidate.usernameFragment
                };
              };
            }

            // update local description.
            var sections = SDPUtils.getMediaSections(pc.localDescription.sdp);
            if (!end) {
              sections[event.candidate.sdpMLineIndex] += 'a=' + event.candidate.candidate + '\r\n';
            } else {
              sections[event.candidate.sdpMLineIndex] += 'a=end-of-candidates\r\n';
            }
            pc.localDescription.sdp = SDPUtils.getDescription(pc.localDescription.sdp) + sections.join('');
            var complete = pc.transceivers.every(function (transceiver) {
              return transceiver.iceGatherer && transceiver.iceGatherer.state === 'completed';
            });

            if (pc.iceGatheringState !== 'gathering') {
              pc.iceGatheringState = 'gathering';
              pc._emitGatheringStateChange();
            }

            // Emit candidate. Also emit null candidate when all gatherers are
            // complete.
            if (!end) {
              pc._dispatchEvent('icecandidate', event);
            }
            if (complete) {
              pc._dispatchEvent('icecandidate', new Event('icecandidate'));
              pc.iceGatheringState = 'complete';
              pc._emitGatheringStateChange();
            }
          };

          // emit already gathered candidates.
          window.setTimeout(function () {
            bufferedCandidateEvents.forEach(function (e) {
              iceGatherer.onlocalcandidate(e);
            });
          }, 0);
        };

        // Create ICE transport and DTLS transport.
        RTCPeerConnection.prototype._createIceAndDtlsTransports = function () {
          var pc = this;
          var iceTransport = new window.RTCIceTransport(null);
          iceTransport.onicestatechange = function () {
            pc._updateIceConnectionState();
            pc._updateConnectionState();
          };

          var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
          dtlsTransport.ondtlsstatechange = function () {
            pc._updateConnectionState();
          };
          dtlsTransport.onerror = function () {
            // onerror does not set state to failed by itself.
            Object.defineProperty(dtlsTransport, 'state', { value: 'failed', writable: true });
            pc._updateConnectionState();
          };

          return {
            iceTransport: iceTransport,
            dtlsTransport: dtlsTransport
          };
        };

        // Destroy ICE gatherer, ICE transport and DTLS transport.
        // Without triggering the callbacks.
        RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function (sdpMLineIndex) {
          var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
          if (iceGatherer) {
            delete iceGatherer.onlocalcandidate;
            delete this.transceivers[sdpMLineIndex].iceGatherer;
          }
          var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
          if (iceTransport) {
            delete iceTransport.onicestatechange;
            delete this.transceivers[sdpMLineIndex].iceTransport;
          }
          var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
          if (dtlsTransport) {
            delete dtlsTransport.ondtlsstatechange;
            delete dtlsTransport.onerror;
            delete this.transceivers[sdpMLineIndex].dtlsTransport;
          }
        };

        // Start the RTP Sender and Receiver for a transceiver.
        RTCPeerConnection.prototype._transceive = function (transceiver, send, recv) {
          var params = getCommonCapabilities(transceiver.localCapabilities, transceiver.remoteCapabilities);
          if (send && transceiver.rtpSender) {
            params.encodings = transceiver.sendEncodingParameters;
            params.rtcp = {
              cname: SDPUtils.localCName,
              compound: transceiver.rtcpParameters.compound
            };
            if (transceiver.recvEncodingParameters.length) {
              params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
            }
            transceiver.rtpSender.send(params);
          }
          if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
            // remove RTX field in Edge 14942
            if (transceiver.kind === 'video' && transceiver.recvEncodingParameters && edgeVersion < 15019) {
              transceiver.recvEncodingParameters.forEach(function (p) {
                delete p.rtx;
              });
            }
            if (transceiver.recvEncodingParameters.length) {
              params.encodings = transceiver.recvEncodingParameters;
            } else {
              params.encodings = [{}];
            }
            params.rtcp = {
              compound: transceiver.rtcpParameters.compound
            };
            if (transceiver.rtcpParameters.cname) {
              params.rtcp.cname = transceiver.rtcpParameters.cname;
            }
            if (transceiver.sendEncodingParameters.length) {
              params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
            }
            transceiver.rtpReceiver.receive(params);
          }
        };

        RTCPeerConnection.prototype.setLocalDescription = function (description) {
          var pc = this;

          // Note: pranswer is not supported.
          if (['offer', 'answer'].indexOf(description.type) === -1) {
            return Promise.reject(makeError('TypeError', 'Unsupported type "' + description.type + '"'));
          }

          if (!isActionAllowedInSignalingState('setLocalDescription', description.type, pc.signalingState) || pc._isClosed) {
            return Promise.reject(makeError('InvalidStateError', 'Can not set local ' + description.type + ' in state ' + pc.signalingState));
          }

          var sections;
          var sessionpart;
          if (description.type === 'offer') {
            // VERY limited support for SDP munging. Limited to:
            // * changing the order of codecs
            sections = SDPUtils.splitSections(description.sdp);
            sessionpart = sections.shift();
            sections.forEach(function (mediaSection, sdpMLineIndex) {
              var caps = SDPUtils.parseRtpParameters(mediaSection);
              pc.transceivers[sdpMLineIndex].localCapabilities = caps;
            });

            pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
              pc._gather(transceiver.mid, sdpMLineIndex);
            });
          } else if (description.type === 'answer') {
            sections = SDPUtils.splitSections(pc.remoteDescription.sdp);
            sessionpart = sections.shift();
            var isIceLite = SDPUtils.matchPrefix(sessionpart, 'a=ice-lite').length > 0;
            sections.forEach(function (mediaSection, sdpMLineIndex) {
              var transceiver = pc.transceivers[sdpMLineIndex];
              var iceGatherer = transceiver.iceGatherer;
              var iceTransport = transceiver.iceTransport;
              var dtlsTransport = transceiver.dtlsTransport;
              var localCapabilities = transceiver.localCapabilities;
              var remoteCapabilities = transceiver.remoteCapabilities;

              // treat bundle-only as not-rejected.
              var rejected = SDPUtils.isRejected(mediaSection) && SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;

              if (!rejected && !transceiver.rejected) {
                var remoteIceParameters = SDPUtils.getIceParameters(mediaSection, sessionpart);
                var remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection, sessionpart);
                if (isIceLite) {
                  remoteDtlsParameters.role = 'server';
                }

                if (!pc.usingBundle || sdpMLineIndex === 0) {
                  pc._gather(transceiver.mid, sdpMLineIndex);
                  if (iceTransport.state === 'new') {
                    iceTransport.start(iceGatherer, remoteIceParameters, isIceLite ? 'controlling' : 'controlled');
                  }
                  if (dtlsTransport.state === 'new') {
                    dtlsTransport.start(remoteDtlsParameters);
                  }
                }

                // Calculate intersection of capabilities.
                var params = getCommonCapabilities(localCapabilities, remoteCapabilities);

                // Start the RTCRtpSender. The RTCRtpReceiver for this
                // transceiver has already been started in setRemoteDescription.
                pc._transceive(transceiver, params.codecs.length > 0, false);
              }
            });
          }

          pc.localDescription = {
            type: description.type,
            sdp: description.sdp
          };
          if (description.type === 'offer') {
            pc._updateSignalingState('have-local-offer');
          } else {
            pc._updateSignalingState('stable');
          }

          return Promise.resolve();
        };

        RTCPeerConnection.prototype.setRemoteDescription = function (description) {
          var pc = this;

          // Note: pranswer is not supported.
          if (['offer', 'answer'].indexOf(description.type) === -1) {
            return Promise.reject(makeError('TypeError', 'Unsupported type "' + description.type + '"'));
          }

          if (!isActionAllowedInSignalingState('setRemoteDescription', description.type, pc.signalingState) || pc._isClosed) {
            return Promise.reject(makeError('InvalidStateError', 'Can not set remote ' + description.type + ' in state ' + pc.signalingState));
          }

          var streams = {};
          pc.remoteStreams.forEach(function (stream) {
            streams[stream.id] = stream;
          });
          var receiverList = [];
          var sections = SDPUtils.splitSections(description.sdp);
          var sessionpart = sections.shift();
          var isIceLite = SDPUtils.matchPrefix(sessionpart, 'a=ice-lite').length > 0;
          var usingBundle = SDPUtils.matchPrefix(sessionpart, 'a=group:BUNDLE ').length > 0;
          pc.usingBundle = usingBundle;
          var iceOptions = SDPUtils.matchPrefix(sessionpart, 'a=ice-options:')[0];
          if (iceOptions) {
            pc.canTrickleIceCandidates = iceOptions.substr(14).split(' ').indexOf('trickle') >= 0;
          } else {
            pc.canTrickleIceCandidates = false;
          }

          sections.forEach(function (mediaSection, sdpMLineIndex) {
            var lines = SDPUtils.splitLines(mediaSection);
            var kind = SDPUtils.getKind(mediaSection);
            // treat bundle-only as not-rejected.
            var rejected = SDPUtils.isRejected(mediaSection) && SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
            var protocol = lines[0].substr(2).split(' ')[2];

            var direction = SDPUtils.getDirection(mediaSection, sessionpart);
            var remoteMsid = SDPUtils.parseMsid(mediaSection);

            var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();

            // Reject datachannels which are not implemented yet.
            if (kind === 'application' && protocol === 'DTLS/SCTP' || rejected) {
              // TODO: this is dangerous in the case where a non-rejected m-line
              //     becomes rejected.
              pc.transceivers[sdpMLineIndex] = {
                mid: mid,
                kind: kind,
                rejected: true
              };
              return;
            }

            if (!rejected && pc.transceivers[sdpMLineIndex] && pc.transceivers[sdpMLineIndex].rejected) {
              // recycle a rejected transceiver.
              pc.transceivers[sdpMLineIndex] = pc._createTransceiver(kind, true);
            }

            var transceiver;
            var iceGatherer;
            var iceTransport;
            var dtlsTransport;
            var rtpReceiver;
            var sendEncodingParameters;
            var recvEncodingParameters;
            var localCapabilities;

            var track;
            // FIXME: ensure the mediaSection has rtcp-mux set.
            var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
            var remoteIceParameters;
            var remoteDtlsParameters;
            if (!rejected) {
              remoteIceParameters = SDPUtils.getIceParameters(mediaSection, sessionpart);
              remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection, sessionpart);
              remoteDtlsParameters.role = 'client';
            }
            recvEncodingParameters = SDPUtils.parseRtpEncodingParameters(mediaSection);

            var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);

            var isComplete = SDPUtils.matchPrefix(mediaSection, 'a=end-of-candidates', sessionpart).length > 0;
            var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:').map(function (cand) {
              return SDPUtils.parseCandidate(cand);
            }).filter(function (cand) {
              return cand.component === 1;
            });

            // Check if we can use BUNDLE and dispose transports.
            if ((description.type === 'offer' || description.type === 'answer') && !rejected && usingBundle && sdpMLineIndex > 0 && pc.transceivers[sdpMLineIndex]) {
              pc._disposeIceAndDtlsTransports(sdpMLineIndex);
              pc.transceivers[sdpMLineIndex].iceGatherer = pc.transceivers[0].iceGatherer;
              pc.transceivers[sdpMLineIndex].iceTransport = pc.transceivers[0].iceTransport;
              pc.transceivers[sdpMLineIndex].dtlsTransport = pc.transceivers[0].dtlsTransport;
              if (pc.transceivers[sdpMLineIndex].rtpSender) {
                pc.transceivers[sdpMLineIndex].rtpSender.setTransport(pc.transceivers[0].dtlsTransport);
              }
              if (pc.transceivers[sdpMLineIndex].rtpReceiver) {
                pc.transceivers[sdpMLineIndex].rtpReceiver.setTransport(pc.transceivers[0].dtlsTransport);
              }
            }
            if (description.type === 'offer' && !rejected) {
              transceiver = pc.transceivers[sdpMLineIndex] || pc._createTransceiver(kind);
              transceiver.mid = mid;

              if (!transceiver.iceGatherer) {
                transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex, usingBundle);
              }

              if (cands.length && transceiver.iceTransport.state === 'new') {
                if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
                  transceiver.iceTransport.setRemoteCandidates(cands);
                } else {
                  cands.forEach(function (candidate) {
                    maybeAddCandidate(transceiver.iceTransport, candidate);
                  });
                }
              }

              localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);

              // filter RTX until additional stuff needed for RTX is implemented
              // in adapter.js
              if (edgeVersion < 15019) {
                localCapabilities.codecs = localCapabilities.codecs.filter(function (codec) {
                  return codec.name !== 'rtx';
                });
              }

              sendEncodingParameters = transceiver.sendEncodingParameters || [{
                ssrc: (2 * sdpMLineIndex + 2) * 1001
              }];

              // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
              var isNewTrack = false;
              if (direction === 'sendrecv' || direction === 'sendonly') {
                isNewTrack = !transceiver.rtpReceiver;
                rtpReceiver = transceiver.rtpReceiver || new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);

                if (isNewTrack) {
                  var stream;
                  track = rtpReceiver.track;
                  // FIXME: does not work with Plan B.
                  if (remoteMsid && remoteMsid.stream === '-') {
                    // no-op. a stream id of '-' means: no associated stream.
                  } else if (remoteMsid) {
                    if (!streams[remoteMsid.stream]) {
                      streams[remoteMsid.stream] = new window.MediaStream();
                      Object.defineProperty(streams[remoteMsid.stream], 'id', {
                        get: function get() {
                          return remoteMsid.stream;
                        }
                      });
                    }
                    Object.defineProperty(track, 'id', {
                      get: function get() {
                        return remoteMsid.track;
                      }
                    });
                    stream = streams[remoteMsid.stream];
                  } else {
                    if (!streams.default) {
                      streams.default = new window.MediaStream();
                    }
                    stream = streams.default;
                  }
                  if (stream) {
                    addTrackToStreamAndFireEvent(track, stream);
                    transceiver.associatedRemoteMediaStreams.push(stream);
                  }
                  receiverList.push([track, rtpReceiver, stream]);
                }
              } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
                transceiver.associatedRemoteMediaStreams.forEach(function (s) {
                  var nativeTrack = s.getTracks().find(function (t) {
                    return t.id === transceiver.rtpReceiver.track.id;
                  });
                  if (nativeTrack) {
                    removeTrackFromStreamAndFireEvent(nativeTrack, s);
                  }
                });
                transceiver.associatedRemoteMediaStreams = [];
              }

              transceiver.localCapabilities = localCapabilities;
              transceiver.remoteCapabilities = remoteCapabilities;
              transceiver.rtpReceiver = rtpReceiver;
              transceiver.rtcpParameters = rtcpParameters;
              transceiver.sendEncodingParameters = sendEncodingParameters;
              transceiver.recvEncodingParameters = recvEncodingParameters;

              // Start the RTCRtpReceiver now. The RTPSender is started in
              // setLocalDescription.
              pc._transceive(pc.transceivers[sdpMLineIndex], false, isNewTrack);
            } else if (description.type === 'answer' && !rejected) {
              transceiver = pc.transceivers[sdpMLineIndex];
              iceGatherer = transceiver.iceGatherer;
              iceTransport = transceiver.iceTransport;
              dtlsTransport = transceiver.dtlsTransport;
              rtpReceiver = transceiver.rtpReceiver;
              sendEncodingParameters = transceiver.sendEncodingParameters;
              localCapabilities = transceiver.localCapabilities;

              pc.transceivers[sdpMLineIndex].recvEncodingParameters = recvEncodingParameters;
              pc.transceivers[sdpMLineIndex].remoteCapabilities = remoteCapabilities;
              pc.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;

              if (cands.length && iceTransport.state === 'new') {
                if ((isIceLite || isComplete) && (!usingBundle || sdpMLineIndex === 0)) {
                  iceTransport.setRemoteCandidates(cands);
                } else {
                  cands.forEach(function (candidate) {
                    maybeAddCandidate(transceiver.iceTransport, candidate);
                  });
                }
              }

              if (!usingBundle || sdpMLineIndex === 0) {
                if (iceTransport.state === 'new') {
                  iceTransport.start(iceGatherer, remoteIceParameters, 'controlling');
                }
                if (dtlsTransport.state === 'new') {
                  dtlsTransport.start(remoteDtlsParameters);
                }
              }

              pc._transceive(transceiver, direction === 'sendrecv' || direction === 'recvonly', direction === 'sendrecv' || direction === 'sendonly');

              // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
              if (rtpReceiver && (direction === 'sendrecv' || direction === 'sendonly')) {
                track = rtpReceiver.track;
                if (remoteMsid) {
                  if (!streams[remoteMsid.stream]) {
                    streams[remoteMsid.stream] = new window.MediaStream();
                  }
                  addTrackToStreamAndFireEvent(track, streams[remoteMsid.stream]);
                  receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
                } else {
                  if (!streams.default) {
                    streams.default = new window.MediaStream();
                  }
                  addTrackToStreamAndFireEvent(track, streams.default);
                  receiverList.push([track, rtpReceiver, streams.default]);
                }
              } else {
                // FIXME: actually the receiver should be created later.
                delete transceiver.rtpReceiver;
              }
            }
          });

          if (pc._dtlsRole === undefined) {
            pc._dtlsRole = description.type === 'offer' ? 'active' : 'passive';
          }

          pc.remoteDescription = {
            type: description.type,
            sdp: description.sdp
          };
          if (description.type === 'offer') {
            pc._updateSignalingState('have-remote-offer');
          } else {
            pc._updateSignalingState('stable');
          }
          Object.keys(streams).forEach(function (sid) {
            var stream = streams[sid];
            if (stream.getTracks().length) {
              if (pc.remoteStreams.indexOf(stream) === -1) {
                pc.remoteStreams.push(stream);
                var event = new Event('addstream');
                event.stream = stream;
                window.setTimeout(function () {
                  pc._dispatchEvent('addstream', event);
                });
              }

              receiverList.forEach(function (item) {
                var track = item[0];
                var receiver = item[1];
                if (stream.id !== item[2].id) {
                  return;
                }
                fireAddTrack(pc, track, receiver, [stream]);
              });
            }
          });
          receiverList.forEach(function (item) {
            if (item[2]) {
              return;
            }
            fireAddTrack(pc, item[0], item[1], []);
          });

          // check whether addIceCandidate({}) was called within four seconds after
          // setRemoteDescription.
          window.setTimeout(function () {
            if (!(pc && pc.transceivers)) {
              return;
            }
            pc.transceivers.forEach(function (transceiver) {
              if (transceiver.iceTransport && transceiver.iceTransport.state === 'new' && transceiver.iceTransport.getRemoteCandidates().length > 0) {
                console.warn('Timeout for addRemoteCandidate. Consider sending ' + 'an end-of-candidates notification');
                transceiver.iceTransport.addRemoteCandidate({});
              }
            });
          }, 4000);

          return Promise.resolve();
        };

        RTCPeerConnection.prototype.close = function () {
          this.transceivers.forEach(function (transceiver) {
            /* not yet
            if (transceiver.iceGatherer) {
              transceiver.iceGatherer.close();
            }
            */
            if (transceiver.iceTransport) {
              transceiver.iceTransport.stop();
            }
            if (transceiver.dtlsTransport) {
              transceiver.dtlsTransport.stop();
            }
            if (transceiver.rtpSender) {
              transceiver.rtpSender.stop();
            }
            if (transceiver.rtpReceiver) {
              transceiver.rtpReceiver.stop();
            }
          });
          // FIXME: clean up tracks, local streams, remote streams, etc
          this._isClosed = true;
          this._updateSignalingState('closed');
        };

        // Update the signaling state.
        RTCPeerConnection.prototype._updateSignalingState = function (newState) {
          this.signalingState = newState;
          var event = new Event('signalingstatechange');
          this._dispatchEvent('signalingstatechange', event);
        };

        // Determine whether to fire the negotiationneeded event.
        RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function () {
          var pc = this;
          if (this.signalingState !== 'stable' || this.needNegotiation === true) {
            return;
          }
          this.needNegotiation = true;
          window.setTimeout(function () {
            if (pc.needNegotiation) {
              pc.needNegotiation = false;
              var event = new Event('negotiationneeded');
              pc._dispatchEvent('negotiationneeded', event);
            }
          }, 0);
        };

        // Update the ice connection state.
        RTCPeerConnection.prototype._updateIceConnectionState = function () {
          var newState;
          var states = {
            'new': 0,
            closed: 0,
            checking: 0,
            connected: 0,
            completed: 0,
            disconnected: 0,
            failed: 0
          };
          this.transceivers.forEach(function (transceiver) {
            states[transceiver.iceTransport.state]++;
          });

          newState = 'new';
          if (states.failed > 0) {
            newState = 'failed';
          } else if (states.checking > 0) {
            newState = 'checking';
          } else if (states.disconnected > 0) {
            newState = 'disconnected';
          } else if (states.new > 0) {
            newState = 'new';
          } else if (states.connected > 0) {
            newState = 'connected';
          } else if (states.completed > 0) {
            newState = 'completed';
          }

          if (newState !== this.iceConnectionState) {
            this.iceConnectionState = newState;
            var event = new Event('iceconnectionstatechange');
            this._dispatchEvent('iceconnectionstatechange', event);
          }
        };

        // Update the connection state.
        RTCPeerConnection.prototype._updateConnectionState = function () {
          var newState;
          var states = {
            'new': 0,
            closed: 0,
            connecting: 0,
            connected: 0,
            completed: 0,
            disconnected: 0,
            failed: 0
          };
          this.transceivers.forEach(function (transceiver) {
            states[transceiver.iceTransport.state]++;
            states[transceiver.dtlsTransport.state]++;
          });
          // ICETransport.completed and connected are the same for this purpose.
          states.connected += states.completed;

          newState = 'new';
          if (states.failed > 0) {
            newState = 'failed';
          } else if (states.connecting > 0) {
            newState = 'connecting';
          } else if (states.disconnected > 0) {
            newState = 'disconnected';
          } else if (states.new > 0) {
            newState = 'new';
          } else if (states.connected > 0) {
            newState = 'connected';
          }

          if (newState !== this.connectionState) {
            this.connectionState = newState;
            var event = new Event('connectionstatechange');
            this._dispatchEvent('connectionstatechange', event);
          }
        };

        RTCPeerConnection.prototype.createOffer = function () {
          var pc = this;

          if (pc._isClosed) {
            return Promise.reject(makeError('InvalidStateError', 'Can not call createOffer after close'));
          }

          var numAudioTracks = pc.transceivers.filter(function (t) {
            return t.kind === 'audio';
          }).length;
          var numVideoTracks = pc.transceivers.filter(function (t) {
            return t.kind === 'video';
          }).length;

          // Determine number of audio and video tracks we need to send/recv.
          var offerOptions = arguments[0];
          if (offerOptions) {
            // Reject Chrome legacy constraints.
            if (offerOptions.mandatory || offerOptions.optional) {
              throw new TypeError('Legacy mandatory/optional constraints not supported.');
            }
            if (offerOptions.offerToReceiveAudio !== undefined) {
              if (offerOptions.offerToReceiveAudio === true) {
                numAudioTracks = 1;
              } else if (offerOptions.offerToReceiveAudio === false) {
                numAudioTracks = 0;
              } else {
                numAudioTracks = offerOptions.offerToReceiveAudio;
              }
            }
            if (offerOptions.offerToReceiveVideo !== undefined) {
              if (offerOptions.offerToReceiveVideo === true) {
                numVideoTracks = 1;
              } else if (offerOptions.offerToReceiveVideo === false) {
                numVideoTracks = 0;
              } else {
                numVideoTracks = offerOptions.offerToReceiveVideo;
              }
            }
          }

          pc.transceivers.forEach(function (transceiver) {
            if (transceiver.kind === 'audio') {
              numAudioTracks--;
              if (numAudioTracks < 0) {
                transceiver.wantReceive = false;
              }
            } else if (transceiver.kind === 'video') {
              numVideoTracks--;
              if (numVideoTracks < 0) {
                transceiver.wantReceive = false;
              }
            }
          });

          // Create M-lines for recvonly streams.
          while (numAudioTracks > 0 || numVideoTracks > 0) {
            if (numAudioTracks > 0) {
              pc._createTransceiver('audio');
              numAudioTracks--;
            }
            if (numVideoTracks > 0) {
              pc._createTransceiver('video');
              numVideoTracks--;
            }
          }

          var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId, pc._sdpSessionVersion++);
          pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
            // For each track, create an ice gatherer, ice transport,
            // dtls transport, potentially rtpsender and rtpreceiver.
            var track = transceiver.track;
            var kind = transceiver.kind;
            var mid = transceiver.mid || SDPUtils.generateIdentifier();
            transceiver.mid = mid;

            if (!transceiver.iceGatherer) {
              transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex, pc.usingBundle);
            }

            var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
            // filter RTX until additional stuff needed for RTX is implemented
            // in adapter.js
            if (edgeVersion < 15019) {
              localCapabilities.codecs = localCapabilities.codecs.filter(function (codec) {
                return codec.name !== 'rtx';
              });
            }
            localCapabilities.codecs.forEach(function (codec) {
              // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
              // by adding level-asymmetry-allowed=1
              if (codec.name === 'H264' && codec.parameters['level-asymmetry-allowed'] === undefined) {
                codec.parameters['level-asymmetry-allowed'] = '1';
              }

              // for subsequent offers, we might have to re-use the payload
              // type of the last offer.
              if (transceiver.remoteCapabilities && transceiver.remoteCapabilities.codecs) {
                transceiver.remoteCapabilities.codecs.forEach(function (remoteCodec) {
                  if (codec.name.toLowerCase() === remoteCodec.name.toLowerCase() && codec.clockRate === remoteCodec.clockRate) {
                    codec.preferredPayloadType = remoteCodec.payloadType;
                  }
                });
              }
            });
            localCapabilities.headerExtensions.forEach(function (hdrExt) {
              var remoteExtensions = transceiver.remoteCapabilities && transceiver.remoteCapabilities.headerExtensions || [];
              remoteExtensions.forEach(function (rHdrExt) {
                if (hdrExt.uri === rHdrExt.uri) {
                  hdrExt.id = rHdrExt.id;
                }
              });
            });

            // generate an ssrc now, to be used later in rtpSender.send
            var sendEncodingParameters = transceiver.sendEncodingParameters || [{
              ssrc: (2 * sdpMLineIndex + 1) * 1001
            }];
            if (track) {
              // add RTX
              if (edgeVersion >= 15019 && kind === 'video' && !sendEncodingParameters[0].rtx) {
                sendEncodingParameters[0].rtx = {
                  ssrc: sendEncodingParameters[0].ssrc + 1
                };
              }
            }

            if (transceiver.wantReceive) {
              transceiver.rtpReceiver = new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);
            }

            transceiver.localCapabilities = localCapabilities;
            transceiver.sendEncodingParameters = sendEncodingParameters;
          });

          // always offer BUNDLE and dispose on return if not supported.
          if (pc._config.bundlePolicy !== 'max-compat') {
            sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function (t) {
              return t.mid;
            }).join(' ') + '\r\n';
          }
          sdp += 'a=ice-options:trickle\r\n';

          pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
            sdp += writeMediaSection(transceiver, transceiver.localCapabilities, 'offer', transceiver.stream, pc._dtlsRole);
            sdp += 'a=rtcp-rsize\r\n';

            if (transceiver.iceGatherer && pc.iceGatheringState !== 'new' && (sdpMLineIndex === 0 || !pc.usingBundle)) {
              transceiver.iceGatherer.getLocalCandidates().forEach(function (cand) {
                cand.component = 1;
                sdp += 'a=' + SDPUtils.writeCandidate(cand) + '\r\n';
              });

              if (transceiver.iceGatherer.state === 'completed') {
                sdp += 'a=end-of-candidates\r\n';
              }
            }
          });

          var desc = new window.RTCSessionDescription({
            type: 'offer',
            sdp: sdp
          });
          return Promise.resolve(desc);
        };

        RTCPeerConnection.prototype.createAnswer = function () {
          var pc = this;

          if (pc._isClosed) {
            return Promise.reject(makeError('InvalidStateError', 'Can not call createAnswer after close'));
          }

          if (!(pc.signalingState === 'have-remote-offer' || pc.signalingState === 'have-local-pranswer')) {
            return Promise.reject(makeError('InvalidStateError', 'Can not call createAnswer in signalingState ' + pc.signalingState));
          }

          var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId, pc._sdpSessionVersion++);
          if (pc.usingBundle) {
            sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function (t) {
              return t.mid;
            }).join(' ') + '\r\n';
          }
          var mediaSectionsInOffer = SDPUtils.getMediaSections(pc.remoteDescription.sdp).length;
          pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
            if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
              return;
            }
            if (transceiver.rejected) {
              if (transceiver.kind === 'application') {
                sdp += 'm=application 0 DTLS/SCTP 5000\r\n';
              } else if (transceiver.kind === 'audio') {
                sdp += 'm=audio 0 UDP/TLS/RTP/SAVPF 0\r\n' + 'a=rtpmap:0 PCMU/8000\r\n';
              } else if (transceiver.kind === 'video') {
                sdp += 'm=video 0 UDP/TLS/RTP/SAVPF 120\r\n' + 'a=rtpmap:120 VP8/90000\r\n';
              }
              sdp += 'c=IN IP4 0.0.0.0\r\n' + 'a=inactive\r\n' + 'a=mid:' + transceiver.mid + '\r\n';
              return;
            }

            // FIXME: look at direction.
            if (transceiver.stream) {
              var localTrack;
              if (transceiver.kind === 'audio') {
                localTrack = transceiver.stream.getAudioTracks()[0];
              } else if (transceiver.kind === 'video') {
                localTrack = transceiver.stream.getVideoTracks()[0];
              }
              if (localTrack) {
                // add RTX
                if (edgeVersion >= 15019 && transceiver.kind === 'video' && !transceiver.sendEncodingParameters[0].rtx) {
                  transceiver.sendEncodingParameters[0].rtx = {
                    ssrc: transceiver.sendEncodingParameters[0].ssrc + 1
                  };
                }
              }
            }

            // Calculate intersection of capabilities.
            var commonCapabilities = getCommonCapabilities(transceiver.localCapabilities, transceiver.remoteCapabilities);

            var hasRtx = commonCapabilities.codecs.filter(function (c) {
              return c.name.toLowerCase() === 'rtx';
            }).length;
            if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
              delete transceiver.sendEncodingParameters[0].rtx;
            }

            sdp += writeMediaSection(transceiver, commonCapabilities, 'answer', transceiver.stream, pc._dtlsRole);
            if (transceiver.rtcpParameters && transceiver.rtcpParameters.reducedSize) {
              sdp += 'a=rtcp-rsize\r\n';
            }
          });

          var desc = new window.RTCSessionDescription({
            type: 'answer',
            sdp: sdp
          });
          return Promise.resolve(desc);
        };

        RTCPeerConnection.prototype.addIceCandidate = function (candidate) {
          var pc = this;
          var sections;
          if (candidate && !(candidate.sdpMLineIndex !== undefined || candidate.sdpMid)) {
            return Promise.reject(new TypeError('sdpMLineIndex or sdpMid required'));
          }

          // TODO: needs to go into ops queue.
          return new Promise(function (resolve, reject) {
            if (!pc.remoteDescription) {
              return reject(makeError('InvalidStateError', 'Can not add ICE candidate without a remote description'));
            } else if (!candidate || candidate.candidate === '') {
              for (var j = 0; j < pc.transceivers.length; j++) {
                if (pc.transceivers[j].rejected) {
                  continue;
                }
                pc.transceivers[j].iceTransport.addRemoteCandidate({});
                sections = SDPUtils.getMediaSections(pc.remoteDescription.sdp);
                sections[j] += 'a=end-of-candidates\r\n';
                pc.remoteDescription.sdp = SDPUtils.getDescription(pc.remoteDescription.sdp) + sections.join('');
                if (pc.usingBundle) {
                  break;
                }
              }
            } else {
              var sdpMLineIndex = candidate.sdpMLineIndex;
              if (candidate.sdpMid) {
                for (var i = 0; i < pc.transceivers.length; i++) {
                  if (pc.transceivers[i].mid === candidate.sdpMid) {
                    sdpMLineIndex = i;
                    break;
                  }
                }
              }
              var transceiver = pc.transceivers[sdpMLineIndex];
              if (transceiver) {
                if (transceiver.rejected) {
                  return resolve();
                }
                var cand = Object.keys(candidate.candidate).length > 0 ? SDPUtils.parseCandidate(candidate.candidate) : {};
                // Ignore Chrome's invalid candidates since Edge does not like them.
                if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
                  return resolve();
                }
                // Ignore RTCP candidates, we assume RTCP-MUX.
                if (cand.component && cand.component !== 1) {
                  return resolve();
                }
                // when using bundle, avoid adding candidates to the wrong
                // ice transport. And avoid adding candidates added in the SDP.
                if (sdpMLineIndex === 0 || sdpMLineIndex > 0 && transceiver.iceTransport !== pc.transceivers[0].iceTransport) {
                  if (!maybeAddCandidate(transceiver.iceTransport, cand)) {
                    return reject(makeError('OperationError', 'Can not add ICE candidate'));
                  }
                }

                // update the remoteDescription.
                var candidateString = candidate.candidate.trim();
                if (candidateString.indexOf('a=') === 0) {
                  candidateString = candidateString.substr(2);
                }
                sections = SDPUtils.getMediaSections(pc.remoteDescription.sdp);
                sections[sdpMLineIndex] += 'a=' + (cand.type ? candidateString : 'end-of-candidates') + '\r\n';
                pc.remoteDescription.sdp = SDPUtils.getDescription(pc.remoteDescription.sdp) + sections.join('');
              } else {
                return reject(makeError('OperationError', 'Can not add ICE candidate'));
              }
            }
            resolve();
          });
        };

        RTCPeerConnection.prototype.getStats = function () {
          var promises = [];
          this.transceivers.forEach(function (transceiver) {
            ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport', 'dtlsTransport'].forEach(function (method) {
              if (transceiver[method]) {
                promises.push(transceiver[method].getStats());
              }
            });
          });
          var fixStatsType = function fixStatsType(stat) {
            return {
              inboundrtp: 'inbound-rtp',
              outboundrtp: 'outbound-rtp',
              candidatepair: 'candidate-pair',
              localcandidate: 'local-candidate',
              remotecandidate: 'remote-candidate'
            }[stat.type] || stat.type;
          };
          return new Promise(function (resolve) {
            // shim getStats with maplike support
            var results = new Map();
            Promise.all(promises).then(function (res) {
              res.forEach(function (result) {
                Object.keys(result).forEach(function (id) {
                  result[id].type = fixStatsType(result[id]);
                  results.set(id, result[id]);
                });
              });
              resolve(results);
            });
          });
        };

        // legacy callback shims. Should be moved to adapter.js some days.
        var methods = ['createOffer', 'createAnswer'];
        methods.forEach(function (method) {
          var nativeMethod = RTCPeerConnection.prototype[method];
          RTCPeerConnection.prototype[method] = function () {
            var args = arguments;
            if (typeof args[0] === 'function' || typeof args[1] === 'function') {
              // legacy
              return nativeMethod.apply(this, [arguments[2]]).then(function (description) {
                if (typeof args[0] === 'function') {
                  args[0].apply(null, [description]);
                }
              }, function (error) {
                if (typeof args[1] === 'function') {
                  args[1].apply(null, [error]);
                }
              });
            }
            return nativeMethod.apply(this, arguments);
          };
        });

        methods = ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'];
        methods.forEach(function (method) {
          var nativeMethod = RTCPeerConnection.prototype[method];
          RTCPeerConnection.prototype[method] = function () {
            var args = arguments;
            if (typeof args[1] === 'function' || typeof args[2] === 'function') {
              // legacy
              return nativeMethod.apply(this, arguments).then(function () {
                if (typeof args[1] === 'function') {
                  args[1].apply(null);
                }
              }, function (error) {
                if (typeof args[2] === 'function') {
                  args[2].apply(null, [error]);
                }
              });
            }
            return nativeMethod.apply(this, arguments);
          };
        });

        // getStats is special. It doesn't have a spec legacy method yet we support
        // getStats(something, cb) without error callbacks.
        ['getStats'].forEach(function (method) {
          var nativeMethod = RTCPeerConnection.prototype[method];
          RTCPeerConnection.prototype[method] = function () {
            var args = arguments;
            if (typeof args[1] === 'function') {
              return nativeMethod.apply(this, arguments).then(function () {
                if (typeof args[1] === 'function') {
                  args[1].apply(null);
                }
              });
            }
            return nativeMethod.apply(this, arguments);
          };
        });

        return RTCPeerConnection;
      };
    }, { "sdp": 2 }], 2: [function (require, module, exports) {
      /* eslint-env node */
      'use strict';

      // SDP helpers.

      var SDPUtils = {};

      // Generate an alphanumeric identifier for cname or mids.
      // TODO: use UUIDs instead? https://gist.github.com/jed/982883
      SDPUtils.generateIdentifier = function () {
        return Math.random().toString(36).substr(2, 10);
      };

      // The RTCP CNAME used by all peerconnections from the same JS.
      SDPUtils.localCName = SDPUtils.generateIdentifier();

      // Splits SDP into lines, dealing with both CRLF and LF.
      SDPUtils.splitLines = function (blob) {
        return blob.trim().split('\n').map(function (line) {
          return line.trim();
        });
      };
      // Splits SDP into sessionpart and mediasections. Ensures CRLF.
      SDPUtils.splitSections = function (blob) {
        var parts = blob.split('\nm=');
        return parts.map(function (part, index) {
          return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
        });
      };

      // returns the session description.
      SDPUtils.getDescription = function (blob) {
        var sections = SDPUtils.splitSections(blob);
        return sections && sections[0];
      };

      // returns the individual media sections.
      SDPUtils.getMediaSections = function (blob) {
        var sections = SDPUtils.splitSections(blob);
        sections.shift();
        return sections;
      };

      // Returns lines that start with a certain prefix.
      SDPUtils.matchPrefix = function (blob, prefix) {
        return SDPUtils.splitLines(blob).filter(function (line) {
          return line.indexOf(prefix) === 0;
        });
      };

      // Parses an ICE candidate line. Sample input:
      // candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
      // rport 55996"
      SDPUtils.parseCandidate = function (line) {
        var parts;
        // Parse both variants.
        if (line.indexOf('a=candidate:') === 0) {
          parts = line.substring(12).split(' ');
        } else {
          parts = line.substring(10).split(' ');
        }

        var candidate = {
          foundation: parts[0],
          component: parseInt(parts[1], 10),
          protocol: parts[2].toLowerCase(),
          priority: parseInt(parts[3], 10),
          ip: parts[4],
          port: parseInt(parts[5], 10),
          // skip parts[6] == 'typ'
          type: parts[7]
        };

        for (var i = 8; i < parts.length; i += 2) {
          switch (parts[i]) {
            case 'raddr':
              candidate.relatedAddress = parts[i + 1];
              break;
            case 'rport':
              candidate.relatedPort = parseInt(parts[i + 1], 10);
              break;
            case 'tcptype':
              candidate.tcpType = parts[i + 1];
              break;
            case 'ufrag':
              candidate.ufrag = parts[i + 1]; // for backward compability.
              candidate.usernameFragment = parts[i + 1];
              break;
            default:
              // extension handling, in particular ufrag
              candidate[parts[i]] = parts[i + 1];
              break;
          }
        }
        return candidate;
      };

      // Translates a candidate object into SDP candidate attribute.
      SDPUtils.writeCandidate = function (candidate) {
        var sdp = [];
        sdp.push(candidate.foundation);
        sdp.push(candidate.component);
        sdp.push(candidate.protocol.toUpperCase());
        sdp.push(candidate.priority);
        sdp.push(candidate.ip);
        sdp.push(candidate.port);

        var type = candidate.type;
        sdp.push('typ');
        sdp.push(type);
        if (type !== 'host' && candidate.relatedAddress && candidate.relatedPort) {
          sdp.push('raddr');
          sdp.push(candidate.relatedAddress); // was: relAddr
          sdp.push('rport');
          sdp.push(candidate.relatedPort); // was: relPort
        }
        if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
          sdp.push('tcptype');
          sdp.push(candidate.tcpType);
        }
        if (candidate.usernameFragment || candidate.ufrag) {
          sdp.push('ufrag');
          sdp.push(candidate.usernameFragment || candidate.ufrag);
        }
        return 'candidate:' + sdp.join(' ');
      };

      // Parses an ice-options line, returns an array of option tags.
      // a=ice-options:foo bar
      SDPUtils.parseIceOptions = function (line) {
        return line.substr(14).split(' ');
      };

      // Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
      // a=rtpmap:111 opus/48000/2
      SDPUtils.parseRtpMap = function (line) {
        var parts = line.substr(9).split(' ');
        var parsed = {
          payloadType: parseInt(parts.shift(), 10) // was: id
        };

        parts = parts[0].split('/');

        parsed.name = parts[0];
        parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
        // was: channels
        parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
        return parsed;
      };

      // Generate an a=rtpmap line from RTCRtpCodecCapability or
      // RTCRtpCodecParameters.
      SDPUtils.writeRtpMap = function (codec) {
        var pt = codec.payloadType;
        if (codec.preferredPayloadType !== undefined) {
          pt = codec.preferredPayloadType;
        }
        return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate + (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
      };

      // Parses an a=extmap line (headerextension from RFC 5285). Sample input:
      // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
      // a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
      SDPUtils.parseExtmap = function (line) {
        var parts = line.substr(9).split(' ');
        return {
          id: parseInt(parts[0], 10),
          direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
          uri: parts[1]
        };
      };

      // Generates a=extmap line from RTCRtpHeaderExtensionParameters or
      // RTCRtpHeaderExtension.
      SDPUtils.writeExtmap = function (headerExtension) {
        return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== 'sendrecv' ? '/' + headerExtension.direction : '') + ' ' + headerExtension.uri + '\r\n';
      };

      // Parses an ftmp line, returns dictionary. Sample input:
      // a=fmtp:96 vbr=on;cng=on
      // Also deals with vbr=on; cng=on
      SDPUtils.parseFmtp = function (line) {
        var parsed = {};
        var kv;
        var parts = line.substr(line.indexOf(' ') + 1).split(';');
        for (var j = 0; j < parts.length; j++) {
          kv = parts[j].trim().split('=');
          parsed[kv[0].trim()] = kv[1];
        }
        return parsed;
      };

      // Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
      SDPUtils.writeFmtp = function (codec) {
        var line = '';
        var pt = codec.payloadType;
        if (codec.preferredPayloadType !== undefined) {
          pt = codec.preferredPayloadType;
        }
        if (codec.parameters && Object.keys(codec.parameters).length) {
          var params = [];
          Object.keys(codec.parameters).forEach(function (param) {
            params.push(param + '=' + codec.parameters[param]);
          });
          line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
        }
        return line;
      };

      // Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
      // a=rtcp-fb:98 nack rpsi
      SDPUtils.parseRtcpFb = function (line) {
        var parts = line.substr(line.indexOf(' ') + 1).split(' ');
        return {
          type: parts.shift(),
          parameter: parts.join(' ')
        };
      };
      // Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
      SDPUtils.writeRtcpFb = function (codec) {
        var lines = '';
        var pt = codec.payloadType;
        if (codec.preferredPayloadType !== undefined) {
          pt = codec.preferredPayloadType;
        }
        if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
          // FIXME: special handling for trr-int?
          codec.rtcpFeedback.forEach(function (fb) {
            lines += 'a=rtcp-fb:' + pt + ' ' + fb.type + (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') + '\r\n';
          });
        }
        return lines;
      };

      // Parses an RFC 5576 ssrc media attribute. Sample input:
      // a=ssrc:3735928559 cname:something
      SDPUtils.parseSsrcMedia = function (line) {
        var sp = line.indexOf(' ');
        var parts = {
          ssrc: parseInt(line.substr(7, sp - 7), 10)
        };
        var colon = line.indexOf(':', sp);
        if (colon > -1) {
          parts.attribute = line.substr(sp + 1, colon - sp - 1);
          parts.value = line.substr(colon + 1);
        } else {
          parts.attribute = line.substr(sp + 1);
        }
        return parts;
      };

      // Extracts the MID (RFC 5888) from a media section.
      // returns the MID or undefined if no mid line was found.
      SDPUtils.getMid = function (mediaSection) {
        var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
        if (mid) {
          return mid.substr(6);
        }
      };

      SDPUtils.parseFingerprint = function (line) {
        var parts = line.substr(14).split(' ');
        return {
          algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
          value: parts[1]
        };
      };

      // Extracts DTLS parameters from SDP media section or sessionpart.
      // FIXME: for consistency with other functions this should only
      //   get the fingerprint line as input. See also getIceParameters.
      SDPUtils.getDtlsParameters = function (mediaSection, sessionpart) {
        var lines = SDPUtils.matchPrefix(mediaSection + sessionpart, 'a=fingerprint:');
        // Note: a=setup line is ignored since we use the 'auto' role.
        // Note2: 'algorithm' is not case sensitive except in Edge.
        return {
          role: 'auto',
          fingerprints: lines.map(SDPUtils.parseFingerprint)
        };
      };

      // Serializes DTLS parameters to SDP.
      SDPUtils.writeDtlsParameters = function (params, setupType) {
        var sdp = 'a=setup:' + setupType + '\r\n';
        params.fingerprints.forEach(function (fp) {
          sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
        });
        return sdp;
      };
      // Parses ICE information from SDP media section or sessionpart.
      // FIXME: for consistency with other functions this should only
      //   get the ice-ufrag and ice-pwd lines as input.
      SDPUtils.getIceParameters = function (mediaSection, sessionpart) {
        var lines = SDPUtils.splitLines(mediaSection);
        // Search in session part, too.
        lines = lines.concat(SDPUtils.splitLines(sessionpart));
        var iceParameters = {
          usernameFragment: lines.filter(function (line) {
            return line.indexOf('a=ice-ufrag:') === 0;
          })[0].substr(12),
          password: lines.filter(function (line) {
            return line.indexOf('a=ice-pwd:') === 0;
          })[0].substr(10)
        };
        return iceParameters;
      };

      // Serializes ICE parameters to SDP.
      SDPUtils.writeIceParameters = function (params) {
        return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' + 'a=ice-pwd:' + params.password + '\r\n';
      };

      // Parses the SDP media section and returns RTCRtpParameters.
      SDPUtils.parseRtpParameters = function (mediaSection) {
        var description = {
          codecs: [],
          headerExtensions: [],
          fecMechanisms: [],
          rtcp: []
        };
        var lines = SDPUtils.splitLines(mediaSection);
        var mline = lines[0].split(' ');
        for (var i = 3; i < mline.length; i++) {
          // find all codecs from mline[3..]
          var pt = mline[i];
          var rtpmapline = SDPUtils.matchPrefix(mediaSection, 'a=rtpmap:' + pt + ' ')[0];
          if (rtpmapline) {
            var codec = SDPUtils.parseRtpMap(rtpmapline);
            var fmtps = SDPUtils.matchPrefix(mediaSection, 'a=fmtp:' + pt + ' ');
            // Only the first a=fmtp:<pt> is considered.
            codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
            codec.rtcpFeedback = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-fb:' + pt + ' ').map(SDPUtils.parseRtcpFb);
            description.codecs.push(codec);
            // parse FEC mechanisms from rtpmap lines.
            switch (codec.name.toUpperCase()) {
              case 'RED':
              case 'ULPFEC':
                description.fecMechanisms.push(codec.name.toUpperCase());
                break;
              default:
                // only RED and ULPFEC are recognized as FEC mechanisms.
                break;
            }
          }
        }
        SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function (line) {
          description.headerExtensions.push(SDPUtils.parseExtmap(line));
        });
        // FIXME: parse rtcp.
        return description;
      };

      // Generates parts of the SDP media section describing the capabilities /
      // parameters.
      SDPUtils.writeRtpDescription = function (kind, caps) {
        var sdp = '';

        // Build the mline.
        sdp += 'm=' + kind + ' ';
        sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
        sdp += ' UDP/TLS/RTP/SAVPF ';
        sdp += caps.codecs.map(function (codec) {
          if (codec.preferredPayloadType !== undefined) {
            return codec.preferredPayloadType;
          }
          return codec.payloadType;
        }).join(' ') + '\r\n';

        sdp += 'c=IN IP4 0.0.0.0\r\n';
        sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

        // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
        caps.codecs.forEach(function (codec) {
          sdp += SDPUtils.writeRtpMap(codec);
          sdp += SDPUtils.writeFmtp(codec);
          sdp += SDPUtils.writeRtcpFb(codec);
        });
        var maxptime = 0;
        caps.codecs.forEach(function (codec) {
          if (codec.maxptime > maxptime) {
            maxptime = codec.maxptime;
          }
        });
        if (maxptime > 0) {
          sdp += 'a=maxptime:' + maxptime + '\r\n';
        }
        sdp += 'a=rtcp-mux\r\n';

        caps.headerExtensions.forEach(function (extension) {
          sdp += SDPUtils.writeExtmap(extension);
        });
        // FIXME: write fecMechanisms.
        return sdp;
      };

      // Parses the SDP media section and returns an array of
      // RTCRtpEncodingParameters.
      SDPUtils.parseRtpEncodingParameters = function (mediaSection) {
        var encodingParameters = [];
        var description = SDPUtils.parseRtpParameters(mediaSection);
        var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
        var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

        // filter a=ssrc:... cname:, ignore PlanB-msid
        var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
          return SDPUtils.parseSsrcMedia(line);
        }).filter(function (parts) {
          return parts.attribute === 'cname';
        });
        var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
        var secondarySsrc;

        var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID').map(function (line) {
          var parts = line.split(' ');
          parts.shift();
          return parts.map(function (part) {
            return parseInt(part, 10);
          });
        });
        if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
          secondarySsrc = flows[0][1];
        }

        description.codecs.forEach(function (codec) {
          if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
            var encParam = {
              ssrc: primarySsrc,
              codecPayloadType: parseInt(codec.parameters.apt, 10),
              rtx: {
                ssrc: secondarySsrc
              }
            };
            encodingParameters.push(encParam);
            if (hasRed) {
              encParam = JSON.parse(JSON.stringify(encParam));
              encParam.fec = {
                ssrc: secondarySsrc,
                mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
              };
              encodingParameters.push(encParam);
            }
          }
        });
        if (encodingParameters.length === 0 && primarySsrc) {
          encodingParameters.push({
            ssrc: primarySsrc
          });
        }

        // we support both b=AS and b=TIAS but interpret AS as TIAS.
        var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
        if (bandwidth.length) {
          if (bandwidth[0].indexOf('b=TIAS:') === 0) {
            bandwidth = parseInt(bandwidth[0].substr(7), 10);
          } else if (bandwidth[0].indexOf('b=AS:') === 0) {
            // use formula from JSEP to convert b=AS to TIAS value.
            bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95 - 50 * 40 * 8;
          } else {
            bandwidth = undefined;
          }
          encodingParameters.forEach(function (params) {
            params.maxBitrate = bandwidth;
          });
        }
        return encodingParameters;
      };

      // parses http://draft.ortc.org/#rtcrtcpparameters*
      SDPUtils.parseRtcpParameters = function (mediaSection) {
        var rtcpParameters = {};

        var cname;
        // Gets the first SSRC. Note that with RTX there might be multiple
        // SSRCs.
        var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
          return SDPUtils.parseSsrcMedia(line);
        }).filter(function (obj) {
          return obj.attribute === 'cname';
        })[0];
        if (remoteSsrc) {
          rtcpParameters.cname = remoteSsrc.value;
          rtcpParameters.ssrc = remoteSsrc.ssrc;
        }

        // Edge uses the compound attribute instead of reducedSize
        // compound is !reducedSize
        var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
        rtcpParameters.reducedSize = rsize.length > 0;
        rtcpParameters.compound = rsize.length === 0;

        // parses the rtcp-mux attrіbute.
        // Note that Edge does not support unmuxed RTCP.
        var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
        rtcpParameters.mux = mux.length > 0;

        return rtcpParameters;
      };

      // parses either a=msid: or a=ssrc:... msid lines and returns
      // the id of the MediaStream and MediaStreamTrack.
      SDPUtils.parseMsid = function (mediaSection) {
        var parts;
        var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
        if (spec.length === 1) {
          parts = spec[0].substr(7).split(' ');
          return { stream: parts[0], track: parts[1] };
        }
        var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
          return SDPUtils.parseSsrcMedia(line);
        }).filter(function (parts) {
          return parts.attribute === 'msid';
        });
        if (planB.length > 0) {
          parts = planB[0].value.split(' ');
          return { stream: parts[0], track: parts[1] };
        }
      };

      // Generate a session ID for SDP.
      // https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
      // recommends using a cryptographically random +ve 64-bit value
      // but right now this should be acceptable and within the right range
      SDPUtils.generateSessionId = function () {
        return Math.random().toString().substr(2, 21);
      };

      // Write boilder plate for start of SDP
      // sessId argument is optional - if not supplied it will
      // be generated randomly
      // sessVersion is optional and defaults to 2
      SDPUtils.writeSessionBoilerplate = function (sessId, sessVer) {
        var sessionId;
        var version = sessVer !== undefined ? sessVer : 2;
        if (sessId) {
          sessionId = sessId;
        } else {
          sessionId = SDPUtils.generateSessionId();
        }
        // FIXME: sess-id should be an NTP timestamp.
        return 'v=0\r\n' + 'o=thisisadapterortc ' + sessionId + ' ' + version + ' IN IP4 127.0.0.1\r\n' + 's=-\r\n' + 't=0 0\r\n';
      };

      SDPUtils.writeMediaSection = function (transceiver, caps, type, stream) {
        var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

        // Map ICE parameters (ufrag, pwd) to SDP.
        sdp += SDPUtils.writeIceParameters(transceiver.iceGatherer.getLocalParameters());

        // Map DTLS parameters to SDP.
        sdp += SDPUtils.writeDtlsParameters(transceiver.dtlsTransport.getLocalParameters(), type === 'offer' ? 'actpass' : 'active');

        sdp += 'a=mid:' + transceiver.mid + '\r\n';

        if (transceiver.direction) {
          sdp += 'a=' + transceiver.direction + '\r\n';
        } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
          sdp += 'a=sendrecv\r\n';
        } else if (transceiver.rtpSender) {
          sdp += 'a=sendonly\r\n';
        } else if (transceiver.rtpReceiver) {
          sdp += 'a=recvonly\r\n';
        } else {
          sdp += 'a=inactive\r\n';
        }

        if (transceiver.rtpSender) {
          // spec.
          var msid = 'msid:' + stream.id + ' ' + transceiver.rtpSender.track.id + '\r\n';
          sdp += 'a=' + msid;

          // for Chrome.
          sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' ' + msid;
          if (transceiver.sendEncodingParameters[0].rtx) {
            sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc + ' ' + msid;
            sdp += 'a=ssrc-group:FID ' + transceiver.sendEncodingParameters[0].ssrc + ' ' + transceiver.sendEncodingParameters[0].rtx.ssrc + '\r\n';
          }
        }
        // FIXME: this should be written by writeRtpDescription.
        sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
        if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
          sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc + ' cname:' + SDPUtils.localCName + '\r\n';
        }
        return sdp;
      };

      // Gets the direction from the mediaSection or the sessionpart.
      SDPUtils.getDirection = function (mediaSection, sessionpart) {
        // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
        var lines = SDPUtils.splitLines(mediaSection);
        for (var i = 0; i < lines.length; i++) {
          switch (lines[i]) {
            case 'a=sendrecv':
            case 'a=sendonly':
            case 'a=recvonly':
            case 'a=inactive':
              return lines[i].substr(2);
            default:
            // FIXME: What should happen here?
          }
        }
        if (sessionpart) {
          return SDPUtils.getDirection(sessionpart);
        }
        return 'sendrecv';
      };

      SDPUtils.getKind = function (mediaSection) {
        var lines = SDPUtils.splitLines(mediaSection);
        var mline = lines[0].split(' ');
        return mline[0].substr(2);
      };

      SDPUtils.isRejected = function (mediaSection) {
        return mediaSection.split(' ', 2)[1] === '0';
      };

      SDPUtils.parseMLine = function (mediaSection) {
        var lines = SDPUtils.splitLines(mediaSection);
        var parts = lines[0].substr(2).split(' ');
        return {
          kind: parts[0],
          port: parseInt(parts[1], 10),
          protocol: parts[2],
          fmt: parts.slice(3).join(' ')
        };
      };

      SDPUtils.parseOLine = function (mediaSection) {
        var line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
        var parts = line.substr(2).split(' ');
        return {
          username: parts[0],
          sessionId: parts[1],
          sessionVersion: parseInt(parts[2], 10),
          netType: parts[3],
          addressType: parts[4],
          address: parts[5]
        };
      };

      // Expose public methods.
      if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object') {
        module.exports = SDPUtils;
      }
    }, {}], 3: [function (require, module, exports) {
      (function (global) {
        /*
         *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
         *
         *  Use of this source code is governed by a BSD-style license
         *  that can be found in the LICENSE file in the root of the source
         *  tree.
         */
        /* eslint-env node */

        'use strict';

        var adapterFactory = require('./adapter_factory.js');
        module.exports = adapterFactory({ window: global.window });
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, { "./adapter_factory.js": 4 }], 4: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */

      'use strict';

      var utils = require('./utils');
      // Shimming starts here.
      module.exports = function (dependencies, opts) {
        var window = dependencies && dependencies.window;

        var options = {
          shimChrome: true,
          shimFirefox: true,
          shimEdge: true,
          shimSafari: true
        };

        for (var key in opts) {
          if (hasOwnProperty.call(opts, key)) {
            options[key] = opts[key];
          }
        }

        // Utils.
        var logging = utils.log;
        var browserDetails = utils.detectBrowser(window);

        // Uncomment the line below if you want logging to occur, including logging
        // for the switch statement below. Can also be turned on in the browser via
        // adapter.disableLog(false), but then logging from the switch statement below
        // will not appear.
        // require('./utils').disableLog(false);

        // Browser shims.
        var chromeShim = require('./chrome/chrome_shim') || null;
        var edgeShim = require('./edge/edge_shim') || null;
        var firefoxShim = require('./firefox/firefox_shim') || null;
        var safariShim = require('./safari/safari_shim') || null;
        var commonShim = require('./common_shim') || null;

        // Export to the adapter global object visible in the browser.
        var adapter = {
          browserDetails: browserDetails,
          commonShim: commonShim,
          extractVersion: utils.extractVersion,
          disableLog: utils.disableLog,
          disableWarnings: utils.disableWarnings
        };

        // Shim browser if found.
        switch (browserDetails.browser) {
          case 'chrome':
            if (!chromeShim || !chromeShim.shimPeerConnection || !options.shimChrome) {
              logging('Chrome shim is not included in this adapter release.');
              return adapter;
            }
            logging('adapter.js shimming chrome.');
            // Export to the adapter global object visible in the browser.
            adapter.browserShim = chromeShim;
            commonShim.shimCreateObjectURL(window);

            chromeShim.shimGetUserMedia(window);
            chromeShim.shimMediaStream(window);
            chromeShim.shimSourceObject(window);
            chromeShim.shimPeerConnection(window);
            chromeShim.shimOnTrack(window);
            chromeShim.shimAddTrackRemoveTrack(window);
            chromeShim.shimGetSendersWithDtmf(window);

            commonShim.shimRTCIceCandidate(window);
            commonShim.shimMaxMessageSize(window);
            commonShim.shimSendThrowTypeError(window);
            break;
          case 'firefox':
            if (!firefoxShim || !firefoxShim.shimPeerConnection || !options.shimFirefox) {
              logging('Firefox shim is not included in this adapter release.');
              return adapter;
            }
            logging('adapter.js shimming firefox.');
            // Export to the adapter global object visible in the browser.
            adapter.browserShim = firefoxShim;
            commonShim.shimCreateObjectURL(window);

            firefoxShim.shimGetUserMedia(window);
            firefoxShim.shimSourceObject(window);
            firefoxShim.shimPeerConnection(window);
            firefoxShim.shimOnTrack(window);
            firefoxShim.shimRemoveStream(window);

            commonShim.shimRTCIceCandidate(window);
            commonShim.shimMaxMessageSize(window);
            commonShim.shimSendThrowTypeError(window);
            break;
          case 'edge':
            if (!edgeShim || !edgeShim.shimPeerConnection || !options.shimEdge) {
              logging('MS edge shim is not included in this adapter release.');
              return adapter;
            }
            logging('adapter.js shimming edge.');
            // Export to the adapter global object visible in the browser.
            adapter.browserShim = edgeShim;
            commonShim.shimCreateObjectURL(window);

            edgeShim.shimGetUserMedia(window);
            edgeShim.shimPeerConnection(window);
            edgeShim.shimReplaceTrack(window);

            // the edge shim implements the full RTCIceCandidate object.

            commonShim.shimMaxMessageSize(window);
            commonShim.shimSendThrowTypeError(window);
            break;
          case 'safari':
            if (!safariShim || !options.shimSafari) {
              logging('Safari shim is not included in this adapter release.');
              return adapter;
            }
            logging('adapter.js shimming safari.');
            // Export to the adapter global object visible in the browser.
            adapter.browserShim = safariShim;
            commonShim.shimCreateObjectURL(window);

            safariShim.shimRTCIceServerUrls(window);
            safariShim.shimCallbacksAPI(window);
            safariShim.shimLocalStreamsAPI(window);
            safariShim.shimRemoteStreamsAPI(window);
            safariShim.shimTrackEventTransceiver(window);
            safariShim.shimGetUserMedia(window);
            safariShim.shimCreateOfferLegacy(window);

            commonShim.shimRTCIceCandidate(window);
            commonShim.shimMaxMessageSize(window);
            commonShim.shimSendThrowTypeError(window);
            break;
          default:
            logging('Unsupported browser!');
            break;
        }

        return adapter;
      };
    }, { "./chrome/chrome_shim": 5, "./common_shim": 7, "./edge/edge_shim": 8, "./firefox/firefox_shim": 10, "./safari/safari_shim": 12, "./utils": 13 }], 5: [function (require, module, exports) {

      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var utils = require('../utils.js');
      var logging = utils.log;

      module.exports = {
        shimGetUserMedia: require('./getusermedia'),
        shimMediaStream: function shimMediaStream(window) {
          window.MediaStream = window.MediaStream || window.webkitMediaStream;
        },

        shimOnTrack: function shimOnTrack(window) {
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && !('ontrack' in window.RTCPeerConnection.prototype)) {
            Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
              get: function get() {
                return this._ontrack;
              },
              set: function set(f) {
                if (this._ontrack) {
                  this.removeEventListener('track', this._ontrack);
                }
                this.addEventListener('track', this._ontrack = f);
              }
            });
            var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
            window.RTCPeerConnection.prototype.setRemoteDescription = function () {
              var pc = this;
              if (!pc._ontrackpoly) {
                pc._ontrackpoly = function (e) {
                  // onaddstream does not fire when a track is added to an existing
                  // stream. But stream.onaddtrack is implemented so we use that.
                  e.stream.addEventListener('addtrack', function (te) {
                    var receiver;
                    if (window.RTCPeerConnection.prototype.getReceivers) {
                      receiver = pc.getReceivers().find(function (r) {
                        return r.track && r.track.id === te.track.id;
                      });
                    } else {
                      receiver = { track: te.track };
                    }

                    var event = new Event('track');
                    event.track = te.track;
                    event.receiver = receiver;
                    event.transceiver = { receiver: receiver };
                    event.streams = [e.stream];
                    pc.dispatchEvent(event);
                  });
                  e.stream.getTracks().forEach(function (track) {
                    var receiver;
                    if (window.RTCPeerConnection.prototype.getReceivers) {
                      receiver = pc.getReceivers().find(function (r) {
                        return r.track && r.track.id === track.id;
                      });
                    } else {
                      receiver = { track: track };
                    }
                    var event = new Event('track');
                    event.track = track;
                    event.receiver = receiver;
                    event.transceiver = { receiver: receiver };
                    event.streams = [e.stream];
                    pc.dispatchEvent(event);
                  });
                };
                pc.addEventListener('addstream', pc._ontrackpoly);
              }
              return origSetRemoteDescription.apply(pc, arguments);
            };
          } else if (!('RTCRtpTransceiver' in window)) {
            utils.wrapPeerConnectionEvent(window, 'track', function (e) {
              if (!e.transceiver) {
                e.transceiver = { receiver: e.receiver };
              }
              return e;
            });
          }
        },

        shimGetSendersWithDtmf: function shimGetSendersWithDtmf(window) {
          // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && !('getSenders' in window.RTCPeerConnection.prototype) && 'createDTMFSender' in window.RTCPeerConnection.prototype) {
            var shimSenderWithDtmf = function shimSenderWithDtmf(pc, track) {
              return {
                track: track,
                get dtmf() {
                  if (this._dtmf === undefined) {
                    if (track.kind === 'audio') {
                      this._dtmf = pc.createDTMFSender(track);
                    } else {
                      this._dtmf = null;
                    }
                  }
                  return this._dtmf;
                },
                _pc: pc
              };
            };

            // augment addTrack when getSenders is not available.
            if (!window.RTCPeerConnection.prototype.getSenders) {
              window.RTCPeerConnection.prototype.getSenders = function () {
                this._senders = this._senders || [];
                return this._senders.slice(); // return a copy of the internal state.
              };
              var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
              window.RTCPeerConnection.prototype.addTrack = function (track, stream) {
                var pc = this;
                var sender = origAddTrack.apply(pc, arguments);
                if (!sender) {
                  sender = shimSenderWithDtmf(pc, track);
                  pc._senders.push(sender);
                }
                return sender;
              };

              var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
              window.RTCPeerConnection.prototype.removeTrack = function (sender) {
                var pc = this;
                origRemoveTrack.apply(pc, arguments);
                var idx = pc._senders.indexOf(sender);
                if (idx !== -1) {
                  pc._senders.splice(idx, 1);
                }
              };
            }
            var origAddStream = window.RTCPeerConnection.prototype.addStream;
            window.RTCPeerConnection.prototype.addStream = function (stream) {
              var pc = this;
              pc._senders = pc._senders || [];
              origAddStream.apply(pc, [stream]);
              stream.getTracks().forEach(function (track) {
                pc._senders.push(shimSenderWithDtmf(pc, track));
              });
            };

            var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
            window.RTCPeerConnection.prototype.removeStream = function (stream) {
              var pc = this;
              pc._senders = pc._senders || [];
              origRemoveStream.apply(pc, [stream]);

              stream.getTracks().forEach(function (track) {
                var sender = pc._senders.find(function (s) {
                  return s.track === track;
                });
                if (sender) {
                  pc._senders.splice(pc._senders.indexOf(sender), 1); // remove sender
                }
              });
            };
          } else if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && 'getSenders' in window.RTCPeerConnection.prototype && 'createDTMFSender' in window.RTCPeerConnection.prototype && window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
            var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
            window.RTCPeerConnection.prototype.getSenders = function () {
              var pc = this;
              var senders = origGetSenders.apply(pc, []);
              senders.forEach(function (sender) {
                sender._pc = pc;
              });
              return senders;
            };

            Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
              get: function get() {
                if (this._dtmf === undefined) {
                  if (this.track.kind === 'audio') {
                    this._dtmf = this._pc.createDTMFSender(this.track);
                  } else {
                    this._dtmf = null;
                  }
                }
                return this._dtmf;
              }
            });
          }
        },

        shimSourceObject: function shimSourceObject(window) {
          var URL = window && window.URL;

          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object') {
            if (window.HTMLMediaElement && !('srcObject' in window.HTMLMediaElement.prototype)) {
              // Shim the srcObject property, once, when HTMLMediaElement is found.
              Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                get: function get() {
                  return this._srcObject;
                },
                set: function set(stream) {
                  var self = this;
                  // Use _srcObject as a private property for this shim
                  this._srcObject = stream;
                  if (this.src) {
                    URL.revokeObjectURL(this.src);
                  }

                  if (!stream) {
                    this.src = '';
                    return undefined;
                  }
                  this.src = URL.createObjectURL(stream);
                  // We need to recreate the blob url when a track is added or
                  // removed. Doing it manually since we want to avoid a recursion.
                  stream.addEventListener('addtrack', function () {
                    if (self.src) {
                      URL.revokeObjectURL(self.src);
                    }
                    self.src = URL.createObjectURL(stream);
                  });
                  stream.addEventListener('removetrack', function () {
                    if (self.src) {
                      URL.revokeObjectURL(self.src);
                    }
                    self.src = URL.createObjectURL(stream);
                  });
                }
              });
            }
          }
        },

        shimAddTrackRemoveTrackWithNative: function shimAddTrackRemoveTrackWithNative(window) {
          // shim addTrack/removeTrack with native variants in order to make
          // the interactions with legacy getLocalStreams behave as in other browsers.
          // Keeps a mapping stream.id => [stream, rtpsenders...]
          window.RTCPeerConnection.prototype.getLocalStreams = function () {
            var pc = this;
            this._shimmedLocalStreams = this._shimmedLocalStreams || {};
            return Object.keys(this._shimmedLocalStreams).map(function (streamId) {
              return pc._shimmedLocalStreams[streamId][0];
            });
          };

          var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
          window.RTCPeerConnection.prototype.addTrack = function (track, stream) {
            if (!stream) {
              return origAddTrack.apply(this, arguments);
            }
            this._shimmedLocalStreams = this._shimmedLocalStreams || {};

            var sender = origAddTrack.apply(this, arguments);
            if (!this._shimmedLocalStreams[stream.id]) {
              this._shimmedLocalStreams[stream.id] = [stream, sender];
            } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
              this._shimmedLocalStreams[stream.id].push(sender);
            }
            return sender;
          };

          var origAddStream = window.RTCPeerConnection.prototype.addStream;
          window.RTCPeerConnection.prototype.addStream = function (stream) {
            var pc = this;
            this._shimmedLocalStreams = this._shimmedLocalStreams || {};

            stream.getTracks().forEach(function (track) {
              var alreadyExists = pc.getSenders().find(function (s) {
                return s.track === track;
              });
              if (alreadyExists) {
                throw new DOMException('Track already exists.', 'InvalidAccessError');
              }
            });
            var existingSenders = pc.getSenders();
            origAddStream.apply(this, arguments);
            var newSenders = pc.getSenders().filter(function (newSender) {
              return existingSenders.indexOf(newSender) === -1;
            });
            this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
          };

          var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
          window.RTCPeerConnection.prototype.removeStream = function (stream) {
            this._shimmedLocalStreams = this._shimmedLocalStreams || {};
            delete this._shimmedLocalStreams[stream.id];
            return origRemoveStream.apply(this, arguments);
          };

          var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
          window.RTCPeerConnection.prototype.removeTrack = function (sender) {
            var pc = this;
            this._shimmedLocalStreams = this._shimmedLocalStreams || {};
            if (sender) {
              Object.keys(this._shimmedLocalStreams).forEach(function (streamId) {
                var idx = pc._shimmedLocalStreams[streamId].indexOf(sender);
                if (idx !== -1) {
                  pc._shimmedLocalStreams[streamId].splice(idx, 1);
                }
                if (pc._shimmedLocalStreams[streamId].length === 1) {
                  delete pc._shimmedLocalStreams[streamId];
                }
              });
            }
            return origRemoveTrack.apply(this, arguments);
          };
        },

        shimAddTrackRemoveTrack: function shimAddTrackRemoveTrack(window) {
          var browserDetails = utils.detectBrowser(window);
          // shim addTrack and removeTrack.
          if (window.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
            return this.shimAddTrackRemoveTrackWithNative(window);
          }

          // also shim pc.getLocalStreams when addTrack is shimmed
          // to return the original streams.
          var origGetLocalStreams = window.RTCPeerConnection.prototype.getLocalStreams;
          window.RTCPeerConnection.prototype.getLocalStreams = function () {
            var pc = this;
            var nativeStreams = origGetLocalStreams.apply(this);
            pc._reverseStreams = pc._reverseStreams || {};
            return nativeStreams.map(function (stream) {
              return pc._reverseStreams[stream.id];
            });
          };

          var origAddStream = window.RTCPeerConnection.prototype.addStream;
          window.RTCPeerConnection.prototype.addStream = function (stream) {
            var pc = this;
            pc._streams = pc._streams || {};
            pc._reverseStreams = pc._reverseStreams || {};

            stream.getTracks().forEach(function (track) {
              var alreadyExists = pc.getSenders().find(function (s) {
                return s.track === track;
              });
              if (alreadyExists) {
                throw new DOMException('Track already exists.', 'InvalidAccessError');
              }
            });
            // Add identity mapping for consistency with addTrack.
            // Unless this is being used with a stream from addTrack.
            if (!pc._reverseStreams[stream.id]) {
              var newStream = new window.MediaStream(stream.getTracks());
              pc._streams[stream.id] = newStream;
              pc._reverseStreams[newStream.id] = stream;
              stream = newStream;
            }
            origAddStream.apply(pc, [stream]);
          };

          var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
          window.RTCPeerConnection.prototype.removeStream = function (stream) {
            var pc = this;
            pc._streams = pc._streams || {};
            pc._reverseStreams = pc._reverseStreams || {};

            origRemoveStream.apply(pc, [pc._streams[stream.id] || stream]);
            delete pc._reverseStreams[pc._streams[stream.id] ? pc._streams[stream.id].id : stream.id];
            delete pc._streams[stream.id];
          };

          window.RTCPeerConnection.prototype.addTrack = function (track, stream) {
            var pc = this;
            if (pc.signalingState === 'closed') {
              throw new DOMException('The RTCPeerConnection\'s signalingState is \'closed\'.', 'InvalidStateError');
            }
            var streams = [].slice.call(arguments, 1);
            if (streams.length !== 1 || !streams[0].getTracks().find(function (t) {
              return t === track;
            })) {
              // this is not fully correct but all we can manage without
              // [[associated MediaStreams]] internal slot.
              throw new DOMException('The adapter.js addTrack polyfill only supports a single ' + ' stream which is associated with the specified track.', 'NotSupportedError');
            }

            var alreadyExists = pc.getSenders().find(function (s) {
              return s.track === track;
            });
            if (alreadyExists) {
              throw new DOMException('Track already exists.', 'InvalidAccessError');
            }

            pc._streams = pc._streams || {};
            pc._reverseStreams = pc._reverseStreams || {};
            var oldStream = pc._streams[stream.id];
            if (oldStream) {
              // this is using odd Chrome behaviour, use with caution:
              // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
              // Note: we rely on the high-level addTrack/dtmf shim to
              // create the sender with a dtmf sender.
              oldStream.addTrack(track);

              // Trigger ONN async.
              Promise.resolve().then(function () {
                pc.dispatchEvent(new Event('negotiationneeded'));
              });
            } else {
              var newStream = new window.MediaStream([track]);
              pc._streams[stream.id] = newStream;
              pc._reverseStreams[newStream.id] = stream;
              pc.addStream(newStream);
            }
            return pc.getSenders().find(function (s) {
              return s.track === track;
            });
          };

          // replace the internal stream id with the external one and
          // vice versa.
          function replaceInternalStreamId(pc, description) {
            var sdp = description.sdp;
            Object.keys(pc._reverseStreams || []).forEach(function (internalId) {
              var externalStream = pc._reverseStreams[internalId];
              var internalStream = pc._streams[externalStream.id];
              sdp = sdp.replace(new RegExp(internalStream.id, 'g'), externalStream.id);
            });
            return new RTCSessionDescription({
              type: description.type,
              sdp: sdp
            });
          }
          function replaceExternalStreamId(pc, description) {
            var sdp = description.sdp;
            Object.keys(pc._reverseStreams || []).forEach(function (internalId) {
              var externalStream = pc._reverseStreams[internalId];
              var internalStream = pc._streams[externalStream.id];
              sdp = sdp.replace(new RegExp(externalStream.id, 'g'), internalStream.id);
            });
            return new RTCSessionDescription({
              type: description.type,
              sdp: sdp
            });
          }
          ['createOffer', 'createAnswer'].forEach(function (method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function () {
              var pc = this;
              var args = arguments;
              var isLegacyCall = arguments.length && typeof arguments[0] === 'function';
              if (isLegacyCall) {
                return nativeMethod.apply(pc, [function (description) {
                  var desc = replaceInternalStreamId(pc, description);
                  args[0].apply(null, [desc]);
                }, function (err) {
                  if (args[1]) {
                    args[1].apply(null, err);
                  }
                }, arguments[2]]);
              }
              return nativeMethod.apply(pc, arguments).then(function (description) {
                return replaceInternalStreamId(pc, description);
              });
            };
          });

          var origSetLocalDescription = window.RTCPeerConnection.prototype.setLocalDescription;
          window.RTCPeerConnection.prototype.setLocalDescription = function () {
            var pc = this;
            if (!arguments.length || !arguments[0].type) {
              return origSetLocalDescription.apply(pc, arguments);
            }
            arguments[0] = replaceExternalStreamId(pc, arguments[0]);
            return origSetLocalDescription.apply(pc, arguments);
          };

          // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

          var origLocalDescription = Object.getOwnPropertyDescriptor(window.RTCPeerConnection.prototype, 'localDescription');
          Object.defineProperty(window.RTCPeerConnection.prototype, 'localDescription', {
            get: function get() {
              var pc = this;
              var description = origLocalDescription.get.apply(this);
              if (description.type === '') {
                return description;
              }
              return replaceInternalStreamId(pc, description);
            }
          });

          window.RTCPeerConnection.prototype.removeTrack = function (sender) {
            var pc = this;
            if (pc.signalingState === 'closed') {
              throw new DOMException('The RTCPeerConnection\'s signalingState is \'closed\'.', 'InvalidStateError');
            }
            // We can not yet check for sender instanceof RTCRtpSender
            // since we shim RTPSender. So we check if sender._pc is set.
            if (!sender._pc) {
              throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' + 'does not implement interface RTCRtpSender.', 'TypeError');
            }
            var isLocal = sender._pc === pc;
            if (!isLocal) {
              throw new DOMException('Sender was not created by this connection.', 'InvalidAccessError');
            }

            // Search for the native stream the senders track belongs to.
            pc._streams = pc._streams || {};
            var stream;
            Object.keys(pc._streams).forEach(function (streamid) {
              var hasTrack = pc._streams[streamid].getTracks().find(function (track) {
                return sender.track === track;
              });
              if (hasTrack) {
                stream = pc._streams[streamid];
              }
            });

            if (stream) {
              if (stream.getTracks().length === 1) {
                // if this is the last track of the stream, remove the stream. This
                // takes care of any shimmed _senders.
                pc.removeStream(pc._reverseStreams[stream.id]);
              } else {
                // relying on the same odd chrome behaviour as above.
                stream.removeTrack(sender.track);
              }
              pc.dispatchEvent(new Event('negotiationneeded'));
            }
          };
        },

        shimPeerConnection: function shimPeerConnection(window) {
          var browserDetails = utils.detectBrowser(window);

          // The RTCPeerConnection object.
          if (!window.RTCPeerConnection && window.webkitRTCPeerConnection) {
            window.RTCPeerConnection = function (pcConfig, pcConstraints) {
              // Translate iceTransportPolicy to iceTransports,
              // see https://code.google.com/p/webrtc/issues/detail?id=4869
              // this was fixed in M56 along with unprefixing RTCPeerConnection.
              logging('PeerConnection');
              if (pcConfig && pcConfig.iceTransportPolicy) {
                pcConfig.iceTransports = pcConfig.iceTransportPolicy;
              }

              return new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
            };
            window.RTCPeerConnection.prototype = window.webkitRTCPeerConnection.prototype;
            // wrap static methods. Currently just generateCertificate.
            if (window.webkitRTCPeerConnection.generateCertificate) {
              Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                get: function get() {
                  return window.webkitRTCPeerConnection.generateCertificate;
                }
              });
            }
          } else {
            // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
            var OrigPeerConnection = window.RTCPeerConnection;
            window.RTCPeerConnection = function (pcConfig, pcConstraints) {
              if (pcConfig && pcConfig.iceServers) {
                var newIceServers = [];
                for (var i = 0; i < pcConfig.iceServers.length; i++) {
                  var server = pcConfig.iceServers[i];
                  if (!server.hasOwnProperty('urls') && server.hasOwnProperty('url')) {
                    utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
                    server = JSON.parse(JSON.stringify(server));
                    server.urls = server.url;
                    newIceServers.push(server);
                  } else {
                    newIceServers.push(pcConfig.iceServers[i]);
                  }
                }
                pcConfig.iceServers = newIceServers;
              }
              return new OrigPeerConnection(pcConfig, pcConstraints);
            };
            window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
            // wrap static methods. Currently just generateCertificate.
            Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
              get: function get() {
                return OrigPeerConnection.generateCertificate;
              }
            });
          }

          var origGetStats = window.RTCPeerConnection.prototype.getStats;
          window.RTCPeerConnection.prototype.getStats = function (selector, successCallback, errorCallback) {
            var pc = this;
            var args = arguments;

            // If selector is a function then we are in the old style stats so just
            // pass back the original getStats format to avoid breaking old users.
            if (arguments.length > 0 && typeof selector === 'function') {
              return origGetStats.apply(this, arguments);
            }

            // When spec-style getStats is supported, return those when called with
            // either no arguments or the selector argument is null.
            if (origGetStats.length === 0 && (arguments.length === 0 || typeof arguments[0] !== 'function')) {
              return origGetStats.apply(this, []);
            }

            var fixChromeStats_ = function fixChromeStats_(response) {
              var standardReport = {};
              var reports = response.result();
              reports.forEach(function (report) {
                var standardStats = {
                  id: report.id,
                  timestamp: report.timestamp,
                  type: {
                    localcandidate: 'local-candidate',
                    remotecandidate: 'remote-candidate'
                  }[report.type] || report.type
                };
                report.names().forEach(function (name) {
                  standardStats[name] = report.stat(name);
                });
                standardReport[standardStats.id] = standardStats;
              });

              return standardReport;
            };

            // shim getStats with maplike support
            var makeMapStats = function makeMapStats(stats) {
              return new Map(Object.keys(stats).map(function (key) {
                return [key, stats[key]];
              }));
            };

            if (arguments.length >= 2) {
              var successCallbackWrapper_ = function successCallbackWrapper_(response) {
                args[1](makeMapStats(fixChromeStats_(response)));
              };

              return origGetStats.apply(this, [successCallbackWrapper_, arguments[0]]);
            }

            // promise-support
            return new Promise(function (resolve, reject) {
              origGetStats.apply(pc, [function (response) {
                resolve(makeMapStats(fixChromeStats_(response)));
              }, reject]);
            }).then(successCallback, errorCallback);
          };

          // add promise support -- natively available in Chrome 51
          if (browserDetails.version < 51) {
            ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
              var nativeMethod = window.RTCPeerConnection.prototype[method];
              window.RTCPeerConnection.prototype[method] = function () {
                var args = arguments;
                var pc = this;
                var promise = new Promise(function (resolve, reject) {
                  nativeMethod.apply(pc, [args[0], resolve, reject]);
                });
                if (args.length < 2) {
                  return promise;
                }
                return promise.then(function () {
                  args[1].apply(null, []);
                }, function (err) {
                  if (args.length >= 3) {
                    args[2].apply(null, [err]);
                  }
                });
              };
            });
          }

          // promise support for createOffer and createAnswer. Available (without
          // bugs) since M52: crbug/619289
          if (browserDetails.version < 52) {
            ['createOffer', 'createAnswer'].forEach(function (method) {
              var nativeMethod = window.RTCPeerConnection.prototype[method];
              window.RTCPeerConnection.prototype[method] = function () {
                var pc = this;
                if (arguments.length < 1 || arguments.length === 1 && _typeof(arguments[0]) === 'object') {
                  var opts = arguments.length === 1 ? arguments[0] : undefined;
                  return new Promise(function (resolve, reject) {
                    nativeMethod.apply(pc, [resolve, reject, opts]);
                  });
                }
                return nativeMethod.apply(this, arguments);
              };
            });
          }

          // shim implicit creation of RTCSessionDescription/RTCIceCandidate
          ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function () {
              arguments[0] = new (method === 'addIceCandidate' ? window.RTCIceCandidate : window.RTCSessionDescription)(arguments[0]);
              return nativeMethod.apply(this, arguments);
            };
          });

          // support for addIceCandidate(null or undefined)
          var nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;
          window.RTCPeerConnection.prototype.addIceCandidate = function () {
            if (!arguments[0]) {
              if (arguments[1]) {
                arguments[1].apply(null);
              }
              return Promise.resolve();
            }
            return nativeAddIceCandidate.apply(this, arguments);
          };
        }
      };
    }, { "../utils.js": 13, "./getusermedia": 6 }], 6: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var utils = require('../utils.js');
      var logging = utils.log;

      // Expose public methods.
      module.exports = function (window) {
        var browserDetails = utils.detectBrowser(window);
        var navigator = window && window.navigator;

        var constraintsToChrome_ = function constraintsToChrome_(c) {
          if ((typeof c === "undefined" ? "undefined" : _typeof(c)) !== 'object' || c.mandatory || c.optional) {
            return c;
          }
          var cc = {};
          Object.keys(c).forEach(function (key) {
            if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
              return;
            }
            var r = _typeof(c[key]) === 'object' ? c[key] : { ideal: c[key] };
            if (r.exact !== undefined && typeof r.exact === 'number') {
              r.min = r.max = r.exact;
            }
            var oldname_ = function oldname_(prefix, name) {
              if (prefix) {
                return prefix + name.charAt(0).toUpperCase() + name.slice(1);
              }
              return name === 'deviceId' ? 'sourceId' : name;
            };
            if (r.ideal !== undefined) {
              cc.optional = cc.optional || [];
              var oc = {};
              if (typeof r.ideal === 'number') {
                oc[oldname_('min', key)] = r.ideal;
                cc.optional.push(oc);
                oc = {};
                oc[oldname_('max', key)] = r.ideal;
                cc.optional.push(oc);
              } else {
                oc[oldname_('', key)] = r.ideal;
                cc.optional.push(oc);
              }
            }
            if (r.exact !== undefined && typeof r.exact !== 'number') {
              cc.mandatory = cc.mandatory || {};
              cc.mandatory[oldname_('', key)] = r.exact;
            } else {
              ['min', 'max'].forEach(function (mix) {
                if (r[mix] !== undefined) {
                  cc.mandatory = cc.mandatory || {};
                  cc.mandatory[oldname_(mix, key)] = r[mix];
                }
              });
            }
          });
          if (c.advanced) {
            cc.optional = (cc.optional || []).concat(c.advanced);
          }
          return cc;
        };

        var shimConstraints_ = function shimConstraints_(constraints, func) {
          if (browserDetails.version >= 61) {
            return func(constraints);
          }
          constraints = JSON.parse(JSON.stringify(constraints));
          if (constraints && _typeof(constraints.audio) === 'object') {
            var remap = function remap(obj, a, b) {
              if (a in obj && !(b in obj)) {
                obj[b] = obj[a];
                delete obj[a];
              }
            };
            constraints = JSON.parse(JSON.stringify(constraints));
            remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
            remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
            constraints.audio = constraintsToChrome_(constraints.audio);
          }
          if (constraints && _typeof(constraints.video) === 'object') {
            // Shim facingMode for mobile & surface pro.
            var face = constraints.video.facingMode;
            face = face && ((typeof face === "undefined" ? "undefined" : _typeof(face)) === 'object' ? face : { ideal: face });
            var getSupportedFacingModeLies = browserDetails.version < 66;

            if (face && (face.exact === 'user' || face.exact === 'environment' || face.ideal === 'user' || face.ideal === 'environment') && !(navigator.mediaDevices.getSupportedConstraints && navigator.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
              delete constraints.video.facingMode;
              var matches;
              if (face.exact === 'environment' || face.ideal === 'environment') {
                matches = ['back', 'rear'];
              } else if (face.exact === 'user' || face.ideal === 'user') {
                matches = ['front'];
              }
              if (matches) {
                // Look for matches in label, or use last cam for back (typical).
                return navigator.mediaDevices.enumerateDevices().then(function (devices) {
                  devices = devices.filter(function (d) {
                    return d.kind === 'videoinput';
                  });
                  var dev = devices.find(function (d) {
                    return matches.some(function (match) {
                      return d.label.toLowerCase().indexOf(match) !== -1;
                    });
                  });
                  if (!dev && devices.length && matches.indexOf('back') !== -1) {
                    dev = devices[devices.length - 1]; // more likely the back cam
                  }
                  if (dev) {
                    constraints.video.deviceId = face.exact ? { exact: dev.deviceId } : { ideal: dev.deviceId };
                  }
                  constraints.video = constraintsToChrome_(constraints.video);
                  logging('chrome: ' + JSON.stringify(constraints));
                  return func(constraints);
                });
              }
            }
            constraints.video = constraintsToChrome_(constraints.video);
          }
          logging('chrome: ' + JSON.stringify(constraints));
          return func(constraints);
        };

        var shimError_ = function shimError_(e) {
          return {
            name: {
              PermissionDeniedError: 'NotAllowedError',
              PermissionDismissedError: 'NotAllowedError',
              InvalidStateError: 'NotAllowedError',
              DevicesNotFoundError: 'NotFoundError',
              ConstraintNotSatisfiedError: 'OverconstrainedError',
              TrackStartError: 'NotReadableError',
              MediaDeviceFailedDueToShutdown: 'NotAllowedError',
              MediaDeviceKillSwitchOn: 'NotAllowedError',
              TabCaptureError: 'AbortError',
              ScreenCaptureError: 'AbortError',
              DeviceCaptureError: 'AbortError'
            }[e.name] || e.name,
            message: e.message,
            constraint: e.constraintName,
            toString: function toString() {
              return this.name + (this.message && ': ') + this.message;
            }
          };
        };

        var getUserMedia_ = function getUserMedia_(constraints, onSuccess, onError) {
          shimConstraints_(constraints, function (c) {
            navigator.webkitGetUserMedia(c, onSuccess, function (e) {
              if (onError) {
                onError(shimError_(e));
              }
            });
          });
        };

        navigator.getUserMedia = getUserMedia_;

        // Returns the result of getUserMedia as a Promise.
        var getUserMediaPromise_ = function getUserMediaPromise_(constraints) {
          return new Promise(function (resolve, reject) {
            navigator.getUserMedia(constraints, resolve, reject);
          });
        };

        if (!navigator.mediaDevices) {
          navigator.mediaDevices = {
            getUserMedia: getUserMediaPromise_,
            enumerateDevices: function enumerateDevices() {
              return new Promise(function (resolve) {
                var kinds = { audio: 'audioinput', video: 'videoinput' };
                return window.MediaStreamTrack.getSources(function (devices) {
                  resolve(devices.map(function (device) {
                    return { label: device.label,
                      kind: kinds[device.kind],
                      deviceId: device.id,
                      groupId: '' };
                  }));
                });
              });
            },
            getSupportedConstraints: function getSupportedConstraints() {
              return {
                deviceId: true, echoCancellation: true, facingMode: true,
                frameRate: true, height: true, width: true
              };
            }
          };
        }

        // A shim for getUserMedia method on the mediaDevices object.
        // TODO(KaptenJansson) remove once implemented in Chrome stable.
        if (!navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia = function (constraints) {
            return getUserMediaPromise_(constraints);
          };
        } else {
          // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
          // function which returns a Promise, it does not accept spec-style
          // constraints.
          var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
          navigator.mediaDevices.getUserMedia = function (cs) {
            return shimConstraints_(cs, function (c) {
              return origGetUserMedia(c).then(function (stream) {
                if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
                  stream.getTracks().forEach(function (track) {
                    track.stop();
                  });
                  throw new DOMException('', 'NotFoundError');
                }
                return stream;
              }, function (e) {
                return Promise.reject(shimError_(e));
              });
            });
          };
        }

        // Dummy devicechange event methods.
        // TODO(KaptenJansson) remove once implemented in Chrome stable.
        if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
          navigator.mediaDevices.addEventListener = function () {
            logging('Dummy mediaDevices.addEventListener called.');
          };
        }
        if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
          navigator.mediaDevices.removeEventListener = function () {
            logging('Dummy mediaDevices.removeEventListener called.');
          };
        }
      };
    }, { "../utils.js": 13 }], 7: [function (require, module, exports) {
      /*
       *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var SDPUtils = require('sdp');
      var utils = require('./utils');

      module.exports = {
        shimRTCIceCandidate: function shimRTCIceCandidate(window) {
          // foundation is arbitrarily chosen as an indicator for full support for
          // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
          if (!window.RTCIceCandidate || window.RTCIceCandidate && 'foundation' in window.RTCIceCandidate.prototype) {
            return;
          }

          var NativeRTCIceCandidate = window.RTCIceCandidate;
          window.RTCIceCandidate = function (args) {
            // Remove the a= which shouldn't be part of the candidate string.
            if ((typeof args === "undefined" ? "undefined" : _typeof(args)) === 'object' && args.candidate && args.candidate.indexOf('a=') === 0) {
              args = JSON.parse(JSON.stringify(args));
              args.candidate = args.candidate.substr(2);
            }

            if (args.candidate && args.candidate.length) {
              // Augment the native candidate with the parsed fields.
              var nativeCandidate = new NativeRTCIceCandidate(args);
              var parsedCandidate = SDPUtils.parseCandidate(args.candidate);
              var augmentedCandidate = _extends(nativeCandidate, parsedCandidate);

              // Add a serializer that does not serialize the extra attributes.
              augmentedCandidate.toJSON = function () {
                return {
                  candidate: augmentedCandidate.candidate,
                  sdpMid: augmentedCandidate.sdpMid,
                  sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
                  usernameFragment: augmentedCandidate.usernameFragment
                };
              };
              return augmentedCandidate;
            }
            return new NativeRTCIceCandidate(args);
          };
          window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;

          // Hook up the augmented candidate in onicecandidate and
          // addEventListener('icecandidate', ...)
          utils.wrapPeerConnectionEvent(window, 'icecandidate', function (e) {
            if (e.candidate) {
              Object.defineProperty(e, 'candidate', {
                value: new window.RTCIceCandidate(e.candidate),
                writable: 'false'
              });
            }
            return e;
          });
        },

        // shimCreateObjectURL must be called before shimSourceObject to avoid loop.

        shimCreateObjectURL: function shimCreateObjectURL(window) {
          var URL = window && window.URL;

          if (!((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.HTMLMediaElement && 'srcObject' in window.HTMLMediaElement.prototype && URL.createObjectURL && URL.revokeObjectURL)) {
            // Only shim CreateObjectURL using srcObject if srcObject exists.
            return undefined;
          }

          var nativeCreateObjectURL = URL.createObjectURL.bind(URL);
          var nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
          var streams = new Map(),
              newId = 0;

          URL.createObjectURL = function (stream) {
            if ('getTracks' in stream) {
              var url = 'polyblob:' + ++newId;
              streams.set(url, stream);
              utils.deprecated('URL.createObjectURL(stream)', 'elem.srcObject = stream');
              return url;
            }
            return nativeCreateObjectURL(stream);
          };
          URL.revokeObjectURL = function (url) {
            nativeRevokeObjectURL(url);
            streams.delete(url);
          };

          var dsc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype, 'src');
          Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
            get: function get() {
              return dsc.get.apply(this);
            },
            set: function set(url) {
              this.srcObject = streams.get(url) || null;
              return dsc.set.apply(this, [url]);
            }
          });

          var nativeSetAttribute = window.HTMLMediaElement.prototype.setAttribute;
          window.HTMLMediaElement.prototype.setAttribute = function () {
            if (arguments.length === 2 && ('' + arguments[0]).toLowerCase() === 'src') {
              this.srcObject = streams.get(arguments[1]) || null;
            }
            return nativeSetAttribute.apply(this, arguments);
          };
        },

        shimMaxMessageSize: function shimMaxMessageSize(window) {
          if (window.RTCSctpTransport || !window.RTCPeerConnection) {
            return;
          }
          var browserDetails = utils.detectBrowser(window);

          if (!('sctp' in window.RTCPeerConnection.prototype)) {
            Object.defineProperty(window.RTCPeerConnection.prototype, 'sctp', {
              get: function get() {
                return typeof this._sctp === 'undefined' ? null : this._sctp;
              }
            });
          }

          var sctpInDescription = function sctpInDescription(description) {
            var sections = SDPUtils.splitSections(description.sdp);
            sections.shift();
            return sections.some(function (mediaSection) {
              var mLine = SDPUtils.parseMLine(mediaSection);
              return mLine && mLine.kind === 'application' && mLine.protocol.indexOf('SCTP') !== -1;
            });
          };

          var getRemoteFirefoxVersion = function getRemoteFirefoxVersion(description) {
            // TODO: Is there a better solution for detecting Firefox?
            var match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
            if (match === null || match.length < 2) {
              return -1;
            }
            var version = parseInt(match[1], 10);
            // Test for NaN (yes, this is ugly)
            return version !== version ? -1 : version;
          };

          var getCanSendMaxMessageSize = function getCanSendMaxMessageSize(remoteIsFirefox) {
            // Every implementation we know can send at least 64 KiB.
            // Note: Although Chrome is technically able to send up to 256 KiB, the
            //       data does not reach the other peer reliably.
            //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
            var canSendMaxMessageSize = 65536;
            if (browserDetails.browser === 'firefox') {
              if (browserDetails.version < 57) {
                if (remoteIsFirefox === -1) {
                  // FF < 57 will send in 16 KiB chunks using the deprecated PPID
                  // fragmentation.
                  canSendMaxMessageSize = 16384;
                } else {
                  // However, other FF (and RAWRTC) can reassemble PPID-fragmented
                  // messages. Thus, supporting ~2 GiB when sending.
                  canSendMaxMessageSize = 2147483637;
                }
              } else {
                // Currently, all FF >= 57 will reset the remote maximum message size
                // to the default value when a data channel is created at a later
                // stage. :(
                // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
                canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
              }
            }
            return canSendMaxMessageSize;
          };

          var getMaxMessageSize = function getMaxMessageSize(description, remoteIsFirefox) {
            // Note: 65536 bytes is the default value from the SDP spec. Also,
            //       every implementation we know supports receiving 65536 bytes.
            var maxMessageSize = 65536;

            // FF 57 has a slightly incorrect default remote max message size, so
            // we need to adjust it here to avoid a failure when sending.
            // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
            if (browserDetails.browser === 'firefox' && browserDetails.version === 57) {
              maxMessageSize = 65535;
            }

            var match = SDPUtils.matchPrefix(description.sdp, 'a=max-message-size:');
            if (match.length > 0) {
              maxMessageSize = parseInt(match[0].substr(19), 10);
            } else if (browserDetails.browser === 'firefox' && remoteIsFirefox !== -1) {
              // If the maximum message size is not present in the remote SDP and
              // both local and remote are Firefox, the remote peer can receive
              // ~2 GiB.
              maxMessageSize = 2147483637;
            }
            return maxMessageSize;
          };

          var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
          window.RTCPeerConnection.prototype.setRemoteDescription = function () {
            var pc = this;
            pc._sctp = null;

            if (sctpInDescription(arguments[0])) {
              // Check if the remote is FF.
              var isFirefox = getRemoteFirefoxVersion(arguments[0]);

              // Get the maximum message size the local peer is capable of sending
              var canSendMMS = getCanSendMaxMessageSize(isFirefox);

              // Get the maximum message size of the remote peer.
              var remoteMMS = getMaxMessageSize(arguments[0], isFirefox);

              // Determine final maximum message size
              var maxMessageSize;
              if (canSendMMS === 0 && remoteMMS === 0) {
                maxMessageSize = Number.POSITIVE_INFINITY;
              } else if (canSendMMS === 0 || remoteMMS === 0) {
                maxMessageSize = Math.max(canSendMMS, remoteMMS);
              } else {
                maxMessageSize = Math.min(canSendMMS, remoteMMS);
              }

              // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
              // attribute.
              var sctp = {};
              Object.defineProperty(sctp, 'maxMessageSize', {
                get: function get() {
                  return maxMessageSize;
                }
              });
              pc._sctp = sctp;
            }

            return origSetRemoteDescription.apply(pc, arguments);
          };
        },

        shimSendThrowTypeError: function shimSendThrowTypeError(window) {
          if (!(window.RTCPeerConnection && 'createDataChannel' in window.RTCPeerConnection.prototype)) {
            return;
          }

          // Note: Although Firefox >= 57 has a native implementation, the maximum
          //       message size can be reset for all data channels at a later stage.
          //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831

          var origCreateDataChannel = window.RTCPeerConnection.prototype.createDataChannel;
          window.RTCPeerConnection.prototype.createDataChannel = function () {
            var pc = this;
            var dataChannel = origCreateDataChannel.apply(pc, arguments);
            var origDataChannelSend = dataChannel.send;

            // Patch 'send' method
            dataChannel.send = function () {
              var dc = this;
              var data = arguments[0];
              var length = data.length || data.size || data.byteLength;
              if (length > pc.sctp.maxMessageSize) {
                throw new DOMException('Message too large (can send a maximum of ' + pc.sctp.maxMessageSize + ' bytes)', 'TypeError');
              }
              return origDataChannelSend.apply(dc, arguments);
            };

            return dataChannel;
          };
        }
      };
    }, { "./utils": 13, "sdp": 2 }], 8: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var utils = require('../utils');
      var shimRTCPeerConnection = require('rtcpeerconnection-shim');

      module.exports = {
        shimGetUserMedia: require('./getusermedia'),
        shimPeerConnection: function shimPeerConnection(window) {
          var browserDetails = utils.detectBrowser(window);

          if (window.RTCIceGatherer) {
            if (!window.RTCIceCandidate) {
              window.RTCIceCandidate = function (args) {
                return args;
              };
            }
            if (!window.RTCSessionDescription) {
              window.RTCSessionDescription = function (args) {
                return args;
              };
            }
            // this adds an additional event listener to MediaStrackTrack that signals
            // when a tracks enabled property was changed. Workaround for a bug in
            // addStream, see below. No longer required in 15025+
            if (browserDetails.version < 15025) {
              var origMSTEnabled = Object.getOwnPropertyDescriptor(window.MediaStreamTrack.prototype, 'enabled');
              Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
                set: function set(value) {
                  origMSTEnabled.set.call(this, value);
                  var ev = new Event('enabled');
                  ev.enabled = value;
                  this.dispatchEvent(ev);
                }
              });
            }
          }

          // ORTC defines the DTMF sender a bit different.
          // https://github.com/w3c/ortc/issues/714
          if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
            Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
              get: function get() {
                if (this._dtmf === undefined) {
                  if (this.track.kind === 'audio') {
                    this._dtmf = new window.RTCDtmfSender(this);
                  } else if (this.track.kind === 'video') {
                    this._dtmf = null;
                  }
                }
                return this._dtmf;
              }
            });
          }
          // Edge currently only implements the RTCDtmfSender, not the
          // RTCDTMFSender alias. See http://draft.ortc.org/#rtcdtmfsender2*
          if (window.RTCDtmfSender && !window.RTCDTMFSender) {
            window.RTCDTMFSender = window.RTCDtmfSender;
          }

          window.RTCPeerConnection = shimRTCPeerConnection(window, browserDetails.version);
        },
        shimReplaceTrack: function shimReplaceTrack(window) {
          // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
          if (window.RTCRtpSender && !('replaceTrack' in window.RTCRtpSender.prototype)) {
            window.RTCRtpSender.prototype.replaceTrack = window.RTCRtpSender.prototype.setTrack;
          }
        }
      };
    }, { "../utils": 13, "./getusermedia": 9, "rtcpeerconnection-shim": 1 }], 9: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      // Expose public methods.

      module.exports = function (window) {
        var navigator = window && window.navigator;

        var shimError_ = function shimError_(e) {
          return {
            name: { PermissionDeniedError: 'NotAllowedError' }[e.name] || e.name,
            message: e.message,
            constraint: e.constraint,
            toString: function toString() {
              return this.name;
            }
          };
        };

        // getUserMedia error shim.
        var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = function (c) {
          return origGetUserMedia(c).catch(function (e) {
            return Promise.reject(shimError_(e));
          });
        };
      };
    }, {}], 10: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var utils = require('../utils');

      module.exports = {
        shimGetUserMedia: require('./getusermedia'),
        shimOnTrack: function shimOnTrack(window) {
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && !('ontrack' in window.RTCPeerConnection.prototype)) {
            Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
              get: function get() {
                return this._ontrack;
              },
              set: function set(f) {
                if (this._ontrack) {
                  this.removeEventListener('track', this._ontrack);
                  this.removeEventListener('addstream', this._ontrackpoly);
                }
                this.addEventListener('track', this._ontrack = f);
                this.addEventListener('addstream', this._ontrackpoly = function (e) {
                  e.stream.getTracks().forEach(function (track) {
                    var event = new Event('track');
                    event.track = track;
                    event.receiver = { track: track };
                    event.transceiver = { receiver: event.receiver };
                    event.streams = [e.stream];
                    this.dispatchEvent(event);
                  }.bind(this));
                }.bind(this));
              }
            });
          }
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCTrackEvent && 'receiver' in window.RTCTrackEvent.prototype && !('transceiver' in window.RTCTrackEvent.prototype)) {
            Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
              get: function get() {
                return { receiver: this.receiver };
              }
            });
          }
        },

        shimSourceObject: function shimSourceObject(window) {
          // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object') {
            if (window.HTMLMediaElement && !('srcObject' in window.HTMLMediaElement.prototype)) {
              // Shim the srcObject property, once, when HTMLMediaElement is found.
              Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                get: function get() {
                  return this.mozSrcObject;
                },
                set: function set(stream) {
                  this.mozSrcObject = stream;
                }
              });
            }
          }
        },

        shimPeerConnection: function shimPeerConnection(window) {
          var browserDetails = utils.detectBrowser(window);

          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' || !(window.RTCPeerConnection || window.mozRTCPeerConnection)) {
            return; // probably media.peerconnection.enabled=false in about:config
          }
          // The RTCPeerConnection object.
          if (!window.RTCPeerConnection) {
            window.RTCPeerConnection = function (pcConfig, pcConstraints) {
              if (browserDetails.version < 38) {
                // .urls is not supported in FF < 38.
                // create RTCIceServers with a single url.
                if (pcConfig && pcConfig.iceServers) {
                  var newIceServers = [];
                  for (var i = 0; i < pcConfig.iceServers.length; i++) {
                    var server = pcConfig.iceServers[i];
                    if (server.hasOwnProperty('urls')) {
                      for (var j = 0; j < server.urls.length; j++) {
                        var newServer = {
                          url: server.urls[j]
                        };
                        if (server.urls[j].indexOf('turn') === 0) {
                          newServer.username = server.username;
                          newServer.credential = server.credential;
                        }
                        newIceServers.push(newServer);
                      }
                    } else {
                      newIceServers.push(pcConfig.iceServers[i]);
                    }
                  }
                  pcConfig.iceServers = newIceServers;
                }
              }
              return new window.mozRTCPeerConnection(pcConfig, pcConstraints);
            };
            window.RTCPeerConnection.prototype = window.mozRTCPeerConnection.prototype;

            // wrap static methods. Currently just generateCertificate.
            if (window.mozRTCPeerConnection.generateCertificate) {
              Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                get: function get() {
                  return window.mozRTCPeerConnection.generateCertificate;
                }
              });
            }

            window.RTCSessionDescription = window.mozRTCSessionDescription;
            window.RTCIceCandidate = window.mozRTCIceCandidate;
          }

          // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
          ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function () {
              arguments[0] = new (method === 'addIceCandidate' ? window.RTCIceCandidate : window.RTCSessionDescription)(arguments[0]);
              return nativeMethod.apply(this, arguments);
            };
          });

          // support for addIceCandidate(null or undefined)
          var nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;
          window.RTCPeerConnection.prototype.addIceCandidate = function () {
            if (!arguments[0]) {
              if (arguments[1]) {
                arguments[1].apply(null);
              }
              return Promise.resolve();
            }
            return nativeAddIceCandidate.apply(this, arguments);
          };

          // shim getStats with maplike support
          var makeMapStats = function makeMapStats(stats) {
            var map = new Map();
            Object.keys(stats).forEach(function (key) {
              map.set(key, stats[key]);
              map[key] = stats[key];
            });
            return map;
          };

          var modernStatsTypes = {
            inboundrtp: 'inbound-rtp',
            outboundrtp: 'outbound-rtp',
            candidatepair: 'candidate-pair',
            localcandidate: 'local-candidate',
            remotecandidate: 'remote-candidate'
          };

          var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
          window.RTCPeerConnection.prototype.getStats = function (selector, onSucc, onErr) {
            return nativeGetStats.apply(this, [selector || null]).then(function (stats) {
              if (browserDetails.version < 48) {
                stats = makeMapStats(stats);
              }
              if (browserDetails.version < 53 && !onSucc) {
                // Shim only promise getStats with spec-hyphens in type names
                // Leave callback version alone; misc old uses of forEach before Map
                try {
                  stats.forEach(function (stat) {
                    stat.type = modernStatsTypes[stat.type] || stat.type;
                  });
                } catch (e) {
                  if (e.name !== 'TypeError') {
                    throw e;
                  }
                  // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
                  stats.forEach(function (stat, i) {
                    stats.set(i, _extends({}, stat, {
                      type: modernStatsTypes[stat.type] || stat.type
                    }));
                  });
                }
              }
              return stats;
            }).then(onSucc, onErr);
          };
        },

        shimRemoveStream: function shimRemoveStream(window) {
          if (!window.RTCPeerConnection || 'removeStream' in window.RTCPeerConnection.prototype) {
            return;
          }
          window.RTCPeerConnection.prototype.removeStream = function (stream) {
            var pc = this;
            utils.deprecated('removeStream', 'removeTrack');
            this.getSenders().forEach(function (sender) {
              if (sender.track && stream.getTracks().indexOf(sender.track) !== -1) {
                pc.removeTrack(sender);
              }
            });
          };
        }
      };
    }, { "../utils": 13, "./getusermedia": 11 }], 11: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var utils = require('../utils');
      var logging = utils.log;

      // Expose public methods.
      module.exports = function (window) {
        var browserDetails = utils.detectBrowser(window);
        var navigator = window && window.navigator;
        var MediaStreamTrack = window && window.MediaStreamTrack;

        var shimError_ = function shimError_(e) {
          return {
            name: {
              InternalError: 'NotReadableError',
              NotSupportedError: 'TypeError',
              PermissionDeniedError: 'NotAllowedError',
              SecurityError: 'NotAllowedError'
            }[e.name] || e.name,
            message: {
              'The operation is insecure.': 'The request is not allowed by the ' + 'user agent or the platform in the current context.'
            }[e.message] || e.message,
            constraint: e.constraint,
            toString: function toString() {
              return this.name + (this.message && ': ') + this.message;
            }
          };
        };

        // getUserMedia constraints shim.
        var getUserMedia_ = function getUserMedia_(constraints, onSuccess, onError) {
          var constraintsToFF37_ = function constraintsToFF37_(c) {
            if ((typeof c === "undefined" ? "undefined" : _typeof(c)) !== 'object' || c.require) {
              return c;
            }
            var require = [];
            Object.keys(c).forEach(function (key) {
              if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                return;
              }
              var r = c[key] = _typeof(c[key]) === 'object' ? c[key] : { ideal: c[key] };
              if (r.min !== undefined || r.max !== undefined || r.exact !== undefined) {
                require.push(key);
              }
              if (r.exact !== undefined) {
                if (typeof r.exact === 'number') {
                  r.min = r.max = r.exact;
                } else {
                  c[key] = r.exact;
                }
                delete r.exact;
              }
              if (r.ideal !== undefined) {
                c.advanced = c.advanced || [];
                var oc = {};
                if (typeof r.ideal === 'number') {
                  oc[key] = { min: r.ideal, max: r.ideal };
                } else {
                  oc[key] = r.ideal;
                }
                c.advanced.push(oc);
                delete r.ideal;
                if (!Object.keys(r).length) {
                  delete c[key];
                }
              }
            });
            if (require.length) {
              c.require = require;
            }
            return c;
          };
          constraints = JSON.parse(JSON.stringify(constraints));
          if (browserDetails.version < 38) {
            logging('spec: ' + JSON.stringify(constraints));
            if (constraints.audio) {
              constraints.audio = constraintsToFF37_(constraints.audio);
            }
            if (constraints.video) {
              constraints.video = constraintsToFF37_(constraints.video);
            }
            logging('ff37: ' + JSON.stringify(constraints));
          }
          return navigator.mozGetUserMedia(constraints, onSuccess, function (e) {
            onError(shimError_(e));
          });
        };

        // Returns the result of getUserMedia as a Promise.
        var getUserMediaPromise_ = function getUserMediaPromise_(constraints) {
          return new Promise(function (resolve, reject) {
            getUserMedia_(constraints, resolve, reject);
          });
        };

        // Shim for mediaDevices on older versions.
        if (!navigator.mediaDevices) {
          navigator.mediaDevices = { getUserMedia: getUserMediaPromise_,
            addEventListener: function addEventListener() {},
            removeEventListener: function removeEventListener() {}
          };
        }
        navigator.mediaDevices.enumerateDevices = navigator.mediaDevices.enumerateDevices || function () {
          return new Promise(function (resolve) {
            var infos = [{ kind: 'audioinput', deviceId: 'default', label: '', groupId: '' }, { kind: 'videoinput', deviceId: 'default', label: '', groupId: '' }];
            resolve(infos);
          });
        };

        if (browserDetails.version < 41) {
          // Work around http://bugzil.la/1169665
          var orgEnumerateDevices = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
          navigator.mediaDevices.enumerateDevices = function () {
            return orgEnumerateDevices().then(undefined, function (e) {
              if (e.name === 'NotFoundError') {
                return [];
              }
              throw e;
            });
          };
        }
        if (browserDetails.version < 49) {
          var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
          navigator.mediaDevices.getUserMedia = function (c) {
            return origGetUserMedia(c).then(function (stream) {
              // Work around https://bugzil.la/802326
              if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
                stream.getTracks().forEach(function (track) {
                  track.stop();
                });
                throw new DOMException('The object can not be found here.', 'NotFoundError');
              }
              return stream;
            }, function (e) {
              return Promise.reject(shimError_(e));
            });
          };
        }
        if (!(browserDetails.version > 55 && 'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
          var remap = function remap(obj, a, b) {
            if (a in obj && !(b in obj)) {
              obj[b] = obj[a];
              delete obj[a];
            }
          };

          var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
          navigator.mediaDevices.getUserMedia = function (c) {
            if ((typeof c === "undefined" ? "undefined" : _typeof(c)) === 'object' && _typeof(c.audio) === 'object') {
              c = JSON.parse(JSON.stringify(c));
              remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
              remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
            }
            return nativeGetUserMedia(c);
          };

          if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
            var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
            MediaStreamTrack.prototype.getSettings = function () {
              var obj = nativeGetSettings.apply(this, arguments);
              remap(obj, 'mozAutoGainControl', 'autoGainControl');
              remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
              return obj;
            };
          }

          if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
            var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
            MediaStreamTrack.prototype.applyConstraints = function (c) {
              if (this.kind === 'audio' && (typeof c === "undefined" ? "undefined" : _typeof(c)) === 'object') {
                c = JSON.parse(JSON.stringify(c));
                remap(c, 'autoGainControl', 'mozAutoGainControl');
                remap(c, 'noiseSuppression', 'mozNoiseSuppression');
              }
              return nativeApplyConstraints.apply(this, [c]);
            };
          }
        }
        navigator.getUserMedia = function (constraints, onSuccess, onError) {
          if (browserDetails.version < 44) {
            return getUserMedia_(constraints, onSuccess, onError);
          }
          // Replace Firefox 44+'s deprecation warning with unprefixed version.
          utils.deprecated('navigator.getUserMedia', 'navigator.mediaDevices.getUserMedia');
          navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
        };
      };
    }, { "../utils": 13 }], 12: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      'use strict';

      var utils = require('../utils');

      module.exports = {
        shimLocalStreamsAPI: function shimLocalStreamsAPI(window) {
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
            return;
          }
          if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
            window.RTCPeerConnection.prototype.getLocalStreams = function () {
              if (!this._localStreams) {
                this._localStreams = [];
              }
              return this._localStreams;
            };
          }
          if (!('getStreamById' in window.RTCPeerConnection.prototype)) {
            window.RTCPeerConnection.prototype.getStreamById = function (id) {
              var result = null;
              if (this._localStreams) {
                this._localStreams.forEach(function (stream) {
                  if (stream.id === id) {
                    result = stream;
                  }
                });
              }
              if (this._remoteStreams) {
                this._remoteStreams.forEach(function (stream) {
                  if (stream.id === id) {
                    result = stream;
                  }
                });
              }
              return result;
            };
          }
          if (!('addStream' in window.RTCPeerConnection.prototype)) {
            var _addTrack = window.RTCPeerConnection.prototype.addTrack;
            window.RTCPeerConnection.prototype.addStream = function (stream) {
              if (!this._localStreams) {
                this._localStreams = [];
              }
              if (this._localStreams.indexOf(stream) === -1) {
                this._localStreams.push(stream);
              }
              var pc = this;
              stream.getTracks().forEach(function (track) {
                _addTrack.call(pc, track, stream);
              });
            };

            window.RTCPeerConnection.prototype.addTrack = function (track, stream) {
              if (stream) {
                if (!this._localStreams) {
                  this._localStreams = [stream];
                } else if (this._localStreams.indexOf(stream) === -1) {
                  this._localStreams.push(stream);
                }
              }
              return _addTrack.call(this, track, stream);
            };
          }
          if (!('removeStream' in window.RTCPeerConnection.prototype)) {
            window.RTCPeerConnection.prototype.removeStream = function (stream) {
              if (!this._localStreams) {
                this._localStreams = [];
              }
              var index = this._localStreams.indexOf(stream);
              if (index === -1) {
                return;
              }
              this._localStreams.splice(index, 1);
              var pc = this;
              var tracks = stream.getTracks();
              this.getSenders().forEach(function (sender) {
                if (tracks.indexOf(sender.track) !== -1) {
                  pc.removeTrack(sender);
                }
              });
            };
          }
        },
        shimRemoteStreamsAPI: function shimRemoteStreamsAPI(window) {
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
            return;
          }
          if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
            window.RTCPeerConnection.prototype.getRemoteStreams = function () {
              return this._remoteStreams ? this._remoteStreams : [];
            };
          }
          if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
            Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
              get: function get() {
                return this._onaddstream;
              },
              set: function set(f) {
                var pc = this;
                if (this._onaddstream) {
                  this.removeEventListener('addstream', this._onaddstream);
                  this.removeEventListener('track', this._onaddstreampoly);
                }
                this.addEventListener('addstream', this._onaddstream = f);
                this.addEventListener('track', this._onaddstreampoly = function (e) {
                  e.streams.forEach(function (stream) {
                    if (!pc._remoteStreams) {
                      pc._remoteStreams = [];
                    }
                    if (pc._remoteStreams.indexOf(stream) >= 0) {
                      return;
                    }
                    pc._remoteStreams.push(stream);
                    var event = new Event('addstream');
                    event.stream = stream;
                    pc.dispatchEvent(event);
                  });
                });
              }
            });
          }
        },
        shimCallbacksAPI: function shimCallbacksAPI(window) {
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
            return;
          }
          var prototype = window.RTCPeerConnection.prototype;
          var createOffer = prototype.createOffer;
          var createAnswer = prototype.createAnswer;
          var setLocalDescription = prototype.setLocalDescription;
          var setRemoteDescription = prototype.setRemoteDescription;
          var addIceCandidate = prototype.addIceCandidate;

          prototype.createOffer = function (successCallback, failureCallback) {
            var options = arguments.length >= 2 ? arguments[2] : arguments[0];
            var promise = createOffer.apply(this, [options]);
            if (!failureCallback) {
              return promise;
            }
            promise.then(successCallback, failureCallback);
            return Promise.resolve();
          };

          prototype.createAnswer = function (successCallback, failureCallback) {
            var options = arguments.length >= 2 ? arguments[2] : arguments[0];
            var promise = createAnswer.apply(this, [options]);
            if (!failureCallback) {
              return promise;
            }
            promise.then(successCallback, failureCallback);
            return Promise.resolve();
          };

          var withCallback = function withCallback(description, successCallback, failureCallback) {
            var promise = setLocalDescription.apply(this, [description]);
            if (!failureCallback) {
              return promise;
            }
            promise.then(successCallback, failureCallback);
            return Promise.resolve();
          };
          prototype.setLocalDescription = withCallback;

          withCallback = function withCallback(description, successCallback, failureCallback) {
            var promise = setRemoteDescription.apply(this, [description]);
            if (!failureCallback) {
              return promise;
            }
            promise.then(successCallback, failureCallback);
            return Promise.resolve();
          };
          prototype.setRemoteDescription = withCallback;

          withCallback = function withCallback(candidate, successCallback, failureCallback) {
            var promise = addIceCandidate.apply(this, [candidate]);
            if (!failureCallback) {
              return promise;
            }
            promise.then(successCallback, failureCallback);
            return Promise.resolve();
          };
          prototype.addIceCandidate = withCallback;
        },
        shimGetUserMedia: function shimGetUserMedia(window) {
          var navigator = window && window.navigator;

          if (!navigator.getUserMedia) {
            if (navigator.webkitGetUserMedia) {
              navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
            } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              navigator.getUserMedia = function (constraints, cb, errcb) {
                navigator.mediaDevices.getUserMedia(constraints).then(cb, errcb);
              }.bind(navigator);
            }
          }
        },
        shimRTCIceServerUrls: function shimRTCIceServerUrls(window) {
          // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
          var OrigPeerConnection = window.RTCPeerConnection;
          window.RTCPeerConnection = function (pcConfig, pcConstraints) {
            if (pcConfig && pcConfig.iceServers) {
              var newIceServers = [];
              for (var i = 0; i < pcConfig.iceServers.length; i++) {
                var server = pcConfig.iceServers[i];
                if (!server.hasOwnProperty('urls') && server.hasOwnProperty('url')) {
                  utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
                  server = JSON.parse(JSON.stringify(server));
                  server.urls = server.url;
                  delete server.url;
                  newIceServers.push(server);
                } else {
                  newIceServers.push(pcConfig.iceServers[i]);
                }
              }
              pcConfig.iceServers = newIceServers;
            }
            return new OrigPeerConnection(pcConfig, pcConstraints);
          };
          window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
          // wrap static methods. Currently just generateCertificate.
          if ('generateCertificate' in window.RTCPeerConnection) {
            Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
              get: function get() {
                return OrigPeerConnection.generateCertificate;
              }
            });
          }
        },
        shimTrackEventTransceiver: function shimTrackEventTransceiver(window) {
          // Add event.transceiver member over deprecated event.receiver
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object' && window.RTCPeerConnection && 'receiver' in window.RTCTrackEvent.prototype &&
          // can't check 'transceiver' in window.RTCTrackEvent.prototype, as it is
          // defined for some reason even when window.RTCTransceiver is not.
          !window.RTCTransceiver) {
            Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
              get: function get() {
                return { receiver: this.receiver };
              }
            });
          }
        },

        shimCreateOfferLegacy: function shimCreateOfferLegacy(window) {
          var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
          window.RTCPeerConnection.prototype.createOffer = function (offerOptions) {
            var pc = this;
            if (offerOptions) {
              if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
                // support bit values
                offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
              }
              var audioTransceiver = pc.getTransceivers().find(function (transceiver) {
                return transceiver.sender.track && transceiver.sender.track.kind === 'audio';
              });
              if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
                if (audioTransceiver.direction === 'sendrecv') {
                  if (audioTransceiver.setDirection) {
                    audioTransceiver.setDirection('sendonly');
                  } else {
                    audioTransceiver.direction = 'sendonly';
                  }
                } else if (audioTransceiver.direction === 'recvonly') {
                  if (audioTransceiver.setDirection) {
                    audioTransceiver.setDirection('inactive');
                  } else {
                    audioTransceiver.direction = 'inactive';
                  }
                }
              } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
                pc.addTransceiver('audio');
              }

              if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
                // support bit values
                offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
              }
              var videoTransceiver = pc.getTransceivers().find(function (transceiver) {
                return transceiver.sender.track && transceiver.sender.track.kind === 'video';
              });
              if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
                if (videoTransceiver.direction === 'sendrecv') {
                  videoTransceiver.setDirection('sendonly');
                } else if (videoTransceiver.direction === 'recvonly') {
                  videoTransceiver.setDirection('inactive');
                }
              } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
                pc.addTransceiver('video');
              }
            }
            return origCreateOffer.apply(pc, arguments);
          };
        }
      };
    }, { "../utils": 13 }], 13: [function (require, module, exports) {
      /*
       *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
       *
       *  Use of this source code is governed by a BSD-style license
       *  that can be found in the LICENSE file in the root of the source
       *  tree.
       */
      /* eslint-env node */
      'use strict';

      var logDisabled_ = true;
      var deprecationWarnings_ = true;

      /**
       * Extract browser version out of the provided user agent string.
       *
       * @param {!string} uastring userAgent string.
       * @param {!string} expr Regular expression used as match criteria.
       * @param {!number} pos position in the version string to be returned.
       * @return {!number} browser version.
       */
      function extractVersion(uastring, expr, pos) {
        var match = uastring.match(expr);
        return match && match.length >= pos && parseInt(match[pos], 10);
      }

      // Wraps the peerconnection event eventNameToWrap in a function
      // which returns the modified event object.
      function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
        if (!window.RTCPeerConnection) {
          return;
        }
        var proto = window.RTCPeerConnection.prototype;
        var nativeAddEventListener = proto.addEventListener;
        proto.addEventListener = function (nativeEventName, cb) {
          if (nativeEventName !== eventNameToWrap) {
            return nativeAddEventListener.apply(this, arguments);
          }
          var wrappedCallback = function wrappedCallback(e) {
            cb(wrapper(e));
          };
          this._eventMap = this._eventMap || {};
          this._eventMap[cb] = wrappedCallback;
          return nativeAddEventListener.apply(this, [nativeEventName, wrappedCallback]);
        };

        var nativeRemoveEventListener = proto.removeEventListener;
        proto.removeEventListener = function (nativeEventName, cb) {
          if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[cb]) {
            return nativeRemoveEventListener.apply(this, arguments);
          }
          var unwrappedCb = this._eventMap[cb];
          delete this._eventMap[cb];
          return nativeRemoveEventListener.apply(this, [nativeEventName, unwrappedCb]);
        };

        Object.defineProperty(proto, 'on' + eventNameToWrap, {
          get: function get() {
            return this['_on' + eventNameToWrap];
          },
          set: function set(cb) {
            if (this['_on' + eventNameToWrap]) {
              this.removeEventListener(eventNameToWrap, this['_on' + eventNameToWrap]);
              delete this['_on' + eventNameToWrap];
            }
            if (cb) {
              this.addEventListener(eventNameToWrap, this['_on' + eventNameToWrap] = cb);
            }
          }
        });
      }

      // Utility methods.
      module.exports = {
        extractVersion: extractVersion,
        wrapPeerConnectionEvent: wrapPeerConnectionEvent,
        disableLog: function disableLog(bool) {
          if (typeof bool !== 'boolean') {
            return new Error('Argument type: ' + (typeof bool === "undefined" ? "undefined" : _typeof(bool)) + '. Please use a boolean.');
          }
          logDisabled_ = bool;
          return bool ? 'adapter.js logging disabled' : 'adapter.js logging enabled';
        },

        /**
         * Disable or enable deprecation warnings
         * @param {!boolean} bool set to true to disable warnings.
         */
        disableWarnings: function disableWarnings(bool) {
          if (typeof bool !== 'boolean') {
            return new Error('Argument type: ' + (typeof bool === "undefined" ? "undefined" : _typeof(bool)) + '. Please use a boolean.');
          }
          deprecationWarnings_ = !bool;
          return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
        },

        log: function log() {
          if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === 'object') {
            if (logDisabled_) {
              return;
            }
            if (typeof console !== 'undefined' && typeof console.log === 'function') {
              console.log.apply(console, arguments);
            }
          }
        },

        /**
         * Shows a deprecation warning suggesting the modern and spec-compatible API.
         */
        deprecated: function deprecated(oldMethod, newMethod) {
          if (!deprecationWarnings_) {
            return;
          }
          console.warn(oldMethod + ' is deprecated, please use ' + newMethod + ' instead.');
        },

        /**
         * Browser detector.
         *
         * @return {object} result containing browser and version
         *     properties.
         */
        detectBrowser: function detectBrowser(window) {
          var navigator = window && window.navigator;

          // Returned result object.
          var result = {};
          result.browser = null;
          result.version = null;

          // Fail early if it's not a browser
          if (typeof window === 'undefined' || !window.navigator) {
            result.browser = 'Not a browser.';
            return result;
          }

          if (navigator.mozGetUserMedia) {
            // Firefox.
            result.browser = 'firefox';
            result.version = extractVersion(navigator.userAgent, /Firefox\/(\d+)\./, 1);
          } else if (navigator.webkitGetUserMedia) {
            // Chrome, Chromium, Webview, Opera.
            // Version matches Chrome/WebRTC version.
            result.browser = 'chrome';
            result.version = extractVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2);
          } else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
            // Edge.
            result.browser = 'edge';
            result.version = extractVersion(navigator.userAgent, /Edge\/(\d+).(\d+)$/, 2);
          } else if (window.RTCPeerConnection && navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
            // Safari.
            result.browser = 'safari';
            result.version = extractVersion(navigator.userAgent, /AppleWebKit\/(\d+)\./, 1);
          } else {
            // Default fallthrough: not supported.
            result.browser = 'Not a supported browser.';
            return result;
          }

          return result;
        }
      };
    }, {}] }, {}, [3])(3);
});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvanMvYXBpL3Byb3ZpZGVyL2h0bWw1L0xpc3RlbmVyLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9hcGkvcHJvdmlkZXIvaHRtbDUvV2ViUlRDTG9hZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy91dGlscy9hZGFwdGVyLmpzIl0sIm5hbWVzIjpbIkxpc3RlbmVyIiwiZWxWaWRlbyIsInByb3ZpZGVyIiwiZXJyb3JDYWxsYmFjayIsImxvd0xldmVsRXZlbnRzIiwidGhhdCIsImJldHdlZW4iLCJudW0iLCJtaW4iLCJtYXgiLCJNYXRoIiwiY2FucGxheSIsInNldENhblNlZWsiLCJ0cmlnZ2VyIiwiZHVyYXRpb25jaGFuZ2UiLCJwcm9ncmVzcyIsImVuZGVkIiwiZ2V0U3RhdGUiLCJzZXRTdGF0ZSIsImxvYWRlZGRhdGEiLCJsb2FkZWRtZXRhZGF0YSIsIm1ldGFkYXRhIiwiZHVyYXRpb24iLCJoZWlnaHQiLCJ2aWRlb0hlaWdodCIsIndpZHRoIiwidmlkZW9XaWR0aCIsInR5cGUiLCJnZXRDdXJyZW50U291cmNlIiwicGF1c2UiLCJlcnJvciIsImN1cnJlbnRUaW1lIiwicGxheSIsInBhdXNlZCIsInBsYXlpbmciLCJ0aW1lUmFuZ2VzIiwiYnVmZmVyZWQiLCJsZW5ndGgiLCJlbmQiLCJzZXRCdWZmZXIiLCJidWZmZXJQZXJjZW50IiwicG9zaXRpb24iLCJzdGFsbGVkIiwiT3ZlblBsYXllckNvbnNvbGUiLCJsb2ciLCJ0aW1ldXBkYXRlIiwiaXNOYU4iLCJpc1NlZWtpbmciLCJyZXNpemUiLCJzZWVraW5nIiwic2V0U2Vla2luZyIsInNlZWtlZCIsIndhaXRpbmciLCJ2b2x1bWVjaGFuZ2UiLCJ2b2x1bWUiLCJyb3VuZCIsIm11dGUiLCJtdXRlZCIsImNvZGUiLCJlcnJvckNvZGVHZW4iLCJyZWFzb24iLCJtZXNzYWdlIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZXZlbnROYW1lIiwiYWRkRXZlbnRMaXN0ZW5lciIsImRlc3Ryb3kiLCJXZWJSVENMb2FkZXIiLCJ1cmwiLCJ3cyIsInBlZXJDb25uZWN0aW9uIiwiY29uZmlnIiwibXlTZHAiLCJpbml0aWFsaXplIiwib25Mb2NhbERlc2NyaXB0aW9uIiwiaWQiLCJjb25uZWN0aW9uIiwiZGVzYyIsInNldExvY2FsRGVzY3JpcHRpb24iLCJ0aGVuIiwibG9jYWxTRFAiLCJsb2NhbERlc2NyaXB0aW9uIiwic2VuZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJzZHAiLCJjYXRjaCIsImNsb3NlUGVlciIsInJlc29sdmUiLCJyZWplY3QiLCJXZWJTb2NrZXQiLCJvbm9wZW4iLCJvbm1lc3NhZ2UiLCJlIiwicGFyc2UiLCJkYXRhIiwibGlzdCIsImNvbnNvbGUiLCJSVENQZWVyQ29ubmVjdGlvbiIsIm9uaWNlY2FuZGlkYXRlIiwiY2FuZGlkYXRlIiwiY2FuZGlkYXRlcyIsIm9ubmVnb3RpYXRpb25uZWVkZWQiLCJjcmVhdGVPZmZlciIsImVyciIsIm9uYWRkc3RyZWFtIiwic3RyZWFtIiwic2V0UmVtb3RlRGVzY3JpcHRpb24iLCJSVENTZXNzaW9uRGVzY3JpcHRpb24iLCJyZW1vdGVEZXNjcmlwdGlvbiIsImNyZWF0ZUFuc3dlciIsImkiLCJhZGRJY2VDYW5kaWRhdGUiLCJSVENJY2VDYW5kaWRhdGUiLCJvbmVycm9yIiwib25jbG9zZSIsImNsb3NlIiwiY29ubmVjdCIsImYiLCJleHBvcnRzIiwibW9kdWxlIiwiZGVmaW5lIiwidCIsIm4iLCJyIiwicyIsIm8iLCJ1IiwiYSIsInJlcXVpcmUiLCJFcnJvciIsImwiLCJjYWxsIiwiU0RQVXRpbHMiLCJ3cml0ZU1lZGlhU2VjdGlvbiIsInRyYW5zY2VpdmVyIiwiY2FwcyIsImR0bHNSb2xlIiwid3JpdGVSdHBEZXNjcmlwdGlvbiIsImtpbmQiLCJ3cml0ZUljZVBhcmFtZXRlcnMiLCJpY2VHYXRoZXJlciIsImdldExvY2FsUGFyYW1ldGVycyIsIndyaXRlRHRsc1BhcmFtZXRlcnMiLCJkdGxzVHJhbnNwb3J0IiwibWlkIiwicnRwU2VuZGVyIiwicnRwUmVjZWl2ZXIiLCJ0cmFja0lkIiwiX2luaXRpYWxUcmFja0lkIiwidHJhY2siLCJtc2lkIiwic2VuZEVuY29kaW5nUGFyYW1ldGVycyIsInNzcmMiLCJydHgiLCJsb2NhbENOYW1lIiwiZmlsdGVySWNlU2VydmVycyIsImljZVNlcnZlcnMiLCJlZGdlVmVyc2lvbiIsImhhc1R1cm4iLCJmaWx0ZXIiLCJzZXJ2ZXIiLCJ1cmxzIiwid2FybiIsImlzU3RyaW5nIiwidmFsaWRUdXJuIiwiaW5kZXhPZiIsImdldENvbW1vbkNhcGFiaWxpdGllcyIsImxvY2FsQ2FwYWJpbGl0aWVzIiwicmVtb3RlQ2FwYWJpbGl0aWVzIiwiY29tbW9uQ2FwYWJpbGl0aWVzIiwiY29kZWNzIiwiaGVhZGVyRXh0ZW5zaW9ucyIsImZlY01lY2hhbmlzbXMiLCJmaW5kQ29kZWNCeVBheWxvYWRUeXBlIiwicHQiLCJwYXJzZUludCIsInBheWxvYWRUeXBlIiwicHJlZmVycmVkUGF5bG9hZFR5cGUiLCJydHhDYXBhYmlsaXR5TWF0Y2hlcyIsImxSdHgiLCJyUnR4IiwibENvZGVjcyIsInJDb2RlY3MiLCJsQ29kZWMiLCJwYXJhbWV0ZXJzIiwiYXB0IiwickNvZGVjIiwibmFtZSIsInRvTG93ZXJDYXNlIiwiY2xvY2tSYXRlIiwibnVtQ2hhbm5lbHMiLCJwdXNoIiwicnRjcEZlZWRiYWNrIiwiZmIiLCJqIiwicGFyYW1ldGVyIiwibEhlYWRlckV4dGVuc2lvbiIsInJIZWFkZXJFeHRlbnNpb24iLCJ1cmkiLCJpc0FjdGlvbkFsbG93ZWRJblNpZ25hbGluZ1N0YXRlIiwiYWN0aW9uIiwic2lnbmFsaW5nU3RhdGUiLCJvZmZlciIsImFuc3dlciIsIm1heWJlQWRkQ2FuZGlkYXRlIiwiaWNlVHJhbnNwb3J0IiwiYWxyZWFkeUFkZGVkIiwiZ2V0UmVtb3RlQ2FuZGlkYXRlcyIsImZpbmQiLCJyZW1vdGVDYW5kaWRhdGUiLCJmb3VuZGF0aW9uIiwiaXAiLCJwb3J0IiwicHJpb3JpdHkiLCJwcm90b2NvbCIsImFkZFJlbW90ZUNhbmRpZGF0ZSIsIm1ha2VFcnJvciIsImRlc2NyaXB0aW9uIiwiTm90U3VwcG9ydGVkRXJyb3IiLCJJbnZhbGlkU3RhdGVFcnJvciIsIkludmFsaWRBY2Nlc3NFcnJvciIsIlR5cGVFcnJvciIsInVuZGVmaW5lZCIsIk9wZXJhdGlvbkVycm9yIiwid2luZG93IiwiYWRkVHJhY2tUb1N0cmVhbUFuZEZpcmVFdmVudCIsImFkZFRyYWNrIiwiZGlzcGF0Y2hFdmVudCIsIk1lZGlhU3RyZWFtVHJhY2tFdmVudCIsInJlbW92ZVRyYWNrRnJvbVN0cmVhbUFuZEZpcmVFdmVudCIsInJlbW92ZVRyYWNrIiwiZmlyZUFkZFRyYWNrIiwicGMiLCJyZWNlaXZlciIsInN0cmVhbXMiLCJ0cmFja0V2ZW50IiwiRXZlbnQiLCJzZXRUaW1lb3V0IiwiX2Rpc3BhdGNoRXZlbnQiLCJfZXZlbnRUYXJnZXQiLCJkb2N1bWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJtZXRob2QiLCJiaW5kIiwiY2FuVHJpY2tsZUljZUNhbmRpZGF0ZXMiLCJuZWVkTmVnb3RpYXRpb24iLCJsb2NhbFN0cmVhbXMiLCJyZW1vdGVTdHJlYW1zIiwiaWNlQ29ubmVjdGlvblN0YXRlIiwiY29ubmVjdGlvblN0YXRlIiwiaWNlR2F0aGVyaW5nU3RhdGUiLCJ1c2luZ0J1bmRsZSIsImJ1bmRsZVBvbGljeSIsInJ0Y3BNdXhQb2xpY3kiLCJpY2VUcmFuc3BvcnRQb2xpY3kiLCJfaWNlR2F0aGVyZXJzIiwiaWNlQ2FuZGlkYXRlUG9vbFNpemUiLCJSVENJY2VHYXRoZXJlciIsImdhdGhlclBvbGljeSIsIl9jb25maWciLCJ0cmFuc2NlaXZlcnMiLCJfc2RwU2Vzc2lvbklkIiwiZ2VuZXJhdGVTZXNzaW9uSWQiLCJfc2RwU2Vzc2lvblZlcnNpb24iLCJfZHRsc1JvbGUiLCJfaXNDbG9zZWQiLCJwcm90b3R5cGUiLCJvbnRyYWNrIiwib25yZW1vdmVzdHJlYW0iLCJvbnNpZ25hbGluZ3N0YXRlY2hhbmdlIiwib25pY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UiLCJvbmNvbm5lY3Rpb25zdGF0ZWNoYW5nZSIsIm9uaWNlZ2F0aGVyaW5nc3RhdGVjaGFuZ2UiLCJvbmRhdGFjaGFubmVsIiwiZXZlbnQiLCJfZW1pdEdhdGhlcmluZ1N0YXRlQ2hhbmdlIiwiZ2V0Q29uZmlndXJhdGlvbiIsImdldExvY2FsU3RyZWFtcyIsImdldFJlbW90ZVN0cmVhbXMiLCJfY3JlYXRlVHJhbnNjZWl2ZXIiLCJkb05vdEFkZCIsImhhc0J1bmRsZVRyYW5zcG9ydCIsInJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMiLCJhc3NvY2lhdGVkUmVtb3RlTWVkaWFTdHJlYW1zIiwid2FudFJlY2VpdmUiLCJ0cmFuc3BvcnRzIiwiX2NyZWF0ZUljZUFuZER0bHNUcmFuc3BvcnRzIiwiYWxyZWFkeUV4aXN0cyIsIl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCIsIlJUQ1J0cFNlbmRlciIsImFkZFN0cmVhbSIsImdldFRyYWNrcyIsImNsb25lZFN0cmVhbSIsImNsb25lIiwiaWR4IiwiY2xvbmVkVHJhY2siLCJlbmFibGVkIiwic2VuZGVyIiwic3RvcCIsIm1hcCIsInNwbGljZSIsInJlbW92ZVN0cmVhbSIsImdldFNlbmRlcnMiLCJnZXRSZWNlaXZlcnMiLCJfY3JlYXRlSWNlR2F0aGVyZXIiLCJzZHBNTGluZUluZGV4Iiwic2hpZnQiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwid3JpdGFibGUiLCJidWZmZXJlZENhbmRpZGF0ZUV2ZW50cyIsImJ1ZmZlckNhbmRpZGF0ZXMiLCJzdGF0ZSIsIl9nYXRoZXIiLCJvbmxvY2FsY2FuZGlkYXRlIiwiZXZ0Iiwic2RwTWlkIiwiY2FuZCIsImNvbXBvbmVudCIsInVmcmFnIiwidXNlcm5hbWVGcmFnbWVudCIsInNlcmlhbGl6ZWRDYW5kaWRhdGUiLCJ3cml0ZUNhbmRpZGF0ZSIsInBhcnNlQ2FuZGlkYXRlIiwidG9KU09OIiwic2VjdGlvbnMiLCJnZXRNZWRpYVNlY3Rpb25zIiwiZ2V0RGVzY3JpcHRpb24iLCJqb2luIiwiY29tcGxldGUiLCJldmVyeSIsIlJUQ0ljZVRyYW5zcG9ydCIsIm9uaWNlc3RhdGVjaGFuZ2UiLCJfdXBkYXRlSWNlQ29ubmVjdGlvblN0YXRlIiwiX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSIsIlJUQ0R0bHNUcmFuc3BvcnQiLCJvbmR0bHNzdGF0ZWNoYW5nZSIsIl9kaXNwb3NlSWNlQW5kRHRsc1RyYW5zcG9ydHMiLCJfdHJhbnNjZWl2ZSIsInJlY3YiLCJwYXJhbXMiLCJlbmNvZGluZ3MiLCJydGNwIiwiY25hbWUiLCJjb21wb3VuZCIsInJ0Y3BQYXJhbWV0ZXJzIiwicCIsInJlY2VpdmUiLCJQcm9taXNlIiwic2Vzc2lvbnBhcnQiLCJzcGxpdFNlY3Rpb25zIiwibWVkaWFTZWN0aW9uIiwicGFyc2VSdHBQYXJhbWV0ZXJzIiwiaXNJY2VMaXRlIiwibWF0Y2hQcmVmaXgiLCJyZWplY3RlZCIsImlzUmVqZWN0ZWQiLCJyZW1vdGVJY2VQYXJhbWV0ZXJzIiwiZ2V0SWNlUGFyYW1ldGVycyIsInJlbW90ZUR0bHNQYXJhbWV0ZXJzIiwiZ2V0RHRsc1BhcmFtZXRlcnMiLCJyb2xlIiwic3RhcnQiLCJfdXBkYXRlU2lnbmFsaW5nU3RhdGUiLCJyZWNlaXZlckxpc3QiLCJpY2VPcHRpb25zIiwic3Vic3RyIiwic3BsaXQiLCJsaW5lcyIsInNwbGl0TGluZXMiLCJnZXRLaW5kIiwiZGlyZWN0aW9uIiwiZ2V0RGlyZWN0aW9uIiwicmVtb3RlTXNpZCIsInBhcnNlTXNpZCIsImdldE1pZCIsImdlbmVyYXRlSWRlbnRpZmllciIsInBhcnNlUnRwRW5jb2RpbmdQYXJhbWV0ZXJzIiwicGFyc2VSdGNwUGFyYW1ldGVycyIsImlzQ29tcGxldGUiLCJjYW5kcyIsInNldFRyYW5zcG9ydCIsInNldFJlbW90ZUNhbmRpZGF0ZXMiLCJSVENSdHBSZWNlaXZlciIsImdldENhcGFiaWxpdGllcyIsImNvZGVjIiwiaXNOZXdUcmFjayIsIk1lZGlhU3RyZWFtIiwiZ2V0IiwiZGVmYXVsdCIsIm5hdGl2ZVRyYWNrIiwic2lkIiwiaXRlbSIsIm5ld1N0YXRlIiwic3RhdGVzIiwiY2xvc2VkIiwiY2hlY2tpbmciLCJjb25uZWN0ZWQiLCJjb21wbGV0ZWQiLCJkaXNjb25uZWN0ZWQiLCJmYWlsZWQiLCJuZXciLCJjb25uZWN0aW5nIiwibnVtQXVkaW9UcmFja3MiLCJudW1WaWRlb1RyYWNrcyIsIm9mZmVyT3B0aW9ucyIsImFyZ3VtZW50cyIsIm1hbmRhdG9yeSIsIm9wdGlvbmFsIiwib2ZmZXJUb1JlY2VpdmVBdWRpbyIsIm9mZmVyVG9SZWNlaXZlVmlkZW8iLCJ3cml0ZVNlc3Npb25Cb2lsZXJwbGF0ZSIsInJlbW90ZUNvZGVjIiwiaGRyRXh0IiwicmVtb3RlRXh0ZW5zaW9ucyIsInJIZHJFeHQiLCJnZXRMb2NhbENhbmRpZGF0ZXMiLCJtZWRpYVNlY3Rpb25zSW5PZmZlciIsImxvY2FsVHJhY2siLCJnZXRBdWRpb1RyYWNrcyIsImdldFZpZGVvVHJhY2tzIiwiaGFzUnR4IiwiYyIsInJlZHVjZWRTaXplIiwiY2FuZGlkYXRlU3RyaW5nIiwidHJpbSIsImdldFN0YXRzIiwicHJvbWlzZXMiLCJmaXhTdGF0c1R5cGUiLCJzdGF0IiwiaW5ib3VuZHJ0cCIsIm91dGJvdW5kcnRwIiwiY2FuZGlkYXRlcGFpciIsImxvY2FsY2FuZGlkYXRlIiwicmVtb3RlY2FuZGlkYXRlIiwicmVzdWx0cyIsIk1hcCIsImFsbCIsInJlcyIsInJlc3VsdCIsInNldCIsIm1ldGhvZHMiLCJuYXRpdmVNZXRob2QiLCJhcmdzIiwiYXBwbHkiLCJyYW5kb20iLCJ0b1N0cmluZyIsImJsb2IiLCJsaW5lIiwicGFydHMiLCJwYXJ0IiwiaW5kZXgiLCJwcmVmaXgiLCJzdWJzdHJpbmciLCJyZWxhdGVkQWRkcmVzcyIsInJlbGF0ZWRQb3J0IiwidGNwVHlwZSIsInRvVXBwZXJDYXNlIiwicGFyc2VJY2VPcHRpb25zIiwicGFyc2VSdHBNYXAiLCJwYXJzZWQiLCJ3cml0ZVJ0cE1hcCIsInBhcnNlRXh0bWFwIiwid3JpdGVFeHRtYXAiLCJoZWFkZXJFeHRlbnNpb24iLCJwcmVmZXJyZWRJZCIsInBhcnNlRm10cCIsImt2Iiwid3JpdGVGbXRwIiwicGFyYW0iLCJwYXJzZVJ0Y3BGYiIsIndyaXRlUnRjcEZiIiwicGFyc2VTc3JjTWVkaWEiLCJzcCIsImNvbG9uIiwiYXR0cmlidXRlIiwicGFyc2VGaW5nZXJwcmludCIsImFsZ29yaXRobSIsImZpbmdlcnByaW50cyIsInNldHVwVHlwZSIsImZwIiwiY29uY2F0IiwiaWNlUGFyYW1ldGVycyIsInBhc3N3b3JkIiwibWxpbmUiLCJydHBtYXBsaW5lIiwiZm10cHMiLCJtYXhwdGltZSIsImV4dGVuc2lvbiIsImVuY29kaW5nUGFyYW1ldGVycyIsImhhc1JlZCIsImhhc1VscGZlYyIsInNzcmNzIiwicHJpbWFyeVNzcmMiLCJzZWNvbmRhcnlTc3JjIiwiZmxvd3MiLCJlbmNQYXJhbSIsImNvZGVjUGF5bG9hZFR5cGUiLCJmZWMiLCJtZWNoYW5pc20iLCJiYW5kd2lkdGgiLCJtYXhCaXRyYXRlIiwicmVtb3RlU3NyYyIsIm9iaiIsInJzaXplIiwibXV4Iiwic3BlYyIsInBsYW5CIiwic2Vzc0lkIiwic2Vzc1ZlciIsInNlc3Npb25JZCIsInZlcnNpb24iLCJwYXJzZU1MaW5lIiwiZm10Iiwic2xpY2UiLCJwYXJzZU9MaW5lIiwidXNlcm5hbWUiLCJzZXNzaW9uVmVyc2lvbiIsIm5ldFR5cGUiLCJhZGRyZXNzVHlwZSIsImFkZHJlc3MiLCJnbG9iYWwiLCJhZGFwdGVyRmFjdG9yeSIsInNlbGYiLCJ1dGlscyIsImRlcGVuZGVuY2llcyIsIm9wdHMiLCJvcHRpb25zIiwic2hpbUNocm9tZSIsInNoaW1GaXJlZm94Iiwic2hpbUVkZ2UiLCJzaGltU2FmYXJpIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJsb2dnaW5nIiwiYnJvd3NlckRldGFpbHMiLCJkZXRlY3RCcm93c2VyIiwiY2hyb21lU2hpbSIsImVkZ2VTaGltIiwiZmlyZWZveFNoaW0iLCJzYWZhcmlTaGltIiwiY29tbW9uU2hpbSIsImFkYXB0ZXIiLCJleHRyYWN0VmVyc2lvbiIsImRpc2FibGVMb2ciLCJkaXNhYmxlV2FybmluZ3MiLCJicm93c2VyIiwic2hpbVBlZXJDb25uZWN0aW9uIiwiYnJvd3NlclNoaW0iLCJzaGltQ3JlYXRlT2JqZWN0VVJMIiwic2hpbUdldFVzZXJNZWRpYSIsInNoaW1NZWRpYVN0cmVhbSIsInNoaW1Tb3VyY2VPYmplY3QiLCJzaGltT25UcmFjayIsInNoaW1BZGRUcmFja1JlbW92ZVRyYWNrIiwic2hpbUdldFNlbmRlcnNXaXRoRHRtZiIsInNoaW1SVENJY2VDYW5kaWRhdGUiLCJzaGltTWF4TWVzc2FnZVNpemUiLCJzaGltU2VuZFRocm93VHlwZUVycm9yIiwic2hpbVJlbW92ZVN0cmVhbSIsInNoaW1SZXBsYWNlVHJhY2siLCJzaGltUlRDSWNlU2VydmVyVXJscyIsInNoaW1DYWxsYmFja3NBUEkiLCJzaGltTG9jYWxTdHJlYW1zQVBJIiwic2hpbVJlbW90ZVN0cmVhbXNBUEkiLCJzaGltVHJhY2tFdmVudFRyYW5zY2VpdmVyIiwic2hpbUNyZWF0ZU9mZmVyTGVnYWN5Iiwid2Via2l0TWVkaWFTdHJlYW0iLCJfb250cmFjayIsIm9yaWdTZXRSZW1vdGVEZXNjcmlwdGlvbiIsIl9vbnRyYWNrcG9seSIsInRlIiwid3JhcFBlZXJDb25uZWN0aW9uRXZlbnQiLCJzaGltU2VuZGVyV2l0aER0bWYiLCJkdG1mIiwiX2R0bWYiLCJjcmVhdGVEVE1GU2VuZGVyIiwiX3BjIiwiX3NlbmRlcnMiLCJvcmlnQWRkVHJhY2siLCJvcmlnUmVtb3ZlVHJhY2siLCJvcmlnQWRkU3RyZWFtIiwib3JpZ1JlbW92ZVN0cmVhbSIsIm9yaWdHZXRTZW5kZXJzIiwic2VuZGVycyIsIlVSTCIsIkhUTUxNZWRpYUVsZW1lbnQiLCJfc3JjT2JqZWN0Iiwic3JjIiwicmV2b2tlT2JqZWN0VVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwic2hpbUFkZFRyYWNrUmVtb3ZlVHJhY2tXaXRoTmF0aXZlIiwiX3NoaW1tZWRMb2NhbFN0cmVhbXMiLCJzdHJlYW1JZCIsIkRPTUV4Y2VwdGlvbiIsImV4aXN0aW5nU2VuZGVycyIsIm5ld1NlbmRlcnMiLCJuZXdTZW5kZXIiLCJvcmlnR2V0TG9jYWxTdHJlYW1zIiwibmF0aXZlU3RyZWFtcyIsIl9yZXZlcnNlU3RyZWFtcyIsIl9zdHJlYW1zIiwibmV3U3RyZWFtIiwib2xkU3RyZWFtIiwicmVwbGFjZUludGVybmFsU3RyZWFtSWQiLCJpbnRlcm5hbElkIiwiZXh0ZXJuYWxTdHJlYW0iLCJpbnRlcm5hbFN0cmVhbSIsInJlcGxhY2UiLCJSZWdFeHAiLCJyZXBsYWNlRXh0ZXJuYWxTdHJlYW1JZCIsImlzTGVnYWN5Q2FsbCIsIm9yaWdTZXRMb2NhbERlc2NyaXB0aW9uIiwib3JpZ0xvY2FsRGVzY3JpcHRpb24iLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJpc0xvY2FsIiwic3RyZWFtaWQiLCJoYXNUcmFjayIsIndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uIiwicGNDb25maWciLCJwY0NvbnN0cmFpbnRzIiwiaWNlVHJhbnNwb3J0cyIsImdlbmVyYXRlQ2VydGlmaWNhdGUiLCJPcmlnUGVlckNvbm5lY3Rpb24iLCJuZXdJY2VTZXJ2ZXJzIiwiZGVwcmVjYXRlZCIsIm9yaWdHZXRTdGF0cyIsInNlbGVjdG9yIiwic3VjY2Vzc0NhbGxiYWNrIiwiZml4Q2hyb21lU3RhdHNfIiwicmVzcG9uc2UiLCJzdGFuZGFyZFJlcG9ydCIsInJlcG9ydHMiLCJyZXBvcnQiLCJzdGFuZGFyZFN0YXRzIiwidGltZXN0YW1wIiwibmFtZXMiLCJtYWtlTWFwU3RhdHMiLCJzdGF0cyIsInN1Y2Nlc3NDYWxsYmFja1dyYXBwZXJfIiwicHJvbWlzZSIsIm5hdGl2ZUFkZEljZUNhbmRpZGF0ZSIsIm5hdmlnYXRvciIsImNvbnN0cmFpbnRzVG9DaHJvbWVfIiwiY2MiLCJpZGVhbCIsImV4YWN0Iiwib2xkbmFtZV8iLCJjaGFyQXQiLCJvYyIsIm1peCIsImFkdmFuY2VkIiwic2hpbUNvbnN0cmFpbnRzXyIsImNvbnN0cmFpbnRzIiwiZnVuYyIsImF1ZGlvIiwicmVtYXAiLCJiIiwidmlkZW8iLCJmYWNlIiwiZmFjaW5nTW9kZSIsImdldFN1cHBvcnRlZEZhY2luZ01vZGVMaWVzIiwibWVkaWFEZXZpY2VzIiwiZ2V0U3VwcG9ydGVkQ29uc3RyYWludHMiLCJtYXRjaGVzIiwiZW51bWVyYXRlRGV2aWNlcyIsImRldmljZXMiLCJkIiwiZGV2Iiwic29tZSIsIm1hdGNoIiwibGFiZWwiLCJkZXZpY2VJZCIsInNoaW1FcnJvcl8iLCJQZXJtaXNzaW9uRGVuaWVkRXJyb3IiLCJQZXJtaXNzaW9uRGlzbWlzc2VkRXJyb3IiLCJEZXZpY2VzTm90Rm91bmRFcnJvciIsIkNvbnN0cmFpbnROb3RTYXRpc2ZpZWRFcnJvciIsIlRyYWNrU3RhcnRFcnJvciIsIk1lZGlhRGV2aWNlRmFpbGVkRHVlVG9TaHV0ZG93biIsIk1lZGlhRGV2aWNlS2lsbFN3aXRjaE9uIiwiVGFiQ2FwdHVyZUVycm9yIiwiU2NyZWVuQ2FwdHVyZUVycm9yIiwiRGV2aWNlQ2FwdHVyZUVycm9yIiwiY29uc3RyYWludCIsImNvbnN0cmFpbnROYW1lIiwiZ2V0VXNlck1lZGlhXyIsIm9uU3VjY2VzcyIsIm9uRXJyb3IiLCJ3ZWJraXRHZXRVc2VyTWVkaWEiLCJnZXRVc2VyTWVkaWEiLCJnZXRVc2VyTWVkaWFQcm9taXNlXyIsImtpbmRzIiwiTWVkaWFTdHJlYW1UcmFjayIsImdldFNvdXJjZXMiLCJkZXZpY2UiLCJncm91cElkIiwiZWNob0NhbmNlbGxhdGlvbiIsImZyYW1lUmF0ZSIsIm9yaWdHZXRVc2VyTWVkaWEiLCJjcyIsIk5hdGl2ZVJUQ0ljZUNhbmRpZGF0ZSIsIm5hdGl2ZUNhbmRpZGF0ZSIsInBhcnNlZENhbmRpZGF0ZSIsImF1Z21lbnRlZENhbmRpZGF0ZSIsIm5hdGl2ZUNyZWF0ZU9iamVjdFVSTCIsIm5hdGl2ZVJldm9rZU9iamVjdFVSTCIsIm5ld0lkIiwiZGVsZXRlIiwiZHNjIiwic3JjT2JqZWN0IiwibmF0aXZlU2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwiUlRDU2N0cFRyYW5zcG9ydCIsIl9zY3RwIiwic2N0cEluRGVzY3JpcHRpb24iLCJtTGluZSIsImdldFJlbW90ZUZpcmVmb3hWZXJzaW9uIiwiZ2V0Q2FuU2VuZE1heE1lc3NhZ2VTaXplIiwicmVtb3RlSXNGaXJlZm94IiwiY2FuU2VuZE1heE1lc3NhZ2VTaXplIiwiZ2V0TWF4TWVzc2FnZVNpemUiLCJtYXhNZXNzYWdlU2l6ZSIsImlzRmlyZWZveCIsImNhblNlbmRNTVMiLCJyZW1vdGVNTVMiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsInNjdHAiLCJvcmlnQ3JlYXRlRGF0YUNoYW5uZWwiLCJjcmVhdGVEYXRhQ2hhbm5lbCIsImRhdGFDaGFubmVsIiwib3JpZ0RhdGFDaGFubmVsU2VuZCIsImRjIiwic2l6ZSIsImJ5dGVMZW5ndGgiLCJzaGltUlRDUGVlckNvbm5lY3Rpb24iLCJvcmlnTVNURW5hYmxlZCIsImV2IiwiUlRDRHRtZlNlbmRlciIsIlJUQ0RUTUZTZW5kZXIiLCJyZXBsYWNlVHJhY2siLCJzZXRUcmFjayIsIlJUQ1RyYWNrRXZlbnQiLCJtb3pTcmNPYmplY3QiLCJtb3pSVENQZWVyQ29ubmVjdGlvbiIsIm5ld1NlcnZlciIsImNyZWRlbnRpYWwiLCJtb3pSVENTZXNzaW9uRGVzY3JpcHRpb24iLCJtb3pSVENJY2VDYW5kaWRhdGUiLCJtb2Rlcm5TdGF0c1R5cGVzIiwibmF0aXZlR2V0U3RhdHMiLCJvblN1Y2MiLCJvbkVyciIsIkludGVybmFsRXJyb3IiLCJTZWN1cml0eUVycm9yIiwiY29uc3RyYWludHNUb0ZGMzdfIiwibW96R2V0VXNlck1lZGlhIiwiaW5mb3MiLCJvcmdFbnVtZXJhdGVEZXZpY2VzIiwibmF0aXZlR2V0VXNlck1lZGlhIiwiZ2V0U2V0dGluZ3MiLCJuYXRpdmVHZXRTZXR0aW5ncyIsImFwcGx5Q29uc3RyYWludHMiLCJuYXRpdmVBcHBseUNvbnN0cmFpbnRzIiwiX2xvY2FsU3RyZWFtcyIsImdldFN0cmVhbUJ5SWQiLCJfcmVtb3RlU3RyZWFtcyIsIl9hZGRUcmFjayIsInRyYWNrcyIsIl9vbmFkZHN0cmVhbSIsIl9vbmFkZHN0cmVhbXBvbHkiLCJmYWlsdXJlQ2FsbGJhY2siLCJ3aXRoQ2FsbGJhY2siLCJjYiIsImVycmNiIiwiUlRDVHJhbnNjZWl2ZXIiLCJvcmlnQ3JlYXRlT2ZmZXIiLCJhdWRpb1RyYW5zY2VpdmVyIiwiZ2V0VHJhbnNjZWl2ZXJzIiwic2V0RGlyZWN0aW9uIiwiYWRkVHJhbnNjZWl2ZXIiLCJ2aWRlb1RyYW5zY2VpdmVyIiwibG9nRGlzYWJsZWRfIiwiZGVwcmVjYXRpb25XYXJuaW5nc18iLCJ1YXN0cmluZyIsImV4cHIiLCJwb3MiLCJldmVudE5hbWVUb1dyYXAiLCJ3cmFwcGVyIiwicHJvdG8iLCJuYXRpdmVBZGRFdmVudExpc3RlbmVyIiwibmF0aXZlRXZlbnROYW1lIiwid3JhcHBlZENhbGxiYWNrIiwiX2V2ZW50TWFwIiwibmF0aXZlUmVtb3ZlRXZlbnRMaXN0ZW5lciIsInVud3JhcHBlZENiIiwiYm9vbCIsIm9sZE1ldGhvZCIsIm5ld01ldGhvZCIsInVzZXJBZ2VudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQXdCQTs7Ozs7OztBQU9BLElBQU1BLFdBQVcsU0FBWEEsUUFBVyxDQUFTQyxPQUFULEVBQWtCQyxRQUFsQixFQUE0QkMsYUFBNUIsRUFBMEM7QUFDdkQsUUFBTUMsaUJBQWlCLEVBQXZCOztBQUlBLFFBQU1DLE9BQU8sRUFBYjtBQUNBLFFBQU1DLFVBQVUsU0FBVkEsT0FBVSxDQUFVQyxHQUFWLEVBQWVDLEdBQWYsRUFBb0JDLEdBQXBCLEVBQXlCO0FBQ3JDLGVBQU9DLEtBQUtELEdBQUwsQ0FBU0MsS0FBS0YsR0FBTCxDQUFTRCxHQUFULEVBQWNFLEdBQWQsQ0FBVCxFQUE2QkQsR0FBN0IsQ0FBUDtBQUNILEtBRkQ7O0FBSUE7QUFDQUosbUJBQWVPLE9BQWYsR0FBeUIsWUFBTTtBQUMzQlQsaUJBQVNVLFVBQVQsQ0FBb0IsSUFBcEI7QUFDQVYsaUJBQVNXLE9BQVQ7QUFDSCxL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LFFBQWpCO0FBQ0EzRyxtQkFBT3dFLE9BQVAsR0FBaUJnQyxlQUFlbUcsVUFBVThKLFNBQXpCLEVBQ2Isc0JBRGEsRUFDVyxDQURYLENBQWpCO0FBRUQsV0FMTSxNQUtBO0FBQUU7QUFDUHpXLG1CQUFPMkcsT0FBUCxHQUFpQiwwQkFBakI7QUFDQSxtQkFBTzNHLE1BQVA7QUFDRDs7QUFFRCxpQkFBT0EsTUFBUDtBQUNEO0FBOUZjLE9BQWpCO0FBaUdDLEtBaExxQixFQWdMcEIsRUFoTG9CLENBOXBKb3hCLEVBQTNiLEVBODBKeFcsRUE5MEp3VyxFQTgwSnJXLENBQUMsQ0FBRCxDQTkwSnFXLEVBODBKaFcsQ0E5MEpnVyxDQUFQO0FBKzBKdlcsQ0EvMEpELEUiLCJmaWxlIjoib3ZlbnBsYXllci5wcm92aWRlci5IbHNQcm92aWRlcn5vdmVucGxheWVyLnByb3ZpZGVyLmh0bWw1LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBTVEFURV9JRExFLFxuICAgIFNUQVRFX1BMQVlJTkcsXG4gICAgU1RBVEVfU1RBTExFRCxcbiAgICBTVEFURV9MT0FESU5HLFxuICAgIFNUQVRFX0NPTVBMRVRFLFxuICAgIFNUQVRFX1BBVVNFRCxcbiAgICBTVEFURV9FUlJPUixcbiAgICBDT05URU5UX0NPTVBMRVRFLFxuICAgIENPTlRFTlRfU0VFSyxcbiAgICBDT05URU5UX0JVRkZFUl9GVUxMLFxuICAgIENPTlRFTlRfU0VFS0VELFxuICAgIENPTlRFTlRfQlVGRkVSLFxuICAgIENPTlRFTlRfVElNRSxcbiAgICBDT05URU5UX1ZPTFVNRSxcbiAgICBDT05URU5UX01FVEEsXG4gICAgUExBWUVSX1VOS05XT05fRVJST1IsXG4gICAgUExBWUVSX1VOS05XT05fT1BFUkFUSU9OX0VSUk9SLFxuICAgIFBMQVlFUl9VTktOV09OX05FV1dPUktfRVJST1IsXG4gICAgUExBWUVSX1VOS05XT05fREVDT0RFX0VSUk9SLFxuICAgIFBMQVlFUl9GSUxFX0VSUk9SXG59IGZyb20gXCJhcGkvY29uc3RhbnRzXCI7XG5cblxuLyoqXG4gKiBAYnJpZWYgICBUcmlnZ2VyIG9uIHZhcmlvdXMgdmlkZW8gZXZlbnRzLlxuICogQHBhcmFtICAgZWxlbWVudCBlbFZpZGVvICB2aWRlb1xuICogQHBhcmFtICAgUHJvdmlkZXIgcHJvdmlkZXIgIGh0bWw1UHJvdmlkZXJcbiAqIEBwYXJhbSAgIGZ1bmN0aW9uIHByb3ZpZGVyICBodG1sNVByb3ZpZGVyXG4gKiAqL1xuXG5jb25zdCBMaXN0ZW5lciA9IGZ1bmN0aW9uKGVsVmlkZW8sIHByb3ZpZGVyLCBlcnJvckNhbGxiYWNrKXtcbiAgICBjb25zdCBsb3dMZXZlbEV2ZW50cyA9IHt9O1xuXG5cblxuICAgIGNvbnN0IHRoYXQgPSB7fTtcbiAgICBjb25zdCBiZXR3ZWVuID0gZnVuY3Rpb24gKG51bSwgbWluLCBtYXgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KE1hdGgubWluKG51bSwgbWF4KSwgbWluKTtcbiAgICB9XG5cbiAgICAvL0ZpcmVzIHdoZW4gdGhlIGJyb3dzZXIgY2FuIHN0YXJ0IHBsYXlpbmcgdGhlIGF1ZGlvL3ZpZGVvXG4gICAgbG93TGV2ZWxFdmVudHMuY2FucGxheSA9ICgpID0+IHtcbiAgICAgICAgcHJvdmlkZXIuc2V0Q2FuU2Vlayh0cnVlKTtcbiAgICAgICAgcHJvdmlkZXIudHJpZ2dlcihDT05URU5UX0JVRkZFUl9GVUxMKTtcbiAgICB9O1xuICAgIC8vRmlyZXMgd2hlbiB0aGUgZHVyYXRpb24gb2YgdGhlIGF1ZGlvL3ZpZGVvIGlzIGNoYW5nZWRcbiAgICBsb3dMZXZlbEV2ZW50cy5kdXJhdGlvbmNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgbG93TGV2ZWxFdmVudHMucHJvZ3Jlc3MoKTtcbiAgICB9O1xuICAgIC8vRmlyZXMgd2hlbiB0aGUgY3VycmVudCBwbGF5bGlzdCBpcyBlbmRlZFxuICAgIGxvd0xldmVsRXZlbnRzLmVuZGVkID0gKCkgPT4ge1xuXG4gICAgICAgIGlmKHByb3ZpZGVyLmdldFN0YXRlKCkgIT0gU1RBVEVfSURMRSAmJiBwcm92aWRlci5nZXRTdGF0ZSgpICE9IFNUQVRFX0NPTVBMRVRFKXtcbiAgICAgICAgICAgIHByb3ZpZGVyLnRyaWdnZXIoQ09OVEVOVF9DT01QTEVURSk7XG4gICAgICAgICAgICBwcm92aWRlci5zZXRTdGF0ZShTVEFURV9DT01QTEVURSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vRmlyZXMgd2hlbiB0aGUgYnJvd3NlciBoYXMgbG9hZGVkIHRoZSBjdXJyZW50IGZyYW1lIG9mIHRoZSBhdWRpby92aWRlb1xuICAgIGxvd0xldmVsRXZlbnRzLmxvYWRlZGRhdGEgPSAoKSA9PiB7XG4gICAgICAgIC8vbG9hZGVkbWV0YWRhdGHsmYAg7Zi864+I7J20IOyYrCDsiJgg7J6I7Jy864uIIOyVhOustOqyg+uPhCDtlZjsp4Ag66eQ7KaI7JWEXG4gICAgICAgIC8qT3ZlblBsYXllckNvbnNvbGUubG9nKFwibG9hZGVkZGF0YVwiKTtcbiAgICAgICAgdmFyIG1ldGFkYXRhID0ge1xuICAgICAgICAgICAgZHVyYXRpb246IGVsVmlkZW8uZHVyYXRpb24sXG4gICAgICAgICAgICBoZWlnaHQ6IGVsVmlkZW8udmlkZW9IZWlnaHQsXG4gICAgICAgICAgICB3aWR0aDogZWxWaWRlby52aWRlb1dpZHRoXG4gICAgICAgIH07XG4gICAgICAgIC8vcHJvdmlkZXIudHJpZ2dlcihDT05URU5UX01FVEEsIG1ldGFkYXRhKTsqL1xuICAgIH07XG4gICAgLy9GaXJlcyB3aGVuIHRoZSBicm93c2VyIGhhcyBsb2FkZWQgbWV0YSBkYXRhIGZvciB0aGUgYXVkaW8vdmlkZW9cbiAgICBsb3dMZXZlbEV2ZW50cy5sb2FkZWRtZXRhZGF0YSA9ICgpID0+IHtcbiAgICAgICAgdmFyIG1ldGFkYXRhID0ge1xuICAgICAgICAgICAgZHVyYXRpb246IGVsVmlkZW8uZHVyYXRpb24sXG4gICAgICAgICAgICBoZWlnaHQ6IGVsVmlkZW8udmlkZW9IZWlnaHQsXG4gICAgICAgICAgICB3aWR0aDogZWxWaWRlby52aWRlb1dpZHRoLFxuICAgICAgICAgICAgdHlwZSA6IHByb3ZpZGVyLmdldEN1cnJlbnRTb3VyY2UoKSA/IHByb3ZpZGVyLmdldEN1cnJlbnRTb3VyY2UoKS50eXBlIDogXCJcIlxuICAgICAgICB9O1xuICAgICAgICBwcm92aWRlci50cmlnZ2VyKENPTlRFTlRfTUVUQSwgbWV0YWRhdGEpO1xuICAgIH07XG4gICAgLy9GaXJlcyB3aGVuIHRoZSBhdWRpby92aWRlbyBoYXMgYmVlbiBwYXVzZWRcbiAgICBsb3dMZXZlbEV2ZW50cy5wYXVzZSA9ICgpID0+IHtcbiAgICAgICAgaWYocHJvdmlkZXIuZ2V0U3RhdGUoKSA9PT0gU1RBVEVfQ09NUExFVEUgfHxwcm92aWRlci5nZXRTdGF0ZSgpID09PSBTVEFURV9FUlJPUil7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYoZWxWaWRlby5lbmRlZCl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYoZWxWaWRlby5lcnJvcil7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYoZWxWaWRlby5jdXJyZW50VGltZSA9PT0gZWxWaWRlby5kdXJhdGlvbil7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcHJvdmlkZXIuc2V0U3RhdGUoU1RBVEVfUEFVU0VEKTtcbiAgICB9O1xuICAgIC8vRmlyZXMgd2hlbiB0aGUgYXVkaW8vdmlkZW8gaGFzIGJlZW4gc3RhcnRlZCBvciBpcyBubyBsb25nZXIgcGF1c2VkXG4gICAgbG93TGV2ZWxFdmVudHMucGxheSA9ICgpID0+IHtcbiAgICAgICAgaWYgKCFlbFZpZGVvLnBhdXNlZCAmJiBwcm92aWRlci5nZXRTdGF0ZSgpICE9PSBTVEFURV9QTEFZSU5HKSB7XG4gICAgICAgICAgICBwcm92aWRlci5zZXRTdGF0ZShTVEFURV9MT0FESU5HKTtcbiAgICAgICAgfVxuXG4gICAgfTtcbiAgICAvL0ZpcmVzIHdoZW4gdGhlIGF1ZGlvL3ZpZGVvIGlzIHBsYXlpbmcgYWZ0ZXIgaGF2aW5nIGJlZW4gcGF1c2VkIG9yIHN0b3BwZWQgZm9yIGJ1ZmZlcmluZ1xuICAgIGxvd0xldmVsRXZlbnRzLnBsYXlpbmcgPSAoKSA9PiB7XG4gICAgICAgIHByb3ZpZGVyLnNldFN0YXRlKFNUQVRFX1BMQVlJTkcpO1xuICAgICAgICAvL3Byb3ZpZGVyLnRyaWdnZXIoUFJPVklERVJfRklSU1RfRlJBTUUpO1xuICAgIH07XG4gICAgLy9GaXJlcyB3aGVuIHRoZSBicm93c2VyIGlzIGRvd25sb2FkaW5nIHRoZSBhdWRpby92aWRlb1xuICAgIGxvd0xldmVsRXZlbnRzLnByb2dyZXNzID0gKCkgPT4ge1xuICAgICAgICBsZXQgdGltZVJhbmdlcyA9IGVsVmlkZW8uYnVmZmVyZWQ7XG4gICAgICAgIGlmKCF0aW1lUmFuZ2VzICl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGR1cmF0aW9uID0gZWxWaWRlby5kdXJhdGlvbjtcbiAgICAgICAgbGV0IGJ1ZmZlcmVkID0gYmV0d2VlbiggKHRpbWVSYW5nZXMubGVuZ3RoPiAwID8gdGltZVJhbmdlcy5lbmQodGltZVJhbmdlcy5sZW5ndGggLSAxKSA6IDAgKSAvIGR1cmF0aW9uLCAwLCAxKTtcbiAgICAgICAgcHJvdmlkZXIuc2V0QnVmZmVyKGJ1ZmZlcmVkKjEwMCk7XG4gICAgICAgIHByb3ZpZGVyLnRyaWdnZXIoQ09OVEVOVF9CVUZGRVIsIHtcbiAgICAgICAgICAgIGJ1ZmZlclBlcmNlbnQ6IGJ1ZmZlcmVkKjEwMCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBlbFZpZGVvLmN1cnJlbnRUaW1lLFxuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uXG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLy9GaXJlcyB3aGVuIHRoZSBicm93c2VyIGlzIHRyeWluZyB0byBnZXQgbWVkaWEgZGF0YSwgYnV0IGRhdGEgaXMgbm90IGF2YWlsYWJsZVxuICAgIGxvd0xldmVsRXZlbnRzLnN0YWxsZWQgPSAoKSA9PiB7XG4gICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyhcImh0bWw1IHN0YWxsXCIpO1xuICAgIH07XG4gICAgLy9GaXJlcyB3aGVuIHRoZSBjdXJyZW50IHBsYXliYWNrIHBvc2l0aW9uIGhhcyBjaGFuZ2VkXG4gICAgbG93TGV2ZWxFdmVudHMudGltZXVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBlbFZpZGVvLmN1cnJlbnRUaW1lO1xuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGVsVmlkZW8uZHVyYXRpb247XG4gICAgICAgIGlmIChpc05hTihkdXJhdGlvbikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFwcm92aWRlci5pc1NlZWtpbmcoKSAmJiAhZWxWaWRlby5wYXVzZWQpe1xuICAgICAgICAgICAgcHJvdmlkZXIuc2V0U3RhdGUoU1RBVEVfUExBWUlORyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvdmlkZXIuZ2V0U3RhdGUoKSA9PT0gU1RBVEVfUExBWUlORyB8fCBwcm92aWRlci5pc1NlZWtpbmcoKSkge1xuICAgICAgICAgICAgcHJvdmlkZXIudHJpZ2dlcihDT05URU5UX1RJTUUsIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfTtcbiAgICBsb3dMZXZlbEV2ZW50cy5yZXNpemUgPSAoKSA9PiB7fTtcbiAgICBsb3dMZXZlbEV2ZW50cy5zZWVraW5nID0gKCkgPT4ge1xuICAgICAgICBwcm92aWRlci5zZXRTZWVraW5nKHRydWUpO1xuICAgICAgICBwcm92aWRlci50cmlnZ2VyKENPTlRFTlRfU0VFSyx7XG4gICAgICAgICAgICBwb3NpdGlvbiA6IGVsVmlkZW8uY3VycmVudFRpbWVcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBsb3dMZXZlbEV2ZW50cy5zZWVrZWQgPSAoKSA9PiB7XG4gICAgICAgIGlmKCFwcm92aWRlci5pc1NlZWtpbmcoKSl7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcHJvdmlkZXIuc2V0U2Vla2luZyhmYWxzZSk7XG4gICAgICAgIHByb3ZpZGVyLnRyaWdnZXIoQ09OVEVOVF9TRUVLRUQpO1xuICAgIH07XG5cbiAgICAvL0ZpcmVzIHdoZW4gdGhlIHZpZGVvIHN0b3BzIGJlY2F1c2UgaXQgbmVlZHMgdG8gYnVmZmVyIHRoZSBuZXh0IGZyYW1lXG4gICAgbG93TGV2ZWxFdmVudHMud2FpdGluZyA9ICgpID0+IHtcbiAgICAgICAgaWYocHJvdmlkZXIuaXNTZWVraW5nKCkpe1xuICAgICAgICAgICAgcHJvdmlkZXIuc2V0U3RhdGUoU1RBVEVfTE9BRElORyk7XG4gICAgICAgIH1lbHNlIGlmKHByb3ZpZGVyLmdldFN0YXRlKCkgPT0gU1RBVEVfUExBWUlORyl7XG4gICAgICAgICAgICBwcm92aWRlci5zZXRTdGF0ZShTVEFURV9TVEFMTEVEKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBsb3dMZXZlbEV2ZW50cy52b2x1bWVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIHByb3ZpZGVyLnRyaWdnZXIoQ09OVEVOVF9WT0xVTUUsIHtcbiAgICAgICAgICAgIHZvbHVtZTogTWF0aC5yb3VuZChlbFZpZGVvLnZvbHVtZSAqIDEwMCksXG4gICAgICAgICAgICBtdXRlOiBlbFZpZGVvLm11dGVkXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBsb3dMZXZlbEV2ZW50cy5lcnJvciA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY29kZSA9IChlbFZpZGVvLmVycm9yICYmIGVsVmlkZW8uZXJyb3IuY29kZSkgfHwgMDtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlR2VuID0gKHtcbiAgICAgICAgICAgIDA6IHtjb2RlIDogUExBWUVSX1VOS05XT05fRVJST1IsIHJlYXNvbiA6IFwiVW5rbm93biBodG1sNSB2aWRlbyBlcnJvclwiLCBtZXNzYWdlIDogXCJVbmtub3duIGh0bWw1IHZpZGVvIGVycm9yXCJ9LFxuICAgICAgICAgICAgMToge2NvZGUgOiBQTEFZRVJfVU5LTldPTl9PUEVSQVRJT05fRVJST1IsIHJlYXNvbiA6IFwiVW5rbm93biBvcGVyYXRpb24gYWJvcnRlZFwiLCBtZXNzYWdlIDogXCJVbmtub3duIG9wZXJhdGlvbiBhYm9ydGVkXCJ9LFxuICAgICAgICAgICAgMjoge2NvZGUgOiBQTEFZRVJfVU5LTldPTl9ORVdXT1JLX0VSUk9SLCByZWFzb24gOiBcIlVua25vd24gbmV0d29yayBlcnJvclwiLCBtZXNzYWdlIDogXCJVbmtub3duIG5ldHdvcmsgZXJyb3JcIn0sXG4gICAgICAgICAgICAzOiB7Y29kZSA6IFBMQVlFUl9VTktOV09OX0RFQ09ERV9FUlJPUiwgcmVhc29uIDogXCJVbmtub3duIGRlY29kZSBlcnJvclwiLCBtZXNzYWdlIDogXCJVbmtub3duIGRlY29kZSBlcnJvclwifSxcbiAgICAgICAgICAgIDQ6IHtjb2RlIDogUExBWUVSX0ZJTEVfRVJST1IsIHJlYXNvbiA6IFwiRmlsZSBjb3VsZCBub3QgYmUgcGxheWVkXCIsIG1lc3NhZ2UgOiBcIkZpbGUgY291bGQgbm90IGJlIHBsYXllZFwifVxuICAgICAgICB9W2NvZGVdfHwwKTtcbiAgICAgICAgZXJyb3JDb2RlR2VuLmVycm9yID0gZWxWaWRlby5lcnJvcjtcbiAgICAgICAgZXJyb3JDYWxsYmFjayhlcnJvckNvZGVHZW4pO1xuICAgIH07XG5cblxuXG4gICAgT2JqZWN0LmtleXMobG93TGV2ZWxFdmVudHMpLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgICAgZWxWaWRlby5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgbG93TGV2ZWxFdmVudHNbZXZlbnROYW1lXSk7XG4gICAgICAgIGVsVmlkZW8uYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxvd0xldmVsRXZlbnRzW2V2ZW50TmFtZV0pO1xuICAgIH0pO1xuXG4gICAgdGhhdC5kZXN0cm95ID0gKCkgPT57XG4gICAgICAgIE9iamVjdC5rZXlzKGxvd0xldmVsRXZlbnRzKS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgICAgICAgICBlbFZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBsb3dMZXZlbEV2ZW50c1tldmVudE5hbWVdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gdGhhdDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IExpc3RlbmVyOyIsImltcG9ydCBhZGFwdGVyIGZyb20gJ3V0aWxzL2FkYXB0ZXInO1xuaW1wb3J0IFByb21pc2UsIHtyZXNvbHZlZH0gZnJvbSBcImFwaS9zaGltcy9wcm9taXNlXCI7XG5cbmltcG9ydCB7XG4gICAgUExBWUVSX1dFQlJUQ19XU19FUlJPUixcbiAgICBQTEFZRVJfV0VCUlRDX1dTX0NMT1NFRCxcbiAgICBQTEFZRVJfV0VCUlRDX0FERF9JQ0VDQU5ESURBVEVfRVJST1IsXG4gICAgUExBWUVSX1dFQlJUQ19TRVRfUkVNT1RFX0RFU0NfRVJST1IsXG4gICAgUExBWUVSX1dFQlJUQ19DUkVBVEVfQU5TV0VSX0VSUk9SLFxuICAgIFBMQVlFUl9XRUJSVENfU0VUX0xPQ0FMX0RFU0NfRVJST1Jcbn0gZnJvbSBcImFwaS9jb25zdGFudHNcIjtcblxuY29uc3QgV2ViUlRDTG9hZGVyID0gZnVuY3Rpb24odXJsLCBlcnJvckNhbGxiYWNrKXtcbiAgICB2YXIgdXJsID0gdXJsO1xuICAgIGxldCB3cyA9IFwiXCI7XG4gICAgbGV0IHBlZXJDb25uZWN0aW9uID0gXCJcIjtcbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgICdpY2VTZXJ2ZXJzJzogW3tcbiAgICAgICAgICAgICd1cmxzJzogJ3N0dW46c3R1bi5sLmdvb2dsZS5jb206MTkzMDInXG4gICAgICAgIH1dXG4gICAgfTtcbiAgICBjb25zdCB0aGF0ID0ge307XG4gICAgbGV0IG15U2RwID0gXCJcIjtcblxuXG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZSh0eXBlKSB7XG4gICAgICAgIGNvbnN0IG9uTG9jYWxEZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKGlkLCBjb25uZWN0aW9uLCBkZXNjKSB7XG4gICAgICAgICAgICBjb25uZWN0aW9uLnNldExvY2FsRGVzY3JpcHRpb24oZGVzYykudGhlbihmdW5jdGlvbiAoKXtcbiAgICAgICAgICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJzZXRMb2NhbERlc2NyaXB0aW9uIDogc3VjY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICAvLyDrgrQgU0RQ6rCAIOyDneyEseuQqFxuICAgICAgICAgICAgICAgIHZhciBsb2NhbFNEUCA9IGNvbm5lY3Rpb24ubG9jYWxEZXNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coJ0xvY2FsIFNEUCcsIGxvY2FsU0RQKTtcbiAgICAgICAgICAgICAgICBteVNkcCA9IGxvY2FsU0RQOyAgIC8vdGVzdCBjb2RlXG4gICAgICAgICAgICAgICAgLy8g64K0IFNEUOulvCDshJzrsoTroZwg7KCE7IahXG4gICAgICAgICAgICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgc2RwOiBsb2NhbFNEUFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgICAgICBjbG9zZVBlZXIoe2NvZGUgOiBQTEFZRVJfV0VCUlRDX1NFVF9MT0NBTF9ERVNDX0VSUk9SLCByZWFzb24gOiBcInNldExvY2FsRGVzY3JpcHRpb24gZXJyb3Igb2NjdXJyZWRcIiwgbWVzc2FnZSA6IFwic2V0TG9jYWxEZXNjcmlwdGlvbiBlcnJvciBvY2N1cnJlZFwiLCBlcnJvciA6IGVycm9yfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZyh1cmwgKTtcbiAgICAgICAgICAgIHdzID0gbmV3IFdlYlNvY2tldCh1cmwpO1xuICAgICAgICAgICAgd3Mub25vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7dHlwZSA6IFwicGxheWVyXCJ9KSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd3Mub25tZXNzYWdlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBpZihtZXNzYWdlLmxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKCdMaXN0IHJlY2VpdmVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZighbWVzc2FnZS5pZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdJRCBtdXN0IGJlIG5vdCBudWxsJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL092ZW5QbGF5ZXJDb25zb2xlLmxvZygnTmV3IHB1Ymxpc2hlciBpbmZvcm1hdGlvbiByZWNlaXZlZCcpO1xuICAgICAgICAgICAgICAgIGlmKCFwZWVyQ29ubmVjdGlvbil7XG4gICAgICAgICAgICAgICAgICAgIHBlZXJDb25uZWN0aW9uID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKGNvbmZpZyk7XG5cbiAgICAgICAgICAgICAgICAgICAgcGVlckNvbm5lY3Rpb24ub25pY2VjYW5kaWRhdGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihlLmNhbmRpZGF0ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FuZGlkYXRl66W8IOyEnOuyhOuhnCDrs7Trg4RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG1lc3NhZ2UuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZXM6IFtlLmNhbmRpZGF0ZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcGVlckNvbm5lY3Rpb24ub25uZWdvdGlhdGlvbm5lZWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVlckNvbm5lY3Rpb24uY3JlYXRlT2ZmZXIoKS50aGVuKGZ1bmN0aW9uKGRlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJjcmVhdGVPZmZlciA6IHN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2NhbERlc2NyaXB0aW9uKG1lc3NhZ2UuaWQsIHBlZXJDb25uZWN0aW9uLCBkZXNjKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VQZWVyKHtjb2RlIDogUExBWUVSX1dFQlJUQ19DUkVBVEVfQU5TV0VSX0VSUk9SLCByZWFzb24gOiBcImNyZWF0ZU9mZmVyIGVycm9yIG9jY3VycmVkXCIsIG1lc3NhZ2UgOiBcImNyZWF0ZU9mZmVyIGVycm9yIG9jY3VycmVkXCIsIGVycm9yIDogZXJyb3J9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIOybkOqyqSDsiqTtirjrprzsnbQg64+E7LCpXG4gICAgICAgICAgICAgICAgICAgIHBlZXJDb25uZWN0aW9uLm9uYWRkc3RyZWFtID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9VUkwuY3JlYXRlT2JqZWN0VVJMIHdpdGggbWVkaWEgc3RyZWFtcyBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gTTY4LCBhcm91bmQgSnVseSAyMDE4LiBQbGVhc2UgdXNlIEhUTUxNZWRpYUVsZW1lbnQuc3JjT2JqZWN0IGluc3RlYWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKmVsVmlkZW8uc3JjT2JqZWN0ID0gZS5zdHJlYW07XG4gICAgICAgICAgICAgICAgICAgICAgICBlbFZpZGVvLnBsYXkoKTsqL1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShlLnN0cmVhbSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYobWVzc2FnZS5zZHApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g7ISc67KE7JeQ7IScIOyDgeuMgOuwqeydmCBTRFDqsIAg7KCE64us65CY66m0IHJlbW90ZSBkZXNjcmlwdGlvbiDshKTsoJVcblxuICAgICAgICAgICAgICAgICAgICBwZWVyQ29ubmVjdGlvbi5zZXRSZW1vdGVEZXNjcmlwdGlvbihuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKG1lc3NhZ2Uuc2RwKSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYocGVlckNvbm5lY3Rpb24ucmVtb3RlRGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHB1Ymxpc2hlcuydmCBvZmZlcuulvCDrsJvsnYAg6rKD7J20652866m0LCBhbnN3ZXIg7IOd7ISx7ZW07IScIOuztOuCtOyVvCDtlahcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZWVyQ29ubmVjdGlvbi5jcmVhdGVBbnN3ZXIoKS50aGVuKGZ1bmN0aW9uKGRlc2Mpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPdmVuUGxheWVyQ29uc29sZS5sb2coXCJjcmVhdGVBbnN3ZXIgOiBzdWNjZXNzXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkxvY2FsRGVzY3JpcHRpb24obWVzc2FnZS5pZCwgcGVlckNvbm5lY3Rpb24sIGRlc2MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VQZWVyKHtjb2RlIDogUExBWUVSX1dFQlJUQ19DUkVBVEVfQU5TV0VSX0VSUk9SLCByZWFzb24gOiBcImNyZWF0ZUFuc3dlciBlcnJvciBvY2N1cnJlZFwiLCBtZXNzYWdlIDogXCJjcmVhdGVBbnN3ZXIgZXJyb3Igb2NjdXJyZWRcIiwgZXJyb3IgOiBlcnJvcn0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZVBlZXIoe2NvZGUgOiBQTEFZRVJfV0VCUlRDX1NFVF9SRU1PVEVfREVTQ19FUlJPUiwgcmVhc29uIDogXCJzZXRSZW1vdGVEZXNjcmlwdGlvbiBlcnJvciBvY2N1cnJlZFwiLCBtZXNzYWdlIDogXCJzZXRSZW1vdGVEZXNjcmlwdGlvbiBlcnJvciBvY2N1cnJlZFwiLCBlcnJvciA6IGVycm9yfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmKG1lc3NhZ2UuY2FuZGlkYXRlcykge1xuICAgICAgICAgICAgICAgICAgICAvLyDshJzrsoTsl5DshJwg7IOB64yA67Cp7J2YIElDRSBjYW5kaWRhdGXqsIAg7KCE64us65CY66m0XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBtZXNzYWdlLmNhbmRpZGF0ZXMubGVuZ3RoOyBpICsrICl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihtZXNzYWdlLmNhbmRpZGF0ZXNbaV0gJiYgbWVzc2FnZS5jYW5kaWRhdGVzW2ldLmNhbmRpZGF0ZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVlckNvbm5lY3Rpb24uYWRkSWNlQ2FuZGlkYXRlKG5ldyBSVENJY2VDYW5kaWRhdGUobWVzc2FnZS5jYW5kaWRhdGVzW2ldKSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0RvIE5vdGhpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3ZlblBsYXllckNvbnNvbGUubG9nKFwiYWRkSWNlQ2FuZGlkYXRlIDogc3VjY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnJvcil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlUGVlcih7Y29kZSA6IFBMQVlFUl9XRUJSVENfQUREX0lDRUNBTkRJREFURV9FUlJPUiwgcmVhc29uIDogXCJhZGRJY2VDYW5kaWRhdGUgZXJyb3Igb2NjdXJyZWRcIiwgbWVzc2FnZSA6IFwiYWRkSWNlQ2FuZGlkYXRlIGVycm9yIG9jY3VycmVkXCIsIGVycm9yIDogZXJyb3J9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdzLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgY2xvc2VQZWVyKHtjb2RlIDogUExBWUVSX1dFQlJUQ19XU19FUlJPUiwgcmVhc29uIDogXCJ3ZWJzb2NrZXQgZXJyb3Igb2NjdXJlZFwiLCBtZXNzYWdlIDogXCJ3ZWJzb2NrZXQgZXJyb3Igb2NjdXJyZWRcIiwgZXJyb3IgOiBlfSk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdzLm9uY2xvc2UgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgY2xvc2VQZWVyKHtjb2RlIDogUExBWUVSX1dFQlJUQ19XU19DTE9TRUQsIHJlYXNvbiA6IFwid2Vic29ja2V0IGNsb3NlZFwiLCBtZXNzYWdlIDogXCJ3ZWJzb2NrZXQgY2xvc2VkXCIsIGVycm9yIDogZX0pO1xuICAgICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsb3NlUGVlcihlcnJvcikge1xuICAgICAgICBpZighIXdzKSB7XG4gICAgICAgICAgICAvLyDshJzrsoTsl5Ag7J2Y7ZW0IOuLq+2eiOuKlCDspJFcbiAgICAgICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZygnRGlzY29ubmVjdGVkJyk7XG5cbiAgICAgICAgICAgIHdzLmNsb3NlKCk7XG4gICAgICAgICAgICB3cyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYocGVlckNvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgIE92ZW5QbGF5ZXJDb25zb2xlLmxvZygnQ2xvc2luZyBwZWVyIGNvbm5lY3Rpb24uLi4nKTtcbiAgICAgICAgICAgIHBlZXJDb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgICAgICAgICBwZWVyQ29ubmVjdGlvbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIGlmKGVycm9yKXtcbiAgICAgICAgICAgIGVycm9yQ2FsbGJhY2soZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICB0aGF0LmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiBpbml0aWFsaXplKFwicGxheWVyXCIpO1xuICAgIH07XG4gICAgdGhhdC5kZXN0cm95ID0gKCkgPT4ge1xuICAgICAgICBjbG9zZVBlZXIoKTtcbiAgICB9O1xuICAgIHJldHVybiB0aGF0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgV2ViUlRDTG9hZGVyOyIsIihmdW5jdGlvbihmKXtpZih0eXBlb2YgZXhwb3J0cz09PVwib2JqZWN0XCImJnR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiKXttb2R1bGUuZXhwb3J0cz1mKCl9ZWxzZSBpZih0eXBlb2YgZGVmaW5lPT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kKXtkZWZpbmUoW10sZil9ZWxzZXt2YXIgZztpZih0eXBlb2Ygd2luZG93IT09XCJ1bmRlZmluZWRcIil7Zz13aW5kb3d9ZWxzZSBpZih0eXBlb2YgZ2xvYmFsIT09XCJ1bmRlZmluZWRcIil7Zz1nbG9iYWx9ZWxzZSBpZih0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCIpe2c9c2VsZn1lbHNle2c9dGhpc31nLmFkYXB0ZXIgPSBmKCl9fSkoZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vKlxuICogIENvcHlyaWdodCAoYykgMjAxNyBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFNEUFV0aWxzID0gcmVxdWlyZSgnc2RwJyk7XG5cbmZ1bmN0aW9uIHdyaXRlTWVkaWFTZWN0aW9uKHRyYW5zY2VpdmVyLCBjYXBzLCB0eXBlLCBzdHJlYW0sIGR0bHNSb2xlKSB7XG4gIHZhciBzZHAgPSBTRFBVdGlscy53cml0ZVJ0cERlc2NyaXB0aW9uKHRyYW5zY2VpdmVyLmtpbmQsIGNhcHMpO1xuXG4gIC8vIE1hcCBJQ0UgcGFyYW1ldGVycyAodWZyYWcsIHB3ZCkgdG8gU0RQLlxuICBzZHAgKz0gU0RQVXRpbHMud3JpdGVJY2VQYXJhbWV0ZXJzKFxuICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIuZ2V0TG9jYWxQYXJhbWV0ZXJzKCkpO1xuXG4gIC8vIE1hcCBEVExTIHBhcmFtZXRlcnMgdG8gU0RQLlxuICBzZHAgKz0gU0RQVXRpbHMud3JpdGVEdGxzUGFyYW1ldGVycyhcbiAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQuZ2V0TG9jYWxQYXJhbWV0ZXJzKCksXG4gICAgICB0eXBlID09PSAnb2ZmZXInID8gJ2FjdHBhc3MnIDogZHRsc1JvbGUgfHwgJ2FjdGl2ZScpO1xuXG4gIHNkcCArPSAnYT1taWQ6JyArIHRyYW5zY2VpdmVyLm1pZCArICdcXHJcXG4nO1xuXG4gIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIgJiYgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICBzZHAgKz0gJ2E9c2VuZHJlY3ZcXHJcXG4nO1xuICB9IGVsc2UgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgIHNkcCArPSAnYT1zZW5kb25seVxcclxcbic7XG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICBzZHAgKz0gJ2E9cmVjdm9ubHlcXHJcXG4nO1xuICB9IGVsc2Uge1xuICAgIHNkcCArPSAnYT1pbmFjdGl2ZVxcclxcbic7XG4gIH1cblxuICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgdmFyIHRyYWNrSWQgPSB0cmFuc2NlaXZlci5ydHBTZW5kZXIuX2luaXRpYWxUcmFja0lkIHx8XG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0cFNlbmRlci50cmFjay5pZDtcbiAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIuX2luaXRpYWxUcmFja0lkID0gdHJhY2tJZDtcbiAgICAvLyBzcGVjLlxuICAgIHZhciBtc2lkID0gJ21zaWQ6JyArIChzdHJlYW0gPyBzdHJlYW0uaWQgOiAnLScpICsgJyAnICtcbiAgICAgICAgdHJhY2tJZCArICdcXHJcXG4nO1xuICAgIHNkcCArPSAnYT0nICsgbXNpZDtcbiAgICAvLyBmb3IgQ2hyb21lLiBMZWdhY3kgc2hvdWxkIG5vIGxvbmdlciBiZSByZXF1aXJlZC5cbiAgICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjICtcbiAgICAgICAgJyAnICsgbXNpZDtcblxuICAgIC8vIFJUWFxuICAgIGlmICh0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eCkge1xuICAgICAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4LnNzcmMgK1xuICAgICAgICAgICcgJyArIG1zaWQ7XG4gICAgICBzZHAgKz0gJ2E9c3NyYy1ncm91cDpGSUQgJyArXG4gICAgICAgICAgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjICsgJyAnICtcbiAgICAgICAgICB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eC5zc3JjICtcbiAgICAgICAgICAnXFxyXFxuJztcbiAgICB9XG4gIH1cbiAgLy8gRklYTUU6IHRoaXMgc2hvdWxkIGJlIHdyaXR0ZW4gYnkgd3JpdGVSdHBEZXNjcmlwdGlvbi5cbiAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArXG4gICAgICAnIGNuYW1lOicgKyBTRFBVdGlscy5sb2NhbENOYW1lICsgJ1xcclxcbic7XG4gIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIgJiYgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHgpIHtcbiAgICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHguc3NyYyArXG4gICAgICAgICcgY25hbWU6JyArIFNEUFV0aWxzLmxvY2FsQ05hbWUgKyAnXFxyXFxuJztcbiAgfVxuICByZXR1cm4gc2RwO1xufVxuXG4vLyBFZGdlIGRvZXMgbm90IGxpa2Vcbi8vIDEpIHN0dW46IGZpbHRlcmVkIGFmdGVyIDE0MzkzIHVubGVzcyA/dHJhbnNwb3J0PXVkcCBpcyBwcmVzZW50XG4vLyAyKSB0dXJuOiB0aGF0IGRvZXMgbm90IGhhdmUgYWxsIG9mIHR1cm46aG9zdDpwb3J0P3RyYW5zcG9ydD11ZHBcbi8vIDMpIHR1cm46IHdpdGggaXB2NiBhZGRyZXNzZXNcbi8vIDQpIHR1cm46IG9jY3VycmluZyBtdWxpcGxlIHRpbWVzXG5mdW5jdGlvbiBmaWx0ZXJJY2VTZXJ2ZXJzKGljZVNlcnZlcnMsIGVkZ2VWZXJzaW9uKSB7XG4gIHZhciBoYXNUdXJuID0gZmFsc2U7XG4gIGljZVNlcnZlcnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGljZVNlcnZlcnMpKTtcbiAgcmV0dXJuIGljZVNlcnZlcnMuZmlsdGVyKGZ1bmN0aW9uKHNlcnZlcikge1xuICAgIGlmIChzZXJ2ZXIgJiYgKHNlcnZlci51cmxzIHx8IHNlcnZlci51cmwpKSB7XG4gICAgICB2YXIgdXJscyA9IHNlcnZlci51cmxzIHx8IHNlcnZlci51cmw7XG4gICAgICBpZiAoc2VydmVyLnVybCAmJiAhc2VydmVyLnVybHMpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdSVENJY2VTZXJ2ZXIudXJsIGlzIGRlcHJlY2F0ZWQhIFVzZSB1cmxzIGluc3RlYWQuJyk7XG4gICAgICB9XG4gICAgICB2YXIgaXNTdHJpbmcgPSB0eXBlb2YgdXJscyA9PT0gJ3N0cmluZyc7XG4gICAgICBpZiAoaXNTdHJpbmcpIHtcbiAgICAgICAgdXJscyA9IFt1cmxzXTtcbiAgICAgIH1cbiAgICAgIHVybHMgPSB1cmxzLmZpbHRlcihmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgdmFyIHZhbGlkVHVybiA9IHVybC5pbmRleE9mKCd0dXJuOicpID09PSAwICYmXG4gICAgICAgICAgICB1cmwuaW5kZXhPZigndHJhbnNwb3J0PXVkcCcpICE9PSAtMSAmJlxuICAgICAgICAgICAgdXJsLmluZGV4T2YoJ3R1cm46WycpID09PSAtMSAmJlxuICAgICAgICAgICAgIWhhc1R1cm47XG5cbiAgICAgICAgaWYgKHZhbGlkVHVybikge1xuICAgICAgICAgIGhhc1R1cm4gPSB0cnVlO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1cmwuaW5kZXhPZignc3R1bjonKSA9PT0gMCAmJiBlZGdlVmVyc2lvbiA+PSAxNDM5MyAmJlxuICAgICAgICAgICAgdXJsLmluZGV4T2YoJz90cmFuc3BvcnQ9dWRwJykgPT09IC0xO1xuICAgICAgfSk7XG5cbiAgICAgIGRlbGV0ZSBzZXJ2ZXIudXJsO1xuICAgICAgc2VydmVyLnVybHMgPSBpc1N0cmluZyA/IHVybHNbMF0gOiB1cmxzO1xuICAgICAgcmV0dXJuICEhdXJscy5sZW5ndGg7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gRGV0ZXJtaW5lcyB0aGUgaW50ZXJzZWN0aW9uIG9mIGxvY2FsIGFuZCByZW1vdGUgY2FwYWJpbGl0aWVzLlxuZnVuY3Rpb24gZ2V0Q29tbW9uQ2FwYWJpbGl0aWVzKGxvY2FsQ2FwYWJpbGl0aWVzLCByZW1vdGVDYXBhYmlsaXRpZXMpIHtcbiAgdmFyIGNvbW1vbkNhcGFiaWxpdGllcyA9IHtcbiAgICBjb2RlY3M6IFtdLFxuICAgIGhlYWRlckV4dGVuc2lvbnM6IFtdLFxuICAgIGZlY01lY2hhbmlzbXM6IFtdXG4gIH07XG5cbiAgdmFyIGZpbmRDb2RlY0J5UGF5bG9hZFR5cGUgPSBmdW5jdGlvbihwdCwgY29kZWNzKSB7XG4gICAgcHQgPSBwYXJzZUludChwdCwgMTApO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29kZWNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY29kZWNzW2ldLnBheWxvYWRUeXBlID09PSBwdCB8fFxuICAgICAgICAgIGNvZGVjc1tpXS5wcmVmZXJyZWRQYXlsb2FkVHlwZSA9PT0gcHQpIHtcbiAgICAgICAgcmV0dXJuIGNvZGVjc1tpXTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIHJ0eENhcGFiaWxpdHlNYXRjaGVzID0gZnVuY3Rpb24obFJ0eCwgclJ0eCwgbENvZGVjcywgckNvZGVjcykge1xuICAgIHZhciBsQ29kZWMgPSBmaW5kQ29kZWNCeVBheWxvYWRUeXBlKGxSdHgucGFyYW1ldGVycy5hcHQsIGxDb2RlY3MpO1xuICAgIHZhciByQ29kZWMgPSBmaW5kQ29kZWNCeVBheWxvYWRUeXBlKHJSdHgucGFyYW1ldGVycy5hcHQsIHJDb2RlY3MpO1xuICAgIHJldHVybiBsQ29kZWMgJiYgckNvZGVjICYmXG4gICAgICAgIGxDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCkgPT09IHJDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gIH07XG5cbiAgbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24obENvZGVjKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZW1vdGVDYXBhYmlsaXRpZXMuY29kZWNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgckNvZGVjID0gcmVtb3RlQ2FwYWJpbGl0aWVzLmNvZGVjc1tpXTtcbiAgICAgIGlmIChsQ29kZWMubmFtZS50b0xvd2VyQ2FzZSgpID09PSByQ29kZWMubmFtZS50b0xvd2VyQ2FzZSgpICYmXG4gICAgICAgICAgbENvZGVjLmNsb2NrUmF0ZSA9PT0gckNvZGVjLmNsb2NrUmF0ZSkge1xuICAgICAgICBpZiAobENvZGVjLm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3J0eCcgJiZcbiAgICAgICAgICAgIGxDb2RlYy5wYXJhbWV0ZXJzICYmIHJDb2RlYy5wYXJhbWV0ZXJzLmFwdCkge1xuICAgICAgICAgIC8vIGZvciBSVFggd2UgbmVlZCB0byBmaW5kIHRoZSBsb2NhbCBydHggdGhhdCBoYXMgYSBhcHRcbiAgICAgICAgICAvLyB3aGljaCBwb2ludHMgdG8gdGhlIHNhbWUgbG9jYWwgY29kZWMgYXMgdGhlIHJlbW90ZSBvbmUuXG4gICAgICAgICAgaWYgKCFydHhDYXBhYmlsaXR5TWF0Y2hlcyhsQ29kZWMsIHJDb2RlYyxcbiAgICAgICAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMuY29kZWNzLCByZW1vdGVDYXBhYmlsaXRpZXMuY29kZWNzKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJDb2RlYyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkockNvZGVjKSk7IC8vIGRlZXBjb3B5XG4gICAgICAgIC8vIG51bWJlciBvZiBjaGFubmVscyBpcyB0aGUgaGlnaGVzdCBjb21tb24gbnVtYmVyIG9mIGNoYW5uZWxzXG4gICAgICAgIHJDb2RlYy5udW1DaGFubmVscyA9IE1hdGgubWluKGxDb2RlYy5udW1DaGFubmVscyxcbiAgICAgICAgICAgIHJDb2RlYy5udW1DaGFubmVscyk7XG4gICAgICAgIC8vIHB1c2ggckNvZGVjIHNvIHdlIHJlcGx5IHdpdGggb2ZmZXJlciBwYXlsb2FkIHR5cGVcbiAgICAgICAgY29tbW9uQ2FwYWJpbGl0aWVzLmNvZGVjcy5wdXNoKHJDb2RlYyk7XG5cbiAgICAgICAgLy8gZGV0ZXJtaW5lIGNvbW1vbiBmZWVkYmFjayBtZWNoYW5pc21zXG4gICAgICAgIHJDb2RlYy5ydGNwRmVlZGJhY2sgPSByQ29kZWMucnRjcEZlZWRiYWNrLmZpbHRlcihmdW5jdGlvbihmYikge1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbENvZGVjLnJ0Y3BGZWVkYmFjay5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKGxDb2RlYy5ydGNwRmVlZGJhY2tbal0udHlwZSA9PT0gZmIudHlwZSAmJlxuICAgICAgICAgICAgICAgIGxDb2RlYy5ydGNwRmVlZGJhY2tbal0ucGFyYW1ldGVyID09PSBmYi5wYXJhbWV0ZXIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEZJWE1FOiBhbHNvIG5lZWQgdG8gZGV0ZXJtaW5lIC5wYXJhbWV0ZXJzXG4gICAgICAgIC8vICBzZWUgaHR0cHM6Ly9naXRodWIuY29tL29wZW5wZWVyL29ydGMvaXNzdWVzLzU2OVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGxvY2FsQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnMuZm9yRWFjaChmdW5jdGlvbihsSGVhZGVyRXh0ZW5zaW9uKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZW1vdGVDYXBhYmlsaXRpZXMuaGVhZGVyRXh0ZW5zaW9ucy5sZW5ndGg7XG4gICAgICAgICBpKyspIHtcbiAgICAgIHZhciBySGVhZGVyRXh0ZW5zaW9uID0gcmVtb3RlQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnNbaV07XG4gICAgICBpZiAobEhlYWRlckV4dGVuc2lvbi51cmkgPT09IHJIZWFkZXJFeHRlbnNpb24udXJpKSB7XG4gICAgICAgIGNvbW1vbkNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zLnB1c2gockhlYWRlckV4dGVuc2lvbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy8gRklYTUU6IGZlY01lY2hhbmlzbXNcbiAgcmV0dXJuIGNvbW1vbkNhcGFiaWxpdGllcztcbn1cblxuLy8gaXMgYWN0aW9uPXNldExvY2FsRGVzY3JpcHRpb24gd2l0aCB0eXBlIGFsbG93ZWQgaW4gc2lnbmFsaW5nU3RhdGVcbmZ1bmN0aW9uIGlzQWN0aW9uQWxsb3dlZEluU2lnbmFsaW5nU3RhdGUoYWN0aW9uLCB0eXBlLCBzaWduYWxpbmdTdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIG9mZmVyOiB7XG4gICAgICBzZXRMb2NhbERlc2NyaXB0aW9uOiBbJ3N0YWJsZScsICdoYXZlLWxvY2FsLW9mZmVyJ10sXG4gICAgICBzZXRSZW1vdGVEZXNjcmlwdGlvbjogWydzdGFibGUnLCAnaGF2ZS1yZW1vdGUtb2ZmZXInXVxuICAgIH0sXG4gICAgYW5zd2VyOiB7XG4gICAgICBzZXRMb2NhbERlc2NyaXB0aW9uOiBbJ2hhdmUtcmVtb3RlLW9mZmVyJywgJ2hhdmUtbG9jYWwtcHJhbnN3ZXInXSxcbiAgICAgIHNldFJlbW90ZURlc2NyaXB0aW9uOiBbJ2hhdmUtbG9jYWwtb2ZmZXInLCAnaGF2ZS1yZW1vdGUtcHJhbnN3ZXInXVxuICAgIH1cbiAgfVt0eXBlXVthY3Rpb25dLmluZGV4T2Yoc2lnbmFsaW5nU3RhdGUpICE9PSAtMTtcbn1cblxuZnVuY3Rpb24gbWF5YmVBZGRDYW5kaWRhdGUoaWNlVHJhbnNwb3J0LCBjYW5kaWRhdGUpIHtcbiAgLy8gRWRnZSdzIGludGVybmFsIHJlcHJlc2VudGF0aW9uIGFkZHMgc29tZSBmaWVsZHMgdGhlcmVmb3JlXG4gIC8vIG5vdCBhbGwgZmllbGTRlSBhcmUgdGFrZW4gaW50byBhY2NvdW50LlxuICB2YXIgYWxyZWFkeUFkZGVkID0gaWNlVHJhbnNwb3J0LmdldFJlbW90ZUNhbmRpZGF0ZXMoKVxuICAgICAgLmZpbmQoZnVuY3Rpb24ocmVtb3RlQ2FuZGlkYXRlKSB7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGUuZm91bmRhdGlvbiA9PT0gcmVtb3RlQ2FuZGlkYXRlLmZvdW5kYXRpb24gJiZcbiAgICAgICAgICAgIGNhbmRpZGF0ZS5pcCA9PT0gcmVtb3RlQ2FuZGlkYXRlLmlwICYmXG4gICAgICAgICAgICBjYW5kaWRhdGUucG9ydCA9PT0gcmVtb3RlQ2FuZGlkYXRlLnBvcnQgJiZcbiAgICAgICAgICAgIGNhbmRpZGF0ZS5wcmlvcml0eSA9PT0gcmVtb3RlQ2FuZGlkYXRlLnByaW9yaXR5ICYmXG4gICAgICAgICAgICBjYW5kaWRhdGUucHJvdG9jb2wgPT09IHJlbW90ZUNhbmRpZGF0ZS5wcm90b2NvbCAmJlxuICAgICAgICAgICAgY2FuZGlkYXRlLnR5cGUgPT09IHJlbW90ZUNhbmRpZGF0ZS50eXBlO1xuICAgICAgfSk7XG4gIGlmICghYWxyZWFkeUFkZGVkKSB7XG4gICAgaWNlVHJhbnNwb3J0LmFkZFJlbW90ZUNhbmRpZGF0ZShjYW5kaWRhdGUpO1xuICB9XG4gIHJldHVybiAhYWxyZWFkeUFkZGVkO1xufVxuXG5cbmZ1bmN0aW9uIG1ha2VFcnJvcihuYW1lLCBkZXNjcmlwdGlvbikge1xuICB2YXIgZSA9IG5ldyBFcnJvcihkZXNjcmlwdGlvbik7XG4gIGUubmFtZSA9IG5hbWU7XG4gIC8vIGxlZ2FjeSBlcnJvciBjb2RlcyBmcm9tIGh0dHBzOi8vaGV5Y2FtLmdpdGh1Yi5pby93ZWJpZGwvI2lkbC1ET01FeGNlcHRpb24tZXJyb3ItbmFtZXNcbiAgZS5jb2RlID0ge1xuICAgIE5vdFN1cHBvcnRlZEVycm9yOiA5LFxuICAgIEludmFsaWRTdGF0ZUVycm9yOiAxMSxcbiAgICBJbnZhbGlkQWNjZXNzRXJyb3I6IDE1LFxuICAgIFR5cGVFcnJvcjogdW5kZWZpbmVkLFxuICAgIE9wZXJhdGlvbkVycm9yOiB1bmRlZmluZWRcbiAgfVtuYW1lXTtcbiAgcmV0dXJuIGU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24od2luZG93LCBlZGdlVmVyc2lvbikge1xuICAvLyBodHRwczovL3czYy5naXRodWIuaW8vbWVkaWFjYXB0dXJlLW1haW4vI21lZGlhc3RyZWFtXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBhZGQgdGhlIHRyYWNrIHRvIHRoZSBzdHJlYW0gYW5kXG4gIC8vIGRpc3BhdGNoIHRoZSBldmVudCBvdXJzZWx2ZXMuXG4gIGZ1bmN0aW9uIGFkZFRyYWNrVG9TdHJlYW1BbmRGaXJlRXZlbnQodHJhY2ssIHN0cmVhbSkge1xuICAgIHN0cmVhbS5hZGRUcmFjayh0cmFjayk7XG4gICAgc3RyZWFtLmRpc3BhdGNoRXZlbnQobmV3IHdpbmRvdy5NZWRpYVN0cmVhbVRyYWNrRXZlbnQoJ2FkZHRyYWNrJyxcbiAgICAgICAge3RyYWNrOiB0cmFja30pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVRyYWNrRnJvbVN0cmVhbUFuZEZpcmVFdmVudCh0cmFjaywgc3RyZWFtKSB7XG4gICAgc3RyZWFtLnJlbW92ZVRyYWNrKHRyYWNrKTtcbiAgICBzdHJlYW0uZGlzcGF0Y2hFdmVudChuZXcgd2luZG93Lk1lZGlhU3RyZWFtVHJhY2tFdmVudCgncmVtb3ZldHJhY2snLFxuICAgICAgICB7dHJhY2s6IHRyYWNrfSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmlyZUFkZFRyYWNrKHBjLCB0cmFjaywgcmVjZWl2ZXIsIHN0cmVhbXMpIHtcbiAgICB2YXIgdHJhY2tFdmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICB0cmFja0V2ZW50LnRyYWNrID0gdHJhY2s7XG4gICAgdHJhY2tFdmVudC5yZWNlaXZlciA9IHJlY2VpdmVyO1xuICAgIHRyYWNrRXZlbnQudHJhbnNjZWl2ZXIgPSB7cmVjZWl2ZXI6IHJlY2VpdmVyfTtcbiAgICB0cmFja0V2ZW50LnN0cmVhbXMgPSBzdHJlYW1zO1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgcGMuX2Rpc3BhdGNoRXZlbnQoJ3RyYWNrJywgdHJhY2tFdmVudCk7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgUlRDUGVlckNvbm5lY3Rpb24gPSBmdW5jdGlvbihjb25maWcpIHtcbiAgICB2YXIgcGMgPSB0aGlzO1xuXG4gICAgdmFyIF9ldmVudFRhcmdldCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICBbJ2FkZEV2ZW50TGlzdGVuZXInLCAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsICdkaXNwYXRjaEV2ZW50J11cbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgcGNbbWV0aG9kXSA9IF9ldmVudFRhcmdldFttZXRob2RdLmJpbmQoX2V2ZW50VGFyZ2V0KTtcbiAgICAgICAgfSk7XG5cbiAgICB0aGlzLmNhblRyaWNrbGVJY2VDYW5kaWRhdGVzID0gbnVsbDtcblxuICAgIHRoaXMubmVlZE5lZ290aWF0aW9uID0gZmFsc2U7XG5cbiAgICB0aGlzLmxvY2FsU3RyZWFtcyA9IFtdO1xuICAgIHRoaXMucmVtb3RlU3RyZWFtcyA9IFtdO1xuXG4gICAgdGhpcy5sb2NhbERlc2NyaXB0aW9uID0gbnVsbDtcbiAgICB0aGlzLnJlbW90ZURlc2NyaXB0aW9uID0gbnVsbDtcblxuICAgIHRoaXMuc2lnbmFsaW5nU3RhdGUgPSAnc3RhYmxlJztcbiAgICB0aGlzLmljZUNvbm5lY3Rpb25TdGF0ZSA9ICduZXcnO1xuICAgIHRoaXMuY29ubmVjdGlvblN0YXRlID0gJ25ldyc7XG4gICAgdGhpcy5pY2VHYXRoZXJpbmdTdGF0ZSA9ICduZXcnO1xuXG4gICAgY29uZmlnID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25maWcgfHwge30pKTtcblxuICAgIHRoaXMudXNpbmdCdW5kbGUgPSBjb25maWcuYnVuZGxlUG9saWN5ID09PSAnbWF4LWJ1bmRsZSc7XG4gICAgaWYgKGNvbmZpZy5ydGNwTXV4UG9saWN5ID09PSAnbmVnb3RpYXRlJykge1xuICAgICAgdGhyb3cobWFrZUVycm9yKCdOb3RTdXBwb3J0ZWRFcnJvcicsXG4gICAgICAgICAgJ3J0Y3BNdXhQb2xpY3kgXFwnbmVnb3RpYXRlXFwnIGlzIG5vdCBzdXBwb3J0ZWQnKSk7XG4gICAgfSBlbHNlIGlmICghY29uZmlnLnJ0Y3BNdXhQb2xpY3kpIHtcbiAgICAgIGNvbmZpZy5ydGNwTXV4UG9saWN5ID0gJ3JlcXVpcmUnO1xuICAgIH1cblxuICAgIHN3aXRjaCAoY29uZmlnLmljZVRyYW5zcG9ydFBvbGljeSkge1xuICAgICAgY2FzZSAnYWxsJzpcbiAgICAgIGNhc2UgJ3JlbGF5JzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25maWcuaWNlVHJhbnNwb3J0UG9saWN5ID0gJ2FsbCc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHN3aXRjaCAoY29uZmlnLmJ1bmRsZVBvbGljeSkge1xuICAgICAgY2FzZSAnYmFsYW5jZWQnOlxuICAgICAgY2FzZSAnbWF4LWNvbXBhdCc6XG4gICAgICBjYXNlICdtYXgtYnVuZGxlJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25maWcuYnVuZGxlUG9saWN5ID0gJ2JhbGFuY2VkJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uZmlnLmljZVNlcnZlcnMgPSBmaWx0ZXJJY2VTZXJ2ZXJzKGNvbmZpZy5pY2VTZXJ2ZXJzIHx8IFtdLCBlZGdlVmVyc2lvbik7XG5cbiAgICB0aGlzLl9pY2VHYXRoZXJlcnMgPSBbXTtcbiAgICBpZiAoY29uZmlnLmljZUNhbmRpZGF0ZVBvb2xTaXplKSB7XG4gICAgICBmb3IgKHZhciBpID0gY29uZmlnLmljZUNhbmRpZGF0ZVBvb2xTaXplOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIHRoaXMuX2ljZUdhdGhlcmVycy5wdXNoKG5ldyB3aW5kb3cuUlRDSWNlR2F0aGVyZXIoe1xuICAgICAgICAgIGljZVNlcnZlcnM6IGNvbmZpZy5pY2VTZXJ2ZXJzLFxuICAgICAgICAgIGdhdGhlclBvbGljeTogY29uZmlnLmljZVRyYW5zcG9ydFBvbGljeVxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbmZpZy5pY2VDYW5kaWRhdGVQb29sU2l6ZSA9IDA7XG4gICAgfVxuXG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuXG4gICAgLy8gcGVyLXRyYWNrIGljZUdhdGhlcnMsIGljZVRyYW5zcG9ydHMsIGR0bHNUcmFuc3BvcnRzLCBydHBTZW5kZXJzLCAuLi5cbiAgICAvLyBldmVyeXRoaW5nIHRoYXQgaXMgbmVlZGVkIHRvIGRlc2NyaWJlIGEgU0RQIG0tbGluZS5cbiAgICB0aGlzLnRyYW5zY2VpdmVycyA9IFtdO1xuXG4gICAgdGhpcy5fc2RwU2Vzc2lvbklkID0gU0RQVXRpbHMuZ2VuZXJhdGVTZXNzaW9uSWQoKTtcbiAgICB0aGlzLl9zZHBTZXNzaW9uVmVyc2lvbiA9IDA7XG5cbiAgICB0aGlzLl9kdGxzUm9sZSA9IHVuZGVmaW5lZDsgLy8gcm9sZSBmb3IgYT1zZXR1cCB0byB1c2UgaW4gYW5zd2Vycy5cblxuICAgIHRoaXMuX2lzQ2xvc2VkID0gZmFsc2U7XG4gIH07XG5cbiAgLy8gc2V0IHVwIGV2ZW50IGhhbmRsZXJzIG9uIHByb3RvdHlwZVxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUub25pY2VjYW5kaWRhdGUgPSBudWxsO1xuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUub25hZGRzdHJlYW0gPSBudWxsO1xuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUub250cmFjayA9IG51bGw7XG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5vbnJlbW92ZXN0cmVhbSA9IG51bGw7XG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5vbnNpZ25hbGluZ3N0YXRlY2hhbmdlID0gbnVsbDtcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLm9uaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLm9uY29ubmVjdGlvbnN0YXRlY2hhbmdlID0gbnVsbDtcbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLm9uaWNlZ2F0aGVyaW5nc3RhdGVjaGFuZ2UgPSBudWxsO1xuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUub25uZWdvdGlhdGlvbm5lZWRlZCA9IG51bGw7XG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5vbmRhdGFjaGFubmVsID0gbnVsbDtcblxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2Rpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbihuYW1lLCBldmVudCkge1xuICAgIGlmICh0aGlzLl9pc0Nsb3NlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIGlmICh0eXBlb2YgdGhpc1snb24nICsgbmFtZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXNbJ29uJyArIG5hbWVdKGV2ZW50KTtcbiAgICB9XG4gIH07XG5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9lbWl0R2F0aGVyaW5nU3RhdGVDaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2ljZWdhdGhlcmluZ3N0YXRlY2hhbmdlJyk7XG4gICAgdGhpcy5fZGlzcGF0Y2hFdmVudCgnaWNlZ2F0aGVyaW5nc3RhdGVjaGFuZ2UnLCBldmVudCk7XG4gIH07XG5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldENvbmZpZ3VyYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICB9O1xuXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRMb2NhbFN0cmVhbXMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5sb2NhbFN0cmVhbXM7XG4gIH07XG5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFJlbW90ZVN0cmVhbXMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZW1vdGVTdHJlYW1zO1xuICB9O1xuXG4gIC8vIGludGVybmFsIGhlbHBlciB0byBjcmVhdGUgYSB0cmFuc2NlaXZlciBvYmplY3QuXG4gIC8vICh3aGljaCBpcyBub3QgeWV0IHRoZSBzYW1lIGFzIHRoZSBXZWJSVEMgMS4wIHRyYW5zY2VpdmVyKVxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX2NyZWF0ZVRyYW5zY2VpdmVyID0gZnVuY3Rpb24oa2luZCwgZG9Ob3RBZGQpIHtcbiAgICB2YXIgaGFzQnVuZGxlVHJhbnNwb3J0ID0gdGhpcy50cmFuc2NlaXZlcnMubGVuZ3RoID4gMDtcbiAgICB2YXIgdHJhbnNjZWl2ZXIgPSB7XG4gICAgICB0cmFjazogbnVsbCxcbiAgICAgIGljZUdhdGhlcmVyOiBudWxsLFxuICAgICAgaWNlVHJhbnNwb3J0OiBudWxsLFxuICAgICAgZHRsc1RyYW5zcG9ydDogbnVsbCxcbiAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzOiBudWxsLFxuICAgICAgcmVtb3RlQ2FwYWJpbGl0aWVzOiBudWxsLFxuICAgICAgcnRwU2VuZGVyOiBudWxsLFxuICAgICAgcnRwUmVjZWl2ZXI6IG51bGwsXG4gICAgICBraW5kOiBraW5kLFxuICAgICAgbWlkOiBudWxsLFxuICAgICAgc2VuZEVuY29kaW5nUGFyYW1ldGVyczogbnVsbCxcbiAgICAgIHJlY3ZFbmNvZGluZ1BhcmFtZXRlcnM6IG51bGwsXG4gICAgICBzdHJlYW06IG51bGwsXG4gICAgICBhc3NvY2lhdGVkUmVtb3RlTWVkaWFTdHJlYW1zOiBbXSxcbiAgICAgIHdhbnRSZWNlaXZlOiB0cnVlXG4gICAgfTtcbiAgICBpZiAodGhpcy51c2luZ0J1bmRsZSAmJiBoYXNCdW5kbGVUcmFuc3BvcnQpIHtcbiAgICAgIHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydCA9IHRoaXMudHJhbnNjZWl2ZXJzWzBdLmljZVRyYW5zcG9ydDtcbiAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQgPSB0aGlzLnRyYW5zY2VpdmVyc1swXS5kdGxzVHJhbnNwb3J0O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdHJhbnNwb3J0cyA9IHRoaXMuX2NyZWF0ZUljZUFuZER0bHNUcmFuc3BvcnRzKCk7XG4gICAgICB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQgPSB0cmFuc3BvcnRzLmljZVRyYW5zcG9ydDtcbiAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQgPSB0cmFuc3BvcnRzLmR0bHNUcmFuc3BvcnQ7XG4gICAgfVxuICAgIGlmICghZG9Ob3RBZGQpIHtcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzLnB1c2godHJhbnNjZWl2ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gdHJhbnNjZWl2ZXI7XG4gIH07XG5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFRyYWNrID0gZnVuY3Rpb24odHJhY2ssIHN0cmVhbSkge1xuICAgIGlmICh0aGlzLl9pc0Nsb3NlZCkge1xuICAgICAgdGhyb3cgbWFrZUVycm9yKCdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICAgICAgJ0F0dGVtcHRlZCB0byBjYWxsIGFkZFRyYWNrIG9uIGEgY2xvc2VkIHBlZXJjb25uZWN0aW9uLicpO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5RXhpc3RzID0gdGhpcy50cmFuc2NlaXZlcnMuZmluZChmdW5jdGlvbihzKSB7XG4gICAgICByZXR1cm4gcy50cmFjayA9PT0gdHJhY2s7XG4gICAgfSk7XG5cbiAgICBpZiAoYWxyZWFkeUV4aXN0cykge1xuICAgICAgdGhyb3cgbWFrZUVycm9yKCdJbnZhbGlkQWNjZXNzRXJyb3InLCAnVHJhY2sgYWxyZWFkeSBleGlzdHMuJyk7XG4gICAgfVxuXG4gICAgdmFyIHRyYW5zY2VpdmVyO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50cmFuc2NlaXZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghdGhpcy50cmFuc2NlaXZlcnNbaV0udHJhY2sgJiZcbiAgICAgICAgICB0aGlzLnRyYW5zY2VpdmVyc1tpXS5raW5kID09PSB0cmFjay5raW5kKSB7XG4gICAgICAgIHRyYW5zY2VpdmVyID0gdGhpcy50cmFuc2NlaXZlcnNbaV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghdHJhbnNjZWl2ZXIpIHtcbiAgICAgIHRyYW5zY2VpdmVyID0gdGhpcy5fY3JlYXRlVHJhbnNjZWl2ZXIodHJhY2sua2luZCk7XG4gICAgfVxuXG4gICAgdGhpcy5fbWF5YmVGaXJlTmVnb3RpYXRpb25OZWVkZWQoKTtcblxuICAgIGlmICh0aGlzLmxvY2FsU3RyZWFtcy5pbmRleE9mKHN0cmVhbSkgPT09IC0xKSB7XG4gICAgICB0aGlzLmxvY2FsU3RyZWFtcy5wdXNoKHN0cmVhbSk7XG4gICAgfVxuXG4gICAgdHJhbnNjZWl2ZXIudHJhY2sgPSB0cmFjaztcbiAgICB0cmFuc2NlaXZlci5zdHJlYW0gPSBzdHJlYW07XG4gICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyID0gbmV3IHdpbmRvdy5SVENSdHBTZW5kZXIodHJhY2ssXG4gICAgICAgIHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQpO1xuICAgIHJldHVybiB0cmFuc2NlaXZlci5ydHBTZW5kZXI7XG4gIH07XG5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHZhciBwYyA9IHRoaXM7XG4gICAgaWYgKGVkZ2VWZXJzaW9uID49IDE1MDI1KSB7XG4gICAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICBwYy5hZGRUcmFjayh0cmFjaywgc3RyZWFtKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDbG9uZSBpcyBuZWNlc3NhcnkgZm9yIGxvY2FsIGRlbW9zIG1vc3RseSwgYXR0YWNoaW5nIGRpcmVjdGx5XG4gICAgICAvLyB0byB0d28gZGlmZmVyZW50IHNlbmRlcnMgZG9lcyBub3Qgd29yayAoYnVpbGQgMTA1NDcpLlxuICAgICAgLy8gRml4ZWQgaW4gMTUwMjUgKG9yIGVhcmxpZXIpXG4gICAgICB2YXIgY2xvbmVkU3RyZWFtID0gc3RyZWFtLmNsb25lKCk7XG4gICAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaywgaWR4KSB7XG4gICAgICAgIHZhciBjbG9uZWRUcmFjayA9IGNsb25lZFN0cmVhbS5nZXRUcmFja3MoKVtpZHhdO1xuICAgICAgICB0cmFjay5hZGRFdmVudExpc3RlbmVyKCdlbmFibGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICBjbG9uZWRUcmFjay5lbmFibGVkID0gZXZlbnQuZW5hYmxlZDtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGNsb25lZFN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgIHBjLmFkZFRyYWNrKHRyYWNrLCBjbG9uZWRTdHJlYW0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVUcmFjayA9IGZ1bmN0aW9uKHNlbmRlcikge1xuICAgIGlmICh0aGlzLl9pc0Nsb3NlZCkge1xuICAgICAgdGhyb3cgbWFrZUVycm9yKCdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICAgICAgJ0F0dGVtcHRlZCB0byBjYWxsIHJlbW92ZVRyYWNrIG9uIGEgY2xvc2VkIHBlZXJjb25uZWN0aW9uLicpO1xuICAgIH1cblxuICAgIGlmICghKHNlbmRlciBpbnN0YW5jZW9mIHdpbmRvdy5SVENSdHBTZW5kZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCAxIG9mIFJUQ1BlZXJDb25uZWN0aW9uLnJlbW92ZVRyYWNrICcgK1xuICAgICAgICAgICdkb2VzIG5vdCBpbXBsZW1lbnQgaW50ZXJmYWNlIFJUQ1J0cFNlbmRlci4nKTtcbiAgICB9XG5cbiAgICB2YXIgdHJhbnNjZWl2ZXIgPSB0aGlzLnRyYW5zY2VpdmVycy5maW5kKGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiB0LnJ0cFNlbmRlciA9PT0gc2VuZGVyO1xuICAgIH0pO1xuXG4gICAgaWYgKCF0cmFuc2NlaXZlcikge1xuICAgICAgdGhyb3cgbWFrZUVycm9yKCdJbnZhbGlkQWNjZXNzRXJyb3InLFxuICAgICAgICAgICdTZW5kZXIgd2FzIG5vdCBjcmVhdGVkIGJ5IHRoaXMgY29ubmVjdGlvbi4nKTtcbiAgICB9XG4gICAgdmFyIHN0cmVhbSA9IHRyYW5zY2VpdmVyLnN0cmVhbTtcblxuICAgIHRyYW5zY2VpdmVyLnJ0cFNlbmRlci5zdG9wKCk7XG4gICAgdHJhbnNjZWl2ZXIucnRwU2VuZGVyID0gbnVsbDtcbiAgICB0cmFuc2NlaXZlci50cmFjayA9IG51bGw7XG4gICAgdHJhbnNjZWl2ZXIuc3RyZWFtID0gbnVsbDtcblxuICAgIC8vIHJlbW92ZSB0aGUgc3RyZWFtIGZyb20gdGhlIHNldCBvZiBsb2NhbCBzdHJlYW1zXG4gICAgdmFyIGxvY2FsU3RyZWFtcyA9IHRoaXMudHJhbnNjZWl2ZXJzLm1hcChmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gdC5zdHJlYW07XG4gICAgfSk7XG4gICAgaWYgKGxvY2FsU3RyZWFtcy5pbmRleE9mKHN0cmVhbSkgPT09IC0xICYmXG4gICAgICAgIHRoaXMubG9jYWxTdHJlYW1zLmluZGV4T2Yoc3RyZWFtKSA+IC0xKSB7XG4gICAgICB0aGlzLmxvY2FsU3RyZWFtcy5zcGxpY2UodGhpcy5sb2NhbFN0cmVhbXMuaW5kZXhPZihzdHJlYW0pLCAxKTtcbiAgICB9XG5cbiAgICB0aGlzLl9tYXliZUZpcmVOZWdvdGlhdGlvbk5lZWRlZCgpO1xuICB9O1xuXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICB2YXIgcGMgPSB0aGlzO1xuICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICB2YXIgc2VuZGVyID0gcGMuZ2V0U2VuZGVycygpLmZpbmQoZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcy50cmFjayA9PT0gdHJhY2s7XG4gICAgICB9KTtcbiAgICAgIGlmIChzZW5kZXIpIHtcbiAgICAgICAgcGMucmVtb3ZlVHJhY2soc2VuZGVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U2VuZGVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zY2VpdmVycy5maWx0ZXIoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgIHJldHVybiAhIXRyYW5zY2VpdmVyLnJ0cFNlbmRlcjtcbiAgICB9KVxuICAgIC5tYXAoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgIHJldHVybiB0cmFuc2NlaXZlci5ydHBTZW5kZXI7XG4gICAgfSk7XG4gIH07XG5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFJlY2VpdmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zY2VpdmVycy5maWx0ZXIoZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgIHJldHVybiAhIXRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyO1xuICAgIH0pXG4gICAgLm1hcChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgcmV0dXJuIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyO1xuICAgIH0pO1xuICB9O1xuXG5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9jcmVhdGVJY2VHYXRoZXJlciA9IGZ1bmN0aW9uKHNkcE1MaW5lSW5kZXgsXG4gICAgICB1c2luZ0J1bmRsZSkge1xuICAgIHZhciBwYyA9IHRoaXM7XG4gICAgaWYgKHVzaW5nQnVuZGxlICYmIHNkcE1MaW5lSW5kZXggPiAwKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2NlaXZlcnNbMF0uaWNlR2F0aGVyZXI7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9pY2VHYXRoZXJlcnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5faWNlR2F0aGVyZXJzLnNoaWZ0KCk7XG4gICAgfVxuICAgIHZhciBpY2VHYXRoZXJlciA9IG5ldyB3aW5kb3cuUlRDSWNlR2F0aGVyZXIoe1xuICAgICAgaWNlU2VydmVyczogdGhpcy5fY29uZmlnLmljZVNlcnZlcnMsXG4gICAgICBnYXRoZXJQb2xpY3k6IHRoaXMuX2NvbmZpZy5pY2VUcmFuc3BvcnRQb2xpY3lcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaWNlR2F0aGVyZXIsICdzdGF0ZScsXG4gICAgICAgIHt2YWx1ZTogJ25ldycsIHdyaXRhYmxlOiB0cnVlfVxuICAgICk7XG5cbiAgICB0aGlzLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5idWZmZXJlZENhbmRpZGF0ZUV2ZW50cyA9IFtdO1xuICAgIHRoaXMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmJ1ZmZlckNhbmRpZGF0ZXMgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGVuZCA9ICFldmVudC5jYW5kaWRhdGUgfHwgT2JqZWN0LmtleXMoZXZlbnQuY2FuZGlkYXRlKS5sZW5ndGggPT09IDA7XG4gICAgICAvLyBwb2x5ZmlsbCBzaW5jZSBSVENJY2VHYXRoZXJlci5zdGF0ZSBpcyBub3QgaW1wbGVtZW50ZWQgaW5cbiAgICAgIC8vIEVkZ2UgMTA1NDcgeWV0LlxuICAgICAgaWNlR2F0aGVyZXIuc3RhdGUgPSBlbmQgPyAnY29tcGxldGVkJyA6ICdnYXRoZXJpbmcnO1xuICAgICAgaWYgKHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5idWZmZXJlZENhbmRpZGF0ZUV2ZW50cyAhPT0gbnVsbCkge1xuICAgICAgICBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uYnVmZmVyZWRDYW5kaWRhdGVFdmVudHMucHVzaChldmVudCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBpY2VHYXRoZXJlci5hZGRFdmVudExpc3RlbmVyKCdsb2NhbGNhbmRpZGF0ZScsXG4gICAgICB0aGlzLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5idWZmZXJDYW5kaWRhdGVzKTtcbiAgICByZXR1cm4gaWNlR2F0aGVyZXI7XG4gIH07XG5cbiAgLy8gc3RhcnQgZ2F0aGVyaW5nIGZyb20gYW4gUlRDSWNlR2F0aGVyZXIuXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fZ2F0aGVyID0gZnVuY3Rpb24obWlkLCBzZHBNTGluZUluZGV4KSB7XG4gICAgdmFyIHBjID0gdGhpcztcbiAgICB2YXIgaWNlR2F0aGVyZXIgPSB0aGlzLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5pY2VHYXRoZXJlcjtcbiAgICBpZiAoaWNlR2F0aGVyZXIub25sb2NhbGNhbmRpZGF0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgYnVmZmVyZWRDYW5kaWRhdGVFdmVudHMgPVxuICAgICAgdGhpcy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uYnVmZmVyZWRDYW5kaWRhdGVFdmVudHM7XG4gICAgdGhpcy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uYnVmZmVyZWRDYW5kaWRhdGVFdmVudHMgPSBudWxsO1xuICAgIGljZUdhdGhlcmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvY2FsY2FuZGlkYXRlJyxcbiAgICAgIHRoaXMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmJ1ZmZlckNhbmRpZGF0ZXMpO1xuICAgIGljZUdhdGhlcmVyLm9ubG9jYWxjYW5kaWRhdGUgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgIGlmIChwYy51c2luZ0J1bmRsZSAmJiBzZHBNTGluZUluZGV4ID4gMCkge1xuICAgICAgICAvLyBpZiB3ZSBrbm93IHRoYXQgd2UgdXNlIGJ1bmRsZSB3ZSBjYW4gZHJvcCBjYW5kaWRhdGVzIHdpdGhcbiAgICAgICAgLy8g0ZVkcE1MaW5lSW5kZXggPiAwLiBJZiB3ZSBkb24ndCBkbyB0aGlzIHRoZW4gb3VyIHN0YXRlIGdldHNcbiAgICAgICAgLy8gY29uZnVzZWQgc2luY2Ugd2UgZGlzcG9zZSB0aGUgZXh0cmEgaWNlIGdhdGhlcmVyLlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2ljZWNhbmRpZGF0ZScpO1xuICAgICAgZXZlbnQuY2FuZGlkYXRlID0ge3NkcE1pZDogbWlkLCBzZHBNTGluZUluZGV4OiBzZHBNTGluZUluZGV4fTtcblxuICAgICAgdmFyIGNhbmQgPSBldnQuY2FuZGlkYXRlO1xuICAgICAgLy8gRWRnZSBlbWl0cyBhbiBlbXB0eSBvYmplY3QgZm9yIFJUQ0ljZUNhbmRpZGF0ZUNvbXBsZXRl4oClXG4gICAgICB2YXIgZW5kID0gIWNhbmQgfHwgT2JqZWN0LmtleXMoY2FuZCkubGVuZ3RoID09PSAwO1xuICAgICAgaWYgKGVuZCkge1xuICAgICAgICAvLyBwb2x5ZmlsbCBzaW5jZSBSVENJY2VHYXRoZXJlci5zdGF0ZSBpcyBub3QgaW1wbGVtZW50ZWQgaW5cbiAgICAgICAgLy8gRWRnZSAxMDU0NyB5ZXQuXG4gICAgICAgIGlmIChpY2VHYXRoZXJlci5zdGF0ZSA9PT0gJ25ldycgfHwgaWNlR2F0aGVyZXIuc3RhdGUgPT09ICdnYXRoZXJpbmcnKSB7XG4gICAgICAgICAgaWNlR2F0aGVyZXIuc3RhdGUgPSAnY29tcGxldGVkJztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGljZUdhdGhlcmVyLnN0YXRlID09PSAnbmV3Jykge1xuICAgICAgICAgIGljZUdhdGhlcmVyLnN0YXRlID0gJ2dhdGhlcmluZyc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUlRDSWNlQ2FuZGlkYXRlIGRvZXNuJ3QgaGF2ZSBhIGNvbXBvbmVudCwgbmVlZHMgdG8gYmUgYWRkZWRcbiAgICAgICAgY2FuZC5jb21wb25lbnQgPSAxO1xuICAgICAgICAvLyBhbHNvIHRoZSB1c2VybmFtZUZyYWdtZW50LiBUT0RPOiB1cGRhdGUgU0RQIHRvIHRha2UgYm90aCB2YXJpYW50cy5cbiAgICAgICAgY2FuZC51ZnJhZyA9IGljZUdhdGhlcmVyLmdldExvY2FsUGFyYW1ldGVycygpLnVzZXJuYW1lRnJhZ21lbnQ7XG5cbiAgICAgICAgdmFyIHNlcmlhbGl6ZWRDYW5kaWRhdGUgPSBTRFBVdGlscy53cml0ZUNhbmRpZGF0ZShjYW5kKTtcbiAgICAgICAgZXZlbnQuY2FuZGlkYXRlID0gT2JqZWN0LmFzc2lnbihldmVudC5jYW5kaWRhdGUsXG4gICAgICAgICAgICBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShzZXJpYWxpemVkQ2FuZGlkYXRlKSk7XG5cbiAgICAgICAgZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZSA9IHNlcmlhbGl6ZWRDYW5kaWRhdGU7XG4gICAgICAgIGV2ZW50LmNhbmRpZGF0ZS50b0pTT04gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2FuZGlkYXRlOiBldmVudC5jYW5kaWRhdGUuY2FuZGlkYXRlLFxuICAgICAgICAgICAgc2RwTWlkOiBldmVudC5jYW5kaWRhdGUuc2RwTWlkLFxuICAgICAgICAgICAgc2RwTUxpbmVJbmRleDogZXZlbnQuY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXgsXG4gICAgICAgICAgICB1c2VybmFtZUZyYWdtZW50OiBldmVudC5jYW5kaWRhdGUudXNlcm5hbWVGcmFnbWVudFxuICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIHVwZGF0ZSBsb2NhbCBkZXNjcmlwdGlvbi5cbiAgICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLmdldE1lZGlhU2VjdGlvbnMocGMubG9jYWxEZXNjcmlwdGlvbi5zZHApO1xuICAgICAgaWYgKCFlbmQpIHtcbiAgICAgICAgc2VjdGlvbnNbZXZlbnQuY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXhdICs9XG4gICAgICAgICAgICAnYT0nICsgZXZlbnQuY2FuZGlkYXRlLmNhbmRpZGF0ZSArICdcXHJcXG4nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VjdGlvbnNbZXZlbnQuY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXhdICs9XG4gICAgICAgICAgICAnYT1lbmQtb2YtY2FuZGlkYXRlc1xcclxcbic7XG4gICAgICB9XG4gICAgICBwYy5sb2NhbERlc2NyaXB0aW9uLnNkcCA9XG4gICAgICAgICAgU0RQVXRpbHMuZ2V0RGVzY3JpcHRpb24ocGMubG9jYWxEZXNjcmlwdGlvbi5zZHApICtcbiAgICAgICAgICBzZWN0aW9ucy5qb2luKCcnKTtcbiAgICAgIHZhciBjb21wbGV0ZSA9IHBjLnRyYW5zY2VpdmVycy5ldmVyeShmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICByZXR1cm4gdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgJiZcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLnN0YXRlID09PSAnY29tcGxldGVkJztcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocGMuaWNlR2F0aGVyaW5nU3RhdGUgIT09ICdnYXRoZXJpbmcnKSB7XG4gICAgICAgIHBjLmljZUdhdGhlcmluZ1N0YXRlID0gJ2dhdGhlcmluZyc7XG4gICAgICAgIHBjLl9lbWl0R2F0aGVyaW5nU3RhdGVDaGFuZ2UoKTtcbiAgICAgIH1cblxuICAgICAgLy8gRW1pdCBjYW5kaWRhdGUuIEFsc28gZW1pdCBudWxsIGNhbmRpZGF0ZSB3aGVuIGFsbCBnYXRoZXJlcnMgYXJlXG4gICAgICAvLyBjb21wbGV0ZS5cbiAgICAgIGlmICghZW5kKSB7XG4gICAgICAgIHBjLl9kaXNwYXRjaEV2ZW50KCdpY2VjYW5kaWRhdGUnLCBldmVudCk7XG4gICAgICB9XG4gICAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgICAgcGMuX2Rpc3BhdGNoRXZlbnQoJ2ljZWNhbmRpZGF0ZScsIG5ldyBFdmVudCgnaWNlY2FuZGlkYXRlJykpO1xuICAgICAgICBwYy5pY2VHYXRoZXJpbmdTdGF0ZSA9ICdjb21wbGV0ZSc7XG4gICAgICAgIHBjLl9lbWl0R2F0aGVyaW5nU3RhdGVDaGFuZ2UoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gZW1pdCBhbHJlYWR5IGdhdGhlcmVkIGNhbmRpZGF0ZXMuXG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBidWZmZXJlZENhbmRpZGF0ZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWNlR2F0aGVyZXIub25sb2NhbGNhbmRpZGF0ZShlKTtcbiAgICAgIH0pO1xuICAgIH0sIDApO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBJQ0UgdHJhbnNwb3J0IGFuZCBEVExTIHRyYW5zcG9ydC5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9jcmVhdGVJY2VBbmREdGxzVHJhbnNwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYyA9IHRoaXM7XG4gICAgdmFyIGljZVRyYW5zcG9ydCA9IG5ldyB3aW5kb3cuUlRDSWNlVHJhbnNwb3J0KG51bGwpO1xuICAgIGljZVRyYW5zcG9ydC5vbmljZXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICBwYy5fdXBkYXRlSWNlQ29ubmVjdGlvblN0YXRlKCk7XG4gICAgICBwYy5fdXBkYXRlQ29ubmVjdGlvblN0YXRlKCk7XG4gICAgfTtcblxuICAgIHZhciBkdGxzVHJhbnNwb3J0ID0gbmV3IHdpbmRvdy5SVENEdGxzVHJhbnNwb3J0KGljZVRyYW5zcG9ydCk7XG4gICAgZHRsc1RyYW5zcG9ydC5vbmR0bHNzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcGMuX3VwZGF0ZUNvbm5lY3Rpb25TdGF0ZSgpO1xuICAgIH07XG4gICAgZHRsc1RyYW5zcG9ydC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBvbmVycm9yIGRvZXMgbm90IHNldCBzdGF0ZSB0byBmYWlsZWQgYnkgaXRzZWxmLlxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGR0bHNUcmFuc3BvcnQsICdzdGF0ZScsXG4gICAgICAgICAge3ZhbHVlOiAnZmFpbGVkJywgd3JpdGFibGU6IHRydWV9KTtcbiAgICAgIHBjLl91cGRhdGVDb25uZWN0aW9uU3RhdGUoKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGljZVRyYW5zcG9ydDogaWNlVHJhbnNwb3J0LFxuICAgICAgZHRsc1RyYW5zcG9ydDogZHRsc1RyYW5zcG9ydFxuICAgIH07XG4gIH07XG5cbiAgLy8gRGVzdHJveSBJQ0UgZ2F0aGVyZXIsIElDRSB0cmFuc3BvcnQgYW5kIERUTFMgdHJhbnNwb3J0LlxuICAvLyBXaXRob3V0IHRyaWdnZXJpbmcgdGhlIGNhbGxiYWNrcy5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl9kaXNwb3NlSWNlQW5kRHRsc1RyYW5zcG9ydHMgPSBmdW5jdGlvbihcbiAgICAgIHNkcE1MaW5lSW5kZXgpIHtcbiAgICB2YXIgaWNlR2F0aGVyZXIgPSB0aGlzLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5pY2VHYXRoZXJlcjtcbiAgICBpZiAoaWNlR2F0aGVyZXIpIHtcbiAgICAgIGRlbGV0ZSBpY2VHYXRoZXJlci5vbmxvY2FsY2FuZGlkYXRlO1xuICAgICAgZGVsZXRlIHRoaXMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmljZUdhdGhlcmVyO1xuICAgIH1cbiAgICB2YXIgaWNlVHJhbnNwb3J0ID0gdGhpcy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uaWNlVHJhbnNwb3J0O1xuICAgIGlmIChpY2VUcmFuc3BvcnQpIHtcbiAgICAgIGRlbGV0ZSBpY2VUcmFuc3BvcnQub25pY2VzdGF0ZWNoYW5nZTtcbiAgICAgIGRlbGV0ZSB0aGlzLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5pY2VUcmFuc3BvcnQ7XG4gICAgfVxuICAgIHZhciBkdGxzVHJhbnNwb3J0ID0gdGhpcy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uZHRsc1RyYW5zcG9ydDtcbiAgICBpZiAoZHRsc1RyYW5zcG9ydCkge1xuICAgICAgZGVsZXRlIGR0bHNUcmFuc3BvcnQub25kdGxzc3RhdGVjaGFuZ2U7XG4gICAgICBkZWxldGUgZHRsc1RyYW5zcG9ydC5vbmVycm9yO1xuICAgICAgZGVsZXRlIHRoaXMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLmR0bHNUcmFuc3BvcnQ7XG4gICAgfVxuICB9O1xuXG4gIC8vIFN0YXJ0IHRoZSBSVFAgU2VuZGVyIGFuZCBSZWNlaXZlciBmb3IgYSB0cmFuc2NlaXZlci5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl90cmFuc2NlaXZlID0gZnVuY3Rpb24odHJhbnNjZWl2ZXIsXG4gICAgICBzZW5kLCByZWN2KSB7XG4gICAgdmFyIHBhcmFtcyA9IGdldENvbW1vbkNhcGFiaWxpdGllcyh0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgdHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzKTtcbiAgICBpZiAoc2VuZCAmJiB0cmFuc2NlaXZlci5ydHBTZW5kZXIpIHtcbiAgICAgIHBhcmFtcy5lbmNvZGluZ3MgPSB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgcGFyYW1zLnJ0Y3AgPSB7XG4gICAgICAgIGNuYW1lOiBTRFBVdGlscy5sb2NhbENOYW1lLFxuICAgICAgICBjb21wb3VuZDogdHJhbnNjZWl2ZXIucnRjcFBhcmFtZXRlcnMuY29tcG91bmRcbiAgICAgIH07XG4gICAgICBpZiAodHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVycy5sZW5ndGgpIHtcbiAgICAgICAgcGFyYW1zLnJ0Y3Auc3NyYyA9IHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYztcbiAgICAgIH1cbiAgICAgIHRyYW5zY2VpdmVyLnJ0cFNlbmRlci5zZW5kKHBhcmFtcyk7XG4gICAgfVxuICAgIGlmIChyZWN2ICYmIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyICYmIHBhcmFtcy5jb2RlY3MubGVuZ3RoID4gMCkge1xuICAgICAgLy8gcmVtb3ZlIFJUWCBmaWVsZCBpbiBFZGdlIDE0OTQyXG4gICAgICBpZiAodHJhbnNjZWl2ZXIua2luZCA9PT0gJ3ZpZGVvJ1xuICAgICAgICAgICYmIHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnNcbiAgICAgICAgICAmJiBlZGdlVmVyc2lvbiA8IDE1MDE5KSB7XG4gICAgICAgIHRyYW5zY2VpdmVyLnJlY3ZFbmNvZGluZ1BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbihwKSB7XG4gICAgICAgICAgZGVsZXRlIHAucnR4O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICh0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzLmxlbmd0aCkge1xuICAgICAgICBwYXJhbXMuZW5jb2RpbmdzID0gdHJhbnNjZWl2ZXIucmVjdkVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmFtcy5lbmNvZGluZ3MgPSBbe31dO1xuICAgICAgfVxuICAgICAgcGFyYW1zLnJ0Y3AgPSB7XG4gICAgICAgIGNvbXBvdW5kOiB0cmFuc2NlaXZlci5ydGNwUGFyYW1ldGVycy5jb21wb3VuZFxuICAgICAgfTtcbiAgICAgIGlmICh0cmFuc2NlaXZlci5ydGNwUGFyYW1ldGVycy5jbmFtZSkge1xuICAgICAgICBwYXJhbXMucnRjcC5jbmFtZSA9IHRyYW5zY2VpdmVyLnJ0Y3BQYXJhbWV0ZXJzLmNuYW1lO1xuICAgICAgfVxuICAgICAgaWYgKHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoKSB7XG4gICAgICAgIHBhcmFtcy5ydGNwLnNzcmMgPSB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmM7XG4gICAgICB9XG4gICAgICB0cmFuc2NlaXZlci5ydHBSZWNlaXZlci5yZWNlaXZlKHBhcmFtcyk7XG4gICAgfVxuICB9O1xuXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRMb2NhbERlc2NyaXB0aW9uID0gZnVuY3Rpb24oZGVzY3JpcHRpb24pIHtcbiAgICB2YXIgcGMgPSB0aGlzO1xuXG4gICAgLy8gTm90ZTogcHJhbnN3ZXIgaXMgbm90IHN1cHBvcnRlZC5cbiAgICBpZiAoWydvZmZlcicsICdhbnN3ZXInXS5pbmRleE9mKGRlc2NyaXB0aW9uLnR5cGUpID09PSAtMSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG1ha2VFcnJvcignVHlwZUVycm9yJyxcbiAgICAgICAgICAnVW5zdXBwb3J0ZWQgdHlwZSBcIicgKyBkZXNjcmlwdGlvbi50eXBlICsgJ1wiJykpO1xuICAgIH1cblxuICAgIGlmICghaXNBY3Rpb25BbGxvd2VkSW5TaWduYWxpbmdTdGF0ZSgnc2V0TG9jYWxEZXNjcmlwdGlvbicsXG4gICAgICAgIGRlc2NyaXB0aW9uLnR5cGUsIHBjLnNpZ25hbGluZ1N0YXRlKSB8fCBwYy5faXNDbG9zZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChtYWtlRXJyb3IoJ0ludmFsaWRTdGF0ZUVycm9yJyxcbiAgICAgICAgICAnQ2FuIG5vdCBzZXQgbG9jYWwgJyArIGRlc2NyaXB0aW9uLnR5cGUgK1xuICAgICAgICAgICcgaW4gc3RhdGUgJyArIHBjLnNpZ25hbGluZ1N0YXRlKSk7XG4gICAgfVxuXG4gICAgdmFyIHNlY3Rpb25zO1xuICAgIHZhciBzZXNzaW9ucGFydDtcbiAgICBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJykge1xuICAgICAgLy8gVkVSWSBsaW1pdGVkIHN1cHBvcnQgZm9yIFNEUCBtdW5naW5nLiBMaW1pdGVkIHRvOlxuICAgICAgLy8gKiBjaGFuZ2luZyB0aGUgb3JkZXIgb2YgY29kZWNzXG4gICAgICBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoZGVzY3JpcHRpb24uc2RwKTtcbiAgICAgIHNlc3Npb25wYXJ0ID0gc2VjdGlvbnMuc2hpZnQoKTtcbiAgICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAgIHZhciBjYXBzID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG4gICAgICAgIHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5sb2NhbENhcGFiaWxpdGllcyA9IGNhcHM7XG4gICAgICB9KTtcblxuICAgICAgcGMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIsIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgcGMuX2dhdGhlcih0cmFuc2NlaXZlci5taWQsIHNkcE1MaW5lSW5kZXgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnYW5zd2VyJykge1xuICAgICAgc2VjdGlvbnMgPSBTRFBVdGlscy5zcGxpdFNlY3Rpb25zKHBjLnJlbW90ZURlc2NyaXB0aW9uLnNkcCk7XG4gICAgICBzZXNzaW9ucGFydCA9IHNlY3Rpb25zLnNoaWZ0KCk7XG4gICAgICB2YXIgaXNJY2VMaXRlID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoc2Vzc2lvbnBhcnQsXG4gICAgICAgICAgJ2E9aWNlLWxpdGUnKS5sZW5ndGggPiAwO1xuICAgICAgc2VjdGlvbnMuZm9yRWFjaChmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNkcE1MaW5lSW5kZXgpIHtcbiAgICAgICAgdmFyIHRyYW5zY2VpdmVyID0gcGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICB2YXIgaWNlR2F0aGVyZXIgPSB0cmFuc2NlaXZlci5pY2VHYXRoZXJlcjtcbiAgICAgICAgdmFyIGljZVRyYW5zcG9ydCA9IHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydDtcbiAgICAgICAgdmFyIGR0bHNUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0O1xuICAgICAgICB2YXIgbG9jYWxDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcztcbiAgICAgICAgdmFyIHJlbW90ZUNhcGFiaWxpdGllcyA9IHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcztcblxuICAgICAgICAvLyB0cmVhdCBidW5kbGUtb25seSBhcyBub3QtcmVqZWN0ZWQuXG4gICAgICAgIHZhciByZWplY3RlZCA9IFNEUFV0aWxzLmlzUmVqZWN0ZWQobWVkaWFTZWN0aW9uKSAmJlxuICAgICAgICAgICAgU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1idW5kbGUtb25seScpLmxlbmd0aCA9PT0gMDtcblxuICAgICAgICBpZiAoIXJlamVjdGVkICYmICF0cmFuc2NlaXZlci5yZWplY3RlZCkge1xuICAgICAgICAgIHZhciByZW1vdGVJY2VQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0SWNlUGFyYW1ldGVycyhcbiAgICAgICAgICAgICAgbWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCk7XG4gICAgICAgICAgdmFyIHJlbW90ZUR0bHNQYXJhbWV0ZXJzID0gU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMoXG4gICAgICAgICAgICAgIG1lZGlhU2VjdGlvbiwgc2Vzc2lvbnBhcnQpO1xuICAgICAgICAgIGlmIChpc0ljZUxpdGUpIHtcbiAgICAgICAgICAgIHJlbW90ZUR0bHNQYXJhbWV0ZXJzLnJvbGUgPSAnc2VydmVyJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXBjLnVzaW5nQnVuZGxlIHx8IHNkcE1MaW5lSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIHBjLl9nYXRoZXIodHJhbnNjZWl2ZXIubWlkLCBzZHBNTGluZUluZGV4KTtcbiAgICAgICAgICAgIGlmIChpY2VUcmFuc3BvcnQuc3RhdGUgPT09ICduZXcnKSB7XG4gICAgICAgICAgICAgIGljZVRyYW5zcG9ydC5zdGFydChpY2VHYXRoZXJlciwgcmVtb3RlSWNlUGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICAgIGlzSWNlTGl0ZSA/ICdjb250cm9sbGluZycgOiAnY29udHJvbGxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGR0bHNUcmFuc3BvcnQuc3RhdGUgPT09ICduZXcnKSB7XG4gICAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQuc3RhcnQocmVtb3RlRHRsc1BhcmFtZXRlcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENhbGN1bGF0ZSBpbnRlcnNlY3Rpb24gb2YgY2FwYWJpbGl0aWVzLlxuICAgICAgICAgIHZhciBwYXJhbXMgPSBnZXRDb21tb25DYXBhYmlsaXRpZXMobG9jYWxDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllcyk7XG5cbiAgICAgICAgICAvLyBTdGFydCB0aGUgUlRDUnRwU2VuZGVyLiBUaGUgUlRDUnRwUmVjZWl2ZXIgZm9yIHRoaXNcbiAgICAgICAgICAvLyB0cmFuc2NlaXZlciBoYXMgYWxyZWFkeSBiZWVuIHN0YXJ0ZWQgaW4gc2V0UmVtb3RlRGVzY3JpcHRpb24uXG4gICAgICAgICAgcGMuX3RyYW5zY2VpdmUodHJhbnNjZWl2ZXIsXG4gICAgICAgICAgICAgIHBhcmFtcy5jb2RlY3MubGVuZ3RoID4gMCxcbiAgICAgICAgICAgICAgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBwYy5sb2NhbERlc2NyaXB0aW9uID0ge1xuICAgICAgdHlwZTogZGVzY3JpcHRpb24udHlwZSxcbiAgICAgIHNkcDogZGVzY3JpcHRpb24uc2RwXG4gICAgfTtcbiAgICBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ29mZmVyJykge1xuICAgICAgcGMuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlKCdoYXZlLWxvY2FsLW9mZmVyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBjLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnc3RhYmxlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9O1xuXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRSZW1vdGVEZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgdmFyIHBjID0gdGhpcztcblxuICAgIC8vIE5vdGU6IHByYW5zd2VyIGlzIG5vdCBzdXBwb3J0ZWQuXG4gICAgaWYgKFsnb2ZmZXInLCAnYW5zd2VyJ10uaW5kZXhPZihkZXNjcmlwdGlvbi50eXBlKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChtYWtlRXJyb3IoJ1R5cGVFcnJvcicsXG4gICAgICAgICAgJ1Vuc3VwcG9ydGVkIHR5cGUgXCInICsgZGVzY3JpcHRpb24udHlwZSArICdcIicpKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzQWN0aW9uQWxsb3dlZEluU2lnbmFsaW5nU3RhdGUoJ3NldFJlbW90ZURlc2NyaXB0aW9uJyxcbiAgICAgICAgZGVzY3JpcHRpb24udHlwZSwgcGMuc2lnbmFsaW5nU3RhdGUpIHx8IHBjLl9pc0Nsb3NlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG1ha2VFcnJvcignSW52YWxpZFN0YXRlRXJyb3InLFxuICAgICAgICAgICdDYW4gbm90IHNldCByZW1vdGUgJyArIGRlc2NyaXB0aW9uLnR5cGUgK1xuICAgICAgICAgICcgaW4gc3RhdGUgJyArIHBjLnNpZ25hbGluZ1N0YXRlKSk7XG4gICAgfVxuXG4gICAgdmFyIHN0cmVhbXMgPSB7fTtcbiAgICBwYy5yZW1vdGVTdHJlYW1zLmZvckVhY2goZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICBzdHJlYW1zW3N0cmVhbS5pZF0gPSBzdHJlYW07XG4gICAgfSk7XG4gICAgdmFyIHJlY2VpdmVyTGlzdCA9IFtdO1xuICAgIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoZGVzY3JpcHRpb24uc2RwKTtcbiAgICB2YXIgc2Vzc2lvbnBhcnQgPSBzZWN0aW9ucy5zaGlmdCgpO1xuICAgIHZhciBpc0ljZUxpdGUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChzZXNzaW9ucGFydCxcbiAgICAgICAgJ2E9aWNlLWxpdGUnKS5sZW5ndGggPiAwO1xuICAgIHZhciB1c2luZ0J1bmRsZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KHNlc3Npb25wYXJ0LFxuICAgICAgICAnYT1ncm91cDpCVU5ETEUgJykubGVuZ3RoID4gMDtcbiAgICBwYy51c2luZ0J1bmRsZSA9IHVzaW5nQnVuZGxlO1xuICAgIHZhciBpY2VPcHRpb25zID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoc2Vzc2lvbnBhcnQsXG4gICAgICAgICdhPWljZS1vcHRpb25zOicpWzBdO1xuICAgIGlmIChpY2VPcHRpb25zKSB7XG4gICAgICBwYy5jYW5Ucmlja2xlSWNlQ2FuZGlkYXRlcyA9IGljZU9wdGlvbnMuc3Vic3RyKDE0KS5zcGxpdCgnICcpXG4gICAgICAgICAgLmluZGV4T2YoJ3RyaWNrbGUnKSA+PSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYy5jYW5Ucmlja2xlSWNlQ2FuZGlkYXRlcyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gICAgICB2YXIga2luZCA9IFNEUFV0aWxzLmdldEtpbmQobWVkaWFTZWN0aW9uKTtcbiAgICAgIC8vIHRyZWF0IGJ1bmRsZS1vbmx5IGFzIG5vdC1yZWplY3RlZC5cbiAgICAgIHZhciByZWplY3RlZCA9IFNEUFV0aWxzLmlzUmVqZWN0ZWQobWVkaWFTZWN0aW9uKSAmJlxuICAgICAgICAgIFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9YnVuZGxlLW9ubHknKS5sZW5ndGggPT09IDA7XG4gICAgICB2YXIgcHJvdG9jb2wgPSBsaW5lc1swXS5zdWJzdHIoMikuc3BsaXQoJyAnKVsyXTtcblxuICAgICAgdmFyIGRpcmVjdGlvbiA9IFNEUFV0aWxzLmdldERpcmVjdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KTtcbiAgICAgIHZhciByZW1vdGVNc2lkID0gU0RQVXRpbHMucGFyc2VNc2lkKG1lZGlhU2VjdGlvbik7XG5cbiAgICAgIHZhciBtaWQgPSBTRFBVdGlscy5nZXRNaWQobWVkaWFTZWN0aW9uKSB8fCBTRFBVdGlscy5nZW5lcmF0ZUlkZW50aWZpZXIoKTtcblxuICAgICAgLy8gUmVqZWN0IGRhdGFjaGFubmVscyB3aGljaCBhcmUgbm90IGltcGxlbWVudGVkIHlldC5cbiAgICAgIGlmICgoa2luZCA9PT0gJ2FwcGxpY2F0aW9uJyAmJiBwcm90b2NvbCA9PT0gJ0RUTFMvU0NUUCcpIHx8IHJlamVjdGVkKSB7XG4gICAgICAgIC8vIFRPRE86IHRoaXMgaXMgZGFuZ2Vyb3VzIGluIHRoZSBjYXNlIHdoZXJlIGEgbm9uLXJlamVjdGVkIG0tbGluZVxuICAgICAgICAvLyAgICAgYmVjb21lcyByZWplY3RlZC5cbiAgICAgICAgcGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdID0ge1xuICAgICAgICAgIG1pZDogbWlkLFxuICAgICAgICAgIGtpbmQ6IGtpbmQsXG4gICAgICAgICAgcmVqZWN0ZWQ6IHRydWVcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXJlamVjdGVkICYmIHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSAmJlxuICAgICAgICAgIHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5yZWplY3RlZCkge1xuICAgICAgICAvLyByZWN5Y2xlIGEgcmVqZWN0ZWQgdHJhbnNjZWl2ZXIuXG4gICAgICAgIHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSA9IHBjLl9jcmVhdGVUcmFuc2NlaXZlcihraW5kLCB0cnVlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRyYW5zY2VpdmVyO1xuICAgICAgdmFyIGljZUdhdGhlcmVyO1xuICAgICAgdmFyIGljZVRyYW5zcG9ydDtcbiAgICAgIHZhciBkdGxzVHJhbnNwb3J0O1xuICAgICAgdmFyIHJ0cFJlY2VpdmVyO1xuICAgICAgdmFyIHNlbmRFbmNvZGluZ1BhcmFtZXRlcnM7XG4gICAgICB2YXIgcmVjdkVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgIHZhciBsb2NhbENhcGFiaWxpdGllcztcblxuICAgICAgdmFyIHRyYWNrO1xuICAgICAgLy8gRklYTUU6IGVuc3VyZSB0aGUgbWVkaWFTZWN0aW9uIGhhcyBydGNwLW11eCBzZXQuXG4gICAgICB2YXIgcmVtb3RlQ2FwYWJpbGl0aWVzID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG4gICAgICB2YXIgcmVtb3RlSWNlUGFyYW1ldGVycztcbiAgICAgIHZhciByZW1vdGVEdGxzUGFyYW1ldGVycztcbiAgICAgIGlmICghcmVqZWN0ZWQpIHtcbiAgICAgICAgcmVtb3RlSWNlUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldEljZVBhcmFtZXRlcnMobWVkaWFTZWN0aW9uLFxuICAgICAgICAgICAgc2Vzc2lvbnBhcnQpO1xuICAgICAgICByZW1vdGVEdGxzUGFyYW1ldGVycyA9IFNEUFV0aWxzLmdldER0bHNQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbixcbiAgICAgICAgICAgIHNlc3Npb25wYXJ0KTtcbiAgICAgICAgcmVtb3RlRHRsc1BhcmFtZXRlcnMucm9sZSA9ICdjbGllbnQnO1xuICAgICAgfVxuICAgICAgcmVjdkVuY29kaW5nUGFyYW1ldGVycyA9XG4gICAgICAgICAgU0RQVXRpbHMucGFyc2VSdHBFbmNvZGluZ1BhcmFtZXRlcnMobWVkaWFTZWN0aW9uKTtcblxuICAgICAgdmFyIHJ0Y3BQYXJhbWV0ZXJzID0gU0RQVXRpbHMucGFyc2VSdGNwUGFyYW1ldGVycyhtZWRpYVNlY3Rpb24pO1xuXG4gICAgICB2YXIgaXNDb21wbGV0ZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbixcbiAgICAgICAgICAnYT1lbmQtb2YtY2FuZGlkYXRlcycsIHNlc3Npb25wYXJ0KS5sZW5ndGggPiAwO1xuICAgICAgdmFyIGNhbmRzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1jYW5kaWRhdGU6JylcbiAgICAgICAgICAubWFwKGZ1bmN0aW9uKGNhbmQpIHtcbiAgICAgICAgICAgIHJldHVybiBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShjYW5kKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oY2FuZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbmQuY29tcG9uZW50ID09PSAxO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAvLyBDaGVjayBpZiB3ZSBjYW4gdXNlIEJVTkRMRSBhbmQgZGlzcG9zZSB0cmFuc3BvcnRzLlxuICAgICAgaWYgKChkZXNjcmlwdGlvbi50eXBlID09PSAnb2ZmZXInIHx8IGRlc2NyaXB0aW9uLnR5cGUgPT09ICdhbnN3ZXInKSAmJlxuICAgICAgICAgICFyZWplY3RlZCAmJiB1c2luZ0J1bmRsZSAmJiBzZHBNTGluZUluZGV4ID4gMCAmJlxuICAgICAgICAgIHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XSkge1xuICAgICAgICBwYy5fZGlzcG9zZUljZUFuZER0bHNUcmFuc3BvcnRzKHNkcE1MaW5lSW5kZXgpO1xuICAgICAgICBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uaWNlR2F0aGVyZXIgPVxuICAgICAgICAgICAgcGMudHJhbnNjZWl2ZXJzWzBdLmljZUdhdGhlcmVyO1xuICAgICAgICBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0uaWNlVHJhbnNwb3J0ID1cbiAgICAgICAgICAgIHBjLnRyYW5zY2VpdmVyc1swXS5pY2VUcmFuc3BvcnQ7XG4gICAgICAgIHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5kdGxzVHJhbnNwb3J0ID1cbiAgICAgICAgICAgIHBjLnRyYW5zY2VpdmVyc1swXS5kdGxzVHJhbnNwb3J0O1xuICAgICAgICBpZiAocGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLnJ0cFNlbmRlcikge1xuICAgICAgICAgIHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5ydHBTZW5kZXIuc2V0VHJhbnNwb3J0KFxuICAgICAgICAgICAgICBwYy50cmFuc2NlaXZlcnNbMF0uZHRsc1RyYW5zcG9ydCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5ydHBSZWNlaXZlcikge1xuICAgICAgICAgIHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XS5ydHBSZWNlaXZlci5zZXRUcmFuc3BvcnQoXG4gICAgICAgICAgICAgIHBjLnRyYW5zY2VpdmVyc1swXS5kdGxzVHJhbnNwb3J0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGRlc2NyaXB0aW9uLnR5cGUgPT09ICdvZmZlcicgJiYgIXJlamVjdGVkKSB7XG4gICAgICAgIHRyYW5zY2VpdmVyID0gcGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdIHx8XG4gICAgICAgICAgICBwYy5fY3JlYXRlVHJhbnNjZWl2ZXIoa2luZCk7XG4gICAgICAgIHRyYW5zY2VpdmVyLm1pZCA9IG1pZDtcblxuICAgICAgICBpZiAoIXRyYW5zY2VpdmVyLmljZUdhdGhlcmVyKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlR2F0aGVyZXIgPSBwYy5fY3JlYXRlSWNlR2F0aGVyZXIoc2RwTUxpbmVJbmRleCxcbiAgICAgICAgICAgICAgdXNpbmdCdW5kbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbmRzLmxlbmd0aCAmJiB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuc3RhdGUgPT09ICduZXcnKSB7XG4gICAgICAgICAgaWYgKGlzQ29tcGxldGUgJiYgKCF1c2luZ0J1bmRsZSB8fCBzZHBNTGluZUluZGV4ID09PSAwKSkge1xuICAgICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LnNldFJlbW90ZUNhbmRpZGF0ZXMoY2FuZHMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYW5kcy5mb3JFYWNoKGZ1bmN0aW9uKGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgICBtYXliZUFkZENhbmRpZGF0ZSh0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQsIGNhbmRpZGF0ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsb2NhbENhcGFiaWxpdGllcyA9IHdpbmRvdy5SVENSdHBSZWNlaXZlci5nZXRDYXBhYmlsaXRpZXMoa2luZCk7XG5cbiAgICAgICAgLy8gZmlsdGVyIFJUWCB1bnRpbCBhZGRpdGlvbmFsIHN0dWZmIG5lZWRlZCBmb3IgUlRYIGlzIGltcGxlbWVudGVkXG4gICAgICAgIC8vIGluIGFkYXB0ZXIuanNcbiAgICAgICAgaWYgKGVkZ2VWZXJzaW9uIDwgMTUwMTkpIHtcbiAgICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MgPSBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MuZmlsdGVyKFxuICAgICAgICAgICAgICBmdW5jdGlvbihjb2RlYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2RlYy5uYW1lICE9PSAncnR4JztcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycyB8fCBbe1xuICAgICAgICAgIHNzcmM6ICgyICogc2RwTUxpbmVJbmRleCArIDIpICogMTAwMVxuICAgICAgICB9XTtcblxuICAgICAgICAvLyBUT0RPOiByZXdyaXRlIHRvIHVzZSBodHRwOi8vdzNjLmdpdGh1Yi5pby93ZWJydGMtcGMvI3NldC1hc3NvY2lhdGVkLXJlbW90ZS1zdHJlYW1zXG4gICAgICAgIHZhciBpc05ld1RyYWNrID0gZmFsc2U7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdzZW5kcmVjdicgfHwgZGlyZWN0aW9uID09PSAnc2VuZG9ubHknKSB7XG4gICAgICAgICAgaXNOZXdUcmFjayA9ICF0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcbiAgICAgICAgICBydHBSZWNlaXZlciA9IHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyIHx8XG4gICAgICAgICAgICAgIG5ldyB3aW5kb3cuUlRDUnRwUmVjZWl2ZXIodHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydCwga2luZCk7XG5cbiAgICAgICAgICBpZiAoaXNOZXdUcmFjaykge1xuICAgICAgICAgICAgdmFyIHN0cmVhbTtcbiAgICAgICAgICAgIHRyYWNrID0gcnRwUmVjZWl2ZXIudHJhY2s7XG4gICAgICAgICAgICAvLyBGSVhNRTogZG9lcyBub3Qgd29yayB3aXRoIFBsYW4gQi5cbiAgICAgICAgICAgIGlmIChyZW1vdGVNc2lkICYmIHJlbW90ZU1zaWQuc3RyZWFtID09PSAnLScpIHtcbiAgICAgICAgICAgICAgLy8gbm8tb3AuIGEgc3RyZWFtIGlkIG9mICctJyBtZWFuczogbm8gYXNzb2NpYXRlZCBzdHJlYW0uXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlbW90ZU1zaWQpIHtcbiAgICAgICAgICAgICAgaWYgKCFzdHJlYW1zW3JlbW90ZU1zaWQuc3RyZWFtXSkge1xuICAgICAgICAgICAgICAgIHN0cmVhbXNbcmVtb3RlTXNpZC5zdHJlYW1dID0gbmV3IHdpbmRvdy5NZWRpYVN0cmVhbSgpO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdHJlYW1zW3JlbW90ZU1zaWQuc3RyZWFtXSwgJ2lkJywge1xuICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbW90ZU1zaWQuc3RyZWFtO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0cmFjaywgJ2lkJywge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVtb3RlTXNpZC50cmFjaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBzdHJlYW0gPSBzdHJlYW1zW3JlbW90ZU1zaWQuc3RyZWFtXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICghc3RyZWFtcy5kZWZhdWx0KSB7XG4gICAgICAgICAgICAgICAgc3RyZWFtcy5kZWZhdWx0ID0gbmV3IHdpbmRvdy5NZWRpYVN0cmVhbSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHN0cmVhbSA9IHN0cmVhbXMuZGVmYXVsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdHJlYW0pIHtcbiAgICAgICAgICAgICAgYWRkVHJhY2tUb1N0cmVhbUFuZEZpcmVFdmVudCh0cmFjaywgc3RyZWFtKTtcbiAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIuYXNzb2NpYXRlZFJlbW90ZU1lZGlhU3RyZWFtcy5wdXNoKHN0cmVhbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWNlaXZlckxpc3QucHVzaChbdHJhY2ssIHJ0cFJlY2VpdmVyLCBzdHJlYW1dKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIgJiYgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIudHJhY2spIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci5hc3NvY2lhdGVkUmVtb3RlTWVkaWFTdHJlYW1zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgICAgICAgdmFyIG5hdGl2ZVRyYWNrID0gcy5nZXRUcmFja3MoKS5maW5kKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHQuaWQgPT09IHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyLnRyYWNrLmlkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAobmF0aXZlVHJhY2spIHtcbiAgICAgICAgICAgICAgcmVtb3ZlVHJhY2tGcm9tU3RyZWFtQW5kRmlyZUV2ZW50KG5hdGl2ZVRyYWNrLCBzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0cmFuc2NlaXZlci5hc3NvY2lhdGVkUmVtb3RlTWVkaWFTdHJlYW1zID0gW107XG4gICAgICAgIH1cblxuICAgICAgICB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcyA9IGxvY2FsQ2FwYWJpbGl0aWVzO1xuICAgICAgICB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXMgPSByZW1vdGVDYXBhYmlsaXRpZXM7XG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyID0gcnRwUmVjZWl2ZXI7XG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0Y3BQYXJhbWV0ZXJzID0gcnRjcFBhcmFtZXRlcnM7XG4gICAgICAgIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgPSBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICB0cmFuc2NlaXZlci5yZWN2RW5jb2RpbmdQYXJhbWV0ZXJzID0gcmVjdkVuY29kaW5nUGFyYW1ldGVycztcblxuICAgICAgICAvLyBTdGFydCB0aGUgUlRDUnRwUmVjZWl2ZXIgbm93LiBUaGUgUlRQU2VuZGVyIGlzIHN0YXJ0ZWQgaW5cbiAgICAgICAgLy8gc2V0TG9jYWxEZXNjcmlwdGlvbi5cbiAgICAgICAgcGMuX3RyYW5zY2VpdmUocGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLFxuICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICBpc05ld1RyYWNrKTtcbiAgICAgIH0gZWxzZSBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJ2Fuc3dlcicgJiYgIXJlamVjdGVkKSB7XG4gICAgICAgIHRyYW5zY2VpdmVyID0gcGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdO1xuICAgICAgICBpY2VHYXRoZXJlciA9IHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyO1xuICAgICAgICBpY2VUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQ7XG4gICAgICAgIGR0bHNUcmFuc3BvcnQgPSB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0O1xuICAgICAgICBydHBSZWNlaXZlciA9IHRyYW5zY2VpdmVyLnJ0cFJlY2VpdmVyO1xuICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzID0gdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVycztcbiAgICAgICAgbG9jYWxDYXBhYmlsaXRpZXMgPSB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcztcblxuICAgICAgICBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ucmVjdkVuY29kaW5nUGFyYW1ldGVycyA9XG4gICAgICAgICAgICByZWN2RW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgICAgICBwYy50cmFuc2NlaXZlcnNbc2RwTUxpbmVJbmRleF0ucmVtb3RlQ2FwYWJpbGl0aWVzID1cbiAgICAgICAgICAgIHJlbW90ZUNhcGFiaWxpdGllcztcbiAgICAgICAgcGMudHJhbnNjZWl2ZXJzW3NkcE1MaW5lSW5kZXhdLnJ0Y3BQYXJhbWV0ZXJzID0gcnRjcFBhcmFtZXRlcnM7XG5cbiAgICAgICAgaWYgKGNhbmRzLmxlbmd0aCAmJiBpY2VUcmFuc3BvcnQuc3RhdGUgPT09ICduZXcnKSB7XG4gICAgICAgICAgaWYgKChpc0ljZUxpdGUgfHwgaXNDb21wbGV0ZSkgJiZcbiAgICAgICAgICAgICAgKCF1c2luZ0J1bmRsZSB8fCBzZHBNTGluZUluZGV4ID09PSAwKSkge1xuICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnNldFJlbW90ZUNhbmRpZGF0ZXMoY2FuZHMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYW5kcy5mb3JFYWNoKGZ1bmN0aW9uKGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgICBtYXliZUFkZENhbmRpZGF0ZSh0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQsIGNhbmRpZGF0ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXVzaW5nQnVuZGxlIHx8IHNkcE1MaW5lSW5kZXggPT09IDApIHtcbiAgICAgICAgICBpZiAoaWNlVHJhbnNwb3J0LnN0YXRlID09PSAnbmV3Jykge1xuICAgICAgICAgICAgaWNlVHJhbnNwb3J0LnN0YXJ0KGljZUdhdGhlcmVyLCByZW1vdGVJY2VQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgICdjb250cm9sbGluZycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZHRsc1RyYW5zcG9ydC5zdGF0ZSA9PT0gJ25ldycpIHtcbiAgICAgICAgICAgIGR0bHNUcmFuc3BvcnQuc3RhcnQocmVtb3RlRHRsc1BhcmFtZXRlcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHBjLl90cmFuc2NlaXZlKHRyYW5zY2VpdmVyLFxuICAgICAgICAgICAgZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3JlY3Zvbmx5JyxcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2JyB8fCBkaXJlY3Rpb24gPT09ICdzZW5kb25seScpO1xuXG4gICAgICAgIC8vIFRPRE86IHJld3JpdGUgdG8gdXNlIGh0dHA6Ly93M2MuZ2l0aHViLmlvL3dlYnJ0Yy1wYy8jc2V0LWFzc29jaWF0ZWQtcmVtb3RlLXN0cmVhbXNcbiAgICAgICAgaWYgKHJ0cFJlY2VpdmVyICYmXG4gICAgICAgICAgICAoZGlyZWN0aW9uID09PSAnc2VuZHJlY3YnIHx8IGRpcmVjdGlvbiA9PT0gJ3NlbmRvbmx5JykpIHtcbiAgICAgICAgICB0cmFjayA9IHJ0cFJlY2VpdmVyLnRyYWNrO1xuICAgICAgICAgIGlmIChyZW1vdGVNc2lkKSB7XG4gICAgICAgICAgICBpZiAoIXN0cmVhbXNbcmVtb3RlTXNpZC5zdHJlYW1dKSB7XG4gICAgICAgICAgICAgIHN0cmVhbXNbcmVtb3RlTXNpZC5zdHJlYW1dID0gbmV3IHdpbmRvdy5NZWRpYVN0cmVhbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkVHJhY2tUb1N0cmVhbUFuZEZpcmVFdmVudCh0cmFjaywgc3RyZWFtc1tyZW1vdGVNc2lkLnN0cmVhbV0pO1xuICAgICAgICAgICAgcmVjZWl2ZXJMaXN0LnB1c2goW3RyYWNrLCBydHBSZWNlaXZlciwgc3RyZWFtc1tyZW1vdGVNc2lkLnN0cmVhbV1dKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFzdHJlYW1zLmRlZmF1bHQpIHtcbiAgICAgICAgICAgICAgc3RyZWFtcy5kZWZhdWx0ID0gbmV3IHdpbmRvdy5NZWRpYVN0cmVhbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkVHJhY2tUb1N0cmVhbUFuZEZpcmVFdmVudCh0cmFjaywgc3RyZWFtcy5kZWZhdWx0KTtcbiAgICAgICAgICAgIHJlY2VpdmVyTGlzdC5wdXNoKFt0cmFjaywgcnRwUmVjZWl2ZXIsIHN0cmVhbXMuZGVmYXVsdF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBGSVhNRTogYWN0dWFsbHkgdGhlIHJlY2VpdmVyIHNob3VsZCBiZSBjcmVhdGVkIGxhdGVyLlxuICAgICAgICAgIGRlbGV0ZSB0cmFuc2NlaXZlci5ydHBSZWNlaXZlcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHBjLl9kdGxzUm9sZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYy5fZHRsc1JvbGUgPSBkZXNjcmlwdGlvbi50eXBlID09PSAnb2ZmZXInID8gJ2FjdGl2ZScgOiAncGFzc2l2ZSc7XG4gICAgfVxuXG4gICAgcGMucmVtb3RlRGVzY3JpcHRpb24gPSB7XG4gICAgICB0eXBlOiBkZXNjcmlwdGlvbi50eXBlLFxuICAgICAgc2RwOiBkZXNjcmlwdGlvbi5zZHBcbiAgICB9O1xuICAgIGlmIChkZXNjcmlwdGlvbi50eXBlID09PSAnb2ZmZXInKSB7XG4gICAgICBwYy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ2hhdmUtcmVtb3RlLW9mZmVyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBjLl91cGRhdGVTaWduYWxpbmdTdGF0ZSgnc3RhYmxlJyk7XG4gICAgfVxuICAgIE9iamVjdC5rZXlzKHN0cmVhbXMpLmZvckVhY2goZnVuY3Rpb24oc2lkKSB7XG4gICAgICB2YXIgc3RyZWFtID0gc3RyZWFtc1tzaWRdO1xuICAgICAgaWYgKHN0cmVhbS5nZXRUcmFja3MoKS5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHBjLnJlbW90ZVN0cmVhbXMuaW5kZXhPZihzdHJlYW0pID09PSAtMSkge1xuICAgICAgICAgIHBjLnJlbW90ZVN0cmVhbXMucHVzaChzdHJlYW0pO1xuICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgnYWRkc3RyZWFtJyk7XG4gICAgICAgICAgZXZlbnQuc3RyZWFtID0gc3RyZWFtO1xuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcGMuX2Rpc3BhdGNoRXZlbnQoJ2FkZHN0cmVhbScsIGV2ZW50KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlY2VpdmVyTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICB2YXIgdHJhY2sgPSBpdGVtWzBdO1xuICAgICAgICAgIHZhciByZWNlaXZlciA9IGl0ZW1bMV07XG4gICAgICAgICAgaWYgKHN0cmVhbS5pZCAhPT0gaXRlbVsyXS5pZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmaXJlQWRkVHJhY2socGMsIHRyYWNrLCByZWNlaXZlciwgW3N0cmVhbV0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZWNlaXZlckxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBmaXJlQWRkVHJhY2socGMsIGl0ZW1bMF0sIGl0ZW1bMV0sIFtdKTtcbiAgICB9KTtcblxuICAgIC8vIGNoZWNrIHdoZXRoZXIgYWRkSWNlQ2FuZGlkYXRlKHt9KSB3YXMgY2FsbGVkIHdpdGhpbiBmb3VyIHNlY29uZHMgYWZ0ZXJcbiAgICAvLyBzZXRSZW1vdGVEZXNjcmlwdGlvbi5cbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGlmICghKHBjICYmIHBjLnRyYW5zY2VpdmVycykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydCAmJlxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LnN0YXRlID09PSAnbmV3JyAmJlxuICAgICAgICAgICAgdHJhbnNjZWl2ZXIuaWNlVHJhbnNwb3J0LmdldFJlbW90ZUNhbmRpZGF0ZXMoKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdUaW1lb3V0IGZvciBhZGRSZW1vdGVDYW5kaWRhdGUuIENvbnNpZGVyIHNlbmRpbmcgJyArXG4gICAgICAgICAgICAgICdhbiBlbmQtb2YtY2FuZGlkYXRlcyBub3RpZmljYXRpb24nKTtcbiAgICAgICAgICB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuYWRkUmVtb3RlQ2FuZGlkYXRlKHt9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSwgNDAwMCk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH07XG5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgLyogbm90IHlldFxuICAgICAgaWYgKHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyKSB7XG4gICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLmNsb3NlKCk7XG4gICAgICB9XG4gICAgICAqL1xuICAgICAgaWYgKHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydCkge1xuICAgICAgICB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuc3RvcCgpO1xuICAgICAgfVxuICAgICAgaWYgKHRyYW5zY2VpdmVyLmR0bHNUcmFuc3BvcnQpIHtcbiAgICAgICAgdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydC5zdG9wKCk7XG4gICAgICB9XG4gICAgICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgICAgIHRyYW5zY2VpdmVyLnJ0cFNlbmRlci5zdG9wKCk7XG4gICAgICB9XG4gICAgICBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICAgICAgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIuc3RvcCgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8vIEZJWE1FOiBjbGVhbiB1cCB0cmFja3MsIGxvY2FsIHN0cmVhbXMsIHJlbW90ZSBzdHJlYW1zLCBldGNcbiAgICB0aGlzLl9pc0Nsb3NlZCA9IHRydWU7XG4gICAgdGhpcy5fdXBkYXRlU2lnbmFsaW5nU3RhdGUoJ2Nsb3NlZCcpO1xuICB9O1xuXG4gIC8vIFVwZGF0ZSB0aGUgc2lnbmFsaW5nIHN0YXRlLlxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX3VwZGF0ZVNpZ25hbGluZ1N0YXRlID0gZnVuY3Rpb24obmV3U3RhdGUpIHtcbiAgICB0aGlzLnNpZ25hbGluZ1N0YXRlID0gbmV3U3RhdGU7XG4gICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCdzaWduYWxpbmdzdGF0ZWNoYW5nZScpO1xuICAgIHRoaXMuX2Rpc3BhdGNoRXZlbnQoJ3NpZ25hbGluZ3N0YXRlY2hhbmdlJywgZXZlbnQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIHRvIGZpcmUgdGhlIG5lZ290aWF0aW9ubmVlZGVkIGV2ZW50LlxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuX21heWJlRmlyZU5lZ290aWF0aW9uTmVlZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBjID0gdGhpcztcbiAgICBpZiAodGhpcy5zaWduYWxpbmdTdGF0ZSAhPT0gJ3N0YWJsZScgfHwgdGhpcy5uZWVkTmVnb3RpYXRpb24gPT09IHRydWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5uZWVkTmVnb3RpYXRpb24gPSB0cnVlO1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHBjLm5lZWROZWdvdGlhdGlvbikge1xuICAgICAgICBwYy5uZWVkTmVnb3RpYXRpb24gPSBmYWxzZTtcbiAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCduZWdvdGlhdGlvbm5lZWRlZCcpO1xuICAgICAgICBwYy5fZGlzcGF0Y2hFdmVudCgnbmVnb3RpYXRpb25uZWVkZWQnLCBldmVudCk7XG4gICAgICB9XG4gICAgfSwgMCk7XG4gIH07XG5cbiAgLy8gVXBkYXRlIHRoZSBpY2UgY29ubmVjdGlvbiBzdGF0ZS5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLl91cGRhdGVJY2VDb25uZWN0aW9uU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV3U3RhdGU7XG4gICAgdmFyIHN0YXRlcyA9IHtcbiAgICAgICduZXcnOiAwLFxuICAgICAgY2xvc2VkOiAwLFxuICAgICAgY2hlY2tpbmc6IDAsXG4gICAgICBjb25uZWN0ZWQ6IDAsXG4gICAgICBjb21wbGV0ZWQ6IDAsXG4gICAgICBkaXNjb25uZWN0ZWQ6IDAsXG4gICAgICBmYWlsZWQ6IDBcbiAgICB9O1xuICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgIHN0YXRlc1t0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuc3RhdGVdKys7XG4gICAgfSk7XG5cbiAgICBuZXdTdGF0ZSA9ICduZXcnO1xuICAgIGlmIChzdGF0ZXMuZmFpbGVkID4gMCkge1xuICAgICAgbmV3U3RhdGUgPSAnZmFpbGVkJztcbiAgICB9IGVsc2UgaWYgKHN0YXRlcy5jaGVja2luZyA+IDApIHtcbiAgICAgIG5ld1N0YXRlID0gJ2NoZWNraW5nJztcbiAgICB9IGVsc2UgaWYgKHN0YXRlcy5kaXNjb25uZWN0ZWQgPiAwKSB7XG4gICAgICBuZXdTdGF0ZSA9ICdkaXNjb25uZWN0ZWQnO1xuICAgIH0gZWxzZSBpZiAoc3RhdGVzLm5ldyA+IDApIHtcbiAgICAgIG5ld1N0YXRlID0gJ25ldyc7XG4gICAgfSBlbHNlIGlmIChzdGF0ZXMuY29ubmVjdGVkID4gMCkge1xuICAgICAgbmV3U3RhdGUgPSAnY29ubmVjdGVkJztcbiAgICB9IGVsc2UgaWYgKHN0YXRlcy5jb21wbGV0ZWQgPiAwKSB7XG4gICAgICBuZXdTdGF0ZSA9ICdjb21wbGV0ZWQnO1xuICAgIH1cblxuICAgIGlmIChuZXdTdGF0ZSAhPT0gdGhpcy5pY2VDb25uZWN0aW9uU3RhdGUpIHtcbiAgICAgIHRoaXMuaWNlQ29ubmVjdGlvblN0YXRlID0gbmV3U3RhdGU7XG4gICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2ljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZScpO1xuICAgICAgdGhpcy5fZGlzcGF0Y2hFdmVudCgnaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlJywgZXZlbnQpO1xuICAgIH1cbiAgfTtcblxuICAvLyBVcGRhdGUgdGhlIGNvbm5lY3Rpb24gc3RhdGUuXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5fdXBkYXRlQ29ubmVjdGlvblN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5ld1N0YXRlO1xuICAgIHZhciBzdGF0ZXMgPSB7XG4gICAgICAnbmV3JzogMCxcbiAgICAgIGNsb3NlZDogMCxcbiAgICAgIGNvbm5lY3Rpbmc6IDAsXG4gICAgICBjb25uZWN0ZWQ6IDAsXG4gICAgICBjb21wbGV0ZWQ6IDAsXG4gICAgICBkaXNjb25uZWN0ZWQ6IDAsXG4gICAgICBmYWlsZWQ6IDBcbiAgICB9O1xuICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgIHN0YXRlc1t0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQuc3RhdGVdKys7XG4gICAgICBzdGF0ZXNbdHJhbnNjZWl2ZXIuZHRsc1RyYW5zcG9ydC5zdGF0ZV0rKztcbiAgICB9KTtcbiAgICAvLyBJQ0VUcmFuc3BvcnQuY29tcGxldGVkIGFuZCBjb25uZWN0ZWQgYXJlIHRoZSBzYW1lIGZvciB0aGlzIHB1cnBvc2UuXG4gICAgc3RhdGVzLmNvbm5lY3RlZCArPSBzdGF0ZXMuY29tcGxldGVkO1xuXG4gICAgbmV3U3RhdGUgPSAnbmV3JztcbiAgICBpZiAoc3RhdGVzLmZhaWxlZCA+IDApIHtcbiAgICAgIG5ld1N0YXRlID0gJ2ZhaWxlZCc7XG4gICAgfSBlbHNlIGlmIChzdGF0ZXMuY29ubmVjdGluZyA+IDApIHtcbiAgICAgIG5ld1N0YXRlID0gJ2Nvbm5lY3RpbmcnO1xuICAgIH0gZWxzZSBpZiAoc3RhdGVzLmRpc2Nvbm5lY3RlZCA+IDApIHtcbiAgICAgIG5ld1N0YXRlID0gJ2Rpc2Nvbm5lY3RlZCc7XG4gICAgfSBlbHNlIGlmIChzdGF0ZXMubmV3ID4gMCkge1xuICAgICAgbmV3U3RhdGUgPSAnbmV3JztcbiAgICB9IGVsc2UgaWYgKHN0YXRlcy5jb25uZWN0ZWQgPiAwKSB7XG4gICAgICBuZXdTdGF0ZSA9ICdjb25uZWN0ZWQnO1xuICAgIH1cblxuICAgIGlmIChuZXdTdGF0ZSAhPT0gdGhpcy5jb25uZWN0aW9uU3RhdGUpIHtcbiAgICAgIHRoaXMuY29ubmVjdGlvblN0YXRlID0gbmV3U3RhdGU7XG4gICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2Nvbm5lY3Rpb25zdGF0ZWNoYW5nZScpO1xuICAgICAgdGhpcy5fZGlzcGF0Y2hFdmVudCgnY29ubmVjdGlvbnN0YXRlY2hhbmdlJywgZXZlbnQpO1xuICAgIH1cbiAgfTtcblxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlT2ZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGMgPSB0aGlzO1xuXG4gICAgaWYgKHBjLl9pc0Nsb3NlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG1ha2VFcnJvcignSW52YWxpZFN0YXRlRXJyb3InLFxuICAgICAgICAgICdDYW4gbm90IGNhbGwgY3JlYXRlT2ZmZXIgYWZ0ZXIgY2xvc2UnKSk7XG4gICAgfVxuXG4gICAgdmFyIG51bUF1ZGlvVHJhY2tzID0gcGMudHJhbnNjZWl2ZXJzLmZpbHRlcihmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gdC5raW5kID09PSAnYXVkaW8nO1xuICAgIH0pLmxlbmd0aDtcbiAgICB2YXIgbnVtVmlkZW9UcmFja3MgPSBwYy50cmFuc2NlaXZlcnMuZmlsdGVyKGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiB0LmtpbmQgPT09ICd2aWRlbyc7XG4gICAgfSkubGVuZ3RoO1xuXG4gICAgLy8gRGV0ZXJtaW5lIG51bWJlciBvZiBhdWRpbyBhbmQgdmlkZW8gdHJhY2tzIHdlIG5lZWQgdG8gc2VuZC9yZWN2LlxuICAgIHZhciBvZmZlck9wdGlvbnMgPSBhcmd1bWVudHNbMF07XG4gICAgaWYgKG9mZmVyT3B0aW9ucykge1xuICAgICAgLy8gUmVqZWN0IENocm9tZSBsZWdhY3kgY29uc3RyYWludHMuXG4gICAgICBpZiAob2ZmZXJPcHRpb25zLm1hbmRhdG9yeSB8fCBvZmZlck9wdGlvbnMub3B0aW9uYWwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICdMZWdhY3kgbWFuZGF0b3J5L29wdGlvbmFsIGNvbnN0cmFpbnRzIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICB9XG4gICAgICBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW8gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW8gPT09IHRydWUpIHtcbiAgICAgICAgICBudW1BdWRpb1RyYWNrcyA9IDE7XG4gICAgICAgIH0gZWxzZSBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW8gPT09IGZhbHNlKSB7XG4gICAgICAgICAgbnVtQXVkaW9UcmFja3MgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG51bUF1ZGlvVHJhY2tzID0gb2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW87XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVWaWRlbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVWaWRlbyA9PT0gdHJ1ZSkge1xuICAgICAgICAgIG51bVZpZGVvVHJhY2tzID0gMTtcbiAgICAgICAgfSBlbHNlIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVWaWRlbyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBudW1WaWRlb1RyYWNrcyA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbnVtVmlkZW9UcmFja3MgPSBvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVWaWRlbztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHBjLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICBpZiAodHJhbnNjZWl2ZXIua2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgICBudW1BdWRpb1RyYWNrcy0tO1xuICAgICAgICBpZiAobnVtQXVkaW9UcmFja3MgPCAwKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIud2FudFJlY2VpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0cmFuc2NlaXZlci5raW5kID09PSAndmlkZW8nKSB7XG4gICAgICAgIG51bVZpZGVvVHJhY2tzLS07XG4gICAgICAgIGlmIChudW1WaWRlb1RyYWNrcyA8IDApIHtcbiAgICAgICAgICB0cmFuc2NlaXZlci53YW50UmVjZWl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgTS1saW5lcyBmb3IgcmVjdm9ubHkgc3RyZWFtcy5cbiAgICB3aGlsZSAobnVtQXVkaW9UcmFja3MgPiAwIHx8IG51bVZpZGVvVHJhY2tzID4gMCkge1xuICAgICAgaWYgKG51bUF1ZGlvVHJhY2tzID4gMCkge1xuICAgICAgICBwYy5fY3JlYXRlVHJhbnNjZWl2ZXIoJ2F1ZGlvJyk7XG4gICAgICAgIG51bUF1ZGlvVHJhY2tzLS07XG4gICAgICB9XG4gICAgICBpZiAobnVtVmlkZW9UcmFja3MgPiAwKSB7XG4gICAgICAgIHBjLl9jcmVhdGVUcmFuc2NlaXZlcigndmlkZW8nKTtcbiAgICAgICAgbnVtVmlkZW9UcmFja3MtLTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgc2RwID0gU0RQVXRpbHMud3JpdGVTZXNzaW9uQm9pbGVycGxhdGUocGMuX3NkcFNlc3Npb25JZCxcbiAgICAgICAgcGMuX3NkcFNlc3Npb25WZXJzaW9uKyspO1xuICAgIHBjLnRyYW5zY2VpdmVycy5mb3JFYWNoKGZ1bmN0aW9uKHRyYW5zY2VpdmVyLCBzZHBNTGluZUluZGV4KSB7XG4gICAgICAvLyBGb3IgZWFjaCB0cmFjaywgY3JlYXRlIGFuIGljZSBnYXRoZXJlciwgaWNlIHRyYW5zcG9ydCxcbiAgICAgIC8vIGR0bHMgdHJhbnNwb3J0LCBwb3RlbnRpYWxseSBydHBzZW5kZXIgYW5kIHJ0cHJlY2VpdmVyLlxuICAgICAgdmFyIHRyYWNrID0gdHJhbnNjZWl2ZXIudHJhY2s7XG4gICAgICB2YXIga2luZCA9IHRyYW5zY2VpdmVyLmtpbmQ7XG4gICAgICB2YXIgbWlkID0gdHJhbnNjZWl2ZXIubWlkIHx8IFNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllcigpO1xuICAgICAgdHJhbnNjZWl2ZXIubWlkID0gbWlkO1xuXG4gICAgICBpZiAoIXRyYW5zY2VpdmVyLmljZUdhdGhlcmVyKSB7XG4gICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyID0gcGMuX2NyZWF0ZUljZUdhdGhlcmVyKHNkcE1MaW5lSW5kZXgsXG4gICAgICAgICAgICBwYy51c2luZ0J1bmRsZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBsb2NhbENhcGFiaWxpdGllcyA9IHdpbmRvdy5SVENSdHBTZW5kZXIuZ2V0Q2FwYWJpbGl0aWVzKGtpbmQpO1xuICAgICAgLy8gZmlsdGVyIFJUWCB1bnRpbCBhZGRpdGlvbmFsIHN0dWZmIG5lZWRlZCBmb3IgUlRYIGlzIGltcGxlbWVudGVkXG4gICAgICAvLyBpbiBhZGFwdGVyLmpzXG4gICAgICBpZiAoZWRnZVZlcnNpb24gPCAxNTAxOSkge1xuICAgICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MgPSBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MuZmlsdGVyKFxuICAgICAgICAgICAgZnVuY3Rpb24oY29kZWMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNvZGVjLm5hbWUgIT09ICdydHgnO1xuICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBsb2NhbENhcGFiaWxpdGllcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xuICAgICAgICAvLyB3b3JrIGFyb3VuZCBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3Avd2VicnRjL2lzc3Vlcy9kZXRhaWw/aWQ9NjU1MlxuICAgICAgICAvLyBieSBhZGRpbmcgbGV2ZWwtYXN5bW1ldHJ5LWFsbG93ZWQ9MVxuICAgICAgICBpZiAoY29kZWMubmFtZSA9PT0gJ0gyNjQnICYmXG4gICAgICAgICAgICBjb2RlYy5wYXJhbWV0ZXJzWydsZXZlbC1hc3ltbWV0cnktYWxsb3dlZCddID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjb2RlYy5wYXJhbWV0ZXJzWydsZXZlbC1hc3ltbWV0cnktYWxsb3dlZCddID0gJzEnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZm9yIHN1YnNlcXVlbnQgb2ZmZXJzLCB3ZSBtaWdodCBoYXZlIHRvIHJlLXVzZSB0aGUgcGF5bG9hZFxuICAgICAgICAvLyB0eXBlIG9mIHRoZSBsYXN0IG9mZmVyLlxuICAgICAgICBpZiAodHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzICYmXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXMuY29kZWNzKSB7XG4gICAgICAgICAgdHJhbnNjZWl2ZXIucmVtb3RlQ2FwYWJpbGl0aWVzLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKHJlbW90ZUNvZGVjKSB7XG4gICAgICAgICAgICBpZiAoY29kZWMubmFtZS50b0xvd2VyQ2FzZSgpID09PSByZW1vdGVDb2RlYy5uYW1lLnRvTG93ZXJDYXNlKCkgJiZcbiAgICAgICAgICAgICAgICBjb2RlYy5jbG9ja1JhdGUgPT09IHJlbW90ZUNvZGVjLmNsb2NrUmF0ZSkge1xuICAgICAgICAgICAgICBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSA9IHJlbW90ZUNvZGVjLnBheWxvYWRUeXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGxvY2FsQ2FwYWJpbGl0aWVzLmhlYWRlckV4dGVuc2lvbnMuZm9yRWFjaChmdW5jdGlvbihoZHJFeHQpIHtcbiAgICAgICAgdmFyIHJlbW90ZUV4dGVuc2lvbnMgPSB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXMgJiZcbiAgICAgICAgICAgIHRyYW5zY2VpdmVyLnJlbW90ZUNhcGFiaWxpdGllcy5oZWFkZXJFeHRlbnNpb25zIHx8IFtdO1xuICAgICAgICByZW1vdGVFeHRlbnNpb25zLmZvckVhY2goZnVuY3Rpb24ockhkckV4dCkge1xuICAgICAgICAgIGlmIChoZHJFeHQudXJpID09PSBySGRyRXh0LnVyaSkge1xuICAgICAgICAgICAgaGRyRXh0LmlkID0gckhkckV4dC5pZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIGdlbmVyYXRlIGFuIHNzcmMgbm93LCB0byBiZSB1c2VkIGxhdGVyIGluIHJ0cFNlbmRlci5zZW5kXG4gICAgICB2YXIgc2VuZEVuY29kaW5nUGFyYW1ldGVycyA9IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgfHwgW3tcbiAgICAgICAgc3NyYzogKDIgKiBzZHBNTGluZUluZGV4ICsgMSkgKiAxMDAxXG4gICAgICB9XTtcbiAgICAgIGlmICh0cmFjaykge1xuICAgICAgICAvLyBhZGQgUlRYXG4gICAgICAgIGlmIChlZGdlVmVyc2lvbiA+PSAxNTAxOSAmJiBraW5kID09PSAndmlkZW8nICYmXG4gICAgICAgICAgICAhc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHgpIHtcbiAgICAgICAgICBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eCA9IHtcbiAgICAgICAgICAgIHNzcmM6IHNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArIDFcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0cmFuc2NlaXZlci53YW50UmVjZWl2ZSkge1xuICAgICAgICB0cmFuc2NlaXZlci5ydHBSZWNlaXZlciA9IG5ldyB3aW5kb3cuUlRDUnRwUmVjZWl2ZXIoXG4gICAgICAgICAgICB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LCBraW5kKTtcbiAgICAgIH1cblxuICAgICAgdHJhbnNjZWl2ZXIubG9jYWxDYXBhYmlsaXRpZXMgPSBsb2NhbENhcGFiaWxpdGllcztcbiAgICAgIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnMgPSBzZW5kRW5jb2RpbmdQYXJhbWV0ZXJzO1xuICAgIH0pO1xuXG4gICAgLy8gYWx3YXlzIG9mZmVyIEJVTkRMRSBhbmQgZGlzcG9zZSBvbiByZXR1cm4gaWYgbm90IHN1cHBvcnRlZC5cbiAgICBpZiAocGMuX2NvbmZpZy5idW5kbGVQb2xpY3kgIT09ICdtYXgtY29tcGF0Jykge1xuICAgICAgc2RwICs9ICdhPWdyb3VwOkJVTkRMRSAnICsgcGMudHJhbnNjZWl2ZXJzLm1hcChmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiB0Lm1pZDtcbiAgICAgIH0pLmpvaW4oJyAnKSArICdcXHJcXG4nO1xuICAgIH1cbiAgICBzZHAgKz0gJ2E9aWNlLW9wdGlvbnM6dHJpY2tsZVxcclxcbic7XG5cbiAgICBwYy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlciwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgc2RwICs9IHdyaXRlTWVkaWFTZWN0aW9uKHRyYW5zY2VpdmVyLCB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICAnb2ZmZXInLCB0cmFuc2NlaXZlci5zdHJlYW0sIHBjLl9kdGxzUm9sZSk7XG4gICAgICBzZHAgKz0gJ2E9cnRjcC1yc2l6ZVxcclxcbic7XG5cbiAgICAgIGlmICh0cmFuc2NlaXZlci5pY2VHYXRoZXJlciAmJiBwYy5pY2VHYXRoZXJpbmdTdGF0ZSAhPT0gJ25ldycgJiZcbiAgICAgICAgICAoc2RwTUxpbmVJbmRleCA9PT0gMCB8fCAhcGMudXNpbmdCdW5kbGUpKSB7XG4gICAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLmdldExvY2FsQ2FuZGlkYXRlcygpLmZvckVhY2goZnVuY3Rpb24oY2FuZCkge1xuICAgICAgICAgIGNhbmQuY29tcG9uZW50ID0gMTtcbiAgICAgICAgICBzZHAgKz0gJ2E9JyArIFNEUFV0aWxzLndyaXRlQ2FuZGlkYXRlKGNhbmQpICsgJ1xcclxcbic7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5pY2VHYXRoZXJlci5zdGF0ZSA9PT0gJ2NvbXBsZXRlZCcpIHtcbiAgICAgICAgICBzZHAgKz0gJ2E9ZW5kLW9mLWNhbmRpZGF0ZXNcXHJcXG4nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgZGVzYyA9IG5ldyB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKHtcbiAgICAgIHR5cGU6ICdvZmZlcicsXG4gICAgICBzZHA6IHNkcFxuICAgIH0pO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZGVzYyk7XG4gIH07XG5cbiAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmNyZWF0ZUFuc3dlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYyA9IHRoaXM7XG5cbiAgICBpZiAocGMuX2lzQ2xvc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobWFrZUVycm9yKCdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICAgICAgJ0NhbiBub3QgY2FsbCBjcmVhdGVBbnN3ZXIgYWZ0ZXIgY2xvc2UnKSk7XG4gICAgfVxuXG4gICAgaWYgKCEocGMuc2lnbmFsaW5nU3RhdGUgPT09ICdoYXZlLXJlbW90ZS1vZmZlcicgfHxcbiAgICAgICAgcGMuc2lnbmFsaW5nU3RhdGUgPT09ICdoYXZlLWxvY2FsLXByYW5zd2VyJykpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChtYWtlRXJyb3IoJ0ludmFsaWRTdGF0ZUVycm9yJyxcbiAgICAgICAgICAnQ2FuIG5vdCBjYWxsIGNyZWF0ZUFuc3dlciBpbiBzaWduYWxpbmdTdGF0ZSAnICsgcGMuc2lnbmFsaW5nU3RhdGUpKTtcbiAgICB9XG5cbiAgICB2YXIgc2RwID0gU0RQVXRpbHMud3JpdGVTZXNzaW9uQm9pbGVycGxhdGUocGMuX3NkcFNlc3Npb25JZCxcbiAgICAgICAgcGMuX3NkcFNlc3Npb25WZXJzaW9uKyspO1xuICAgIGlmIChwYy51c2luZ0J1bmRsZSkge1xuICAgICAgc2RwICs9ICdhPWdyb3VwOkJVTkRMRSAnICsgcGMudHJhbnNjZWl2ZXJzLm1hcChmdW5jdGlvbih0KSB7XG4gICAgICAgIHJldHVybiB0Lm1pZDtcbiAgICAgIH0pLmpvaW4oJyAnKSArICdcXHJcXG4nO1xuICAgIH1cbiAgICB2YXIgbWVkaWFTZWN0aW9uc0luT2ZmZXIgPSBTRFBVdGlscy5nZXRNZWRpYVNlY3Rpb25zKFxuICAgICAgICBwYy5yZW1vdGVEZXNjcmlwdGlvbi5zZHApLmxlbmd0aDtcbiAgICBwYy50cmFuc2NlaXZlcnMuZm9yRWFjaChmdW5jdGlvbih0cmFuc2NlaXZlciwgc2RwTUxpbmVJbmRleCkge1xuICAgICAgaWYgKHNkcE1MaW5lSW5kZXggKyAxID4gbWVkaWFTZWN0aW9uc0luT2ZmZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRyYW5zY2VpdmVyLnJlamVjdGVkKSB7XG4gICAgICAgIGlmICh0cmFuc2NlaXZlci5raW5kID09PSAnYXBwbGljYXRpb24nKSB7XG4gICAgICAgICAgc2RwICs9ICdtPWFwcGxpY2F0aW9uIDAgRFRMUy9TQ1RQIDUwMDBcXHJcXG4nO1xuICAgICAgICB9IGVsc2UgaWYgKHRyYW5zY2VpdmVyLmtpbmQgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICBzZHAgKz0gJ209YXVkaW8gMCBVRFAvVExTL1JUUC9TQVZQRiAwXFxyXFxuJyArXG4gICAgICAgICAgICAgICdhPXJ0cG1hcDowIFBDTVUvODAwMFxcclxcbic7XG4gICAgICAgIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIua2luZCA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgIHNkcCArPSAnbT12aWRlbyAwIFVEUC9UTFMvUlRQL1NBVlBGIDEyMFxcclxcbicgK1xuICAgICAgICAgICAgICAnYT1ydHBtYXA6MTIwIFZQOC85MDAwMFxcclxcbic7XG4gICAgICAgIH1cbiAgICAgICAgc2RwICs9ICdjPUlOIElQNCAwLjAuMC4wXFxyXFxuJyArXG4gICAgICAgICAgICAnYT1pbmFjdGl2ZVxcclxcbicgK1xuICAgICAgICAgICAgJ2E9bWlkOicgKyB0cmFuc2NlaXZlci5taWQgKyAnXFxyXFxuJztcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBGSVhNRTogbG9vayBhdCBkaXJlY3Rpb24uXG4gICAgICBpZiAodHJhbnNjZWl2ZXIuc3RyZWFtKSB7XG4gICAgICAgIHZhciBsb2NhbFRyYWNrO1xuICAgICAgICBpZiAodHJhbnNjZWl2ZXIua2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgIGxvY2FsVHJhY2sgPSB0cmFuc2NlaXZlci5zdHJlYW0uZ2V0QXVkaW9UcmFja3MoKVswXTtcbiAgICAgICAgfSBlbHNlIGlmICh0cmFuc2NlaXZlci5raW5kID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgbG9jYWxUcmFjayA9IHRyYW5zY2VpdmVyLnN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb2NhbFRyYWNrKSB7XG4gICAgICAgICAgLy8gYWRkIFJUWFxuICAgICAgICAgIGlmIChlZGdlVmVyc2lvbiA+PSAxNTAxOSAmJiB0cmFuc2NlaXZlci5raW5kID09PSAndmlkZW8nICYmXG4gICAgICAgICAgICAgICF0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eCkge1xuICAgICAgICAgICAgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHggPSB7XG4gICAgICAgICAgICAgIHNzcmM6IHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArIDFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENhbGN1bGF0ZSBpbnRlcnNlY3Rpb24gb2YgY2FwYWJpbGl0aWVzLlxuICAgICAgdmFyIGNvbW1vbkNhcGFiaWxpdGllcyA9IGdldENvbW1vbkNhcGFiaWxpdGllcyhcbiAgICAgICAgICB0cmFuc2NlaXZlci5sb2NhbENhcGFiaWxpdGllcyxcbiAgICAgICAgICB0cmFuc2NlaXZlci5yZW1vdGVDYXBhYmlsaXRpZXMpO1xuXG4gICAgICB2YXIgaGFzUnR4ID0gY29tbW9uQ2FwYWJpbGl0aWVzLmNvZGVjcy5maWx0ZXIoZnVuY3Rpb24oYykge1xuICAgICAgICByZXR1cm4gYy5uYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdydHgnO1xuICAgICAgfSkubGVuZ3RoO1xuICAgICAgaWYgKCFoYXNSdHggJiYgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHgpIHtcbiAgICAgICAgZGVsZXRlIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4O1xuICAgICAgfVxuXG4gICAgICBzZHAgKz0gd3JpdGVNZWRpYVNlY3Rpb24odHJhbnNjZWl2ZXIsIGNvbW1vbkNhcGFiaWxpdGllcyxcbiAgICAgICAgICAnYW5zd2VyJywgdHJhbnNjZWl2ZXIuc3RyZWFtLCBwYy5fZHRsc1JvbGUpO1xuICAgICAgaWYgKHRyYW5zY2VpdmVyLnJ0Y3BQYXJhbWV0ZXJzICYmXG4gICAgICAgICAgdHJhbnNjZWl2ZXIucnRjcFBhcmFtZXRlcnMucmVkdWNlZFNpemUpIHtcbiAgICAgICAgc2RwICs9ICdhPXJ0Y3AtcnNpemVcXHJcXG4nO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIGRlc2MgPSBuZXcgd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICB0eXBlOiAnYW5zd2VyJyxcbiAgICAgIHNkcDogc2RwXG4gICAgfSk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZXNjKTtcbiAgfTtcblxuICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oY2FuZGlkYXRlKSB7XG4gICAgdmFyIHBjID0gdGhpcztcbiAgICB2YXIgc2VjdGlvbnM7XG4gICAgaWYgKGNhbmRpZGF0ZSAmJiAhKGNhbmRpZGF0ZS5zZHBNTGluZUluZGV4ICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgY2FuZGlkYXRlLnNkcE1pZCkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdzZHBNTGluZUluZGV4IG9yIHNkcE1pZCByZXF1aXJlZCcpKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBuZWVkcyB0byBnbyBpbnRvIG9wcyBxdWV1ZS5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBpZiAoIXBjLnJlbW90ZURlc2NyaXB0aW9uKSB7XG4gICAgICAgIHJldHVybiByZWplY3QobWFrZUVycm9yKCdJbnZhbGlkU3RhdGVFcnJvcicsXG4gICAgICAgICAgICAnQ2FuIG5vdCBhZGQgSUNFIGNhbmRpZGF0ZSB3aXRob3V0IGEgcmVtb3RlIGRlc2NyaXB0aW9uJykpO1xuICAgICAgfSBlbHNlIGlmICghY2FuZGlkYXRlIHx8IGNhbmRpZGF0ZS5jYW5kaWRhdGUgPT09ICcnKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGMudHJhbnNjZWl2ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKHBjLnRyYW5zY2VpdmVyc1tqXS5yZWplY3RlZCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBjLnRyYW5zY2VpdmVyc1tqXS5pY2VUcmFuc3BvcnQuYWRkUmVtb3RlQ2FuZGlkYXRlKHt9KTtcbiAgICAgICAgICBzZWN0aW9ucyA9IFNEUFV0aWxzLmdldE1lZGlhU2VjdGlvbnMocGMucmVtb3RlRGVzY3JpcHRpb24uc2RwKTtcbiAgICAgICAgICBzZWN0aW9uc1tqXSArPSAnYT1lbmQtb2YtY2FuZGlkYXRlc1xcclxcbic7XG4gICAgICAgICAgcGMucmVtb3RlRGVzY3JpcHRpb24uc2RwID1cbiAgICAgICAgICAgICAgU0RQVXRpbHMuZ2V0RGVzY3JpcHRpb24ocGMucmVtb3RlRGVzY3JpcHRpb24uc2RwKSArXG4gICAgICAgICAgICAgIHNlY3Rpb25zLmpvaW4oJycpO1xuICAgICAgICAgIGlmIChwYy51c2luZ0J1bmRsZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgc2RwTUxpbmVJbmRleCA9IGNhbmRpZGF0ZS5zZHBNTGluZUluZGV4O1xuICAgICAgICBpZiAoY2FuZGlkYXRlLnNkcE1pZCkge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGMudHJhbnNjZWl2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGMudHJhbnNjZWl2ZXJzW2ldLm1pZCA9PT0gY2FuZGlkYXRlLnNkcE1pZCkge1xuICAgICAgICAgICAgICBzZHBNTGluZUluZGV4ID0gaTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciB0cmFuc2NlaXZlciA9IHBjLnRyYW5zY2VpdmVyc1tzZHBNTGluZUluZGV4XTtcbiAgICAgICAgaWYgKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgICAgaWYgKHRyYW5zY2VpdmVyLnJlamVjdGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgY2FuZCA9IE9iamVjdC5rZXlzKGNhbmRpZGF0ZS5jYW5kaWRhdGUpLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgICBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShjYW5kaWRhdGUuY2FuZGlkYXRlKSA6IHt9O1xuICAgICAgICAgIC8vIElnbm9yZSBDaHJvbWUncyBpbnZhbGlkIGNhbmRpZGF0ZXMgc2luY2UgRWRnZSBkb2VzIG5vdCBsaWtlIHRoZW0uXG4gICAgICAgICAgaWYgKGNhbmQucHJvdG9jb2wgPT09ICd0Y3AnICYmIChjYW5kLnBvcnQgPT09IDAgfHwgY2FuZC5wb3J0ID09PSA5KSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSWdub3JlIFJUQ1AgY2FuZGlkYXRlcywgd2UgYXNzdW1lIFJUQ1AtTVVYLlxuICAgICAgICAgIGlmIChjYW5kLmNvbXBvbmVudCAmJiBjYW5kLmNvbXBvbmVudCAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gd2hlbiB1c2luZyBidW5kbGUsIGF2b2lkIGFkZGluZyBjYW5kaWRhdGVzIHRvIHRoZSB3cm9uZ1xuICAgICAgICAgIC8vIGljZSB0cmFuc3BvcnQuIEFuZCBhdm9pZCBhZGRpbmcgY2FuZGlkYXRlcyBhZGRlZCBpbiB0aGUgU0RQLlxuICAgICAgICAgIGlmIChzZHBNTGluZUluZGV4ID09PSAwIHx8IChzZHBNTGluZUluZGV4ID4gMCAmJlxuICAgICAgICAgICAgICB0cmFuc2NlaXZlci5pY2VUcmFuc3BvcnQgIT09IHBjLnRyYW5zY2VpdmVyc1swXS5pY2VUcmFuc3BvcnQpKSB7XG4gICAgICAgICAgICBpZiAoIW1heWJlQWRkQ2FuZGlkYXRlKHRyYW5zY2VpdmVyLmljZVRyYW5zcG9ydCwgY2FuZCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChtYWtlRXJyb3IoJ09wZXJhdGlvbkVycm9yJyxcbiAgICAgICAgICAgICAgICAgICdDYW4gbm90IGFkZCBJQ0UgY2FuZGlkYXRlJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgcmVtb3RlRGVzY3JpcHRpb24uXG4gICAgICAgICAgdmFyIGNhbmRpZGF0ZVN0cmluZyA9IGNhbmRpZGF0ZS5jYW5kaWRhdGUudHJpbSgpO1xuICAgICAgICAgIGlmIChjYW5kaWRhdGVTdHJpbmcuaW5kZXhPZignYT0nKSA9PT0gMCkge1xuICAgICAgICAgICAgY2FuZGlkYXRlU3RyaW5nID0gY2FuZGlkYXRlU3RyaW5nLnN1YnN0cigyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2VjdGlvbnMgPSBTRFBVdGlscy5nZXRNZWRpYVNlY3Rpb25zKHBjLnJlbW90ZURlc2NyaXB0aW9uLnNkcCk7XG4gICAgICAgICAgc2VjdGlvbnNbc2RwTUxpbmVJbmRleF0gKz0gJ2E9JyArXG4gICAgICAgICAgICAgIChjYW5kLnR5cGUgPyBjYW5kaWRhdGVTdHJpbmcgOiAnZW5kLW9mLWNhbmRpZGF0ZXMnKVxuICAgICAgICAgICAgICArICdcXHJcXG4nO1xuICAgICAgICAgIHBjLnJlbW90ZURlc2NyaXB0aW9uLnNkcCA9XG4gICAgICAgICAgICAgIFNEUFV0aWxzLmdldERlc2NyaXB0aW9uKHBjLnJlbW90ZURlc2NyaXB0aW9uLnNkcCkgK1xuICAgICAgICAgICAgICBzZWN0aW9ucy5qb2luKCcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG1ha2VFcnJvcignT3BlcmF0aW9uRXJyb3InLFxuICAgICAgICAgICAgICAnQ2FuIG5vdCBhZGQgSUNFIGNhbmRpZGF0ZScpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9O1xuXG4gIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRTdGF0cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgIHRoaXMudHJhbnNjZWl2ZXJzLmZvckVhY2goZnVuY3Rpb24odHJhbnNjZWl2ZXIpIHtcbiAgICAgIFsncnRwU2VuZGVyJywgJ3J0cFJlY2VpdmVyJywgJ2ljZUdhdGhlcmVyJywgJ2ljZVRyYW5zcG9ydCcsXG4gICAgICAgICAgJ2R0bHNUcmFuc3BvcnQnXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgICAgaWYgKHRyYW5zY2VpdmVyW21ldGhvZF0pIHtcbiAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCh0cmFuc2NlaXZlclttZXRob2RdLmdldFN0YXRzKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHZhciBmaXhTdGF0c1R5cGUgPSBmdW5jdGlvbihzdGF0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpbmJvdW5kcnRwOiAnaW5ib3VuZC1ydHAnLFxuICAgICAgICBvdXRib3VuZHJ0cDogJ291dGJvdW5kLXJ0cCcsXG4gICAgICAgIGNhbmRpZGF0ZXBhaXI6ICdjYW5kaWRhdGUtcGFpcicsXG4gICAgICAgIGxvY2FsY2FuZGlkYXRlOiAnbG9jYWwtY2FuZGlkYXRlJyxcbiAgICAgICAgcmVtb3RlY2FuZGlkYXRlOiAncmVtb3RlLWNhbmRpZGF0ZSdcbiAgICAgIH1bc3RhdC50eXBlXSB8fCBzdGF0LnR5cGU7XG4gICAgfTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgLy8gc2hpbSBnZXRTdGF0cyB3aXRoIG1hcGxpa2Ugc3VwcG9ydFxuICAgICAgdmFyIHJlc3VsdHMgPSBuZXcgTWFwKCk7XG4gICAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgcmVzLmZvckVhY2goZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgT2JqZWN0LmtleXMocmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICByZXN1bHRbaWRdLnR5cGUgPSBmaXhTdGF0c1R5cGUocmVzdWx0W2lkXSk7XG4gICAgICAgICAgICByZXN1bHRzLnNldChpZCwgcmVzdWx0W2lkXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gbGVnYWN5IGNhbGxiYWNrIHNoaW1zLiBTaG91bGQgYmUgbW92ZWQgdG8gYWRhcHRlci5qcyBzb21lIGRheXMuXG4gIHZhciBtZXRob2RzID0gWydjcmVhdGVPZmZlcicsICdjcmVhdGVBbnN3ZXInXTtcbiAgbWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIHZhciBuYXRpdmVNZXRob2QgPSBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICBSVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdmdW5jdGlvbicgfHxcbiAgICAgICAgICB0eXBlb2YgYXJnc1sxXSA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBsZWdhY3lcbiAgICAgICAgcmV0dXJuIG5hdGl2ZU1ldGhvZC5hcHBseSh0aGlzLCBbYXJndW1lbnRzWzJdXSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGFyZ3NbMF0uYXBwbHkobnVsbCwgW2Rlc2NyaXB0aW9uXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGlmICh0eXBlb2YgYXJnc1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgYXJnc1sxXS5hcHBseShudWxsLCBbZXJyb3JdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hdGl2ZU1ldGhvZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH0pO1xuXG4gIG1ldGhvZHMgPSBbJ3NldExvY2FsRGVzY3JpcHRpb24nLCAnc2V0UmVtb3RlRGVzY3JpcHRpb24nLCAnYWRkSWNlQ2FuZGlkYXRlJ107XG4gIG1ldGhvZHMuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICB2YXIgbmF0aXZlTWV0aG9kID0gUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF07XG4gICAgUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHR5cGVvZiBhcmdzWzFdID09PSAnZnVuY3Rpb24nIHx8XG4gICAgICAgICAgdHlwZW9mIGFyZ3NbMl0gPT09ICdmdW5jdGlvbicpIHsgLy8gbGVnYWN5XG4gICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGFyZ3NbMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGFyZ3NbMV0uYXBwbHkobnVsbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGlmICh0eXBlb2YgYXJnc1syXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgYXJnc1syXS5hcHBseShudWxsLCBbZXJyb3JdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hdGl2ZU1ldGhvZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIGdldFN0YXRzIGlzIHNwZWNpYWwuIEl0IGRvZXNuJ3QgaGF2ZSBhIHNwZWMgbGVnYWN5IG1ldGhvZCB5ZXQgd2Ugc3VwcG9ydFxuICAvLyBnZXRTdGF0cyhzb21ldGhpbmcsIGNiKSB3aXRob3V0IGVycm9yIGNhbGxiYWNrcy5cbiAgWydnZXRTdGF0cyddLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgdmFyIG5hdGl2ZU1ldGhvZCA9IFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xuICAgIFJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmICh0eXBlb2YgYXJnc1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBhcmdzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBhcmdzWzFdLmFwcGx5KG51bGwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfSk7XG5cbiAgcmV0dXJuIFJUQ1BlZXJDb25uZWN0aW9uO1xufTtcblxufSx7XCJzZHBcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbi8vIFNEUCBoZWxwZXJzLlxudmFyIFNEUFV0aWxzID0ge307XG5cbi8vIEdlbmVyYXRlIGFuIGFscGhhbnVtZXJpYyBpZGVudGlmaWVyIGZvciBjbmFtZSBvciBtaWRzLlxuLy8gVE9ETzogdXNlIFVVSURzIGluc3RlYWQ/IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2plZC85ODI4ODNcblNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDEwKTtcbn07XG5cbi8vIFRoZSBSVENQIENOQU1FIHVzZWQgYnkgYWxsIHBlZXJjb25uZWN0aW9ucyBmcm9tIHRoZSBzYW1lIEpTLlxuU0RQVXRpbHMubG9jYWxDTmFtZSA9IFNEUFV0aWxzLmdlbmVyYXRlSWRlbnRpZmllcigpO1xuXG4vLyBTcGxpdHMgU0RQIGludG8gbGluZXMsIGRlYWxpbmcgd2l0aCBib3RoIENSTEYgYW5kIExGLlxuU0RQVXRpbHMuc3BsaXRMaW5lcyA9IGZ1bmN0aW9uKGJsb2IpIHtcbiAgcmV0dXJuIGJsb2IudHJpbSgpLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiBsaW5lLnRyaW0oKTtcbiAgfSk7XG59O1xuLy8gU3BsaXRzIFNEUCBpbnRvIHNlc3Npb25wYXJ0IGFuZCBtZWRpYXNlY3Rpb25zLiBFbnN1cmVzIENSTEYuXG5TRFBVdGlscy5zcGxpdFNlY3Rpb25zID0gZnVuY3Rpb24oYmxvYikge1xuICB2YXIgcGFydHMgPSBibG9iLnNwbGl0KCdcXG5tPScpO1xuICByZXR1cm4gcGFydHMubWFwKGZ1bmN0aW9uKHBhcnQsIGluZGV4KSB7XG4gICAgcmV0dXJuIChpbmRleCA+IDAgPyAnbT0nICsgcGFydCA6IHBhcnQpLnRyaW0oKSArICdcXHJcXG4nO1xuICB9KTtcbn07XG5cbi8vIHJldHVybnMgdGhlIHNlc3Npb24gZGVzY3JpcHRpb24uXG5TRFBVdGlscy5nZXREZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKGJsb2IpIHtcbiAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhibG9iKTtcbiAgcmV0dXJuIHNlY3Rpb25zICYmIHNlY3Rpb25zWzBdO1xufTtcblxuLy8gcmV0dXJucyB0aGUgaW5kaXZpZHVhbCBtZWRpYSBzZWN0aW9ucy5cblNEUFV0aWxzLmdldE1lZGlhU2VjdGlvbnMgPSBmdW5jdGlvbihibG9iKSB7XG4gIHZhciBzZWN0aW9ucyA9IFNEUFV0aWxzLnNwbGl0U2VjdGlvbnMoYmxvYik7XG4gIHNlY3Rpb25zLnNoaWZ0KCk7XG4gIHJldHVybiBzZWN0aW9ucztcbn07XG5cbi8vIFJldHVybnMgbGluZXMgdGhhdCBzdGFydCB3aXRoIGEgY2VydGFpbiBwcmVmaXguXG5TRFBVdGlscy5tYXRjaFByZWZpeCA9IGZ1bmN0aW9uKGJsb2IsIHByZWZpeCkge1xuICByZXR1cm4gU0RQVXRpbHMuc3BsaXRMaW5lcyhibG9iKS5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiBsaW5lLmluZGV4T2YocHJlZml4KSA9PT0gMDtcbiAgfSk7XG59O1xuXG4vLyBQYXJzZXMgYW4gSUNFIGNhbmRpZGF0ZSBsaW5lLiBTYW1wbGUgaW5wdXQ6XG4vLyBjYW5kaWRhdGU6NzAyNzg2MzUwIDIgdWRwIDQxODE5OTAyIDguOC44LjggNjA3NjkgdHlwIHJlbGF5IHJhZGRyIDguOC44Ljhcbi8vIHJwb3J0IDU1OTk2XCJcblNEUFV0aWxzLnBhcnNlQ2FuZGlkYXRlID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHM7XG4gIC8vIFBhcnNlIGJvdGggdmFyaWFudHMuXG4gIGlmIChsaW5lLmluZGV4T2YoJ2E9Y2FuZGlkYXRlOicpID09PSAwKSB7XG4gICAgcGFydHMgPSBsaW5lLnN1YnN0cmluZygxMikuc3BsaXQoJyAnKTtcbiAgfSBlbHNlIHtcbiAgICBwYXJ0cyA9IGxpbmUuc3Vic3RyaW5nKDEwKS5zcGxpdCgnICcpO1xuICB9XG5cbiAgdmFyIGNhbmRpZGF0ZSA9IHtcbiAgICBmb3VuZGF0aW9uOiBwYXJ0c1swXSxcbiAgICBjb21wb25lbnQ6IHBhcnNlSW50KHBhcnRzWzFdLCAxMCksXG4gICAgcHJvdG9jb2w6IHBhcnRzWzJdLnRvTG93ZXJDYXNlKCksXG4gICAgcHJpb3JpdHk6IHBhcnNlSW50KHBhcnRzWzNdLCAxMCksXG4gICAgaXA6IHBhcnRzWzRdLFxuICAgIHBvcnQ6IHBhcnNlSW50KHBhcnRzWzVdLCAxMCksXG4gICAgLy8gc2tpcCBwYXJ0c1s2XSA9PSAndHlwJ1xuICAgIHR5cGU6IHBhcnRzWzddXG4gIH07XG5cbiAgZm9yICh2YXIgaSA9IDg7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHN3aXRjaCAocGFydHNbaV0pIHtcbiAgICAgIGNhc2UgJ3JhZGRyJzpcbiAgICAgICAgY2FuZGlkYXRlLnJlbGF0ZWRBZGRyZXNzID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Jwb3J0JzpcbiAgICAgICAgY2FuZGlkYXRlLnJlbGF0ZWRQb3J0ID0gcGFyc2VJbnQocGFydHNbaSArIDFdLCAxMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndGNwdHlwZSc6XG4gICAgICAgIGNhbmRpZGF0ZS50Y3BUeXBlID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3VmcmFnJzpcbiAgICAgICAgY2FuZGlkYXRlLnVmcmFnID0gcGFydHNbaSArIDFdOyAvLyBmb3IgYmFja3dhcmQgY29tcGFiaWxpdHkuXG4gICAgICAgIGNhbmRpZGF0ZS51c2VybmFtZUZyYWdtZW50ID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IC8vIGV4dGVuc2lvbiBoYW5kbGluZywgaW4gcGFydGljdWxhciB1ZnJhZ1xuICAgICAgICBjYW5kaWRhdGVbcGFydHNbaV1dID0gcGFydHNbaSArIDFdO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNhbmRpZGF0ZTtcbn07XG5cbi8vIFRyYW5zbGF0ZXMgYSBjYW5kaWRhdGUgb2JqZWN0IGludG8gU0RQIGNhbmRpZGF0ZSBhdHRyaWJ1dGUuXG5TRFBVdGlscy53cml0ZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGNhbmRpZGF0ZSkge1xuICB2YXIgc2RwID0gW107XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5mb3VuZGF0aW9uKTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmNvbXBvbmVudCk7XG4gIHNkcC5wdXNoKGNhbmRpZGF0ZS5wcm90b2NvbC50b1VwcGVyQ2FzZSgpKTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnByaW9yaXR5KTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLmlwKTtcbiAgc2RwLnB1c2goY2FuZGlkYXRlLnBvcnQpO1xuXG4gIHZhciB0eXBlID0gY2FuZGlkYXRlLnR5cGU7XG4gIHNkcC5wdXNoKCd0eXAnKTtcbiAgc2RwLnB1c2godHlwZSk7XG4gIGlmICh0eXBlICE9PSAnaG9zdCcgJiYgY2FuZGlkYXRlLnJlbGF0ZWRBZGRyZXNzICYmXG4gICAgICBjYW5kaWRhdGUucmVsYXRlZFBvcnQpIHtcbiAgICBzZHAucHVzaCgncmFkZHInKTtcbiAgICBzZHAucHVzaChjYW5kaWRhdGUucmVsYXRlZEFkZHJlc3MpOyAvLyB3YXM6IHJlbEFkZHJcbiAgICBzZHAucHVzaCgncnBvcnQnKTtcbiAgICBzZHAucHVzaChjYW5kaWRhdGUucmVsYXRlZFBvcnQpOyAvLyB3YXM6IHJlbFBvcnRcbiAgfVxuICBpZiAoY2FuZGlkYXRlLnRjcFR5cGUgJiYgY2FuZGlkYXRlLnByb3RvY29sLnRvTG93ZXJDYXNlKCkgPT09ICd0Y3AnKSB7XG4gICAgc2RwLnB1c2goJ3RjcHR5cGUnKTtcbiAgICBzZHAucHVzaChjYW5kaWRhdGUudGNwVHlwZSk7XG4gIH1cbiAgaWYgKGNhbmRpZGF0ZS51c2VybmFtZUZyYWdtZW50IHx8IGNhbmRpZGF0ZS51ZnJhZykge1xuICAgIHNkcC5wdXNoKCd1ZnJhZycpO1xuICAgIHNkcC5wdXNoKGNhbmRpZGF0ZS51c2VybmFtZUZyYWdtZW50IHx8IGNhbmRpZGF0ZS51ZnJhZyk7XG4gIH1cbiAgcmV0dXJuICdjYW5kaWRhdGU6JyArIHNkcC5qb2luKCcgJyk7XG59O1xuXG4vLyBQYXJzZXMgYW4gaWNlLW9wdGlvbnMgbGluZSwgcmV0dXJucyBhbiBhcnJheSBvZiBvcHRpb24gdGFncy5cbi8vIGE9aWNlLW9wdGlvbnM6Zm9vIGJhclxuU0RQVXRpbHMucGFyc2VJY2VPcHRpb25zID0gZnVuY3Rpb24obGluZSkge1xuICByZXR1cm4gbGluZS5zdWJzdHIoMTQpLnNwbGl0KCcgJyk7XG59XG5cbi8vIFBhcnNlcyBhbiBydHBtYXAgbGluZSwgcmV0dXJucyBSVENSdHBDb2RkZWNQYXJhbWV0ZXJzLiBTYW1wbGUgaW5wdXQ6XG4vLyBhPXJ0cG1hcDoxMTEgb3B1cy80ODAwMC8yXG5TRFBVdGlscy5wYXJzZVJ0cE1hcCA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIoOSkuc3BsaXQoJyAnKTtcbiAgdmFyIHBhcnNlZCA9IHtcbiAgICBwYXlsb2FkVHlwZTogcGFyc2VJbnQocGFydHMuc2hpZnQoKSwgMTApIC8vIHdhczogaWRcbiAgfTtcblxuICBwYXJ0cyA9IHBhcnRzWzBdLnNwbGl0KCcvJyk7XG5cbiAgcGFyc2VkLm5hbWUgPSBwYXJ0c1swXTtcbiAgcGFyc2VkLmNsb2NrUmF0ZSA9IHBhcnNlSW50KHBhcnRzWzFdLCAxMCk7IC8vIHdhczogY2xvY2tyYXRlXG4gIC8vIHdhczogY2hhbm5lbHNcbiAgcGFyc2VkLm51bUNoYW5uZWxzID0gcGFydHMubGVuZ3RoID09PSAzID8gcGFyc2VJbnQocGFydHNbMl0sIDEwKSA6IDE7XG4gIHJldHVybiBwYXJzZWQ7XG59O1xuXG4vLyBHZW5lcmF0ZSBhbiBhPXJ0cG1hcCBsaW5lIGZyb20gUlRDUnRwQ29kZWNDYXBhYmlsaXR5IG9yXG4vLyBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0cE1hcCA9IGZ1bmN0aW9uKGNvZGVjKSB7XG4gIHZhciBwdCA9IGNvZGVjLnBheWxvYWRUeXBlO1xuICBpZiAoY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHB0ID0gY29kZWMucHJlZmVycmVkUGF5bG9hZFR5cGU7XG4gIH1cbiAgcmV0dXJuICdhPXJ0cG1hcDonICsgcHQgKyAnICcgKyBjb2RlYy5uYW1lICsgJy8nICsgY29kZWMuY2xvY2tSYXRlICtcbiAgICAgIChjb2RlYy5udW1DaGFubmVscyAhPT0gMSA/ICcvJyArIGNvZGVjLm51bUNoYW5uZWxzIDogJycpICsgJ1xcclxcbic7XG59O1xuXG4vLyBQYXJzZXMgYW4gYT1leHRtYXAgbGluZSAoaGVhZGVyZXh0ZW5zaW9uIGZyb20gUkZDIDUyODUpLiBTYW1wbGUgaW5wdXQ6XG4vLyBhPWV4dG1hcDoyIHVybjppZXRmOnBhcmFtczpydHAtaGRyZXh0OnRvZmZzZXRcbi8vIGE9ZXh0bWFwOjIvc2VuZG9ubHkgdXJuOmlldGY6cGFyYW1zOnJ0cC1oZHJleHQ6dG9mZnNldFxuU0RQVXRpbHMucGFyc2VFeHRtYXAgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBwYXJ0cyA9IGxpbmUuc3Vic3RyKDkpLnNwbGl0KCcgJyk7XG4gIHJldHVybiB7XG4gICAgaWQ6IHBhcnNlSW50KHBhcnRzWzBdLCAxMCksXG4gICAgZGlyZWN0aW9uOiBwYXJ0c1swXS5pbmRleE9mKCcvJykgPiAwID8gcGFydHNbMF0uc3BsaXQoJy8nKVsxXSA6ICdzZW5kcmVjdicsXG4gICAgdXJpOiBwYXJ0c1sxXVxuICB9O1xufTtcblxuLy8gR2VuZXJhdGVzIGE9ZXh0bWFwIGxpbmUgZnJvbSBSVENSdHBIZWFkZXJFeHRlbnNpb25QYXJhbWV0ZXJzIG9yXG4vLyBSVENSdHBIZWFkZXJFeHRlbnNpb24uXG5TRFBVdGlscy53cml0ZUV4dG1hcCA9IGZ1bmN0aW9uKGhlYWRlckV4dGVuc2lvbikge1xuICByZXR1cm4gJ2E9ZXh0bWFwOicgKyAoaGVhZGVyRXh0ZW5zaW9uLmlkIHx8IGhlYWRlckV4dGVuc2lvbi5wcmVmZXJyZWRJZCkgK1xuICAgICAgKGhlYWRlckV4dGVuc2lvbi5kaXJlY3Rpb24gJiYgaGVhZGVyRXh0ZW5zaW9uLmRpcmVjdGlvbiAhPT0gJ3NlbmRyZWN2J1xuICAgICAgICAgID8gJy8nICsgaGVhZGVyRXh0ZW5zaW9uLmRpcmVjdGlvblxuICAgICAgICAgIDogJycpICtcbiAgICAgICcgJyArIGhlYWRlckV4dGVuc2lvbi51cmkgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyBhbiBmdG1wIGxpbmUsIHJldHVybnMgZGljdGlvbmFyeS4gU2FtcGxlIGlucHV0OlxuLy8gYT1mbXRwOjk2IHZicj1vbjtjbmc9b25cbi8vIEFsc28gZGVhbHMgd2l0aCB2YnI9b247IGNuZz1vblxuU0RQVXRpbHMucGFyc2VGbXRwID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrdjtcbiAgdmFyIHBhcnRzID0gbGluZS5zdWJzdHIobGluZS5pbmRleE9mKCcgJykgKyAxKS5zcGxpdCgnOycpO1xuICBmb3IgKHZhciBqID0gMDsgaiA8IHBhcnRzLmxlbmd0aDsgaisrKSB7XG4gICAga3YgPSBwYXJ0c1tqXS50cmltKCkuc3BsaXQoJz0nKTtcbiAgICBwYXJzZWRba3ZbMF0udHJpbSgpXSA9IGt2WzFdO1xuICB9XG4gIHJldHVybiBwYXJzZWQ7XG59O1xuXG4vLyBHZW5lcmF0ZXMgYW4gYT1mdG1wIGxpbmUgZnJvbSBSVENSdHBDb2RlY0NhcGFiaWxpdHkgb3IgUlRDUnRwQ29kZWNQYXJhbWV0ZXJzLlxuU0RQVXRpbHMud3JpdGVGbXRwID0gZnVuY3Rpb24oY29kZWMpIHtcbiAgdmFyIGxpbmUgPSAnJztcbiAgdmFyIHB0ID0gY29kZWMucGF5bG9hZFR5cGU7XG4gIGlmIChjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcHQgPSBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgfVxuICBpZiAoY29kZWMucGFyYW1ldGVycyAmJiBPYmplY3Qua2V5cyhjb2RlYy5wYXJhbWV0ZXJzKS5sZW5ndGgpIHtcbiAgICB2YXIgcGFyYW1zID0gW107XG4gICAgT2JqZWN0LmtleXMoY29kZWMucGFyYW1ldGVycykuZm9yRWFjaChmdW5jdGlvbihwYXJhbSkge1xuICAgICAgcGFyYW1zLnB1c2gocGFyYW0gKyAnPScgKyBjb2RlYy5wYXJhbWV0ZXJzW3BhcmFtXSk7XG4gICAgfSk7XG4gICAgbGluZSArPSAnYT1mbXRwOicgKyBwdCArICcgJyArIHBhcmFtcy5qb2luKCc7JykgKyAnXFxyXFxuJztcbiAgfVxuICByZXR1cm4gbGluZTtcbn07XG5cbi8vIFBhcnNlcyBhbiBydGNwLWZiIGxpbmUsIHJldHVybnMgUlRDUFJ0Y3BGZWVkYmFjayBvYmplY3QuIFNhbXBsZSBpbnB1dDpcbi8vIGE9cnRjcC1mYjo5OCBuYWNrIHJwc2lcblNEUFV0aWxzLnBhcnNlUnRjcEZiID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cihsaW5lLmluZGV4T2YoJyAnKSArIDEpLnNwbGl0KCcgJyk7XG4gIHJldHVybiB7XG4gICAgdHlwZTogcGFydHMuc2hpZnQoKSxcbiAgICBwYXJhbWV0ZXI6IHBhcnRzLmpvaW4oJyAnKVxuICB9O1xufTtcbi8vIEdlbmVyYXRlIGE9cnRjcC1mYiBsaW5lcyBmcm9tIFJUQ1J0cENvZGVjQ2FwYWJpbGl0eSBvciBSVENSdHBDb2RlY1BhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0Y3BGYiA9IGZ1bmN0aW9uKGNvZGVjKSB7XG4gIHZhciBsaW5lcyA9ICcnO1xuICB2YXIgcHQgPSBjb2RlYy5wYXlsb2FkVHlwZTtcbiAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICBwdCA9IGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlO1xuICB9XG4gIGlmIChjb2RlYy5ydGNwRmVlZGJhY2sgJiYgY29kZWMucnRjcEZlZWRiYWNrLmxlbmd0aCkge1xuICAgIC8vIEZJWE1FOiBzcGVjaWFsIGhhbmRsaW5nIGZvciB0cnItaW50P1xuICAgIGNvZGVjLnJ0Y3BGZWVkYmFjay5mb3JFYWNoKGZ1bmN0aW9uKGZiKSB7XG4gICAgICBsaW5lcyArPSAnYT1ydGNwLWZiOicgKyBwdCArICcgJyArIGZiLnR5cGUgK1xuICAgICAgKGZiLnBhcmFtZXRlciAmJiBmYi5wYXJhbWV0ZXIubGVuZ3RoID8gJyAnICsgZmIucGFyYW1ldGVyIDogJycpICtcbiAgICAgICAgICAnXFxyXFxuJztcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gbGluZXM7XG59O1xuXG4vLyBQYXJzZXMgYW4gUkZDIDU1NzYgc3NyYyBtZWRpYSBhdHRyaWJ1dGUuIFNhbXBsZSBpbnB1dDpcbi8vIGE9c3NyYzozNzM1OTI4NTU5IGNuYW1lOnNvbWV0aGluZ1xuU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEgPSBmdW5jdGlvbihsaW5lKSB7XG4gIHZhciBzcCA9IGxpbmUuaW5kZXhPZignICcpO1xuICB2YXIgcGFydHMgPSB7XG4gICAgc3NyYzogcGFyc2VJbnQobGluZS5zdWJzdHIoNywgc3AgLSA3KSwgMTApXG4gIH07XG4gIHZhciBjb2xvbiA9IGxpbmUuaW5kZXhPZignOicsIHNwKTtcbiAgaWYgKGNvbG9uID4gLTEpIHtcbiAgICBwYXJ0cy5hdHRyaWJ1dGUgPSBsaW5lLnN1YnN0cihzcCArIDEsIGNvbG9uIC0gc3AgLSAxKTtcbiAgICBwYXJ0cy52YWx1ZSA9IGxpbmUuc3Vic3RyKGNvbG9uICsgMSk7XG4gIH0gZWxzZSB7XG4gICAgcGFydHMuYXR0cmlidXRlID0gbGluZS5zdWJzdHIoc3AgKyAxKTtcbiAgfVxuICByZXR1cm4gcGFydHM7XG59O1xuXG4vLyBFeHRyYWN0cyB0aGUgTUlEIChSRkMgNTg4OCkgZnJvbSBhIG1lZGlhIHNlY3Rpb24uXG4vLyByZXR1cm5zIHRoZSBNSUQgb3IgdW5kZWZpbmVkIGlmIG5vIG1pZCBsaW5lIHdhcyBmb3VuZC5cblNEUFV0aWxzLmdldE1pZCA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgbWlkID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1taWQ6JylbMF07XG4gIGlmIChtaWQpIHtcbiAgICByZXR1cm4gbWlkLnN1YnN0cig2KTtcbiAgfVxufVxuXG5TRFBVdGlscy5wYXJzZUZpbmdlcnByaW50ID0gZnVuY3Rpb24obGluZSkge1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cigxNCkuc3BsaXQoJyAnKTtcbiAgcmV0dXJuIHtcbiAgICBhbGdvcml0aG06IHBhcnRzWzBdLnRvTG93ZXJDYXNlKCksIC8vIGFsZ29yaXRobSBpcyBjYXNlLXNlbnNpdGl2ZSBpbiBFZGdlLlxuICAgIHZhbHVlOiBwYXJ0c1sxXVxuICB9O1xufTtcblxuLy8gRXh0cmFjdHMgRFRMUyBwYXJhbWV0ZXJzIGZyb20gU0RQIG1lZGlhIHNlY3Rpb24gb3Igc2Vzc2lvbnBhcnQuXG4vLyBGSVhNRTogZm9yIGNvbnNpc3RlbmN5IHdpdGggb3RoZXIgZnVuY3Rpb25zIHRoaXMgc2hvdWxkIG9ubHlcbi8vICAgZ2V0IHRoZSBmaW5nZXJwcmludCBsaW5lIGFzIGlucHV0LiBTZWUgYWxzbyBnZXRJY2VQYXJhbWV0ZXJzLlxuU0RQVXRpbHMuZ2V0RHRsc1BhcmFtZXRlcnMgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiArIHNlc3Npb25wYXJ0LFxuICAgICAgJ2E9ZmluZ2VycHJpbnQ6Jyk7XG4gIC8vIE5vdGU6IGE9c2V0dXAgbGluZSBpcyBpZ25vcmVkIHNpbmNlIHdlIHVzZSB0aGUgJ2F1dG8nIHJvbGUuXG4gIC8vIE5vdGUyOiAnYWxnb3JpdGhtJyBpcyBub3QgY2FzZSBzZW5zaXRpdmUgZXhjZXB0IGluIEVkZ2UuXG4gIHJldHVybiB7XG4gICAgcm9sZTogJ2F1dG8nLFxuICAgIGZpbmdlcnByaW50czogbGluZXMubWFwKFNEUFV0aWxzLnBhcnNlRmluZ2VycHJpbnQpXG4gIH07XG59O1xuXG4vLyBTZXJpYWxpemVzIERUTFMgcGFyYW1ldGVycyB0byBTRFAuXG5TRFBVdGlscy53cml0ZUR0bHNQYXJhbWV0ZXJzID0gZnVuY3Rpb24ocGFyYW1zLCBzZXR1cFR5cGUpIHtcbiAgdmFyIHNkcCA9ICdhPXNldHVwOicgKyBzZXR1cFR5cGUgKyAnXFxyXFxuJztcbiAgcGFyYW1zLmZpbmdlcnByaW50cy5mb3JFYWNoKGZ1bmN0aW9uKGZwKSB7XG4gICAgc2RwICs9ICdhPWZpbmdlcnByaW50OicgKyBmcC5hbGdvcml0aG0gKyAnICcgKyBmcC52YWx1ZSArICdcXHJcXG4nO1xuICB9KTtcbiAgcmV0dXJuIHNkcDtcbn07XG4vLyBQYXJzZXMgSUNFIGluZm9ybWF0aW9uIGZyb20gU0RQIG1lZGlhIHNlY3Rpb24gb3Igc2Vzc2lvbnBhcnQuXG4vLyBGSVhNRTogZm9yIGNvbnNpc3RlbmN5IHdpdGggb3RoZXIgZnVuY3Rpb25zIHRoaXMgc2hvdWxkIG9ubHlcbi8vICAgZ2V0IHRoZSBpY2UtdWZyYWcgYW5kIGljZS1wd2QgbGluZXMgYXMgaW5wdXQuXG5TRFBVdGlscy5nZXRJY2VQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uLCBzZXNzaW9ucGFydCkge1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIC8vIFNlYXJjaCBpbiBzZXNzaW9uIHBhcnQsIHRvby5cbiAgbGluZXMgPSBsaW5lcy5jb25jYXQoU0RQVXRpbHMuc3BsaXRMaW5lcyhzZXNzaW9ucGFydCkpO1xuICB2YXIgaWNlUGFyYW1ldGVycyA9IHtcbiAgICB1c2VybmFtZUZyYWdtZW50OiBsaW5lcy5maWx0ZXIoZnVuY3Rpb24obGluZSkge1xuICAgICAgcmV0dXJuIGxpbmUuaW5kZXhPZignYT1pY2UtdWZyYWc6JykgPT09IDA7XG4gICAgfSlbMF0uc3Vic3RyKDEyKSxcbiAgICBwYXNzd29yZDogbGluZXMuZmlsdGVyKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHJldHVybiBsaW5lLmluZGV4T2YoJ2E9aWNlLXB3ZDonKSA9PT0gMDtcbiAgICB9KVswXS5zdWJzdHIoMTApXG4gIH07XG4gIHJldHVybiBpY2VQYXJhbWV0ZXJzO1xufTtcblxuLy8gU2VyaWFsaXplcyBJQ0UgcGFyYW1ldGVycyB0byBTRFAuXG5TRFBVdGlscy53cml0ZUljZVBhcmFtZXRlcnMgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgcmV0dXJuICdhPWljZS11ZnJhZzonICsgcGFyYW1zLnVzZXJuYW1lRnJhZ21lbnQgKyAnXFxyXFxuJyArXG4gICAgICAnYT1pY2UtcHdkOicgKyBwYXJhbXMucGFzc3dvcmQgKyAnXFxyXFxuJztcbn07XG5cbi8vIFBhcnNlcyB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gYW5kIHJldHVybnMgUlRDUnRwUGFyYW1ldGVycy5cblNEUFV0aWxzLnBhcnNlUnRwUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgZGVzY3JpcHRpb24gPSB7XG4gICAgY29kZWNzOiBbXSxcbiAgICBoZWFkZXJFeHRlbnNpb25zOiBbXSxcbiAgICBmZWNNZWNoYW5pc21zOiBbXSxcbiAgICBydGNwOiBbXVxuICB9O1xuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIHZhciBtbGluZSA9IGxpbmVzWzBdLnNwbGl0KCcgJyk7XG4gIGZvciAodmFyIGkgPSAzOyBpIDwgbWxpbmUubGVuZ3RoOyBpKyspIHsgLy8gZmluZCBhbGwgY29kZWNzIGZyb20gbWxpbmVbMy4uXVxuICAgIHZhciBwdCA9IG1saW5lW2ldO1xuICAgIHZhciBydHBtYXBsaW5lID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgIG1lZGlhU2VjdGlvbiwgJ2E9cnRwbWFwOicgKyBwdCArICcgJylbMF07XG4gICAgaWYgKHJ0cG1hcGxpbmUpIHtcbiAgICAgIHZhciBjb2RlYyA9IFNEUFV0aWxzLnBhcnNlUnRwTWFwKHJ0cG1hcGxpbmUpO1xuICAgICAgdmFyIGZtdHBzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoXG4gICAgICAgICAgbWVkaWFTZWN0aW9uLCAnYT1mbXRwOicgKyBwdCArICcgJyk7XG4gICAgICAvLyBPbmx5IHRoZSBmaXJzdCBhPWZtdHA6PHB0PiBpcyBjb25zaWRlcmVkLlxuICAgICAgY29kZWMucGFyYW1ldGVycyA9IGZtdHBzLmxlbmd0aCA/IFNEUFV0aWxzLnBhcnNlRm10cChmbXRwc1swXSkgOiB7fTtcbiAgICAgIGNvZGVjLnJ0Y3BGZWVkYmFjayA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KFxuICAgICAgICAgIG1lZGlhU2VjdGlvbiwgJ2E9cnRjcC1mYjonICsgcHQgKyAnICcpXG4gICAgICAgIC5tYXAoU0RQVXRpbHMucGFyc2VSdGNwRmIpO1xuICAgICAgZGVzY3JpcHRpb24uY29kZWNzLnB1c2goY29kZWMpO1xuICAgICAgLy8gcGFyc2UgRkVDIG1lY2hhbmlzbXMgZnJvbSBydHBtYXAgbGluZXMuXG4gICAgICBzd2l0Y2ggKGNvZGVjLm5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgICBjYXNlICdSRUQnOlxuICAgICAgICBjYXNlICdVTFBGRUMnOlxuICAgICAgICAgIGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMucHVzaChjb2RlYy5uYW1lLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiAvLyBvbmx5IFJFRCBhbmQgVUxQRkVDIGFyZSByZWNvZ25pemVkIGFzIEZFQyBtZWNoYW5pc21zLlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPWV4dG1hcDonKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICBkZXNjcmlwdGlvbi5oZWFkZXJFeHRlbnNpb25zLnB1c2goU0RQVXRpbHMucGFyc2VFeHRtYXAobGluZSkpO1xuICB9KTtcbiAgLy8gRklYTUU6IHBhcnNlIHJ0Y3AuXG4gIHJldHVybiBkZXNjcmlwdGlvbjtcbn07XG5cbi8vIEdlbmVyYXRlcyBwYXJ0cyBvZiB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gZGVzY3JpYmluZyB0aGUgY2FwYWJpbGl0aWVzIC9cbi8vIHBhcmFtZXRlcnMuXG5TRFBVdGlscy53cml0ZVJ0cERlc2NyaXB0aW9uID0gZnVuY3Rpb24oa2luZCwgY2Fwcykge1xuICB2YXIgc2RwID0gJyc7XG5cbiAgLy8gQnVpbGQgdGhlIG1saW5lLlxuICBzZHAgKz0gJ209JyArIGtpbmQgKyAnICc7XG4gIHNkcCArPSBjYXBzLmNvZGVjcy5sZW5ndGggPiAwID8gJzknIDogJzAnOyAvLyByZWplY3QgaWYgbm8gY29kZWNzLlxuICBzZHAgKz0gJyBVRFAvVExTL1JUUC9TQVZQRiAnO1xuICBzZHAgKz0gY2Fwcy5jb2RlY3MubWFwKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgaWYgKGNvZGVjLnByZWZlcnJlZFBheWxvYWRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBjb2RlYy5wcmVmZXJyZWRQYXlsb2FkVHlwZTtcbiAgICB9XG4gICAgcmV0dXJuIGNvZGVjLnBheWxvYWRUeXBlO1xuICB9KS5qb2luKCcgJykgKyAnXFxyXFxuJztcblxuICBzZHAgKz0gJ2M9SU4gSVA0IDAuMC4wLjBcXHJcXG4nO1xuICBzZHAgKz0gJ2E9cnRjcDo5IElOIElQNCAwLjAuMC4wXFxyXFxuJztcblxuICAvLyBBZGQgYT1ydHBtYXAgbGluZXMgZm9yIGVhY2ggY29kZWMuIEFsc28gZm10cCBhbmQgcnRjcC1mYi5cbiAgY2Fwcy5jb2RlY3MuZm9yRWFjaChmdW5jdGlvbihjb2RlYykge1xuICAgIHNkcCArPSBTRFBVdGlscy53cml0ZVJ0cE1hcChjb2RlYyk7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlRm10cChjb2RlYyk7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlUnRjcEZiKGNvZGVjKTtcbiAgfSk7XG4gIHZhciBtYXhwdGltZSA9IDA7XG4gIGNhcHMuY29kZWNzLmZvckVhY2goZnVuY3Rpb24oY29kZWMpIHtcbiAgICBpZiAoY29kZWMubWF4cHRpbWUgPiBtYXhwdGltZSkge1xuICAgICAgbWF4cHRpbWUgPSBjb2RlYy5tYXhwdGltZTtcbiAgICB9XG4gIH0pO1xuICBpZiAobWF4cHRpbWUgPiAwKSB7XG4gICAgc2RwICs9ICdhPW1heHB0aW1lOicgKyBtYXhwdGltZSArICdcXHJcXG4nO1xuICB9XG4gIHNkcCArPSAnYT1ydGNwLW11eFxcclxcbic7XG5cbiAgY2Fwcy5oZWFkZXJFeHRlbnNpb25zLmZvckVhY2goZnVuY3Rpb24oZXh0ZW5zaW9uKSB7XG4gICAgc2RwICs9IFNEUFV0aWxzLndyaXRlRXh0bWFwKGV4dGVuc2lvbik7XG4gIH0pO1xuICAvLyBGSVhNRTogd3JpdGUgZmVjTWVjaGFuaXNtcy5cbiAgcmV0dXJuIHNkcDtcbn07XG5cbi8vIFBhcnNlcyB0aGUgU0RQIG1lZGlhIHNlY3Rpb24gYW5kIHJldHVybnMgYW4gYXJyYXkgb2Zcbi8vIFJUQ1J0cEVuY29kaW5nUGFyYW1ldGVycy5cblNEUFV0aWxzLnBhcnNlUnRwRW5jb2RpbmdQYXJhbWV0ZXJzID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBlbmNvZGluZ1BhcmFtZXRlcnMgPSBbXTtcbiAgdmFyIGRlc2NyaXB0aW9uID0gU0RQVXRpbHMucGFyc2VSdHBQYXJhbWV0ZXJzKG1lZGlhU2VjdGlvbik7XG4gIHZhciBoYXNSZWQgPSBkZXNjcmlwdGlvbi5mZWNNZWNoYW5pc21zLmluZGV4T2YoJ1JFRCcpICE9PSAtMTtcbiAgdmFyIGhhc1VscGZlYyA9IGRlc2NyaXB0aW9uLmZlY01lY2hhbmlzbXMuaW5kZXhPZignVUxQRkVDJykgIT09IC0xO1xuXG4gIC8vIGZpbHRlciBhPXNzcmM6Li4uIGNuYW1lOiwgaWdub3JlIFBsYW5CLW1zaWRcbiAgdmFyIHNzcmNzID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYT1zc3JjOicpXG4gIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiBTRFBVdGlscy5wYXJzZVNzcmNNZWRpYShsaW5lKTtcbiAgfSlcbiAgLmZpbHRlcihmdW5jdGlvbihwYXJ0cykge1xuICAgIHJldHVybiBwYXJ0cy5hdHRyaWJ1dGUgPT09ICdjbmFtZSc7XG4gIH0pO1xuICB2YXIgcHJpbWFyeVNzcmMgPSBzc3Jjcy5sZW5ndGggPiAwICYmIHNzcmNzWzBdLnNzcmM7XG4gIHZhciBzZWNvbmRhcnlTc3JjO1xuXG4gIHZhciBmbG93cyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9c3NyYy1ncm91cDpGSUQnKVxuICAubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgcGFydHMgPSBsaW5lLnNwbGl0KCcgJyk7XG4gICAgcGFydHMuc2hpZnQoKTtcbiAgICByZXR1cm4gcGFydHMubWFwKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgIHJldHVybiBwYXJzZUludChwYXJ0LCAxMCk7XG4gICAgfSk7XG4gIH0pO1xuICBpZiAoZmxvd3MubGVuZ3RoID4gMCAmJiBmbG93c1swXS5sZW5ndGggPiAxICYmIGZsb3dzWzBdWzBdID09PSBwcmltYXJ5U3NyYykge1xuICAgIHNlY29uZGFyeVNzcmMgPSBmbG93c1swXVsxXTtcbiAgfVxuXG4gIGRlc2NyaXB0aW9uLmNvZGVjcy5mb3JFYWNoKGZ1bmN0aW9uKGNvZGVjKSB7XG4gICAgaWYgKGNvZGVjLm5hbWUudG9VcHBlckNhc2UoKSA9PT0gJ1JUWCcgJiYgY29kZWMucGFyYW1ldGVycy5hcHQpIHtcbiAgICAgIHZhciBlbmNQYXJhbSA9IHtcbiAgICAgICAgc3NyYzogcHJpbWFyeVNzcmMsXG4gICAgICAgIGNvZGVjUGF5bG9hZFR5cGU6IHBhcnNlSW50KGNvZGVjLnBhcmFtZXRlcnMuYXB0LCAxMCksXG4gICAgICAgIHJ0eDoge1xuICAgICAgICAgIHNzcmM6IHNlY29uZGFyeVNzcmNcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGVuY29kaW5nUGFyYW1ldGVycy5wdXNoKGVuY1BhcmFtKTtcbiAgICAgIGlmIChoYXNSZWQpIHtcbiAgICAgICAgZW5jUGFyYW0gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGVuY1BhcmFtKSk7XG4gICAgICAgIGVuY1BhcmFtLmZlYyA9IHtcbiAgICAgICAgICBzc3JjOiBzZWNvbmRhcnlTc3JjLFxuICAgICAgICAgIG1lY2hhbmlzbTogaGFzVWxwZmVjID8gJ3JlZCt1bHBmZWMnIDogJ3JlZCdcbiAgICAgICAgfTtcbiAgICAgICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goZW5jUGFyYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGlmIChlbmNvZGluZ1BhcmFtZXRlcnMubGVuZ3RoID09PSAwICYmIHByaW1hcnlTc3JjKSB7XG4gICAgZW5jb2RpbmdQYXJhbWV0ZXJzLnB1c2goe1xuICAgICAgc3NyYzogcHJpbWFyeVNzcmNcbiAgICB9KTtcbiAgfVxuXG4gIC8vIHdlIHN1cHBvcnQgYm90aCBiPUFTIGFuZCBiPVRJQVMgYnV0IGludGVycHJldCBBUyBhcyBUSUFTLlxuICB2YXIgYmFuZHdpZHRoID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgobWVkaWFTZWN0aW9uLCAnYj0nKTtcbiAgaWYgKGJhbmR3aWR0aC5sZW5ndGgpIHtcbiAgICBpZiAoYmFuZHdpZHRoWzBdLmluZGV4T2YoJ2I9VElBUzonKSA9PT0gMCkge1xuICAgICAgYmFuZHdpZHRoID0gcGFyc2VJbnQoYmFuZHdpZHRoWzBdLnN1YnN0cig3KSwgMTApO1xuICAgIH0gZWxzZSBpZiAoYmFuZHdpZHRoWzBdLmluZGV4T2YoJ2I9QVM6JykgPT09IDApIHtcbiAgICAgIC8vIHVzZSBmb3JtdWxhIGZyb20gSlNFUCB0byBjb252ZXJ0IGI9QVMgdG8gVElBUyB2YWx1ZS5cbiAgICAgIGJhbmR3aWR0aCA9IHBhcnNlSW50KGJhbmR3aWR0aFswXS5zdWJzdHIoNSksIDEwKSAqIDEwMDAgKiAwLjk1XG4gICAgICAgICAgLSAoNTAgKiA0MCAqIDgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBiYW5kd2lkdGggPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGVuY29kaW5nUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgcGFyYW1zLm1heEJpdHJhdGUgPSBiYW5kd2lkdGg7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGVuY29kaW5nUGFyYW1ldGVycztcbn07XG5cbi8vIHBhcnNlcyBodHRwOi8vZHJhZnQub3J0Yy5vcmcvI3J0Y3J0Y3BwYXJhbWV0ZXJzKlxuU0RQVXRpbHMucGFyc2VSdGNwUGFyYW1ldGVycyA9IGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICB2YXIgcnRjcFBhcmFtZXRlcnMgPSB7fTtcblxuICB2YXIgY25hbWU7XG4gIC8vIEdldHMgdGhlIGZpcnN0IFNTUkMuIE5vdGUgdGhhdCB3aXRoIFJUWCB0aGVyZSBtaWdodCBiZSBtdWx0aXBsZVxuICAvLyBTU1JDcy5cbiAgdmFyIHJlbW90ZVNzcmMgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmM6JylcbiAgICAgIC5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICByZXR1cm4gU0RQVXRpbHMucGFyc2VTc3JjTWVkaWEobGluZSk7XG4gICAgICB9KVxuICAgICAgLmZpbHRlcihmdW5jdGlvbihvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iai5hdHRyaWJ1dGUgPT09ICdjbmFtZSc7XG4gICAgICB9KVswXTtcbiAgaWYgKHJlbW90ZVNzcmMpIHtcbiAgICBydGNwUGFyYW1ldGVycy5jbmFtZSA9IHJlbW90ZVNzcmMudmFsdWU7XG4gICAgcnRjcFBhcmFtZXRlcnMuc3NyYyA9IHJlbW90ZVNzcmMuc3NyYztcbiAgfVxuXG4gIC8vIEVkZ2UgdXNlcyB0aGUgY29tcG91bmQgYXR0cmlidXRlIGluc3RlYWQgb2YgcmVkdWNlZFNpemVcbiAgLy8gY29tcG91bmQgaXMgIXJlZHVjZWRTaXplXG4gIHZhciByc2l6ZSA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9cnRjcC1yc2l6ZScpO1xuICBydGNwUGFyYW1ldGVycy5yZWR1Y2VkU2l6ZSA9IHJzaXplLmxlbmd0aCA+IDA7XG4gIHJ0Y3BQYXJhbWV0ZXJzLmNvbXBvdW5kID0gcnNpemUubGVuZ3RoID09PSAwO1xuXG4gIC8vIHBhcnNlcyB0aGUgcnRjcC1tdXggYXR0ctGWYnV0ZS5cbiAgLy8gTm90ZSB0aGF0IEVkZ2UgZG9lcyBub3Qgc3VwcG9ydCB1bm11eGVkIFJUQ1AuXG4gIHZhciBtdXggPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXJ0Y3AtbXV4Jyk7XG4gIHJ0Y3BQYXJhbWV0ZXJzLm11eCA9IG11eC5sZW5ndGggPiAwO1xuXG4gIHJldHVybiBydGNwUGFyYW1ldGVycztcbn07XG5cbi8vIHBhcnNlcyBlaXRoZXIgYT1tc2lkOiBvciBhPXNzcmM6Li4uIG1zaWQgbGluZXMgYW5kIHJldHVybnNcbi8vIHRoZSBpZCBvZiB0aGUgTWVkaWFTdHJlYW0gYW5kIE1lZGlhU3RyZWFtVHJhY2suXG5TRFBVdGlscy5wYXJzZU1zaWQgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgdmFyIHBhcnRzO1xuICB2YXIgc3BlYyA9IFNEUFV0aWxzLm1hdGNoUHJlZml4KG1lZGlhU2VjdGlvbiwgJ2E9bXNpZDonKTtcbiAgaWYgKHNwZWMubGVuZ3RoID09PSAxKSB7XG4gICAgcGFydHMgPSBzcGVjWzBdLnN1YnN0cig3KS5zcGxpdCgnICcpO1xuICAgIHJldHVybiB7c3RyZWFtOiBwYXJ0c1swXSwgdHJhY2s6IHBhcnRzWzFdfTtcbiAgfVxuICB2YXIgcGxhbkIgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdhPXNzcmM6JylcbiAgLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuIFNEUFV0aWxzLnBhcnNlU3NyY01lZGlhKGxpbmUpO1xuICB9KVxuICAuZmlsdGVyKGZ1bmN0aW9uKHBhcnRzKSB7XG4gICAgcmV0dXJuIHBhcnRzLmF0dHJpYnV0ZSA9PT0gJ21zaWQnO1xuICB9KTtcbiAgaWYgKHBsYW5CLmxlbmd0aCA+IDApIHtcbiAgICBwYXJ0cyA9IHBsYW5CWzBdLnZhbHVlLnNwbGl0KCcgJyk7XG4gICAgcmV0dXJuIHtzdHJlYW06IHBhcnRzWzBdLCB0cmFjazogcGFydHNbMV19O1xuICB9XG59O1xuXG4vLyBHZW5lcmF0ZSBhIHNlc3Npb24gSUQgZm9yIFNEUC5cbi8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9kcmFmdC1pZXRmLXJ0Y3dlYi1qc2VwLTIwI3NlY3Rpb24tNS4yLjFcbi8vIHJlY29tbWVuZHMgdXNpbmcgYSBjcnlwdG9ncmFwaGljYWxseSByYW5kb20gK3ZlIDY0LWJpdCB2YWx1ZVxuLy8gYnV0IHJpZ2h0IG5vdyB0aGlzIHNob3VsZCBiZSBhY2NlcHRhYmxlIGFuZCB3aXRoaW4gdGhlIHJpZ2h0IHJhbmdlXG5TRFBVdGlscy5nZW5lcmF0ZVNlc3Npb25JZCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygpLnN1YnN0cigyLCAyMSk7XG59O1xuXG4vLyBXcml0ZSBib2lsZGVyIHBsYXRlIGZvciBzdGFydCBvZiBTRFBcbi8vIHNlc3NJZCBhcmd1bWVudCBpcyBvcHRpb25hbCAtIGlmIG5vdCBzdXBwbGllZCBpdCB3aWxsXG4vLyBiZSBnZW5lcmF0ZWQgcmFuZG9tbHlcbi8vIHNlc3NWZXJzaW9uIGlzIG9wdGlvbmFsIGFuZCBkZWZhdWx0cyB0byAyXG5TRFBVdGlscy53cml0ZVNlc3Npb25Cb2lsZXJwbGF0ZSA9IGZ1bmN0aW9uKHNlc3NJZCwgc2Vzc1Zlcikge1xuICB2YXIgc2Vzc2lvbklkO1xuICB2YXIgdmVyc2lvbiA9IHNlc3NWZXIgIT09IHVuZGVmaW5lZCA/IHNlc3NWZXIgOiAyO1xuICBpZiAoc2Vzc0lkKSB7XG4gICAgc2Vzc2lvbklkID0gc2Vzc0lkO1xuICB9IGVsc2Uge1xuICAgIHNlc3Npb25JZCA9IFNEUFV0aWxzLmdlbmVyYXRlU2Vzc2lvbklkKCk7XG4gIH1cbiAgLy8gRklYTUU6IHNlc3MtaWQgc2hvdWxkIGJlIGFuIE5UUCB0aW1lc3RhbXAuXG4gIHJldHVybiAndj0wXFxyXFxuJyArXG4gICAgICAnbz10aGlzaXNhZGFwdGVyb3J0YyAnICsgc2Vzc2lvbklkICsgJyAnICsgdmVyc2lvbiArICcgSU4gSVA0IDEyNy4wLjAuMVxcclxcbicgK1xuICAgICAgJ3M9LVxcclxcbicgK1xuICAgICAgJ3Q9MCAwXFxyXFxuJztcbn07XG5cblNEUFV0aWxzLndyaXRlTWVkaWFTZWN0aW9uID0gZnVuY3Rpb24odHJhbnNjZWl2ZXIsIGNhcHMsIHR5cGUsIHN0cmVhbSkge1xuICB2YXIgc2RwID0gU0RQVXRpbHMud3JpdGVSdHBEZXNjcmlwdGlvbih0cmFuc2NlaXZlci5raW5kLCBjYXBzKTtcblxuICAvLyBNYXAgSUNFIHBhcmFtZXRlcnMgKHVmcmFnLCBwd2QpIHRvIFNEUC5cbiAgc2RwICs9IFNEUFV0aWxzLndyaXRlSWNlUGFyYW1ldGVycyhcbiAgICAgIHRyYW5zY2VpdmVyLmljZUdhdGhlcmVyLmdldExvY2FsUGFyYW1ldGVycygpKTtcblxuICAvLyBNYXAgRFRMUyBwYXJhbWV0ZXJzIHRvIFNEUC5cbiAgc2RwICs9IFNEUFV0aWxzLndyaXRlRHRsc1BhcmFtZXRlcnMoXG4gICAgICB0cmFuc2NlaXZlci5kdGxzVHJhbnNwb3J0LmdldExvY2FsUGFyYW1ldGVycygpLFxuICAgICAgdHlwZSA9PT0gJ29mZmVyJyA/ICdhY3RwYXNzJyA6ICdhY3RpdmUnKTtcblxuICBzZHAgKz0gJ2E9bWlkOicgKyB0cmFuc2NlaXZlci5taWQgKyAnXFxyXFxuJztcblxuICBpZiAodHJhbnNjZWl2ZXIuZGlyZWN0aW9uKSB7XG4gICAgc2RwICs9ICdhPScgKyB0cmFuc2NlaXZlci5kaXJlY3Rpb24gKyAnXFxyXFxuJztcbiAgfSBlbHNlIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIgJiYgdHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICBzZHAgKz0gJ2E9c2VuZHJlY3ZcXHJcXG4nO1xuICB9IGVsc2UgaWYgKHRyYW5zY2VpdmVyLnJ0cFNlbmRlcikge1xuICAgIHNkcCArPSAnYT1zZW5kb25seVxcclxcbic7XG4gIH0gZWxzZSBpZiAodHJhbnNjZWl2ZXIucnRwUmVjZWl2ZXIpIHtcbiAgICBzZHAgKz0gJ2E9cmVjdm9ubHlcXHJcXG4nO1xuICB9IGVsc2Uge1xuICAgIHNkcCArPSAnYT1pbmFjdGl2ZVxcclxcbic7XG4gIH1cblxuICBpZiAodHJhbnNjZWl2ZXIucnRwU2VuZGVyKSB7XG4gICAgLy8gc3BlYy5cbiAgICB2YXIgbXNpZCA9ICdtc2lkOicgKyBzdHJlYW0uaWQgKyAnICcgK1xuICAgICAgICB0cmFuc2NlaXZlci5ydHBTZW5kZXIudHJhY2suaWQgKyAnXFxyXFxuJztcbiAgICBzZHAgKz0gJ2E9JyArIG1zaWQ7XG5cbiAgICAvLyBmb3IgQ2hyb21lLlxuICAgIHNkcCArPSAnYT1zc3JjOicgKyB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnNzcmMgK1xuICAgICAgICAnICcgKyBtc2lkO1xuICAgIGlmICh0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eCkge1xuICAgICAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0ucnR4LnNzcmMgK1xuICAgICAgICAgICcgJyArIG1zaWQ7XG4gICAgICBzZHAgKz0gJ2E9c3NyYy1ncm91cDpGSUQgJyArXG4gICAgICAgICAgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5zc3JjICsgJyAnICtcbiAgICAgICAgICB0cmFuc2NlaXZlci5zZW5kRW5jb2RpbmdQYXJhbWV0ZXJzWzBdLnJ0eC5zc3JjICtcbiAgICAgICAgICAnXFxyXFxuJztcbiAgICB9XG4gIH1cbiAgLy8gRklYTUU6IHRoaXMgc2hvdWxkIGJlIHdyaXR0ZW4gYnkgd3JpdGVSdHBEZXNjcmlwdGlvbi5cbiAgc2RwICs9ICdhPXNzcmM6JyArIHRyYW5zY2VpdmVyLnNlbmRFbmNvZGluZ1BhcmFtZXRlcnNbMF0uc3NyYyArXG4gICAgICAnIGNuYW1lOicgKyBTRFBVdGlscy5sb2NhbENOYW1lICsgJ1xcclxcbic7XG4gIGlmICh0cmFuc2NlaXZlci5ydHBTZW5kZXIgJiYgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHgpIHtcbiAgICBzZHAgKz0gJ2E9c3NyYzonICsgdHJhbnNjZWl2ZXIuc2VuZEVuY29kaW5nUGFyYW1ldGVyc1swXS5ydHguc3NyYyArXG4gICAgICAgICcgY25hbWU6JyArIFNEUFV0aWxzLmxvY2FsQ05hbWUgKyAnXFxyXFxuJztcbiAgfVxuICByZXR1cm4gc2RwO1xufTtcblxuLy8gR2V0cyB0aGUgZGlyZWN0aW9uIGZyb20gdGhlIG1lZGlhU2VjdGlvbiBvciB0aGUgc2Vzc2lvbnBhcnQuXG5TRFBVdGlscy5nZXREaXJlY3Rpb24gPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24sIHNlc3Npb25wYXJ0KSB7XG4gIC8vIExvb2sgZm9yIHNlbmRyZWN2LCBzZW5kb25seSwgcmVjdm9ubHksIGluYWN0aXZlLCBkZWZhdWx0IHRvIHNlbmRyZWN2LlxuICB2YXIgbGluZXMgPSBTRFBVdGlscy5zcGxpdExpbmVzKG1lZGlhU2VjdGlvbik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzd2l0Y2ggKGxpbmVzW2ldKSB7XG4gICAgICBjYXNlICdhPXNlbmRyZWN2JzpcbiAgICAgIGNhc2UgJ2E9c2VuZG9ubHknOlxuICAgICAgY2FzZSAnYT1yZWN2b25seSc6XG4gICAgICBjYXNlICdhPWluYWN0aXZlJzpcbiAgICAgICAgcmV0dXJuIGxpbmVzW2ldLnN1YnN0cigyKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIEZJWE1FOiBXaGF0IHNob3VsZCBoYXBwZW4gaGVyZT9cbiAgICB9XG4gIH1cbiAgaWYgKHNlc3Npb25wYXJ0KSB7XG4gICAgcmV0dXJuIFNEUFV0aWxzLmdldERpcmVjdGlvbihzZXNzaW9ucGFydCk7XG4gIH1cbiAgcmV0dXJuICdzZW5kcmVjdic7XG59O1xuXG5TRFBVdGlscy5nZXRLaW5kID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgdmFyIG1saW5lID0gbGluZXNbMF0uc3BsaXQoJyAnKTtcbiAgcmV0dXJuIG1saW5lWzBdLnN1YnN0cigyKTtcbn07XG5cblNEUFV0aWxzLmlzUmVqZWN0ZWQgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgcmV0dXJuIG1lZGlhU2VjdGlvbi5zcGxpdCgnICcsIDIpWzFdID09PSAnMCc7XG59O1xuXG5TRFBVdGlscy5wYXJzZU1MaW5lID0gZnVuY3Rpb24obWVkaWFTZWN0aW9uKSB7XG4gIHZhciBsaW5lcyA9IFNEUFV0aWxzLnNwbGl0TGluZXMobWVkaWFTZWN0aW9uKTtcbiAgdmFyIHBhcnRzID0gbGluZXNbMF0uc3Vic3RyKDIpLnNwbGl0KCcgJyk7XG4gIHJldHVybiB7XG4gICAga2luZDogcGFydHNbMF0sXG4gICAgcG9ydDogcGFyc2VJbnQocGFydHNbMV0sIDEwKSxcbiAgICBwcm90b2NvbDogcGFydHNbMl0sXG4gICAgZm10OiBwYXJ0cy5zbGljZSgzKS5qb2luKCcgJylcbiAgfTtcbn07XG5cblNEUFV0aWxzLnBhcnNlT0xpbmUgPSBmdW5jdGlvbihtZWRpYVNlY3Rpb24pIHtcbiAgdmFyIGxpbmUgPSBTRFBVdGlscy5tYXRjaFByZWZpeChtZWRpYVNlY3Rpb24sICdvPScpWzBdO1xuICB2YXIgcGFydHMgPSBsaW5lLnN1YnN0cigyKS5zcGxpdCgnICcpO1xuICByZXR1cm4ge1xuICAgIHVzZXJuYW1lOiBwYXJ0c1swXSxcbiAgICBzZXNzaW9uSWQ6IHBhcnRzWzFdLFxuICAgIHNlc3Npb25WZXJzaW9uOiBwYXJzZUludChwYXJ0c1syXSwgMTApLFxuICAgIG5ldFR5cGU6IHBhcnRzWzNdLFxuICAgIGFkZHJlc3NUeXBlOiBwYXJ0c1s0XSxcbiAgICBhZGRyZXNzOiBwYXJ0c1s1XSxcbiAgfTtcbn1cblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gU0RQVXRpbHM7XG59XG5cbn0se31dLDM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuKGZ1bmN0aW9uIChnbG9iYWwpe1xuLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGFkYXB0ZXJGYWN0b3J5ID0gcmVxdWlyZSgnLi9hZGFwdGVyX2ZhY3RvcnkuanMnKTtcbm1vZHVsZS5leHBvcnRzID0gYWRhcHRlckZhY3Rvcnkoe3dpbmRvdzogZ2xvYmFsLndpbmRvd30pO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbn0se1wiLi9hZGFwdGVyX2ZhY3RvcnkuanNcIjo0fV0sNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG4vLyBTaGltbWluZyBzdGFydHMgaGVyZS5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZGVwZW5kZW5jaWVzLCBvcHRzKSB7XG4gIHZhciB3aW5kb3cgPSBkZXBlbmRlbmNpZXMgJiYgZGVwZW5kZW5jaWVzLndpbmRvdztcblxuICB2YXIgb3B0aW9ucyA9IHtcbiAgICBzaGltQ2hyb21lOiB0cnVlLFxuICAgIHNoaW1GaXJlZm94OiB0cnVlLFxuICAgIHNoaW1FZGdlOiB0cnVlLFxuICAgIHNoaW1TYWZhcmk6IHRydWUsXG4gIH07XG5cbiAgZm9yICh2YXIga2V5IGluIG9wdHMpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvcHRzLCBrZXkpKSB7XG4gICAgICBvcHRpb25zW2tleV0gPSBvcHRzW2tleV07XG4gICAgfVxuICB9XG5cbiAgLy8gVXRpbHMuXG4gIHZhciBsb2dnaW5nID0gdXRpbHMubG9nO1xuICB2YXIgYnJvd3NlckRldGFpbHMgPSB1dGlscy5kZXRlY3RCcm93c2VyKHdpbmRvdyk7XG5cbiAgLy8gVW5jb21tZW50IHRoZSBsaW5lIGJlbG93IGlmIHlvdSB3YW50IGxvZ2dpbmcgdG8gb2NjdXIsIGluY2x1ZGluZyBsb2dnaW5nXG4gIC8vIGZvciB0aGUgc3dpdGNoIHN0YXRlbWVudCBiZWxvdy4gQ2FuIGFsc28gYmUgdHVybmVkIG9uIGluIHRoZSBicm93c2VyIHZpYVxuICAvLyBhZGFwdGVyLmRpc2FibGVMb2coZmFsc2UpLCBidXQgdGhlbiBsb2dnaW5nIGZyb20gdGhlIHN3aXRjaCBzdGF0ZW1lbnQgYmVsb3dcbiAgLy8gd2lsbCBub3QgYXBwZWFyLlxuICAvLyByZXF1aXJlKCcuL3V0aWxzJykuZGlzYWJsZUxvZyhmYWxzZSk7XG5cbiAgLy8gQnJvd3NlciBzaGltcy5cbiAgdmFyIGNocm9tZVNoaW0gPSByZXF1aXJlKCcuL2Nocm9tZS9jaHJvbWVfc2hpbScpIHx8IG51bGw7XG4gIHZhciBlZGdlU2hpbSA9IHJlcXVpcmUoJy4vZWRnZS9lZGdlX3NoaW0nKSB8fCBudWxsO1xuICB2YXIgZmlyZWZveFNoaW0gPSByZXF1aXJlKCcuL2ZpcmVmb3gvZmlyZWZveF9zaGltJykgfHwgbnVsbDtcbiAgdmFyIHNhZmFyaVNoaW0gPSByZXF1aXJlKCcuL3NhZmFyaS9zYWZhcmlfc2hpbScpIHx8IG51bGw7XG4gIHZhciBjb21tb25TaGltID0gcmVxdWlyZSgnLi9jb21tb25fc2hpbScpIHx8IG51bGw7XG5cbiAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgdmFyIGFkYXB0ZXIgPSB7XG4gICAgYnJvd3NlckRldGFpbHM6IGJyb3dzZXJEZXRhaWxzLFxuICAgIGNvbW1vblNoaW06IGNvbW1vblNoaW0sXG4gICAgZXh0cmFjdFZlcnNpb246IHV0aWxzLmV4dHJhY3RWZXJzaW9uLFxuICAgIGRpc2FibGVMb2c6IHV0aWxzLmRpc2FibGVMb2csXG4gICAgZGlzYWJsZVdhcm5pbmdzOiB1dGlscy5kaXNhYmxlV2FybmluZ3NcbiAgfTtcblxuICAvLyBTaGltIGJyb3dzZXIgaWYgZm91bmQuXG4gIHN3aXRjaCAoYnJvd3NlckRldGFpbHMuYnJvd3Nlcikge1xuICAgIGNhc2UgJ2Nocm9tZSc6XG4gICAgICBpZiAoIWNocm9tZVNoaW0gfHwgIWNocm9tZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uIHx8XG4gICAgICAgICAgIW9wdGlvbnMuc2hpbUNocm9tZSkge1xuICAgICAgICBsb2dnaW5nKCdDaHJvbWUgc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybiBhZGFwdGVyO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBjaHJvbWUuJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgYWRhcHRlci5icm93c2VyU2hpbSA9IGNocm9tZVNoaW07XG4gICAgICBjb21tb25TaGltLnNoaW1DcmVhdGVPYmplY3RVUkwod2luZG93KTtcblxuICAgICAgY2hyb21lU2hpbS5zaGltR2V0VXNlck1lZGlhKHdpbmRvdyk7XG4gICAgICBjaHJvbWVTaGltLnNoaW1NZWRpYVN0cmVhbSh3aW5kb3cpO1xuICAgICAgY2hyb21lU2hpbS5zaGltU291cmNlT2JqZWN0KHdpbmRvdyk7XG4gICAgICBjaHJvbWVTaGltLnNoaW1QZWVyQ29ubmVjdGlvbih3aW5kb3cpO1xuICAgICAgY2hyb21lU2hpbS5zaGltT25UcmFjayh3aW5kb3cpO1xuICAgICAgY2hyb21lU2hpbS5zaGltQWRkVHJhY2tSZW1vdmVUcmFjayh3aW5kb3cpO1xuICAgICAgY2hyb21lU2hpbS5zaGltR2V0U2VuZGVyc1dpdGhEdG1mKHdpbmRvdyk7XG5cbiAgICAgIGNvbW1vblNoaW0uc2hpbVJUQ0ljZUNhbmRpZGF0ZSh3aW5kb3cpO1xuICAgICAgY29tbW9uU2hpbS5zaGltTWF4TWVzc2FnZVNpemUod2luZG93KTtcbiAgICAgIGNvbW1vblNoaW0uc2hpbVNlbmRUaHJvd1R5cGVFcnJvcih3aW5kb3cpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZmlyZWZveCc6XG4gICAgICBpZiAoIWZpcmVmb3hTaGltIHx8ICFmaXJlZm94U2hpbS5zaGltUGVlckNvbm5lY3Rpb24gfHxcbiAgICAgICAgICAhb3B0aW9ucy5zaGltRmlyZWZveCkge1xuICAgICAgICBsb2dnaW5nKCdGaXJlZm94IHNoaW0gaXMgbm90IGluY2x1ZGVkIGluIHRoaXMgYWRhcHRlciByZWxlYXNlLicpO1xuICAgICAgICByZXR1cm4gYWRhcHRlcjtcbiAgICAgIH1cbiAgICAgIGxvZ2dpbmcoJ2FkYXB0ZXIuanMgc2hpbW1pbmcgZmlyZWZveC4nKTtcbiAgICAgIC8vIEV4cG9ydCB0byB0aGUgYWRhcHRlciBnbG9iYWwgb2JqZWN0IHZpc2libGUgaW4gdGhlIGJyb3dzZXIuXG4gICAgICBhZGFwdGVyLmJyb3dzZXJTaGltID0gZmlyZWZveFNoaW07XG4gICAgICBjb21tb25TaGltLnNoaW1DcmVhdGVPYmplY3RVUkwod2luZG93KTtcblxuICAgICAgZmlyZWZveFNoaW0uc2hpbUdldFVzZXJNZWRpYSh3aW5kb3cpO1xuICAgICAgZmlyZWZveFNoaW0uc2hpbVNvdXJjZU9iamVjdCh3aW5kb3cpO1xuICAgICAgZmlyZWZveFNoaW0uc2hpbVBlZXJDb25uZWN0aW9uKHdpbmRvdyk7XG4gICAgICBmaXJlZm94U2hpbS5zaGltT25UcmFjayh3aW5kb3cpO1xuICAgICAgZmlyZWZveFNoaW0uc2hpbVJlbW92ZVN0cmVhbSh3aW5kb3cpO1xuXG4gICAgICBjb21tb25TaGltLnNoaW1SVENJY2VDYW5kaWRhdGUod2luZG93KTtcbiAgICAgIGNvbW1vblNoaW0uc2hpbU1heE1lc3NhZ2VTaXplKHdpbmRvdyk7XG4gICAgICBjb21tb25TaGltLnNoaW1TZW5kVGhyb3dUeXBlRXJyb3Iod2luZG93KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2VkZ2UnOlxuICAgICAgaWYgKCFlZGdlU2hpbSB8fCAhZWRnZVNoaW0uc2hpbVBlZXJDb25uZWN0aW9uIHx8ICFvcHRpb25zLnNoaW1FZGdlKSB7XG4gICAgICAgIGxvZ2dpbmcoJ01TIGVkZ2Ugc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybiBhZGFwdGVyO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBlZGdlLicpO1xuICAgICAgLy8gRXhwb3J0IHRvIHRoZSBhZGFwdGVyIGdsb2JhbCBvYmplY3QgdmlzaWJsZSBpbiB0aGUgYnJvd3Nlci5cbiAgICAgIGFkYXB0ZXIuYnJvd3NlclNoaW0gPSBlZGdlU2hpbTtcbiAgICAgIGNvbW1vblNoaW0uc2hpbUNyZWF0ZU9iamVjdFVSTCh3aW5kb3cpO1xuXG4gICAgICBlZGdlU2hpbS5zaGltR2V0VXNlck1lZGlhKHdpbmRvdyk7XG4gICAgICBlZGdlU2hpbS5zaGltUGVlckNvbm5lY3Rpb24od2luZG93KTtcbiAgICAgIGVkZ2VTaGltLnNoaW1SZXBsYWNlVHJhY2sod2luZG93KTtcblxuICAgICAgLy8gdGhlIGVkZ2Ugc2hpbSBpbXBsZW1lbnRzIHRoZSBmdWxsIFJUQ0ljZUNhbmRpZGF0ZSBvYmplY3QuXG5cbiAgICAgIGNvbW1vblNoaW0uc2hpbU1heE1lc3NhZ2VTaXplKHdpbmRvdyk7XG4gICAgICBjb21tb25TaGltLnNoaW1TZW5kVGhyb3dUeXBlRXJyb3Iod2luZG93KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NhZmFyaSc6XG4gICAgICBpZiAoIXNhZmFyaVNoaW0gfHwgIW9wdGlvbnMuc2hpbVNhZmFyaSkge1xuICAgICAgICBsb2dnaW5nKCdTYWZhcmkgc2hpbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhpcyBhZGFwdGVyIHJlbGVhc2UuJyk7XG4gICAgICAgIHJldHVybiBhZGFwdGVyO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnYWRhcHRlci5qcyBzaGltbWluZyBzYWZhcmkuJyk7XG4gICAgICAvLyBFeHBvcnQgdG8gdGhlIGFkYXB0ZXIgZ2xvYmFsIG9iamVjdCB2aXNpYmxlIGluIHRoZSBicm93c2VyLlxuICAgICAgYWRhcHRlci5icm93c2VyU2hpbSA9IHNhZmFyaVNoaW07XG4gICAgICBjb21tb25TaGltLnNoaW1DcmVhdGVPYmplY3RVUkwod2luZG93KTtcblxuICAgICAgc2FmYXJpU2hpbS5zaGltUlRDSWNlU2VydmVyVXJscyh3aW5kb3cpO1xuICAgICAgc2FmYXJpU2hpbS5zaGltQ2FsbGJhY2tzQVBJKHdpbmRvdyk7XG4gICAgICBzYWZhcmlTaGltLnNoaW1Mb2NhbFN0cmVhbXNBUEkod2luZG93KTtcbiAgICAgIHNhZmFyaVNoaW0uc2hpbVJlbW90ZVN0cmVhbXNBUEkod2luZG93KTtcbiAgICAgIHNhZmFyaVNoaW0uc2hpbVRyYWNrRXZlbnRUcmFuc2NlaXZlcih3aW5kb3cpO1xuICAgICAgc2FmYXJpU2hpbS5zaGltR2V0VXNlck1lZGlhKHdpbmRvdyk7XG4gICAgICBzYWZhcmlTaGltLnNoaW1DcmVhdGVPZmZlckxlZ2FjeSh3aW5kb3cpO1xuXG4gICAgICBjb21tb25TaGltLnNoaW1SVENJY2VDYW5kaWRhdGUod2luZG93KTtcbiAgICAgIGNvbW1vblNoaW0uc2hpbU1heE1lc3NhZ2VTaXplKHdpbmRvdyk7XG4gICAgICBjb21tb25TaGltLnNoaW1TZW5kVGhyb3dUeXBlRXJyb3Iod2luZG93KTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBsb2dnaW5nKCdVbnN1cHBvcnRlZCBicm93c2VyIScpO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gYWRhcHRlcjtcbn07XG5cbn0se1wiLi9jaHJvbWUvY2hyb21lX3NoaW1cIjo1LFwiLi9jb21tb25fc2hpbVwiOjcsXCIuL2VkZ2UvZWRnZV9zaGltXCI6OCxcIi4vZmlyZWZveC9maXJlZm94X3NoaW1cIjoxMCxcIi4vc2FmYXJpL3NhZmFyaV9zaGltXCI6MTIsXCIuL3V0aWxzXCI6MTN9XSw1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblxuLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscy5qcycpO1xudmFyIGxvZ2dpbmcgPSB1dGlscy5sb2c7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaGltR2V0VXNlck1lZGlhOiByZXF1aXJlKCcuL2dldHVzZXJtZWRpYScpLFxuICBzaGltTWVkaWFTdHJlYW06IGZ1bmN0aW9uKHdpbmRvdykge1xuICAgIHdpbmRvdy5NZWRpYVN0cmVhbSA9IHdpbmRvdy5NZWRpYVN0cmVhbSB8fCB3aW5kb3cud2Via2l0TWVkaWFTdHJlYW07XG4gIH0sXG5cbiAgc2hpbU9uVHJhY2s6IGZ1bmN0aW9uKHdpbmRvdykge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gJiYgISgnb250cmFjaycgaW5cbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLCAnb250cmFjaycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fb250cmFjaztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX29udHJhY2spIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29udHJhY2sgPSBmKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB2YXIgb3JpZ1NldFJlbW90ZURlc2NyaXB0aW9uID1cbiAgICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldFJlbW90ZURlc2NyaXB0aW9uO1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRSZW1vdGVEZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGMgPSB0aGlzO1xuICAgICAgICBpZiAoIXBjLl9vbnRyYWNrcG9seSkge1xuICAgICAgICAgIHBjLl9vbnRyYWNrcG9seSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIC8vIG9uYWRkc3RyZWFtIGRvZXMgbm90IGZpcmUgd2hlbiBhIHRyYWNrIGlzIGFkZGVkIHRvIGFuIGV4aXN0aW5nXG4gICAgICAgICAgICAvLyBzdHJlYW0uIEJ1dCBzdHJlYW0ub25hZGR0cmFjayBpcyBpbXBsZW1lbnRlZCBzbyB3ZSB1c2UgdGhhdC5cbiAgICAgICAgICAgIGUuc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHRyYWNrJywgZnVuY3Rpb24odGUpIHtcbiAgICAgICAgICAgICAgdmFyIHJlY2VpdmVyO1xuICAgICAgICAgICAgICBpZiAod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRSZWNlaXZlcnMpIHtcbiAgICAgICAgICAgICAgICByZWNlaXZlciA9IHBjLmdldFJlY2VpdmVycygpLmZpbmQoZnVuY3Rpb24ocikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHIudHJhY2sgJiYgci50cmFjay5pZCA9PT0gdGUudHJhY2suaWQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZXIgPSB7dHJhY2s6IHRlLnRyYWNrfTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICAgICAgICAgICAgZXZlbnQudHJhY2sgPSB0ZS50cmFjaztcbiAgICAgICAgICAgICAgZXZlbnQucmVjZWl2ZXIgPSByZWNlaXZlcjtcbiAgICAgICAgICAgICAgZXZlbnQudHJhbnNjZWl2ZXIgPSB7cmVjZWl2ZXI6IHJlY2VpdmVyfTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtcyA9IFtlLnN0cmVhbV07XG4gICAgICAgICAgICAgIHBjLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlLnN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICAgIHZhciByZWNlaXZlcjtcbiAgICAgICAgICAgICAgaWYgKHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0UmVjZWl2ZXJzKSB7XG4gICAgICAgICAgICAgICAgcmVjZWl2ZXIgPSBwYy5nZXRSZWNlaXZlcnMoKS5maW5kKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByLnRyYWNrICYmIHIudHJhY2suaWQgPT09IHRyYWNrLmlkO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlY2VpdmVyID0ge3RyYWNrOiB0cmFja307XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50KCd0cmFjaycpO1xuICAgICAgICAgICAgICBldmVudC50cmFjayA9IHRyYWNrO1xuICAgICAgICAgICAgICBldmVudC5yZWNlaXZlciA9IHJlY2VpdmVyO1xuICAgICAgICAgICAgICBldmVudC50cmFuc2NlaXZlciA9IHtyZWNlaXZlcjogcmVjZWl2ZXJ9O1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW1zID0gW2Uuc3RyZWFtXTtcbiAgICAgICAgICAgICAgcGMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIHBjLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHBjLl9vbnRyYWNrcG9seSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9yaWdTZXRSZW1vdGVEZXNjcmlwdGlvbi5hcHBseShwYywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICghKCdSVENSdHBUcmFuc2NlaXZlcicgaW4gd2luZG93KSkge1xuICAgICAgdXRpbHMud3JhcFBlZXJDb25uZWN0aW9uRXZlbnQod2luZG93LCAndHJhY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICghZS50cmFuc2NlaXZlcikge1xuICAgICAgICAgIGUudHJhbnNjZWl2ZXIgPSB7cmVjZWl2ZXI6IGUucmVjZWl2ZXJ9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIHNoaW1HZXRTZW5kZXJzV2l0aER0bWY6IGZ1bmN0aW9uKHdpbmRvdykge1xuICAgIC8vIE92ZXJyaWRlcyBhZGRUcmFjay9yZW1vdmVUcmFjaywgZGVwZW5kcyBvbiBzaGltQWRkVHJhY2tSZW1vdmVUcmFjay5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uICYmXG4gICAgICAgICEoJ2dldFNlbmRlcnMnIGluIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpICYmXG4gICAgICAgICdjcmVhdGVEVE1GU2VuZGVyJyBpbiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSB7XG4gICAgICB2YXIgc2hpbVNlbmRlcldpdGhEdG1mID0gZnVuY3Rpb24ocGMsIHRyYWNrKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHJhY2s6IHRyYWNrLFxuICAgICAgICAgIGdldCBkdG1mKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2R0bWYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBpZiAodHJhY2sua2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2R0bWYgPSBwYy5jcmVhdGVEVE1GU2VuZGVyKHRyYWNrKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kdG1mID0gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2R0bWY7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBfcGM6IHBjXG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICAvLyBhdWdtZW50IGFkZFRyYWNrIHdoZW4gZ2V0U2VuZGVycyBpcyBub3QgYXZhaWxhYmxlLlxuICAgICAgaWYgKCF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFNlbmRlcnMpIHtcbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRTZW5kZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy5fc2VuZGVycyA9IHRoaXMuX3NlbmRlcnMgfHwgW107XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3NlbmRlcnMuc2xpY2UoKTsgLy8gcmV0dXJuIGEgY29weSBvZiB0aGUgaW50ZXJuYWwgc3RhdGUuXG4gICAgICAgIH07XG4gICAgICAgIHZhciBvcmlnQWRkVHJhY2sgPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFRyYWNrO1xuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFRyYWNrID0gZnVuY3Rpb24odHJhY2ssIHN0cmVhbSkge1xuICAgICAgICAgIHZhciBwYyA9IHRoaXM7XG4gICAgICAgICAgdmFyIHNlbmRlciA9IG9yaWdBZGRUcmFjay5hcHBseShwYywgYXJndW1lbnRzKTtcbiAgICAgICAgICBpZiAoIXNlbmRlcikge1xuICAgICAgICAgICAgc2VuZGVyID0gc2hpbVNlbmRlcldpdGhEdG1mKHBjLCB0cmFjayk7XG4gICAgICAgICAgICBwYy5fc2VuZGVycy5wdXNoKHNlbmRlcik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBzZW5kZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIG9yaWdSZW1vdmVUcmFjayA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUucmVtb3ZlVHJhY2s7XG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUucmVtb3ZlVHJhY2sgPSBmdW5jdGlvbihzZW5kZXIpIHtcbiAgICAgICAgICB2YXIgcGMgPSB0aGlzO1xuICAgICAgICAgIG9yaWdSZW1vdmVUcmFjay5hcHBseShwYywgYXJndW1lbnRzKTtcbiAgICAgICAgICB2YXIgaWR4ID0gcGMuX3NlbmRlcnMuaW5kZXhPZihzZW5kZXIpO1xuICAgICAgICAgIGlmIChpZHggIT09IC0xKSB7XG4gICAgICAgICAgICBwYy5fc2VuZGVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICB2YXIgb3JpZ0FkZFN0cmVhbSA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkU3RyZWFtO1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgdmFyIHBjID0gdGhpcztcbiAgICAgICAgcGMuX3NlbmRlcnMgPSBwYy5fc2VuZGVycyB8fCBbXTtcbiAgICAgICAgb3JpZ0FkZFN0cmVhbS5hcHBseShwYywgW3N0cmVhbV0pO1xuICAgICAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgIHBjLl9zZW5kZXJzLnB1c2goc2hpbVNlbmRlcldpdGhEdG1mKHBjLCB0cmFjaykpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBvcmlnUmVtb3ZlU3RyZWFtID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW07XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnJlbW92ZVN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICB2YXIgcGMgPSB0aGlzO1xuICAgICAgICBwYy5fc2VuZGVycyA9IHBjLl9zZW5kZXJzIHx8IFtdO1xuICAgICAgICBvcmlnUmVtb3ZlU3RyZWFtLmFwcGx5KHBjLCBbc3RyZWFtXSk7XG5cbiAgICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICB2YXIgc2VuZGVyID0gcGMuX3NlbmRlcnMuZmluZChmdW5jdGlvbihzKSB7XG4gICAgICAgICAgICByZXR1cm4gcy50cmFjayA9PT0gdHJhY2s7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKHNlbmRlcikge1xuICAgICAgICAgICAgcGMuX3NlbmRlcnMuc3BsaWNlKHBjLl9zZW5kZXJzLmluZGV4T2Yoc2VuZGVyKSwgMSk7IC8vIHJlbW92ZSBzZW5kZXJcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiAmJlxuICAgICAgICAgICAgICAgJ2dldFNlbmRlcnMnIGluIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUgJiZcbiAgICAgICAgICAgICAgICdjcmVhdGVEVE1GU2VuZGVyJyBpbiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlICYmXG4gICAgICAgICAgICAgICB3aW5kb3cuUlRDUnRwU2VuZGVyICYmXG4gICAgICAgICAgICAgICAhKCdkdG1mJyBpbiB3aW5kb3cuUlRDUnRwU2VuZGVyLnByb3RvdHlwZSkpIHtcbiAgICAgIHZhciBvcmlnR2V0U2VuZGVycyA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U2VuZGVycztcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U2VuZGVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGMgPSB0aGlzO1xuICAgICAgICB2YXIgc2VuZGVycyA9IG9yaWdHZXRTZW5kZXJzLmFwcGx5KHBjLCBbXSk7XG4gICAgICAgIHNlbmRlcnMuZm9yRWFjaChmdW5jdGlvbihzZW5kZXIpIHtcbiAgICAgICAgICBzZW5kZXIuX3BjID0gcGM7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc2VuZGVycztcbiAgICAgIH07XG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUnRwU2VuZGVyLnByb3RvdHlwZSwgJ2R0bWYnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX2R0bWYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMudHJhY2sua2luZCA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgICAgICB0aGlzLl9kdG1mID0gdGhpcy5fcGMuY3JlYXRlRFRNRlNlbmRlcih0aGlzLnRyYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuX2R0bWYgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcy5fZHRtZjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIHNoaW1Tb3VyY2VPYmplY3Q6IGZ1bmN0aW9uKHdpbmRvdykge1xuICAgIHZhciBVUkwgPSB3aW5kb3cgJiYgd2luZG93LlVSTDtcblxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50ICYmXG4gICAgICAgICEoJ3NyY09iamVjdCcgaW4gd2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICAvLyBTaGltIHRoZSBzcmNPYmplY3QgcHJvcGVydHksIG9uY2UsIHdoZW4gSFRNTE1lZGlhRWxlbWVudCBpcyBmb3VuZC5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSwgJ3NyY09iamVjdCcsIHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NyY09iamVjdDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAvLyBVc2UgX3NyY09iamVjdCBhcyBhIHByaXZhdGUgcHJvcGVydHkgZm9yIHRoaXMgc2hpbVxuICAgICAgICAgICAgdGhpcy5fc3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3JjKSB7XG4gICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodGhpcy5zcmMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXN0cmVhbSkge1xuICAgICAgICAgICAgICB0aGlzLnNyYyA9ICcnO1xuICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgICAgICAgICAvLyBXZSBuZWVkIHRvIHJlY3JlYXRlIHRoZSBibG9iIHVybCB3aGVuIGEgdHJhY2sgaXMgYWRkZWQgb3JcbiAgICAgICAgICAgIC8vIHJlbW92ZWQuIERvaW5nIGl0IG1hbnVhbGx5IHNpbmNlIHdlIHdhbnQgdG8gYXZvaWQgYSByZWN1cnNpb24uXG4gICAgICAgICAgICBzdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcignYWRkdHJhY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGYuc3JjKSB7XG4gICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChzZWxmLnNyYyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2VsZi5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0cmVhbS5hZGRFdmVudExpc3RlbmVyKCdyZW1vdmV0cmFjaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBpZiAoc2VsZi5zcmMpIHtcbiAgICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHNlbGYuc3JjKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZWxmLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHNoaW1BZGRUcmFja1JlbW92ZVRyYWNrV2l0aE5hdGl2ZTogZnVuY3Rpb24od2luZG93KSB7XG4gICAgLy8gc2hpbSBhZGRUcmFjay9yZW1vdmVUcmFjayB3aXRoIG5hdGl2ZSB2YXJpYW50cyBpbiBvcmRlciB0byBtYWtlXG4gICAgLy8gdGhlIGludGVyYWN0aW9ucyB3aXRoIGxlZ2FjeSBnZXRMb2NhbFN0cmVhbXMgYmVoYXZlIGFzIGluIG90aGVyIGJyb3dzZXJzLlxuICAgIC8vIEtlZXBzIGEgbWFwcGluZyBzdHJlYW0uaWQgPT4gW3N0cmVhbSwgcnRwc2VuZGVycy4uLl1cbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldExvY2FsU3RyZWFtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBjID0gdGhpcztcbiAgICAgIHRoaXMuX3NoaW1tZWRMb2NhbFN0cmVhbXMgPSB0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zIHx8IHt9O1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX3NoaW1tZWRMb2NhbFN0cmVhbXMpLm1hcChmdW5jdGlvbihzdHJlYW1JZCkge1xuICAgICAgICByZXR1cm4gcGMuX3NoaW1tZWRMb2NhbFN0cmVhbXNbc3RyZWFtSWRdWzBdO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciBvcmlnQWRkVHJhY2sgPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFRyYWNrO1xuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkVHJhY2sgPSBmdW5jdGlvbih0cmFjaywgc3RyZWFtKSB7XG4gICAgICBpZiAoIXN0cmVhbSkge1xuICAgICAgICByZXR1cm4gb3JpZ0FkZFRyYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zID0gdGhpcy5fc2hpbW1lZExvY2FsU3RyZWFtcyB8fCB7fTtcblxuICAgICAgdmFyIHNlbmRlciA9IG9yaWdBZGRUcmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKCF0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zW3N0cmVhbS5pZF0pIHtcbiAgICAgICAgdGhpcy5fc2hpbW1lZExvY2FsU3RyZWFtc1tzdHJlYW0uaWRdID0gW3N0cmVhbSwgc2VuZGVyXTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fc2hpbW1lZExvY2FsU3RyZWFtc1tzdHJlYW0uaWRdLmluZGV4T2Yoc2VuZGVyKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5fc2hpbW1lZExvY2FsU3RyZWFtc1tzdHJlYW0uaWRdLnB1c2goc2VuZGVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZW5kZXI7XG4gICAgfTtcblxuICAgIHZhciBvcmlnQWRkU3RyZWFtID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRTdHJlYW07XG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIHZhciBwYyA9IHRoaXM7XG4gICAgICB0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zID0gdGhpcy5fc2hpbW1lZExvY2FsU3RyZWFtcyB8fCB7fTtcblxuICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgdmFyIGFscmVhZHlFeGlzdHMgPSBwYy5nZXRTZW5kZXJzKCkuZmluZChmdW5jdGlvbihzKSB7XG4gICAgICAgICAgcmV0dXJuIHMudHJhY2sgPT09IHRyYWNrO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGFscmVhZHlFeGlzdHMpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKCdUcmFjayBhbHJlYWR5IGV4aXN0cy4nLFxuICAgICAgICAgICAgICAnSW52YWxpZEFjY2Vzc0Vycm9yJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdmFyIGV4aXN0aW5nU2VuZGVycyA9IHBjLmdldFNlbmRlcnMoKTtcbiAgICAgIG9yaWdBZGRTdHJlYW0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHZhciBuZXdTZW5kZXJzID0gcGMuZ2V0U2VuZGVycygpLmZpbHRlcihmdW5jdGlvbihuZXdTZW5kZXIpIHtcbiAgICAgICAgcmV0dXJuIGV4aXN0aW5nU2VuZGVycy5pbmRleE9mKG5ld1NlbmRlcikgPT09IC0xO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zW3N0cmVhbS5pZF0gPSBbc3RyZWFtXS5jb25jYXQobmV3U2VuZGVycyk7XG4gICAgfTtcblxuICAgIHZhciBvcmlnUmVtb3ZlU3RyZWFtID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW07XG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIHRoaXMuX3NoaW1tZWRMb2NhbFN0cmVhbXMgPSB0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zIHx8IHt9O1xuICAgICAgZGVsZXRlIHRoaXMuX3NoaW1tZWRMb2NhbFN0cmVhbXNbc3RyZWFtLmlkXTtcbiAgICAgIHJldHVybiBvcmlnUmVtb3ZlU3RyZWFtLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIHZhciBvcmlnUmVtb3ZlVHJhY2sgPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnJlbW92ZVRyYWNrO1xuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUucmVtb3ZlVHJhY2sgPSBmdW5jdGlvbihzZW5kZXIpIHtcbiAgICAgIHZhciBwYyA9IHRoaXM7XG4gICAgICB0aGlzLl9zaGltbWVkTG9jYWxTdHJlYW1zID0gdGhpcy5fc2hpbW1lZExvY2FsU3RyZWFtcyB8fCB7fTtcbiAgICAgIGlmIChzZW5kZXIpIHtcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5fc2hpbW1lZExvY2FsU3RyZWFtcykuZm9yRWFjaChmdW5jdGlvbihzdHJlYW1JZCkge1xuICAgICAgICAgIHZhciBpZHggPSBwYy5fc2hpbW1lZExvY2FsU3RyZWFtc1tzdHJlYW1JZF0uaW5kZXhPZihzZW5kZXIpO1xuICAgICAgICAgIGlmIChpZHggIT09IC0xKSB7XG4gICAgICAgICAgICBwYy5fc2hpbW1lZExvY2FsU3RyZWFtc1tzdHJlYW1JZF0uc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwYy5fc2hpbW1lZExvY2FsU3RyZWFtc1tzdHJlYW1JZF0ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBkZWxldGUgcGMuX3NoaW1tZWRMb2NhbFN0cmVhbXNbc3RyZWFtSWRdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3JpZ1JlbW92ZVRyYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfSxcblxuICBzaGltQWRkVHJhY2tSZW1vdmVUcmFjazogZnVuY3Rpb24od2luZG93KSB7XG4gICAgdmFyIGJyb3dzZXJEZXRhaWxzID0gdXRpbHMuZGV0ZWN0QnJvd3Nlcih3aW5kb3cpO1xuICAgIC8vIHNoaW0gYWRkVHJhY2sgYW5kIHJlbW92ZVRyYWNrLlxuICAgIGlmICh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFRyYWNrICYmXG4gICAgICAgIGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPj0gNjUpIHtcbiAgICAgIHJldHVybiB0aGlzLnNoaW1BZGRUcmFja1JlbW92ZVRyYWNrV2l0aE5hdGl2ZSh3aW5kb3cpO1xuICAgIH1cblxuICAgIC8vIGFsc28gc2hpbSBwYy5nZXRMb2NhbFN0cmVhbXMgd2hlbiBhZGRUcmFjayBpcyBzaGltbWVkXG4gICAgLy8gdG8gcmV0dXJuIHRoZSBvcmlnaW5hbCBzdHJlYW1zLlxuICAgIHZhciBvcmlnR2V0TG9jYWxTdHJlYW1zID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVxuICAgICAgICAuZ2V0TG9jYWxTdHJlYW1zO1xuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0TG9jYWxTdHJlYW1zID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGMgPSB0aGlzO1xuICAgICAgdmFyIG5hdGl2ZVN0cmVhbXMgPSBvcmlnR2V0TG9jYWxTdHJlYW1zLmFwcGx5KHRoaXMpO1xuICAgICAgcGMuX3JldmVyc2VTdHJlYW1zID0gcGMuX3JldmVyc2VTdHJlYW1zIHx8IHt9O1xuICAgICAgcmV0dXJuIG5hdGl2ZVN0cmVhbXMubWFwKGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICByZXR1cm4gcGMuX3JldmVyc2VTdHJlYW1zW3N0cmVhbS5pZF07XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIG9yaWdBZGRTdHJlYW0gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFN0cmVhbTtcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgdmFyIHBjID0gdGhpcztcbiAgICAgIHBjLl9zdHJlYW1zID0gcGMuX3N0cmVhbXMgfHwge307XG4gICAgICBwYy5fcmV2ZXJzZVN0cmVhbXMgPSBwYy5fcmV2ZXJzZVN0cmVhbXMgfHwge307XG5cbiAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgIHZhciBhbHJlYWR5RXhpc3RzID0gcGMuZ2V0U2VuZGVycygpLmZpbmQoZnVuY3Rpb24ocykge1xuICAgICAgICAgIHJldHVybiBzLnRyYWNrID09PSB0cmFjaztcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChhbHJlYWR5RXhpc3RzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbignVHJhY2sgYWxyZWFkeSBleGlzdHMuJyxcbiAgICAgICAgICAgICAgJ0ludmFsaWRBY2Nlc3NFcnJvcicpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIEFkZCBpZGVudGl0eSBtYXBwaW5nIGZvciBjb25zaXN0ZW5jeSB3aXRoIGFkZFRyYWNrLlxuICAgICAgLy8gVW5sZXNzIHRoaXMgaXMgYmVpbmcgdXNlZCB3aXRoIGEgc3RyZWFtIGZyb20gYWRkVHJhY2suXG4gICAgICBpZiAoIXBjLl9yZXZlcnNlU3RyZWFtc1tzdHJlYW0uaWRdKSB7XG4gICAgICAgIHZhciBuZXdTdHJlYW0gPSBuZXcgd2luZG93Lk1lZGlhU3RyZWFtKHN0cmVhbS5nZXRUcmFja3MoKSk7XG4gICAgICAgIHBjLl9zdHJlYW1zW3N0cmVhbS5pZF0gPSBuZXdTdHJlYW07XG4gICAgICAgIHBjLl9yZXZlcnNlU3RyZWFtc1tuZXdTdHJlYW0uaWRdID0gc3RyZWFtO1xuICAgICAgICBzdHJlYW0gPSBuZXdTdHJlYW07XG4gICAgICB9XG4gICAgICBvcmlnQWRkU3RyZWFtLmFwcGx5KHBjLCBbc3RyZWFtXSk7XG4gICAgfTtcblxuICAgIHZhciBvcmlnUmVtb3ZlU3RyZWFtID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW07XG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIHZhciBwYyA9IHRoaXM7XG4gICAgICBwYy5fc3RyZWFtcyA9IHBjLl9zdHJlYW1zIHx8IHt9O1xuICAgICAgcGMuX3JldmVyc2VTdHJlYW1zID0gcGMuX3JldmVyc2VTdHJlYW1zIHx8IHt9O1xuXG4gICAgICBvcmlnUmVtb3ZlU3RyZWFtLmFwcGx5KHBjLCBbKHBjLl9zdHJlYW1zW3N0cmVhbS5pZF0gfHwgc3RyZWFtKV0pO1xuICAgICAgZGVsZXRlIHBjLl9yZXZlcnNlU3RyZWFtc1socGMuX3N0cmVhbXNbc3RyZWFtLmlkXSA/XG4gICAgICAgICAgcGMuX3N0cmVhbXNbc3RyZWFtLmlkXS5pZCA6IHN0cmVhbS5pZCldO1xuICAgICAgZGVsZXRlIHBjLl9zdHJlYW1zW3N0cmVhbS5pZF07XG4gICAgfTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkVHJhY2sgPSBmdW5jdGlvbih0cmFjaywgc3RyZWFtKSB7XG4gICAgICB2YXIgcGMgPSB0aGlzO1xuICAgICAgaWYgKHBjLnNpZ25hbGluZ1N0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICAgICdUaGUgUlRDUGVlckNvbm5lY3Rpb25cXCdzIHNpZ25hbGluZ1N0YXRlIGlzIFxcJ2Nsb3NlZFxcJy4nLFxuICAgICAgICAgICdJbnZhbGlkU3RhdGVFcnJvcicpO1xuICAgICAgfVxuICAgICAgdmFyIHN0cmVhbXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBpZiAoc3RyZWFtcy5sZW5ndGggIT09IDEgfHxcbiAgICAgICAgICAhc3RyZWFtc1swXS5nZXRUcmFja3MoKS5maW5kKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0ID09PSB0cmFjaztcbiAgICAgICAgICB9KSkge1xuICAgICAgICAvLyB0aGlzIGlzIG5vdCBmdWxseSBjb3JyZWN0IGJ1dCBhbGwgd2UgY2FuIG1hbmFnZSB3aXRob3V0XG4gICAgICAgIC8vIFtbYXNzb2NpYXRlZCBNZWRpYVN0cmVhbXNdXSBpbnRlcm5hbCBzbG90LlxuICAgICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICAgICdUaGUgYWRhcHRlci5qcyBhZGRUcmFjayBwb2x5ZmlsbCBvbmx5IHN1cHBvcnRzIGEgc2luZ2xlICcgK1xuICAgICAgICAgICcgc3RyZWFtIHdoaWNoIGlzIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIHRyYWNrLicsXG4gICAgICAgICAgJ05vdFN1cHBvcnRlZEVycm9yJyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBhbHJlYWR5RXhpc3RzID0gcGMuZ2V0U2VuZGVycygpLmZpbmQoZnVuY3Rpb24ocykge1xuICAgICAgICByZXR1cm4gcy50cmFjayA9PT0gdHJhY2s7XG4gICAgICB9KTtcbiAgICAgIGlmIChhbHJlYWR5RXhpc3RzKSB7XG4gICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oJ1RyYWNrIGFscmVhZHkgZXhpc3RzLicsXG4gICAgICAgICAgICAnSW52YWxpZEFjY2Vzc0Vycm9yJyk7XG4gICAgICB9XG5cbiAgICAgIHBjLl9zdHJlYW1zID0gcGMuX3N0cmVhbXMgfHwge307XG4gICAgICBwYy5fcmV2ZXJzZVN0cmVhbXMgPSBwYy5fcmV2ZXJzZVN0cmVhbXMgfHwge307XG4gICAgICB2YXIgb2xkU3RyZWFtID0gcGMuX3N0cmVhbXNbc3RyZWFtLmlkXTtcbiAgICAgIGlmIChvbGRTdHJlYW0pIHtcbiAgICAgICAgLy8gdGhpcyBpcyB1c2luZyBvZGQgQ2hyb21lIGJlaGF2aW91ciwgdXNlIHdpdGggY2F1dGlvbjpcbiAgICAgICAgLy8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3dlYnJ0Yy9pc3N1ZXMvZGV0YWlsP2lkPTc4MTVcbiAgICAgICAgLy8gTm90ZTogd2UgcmVseSBvbiB0aGUgaGlnaC1sZXZlbCBhZGRUcmFjay9kdG1mIHNoaW0gdG9cbiAgICAgICAgLy8gY3JlYXRlIHRoZSBzZW5kZXIgd2l0aCBhIGR0bWYgc2VuZGVyLlxuICAgICAgICBvbGRTdHJlYW0uYWRkVHJhY2sodHJhY2spO1xuXG4gICAgICAgIC8vIFRyaWdnZXIgT05OIGFzeW5jLlxuICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHBjLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCduZWdvdGlhdGlvbm5lZWRlZCcpKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbmV3U3RyZWFtID0gbmV3IHdpbmRvdy5NZWRpYVN0cmVhbShbdHJhY2tdKTtcbiAgICAgICAgcGMuX3N0cmVhbXNbc3RyZWFtLmlkXSA9IG5ld1N0cmVhbTtcbiAgICAgICAgcGMuX3JldmVyc2VTdHJlYW1zW25ld1N0cmVhbS5pZF0gPSBzdHJlYW07XG4gICAgICAgIHBjLmFkZFN0cmVhbShuZXdTdHJlYW0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBjLmdldFNlbmRlcnMoKS5maW5kKGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIHMudHJhY2sgPT09IHRyYWNrO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIHJlcGxhY2UgdGhlIGludGVybmFsIHN0cmVhbSBpZCB3aXRoIHRoZSBleHRlcm5hbCBvbmUgYW5kXG4gICAgLy8gdmljZSB2ZXJzYS5cbiAgICBmdW5jdGlvbiByZXBsYWNlSW50ZXJuYWxTdHJlYW1JZChwYywgZGVzY3JpcHRpb24pIHtcbiAgICAgIHZhciBzZHAgPSBkZXNjcmlwdGlvbi5zZHA7XG4gICAgICBPYmplY3Qua2V5cyhwYy5fcmV2ZXJzZVN0cmVhbXMgfHwgW10pLmZvckVhY2goZnVuY3Rpb24oaW50ZXJuYWxJZCkge1xuICAgICAgICB2YXIgZXh0ZXJuYWxTdHJlYW0gPSBwYy5fcmV2ZXJzZVN0cmVhbXNbaW50ZXJuYWxJZF07XG4gICAgICAgIHZhciBpbnRlcm5hbFN0cmVhbSA9IHBjLl9zdHJlYW1zW2V4dGVybmFsU3RyZWFtLmlkXTtcbiAgICAgICAgc2RwID0gc2RwLnJlcGxhY2UobmV3IFJlZ0V4cChpbnRlcm5hbFN0cmVhbS5pZCwgJ2cnKSxcbiAgICAgICAgICAgIGV4dGVybmFsU3RyZWFtLmlkKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5ldyBSVENTZXNzaW9uRGVzY3JpcHRpb24oe1xuICAgICAgICB0eXBlOiBkZXNjcmlwdGlvbi50eXBlLFxuICAgICAgICBzZHA6IHNkcFxuICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlcGxhY2VFeHRlcm5hbFN0cmVhbUlkKHBjLCBkZXNjcmlwdGlvbikge1xuICAgICAgdmFyIHNkcCA9IGRlc2NyaXB0aW9uLnNkcDtcbiAgICAgIE9iamVjdC5rZXlzKHBjLl9yZXZlcnNlU3RyZWFtcyB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihpbnRlcm5hbElkKSB7XG4gICAgICAgIHZhciBleHRlcm5hbFN0cmVhbSA9IHBjLl9yZXZlcnNlU3RyZWFtc1tpbnRlcm5hbElkXTtcbiAgICAgICAgdmFyIGludGVybmFsU3RyZWFtID0gcGMuX3N0cmVhbXNbZXh0ZXJuYWxTdHJlYW0uaWRdO1xuICAgICAgICBzZHAgPSBzZHAucmVwbGFjZShuZXcgUmVnRXhwKGV4dGVybmFsU3RyZWFtLmlkLCAnZycpLFxuICAgICAgICAgICAgaW50ZXJuYWxTdHJlYW0uaWQpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbih7XG4gICAgICAgIHR5cGU6IGRlc2NyaXB0aW9uLnR5cGUsXG4gICAgICAgIHNkcDogc2RwXG4gICAgICB9KTtcbiAgICB9XG4gICAgWydjcmVhdGVPZmZlcicsICdjcmVhdGVBbnN3ZXInXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGMgPSB0aGlzO1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgdmFyIGlzTGVnYWN5Q2FsbCA9IGFyZ3VtZW50cy5sZW5ndGggJiZcbiAgICAgICAgICAgIHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdmdW5jdGlvbic7XG4gICAgICAgIGlmIChpc0xlZ2FjeUNhbGwpIHtcbiAgICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHBjLCBbXG4gICAgICAgICAgICBmdW5jdGlvbihkZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICB2YXIgZGVzYyA9IHJlcGxhY2VJbnRlcm5hbFN0cmVhbUlkKHBjLCBkZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgIGFyZ3NbMF0uYXBwbHkobnVsbCwgW2Rlc2NdKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGFyZ3NbMV0pIHtcbiAgICAgICAgICAgICAgICBhcmdzWzFdLmFwcGx5KG51bGwsIGVycik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGFyZ3VtZW50c1syXVxuICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkocGMsIGFyZ3VtZW50cylcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICByZXR1cm4gcmVwbGFjZUludGVybmFsU3RyZWFtSWQocGMsIGRlc2NyaXB0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgdmFyIG9yaWdTZXRMb2NhbERlc2NyaXB0aW9uID1cbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRMb2NhbERlc2NyaXB0aW9uO1xuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0TG9jYWxEZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBjID0gdGhpcztcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCB8fCAhYXJndW1lbnRzWzBdLnR5cGUpIHtcbiAgICAgICAgcmV0dXJuIG9yaWdTZXRMb2NhbERlc2NyaXB0aW9uLmFwcGx5KHBjLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgYXJndW1lbnRzWzBdID0gcmVwbGFjZUV4dGVybmFsU3RyZWFtSWQocGMsIGFyZ3VtZW50c1swXSk7XG4gICAgICByZXR1cm4gb3JpZ1NldExvY2FsRGVzY3JpcHRpb24uYXBwbHkocGMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIC8vIFRPRE86IG1hbmdsZSBnZXRTdGF0czogaHR0cHM6Ly93M2MuZ2l0aHViLmlvL3dlYnJ0Yy1zdGF0cy8jZG9tLXJ0Y21lZGlhc3RyZWFtc3RhdHMtc3RyZWFtaWRlbnRpZmllclxuXG4gICAgdmFyIG9yaWdMb2NhbERlc2NyaXB0aW9uID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihcbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSwgJ2xvY2FsRGVzY3JpcHRpb24nKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSxcbiAgICAgICAgJ2xvY2FsRGVzY3JpcHRpb24nLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBwYyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgZGVzY3JpcHRpb24gPSBvcmlnTG9jYWxEZXNjcmlwdGlvbi5nZXQuYXBwbHkodGhpcyk7XG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRpb24udHlwZSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VJbnRlcm5hbFN0cmVhbUlkKHBjLCBkZXNjcmlwdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUucmVtb3ZlVHJhY2sgPSBmdW5jdGlvbihzZW5kZXIpIHtcbiAgICAgIHZhciBwYyA9IHRoaXM7XG4gICAgICBpZiAocGMuc2lnbmFsaW5nU3RhdGUgPT09ICdjbG9zZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oXG4gICAgICAgICAgJ1RoZSBSVENQZWVyQ29ubmVjdGlvblxcJ3Mgc2lnbmFsaW5nU3RhdGUgaXMgXFwnY2xvc2VkXFwnLicsXG4gICAgICAgICAgJ0ludmFsaWRTdGF0ZUVycm9yJyk7XG4gICAgICB9XG4gICAgICAvLyBXZSBjYW4gbm90IHlldCBjaGVjayBmb3Igc2VuZGVyIGluc3RhbmNlb2YgUlRDUnRwU2VuZGVyXG4gICAgICAvLyBzaW5jZSB3ZSBzaGltIFJUUFNlbmRlci4gU28gd2UgY2hlY2sgaWYgc2VuZGVyLl9wYyBpcyBzZXQuXG4gICAgICBpZiAoIXNlbmRlci5fcGMpIHtcbiAgICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbignQXJndW1lbnQgMSBvZiBSVENQZWVyQ29ubmVjdGlvbi5yZW1vdmVUcmFjayAnICtcbiAgICAgICAgICAgICdkb2VzIG5vdCBpbXBsZW1lbnQgaW50ZXJmYWNlIFJUQ1J0cFNlbmRlci4nLCAnVHlwZUVycm9yJyk7XG4gICAgICB9XG4gICAgICB2YXIgaXNMb2NhbCA9IHNlbmRlci5fcGMgPT09IHBjO1xuICAgICAgaWYgKCFpc0xvY2FsKSB7XG4gICAgICAgIHRocm93IG5ldyBET01FeGNlcHRpb24oJ1NlbmRlciB3YXMgbm90IGNyZWF0ZWQgYnkgdGhpcyBjb25uZWN0aW9uLicsXG4gICAgICAgICAgICAnSW52YWxpZEFjY2Vzc0Vycm9yJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNlYXJjaCBmb3IgdGhlIG5hdGl2ZSBzdHJlYW0gdGhlIHNlbmRlcnMgdHJhY2sgYmVsb25ncyB0by5cbiAgICAgIHBjLl9zdHJlYW1zID0gcGMuX3N0cmVhbXMgfHwge307XG4gICAgICB2YXIgc3RyZWFtO1xuICAgICAgT2JqZWN0LmtleXMocGMuX3N0cmVhbXMpLmZvckVhY2goZnVuY3Rpb24oc3RyZWFtaWQpIHtcbiAgICAgICAgdmFyIGhhc1RyYWNrID0gcGMuX3N0cmVhbXNbc3RyZWFtaWRdLmdldFRyYWNrcygpLmZpbmQoZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICByZXR1cm4gc2VuZGVyLnRyYWNrID09PSB0cmFjaztcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChoYXNUcmFjaykge1xuICAgICAgICAgIHN0cmVhbSA9IHBjLl9zdHJlYW1zW3N0cmVhbWlkXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChzdHJlYW0pIHtcbiAgICAgICAgaWYgKHN0cmVhbS5nZXRUcmFja3MoKS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAvLyBpZiB0aGlzIGlzIHRoZSBsYXN0IHRyYWNrIG9mIHRoZSBzdHJlYW0sIHJlbW92ZSB0aGUgc3RyZWFtLiBUaGlzXG4gICAgICAgICAgLy8gdGFrZXMgY2FyZSBvZiBhbnkgc2hpbW1lZCBfc2VuZGVycy5cbiAgICAgICAgICBwYy5yZW1vdmVTdHJlYW0ocGMuX3JldmVyc2VTdHJlYW1zW3N0cmVhbS5pZF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHJlbHlpbmcgb24gdGhlIHNhbWUgb2RkIGNocm9tZSBiZWhhdmlvdXIgYXMgYWJvdmUuXG4gICAgICAgICAgc3RyZWFtLnJlbW92ZVRyYWNrKHNlbmRlci50cmFjayk7XG4gICAgICAgIH1cbiAgICAgICAgcGMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ25lZ290aWF0aW9ubmVlZGVkJykpO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG5cbiAgc2hpbVBlZXJDb25uZWN0aW9uOiBmdW5jdGlvbih3aW5kb3cpIHtcbiAgICB2YXIgYnJvd3NlckRldGFpbHMgPSB1dGlscy5kZXRlY3RCcm93c2VyKHdpbmRvdyk7XG5cbiAgICAvLyBUaGUgUlRDUGVlckNvbm5lY3Rpb24gb2JqZWN0LlxuICAgIGlmICghd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uICYmIHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbikge1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpIHtcbiAgICAgICAgLy8gVHJhbnNsYXRlIGljZVRyYW5zcG9ydFBvbGljeSB0byBpY2VUcmFuc3BvcnRzLFxuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC93ZWJydGMvaXNzdWVzL2RldGFpbD9pZD00ODY5XG4gICAgICAgIC8vIHRoaXMgd2FzIGZpeGVkIGluIE01NiBhbG9uZyB3aXRoIHVucHJlZml4aW5nIFJUQ1BlZXJDb25uZWN0aW9uLlxuICAgICAgICBsb2dnaW5nKCdQZWVyQ29ubmVjdGlvbicpO1xuICAgICAgICBpZiAocGNDb25maWcgJiYgcGNDb25maWcuaWNlVHJhbnNwb3J0UG9saWN5KSB7XG4gICAgICAgICAgcGNDb25maWcuaWNlVHJhbnNwb3J0cyA9IHBjQ29uZmlnLmljZVRyYW5zcG9ydFBvbGljeTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgd2luZG93LndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKTtcbiAgICAgIH07XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlID1cbiAgICAgICAgICB3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xuICAgICAgLy8gd3JhcCBzdGF0aWMgbWV0aG9kcy4gQ3VycmVudGx5IGp1c3QgZ2VuZXJhdGVDZXJ0aWZpY2F0ZS5cbiAgICAgIGlmICh3aW5kb3cud2Via2l0UlRDUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLCAnZ2VuZXJhdGVDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG1pZ3JhdGUgZnJvbSBub24tc3BlYyBSVENJY2VTZXJ2ZXIudXJsIHRvIFJUQ0ljZVNlcnZlci51cmxzXG4gICAgICB2YXIgT3JpZ1BlZXJDb25uZWN0aW9uID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uO1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpIHtcbiAgICAgICAgaWYgKHBjQ29uZmlnICYmIHBjQ29uZmlnLmljZVNlcnZlcnMpIHtcbiAgICAgICAgICB2YXIgbmV3SWNlU2VydmVycyA9IFtdO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGNDb25maWcuaWNlU2VydmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHNlcnZlciA9IHBjQ29uZmlnLmljZVNlcnZlcnNbaV07XG4gICAgICAgICAgICBpZiAoIXNlcnZlci5oYXNPd25Qcm9wZXJ0eSgndXJscycpICYmXG4gICAgICAgICAgICAgICAgc2VydmVyLmhhc093blByb3BlcnR5KCd1cmwnKSkge1xuICAgICAgICAgICAgICB1dGlscy5kZXByZWNhdGVkKCdSVENJY2VTZXJ2ZXIudXJsJywgJ1JUQ0ljZVNlcnZlci51cmxzJyk7XG4gICAgICAgICAgICAgIHNlcnZlciA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc2VydmVyKSk7XG4gICAgICAgICAgICAgIHNlcnZlci51cmxzID0gc2VydmVyLnVybDtcbiAgICAgICAgICAgICAgbmV3SWNlU2VydmVycy5wdXNoKHNlcnZlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXdJY2VTZXJ2ZXJzLnB1c2gocGNDb25maWcuaWNlU2VydmVyc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHBjQ29uZmlnLmljZVNlcnZlcnMgPSBuZXdJY2VTZXJ2ZXJzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgT3JpZ1BlZXJDb25uZWN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKTtcbiAgICAgIH07XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlID0gT3JpZ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZTtcbiAgICAgIC8vIHdyYXAgc3RhdGljIG1ldGhvZHMuIEN1cnJlbnRseSBqdXN0IGdlbmVyYXRlQ2VydGlmaWNhdGUuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLCAnZ2VuZXJhdGVDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gT3JpZ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBvcmlnR2V0U3RhdHMgPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFN0YXRzO1xuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U3RhdHMgPSBmdW5jdGlvbihzZWxlY3RvcixcbiAgICAgICAgc3VjY2Vzc0NhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG4gICAgICB2YXIgcGMgPSB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgIC8vIElmIHNlbGVjdG9yIGlzIGEgZnVuY3Rpb24gdGhlbiB3ZSBhcmUgaW4gdGhlIG9sZCBzdHlsZSBzdGF0cyBzbyBqdXN0XG4gICAgICAvLyBwYXNzIGJhY2sgdGhlIG9yaWdpbmFsIGdldFN0YXRzIGZvcm1hdCB0byBhdm9pZCBicmVha2luZyBvbGQgdXNlcnMuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgdHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBvcmlnR2V0U3RhdHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cblxuICAgICAgLy8gV2hlbiBzcGVjLXN0eWxlIGdldFN0YXRzIGlzIHN1cHBvcnRlZCwgcmV0dXJuIHRob3NlIHdoZW4gY2FsbGVkIHdpdGhcbiAgICAgIC8vIGVpdGhlciBubyBhcmd1bWVudHMgb3IgdGhlIHNlbGVjdG9yIGFyZ3VtZW50IGlzIG51bGwuXG4gICAgICBpZiAob3JpZ0dldFN0YXRzLmxlbmd0aCA9PT0gMCAmJiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgIHR5cGVvZiBhcmd1bWVudHNbMF0gIT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgIHJldHVybiBvcmlnR2V0U3RhdHMuYXBwbHkodGhpcywgW10pO1xuICAgICAgfVxuXG4gICAgICB2YXIgZml4Q2hyb21lU3RhdHNfID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgdmFyIHN0YW5kYXJkUmVwb3J0ID0ge307XG4gICAgICAgIHZhciByZXBvcnRzID0gcmVzcG9uc2UucmVzdWx0KCk7XG4gICAgICAgIHJlcG9ydHMuZm9yRWFjaChmdW5jdGlvbihyZXBvcnQpIHtcbiAgICAgICAgICB2YXIgc3RhbmRhcmRTdGF0cyA9IHtcbiAgICAgICAgICAgIGlkOiByZXBvcnQuaWQsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IHJlcG9ydC50aW1lc3RhbXAsXG4gICAgICAgICAgICB0eXBlOiB7XG4gICAgICAgICAgICAgIGxvY2FsY2FuZGlkYXRlOiAnbG9jYWwtY2FuZGlkYXRlJyxcbiAgICAgICAgICAgICAgcmVtb3RlY2FuZGlkYXRlOiAncmVtb3RlLWNhbmRpZGF0ZSdcbiAgICAgICAgICAgIH1bcmVwb3J0LnR5cGVdIHx8IHJlcG9ydC50eXBlXG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXBvcnQubmFtZXMoKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgIHN0YW5kYXJkU3RhdHNbbmFtZV0gPSByZXBvcnQuc3RhdChuYW1lKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBzdGFuZGFyZFJlcG9ydFtzdGFuZGFyZFN0YXRzLmlkXSA9IHN0YW5kYXJkU3RhdHM7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzdGFuZGFyZFJlcG9ydDtcbiAgICAgIH07XG5cbiAgICAgIC8vIHNoaW0gZ2V0U3RhdHMgd2l0aCBtYXBsaWtlIHN1cHBvcnRcbiAgICAgIHZhciBtYWtlTWFwU3RhdHMgPSBmdW5jdGlvbihzdGF0cykge1xuICAgICAgICByZXR1cm4gbmV3IE1hcChPYmplY3Qua2V5cyhzdGF0cykubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgIHJldHVybiBba2V5LCBzdGF0c1trZXldXTtcbiAgICAgICAgfSkpO1xuICAgICAgfTtcblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMikge1xuICAgICAgICB2YXIgc3VjY2Vzc0NhbGxiYWNrV3JhcHBlcl8gPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgIGFyZ3NbMV0obWFrZU1hcFN0YXRzKGZpeENocm9tZVN0YXRzXyhyZXNwb25zZSkpKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gb3JpZ0dldFN0YXRzLmFwcGx5KHRoaXMsIFtzdWNjZXNzQ2FsbGJhY2tXcmFwcGVyXyxcbiAgICAgICAgICBhcmd1bWVudHNbMF1dKTtcbiAgICAgIH1cblxuICAgICAgLy8gcHJvbWlzZS1zdXBwb3J0XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIG9yaWdHZXRTdGF0cy5hcHBseShwYywgW1xuICAgICAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXNvbHZlKG1ha2VNYXBTdGF0cyhmaXhDaHJvbWVTdGF0c18ocmVzcG9uc2UpKSk7XG4gICAgICAgICAgfSwgcmVqZWN0XSk7XG4gICAgICB9KS50aGVuKHN1Y2Nlc3NDYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG4gICAgfTtcblxuICAgIC8vIGFkZCBwcm9taXNlIHN1cHBvcnQgLS0gbmF0aXZlbHkgYXZhaWxhYmxlIGluIENocm9tZSA1MVxuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNTEpIHtcbiAgICAgIFsnc2V0TG9jYWxEZXNjcmlwdGlvbicsICdzZXRSZW1vdGVEZXNjcmlwdGlvbicsICdhZGRJY2VDYW5kaWRhdGUnXVxuICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgdmFyIHBjID0gdGhpcztcbiAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBuYXRpdmVNZXRob2QuYXBwbHkocGMsIFthcmdzWzBdLCByZXNvbHZlLCByZWplY3RdKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGFyZ3NbMV0uYXBwbHkobnVsbCwgW10pO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgICAgICAgYXJnc1syXS5hcHBseShudWxsLCBbZXJyXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gcHJvbWlzZSBzdXBwb3J0IGZvciBjcmVhdGVPZmZlciBhbmQgY3JlYXRlQW5zd2VyLiBBdmFpbGFibGUgKHdpdGhvdXRcbiAgICAvLyBidWdzKSBzaW5jZSBNNTI6IGNyYnVnLzYxOTI4OVxuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNTIpIHtcbiAgICAgIFsnY3JlYXRlT2ZmZXInLCAnY3JlYXRlQW5zd2VyJ10uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHBjID0gdGhpcztcbiAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEgfHwgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiZcbiAgICAgICAgICAgICAgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgICB2YXIgb3B0cyA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgIG5hdGl2ZU1ldGhvZC5hcHBseShwYywgW3Jlc29sdmUsIHJlamVjdCwgb3B0c10pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuYXRpdmVNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHNoaW0gaW1wbGljaXQgY3JlYXRpb24gb2YgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uL1JUQ0ljZUNhbmRpZGF0ZVxuICAgIFsnc2V0TG9jYWxEZXNjcmlwdGlvbicsICdzZXRSZW1vdGVEZXNjcmlwdGlvbicsICdhZGRJY2VDYW5kaWRhdGUnXVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICB2YXIgbmF0aXZlTWV0aG9kID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZVttZXRob2RdO1xuICAgICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXJndW1lbnRzWzBdID0gbmV3ICgobWV0aG9kID09PSAnYWRkSWNlQ2FuZGlkYXRlJykgP1xuICAgICAgICAgICAgICAgIHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgOlxuICAgICAgICAgICAgICAgIHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24pKGFyZ3VtZW50c1swXSk7XG4gICAgICAgICAgICByZXR1cm4gbmF0aXZlTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBhZGRJY2VDYW5kaWRhdGUobnVsbCBvciB1bmRlZmluZWQpXG4gICAgdmFyIG5hdGl2ZUFkZEljZUNhbmRpZGF0ZSA9XG4gICAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlO1xuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50c1swXSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzWzFdKSB7XG4gICAgICAgICAgYXJndW1lbnRzWzFdLmFwcGx5KG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuYXRpdmVBZGRJY2VDYW5kaWRhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG59O1xuXG59LHtcIi4uL3V0aWxzLmpzXCI6MTMsXCIuL2dldHVzZXJtZWRpYVwiOjZ9XSw2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMuanMnKTtcbnZhciBsb2dnaW5nID0gdXRpbHMubG9nO1xuXG4vLyBFeHBvc2UgcHVibGljIG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHdpbmRvdykge1xuICB2YXIgYnJvd3NlckRldGFpbHMgPSB1dGlscy5kZXRlY3RCcm93c2VyKHdpbmRvdyk7XG4gIHZhciBuYXZpZ2F0b3IgPSB3aW5kb3cgJiYgd2luZG93Lm5hdmlnYXRvcjtcblxuICB2YXIgY29uc3RyYWludHNUb0Nocm9tZV8gPSBmdW5jdGlvbihjKSB7XG4gICAgaWYgKHR5cGVvZiBjICE9PSAnb2JqZWN0JyB8fCBjLm1hbmRhdG9yeSB8fCBjLm9wdGlvbmFsKSB7XG4gICAgICByZXR1cm4gYztcbiAgICB9XG4gICAgdmFyIGNjID0ge307XG4gICAgT2JqZWN0LmtleXMoYykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZXF1aXJlJyB8fCBrZXkgPT09ICdhZHZhbmNlZCcgfHwga2V5ID09PSAnbWVkaWFTb3VyY2UnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciByID0gKHR5cGVvZiBjW2tleV0gPT09ICdvYmplY3QnKSA/IGNba2V5XSA6IHtpZGVhbDogY1trZXldfTtcbiAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHIuZXhhY3QgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHIubWluID0gci5tYXggPSByLmV4YWN0O1xuICAgICAgfVxuICAgICAgdmFyIG9sZG5hbWVfID0gZnVuY3Rpb24ocHJlZml4LCBuYW1lKSB7XG4gICAgICAgIGlmIChwcmVmaXgpIHtcbiAgICAgICAgICByZXR1cm4gcHJlZml4ICsgbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc2xpY2UoMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuYW1lID09PSAnZGV2aWNlSWQnKSA/ICdzb3VyY2VJZCcgOiBuYW1lO1xuICAgICAgfTtcbiAgICAgIGlmIChyLmlkZWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY2Mub3B0aW9uYWwgPSBjYy5vcHRpb25hbCB8fCBbXTtcbiAgICAgICAgdmFyIG9jID0ge307XG4gICAgICAgIGlmICh0eXBlb2Ygci5pZGVhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBvY1tvbGRuYW1lXygnbWluJywga2V5KV0gPSByLmlkZWFsO1xuICAgICAgICAgIGNjLm9wdGlvbmFsLnB1c2gob2MpO1xuICAgICAgICAgIG9jID0ge307XG4gICAgICAgICAgb2Nbb2xkbmFtZV8oJ21heCcsIGtleSldID0gci5pZGVhbDtcbiAgICAgICAgICBjYy5vcHRpb25hbC5wdXNoKG9jKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvY1tvbGRuYW1lXygnJywga2V5KV0gPSByLmlkZWFsO1xuICAgICAgICAgIGNjLm9wdGlvbmFsLnB1c2gob2MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoci5leGFjdCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiByLmV4YWN0ICE9PSAnbnVtYmVyJykge1xuICAgICAgICBjYy5tYW5kYXRvcnkgPSBjYy5tYW5kYXRvcnkgfHwge307XG4gICAgICAgIGNjLm1hbmRhdG9yeVtvbGRuYW1lXygnJywga2V5KV0gPSByLmV4YWN0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgWydtaW4nLCAnbWF4J10uZm9yRWFjaChmdW5jdGlvbihtaXgpIHtcbiAgICAgICAgICBpZiAoclttaXhdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNjLm1hbmRhdG9yeSA9IGNjLm1hbmRhdG9yeSB8fCB7fTtcbiAgICAgICAgICAgIGNjLm1hbmRhdG9yeVtvbGRuYW1lXyhtaXgsIGtleSldID0gclttaXhdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKGMuYWR2YW5jZWQpIHtcbiAgICAgIGNjLm9wdGlvbmFsID0gKGNjLm9wdGlvbmFsIHx8IFtdKS5jb25jYXQoYy5hZHZhbmNlZCk7XG4gICAgfVxuICAgIHJldHVybiBjYztcbiAgfTtcblxuICB2YXIgc2hpbUNvbnN0cmFpbnRzXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzLCBmdW5jKSB7XG4gICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPj0gNjEpIHtcbiAgICAgIHJldHVybiBmdW5jKGNvbnN0cmFpbnRzKTtcbiAgICB9XG4gICAgY29uc3RyYWludHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgaWYgKGNvbnN0cmFpbnRzICYmIHR5cGVvZiBjb25zdHJhaW50cy5hdWRpbyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHZhciByZW1hcCA9IGZ1bmN0aW9uKG9iaiwgYSwgYikge1xuICAgICAgICBpZiAoYSBpbiBvYmogJiYgIShiIGluIG9iaikpIHtcbiAgICAgICAgICBvYmpbYl0gPSBvYmpbYV07XG4gICAgICAgICAgZGVsZXRlIG9ialthXTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNvbnN0cmFpbnRzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgICAgcmVtYXAoY29uc3RyYWludHMuYXVkaW8sICdhdXRvR2FpbkNvbnRyb2wnLCAnZ29vZ0F1dG9HYWluQ29udHJvbCcpO1xuICAgICAgcmVtYXAoY29uc3RyYWludHMuYXVkaW8sICdub2lzZVN1cHByZXNzaW9uJywgJ2dvb2dOb2lzZVN1cHByZXNzaW9uJyk7XG4gICAgICBjb25zdHJhaW50cy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGNvbnN0cmFpbnRzLmF1ZGlvKTtcbiAgICB9XG4gICAgaWYgKGNvbnN0cmFpbnRzICYmIHR5cGVvZiBjb25zdHJhaW50cy52aWRlbyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIC8vIFNoaW0gZmFjaW5nTW9kZSBmb3IgbW9iaWxlICYgc3VyZmFjZSBwcm8uXG4gICAgICB2YXIgZmFjZSA9IGNvbnN0cmFpbnRzLnZpZGVvLmZhY2luZ01vZGU7XG4gICAgICBmYWNlID0gZmFjZSAmJiAoKHR5cGVvZiBmYWNlID09PSAnb2JqZWN0JykgPyBmYWNlIDoge2lkZWFsOiBmYWNlfSk7XG4gICAgICB2YXIgZ2V0U3VwcG9ydGVkRmFjaW5nTW9kZUxpZXMgPSBicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNjY7XG5cbiAgICAgIGlmICgoZmFjZSAmJiAoZmFjZS5leGFjdCA9PT0gJ3VzZXInIHx8IGZhY2UuZXhhY3QgPT09ICdlbnZpcm9ubWVudCcgfHxcbiAgICAgICAgICAgICAgICAgICAgZmFjZS5pZGVhbCA9PT0gJ3VzZXInIHx8IGZhY2UuaWRlYWwgPT09ICdlbnZpcm9ubWVudCcpKSAmJlxuICAgICAgICAgICEobmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRTdXBwb3J0ZWRDb25zdHJhaW50cyAmJlxuICAgICAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRTdXBwb3J0ZWRDb25zdHJhaW50cygpLmZhY2luZ01vZGUgJiZcbiAgICAgICAgICAgICFnZXRTdXBwb3J0ZWRGYWNpbmdNb2RlTGllcykpIHtcbiAgICAgICAgZGVsZXRlIGNvbnN0cmFpbnRzLnZpZGVvLmZhY2luZ01vZGU7XG4gICAgICAgIHZhciBtYXRjaGVzO1xuICAgICAgICBpZiAoZmFjZS5leGFjdCA9PT0gJ2Vudmlyb25tZW50JyB8fCBmYWNlLmlkZWFsID09PSAnZW52aXJvbm1lbnQnKSB7XG4gICAgICAgICAgbWF0Y2hlcyA9IFsnYmFjaycsICdyZWFyJ107XG4gICAgICAgIH0gZWxzZSBpZiAoZmFjZS5leGFjdCA9PT0gJ3VzZXInIHx8IGZhY2UuaWRlYWwgPT09ICd1c2VyJykge1xuICAgICAgICAgIG1hdGNoZXMgPSBbJ2Zyb250J107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAvLyBMb29rIGZvciBtYXRjaGVzIGluIGxhYmVsLCBvciB1c2UgbGFzdCBjYW0gZm9yIGJhY2sgKHR5cGljYWwpLlxuICAgICAgICAgIHJldHVybiBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMoKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGRldmljZXMpIHtcbiAgICAgICAgICAgIGRldmljZXMgPSBkZXZpY2VzLmZpbHRlcihmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkLmtpbmQgPT09ICd2aWRlb2lucHV0JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGRldiA9IGRldmljZXMuZmluZChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzLnNvbWUoZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZC5sYWJlbC50b0xvd2VyQ2FzZSgpLmluZGV4T2YobWF0Y2gpICE9PSAtMTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghZGV2ICYmIGRldmljZXMubGVuZ3RoICYmIG1hdGNoZXMuaW5kZXhPZignYmFjaycpICE9PSAtMSkge1xuICAgICAgICAgICAgICBkZXYgPSBkZXZpY2VzW2RldmljZXMubGVuZ3RoIC0gMV07IC8vIG1vcmUgbGlrZWx5IHRoZSBiYWNrIGNhbVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRldikge1xuICAgICAgICAgICAgICBjb25zdHJhaW50cy52aWRlby5kZXZpY2VJZCA9IGZhY2UuZXhhY3QgPyB7ZXhhY3Q6IGRldi5kZXZpY2VJZH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aWRlYWw6IGRldi5kZXZpY2VJZH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdHJhaW50cy52aWRlbyA9IGNvbnN0cmFpbnRzVG9DaHJvbWVfKGNvbnN0cmFpbnRzLnZpZGVvKTtcbiAgICAgICAgICAgIGxvZ2dpbmcoJ2Nocm9tZTogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgICAgICAgICByZXR1cm4gZnVuYyhjb25zdHJhaW50cyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0cmFpbnRzLnZpZGVvID0gY29uc3RyYWludHNUb0Nocm9tZV8oY29uc3RyYWludHMudmlkZW8pO1xuICAgIH1cbiAgICBsb2dnaW5nKCdjaHJvbWU6ICcgKyBKU09OLnN0cmluZ2lmeShjb25zdHJhaW50cykpO1xuICAgIHJldHVybiBmdW5jKGNvbnN0cmFpbnRzKTtcbiAgfTtcblxuICB2YXIgc2hpbUVycm9yXyA9IGZ1bmN0aW9uKGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZToge1xuICAgICAgICBQZXJtaXNzaW9uRGVuaWVkRXJyb3I6ICdOb3RBbGxvd2VkRXJyb3InLFxuICAgICAgICBQZXJtaXNzaW9uRGlzbWlzc2VkRXJyb3I6ICdOb3RBbGxvd2VkRXJyb3InLFxuICAgICAgICBJbnZhbGlkU3RhdGVFcnJvcjogJ05vdEFsbG93ZWRFcnJvcicsXG4gICAgICAgIERldmljZXNOb3RGb3VuZEVycm9yOiAnTm90Rm91bmRFcnJvcicsXG4gICAgICAgIENvbnN0cmFpbnROb3RTYXRpc2ZpZWRFcnJvcjogJ092ZXJjb25zdHJhaW5lZEVycm9yJyxcbiAgICAgICAgVHJhY2tTdGFydEVycm9yOiAnTm90UmVhZGFibGVFcnJvcicsXG4gICAgICAgIE1lZGlhRGV2aWNlRmFpbGVkRHVlVG9TaHV0ZG93bjogJ05vdEFsbG93ZWRFcnJvcicsXG4gICAgICAgIE1lZGlhRGV2aWNlS2lsbFN3aXRjaE9uOiAnTm90QWxsb3dlZEVycm9yJyxcbiAgICAgICAgVGFiQ2FwdHVyZUVycm9yOiAnQWJvcnRFcnJvcicsXG4gICAgICAgIFNjcmVlbkNhcHR1cmVFcnJvcjogJ0Fib3J0RXJyb3InLFxuICAgICAgICBEZXZpY2VDYXB0dXJlRXJyb3I6ICdBYm9ydEVycm9yJ1xuICAgICAgfVtlLm5hbWVdIHx8IGUubmFtZSxcbiAgICAgIG1lc3NhZ2U6IGUubWVzc2FnZSxcbiAgICAgIGNvbnN0cmFpbnQ6IGUuY29uc3RyYWludE5hbWUsXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWUgKyAodGhpcy5tZXNzYWdlICYmICc6ICcpICsgdGhpcy5tZXNzYWdlO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgc2hpbUNvbnN0cmFpbnRzXyhjb25zdHJhaW50cywgZnVuY3Rpb24oYykge1xuICAgICAgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYShjLCBvblN1Y2Nlc3MsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKG9uRXJyb3IpIHtcbiAgICAgICAgICBvbkVycm9yKHNoaW1FcnJvcl8oZSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gZ2V0VXNlck1lZGlhXztcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHQgb2YgZ2V0VXNlck1lZGlhIGFzIGEgUHJvbWlzZS5cbiAgdmFyIGdldFVzZXJNZWRpYVByb21pc2VfID0gZnVuY3Rpb24oY29uc3RyYWludHMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCByZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuICB9O1xuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMgPSB7XG4gICAgICBnZXRVc2VyTWVkaWE6IGdldFVzZXJNZWRpYVByb21pc2VfLFxuICAgICAgZW51bWVyYXRlRGV2aWNlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgdmFyIGtpbmRzID0ge2F1ZGlvOiAnYXVkaW9pbnB1dCcsIHZpZGVvOiAndmlkZW9pbnB1dCd9O1xuICAgICAgICAgIHJldHVybiB3aW5kb3cuTWVkaWFTdHJlYW1UcmFjay5nZXRTb3VyY2VzKGZ1bmN0aW9uKGRldmljZXMpIHtcbiAgICAgICAgICAgIHJlc29sdmUoZGV2aWNlcy5tYXAoZnVuY3Rpb24oZGV2aWNlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7bGFiZWw6IGRldmljZS5sYWJlbCxcbiAgICAgICAgICAgICAgICBraW5kOiBraW5kc1tkZXZpY2Uua2luZF0sXG4gICAgICAgICAgICAgICAgZGV2aWNlSWQ6IGRldmljZS5pZCxcbiAgICAgICAgICAgICAgICBncm91cElkOiAnJ307XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGdldFN1cHBvcnRlZENvbnN0cmFpbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBkZXZpY2VJZDogdHJ1ZSwgZWNob0NhbmNlbGxhdGlvbjogdHJ1ZSwgZmFjaW5nTW9kZTogdHJ1ZSxcbiAgICAgICAgICBmcmFtZVJhdGU6IHRydWUsIGhlaWdodDogdHJ1ZSwgd2lkdGg6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQSBzaGltIGZvciBnZXRVc2VyTWVkaWEgbWV0aG9kIG9uIHRoZSBtZWRpYURldmljZXMgb2JqZWN0LlxuICAvLyBUT0RPKEthcHRlbkphbnNzb24pIHJlbW92ZSBvbmNlIGltcGxlbWVudGVkIGluIENocm9tZSBzdGFibGUuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgICByZXR1cm4gZ2V0VXNlck1lZGlhUHJvbWlzZV8oY29uc3RyYWludHMpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgLy8gRXZlbiB0aG91Z2ggQ2hyb21lIDQ1IGhhcyBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzIGFuZCBhIGdldFVzZXJNZWRpYVxuICAgIC8vIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSBQcm9taXNlLCBpdCBkb2VzIG5vdCBhY2NlcHQgc3BlYy1zdHlsZVxuICAgIC8vIGNvbnN0cmFpbnRzLlxuICAgIHZhciBvcmlnR2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEuXG4gICAgICAgIGJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEgPSBmdW5jdGlvbihjcykge1xuICAgICAgcmV0dXJuIHNoaW1Db25zdHJhaW50c18oY3MsIGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgcmV0dXJuIG9yaWdHZXRVc2VyTWVkaWEoYykudGhlbihmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICBpZiAoYy5hdWRpbyAmJiAhc3RyZWFtLmdldEF1ZGlvVHJhY2tzKCkubGVuZ3RoIHx8XG4gICAgICAgICAgICAgIGMudmlkZW8gJiYgIXN0cmVhbS5nZXRWaWRlb1RyYWNrcygpLmxlbmd0aCkge1xuICAgICAgICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICAgICAgdHJhY2suc3RvcCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRE9NRXhjZXB0aW9uKCcnLCAnTm90Rm91bmRFcnJvcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc3RyZWFtO1xuICAgICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHNoaW1FcnJvcl8oZSkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuICAvLyBEdW1teSBkZXZpY2VjaGFuZ2UgZXZlbnQgbWV0aG9kcy5cbiAgLy8gVE9ETyhLYXB0ZW5KYW5zc29uKSByZW1vdmUgb25jZSBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgc3RhYmxlLlxuICBpZiAodHlwZW9mIG5hdmlnYXRvci5tZWRpYURldmljZXMuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGxvZ2dpbmcoJ0R1bW15IG1lZGlhRGV2aWNlcy5hZGRFdmVudExpc3RlbmVyIGNhbGxlZC4nKTtcbiAgICB9O1xuICB9XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5yZW1vdmVFdmVudExpc3RlbmVyID09PSAndW5kZWZpbmVkJykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgbG9nZ2luZygnRHVtbXkgbWVkaWFEZXZpY2VzLnJlbW92ZUV2ZW50TGlzdGVuZXIgY2FsbGVkLicpO1xuICAgIH07XG4gIH1cbn07XG5cbn0se1wiLi4vdXRpbHMuanNcIjoxM31dLDc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTcgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBTRFBVdGlscyA9IHJlcXVpcmUoJ3NkcCcpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbVJUQ0ljZUNhbmRpZGF0ZTogZnVuY3Rpb24od2luZG93KSB7XG4gICAgLy8gZm91bmRhdGlvbiBpcyBhcmJpdHJhcmlseSBjaG9zZW4gYXMgYW4gaW5kaWNhdG9yIGZvciBmdWxsIHN1cHBvcnQgZm9yXG4gICAgLy8gaHR0cHM6Ly93M2MuZ2l0aHViLmlvL3dlYnJ0Yy1wYy8jcnRjaWNlY2FuZGlkYXRlLWludGVyZmFjZVxuICAgIGlmICghd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSB8fCAod2luZG93LlJUQ0ljZUNhbmRpZGF0ZSAmJiAnZm91bmRhdGlvbicgaW5cbiAgICAgICAgd2luZG93LlJUQ0ljZUNhbmRpZGF0ZS5wcm90b3R5cGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIE5hdGl2ZVJUQ0ljZUNhbmRpZGF0ZSA9IHdpbmRvdy5SVENJY2VDYW5kaWRhdGU7XG4gICAgd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgYT0gd2hpY2ggc2hvdWxkbid0IGJlIHBhcnQgb2YgdGhlIGNhbmRpZGF0ZSBzdHJpbmcuXG4gICAgICBpZiAodHlwZW9mIGFyZ3MgPT09ICdvYmplY3QnICYmIGFyZ3MuY2FuZGlkYXRlICYmXG4gICAgICAgICAgYXJncy5jYW5kaWRhdGUuaW5kZXhPZignYT0nKSA9PT0gMCkge1xuICAgICAgICBhcmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShhcmdzKSk7XG4gICAgICAgIGFyZ3MuY2FuZGlkYXRlID0gYXJncy5jYW5kaWRhdGUuc3Vic3RyKDIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXJncy5jYW5kaWRhdGUgJiYgYXJncy5jYW5kaWRhdGUubGVuZ3RoKSB7XG4gICAgICAgIC8vIEF1Z21lbnQgdGhlIG5hdGl2ZSBjYW5kaWRhdGUgd2l0aCB0aGUgcGFyc2VkIGZpZWxkcy5cbiAgICAgICAgdmFyIG5hdGl2ZUNhbmRpZGF0ZSA9IG5ldyBOYXRpdmVSVENJY2VDYW5kaWRhdGUoYXJncyk7XG4gICAgICAgIHZhciBwYXJzZWRDYW5kaWRhdGUgPSBTRFBVdGlscy5wYXJzZUNhbmRpZGF0ZShhcmdzLmNhbmRpZGF0ZSk7XG4gICAgICAgIHZhciBhdWdtZW50ZWRDYW5kaWRhdGUgPSBPYmplY3QuYXNzaWduKG5hdGl2ZUNhbmRpZGF0ZSxcbiAgICAgICAgICAgIHBhcnNlZENhbmRpZGF0ZSk7XG5cbiAgICAgICAgLy8gQWRkIGEgc2VyaWFsaXplciB0aGF0IGRvZXMgbm90IHNlcmlhbGl6ZSB0aGUgZXh0cmEgYXR0cmlidXRlcy5cbiAgICAgICAgYXVnbWVudGVkQ2FuZGlkYXRlLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjYW5kaWRhdGU6IGF1Z21lbnRlZENhbmRpZGF0ZS5jYW5kaWRhdGUsXG4gICAgICAgICAgICBzZHBNaWQ6IGF1Z21lbnRlZENhbmRpZGF0ZS5zZHBNaWQsXG4gICAgICAgICAgICBzZHBNTGluZUluZGV4OiBhdWdtZW50ZWRDYW5kaWRhdGUuc2RwTUxpbmVJbmRleCxcbiAgICAgICAgICAgIHVzZXJuYW1lRnJhZ21lbnQ6IGF1Z21lbnRlZENhbmRpZGF0ZS51c2VybmFtZUZyYWdtZW50LFxuICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBhdWdtZW50ZWRDYW5kaWRhdGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IE5hdGl2ZVJUQ0ljZUNhbmRpZGF0ZShhcmdzKTtcbiAgICB9O1xuICAgIHdpbmRvdy5SVENJY2VDYW5kaWRhdGUucHJvdG90eXBlID0gTmF0aXZlUlRDSWNlQ2FuZGlkYXRlLnByb3RvdHlwZTtcblxuICAgIC8vIEhvb2sgdXAgdGhlIGF1Z21lbnRlZCBjYW5kaWRhdGUgaW4gb25pY2VjYW5kaWRhdGUgYW5kXG4gICAgLy8gYWRkRXZlbnRMaXN0ZW5lcignaWNlY2FuZGlkYXRlJywgLi4uKVxuICAgIHV0aWxzLndyYXBQZWVyQ29ubmVjdGlvbkV2ZW50KHdpbmRvdywgJ2ljZWNhbmRpZGF0ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmIChlLmNhbmRpZGF0ZSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgJ2NhbmRpZGF0ZScsIHtcbiAgICAgICAgICB2YWx1ZTogbmV3IHdpbmRvdy5SVENJY2VDYW5kaWRhdGUoZS5jYW5kaWRhdGUpLFxuICAgICAgICAgIHdyaXRhYmxlOiAnZmFsc2UnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGU7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gc2hpbUNyZWF0ZU9iamVjdFVSTCBtdXN0IGJlIGNhbGxlZCBiZWZvcmUgc2hpbVNvdXJjZU9iamVjdCB0byBhdm9pZCBsb29wLlxuXG4gIHNoaW1DcmVhdGVPYmplY3RVUkw6IGZ1bmN0aW9uKHdpbmRvdykge1xuICAgIHZhciBVUkwgPSB3aW5kb3cgJiYgd2luZG93LlVSTDtcblxuICAgIGlmICghKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50ICYmXG4gICAgICAgICAgJ3NyY09iamVjdCcgaW4gd2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlICYmXG4gICAgICAgIFVSTC5jcmVhdGVPYmplY3RVUkwgJiYgVVJMLnJldm9rZU9iamVjdFVSTCkpIHtcbiAgICAgIC8vIE9ubHkgc2hpbSBDcmVhdGVPYmplY3RVUkwgdXNpbmcgc3JjT2JqZWN0IGlmIHNyY09iamVjdCBleGlzdHMuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHZhciBuYXRpdmVDcmVhdGVPYmplY3RVUkwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMLmJpbmQoVVJMKTtcbiAgICB2YXIgbmF0aXZlUmV2b2tlT2JqZWN0VVJMID0gVVJMLnJldm9rZU9iamVjdFVSTC5iaW5kKFVSTCk7XG4gICAgdmFyIHN0cmVhbXMgPSBuZXcgTWFwKCksIG5ld0lkID0gMDtcblxuICAgIFVSTC5jcmVhdGVPYmplY3RVUkwgPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIGlmICgnZ2V0VHJhY2tzJyBpbiBzdHJlYW0pIHtcbiAgICAgICAgdmFyIHVybCA9ICdwb2x5YmxvYjonICsgKCsrbmV3SWQpO1xuICAgICAgICBzdHJlYW1zLnNldCh1cmwsIHN0cmVhbSk7XG4gICAgICAgIHV0aWxzLmRlcHJlY2F0ZWQoJ1VSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKScsXG4gICAgICAgICAgICAnZWxlbS5zcmNPYmplY3QgPSBzdHJlYW0nKTtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuYXRpdmVDcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcbiAgICB9O1xuICAgIFVSTC5yZXZva2VPYmplY3RVUkwgPSBmdW5jdGlvbih1cmwpIHtcbiAgICAgIG5hdGl2ZVJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgICAgc3RyZWFtcy5kZWxldGUodXJsKTtcbiAgICB9O1xuXG4gICAgdmFyIGRzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iod2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzcmMnKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlLCAnc3JjJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRzYy5nZXQuYXBwbHkodGhpcyk7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgdGhpcy5zcmNPYmplY3QgPSBzdHJlYW1zLmdldCh1cmwpIHx8IG51bGw7XG4gICAgICAgIHJldHVybiBkc2Muc2V0LmFwcGx5KHRoaXMsIFt1cmxdKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBuYXRpdmVTZXRBdHRyaWJ1dGUgPSB3aW5kb3cuSFRNTE1lZGlhRWxlbWVudC5wcm90b3R5cGUuc2V0QXR0cmlidXRlO1xuICAgIHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZS5zZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyICYmXG4gICAgICAgICAgKCcnICsgYXJndW1lbnRzWzBdKS50b0xvd2VyQ2FzZSgpID09PSAnc3JjJykge1xuICAgICAgICB0aGlzLnNyY09iamVjdCA9IHN0cmVhbXMuZ2V0KGFyZ3VtZW50c1sxXSkgfHwgbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuYXRpdmVTZXRBdHRyaWJ1dGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9LFxuXG4gIHNoaW1NYXhNZXNzYWdlU2l6ZTogZnVuY3Rpb24od2luZG93KSB7XG4gICAgaWYgKHdpbmRvdy5SVENTY3RwVHJhbnNwb3J0IHx8ICF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGJyb3dzZXJEZXRhaWxzID0gdXRpbHMuZGV0ZWN0QnJvd3Nlcih3aW5kb3cpO1xuXG4gICAgaWYgKCEoJ3NjdHAnIGluIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSwgJ3NjdHAnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLl9zY3RwID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiB0aGlzLl9zY3RwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgc2N0cEluRGVzY3JpcHRpb24gPSBmdW5jdGlvbihkZXNjcmlwdGlvbikge1xuICAgICAgdmFyIHNlY3Rpb25zID0gU0RQVXRpbHMuc3BsaXRTZWN0aW9ucyhkZXNjcmlwdGlvbi5zZHApO1xuICAgICAgc2VjdGlvbnMuc2hpZnQoKTtcbiAgICAgIHJldHVybiBzZWN0aW9ucy5zb21lKGZ1bmN0aW9uKG1lZGlhU2VjdGlvbikge1xuICAgICAgICB2YXIgbUxpbmUgPSBTRFBVdGlscy5wYXJzZU1MaW5lKG1lZGlhU2VjdGlvbik7XG4gICAgICAgIHJldHVybiBtTGluZSAmJiBtTGluZS5raW5kID09PSAnYXBwbGljYXRpb24nXG4gICAgICAgICAgICAmJiBtTGluZS5wcm90b2NvbC5pbmRleE9mKCdTQ1RQJykgIT09IC0xO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHZhciBnZXRSZW1vdGVGaXJlZm94VmVyc2lvbiA9IGZ1bmN0aW9uKGRlc2NyaXB0aW9uKSB7XG4gICAgICAvLyBUT0RPOiBJcyB0aGVyZSBhIGJldHRlciBzb2x1dGlvbiBmb3IgZGV0ZWN0aW5nIEZpcmVmb3g/XG4gICAgICB2YXIgbWF0Y2ggPSBkZXNjcmlwdGlvbi5zZHAubWF0Y2goL21vemlsbGEuLi5USElTX0lTX1NEUEFSVEEtKFxcZCspLyk7XG4gICAgICBpZiAobWF0Y2ggPT09IG51bGwgfHwgbWF0Y2gubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICB2YXIgdmVyc2lvbiA9IHBhcnNlSW50KG1hdGNoWzFdLCAxMCk7XG4gICAgICAvLyBUZXN0IGZvciBOYU4gKHllcywgdGhpcyBpcyB1Z2x5KVxuICAgICAgcmV0dXJuIHZlcnNpb24gIT09IHZlcnNpb24gPyAtMSA6IHZlcnNpb247XG4gICAgfTtcblxuICAgIHZhciBnZXRDYW5TZW5kTWF4TWVzc2FnZVNpemUgPSBmdW5jdGlvbihyZW1vdGVJc0ZpcmVmb3gpIHtcbiAgICAgIC8vIEV2ZXJ5IGltcGxlbWVudGF0aW9uIHdlIGtub3cgY2FuIHNlbmQgYXQgbGVhc3QgNjQgS2lCLlxuICAgICAgLy8gTm90ZTogQWx0aG91Z2ggQ2hyb21lIGlzIHRlY2huaWNhbGx5IGFibGUgdG8gc2VuZCB1cCB0byAyNTYgS2lCLCB0aGVcbiAgICAgIC8vICAgICAgIGRhdGEgZG9lcyBub3QgcmVhY2ggdGhlIG90aGVyIHBlZXIgcmVsaWFibHkuXG4gICAgICAvLyAgICAgICBTZWU6IGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC93ZWJydGMvaXNzdWVzL2RldGFpbD9pZD04NDE5XG4gICAgICB2YXIgY2FuU2VuZE1heE1lc3NhZ2VTaXplID0gNjU1MzY7XG4gICAgICBpZiAoYnJvd3NlckRldGFpbHMuYnJvd3NlciA9PT0gJ2ZpcmVmb3gnKSB7XG4gICAgICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNTcpIHtcbiAgICAgICAgICBpZiAocmVtb3RlSXNGaXJlZm94ID09PSAtMSkge1xuICAgICAgICAgICAgLy8gRkYgPCA1NyB3aWxsIHNlbmQgaW4gMTYgS2lCIGNodW5rcyB1c2luZyB0aGUgZGVwcmVjYXRlZCBQUElEXG4gICAgICAgICAgICAvLyBmcmFnbWVudGF0aW9uLlxuICAgICAgICAgICAgY2FuU2VuZE1heE1lc3NhZ2VTaXplID0gMTYzODQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEhvd2V2ZXIsIG90aGVyIEZGIChhbmQgUkFXUlRDKSBjYW4gcmVhc3NlbWJsZSBQUElELWZyYWdtZW50ZWRcbiAgICAgICAgICAgIC8vIG1lc3NhZ2VzLiBUaHVzLCBzdXBwb3J0aW5nIH4yIEdpQiB3aGVuIHNlbmRpbmcuXG4gICAgICAgICAgICBjYW5TZW5kTWF4TWVzc2FnZVNpemUgPSAyMTQ3NDgzNjM3O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDdXJyZW50bHksIGFsbCBGRiA+PSA1NyB3aWxsIHJlc2V0IHRoZSByZW1vdGUgbWF4aW11bSBtZXNzYWdlIHNpemVcbiAgICAgICAgICAvLyB0byB0aGUgZGVmYXVsdCB2YWx1ZSB3aGVuIGEgZGF0YSBjaGFubmVsIGlzIGNyZWF0ZWQgYXQgYSBsYXRlclxuICAgICAgICAgIC8vIHN0YWdlLiA6KFxuICAgICAgICAgIC8vIFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTQyNjgzMVxuICAgICAgICAgIGNhblNlbmRNYXhNZXNzYWdlU2l6ZSA9XG4gICAgICAgICAgICBicm93c2VyRGV0YWlscy52ZXJzaW9uID09PSA1NyA/IDY1NTM1IDogNjU1MzY7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjYW5TZW5kTWF4TWVzc2FnZVNpemU7XG4gICAgfTtcblxuICAgIHZhciBnZXRNYXhNZXNzYWdlU2l6ZSA9IGZ1bmN0aW9uKGRlc2NyaXB0aW9uLCByZW1vdGVJc0ZpcmVmb3gpIHtcbiAgICAgIC8vIE5vdGU6IDY1NTM2IGJ5dGVzIGlzIHRoZSBkZWZhdWx0IHZhbHVlIGZyb20gdGhlIFNEUCBzcGVjLiBBbHNvLFxuICAgICAgLy8gICAgICAgZXZlcnkgaW1wbGVtZW50YXRpb24gd2Uga25vdyBzdXBwb3J0cyByZWNlaXZpbmcgNjU1MzYgYnl0ZXMuXG4gICAgICB2YXIgbWF4TWVzc2FnZVNpemUgPSA2NTUzNjtcblxuICAgICAgLy8gRkYgNTcgaGFzIGEgc2xpZ2h0bHkgaW5jb3JyZWN0IGRlZmF1bHQgcmVtb3RlIG1heCBtZXNzYWdlIHNpemUsIHNvXG4gICAgICAvLyB3ZSBuZWVkIHRvIGFkanVzdCBpdCBoZXJlIHRvIGF2b2lkIGEgZmFpbHVyZSB3aGVuIHNlbmRpbmcuXG4gICAgICAvLyBTZWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTE0MjU2OTdcbiAgICAgIGlmIChicm93c2VyRGV0YWlscy5icm93c2VyID09PSAnZmlyZWZveCdcbiAgICAgICAgICAgJiYgYnJvd3NlckRldGFpbHMudmVyc2lvbiA9PT0gNTcpIHtcbiAgICAgICAgbWF4TWVzc2FnZVNpemUgPSA2NTUzNTtcbiAgICAgIH1cblxuICAgICAgdmFyIG1hdGNoID0gU0RQVXRpbHMubWF0Y2hQcmVmaXgoZGVzY3JpcHRpb24uc2RwLCAnYT1tYXgtbWVzc2FnZS1zaXplOicpO1xuICAgICAgaWYgKG1hdGNoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbWF4TWVzc2FnZVNpemUgPSBwYXJzZUludChtYXRjaFswXS5zdWJzdHIoMTkpLCAxMCk7XG4gICAgICB9IGVsc2UgaWYgKGJyb3dzZXJEZXRhaWxzLmJyb3dzZXIgPT09ICdmaXJlZm94JyAmJlxuICAgICAgICAgICAgICAgICAgcmVtb3RlSXNGaXJlZm94ICE9PSAtMSkge1xuICAgICAgICAvLyBJZiB0aGUgbWF4aW11bSBtZXNzYWdlIHNpemUgaXMgbm90IHByZXNlbnQgaW4gdGhlIHJlbW90ZSBTRFAgYW5kXG4gICAgICAgIC8vIGJvdGggbG9jYWwgYW5kIHJlbW90ZSBhcmUgRmlyZWZveCwgdGhlIHJlbW90ZSBwZWVyIGNhbiByZWNlaXZlXG4gICAgICAgIC8vIH4yIEdpQi5cbiAgICAgICAgbWF4TWVzc2FnZVNpemUgPSAyMTQ3NDgzNjM3O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1heE1lc3NhZ2VTaXplO1xuICAgIH07XG5cbiAgICB2YXIgb3JpZ1NldFJlbW90ZURlc2NyaXB0aW9uID1cbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRSZW1vdGVEZXNjcmlwdGlvbjtcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldFJlbW90ZURlc2NyaXB0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGMgPSB0aGlzO1xuICAgICAgcGMuX3NjdHAgPSBudWxsO1xuXG4gICAgICBpZiAoc2N0cEluRGVzY3JpcHRpb24oYXJndW1lbnRzWzBdKSkge1xuICAgICAgICAvLyBDaGVjayBpZiB0aGUgcmVtb3RlIGlzIEZGLlxuICAgICAgICB2YXIgaXNGaXJlZm94ID0gZ2V0UmVtb3RlRmlyZWZveFZlcnNpb24oYXJndW1lbnRzWzBdKTtcblxuICAgICAgICAvLyBHZXQgdGhlIG1heGltdW0gbWVzc2FnZSBzaXplIHRoZSBsb2NhbCBwZWVyIGlzIGNhcGFibGUgb2Ygc2VuZGluZ1xuICAgICAgICB2YXIgY2FuU2VuZE1NUyA9IGdldENhblNlbmRNYXhNZXNzYWdlU2l6ZShpc0ZpcmVmb3gpO1xuXG4gICAgICAgIC8vIEdldCB0aGUgbWF4aW11bSBtZXNzYWdlIHNpemUgb2YgdGhlIHJlbW90ZSBwZWVyLlxuICAgICAgICB2YXIgcmVtb3RlTU1TID0gZ2V0TWF4TWVzc2FnZVNpemUoYXJndW1lbnRzWzBdLCBpc0ZpcmVmb3gpO1xuXG4gICAgICAgIC8vIERldGVybWluZSBmaW5hbCBtYXhpbXVtIG1lc3NhZ2Ugc2l6ZVxuICAgICAgICB2YXIgbWF4TWVzc2FnZVNpemU7XG4gICAgICAgIGlmIChjYW5TZW5kTU1TID09PSAwICYmIHJlbW90ZU1NUyA9PT0gMCkge1xuICAgICAgICAgIG1heE1lc3NhZ2VTaXplID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgICAgICB9IGVsc2UgaWYgKGNhblNlbmRNTVMgPT09IDAgfHwgcmVtb3RlTU1TID09PSAwKSB7XG4gICAgICAgICAgbWF4TWVzc2FnZVNpemUgPSBNYXRoLm1heChjYW5TZW5kTU1TLCByZW1vdGVNTVMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1heE1lc3NhZ2VTaXplID0gTWF0aC5taW4oY2FuU2VuZE1NUywgcmVtb3RlTU1TKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBhIGR1bW15IFJUQ1NjdHBUcmFuc3BvcnQgb2JqZWN0IGFuZCB0aGUgJ21heE1lc3NhZ2VTaXplJ1xuICAgICAgICAvLyBhdHRyaWJ1dGUuXG4gICAgICAgIHZhciBzY3RwID0ge307XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzY3RwLCAnbWF4TWVzc2FnZVNpemUnLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXhNZXNzYWdlU2l6ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBwYy5fc2N0cCA9IHNjdHA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvcmlnU2V0UmVtb3RlRGVzY3JpcHRpb24uYXBwbHkocGMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfSxcblxuICBzaGltU2VuZFRocm93VHlwZUVycm9yOiBmdW5jdGlvbih3aW5kb3cpIHtcbiAgICBpZiAoISh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gJiZcbiAgICAgICAgJ2NyZWF0ZURhdGFDaGFubmVsJyBpbiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE5vdGU6IEFsdGhvdWdoIEZpcmVmb3ggPj0gNTcgaGFzIGEgbmF0aXZlIGltcGxlbWVudGF0aW9uLCB0aGUgbWF4aW11bVxuICAgIC8vICAgICAgIG1lc3NhZ2Ugc2l6ZSBjYW4gYmUgcmVzZXQgZm9yIGFsbCBkYXRhIGNoYW5uZWxzIGF0IGEgbGF0ZXIgc3RhZ2UuXG4gICAgLy8gICAgICAgU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xNDI2ODMxXG5cbiAgICB2YXIgb3JpZ0NyZWF0ZURhdGFDaGFubmVsID1cbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlRGF0YUNoYW5uZWw7XG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVEYXRhQ2hhbm5lbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBjID0gdGhpcztcbiAgICAgIHZhciBkYXRhQ2hhbm5lbCA9IG9yaWdDcmVhdGVEYXRhQ2hhbm5lbC5hcHBseShwYywgYXJndW1lbnRzKTtcbiAgICAgIHZhciBvcmlnRGF0YUNoYW5uZWxTZW5kID0gZGF0YUNoYW5uZWwuc2VuZDtcblxuICAgICAgLy8gUGF0Y2ggJ3NlbmQnIG1ldGhvZFxuICAgICAgZGF0YUNoYW5uZWwuc2VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGMgPSB0aGlzO1xuICAgICAgICB2YXIgZGF0YSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgdmFyIGxlbmd0aCA9IGRhdGEubGVuZ3RoIHx8IGRhdGEuc2l6ZSB8fCBkYXRhLmJ5dGVMZW5ndGg7XG4gICAgICAgIGlmIChsZW5ndGggPiBwYy5zY3RwLm1heE1lc3NhZ2VTaXplKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbignTWVzc2FnZSB0b28gbGFyZ2UgKGNhbiBzZW5kIGEgbWF4aW11bSBvZiAnICtcbiAgICAgICAgICAgIHBjLnNjdHAubWF4TWVzc2FnZVNpemUgKyAnIGJ5dGVzKScsICdUeXBlRXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3JpZ0RhdGFDaGFubmVsU2VuZC5hcHBseShkYywgYXJndW1lbnRzKTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBkYXRhQ2hhbm5lbDtcbiAgICB9O1xuICB9XG59O1xuXG59LHtcIi4vdXRpbHNcIjoxMyxcInNkcFwiOjJ9XSw4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xudmFyIHNoaW1SVENQZWVyQ29ubmVjdGlvbiA9IHJlcXVpcmUoJ3J0Y3BlZXJjb25uZWN0aW9uLXNoaW0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1HZXRVc2VyTWVkaWE6IHJlcXVpcmUoJy4vZ2V0dXNlcm1lZGlhJyksXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24od2luZG93KSB7XG4gICAgdmFyIGJyb3dzZXJEZXRhaWxzID0gdXRpbHMuZGV0ZWN0QnJvd3Nlcih3aW5kb3cpO1xuXG4gICAgaWYgKHdpbmRvdy5SVENJY2VHYXRoZXJlcikge1xuICAgICAgaWYgKCF3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlKSB7XG4gICAgICAgIHdpbmRvdy5SVENJY2VDYW5kaWRhdGUgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3M7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoIXdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24pIHtcbiAgICAgICAgd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICByZXR1cm4gYXJncztcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIC8vIHRoaXMgYWRkcyBhbiBhZGRpdGlvbmFsIGV2ZW50IGxpc3RlbmVyIHRvIE1lZGlhU3RyYWNrVHJhY2sgdGhhdCBzaWduYWxzXG4gICAgICAvLyB3aGVuIGEgdHJhY2tzIGVuYWJsZWQgcHJvcGVydHkgd2FzIGNoYW5nZWQuIFdvcmthcm91bmQgZm9yIGEgYnVnIGluXG4gICAgICAvLyBhZGRTdHJlYW0sIHNlZSBiZWxvdy4gTm8gbG9uZ2VyIHJlcXVpcmVkIGluIDE1MDI1K1xuICAgICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCAxNTAyNSkge1xuICAgICAgICB2YXIgb3JpZ01TVEVuYWJsZWQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKFxuICAgICAgICAgICAgd2luZG93Lk1lZGlhU3RyZWFtVHJhY2sucHJvdG90eXBlLCAnZW5hYmxlZCcpO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93Lk1lZGlhU3RyZWFtVHJhY2sucHJvdG90eXBlLCAnZW5hYmxlZCcsIHtcbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBvcmlnTVNURW5hYmxlZC5zZXQuY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgICAgICB2YXIgZXYgPSBuZXcgRXZlbnQoJ2VuYWJsZWQnKTtcbiAgICAgICAgICAgIGV2LmVuYWJsZWQgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPUlRDIGRlZmluZXMgdGhlIERUTUYgc2VuZGVyIGEgYml0IGRpZmZlcmVudC5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdzNjL29ydGMvaXNzdWVzLzcxNFxuICAgIGlmICh3aW5kb3cuUlRDUnRwU2VuZGVyICYmICEoJ2R0bWYnIGluIHdpbmRvdy5SVENSdHBTZW5kZXIucHJvdG90eXBlKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENSdHBTZW5kZXIucHJvdG90eXBlLCAnZHRtZicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAodGhpcy5fZHRtZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50cmFjay5raW5kID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2R0bWYgPSBuZXcgd2luZG93LlJUQ0R0bWZTZW5kZXIodGhpcyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHJhY2sua2luZCA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgICAgICB0aGlzLl9kdG1mID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2R0bWY7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBFZGdlIGN1cnJlbnRseSBvbmx5IGltcGxlbWVudHMgdGhlIFJUQ0R0bWZTZW5kZXIsIG5vdCB0aGVcbiAgICAvLyBSVENEVE1GU2VuZGVyIGFsaWFzLiBTZWUgaHR0cDovL2RyYWZ0Lm9ydGMub3JnLyNydGNkdG1mc2VuZGVyMipcbiAgICBpZiAod2luZG93LlJUQ0R0bWZTZW5kZXIgJiYgIXdpbmRvdy5SVENEVE1GU2VuZGVyKSB7XG4gICAgICB3aW5kb3cuUlRDRFRNRlNlbmRlciA9IHdpbmRvdy5SVENEdG1mU2VuZGVyO1xuICAgIH1cblxuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9XG4gICAgICAgIHNoaW1SVENQZWVyQ29ubmVjdGlvbih3aW5kb3csIGJyb3dzZXJEZXRhaWxzLnZlcnNpb24pO1xuICB9LFxuICBzaGltUmVwbGFjZVRyYWNrOiBmdW5jdGlvbih3aW5kb3cpIHtcbiAgICAvLyBPUlRDIGhhcyByZXBsYWNlVHJhY2sgLS0gaHR0cHM6Ly9naXRodWIuY29tL3czYy9vcnRjL2lzc3Vlcy82MTRcbiAgICBpZiAod2luZG93LlJUQ1J0cFNlbmRlciAmJlxuICAgICAgICAhKCdyZXBsYWNlVHJhY2snIGluIHdpbmRvdy5SVENSdHBTZW5kZXIucHJvdG90eXBlKSkge1xuICAgICAgd2luZG93LlJUQ1J0cFNlbmRlci5wcm90b3R5cGUucmVwbGFjZVRyYWNrID1cbiAgICAgICAgICB3aW5kb3cuUlRDUnRwU2VuZGVyLnByb3RvdHlwZS5zZXRUcmFjaztcbiAgICB9XG4gIH1cbn07XG5cbn0se1wiLi4vdXRpbHNcIjoxMyxcIi4vZ2V0dXNlcm1lZGlhXCI6OSxcInJ0Y3BlZXJjb25uZWN0aW9uLXNoaW1cIjoxfV0sOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih3aW5kb3cpIHtcbiAgdmFyIG5hdmlnYXRvciA9IHdpbmRvdyAmJiB3aW5kb3cubmF2aWdhdG9yO1xuXG4gIHZhciBzaGltRXJyb3JfID0gZnVuY3Rpb24oZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiB7UGVybWlzc2lvbkRlbmllZEVycm9yOiAnTm90QWxsb3dlZEVycm9yJ31bZS5uYW1lXSB8fCBlLm5hbWUsXG4gICAgICBtZXNzYWdlOiBlLm1lc3NhZ2UsXG4gICAgICBjb25zdHJhaW50OiBlLmNvbnN0cmFpbnQsXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBnZXRVc2VyTWVkaWEgZXJyb3Igc2hpbS5cbiAgdmFyIG9yaWdHZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYS5cbiAgICAgIGJpbmQobmF2aWdhdG9yLm1lZGlhRGV2aWNlcyk7XG4gIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBvcmlnR2V0VXNlck1lZGlhKGMpLmNhdGNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChzaGltRXJyb3JfKGUpKTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbn0se31dLDEwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuIC8qIGVzbGludC1lbnYgbm9kZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hpbUdldFVzZXJNZWRpYTogcmVxdWlyZSgnLi9nZXR1c2VybWVkaWEnKSxcbiAgc2hpbU9uVHJhY2s6IGZ1bmN0aW9uKHdpbmRvdykge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gJiYgISgnb250cmFjaycgaW5cbiAgICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLCAnb250cmFjaycsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fb250cmFjaztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX29udHJhY2spIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbnRyYWNrKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWRkc3RyZWFtJywgdGhpcy5fb250cmFja3BvbHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYWNrJywgdGhpcy5fb250cmFjayA9IGYpO1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignYWRkc3RyZWFtJywgdGhpcy5fb250cmFja3BvbHkgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICAgIHZhciBldmVudCA9IG5ldyBFdmVudCgndHJhY2snKTtcbiAgICAgICAgICAgICAgZXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICAgICAgICAgICAgZXZlbnQucmVjZWl2ZXIgPSB7dHJhY2s6IHRyYWNrfTtcbiAgICAgICAgICAgICAgZXZlbnQudHJhbnNjZWl2ZXIgPSB7cmVjZWl2ZXI6IGV2ZW50LnJlY2VpdmVyfTtcbiAgICAgICAgICAgICAgZXZlbnQuc3RyZWFtcyA9IFtlLnN0cmVhbV07XG4gICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgd2luZG93LlJUQ1RyYWNrRXZlbnQgJiZcbiAgICAgICAgKCdyZWNlaXZlcicgaW4gd2luZG93LlJUQ1RyYWNrRXZlbnQucHJvdG90eXBlKSAmJlxuICAgICAgICAhKCd0cmFuc2NlaXZlcicgaW4gd2luZG93LlJUQ1RyYWNrRXZlbnQucHJvdG90eXBlKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENUcmFja0V2ZW50LnByb3RvdHlwZSwgJ3RyYW5zY2VpdmVyJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB7cmVjZWl2ZXI6IHRoaXMucmVjZWl2ZXJ9O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2hpbVNvdXJjZU9iamVjdDogZnVuY3Rpb24od2luZG93KSB7XG4gICAgLy8gRmlyZWZveCBoYXMgc3VwcG9ydGVkIG1velNyY09iamVjdCBzaW5jZSBGRjIyLCB1bnByZWZpeGVkIGluIDQyLlxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50ICYmXG4gICAgICAgICEoJ3NyY09iamVjdCcgaW4gd2luZG93LkhUTUxNZWRpYUVsZW1lbnQucHJvdG90eXBlKSkge1xuICAgICAgICAvLyBTaGltIHRoZSBzcmNPYmplY3QgcHJvcGVydHksIG9uY2UsIHdoZW4gSFRNTE1lZGlhRWxlbWVudCBpcyBmb3VuZC5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5IVE1MTWVkaWFFbGVtZW50LnByb3RvdHlwZSwgJ3NyY09iamVjdCcsIHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW96U3JjT2JqZWN0O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICAgIHRoaXMubW96U3JjT2JqZWN0ID0gc3RyZWFtO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHNoaW1QZWVyQ29ubmVjdGlvbjogZnVuY3Rpb24od2luZG93KSB7XG4gICAgdmFyIGJyb3dzZXJEZXRhaWxzID0gdXRpbHMuZGV0ZWN0QnJvd3Nlcih3aW5kb3cpO1xuXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICdvYmplY3QnIHx8ICEod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uIHx8XG4gICAgICAgIHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbikpIHtcbiAgICAgIHJldHVybjsgLy8gcHJvYmFibHkgbWVkaWEucGVlcmNvbm5lY3Rpb24uZW5hYmxlZD1mYWxzZSBpbiBhYm91dDpjb25maWdcbiAgICB9XG4gICAgLy8gVGhlIFJUQ1BlZXJDb25uZWN0aW9uIG9iamVjdC5cbiAgICBpZiAoIXdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbikge1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gZnVuY3Rpb24ocGNDb25maWcsIHBjQ29uc3RyYWludHMpIHtcbiAgICAgICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCAzOCkge1xuICAgICAgICAgIC8vIC51cmxzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gRkYgPCAzOC5cbiAgICAgICAgICAvLyBjcmVhdGUgUlRDSWNlU2VydmVycyB3aXRoIGEgc2luZ2xlIHVybC5cbiAgICAgICAgICBpZiAocGNDb25maWcgJiYgcGNDb25maWcuaWNlU2VydmVycykge1xuICAgICAgICAgICAgdmFyIG5ld0ljZVNlcnZlcnMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGNDb25maWcuaWNlU2VydmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICB2YXIgc2VydmVyID0gcGNDb25maWcuaWNlU2VydmVyc1tpXTtcbiAgICAgICAgICAgICAgaWYgKHNlcnZlci5oYXNPd25Qcm9wZXJ0eSgndXJscycpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzZXJ2ZXIudXJscy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgdmFyIG5ld1NlcnZlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzZXJ2ZXIudXJsc1tqXVxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXIudXJsc1tqXS5pbmRleE9mKCd0dXJuJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3U2VydmVyLnVzZXJuYW1lID0gc2VydmVyLnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgICAgICBuZXdTZXJ2ZXIuY3JlZGVudGlhbCA9IHNlcnZlci5jcmVkZW50aWFsO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgbmV3SWNlU2VydmVycy5wdXNoKG5ld1NlcnZlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld0ljZVNlcnZlcnMucHVzaChwY0NvbmZpZy5pY2VTZXJ2ZXJzW2ldKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGNDb25maWcuaWNlU2VydmVycyA9IG5ld0ljZVNlcnZlcnM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgd2luZG93Lm1velJUQ1BlZXJDb25uZWN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKTtcbiAgICAgIH07XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlID1cbiAgICAgICAgICB3aW5kb3cubW96UlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xuXG4gICAgICAvLyB3cmFwIHN0YXRpYyBtZXRob2RzLiBDdXJyZW50bHkganVzdCBnZW5lcmF0ZUNlcnRpZmljYXRlLlxuICAgICAgaWYgKHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbi5nZW5lcmF0ZUNlcnRpZmljYXRlKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24sICdnZW5lcmF0ZUNlcnRpZmljYXRlJywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gd2luZG93Lm1velJUQ1BlZXJDb25uZWN0aW9uLmdlbmVyYXRlQ2VydGlmaWNhdGU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9IHdpbmRvdy5tb3pSVENTZXNzaW9uRGVzY3JpcHRpb247XG4gICAgICB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlID0gd2luZG93Lm1velJUQ0ljZUNhbmRpZGF0ZTtcbiAgICB9XG5cbiAgICAvLyBzaGltIGF3YXkgbmVlZCBmb3Igb2Jzb2xldGUgUlRDSWNlQ2FuZGlkYXRlL1JUQ1Nlc3Npb25EZXNjcmlwdGlvbi5cbiAgICBbJ3NldExvY2FsRGVzY3JpcHRpb24nLCAnc2V0UmVtb3RlRGVzY3JpcHRpb24nLCAnYWRkSWNlQ2FuZGlkYXRlJ11cbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgdmFyIG5hdGl2ZU1ldGhvZCA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGVbbWV0aG9kXTtcbiAgICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXSA9IG5ldyAoKG1ldGhvZCA9PT0gJ2FkZEljZUNhbmRpZGF0ZScpID9cbiAgICAgICAgICAgICAgICB3aW5kb3cuUlRDSWNlQ2FuZGlkYXRlIDpcbiAgICAgICAgICAgICAgICB3aW5kb3cuUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKShhcmd1bWVudHNbMF0pO1xuICAgICAgICAgICAgcmV0dXJuIG5hdGl2ZU1ldGhvZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgYWRkSWNlQ2FuZGlkYXRlKG51bGwgb3IgdW5kZWZpbmVkKVxuICAgIHZhciBuYXRpdmVBZGRJY2VDYW5kaWRhdGUgPVxuICAgICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZEljZUNhbmRpZGF0ZTtcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZEljZUNhbmRpZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFhcmd1bWVudHNbMF0pIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50c1sxXSkge1xuICAgICAgICAgIGFyZ3VtZW50c1sxXS5hcHBseShudWxsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmF0aXZlQWRkSWNlQ2FuZGlkYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIC8vIHNoaW0gZ2V0U3RhdHMgd2l0aCBtYXBsaWtlIHN1cHBvcnRcbiAgICB2YXIgbWFrZU1hcFN0YXRzID0gZnVuY3Rpb24oc3RhdHMpIHtcbiAgICAgIHZhciBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICBPYmplY3Qua2V5cyhzdGF0cykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgbWFwLnNldChrZXksIHN0YXRzW2tleV0pO1xuICAgICAgICBtYXBba2V5XSA9IHN0YXRzW2tleV07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtYXA7XG4gICAgfTtcblxuICAgIHZhciBtb2Rlcm5TdGF0c1R5cGVzID0ge1xuICAgICAgaW5ib3VuZHJ0cDogJ2luYm91bmQtcnRwJyxcbiAgICAgIG91dGJvdW5kcnRwOiAnb3V0Ym91bmQtcnRwJyxcbiAgICAgIGNhbmRpZGF0ZXBhaXI6ICdjYW5kaWRhdGUtcGFpcicsXG4gICAgICBsb2NhbGNhbmRpZGF0ZTogJ2xvY2FsLWNhbmRpZGF0ZScsXG4gICAgICByZW1vdGVjYW5kaWRhdGU6ICdyZW1vdGUtY2FuZGlkYXRlJ1xuICAgIH07XG5cbiAgICB2YXIgbmF0aXZlR2V0U3RhdHMgPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldFN0YXRzO1xuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U3RhdHMgPSBmdW5jdGlvbihcbiAgICAgIHNlbGVjdG9yLFxuICAgICAgb25TdWNjLFxuICAgICAgb25FcnJcbiAgICApIHtcbiAgICAgIHJldHVybiBuYXRpdmVHZXRTdGF0cy5hcHBseSh0aGlzLCBbc2VsZWN0b3IgfHwgbnVsbF0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHN0YXRzKSB7XG4gICAgICAgICAgaWYgKGJyb3dzZXJEZXRhaWxzLnZlcnNpb24gPCA0OCkge1xuICAgICAgICAgICAgc3RhdHMgPSBtYWtlTWFwU3RhdHMoc3RhdHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDUzICYmICFvblN1Y2MpIHtcbiAgICAgICAgICAgIC8vIFNoaW0gb25seSBwcm9taXNlIGdldFN0YXRzIHdpdGggc3BlYy1oeXBoZW5zIGluIHR5cGUgbmFtZXNcbiAgICAgICAgICAgIC8vIExlYXZlIGNhbGxiYWNrIHZlcnNpb24gYWxvbmU7IG1pc2Mgb2xkIHVzZXMgb2YgZm9yRWFjaCBiZWZvcmUgTWFwXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzdGF0cy5mb3JFYWNoKGZ1bmN0aW9uKHN0YXQpIHtcbiAgICAgICAgICAgICAgICBzdGF0LnR5cGUgPSBtb2Rlcm5TdGF0c1R5cGVzW3N0YXQudHlwZV0gfHwgc3RhdC50eXBlO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgaWYgKGUubmFtZSAhPT0gJ1R5cGVFcnJvcicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIEF2b2lkIFR5cGVFcnJvcjogXCJ0eXBlXCIgaXMgcmVhZC1vbmx5LCBpbiBvbGQgdmVyc2lvbnMuIDM0LTQzaXNoXG4gICAgICAgICAgICAgIHN0YXRzLmZvckVhY2goZnVuY3Rpb24oc3RhdCwgaSkge1xuICAgICAgICAgICAgICAgIHN0YXRzLnNldChpLCBPYmplY3QuYXNzaWduKHt9LCBzdGF0LCB7XG4gICAgICAgICAgICAgICAgICB0eXBlOiBtb2Rlcm5TdGF0c1R5cGVzW3N0YXQudHlwZV0gfHwgc3RhdC50eXBlXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHN0YXRzO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihvblN1Y2MsIG9uRXJyKTtcbiAgICB9O1xuICB9LFxuXG4gIHNoaW1SZW1vdmVTdHJlYW06IGZ1bmN0aW9uKHdpbmRvdykge1xuICAgIGlmICghd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uIHx8XG4gICAgICAgICdyZW1vdmVTdHJlYW0nIGluIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVTdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIHZhciBwYyA9IHRoaXM7XG4gICAgICB1dGlscy5kZXByZWNhdGVkKCdyZW1vdmVTdHJlYW0nLCAncmVtb3ZlVHJhY2snKTtcbiAgICAgIHRoaXMuZ2V0U2VuZGVycygpLmZvckVhY2goZnVuY3Rpb24oc2VuZGVyKSB7XG4gICAgICAgIGlmIChzZW5kZXIudHJhY2sgJiYgc3RyZWFtLmdldFRyYWNrcygpLmluZGV4T2Yoc2VuZGVyLnRyYWNrKSAhPT0gLTEpIHtcbiAgICAgICAgICBwYy5yZW1vdmVUcmFjayhzZW5kZXIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59O1xuXG59LHtcIi4uL3V0aWxzXCI6MTMsXCIuL2dldHVzZXJtZWRpYVwiOjExfV0sMTE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLypcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTYgVGhlIFdlYlJUQyBwcm9qZWN0IGF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgQlNELXN0eWxlIGxpY2Vuc2VcbiAqICB0aGF0IGNhbiBiZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoZSBzb3VyY2VcbiAqICB0cmVlLlxuICovXG4gLyogZXNsaW50LWVudiBub2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgbG9nZ2luZyA9IHV0aWxzLmxvZztcblxuLy8gRXhwb3NlIHB1YmxpYyBtZXRob2RzLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih3aW5kb3cpIHtcbiAgdmFyIGJyb3dzZXJEZXRhaWxzID0gdXRpbHMuZGV0ZWN0QnJvd3Nlcih3aW5kb3cpO1xuICB2YXIgbmF2aWdhdG9yID0gd2luZG93ICYmIHdpbmRvdy5uYXZpZ2F0b3I7XG4gIHZhciBNZWRpYVN0cmVhbVRyYWNrID0gd2luZG93ICYmIHdpbmRvdy5NZWRpYVN0cmVhbVRyYWNrO1xuXG4gIHZhciBzaGltRXJyb3JfID0gZnVuY3Rpb24oZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiB7XG4gICAgICAgIEludGVybmFsRXJyb3I6ICdOb3RSZWFkYWJsZUVycm9yJyxcbiAgICAgICAgTm90U3VwcG9ydGVkRXJyb3I6ICdUeXBlRXJyb3InLFxuICAgICAgICBQZXJtaXNzaW9uRGVuaWVkRXJyb3I6ICdOb3RBbGxvd2VkRXJyb3InLFxuICAgICAgICBTZWN1cml0eUVycm9yOiAnTm90QWxsb3dlZEVycm9yJ1xuICAgICAgfVtlLm5hbWVdIHx8IGUubmFtZSxcbiAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgJ1RoZSBvcGVyYXRpb24gaXMgaW5zZWN1cmUuJzogJ1RoZSByZXF1ZXN0IGlzIG5vdCBhbGxvd2VkIGJ5IHRoZSAnICtcbiAgICAgICAgJ3VzZXIgYWdlbnQgb3IgdGhlIHBsYXRmb3JtIGluIHRoZSBjdXJyZW50IGNvbnRleHQuJ1xuICAgICAgfVtlLm1lc3NhZ2VdIHx8IGUubWVzc2FnZSxcbiAgICAgIGNvbnN0cmFpbnQ6IGUuY29uc3RyYWludCxcbiAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArICh0aGlzLm1lc3NhZ2UgJiYgJzogJykgKyB0aGlzLm1lc3NhZ2U7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBnZXRVc2VyTWVkaWEgY29uc3RyYWludHMgc2hpbS5cbiAgdmFyIGdldFVzZXJNZWRpYV8gPSBmdW5jdGlvbihjb25zdHJhaW50cywgb25TdWNjZXNzLCBvbkVycm9yKSB7XG4gICAgdmFyIGNvbnN0cmFpbnRzVG9GRjM3XyA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmICh0eXBlb2YgYyAhPT0gJ29iamVjdCcgfHwgYy5yZXF1aXJlKSB7XG4gICAgICAgIHJldHVybiBjO1xuICAgICAgfVxuICAgICAgdmFyIHJlcXVpcmUgPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKGMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdyZXF1aXJlJyB8fCBrZXkgPT09ICdhZHZhbmNlZCcgfHwga2V5ID09PSAnbWVkaWFTb3VyY2UnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciByID0gY1trZXldID0gKHR5cGVvZiBjW2tleV0gPT09ICdvYmplY3QnKSA/XG4gICAgICAgICAgICBjW2tleV0gOiB7aWRlYWw6IGNba2V5XX07XG4gICAgICAgIGlmIChyLm1pbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICByLm1heCAhPT0gdW5kZWZpbmVkIHx8IHIuZXhhY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJlcXVpcmUucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyLmV4YWN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHIuZXhhY3QgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByLiBtaW4gPSByLm1heCA9IHIuZXhhY3Q7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNba2V5XSA9IHIuZXhhY3Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlbGV0ZSByLmV4YWN0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChyLmlkZWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjLmFkdmFuY2VkID0gYy5hZHZhbmNlZCB8fCBbXTtcbiAgICAgICAgICB2YXIgb2MgPSB7fTtcbiAgICAgICAgICBpZiAodHlwZW9mIHIuaWRlYWwgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBvY1trZXldID0ge21pbjogci5pZGVhbCwgbWF4OiByLmlkZWFsfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2Nba2V5XSA9IHIuaWRlYWw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGMuYWR2YW5jZWQucHVzaChvYyk7XG4gICAgICAgICAgZGVsZXRlIHIuaWRlYWw7XG4gICAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhyKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBjW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChyZXF1aXJlLmxlbmd0aCkge1xuICAgICAgICBjLnJlcXVpcmUgPSByZXF1aXJlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGM7XG4gICAgfTtcbiAgICBjb25zdHJhaW50cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDM4KSB7XG4gICAgICBsb2dnaW5nKCdzcGVjOiAnICsgSlNPTi5zdHJpbmdpZnkoY29uc3RyYWludHMpKTtcbiAgICAgIGlmIChjb25zdHJhaW50cy5hdWRpbykge1xuICAgICAgICBjb25zdHJhaW50cy5hdWRpbyA9IGNvbnN0cmFpbnRzVG9GRjM3Xyhjb25zdHJhaW50cy5hdWRpbyk7XG4gICAgICB9XG4gICAgICBpZiAoY29uc3RyYWludHMudmlkZW8pIHtcbiAgICAgICAgY29uc3RyYWludHMudmlkZW8gPSBjb25zdHJhaW50c1RvRkYzN18oY29uc3RyYWludHMudmlkZW8pO1xuICAgICAgfVxuICAgICAgbG9nZ2luZygnZmYzNzogJyArIEpTT04uc3RyaW5naWZ5KGNvbnN0cmFpbnRzKSk7XG4gICAgfVxuICAgIHJldHVybiBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIG9uRXJyb3Ioc2hpbUVycm9yXyhlKSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgcmVzdWx0IG9mIGdldFVzZXJNZWRpYSBhcyBhIFByb21pc2UuXG4gIHZhciBnZXRVc2VyTWVkaWFQcm9taXNlXyA9IGZ1bmN0aW9uKGNvbnN0cmFpbnRzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZ2V0VXNlck1lZGlhXyhjb25zdHJhaW50cywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBTaGltIGZvciBtZWRpYURldmljZXMgb24gb2xkZXIgdmVyc2lvbnMuXG4gIGlmICghbmF2aWdhdG9yLm1lZGlhRGV2aWNlcykge1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMgPSB7Z2V0VXNlck1lZGlhOiBnZXRVc2VyTWVkaWFQcm9taXNlXyxcbiAgICAgIGFkZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKCkgeyB9LFxuICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24oKSB7IH1cbiAgICB9O1xuICB9XG4gIG5hdmlnYXRvci5tZWRpYURldmljZXMuZW51bWVyYXRlRGV2aWNlcyA9XG4gICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgfHwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgdmFyIGluZm9zID0gW1xuICAgICAgICAgICAge2tpbmQ6ICdhdWRpb2lucHV0JywgZGV2aWNlSWQ6ICdkZWZhdWx0JywgbGFiZWw6ICcnLCBncm91cElkOiAnJ30sXG4gICAgICAgICAgICB7a2luZDogJ3ZpZGVvaW5wdXQnLCBkZXZpY2VJZDogJ2RlZmF1bHQnLCBsYWJlbDogJycsIGdyb3VwSWQ6ICcnfVxuICAgICAgICAgIF07XG4gICAgICAgICAgcmVzb2x2ZShpbmZvcyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICBpZiAoYnJvd3NlckRldGFpbHMudmVyc2lvbiA8IDQxKSB7XG4gICAgLy8gV29yayBhcm91bmQgaHR0cDovL2J1Z3ppbC5sYS8xMTY5NjY1XG4gICAgdmFyIG9yZ0VudW1lcmF0ZURldmljZXMgPVxuICAgICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMuYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmVudW1lcmF0ZURldmljZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBvcmdFbnVtZXJhdGVEZXZpY2VzKCkudGhlbih1bmRlZmluZWQsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG4gIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNDkpIHtcbiAgICB2YXIgb3JpZ0dldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhLlxuICAgICAgICBiaW5kKG5hdmlnYXRvci5tZWRpYURldmljZXMpO1xuICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oYykge1xuICAgICAgcmV0dXJuIG9yaWdHZXRVc2VyTWVkaWEoYykudGhlbihmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgLy8gV29yayBhcm91bmQgaHR0cHM6Ly9idWd6aWwubGEvODAyMzI2XG4gICAgICAgIGlmIChjLmF1ZGlvICYmICFzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKS5sZW5ndGggfHxcbiAgICAgICAgICAgIGMudmlkZW8gJiYgIXN0cmVhbS5nZXRWaWRlb1RyYWNrcygpLmxlbmd0aCkge1xuICAgICAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICB0cmFjay5zdG9wKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbignVGhlIG9iamVjdCBjYW4gbm90IGJlIGZvdW5kIGhlcmUuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOb3RGb3VuZEVycm9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHNoaW1FcnJvcl8oZSkpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuICBpZiAoIShicm93c2VyRGV0YWlscy52ZXJzaW9uID4gNTUgJiZcbiAgICAgICdhdXRvR2FpbkNvbnRyb2wnIGluIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0U3VwcG9ydGVkQ29uc3RyYWludHMoKSkpIHtcbiAgICB2YXIgcmVtYXAgPSBmdW5jdGlvbihvYmosIGEsIGIpIHtcbiAgICAgIGlmIChhIGluIG9iaiAmJiAhKGIgaW4gb2JqKSkge1xuICAgICAgICBvYmpbYl0gPSBvYmpbYV07XG4gICAgICAgIGRlbGV0ZSBvYmpbYV07XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBuYXRpdmVHZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYS5cbiAgICAgICAgYmluZChuYXZpZ2F0b3IubWVkaWFEZXZpY2VzKTtcbiAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmICh0eXBlb2YgYyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGMuYXVkaW8gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGMpKTtcbiAgICAgICAgcmVtYXAoYy5hdWRpbywgJ2F1dG9HYWluQ29udHJvbCcsICdtb3pBdXRvR2FpbkNvbnRyb2wnKTtcbiAgICAgICAgcmVtYXAoYy5hdWRpbywgJ25vaXNlU3VwcHJlc3Npb24nLCAnbW96Tm9pc2VTdXBwcmVzc2lvbicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hdGl2ZUdldFVzZXJNZWRpYShjKTtcbiAgICB9O1xuXG4gICAgaWYgKE1lZGlhU3RyZWFtVHJhY2sgJiYgTWVkaWFTdHJlYW1UcmFjay5wcm90b3R5cGUuZ2V0U2V0dGluZ3MpIHtcbiAgICAgIHZhciBuYXRpdmVHZXRTZXR0aW5ncyA9IE1lZGlhU3RyZWFtVHJhY2sucHJvdG90eXBlLmdldFNldHRpbmdzO1xuICAgICAgTWVkaWFTdHJlYW1UcmFjay5wcm90b3R5cGUuZ2V0U2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9iaiA9IG5hdGl2ZUdldFNldHRpbmdzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJlbWFwKG9iaiwgJ21vekF1dG9HYWluQ29udHJvbCcsICdhdXRvR2FpbkNvbnRyb2wnKTtcbiAgICAgICAgcmVtYXAob2JqLCAnbW96Tm9pc2VTdXBwcmVzc2lvbicsICdub2lzZVN1cHByZXNzaW9uJyk7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmIChNZWRpYVN0cmVhbVRyYWNrICYmIE1lZGlhU3RyZWFtVHJhY2sucHJvdG90eXBlLmFwcGx5Q29uc3RyYWludHMpIHtcbiAgICAgIHZhciBuYXRpdmVBcHBseUNvbnN0cmFpbnRzID0gTWVkaWFTdHJlYW1UcmFjay5wcm90b3R5cGUuYXBwbHlDb25zdHJhaW50cztcbiAgICAgIE1lZGlhU3RyZWFtVHJhY2sucHJvdG90eXBlLmFwcGx5Q29uc3RyYWludHMgPSBmdW5jdGlvbihjKSB7XG4gICAgICAgIGlmICh0aGlzLmtpbmQgPT09ICdhdWRpbycgJiYgdHlwZW9mIGMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgYyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYykpO1xuICAgICAgICAgIHJlbWFwKGMsICdhdXRvR2FpbkNvbnRyb2wnLCAnbW96QXV0b0dhaW5Db250cm9sJyk7XG4gICAgICAgICAgcmVtYXAoYywgJ25vaXNlU3VwcHJlc3Npb24nLCAnbW96Tm9pc2VTdXBwcmVzc2lvbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYXRpdmVBcHBseUNvbnN0cmFpbnRzLmFwcGx5KHRoaXMsIFtjXSk7XG4gICAgICB9O1xuICAgIH1cbiAgfVxuICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oY29uc3RyYWludHMsIG9uU3VjY2Vzcywgb25FcnJvcikge1xuICAgIGlmIChicm93c2VyRGV0YWlscy52ZXJzaW9uIDwgNDQpIHtcbiAgICAgIHJldHVybiBnZXRVc2VyTWVkaWFfKGNvbnN0cmFpbnRzLCBvblN1Y2Nlc3MsIG9uRXJyb3IpO1xuICAgIH1cbiAgICAvLyBSZXBsYWNlIEZpcmVmb3ggNDQrJ3MgZGVwcmVjYXRpb24gd2FybmluZyB3aXRoIHVucHJlZml4ZWQgdmVyc2lvbi5cbiAgICB1dGlscy5kZXByZWNhdGVkKCduYXZpZ2F0b3IuZ2V0VXNlck1lZGlhJyxcbiAgICAgICAgJ25hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhJyk7XG4gICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpLnRoZW4ob25TdWNjZXNzLCBvbkVycm9yKTtcbiAgfTtcbn07XG5cbn0se1wiLi4vdXRpbHNcIjoxM31dLDEyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE2IFRoZSBXZWJSVEMgcHJvamVjdCBhdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqICBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIEJTRC1zdHlsZSBsaWNlbnNlXG4gKiAgdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGUgc291cmNlXG4gKiAgdHJlZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNoaW1Mb2NhbFN0cmVhbXNBUEk6IGZ1bmN0aW9uKHdpbmRvdykge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAnb2JqZWN0JyB8fCAhd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghKCdnZXRMb2NhbFN0cmVhbXMnIGluIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmdldExvY2FsU3RyZWFtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2xvY2FsU3RyZWFtcykge1xuICAgICAgICAgIHRoaXMuX2xvY2FsU3RyZWFtcyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2NhbFN0cmVhbXM7XG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAoISgnZ2V0U3RyZWFtQnlJZCcgaW4gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZSkpIHtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuZ2V0U3RyZWFtQnlJZCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5fbG9jYWxTdHJlYW1zKSB7XG4gICAgICAgICAgdGhpcy5fbG9jYWxTdHJlYW1zLmZvckVhY2goZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICBpZiAoc3RyZWFtLmlkID09PSBpZCkge1xuICAgICAgICAgICAgICByZXN1bHQgPSBzdHJlYW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3JlbW90ZVN0cmVhbXMpIHtcbiAgICAgICAgICB0aGlzLl9yZW1vdGVTdHJlYW1zLmZvckVhY2goZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICBpZiAoc3RyZWFtLmlkID09PSBpZCkge1xuICAgICAgICAgICAgICByZXN1bHQgPSBzdHJlYW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH07XG4gICAgfVxuICAgIGlmICghKCdhZGRTdHJlYW0nIGluIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XG4gICAgICB2YXIgX2FkZFRyYWNrID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5hZGRUcmFjaztcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuYWRkU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgIGlmICghdGhpcy5fbG9jYWxTdHJlYW1zKSB7XG4gICAgICAgICAgdGhpcy5fbG9jYWxTdHJlYW1zID0gW107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2xvY2FsU3RyZWFtcy5pbmRleE9mKHN0cmVhbSkgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5fbG9jYWxTdHJlYW1zLnB1c2goc3RyZWFtKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGMgPSB0aGlzO1xuICAgICAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgIF9hZGRUcmFjay5jYWxsKHBjLCB0cmFjaywgc3RyZWFtKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLmFkZFRyYWNrID0gZnVuY3Rpb24odHJhY2ssIHN0cmVhbSkge1xuICAgICAgICBpZiAoc3RyZWFtKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLl9sb2NhbFN0cmVhbXMpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvY2FsU3RyZWFtcyA9IFtzdHJlYW1dO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fbG9jYWxTdHJlYW1zLmluZGV4T2Yoc3RyZWFtKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvY2FsU3RyZWFtcy5wdXNoKHN0cmVhbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfYWRkVHJhY2suY2FsbCh0aGlzLCB0cmFjaywgc3RyZWFtKTtcbiAgICAgIH07XG4gICAgfVxuICAgIGlmICghKCdyZW1vdmVTdHJlYW0nIGluIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUpKSB7XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnJlbW92ZVN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICBpZiAoIXRoaXMuX2xvY2FsU3RyZWFtcykge1xuICAgICAgICAgIHRoaXMuX2xvY2FsU3RyZWFtcyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuX2xvY2FsU3RyZWFtcy5pbmRleE9mKHN0cmVhbSk7XG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbG9jYWxTdHJlYW1zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHZhciBwYyA9IHRoaXM7XG4gICAgICAgIHZhciB0cmFja3MgPSBzdHJlYW0uZ2V0VHJhY2tzKCk7XG4gICAgICAgIHRoaXMuZ2V0U2VuZGVycygpLmZvckVhY2goZnVuY3Rpb24oc2VuZGVyKSB7XG4gICAgICAgICAgaWYgKHRyYWNrcy5pbmRleE9mKHNlbmRlci50cmFjaykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYy5yZW1vdmVUcmFjayhzZW5kZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH1cbiAgfSxcbiAgc2hpbVJlbW90ZVN0cmVhbXNBUEk6IGZ1bmN0aW9uKHdpbmRvdykge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAnb2JqZWN0JyB8fCAhd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghKCdnZXRSZW1vdGVTdHJlYW1zJyBpbiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSkge1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5nZXRSZW1vdGVTdHJlYW1zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZW1vdGVTdHJlYW1zID8gdGhpcy5fcmVtb3RlU3RyZWFtcyA6IFtdO1xuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKCEoJ29uYWRkc3RyZWFtJyBpbiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUsICdvbmFkZHN0cmVhbScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fb25hZGRzdHJlYW07XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oZikge1xuICAgICAgICAgIHZhciBwYyA9IHRoaXM7XG4gICAgICAgICAgaWYgKHRoaXMuX29uYWRkc3RyZWFtKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29uYWRkc3RyZWFtKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhY2snLCB0aGlzLl9vbmFkZHN0cmVhbXBvbHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2FkZHN0cmVhbScsIHRoaXMuX29uYWRkc3RyZWFtID0gZik7XG4gICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0cmFjaycsIHRoaXMuX29uYWRkc3RyZWFtcG9seSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGUuc3RyZWFtcy5mb3JFYWNoKGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgICAgICBpZiAoIXBjLl9yZW1vdGVTdHJlYW1zKSB7XG4gICAgICAgICAgICAgICAgcGMuX3JlbW90ZVN0cmVhbXMgPSBbXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAocGMuX3JlbW90ZVN0cmVhbXMuaW5kZXhPZihzdHJlYW0pID49IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGMuX3JlbW90ZVN0cmVhbXMucHVzaChzdHJlYW0pO1xuICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ2FkZHN0cmVhbScpO1xuICAgICAgICAgICAgICBldmVudC5zdHJlYW0gPSBzdHJlYW07XG4gICAgICAgICAgICAgIHBjLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgc2hpbUNhbGxiYWNrc0FQSTogZnVuY3Rpb24od2luZG93KSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICdvYmplY3QnIHx8ICF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHByb3RvdHlwZSA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGU7XG4gICAgdmFyIGNyZWF0ZU9mZmVyID0gcHJvdG90eXBlLmNyZWF0ZU9mZmVyO1xuICAgIHZhciBjcmVhdGVBbnN3ZXIgPSBwcm90b3R5cGUuY3JlYXRlQW5zd2VyO1xuICAgIHZhciBzZXRMb2NhbERlc2NyaXB0aW9uID0gcHJvdG90eXBlLnNldExvY2FsRGVzY3JpcHRpb247XG4gICAgdmFyIHNldFJlbW90ZURlc2NyaXB0aW9uID0gcHJvdG90eXBlLnNldFJlbW90ZURlc2NyaXB0aW9uO1xuICAgIHZhciBhZGRJY2VDYW5kaWRhdGUgPSBwcm90b3R5cGUuYWRkSWNlQ2FuZGlkYXRlO1xuXG4gICAgcHJvdG90eXBlLmNyZWF0ZU9mZmVyID0gZnVuY3Rpb24oc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spIHtcbiAgICAgIHZhciBvcHRpb25zID0gKGFyZ3VtZW50cy5sZW5ndGggPj0gMikgPyBhcmd1bWVudHNbMl0gOiBhcmd1bWVudHNbMF07XG4gICAgICB2YXIgcHJvbWlzZSA9IGNyZWF0ZU9mZmVyLmFwcGx5KHRoaXMsIFtvcHRpb25zXSk7XG4gICAgICBpZiAoIWZhaWx1cmVDYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH1cbiAgICAgIHByb21pc2UudGhlbihzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfTtcblxuICAgIHByb3RvdHlwZS5jcmVhdGVBbnN3ZXIgPSBmdW5jdGlvbihzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xuICAgICAgdmFyIG9wdGlvbnMgPSAoYXJndW1lbnRzLmxlbmd0aCA+PSAyKSA/IGFyZ3VtZW50c1syXSA6IGFyZ3VtZW50c1swXTtcbiAgICAgIHZhciBwcm9taXNlID0gY3JlYXRlQW5zd2VyLmFwcGx5KHRoaXMsIFtvcHRpb25zXSk7XG4gICAgICBpZiAoIWZhaWx1cmVDYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH1cbiAgICAgIHByb21pc2UudGhlbihzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfTtcblxuICAgIHZhciB3aXRoQ2FsbGJhY2sgPSBmdW5jdGlvbihkZXNjcmlwdGlvbiwgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spIHtcbiAgICAgIHZhciBwcm9taXNlID0gc2V0TG9jYWxEZXNjcmlwdGlvbi5hcHBseSh0aGlzLCBbZGVzY3JpcHRpb25dKTtcbiAgICAgIGlmICghZmFpbHVyZUNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgfVxuICAgICAgcHJvbWlzZS50aGVuKHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9O1xuICAgIHByb3RvdHlwZS5zZXRMb2NhbERlc2NyaXB0aW9uID0gd2l0aENhbGxiYWNrO1xuXG4gICAgd2l0aENhbGxiYWNrID0gZnVuY3Rpb24oZGVzY3JpcHRpb24sIHN1Y2Nlc3NDYWxsYmFjaywgZmFpbHVyZUNhbGxiYWNrKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IHNldFJlbW90ZURlc2NyaXB0aW9uLmFwcGx5KHRoaXMsIFtkZXNjcmlwdGlvbl0pO1xuICAgICAgaWYgKCFmYWlsdXJlQ2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9XG4gICAgICBwcm9taXNlLnRoZW4oc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH07XG4gICAgcHJvdG90eXBlLnNldFJlbW90ZURlc2NyaXB0aW9uID0gd2l0aENhbGxiYWNrO1xuXG4gICAgd2l0aENhbGxiYWNrID0gZnVuY3Rpb24oY2FuZGlkYXRlLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjaykge1xuICAgICAgdmFyIHByb21pc2UgPSBhZGRJY2VDYW5kaWRhdGUuYXBwbHkodGhpcywgW2NhbmRpZGF0ZV0pO1xuICAgICAgaWYgKCFmYWlsdXJlQ2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9XG4gICAgICBwcm9taXNlLnRoZW4oc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH07XG4gICAgcHJvdG90eXBlLmFkZEljZUNhbmRpZGF0ZSA9IHdpdGhDYWxsYmFjaztcbiAgfSxcbiAgc2hpbUdldFVzZXJNZWRpYTogZnVuY3Rpb24od2luZG93KSB7XG4gICAgdmFyIG5hdmlnYXRvciA9IHdpbmRvdyAmJiB3aW5kb3cubmF2aWdhdG9yO1xuXG4gICAgaWYgKCFuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKSB7XG4gICAgICBpZiAobmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSkge1xuICAgICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYS5iaW5kKG5hdmlnYXRvcik7XG4gICAgICB9IGVsc2UgaWYgKG5hdmlnYXRvci5tZWRpYURldmljZXMgJiZcbiAgICAgICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSkge1xuICAgICAgICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gZnVuY3Rpb24oY29uc3RyYWludHMsIGNiLCBlcnJjYikge1xuICAgICAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzKVxuICAgICAgICAgIC50aGVuKGNiLCBlcnJjYik7XG4gICAgICAgIH0uYmluZChuYXZpZ2F0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgc2hpbVJUQ0ljZVNlcnZlclVybHM6IGZ1bmN0aW9uKHdpbmRvdykge1xuICAgIC8vIG1pZ3JhdGUgZnJvbSBub24tc3BlYyBSVENJY2VTZXJ2ZXIudXJsIHRvIFJUQ0ljZVNlcnZlci51cmxzXG4gICAgdmFyIE9yaWdQZWVyQ29ubmVjdGlvbiA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbjtcbiAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBmdW5jdGlvbihwY0NvbmZpZywgcGNDb25zdHJhaW50cykge1xuICAgICAgaWYgKHBjQ29uZmlnICYmIHBjQ29uZmlnLmljZVNlcnZlcnMpIHtcbiAgICAgICAgdmFyIG5ld0ljZVNlcnZlcnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwY0NvbmZpZy5pY2VTZXJ2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHNlcnZlciA9IHBjQ29uZmlnLmljZVNlcnZlcnNbaV07XG4gICAgICAgICAgaWYgKCFzZXJ2ZXIuaGFzT3duUHJvcGVydHkoJ3VybHMnKSAmJlxuICAgICAgICAgICAgICBzZXJ2ZXIuaGFzT3duUHJvcGVydHkoJ3VybCcpKSB7XG4gICAgICAgICAgICB1dGlscy5kZXByZWNhdGVkKCdSVENJY2VTZXJ2ZXIudXJsJywgJ1JUQ0ljZVNlcnZlci51cmxzJyk7XG4gICAgICAgICAgICBzZXJ2ZXIgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNlcnZlcikpO1xuICAgICAgICAgICAgc2VydmVyLnVybHMgPSBzZXJ2ZXIudXJsO1xuICAgICAgICAgICAgZGVsZXRlIHNlcnZlci51cmw7XG4gICAgICAgICAgICBuZXdJY2VTZXJ2ZXJzLnB1c2goc2VydmVyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3SWNlU2VydmVycy5wdXNoKHBjQ29uZmlnLmljZVNlcnZlcnNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwY0NvbmZpZy5pY2VTZXJ2ZXJzID0gbmV3SWNlU2VydmVycztcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgT3JpZ1BlZXJDb25uZWN0aW9uKHBjQ29uZmlnLCBwY0NvbnN0cmFpbnRzKTtcbiAgICB9O1xuICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUgPSBPcmlnUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlO1xuICAgIC8vIHdyYXAgc3RhdGljIG1ldGhvZHMuIEN1cnJlbnRseSBqdXN0IGdlbmVyYXRlQ2VydGlmaWNhdGUuXG4gICAgaWYgKCdnZW5lcmF0ZUNlcnRpZmljYXRlJyBpbiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24pIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24sICdnZW5lcmF0ZUNlcnRpZmljYXRlJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBPcmlnUGVlckNvbm5lY3Rpb24uZ2VuZXJhdGVDZXJ0aWZpY2F0ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBzaGltVHJhY2tFdmVudFRyYW5zY2VpdmVyOiBmdW5jdGlvbih3aW5kb3cpIHtcbiAgICAvLyBBZGQgZXZlbnQudHJhbnNjZWl2ZXIgbWVtYmVyIG92ZXIgZGVwcmVjYXRlZCBldmVudC5yZWNlaXZlclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gJiZcbiAgICAgICAgKCdyZWNlaXZlcicgaW4gd2luZG93LlJUQ1RyYWNrRXZlbnQucHJvdG90eXBlKSAmJlxuICAgICAgICAvLyBjYW4ndCBjaGVjayAndHJhbnNjZWl2ZXInIGluIHdpbmRvdy5SVENUcmFja0V2ZW50LnByb3RvdHlwZSwgYXMgaXQgaXNcbiAgICAgICAgLy8gZGVmaW5lZCBmb3Igc29tZSByZWFzb24gZXZlbiB3aGVuIHdpbmRvdy5SVENUcmFuc2NlaXZlciBpcyBub3QuXG4gICAgICAgICF3aW5kb3cuUlRDVHJhbnNjZWl2ZXIpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3cuUlRDVHJhY2tFdmVudC5wcm90b3R5cGUsICd0cmFuc2NlaXZlcicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4ge3JlY2VpdmVyOiB0aGlzLnJlY2VpdmVyfTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIHNoaW1DcmVhdGVPZmZlckxlZ2FjeTogZnVuY3Rpb24od2luZG93KSB7XG4gICAgdmFyIG9yaWdDcmVhdGVPZmZlciA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlT2ZmZXI7XG4gICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVPZmZlciA9IGZ1bmN0aW9uKG9mZmVyT3B0aW9ucykge1xuICAgICAgdmFyIHBjID0gdGhpcztcbiAgICAgIGlmIChvZmZlck9wdGlvbnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvLyBzdXBwb3J0IGJpdCB2YWx1ZXNcbiAgICAgICAgICBvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbyA9ICEhb2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW87XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGF1ZGlvVHJhbnNjZWl2ZXIgPSBwYy5nZXRUcmFuc2NlaXZlcnMoKS5maW5kKGZ1bmN0aW9uKHRyYW5zY2VpdmVyKSB7XG4gICAgICAgICAgcmV0dXJuIHRyYW5zY2VpdmVyLnNlbmRlci50cmFjayAmJlxuICAgICAgICAgICAgICB0cmFuc2NlaXZlci5zZW5kZXIudHJhY2sua2luZCA9PT0gJ2F1ZGlvJztcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVBdWRpbyA9PT0gZmFsc2UgJiYgYXVkaW9UcmFuc2NlaXZlcikge1xuICAgICAgICAgIGlmIChhdWRpb1RyYW5zY2VpdmVyLmRpcmVjdGlvbiA9PT0gJ3NlbmRyZWN2Jykge1xuICAgICAgICAgICAgaWYgKGF1ZGlvVHJhbnNjZWl2ZXIuc2V0RGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgIGF1ZGlvVHJhbnNjZWl2ZXIuc2V0RGlyZWN0aW9uKCdzZW5kb25seScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYXVkaW9UcmFuc2NlaXZlci5kaXJlY3Rpb24gPSAnc2VuZG9ubHknO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoYXVkaW9UcmFuc2NlaXZlci5kaXJlY3Rpb24gPT09ICdyZWN2b25seScpIHtcbiAgICAgICAgICAgIGlmIChhdWRpb1RyYW5zY2VpdmVyLnNldERpcmVjdGlvbikge1xuICAgICAgICAgICAgICBhdWRpb1RyYW5zY2VpdmVyLnNldERpcmVjdGlvbignaW5hY3RpdmUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGF1ZGlvVHJhbnNjZWl2ZXIuZGlyZWN0aW9uID0gJ2luYWN0aXZlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW8gPT09IHRydWUgJiZcbiAgICAgICAgICAgICFhdWRpb1RyYW5zY2VpdmVyKSB7XG4gICAgICAgICAgcGMuYWRkVHJhbnNjZWl2ZXIoJ2F1ZGlvJyk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmICh0eXBlb2Ygb2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlQXVkaW8gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy8gc3VwcG9ydCBiaXQgdmFsdWVzXG4gICAgICAgICAgb2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlVmlkZW8gPSAhIW9mZmVyT3B0aW9ucy5vZmZlclRvUmVjZWl2ZVZpZGVvO1xuICAgICAgICB9XG4gICAgICAgIHZhciB2aWRlb1RyYW5zY2VpdmVyID0gcGMuZ2V0VHJhbnNjZWl2ZXJzKCkuZmluZChmdW5jdGlvbih0cmFuc2NlaXZlcikge1xuICAgICAgICAgIHJldHVybiB0cmFuc2NlaXZlci5zZW5kZXIudHJhY2sgJiZcbiAgICAgICAgICAgICAgdHJhbnNjZWl2ZXIuc2VuZGVyLnRyYWNrLmtpbmQgPT09ICd2aWRlbyc7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAob2ZmZXJPcHRpb25zLm9mZmVyVG9SZWNlaXZlVmlkZW8gPT09IGZhbHNlICYmIHZpZGVvVHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgICBpZiAodmlkZW9UcmFuc2NlaXZlci5kaXJlY3Rpb24gPT09ICdzZW5kcmVjdicpIHtcbiAgICAgICAgICAgIHZpZGVvVHJhbnNjZWl2ZXIuc2V0RGlyZWN0aW9uKCdzZW5kb25seScpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodmlkZW9UcmFuc2NlaXZlci5kaXJlY3Rpb24gPT09ICdyZWN2b25seScpIHtcbiAgICAgICAgICAgIHZpZGVvVHJhbnNjZWl2ZXIuc2V0RGlyZWN0aW9uKCdpbmFjdGl2ZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChvZmZlck9wdGlvbnMub2ZmZXJUb1JlY2VpdmVWaWRlbyA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgIXZpZGVvVHJhbnNjZWl2ZXIpIHtcbiAgICAgICAgICBwYy5hZGRUcmFuc2NlaXZlcigndmlkZW8nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9yaWdDcmVhdGVPZmZlci5hcHBseShwYywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG59O1xuXG59LHtcIi4uL3V0aWxzXCI6MTN9XSwxMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vKlxuICogIENvcHlyaWdodCAoYykgMjAxNiBUaGUgV2ViUlRDIHByb2plY3QgYXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiAgVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBCU0Qtc3R5bGUgbGljZW5zZVxuICogIHRoYXQgY2FuIGJlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3Qgb2YgdGhlIHNvdXJjZVxuICogIHRyZWUuXG4gKi9cbiAvKiBlc2xpbnQtZW52IG5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ0Rpc2FibGVkXyA9IHRydWU7XG52YXIgZGVwcmVjYXRpb25XYXJuaW5nc18gPSB0cnVlO1xuXG4vKipcbiAqIEV4dHJhY3QgYnJvd3NlciB2ZXJzaW9uIG91dCBvZiB0aGUgcHJvdmlkZWQgdXNlciBhZ2VudCBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHshc3RyaW5nfSB1YXN0cmluZyB1c2VyQWdlbnQgc3RyaW5nLlxuICogQHBhcmFtIHshc3RyaW5nfSBleHByIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIGFzIG1hdGNoIGNyaXRlcmlhLlxuICogQHBhcmFtIHshbnVtYmVyfSBwb3MgcG9zaXRpb24gaW4gdGhlIHZlcnNpb24gc3RyaW5nIHRvIGJlIHJldHVybmVkLlxuICogQHJldHVybiB7IW51bWJlcn0gYnJvd3NlciB2ZXJzaW9uLlxuICovXG5mdW5jdGlvbiBleHRyYWN0VmVyc2lvbih1YXN0cmluZywgZXhwciwgcG9zKSB7XG4gIHZhciBtYXRjaCA9IHVhc3RyaW5nLm1hdGNoKGV4cHIpO1xuICByZXR1cm4gbWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID49IHBvcyAmJiBwYXJzZUludChtYXRjaFtwb3NdLCAxMCk7XG59XG5cbi8vIFdyYXBzIHRoZSBwZWVyY29ubmVjdGlvbiBldmVudCBldmVudE5hbWVUb1dyYXAgaW4gYSBmdW5jdGlvblxuLy8gd2hpY2ggcmV0dXJucyB0aGUgbW9kaWZpZWQgZXZlbnQgb2JqZWN0LlxuZnVuY3Rpb24gd3JhcFBlZXJDb25uZWN0aW9uRXZlbnQod2luZG93LCBldmVudE5hbWVUb1dyYXAsIHdyYXBwZXIpIHtcbiAgaWYgKCF3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIHByb3RvID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZTtcbiAgdmFyIG5hdGl2ZUFkZEV2ZW50TGlzdGVuZXIgPSBwcm90by5hZGRFdmVudExpc3RlbmVyO1xuICBwcm90by5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24obmF0aXZlRXZlbnROYW1lLCBjYikge1xuICAgIGlmIChuYXRpdmVFdmVudE5hbWUgIT09IGV2ZW50TmFtZVRvV3JhcCkge1xuICAgICAgcmV0dXJuIG5hdGl2ZUFkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgdmFyIHdyYXBwZWRDYWxsYmFjayA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGNiKHdyYXBwZXIoZSkpO1xuICAgIH07XG4gICAgdGhpcy5fZXZlbnRNYXAgPSB0aGlzLl9ldmVudE1hcCB8fCB7fTtcbiAgICB0aGlzLl9ldmVudE1hcFtjYl0gPSB3cmFwcGVkQ2FsbGJhY2s7XG4gICAgcmV0dXJuIG5hdGl2ZUFkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgW25hdGl2ZUV2ZW50TmFtZSxcbiAgICAgIHdyYXBwZWRDYWxsYmFja10pO1xuICB9O1xuXG4gIHZhciBuYXRpdmVSZW1vdmVFdmVudExpc3RlbmVyID0gcHJvdG8ucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcbiAgcHJvdG8ucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKG5hdGl2ZUV2ZW50TmFtZSwgY2IpIHtcbiAgICBpZiAobmF0aXZlRXZlbnROYW1lICE9PSBldmVudE5hbWVUb1dyYXAgfHwgIXRoaXMuX2V2ZW50TWFwXG4gICAgICAgIHx8ICF0aGlzLl9ldmVudE1hcFtjYl0pIHtcbiAgICAgIHJldHVybiBuYXRpdmVSZW1vdmVFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIHZhciB1bndyYXBwZWRDYiA9IHRoaXMuX2V2ZW50TWFwW2NiXTtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRNYXBbY2JdO1xuICAgIHJldHVybiBuYXRpdmVSZW1vdmVFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIFtuYXRpdmVFdmVudE5hbWUsXG4gICAgICB1bndyYXBwZWRDYl0pO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgJ29uJyArIGV2ZW50TmFtZVRvV3JhcCwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpc1snX29uJyArIGV2ZW50TmFtZVRvV3JhcF07XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGNiKSB7XG4gICAgICBpZiAodGhpc1snX29uJyArIGV2ZW50TmFtZVRvV3JhcF0pIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZVRvV3JhcCxcbiAgICAgICAgICAgIHRoaXNbJ19vbicgKyBldmVudE5hbWVUb1dyYXBdKTtcbiAgICAgICAgZGVsZXRlIHRoaXNbJ19vbicgKyBldmVudE5hbWVUb1dyYXBdO1xuICAgICAgfVxuICAgICAgaWYgKGNiKSB7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWVUb1dyYXAsXG4gICAgICAgICAgICB0aGlzWydfb24nICsgZXZlbnROYW1lVG9XcmFwXSA9IGNiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG4vLyBVdGlsaXR5IG1ldGhvZHMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZXh0cmFjdFZlcnNpb246IGV4dHJhY3RWZXJzaW9uLFxuICB3cmFwUGVlckNvbm5lY3Rpb25FdmVudDogd3JhcFBlZXJDb25uZWN0aW9uRXZlbnQsXG4gIGRpc2FibGVMb2c6IGZ1bmN0aW9uKGJvb2wpIHtcbiAgICBpZiAodHlwZW9mIGJvb2wgIT09ICdib29sZWFuJykge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignQXJndW1lbnQgdHlwZTogJyArIHR5cGVvZiBib29sICtcbiAgICAgICAgICAnLiBQbGVhc2UgdXNlIGEgYm9vbGVhbi4nKTtcbiAgICB9XG4gICAgbG9nRGlzYWJsZWRfID0gYm9vbDtcbiAgICByZXR1cm4gKGJvb2wpID8gJ2FkYXB0ZXIuanMgbG9nZ2luZyBkaXNhYmxlZCcgOlxuICAgICAgICAnYWRhcHRlci5qcyBsb2dnaW5nIGVuYWJsZWQnO1xuICB9LFxuXG4gIC8qKlxuICAgKiBEaXNhYmxlIG9yIGVuYWJsZSBkZXByZWNhdGlvbiB3YXJuaW5nc1xuICAgKiBAcGFyYW0geyFib29sZWFufSBib29sIHNldCB0byB0cnVlIHRvIGRpc2FibGUgd2FybmluZ3MuXG4gICAqL1xuICBkaXNhYmxlV2FybmluZ3M6IGZ1bmN0aW9uKGJvb2wpIHtcbiAgICBpZiAodHlwZW9mIGJvb2wgIT09ICdib29sZWFuJykge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignQXJndW1lbnQgdHlwZTogJyArIHR5cGVvZiBib29sICtcbiAgICAgICAgICAnLiBQbGVhc2UgdXNlIGEgYm9vbGVhbi4nKTtcbiAgICB9XG4gICAgZGVwcmVjYXRpb25XYXJuaW5nc18gPSAhYm9vbDtcbiAgICByZXR1cm4gJ2FkYXB0ZXIuanMgZGVwcmVjYXRpb24gd2FybmluZ3MgJyArIChib29sID8gJ2Rpc2FibGVkJyA6ICdlbmFibGVkJyk7XG4gIH0sXG5cbiAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmIChsb2dEaXNhYmxlZF8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5sb2cgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNob3dzIGEgZGVwcmVjYXRpb24gd2FybmluZyBzdWdnZXN0aW5nIHRoZSBtb2Rlcm4gYW5kIHNwZWMtY29tcGF0aWJsZSBBUEkuXG4gICAqL1xuICBkZXByZWNhdGVkOiBmdW5jdGlvbihvbGRNZXRob2QsIG5ld01ldGhvZCkge1xuICAgIGlmICghZGVwcmVjYXRpb25XYXJuaW5nc18pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc29sZS53YXJuKG9sZE1ldGhvZCArICcgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSAnICsgbmV3TWV0aG9kICtcbiAgICAgICAgJyBpbnN0ZWFkLicpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBCcm93c2VyIGRldGVjdG9yLlxuICAgKlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHJlc3VsdCBjb250YWluaW5nIGJyb3dzZXIgYW5kIHZlcnNpb25cbiAgICogICAgIHByb3BlcnRpZXMuXG4gICAqL1xuICBkZXRlY3RCcm93c2VyOiBmdW5jdGlvbih3aW5kb3cpIHtcbiAgICB2YXIgbmF2aWdhdG9yID0gd2luZG93ICYmIHdpbmRvdy5uYXZpZ2F0b3I7XG5cbiAgICAvLyBSZXR1cm5lZCByZXN1bHQgb2JqZWN0LlxuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICByZXN1bHQuYnJvd3NlciA9IG51bGw7XG4gICAgcmVzdWx0LnZlcnNpb24gPSBudWxsO1xuXG4gICAgLy8gRmFpbCBlYXJseSBpZiBpdCdzIG5vdCBhIGJyb3dzZXJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgfHwgIXdpbmRvdy5uYXZpZ2F0b3IpIHtcbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ05vdCBhIGJyb3dzZXIuJztcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgaWYgKG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEpIHsgLy8gRmlyZWZveC5cbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ2ZpcmVmb3gnO1xuICAgICAgcmVzdWx0LnZlcnNpb24gPSBleHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9GaXJlZm94XFwvKFxcZCspXFwuLywgMSk7XG4gICAgfSBlbHNlIGlmIChuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhKSB7XG4gICAgICAvLyBDaHJvbWUsIENocm9taXVtLCBXZWJ2aWV3LCBPcGVyYS5cbiAgICAgIC8vIFZlcnNpb24gbWF0Y2hlcyBDaHJvbWUvV2ViUlRDIHZlcnNpb24uXG4gICAgICByZXN1bHQuYnJvd3NlciA9ICdjaHJvbWUnO1xuICAgICAgcmVzdWx0LnZlcnNpb24gPSBleHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9DaHJvbShlfGl1bSlcXC8oXFxkKylcXC4vLCAyKTtcbiAgICB9IGVsc2UgaWYgKG5hdmlnYXRvci5tZWRpYURldmljZXMgJiZcbiAgICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvRWRnZVxcLyhcXGQrKS4oXFxkKykkLykpIHsgLy8gRWRnZS5cbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ2VkZ2UnO1xuICAgICAgcmVzdWx0LnZlcnNpb24gPSBleHRyYWN0VmVyc2lvbihuYXZpZ2F0b3IudXNlckFnZW50LFxuICAgICAgICAgIC9FZGdlXFwvKFxcZCspLihcXGQrKSQvLCAyKTtcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiAmJlxuICAgICAgICBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9BcHBsZVdlYktpdFxcLyhcXGQrKVxcLi8pKSB7IC8vIFNhZmFyaS5cbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ3NhZmFyaSc7XG4gICAgICByZXN1bHQudmVyc2lvbiA9IGV4dHJhY3RWZXJzaW9uKG5hdmlnYXRvci51c2VyQWdlbnQsXG4gICAgICAgICAgL0FwcGxlV2ViS2l0XFwvKFxcZCspXFwuLywgMSk7XG4gICAgfSBlbHNlIHsgLy8gRGVmYXVsdCBmYWxsdGhyb3VnaDogbm90IHN1cHBvcnRlZC5cbiAgICAgIHJlc3VsdC5icm93c2VyID0gJ05vdCBhIHN1cHBvcnRlZCBicm93c2VyLic7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn07XG5cbn0se31dfSx7fSxbM10pKDMpXG59KTsiXSwic291cmNlUm9vdCI6IiJ9