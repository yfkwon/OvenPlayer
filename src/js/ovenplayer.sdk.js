import API from 'api/Api';
import {isWebRTC} from 'utils/validator';
import _ from 'utils/underscore';
import {getScriptPath} from 'utils/webpack';


__webpack_public_path__ = getScriptPath('ovenplayer.sdk.js');

/**
 * Main OvenPlayerSDK object
 */
const OvenPlayerSDK = window.OvenPlayerSDK = {};

const version = '0.0.1';

const playerList = OvenPlayerSDK.playerList = [];

export const checkAndGetContainerElement = function(container) {

    if (!container) {

        // TODO(rock): Should cause an error.
        return null;
    }

    let containerElement = null;

    if (typeof container === 'string') {

        containerElement = document.getElementById(container);
    } else if (container.nodeType) {

        containerElement = container;
    } else {
        // TODO(rock): Should cause an error.
        return null;
    }

    return containerElement;
}

/**
 * Create player instance and return it.
 *
 * @param      {string | dom element} container  Id of container element or container element
 * @param      {object} options  The options
 */
OvenPlayerSDK.create = function(container, options) {

    let containerElement = checkAndGetContainerElement(container);

    const playerInstance = API(containerElement);
    playerInstance.init(options);

    playerList.push(playerInstance);

    return playerInstance;
};

/**
 * Gets the player instance list.
 *
 * @return     {array}  The player list.
 */
OvenPlayerSDK.getPlayerList = function() {

    return playerList;
};

/**
 * Gets the player instance by container id.
 *
 * @param      {string}  containerId  The container identifier
 * @return     {obeject | null}  The player instance.
 */
OvenPlayerSDK.getPlayerByContainerId = function(containerId) {

    for (let i = 0; i < playerList.length -1; i ++) {

        if (playerList[i].containerId === containerId) {

            return playerList[i];
        }
    }

    return null;
};

/**
 * Gets the player instance by index.
 *
 * @param      {number}  index   The index
 * @return     {object | null}  The player instance.
 */
OvenPlayerSDK.getPlayerByIndex = function(index) {

    const playerInstance = playerList[index];

    if (playerInstance) {

        return playerInstance;
    } else {

        return null;
    }
};

/**
 * Generate webrtc source for player source type.
 *
 * @param      {Object | Array}  source   webrtc source
 * @return     {Array}  Player source Obejct.
 */
OvenPlayerSDK.generateWebrtcUrls = function(sources) {
    return (_.isArray(sources) ? sources : [sources]).map(function(source, index){
        if(source.host && isWebRTC(source.host) && source.application && source.stream){
            return {file : source.host + "/" + source.application + "/" + source.stream, type : "webrtc", label : source.label ? source.label : "webrtc-"+(index+1) };
        }
    });
};

export default OvenPlayerSDK;