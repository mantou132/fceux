// NOTE: This file contains inline documentation (@setting and @function tags)
// for generating index.d.ts and API.md at build (by gen-api-doc.py).

(function () {
  Module._defaultConfig = {
    /*
    @setting video-system 'auto' 'auto'|'dendy'|'ntsc'|'pal'
    Set video system/region.
    */
    'video-system': 'auto',
    /*
    @setting video-ntsc false boolean
    Enable NTSC composite signal emulation.
    */
    'video-ntsc': false,
    /*
    @setting video-tv false boolean
    Enable CRT TV emulation.
    */
    'video-tv': false,
    /*
    @setting video-brightness 0.0 number
    Adjust picture brightness.
    */
    'video-brightness': 0.0,
    /*
    @setting video-color 0.0 number
    Adjust picture color/saturation.
    */
    'video-color': 0.0,
    /*
    @setting video-contrast 0.0 number
    Adjust picture contrast.
    */
    'video-contrast': 0.0,
    /*
    @setting video-gamma 0.0 number
    Adjust picture gamma.
    */
    'video-gamma': 0.0,
    /*
    @setting video-sharpness 0.2 number
    Set picture sharpness.
    Requires `'video-ntsc': true`.
    */
    'video-sharpness': 0.2,
    /*
    @setting video-noise 0.3 number
    Set NTSC signal noise level.
    Requires `'video-ntsc': true`.
    */
    'video-noise': 0.3,
    /*
    @setting video-convergence 0.4 number
    Set convergence of the CRT TV red and blue rays.
    Requires `'video-tv': true`.
    */
    'video-convergence': 0.4,
    /*
    @setting video-scanlines 0.1 number
    Set TV scanline strength.
    Requires `'video-tv': true`.
    */
    'video-scanlines': 0.1,
    /*
    @setting video-glow 0.2 number
    Set TV screen glow amount.
    Requires `'video-tv': true`.
    */
    'video-glow': 0.2,
    /*
    @setting system-port-2 'zapper' 'controller'|'zapper'
    Set the peripheral of the 2nd controller port.
    */
    'system-port-2': 'controller',
  };

  /*
  @function init: (canvasQuerySelector: string) => boolean
  Initialise the instance.
  Must be called before anything else and only once.
  Returns `true` on success, `false` otherwise.
  */

  /*
  @function update: () => void
  Update the instance.
  Updates emulation, render graphics and audio.
  Call in `requestAnimationFrame()`.
  */

  /*
  @function loadGame: (array: Uint8Array, filename?: string) => void
  Load and start a game from an `Uint8Array`.
  Optional `filename` is for FCEUX NTSC/PAL region autodetection.
  Supported file formats: NES, ZIP, NSF.
  Events: `'game-loaded'` when game is loaded.
  */
  Module.loadGame = function (uint8Array, filename) {
    const path = '/tmp/' + (filename || 'rom');
    FS.writeFile(path, uint8Array);
    Module._startGame(path);
  };

  /*
  @function downloadGame: (url: RequestInfo, init?: RequestInit, filename?: string) => void
  Download game, then load and start it with loadGame().
  Pass optional `filename` for FCEUX NTSC/PAL region autodetection,
  otherwise `url` filename is used.
  Uses `fetch()`.
  */
  Module.downloadGame = function (url, init, filename) {
    filename = filename || url.split('/').pop();
    fetch(url, init).then((response) => {
      if (response.ok) {
        response.arrayBuffer().then((buffer) => {
          Module.loadGame(new Uint8Array(buffer), filename);
        });
      } else {
        throw Error;
      }
    });
  };

  /*
  @function gameMd5: () => string
  Get MD5 hash of the loaded game.
  Returns `''` if no game is loaded.
  */

  /*
  @function reset: () => void
  Reset system.
  Same as pushing the reset button.
  */

  /*
  @function setControllerBits: (bits: number) => void
  Set game controllers state (bits).
  Bits 0..7 represent controller 1, bits 8..15 controller 2, etc.
  Buttons bits are in order: A, B, Select, Start, Up, Down, Left, Right.
  For example, bit 0 = controller 1 A button, bit 9 = controller 2 B button.
  */

  /*
  @function triggerZapper: (x: number, y: number) => void
  Trigger Zapper at given coordinates.
  The `x` and `y` are in canvas client coordinates
  (`getBoundingClientRect()`).
  */

  /*
  @function setThrottling: (throttling: boolean) => void
  Enable/disable throttling (aka turbo, fast-forward).
  */
  /*
  @function throttling: () => boolean
  Get throttling enabled/disabled state.
  */

  /*
  @function setPaused: (pause: boolean) => void
  Pause/unpause.
  */
  /*
  @function paused: () => boolean
  Get paused/unpaused state.
  */

  /*
  @function advanceFrame: () => void
  Advance a single frame.
  Use this when paused to advance frames.
  */

  /*
  @function setState: (index: number) => void
  Set current save state index.
  Allowed range: 0..9.
  Default: 0 (set when game is loaded).
  */
  /*
  @function saveState: () => void
  Save save state.
  */
  /*
  @function loadState: () => void
  Load save state.
  */

  /*
  @function setMuted: (muted: boolean) => void
  Mute/unmute audio.
  */
  /*
  @function muted: () => boolean
  Get mute/unmute state.
  */

  /*
  @function setConfig: <K extends keyof SettingsMap>(setting: K, value: SettingsMap[K]) => void
  Set a configuration setting:
  */

  /*
  @function addEventListener: <K extends keyof EventMap>(name: K, listener: EventMap[K]) => void
  Add event listener.
  */
  Module.eventListeners = {};
  Module.addEventListener = function (name, listener) {
    Module.eventListeners[name] = listener;
  };

  /*
  @function removeEventListener: (listener: any) => void
  Remove event listener.
  */
  Module.removeEventListener = function (listener) {
    for (let k in Module.eventListeners) {
      if (Module.eventListeners[k] == listener) {
        delete Module.eventListeners[k];
      }
    }
  };

  /*
  @function exportSaveFiles: () => SaveFiles
  Export save files of the currently loaded game.
  */
  Module.exportSaveFiles = function () {
    Module._saveGameSave();
    const dir = '/tmp/sav/';
    const result = {};
    for (let name of FS.readdir(dir)) {
      if (FS.isFile(FS.stat(dir + name).mode)) {
        result[name] = FS.readFile(dir + name);
      }
    }
    return result;
  };
  /*
  @function importSaveFiles: (saveFiles: SaveFiles) => void
  Import save files for the currently loaded game.
  */
  Module.importSaveFiles = function (states) {
    Module.deleteSaveFiles();
    const dir = '/tmp/sav/';
    for (let name in states) {
      FS.writeFile(dir + name, states[name]);
    }
    Module._loadGameSave();
  };
  /*
  @function deleteSaveFiles: () => void
  Delete all save files.
  */
  Module.deleteSaveFiles = function () {
    const dir = '/tmp/sav';
    FS.unmount(dir);
    FS.mount(MEMFS, {}, dir);
  };
})();
