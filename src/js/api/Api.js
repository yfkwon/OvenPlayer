//import CaptionManager from "api/caption/Manager";
import Configurator from "api/Configurator";
import Events from "utils/events";
import LazyCommandExecutor from "api/LazyCommandExecutor";
import LogManager from "utils/logger";
import MediaManager from "api/media/Manager";
import PlaylistManager from "api/playlist/Manager";
import ProviderController from "api/provider/Controller";
import Promise, {resolved} from "api/shims/promise";
import {READY, ERROR, INIT_ERROR, DESTROY} from "api/constants";
import {version} from 'version';
/**
 * @brief   This object connects UI to the provider.
 * @param   {object}    container  dom element
 *
 * */

const Api = function(container){
    let logManager = LogManager();
    const that = {
        on : Events.on,
        once: Events.once,
        off: Events.off,
        trigger: Events.trigger
    };

    OvenPlayerConsole.log("[[OvenPlayer]] v."+ version);
    OvenPlayerConsole.log("API loaded.");
    //let captionManager = CaptionManager(that);
    let mediaManager = MediaManager(container);
    let playlistManager = PlaylistManager();
    let providerController = ProviderController();
    let currentProvider = "";
    let playerConfig = "";
    let lazyQueue = "";

    const initProvider = function(lastPlayPosition){
        const pickQualityFromSource = (sources) =>{
            var quality = 0;
            if (sources) {
                for (var i = 0; i < sources.length; i++) {
                    if (sources[i].default) {
                        quality = i;
                    }
                    if (playerConfig.getQualityLabel() && sources[i].label === playerConfig.getQualityLabel() ) {
                        return i;
                    }
                }
            }
            return quality;
        };

        return providerController.loadProviders(playlistManager.getPlaylist()).then(Providers => {
            if(currentProvider){
                currentProvider.destroy();
                currentProvider = null;
            }
            const videoElement = mediaManager.createElement();
            let currentSourceIndex = pickQualityFromSource(playlistManager.getCurrentSources());

            OvenPlayerConsole.log("current source index : "+ currentSourceIndex);

            currentProvider = Providers[currentSourceIndex](videoElement, playerConfig);

            //This passes the event created by the Provider to API.
            currentProvider.on("all", function(name, data){
                that.trigger(name, data);
            });

        }).then(()=>{
            currentProvider.preload(playlistManager.getCurrentSources(), lastPlayPosition );

            lazyQueue.flush();
            //This is no reason to exist anymore.
            lazyQueue.destroy();

            that.trigger(READY);
        }).catch((error) => {
            const errorObject = {code : INIT_ERROR, reason : "init error.", message : "Player init error.", error : error};
            that.trigger(ERROR, errorObject);

            /*
                init()시 src가 없이 초기화 하는 경우. (src 없이 초기화 하는게 모순이라 생각이 들지만)
                playerInstance.create("elId", {});
                playerInstance.load(src);
                를 대응하기 위해 src없어 프로바이드 로드 못해 initError 발생하는 경우 load는 한번 실행할 수 있게 해주즈아
            */
            lazyQueue.removeAndExcuteOnce("load");
        });
    };


    /**
     * API 초기화 함수
     * init
     * @param      {object} options player initial option value.
     * @returns
     **/
    that.init = (options) =>{
        //It collects the commands and executes them at the time when they are executable.
        lazyQueue = LazyCommandExecutor(that, ['load','play','pause','seek','stop', 'getDuration', 'getPosition', 'getVolume', 'getMute', 'getBuffer', 'getState']);
        playerConfig = Configurator(options);
        if(!playerConfig.isDebug()){
            logManager.disable();
        }
        OvenPlayerConsole.log("API : init()");
        OvenPlayerConsole.log("API : init() config : ", playerConfig);

        playlistManager.setPlaylist(playerConfig.getPlaylist());
        OvenPlayerConsole.log("API : init() sources : " , playlistManager.getCurrentSources());
        initProvider();
    };
    that.getConfig = () => {
        OvenPlayerConsole.log("API : getConfig()", playerConfig.getConfig());
        return playerConfig.getConfig();
    };

    that.getDuration = () => {
        OvenPlayerConsole.log("API : getDuration()", currentProvider.getDuration());
        return currentProvider.getDuration();
    };
    that.getPosition = () => {
        OvenPlayerConsole.log("API : getPosition()", currentProvider.getPosition());
        return currentProvider.getPosition();
    };
    that.getVolume = () => {
        OvenPlayerConsole.log("API : getVolume()", currentProvider.getVolume());
        return currentProvider.getVolume();
    };
    that.setVolume = (volume) => {
        OvenPlayerConsole.log("API : setVolume() " + volume);
        currentProvider.setVolume(volume);
    };
    that.setMute = (state) => {
        OvenPlayerConsole.log("API : setMute() " + state);
        return currentProvider.setMute(state);
    };
    that.getMute = () => {
        OvenPlayerConsole.log("API : getMute() " + currentProvider.getMute());
        return currentProvider.getMute();
    };
    that.load = (playlist) => {
        OvenPlayerConsole.log("API : load() ", playlist);
        lazyQueue = LazyCommandExecutor(that, ['play','seek','stop']);

        if(playlist){
            currentProvider.setCurrentQuality(0);
            playlistManager.setPlaylist(playlist);
        }
        return initProvider();

    };
    that.play = () => {
        OvenPlayerConsole.log("API : play() ");
        currentProvider.play();
    }
    that.pause = () => {
        OvenPlayerConsole.log("API : pause() ");
        currentProvider.pause();
    };
    that.seek = (position) => {
        OvenPlayerConsole.log("API : seek() "+ position);
        currentProvider.seek(position);
    };
    that.setPlaybackRate = (playbackRate) =>{
        OvenPlayerConsole.log("API : setPlaybackRate() ", playbackRate);
        return currentProvider.setPlaybackRate(playerConfig.setDefaultPlaybackRate(playbackRate));
    };
    that.getPlaybackRate = () =>{
        OvenPlayerConsole.log("API : getPlaybackRate() ", currentProvider.getPlaybackRate());
        return currentProvider.getPlaybackRate();
    };
    that.getQualityLevels = () =>{
        OvenPlayerConsole.log("API : getQualityLevels() ", currentProvider.getQualityLevels());
        return currentProvider.getQualityLevels();
    };
    that.getCurrentQuality = () =>{
        OvenPlayerConsole.log("API : getCurrentQuality() ", currentProvider.getCurrentQuality());
        return currentProvider.getCurrentQuality();
    };
    that.setCurrentQuality = (qualityIndex) =>{
        OvenPlayerConsole.log("API : setCurrentQuality() ", qualityIndex);

        //현재 재생중인 소스의 프로바이더와 새로운 qualityIndex 소스의 프로바이더가 같다면 기존 프로바이더를 재활용한다. 그렇지 않으면 initProvider()를 통해 재로딩
        let sources = playlistManager.getCurrentSources();
        let currentSource = sources[that.getCurrentQuality()];
        let newSource = sources[qualityIndex];
        let lastPlayPosition = that.getPosition();
        let isSameProvider = providerController.isSameProvider(currentSource, newSource);
        // provider.serCurrentQuality -> playerConfig setting -> load
        let resQualityIndex = currentProvider.setCurrentQuality(qualityIndex, isSameProvider);

        OvenPlayerConsole.log("API : setCurrentQuality() isSameProvider", isSameProvider);

        if(!isSameProvider){
            lazyQueue = LazyCommandExecutor(that, ['play']);
            //프로바이더가 변경될때 기존 상태를 유지 할 수 없기 때문에 프로바이더 변경 전 마지막 재생 포지션을 가져온다.
            initProvider(lastPlayPosition);
        }

        return resQualityIndex;
    };

    /* Captions : This is not supported in the current version.*/
    /*that.setCurrentCaption = (index) =>{
        return captionManager.setCurrentCaption(index);
    }
    that.getCurrentCaption = () =>{
        return captionManager.getCurrentCaption();
    }
    that.getCaptionList = () => {
        return captionManager.getCaptionList();
    }
    that.addCaption = (track) => {
        return captionManager.addCaption();
    }
    that.getCaptionList = () => {
        return captionManager.getCaptionList();
    }*/

    that.getBuffer = () => {
        OvenPlayerConsole.log("API : getBuffer() ", currentProvider.getBuffer());
        currentProvider.getBuffer();
    };
    that.getState = () => {
        OvenPlayerConsole.log("API : getState() ", currentProvider.getState());
        return currentProvider.getState();
    };
    that.stop = () => {
        OvenPlayerConsole.log("API : stop() ");
        currentProvider.stop();
    };
    that.remove = () => {
        OvenPlayerConsole.log("API : remove() ");
        lazyQueue.destroy();
        currentProvider.destroy();
        currentProvider = null;
        providerController = null;
        playlistManager = null;
        playerConfig = null;

        that.trigger(DESTROY);
        that.off();

        OvenPlayerConsole.log("API : remove() - lazyQueue, currentProvider, providerController, playlistManager, playerConfig, api event destroed. ");
        logManager.destroy();
    };

    return that;
};



export default Api;


