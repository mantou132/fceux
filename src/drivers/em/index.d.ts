interface SettingsMap {
  'video-system': 'auto' | 'dendy' | 'ntsc' | 'pal';
  'video-ntsc': boolean;
  'video-tv': boolean;
  'video-brightness': number;
  'video-color': number;
  'video-contrast': number;
  'video-gamma': number;
  'video-sharpness': number;
  'video-noise': number;
  'video-convergence': number;
  'video-scanlines': number;
  'video-glow': number;
  'system-port-2': 'controller' | 'zapper';
}

interface EventMap {
  'game-loaded': (filename: string) => any;
}

interface SaveFiles {
  [filename: string]: Uint8Array;
}

export default function FCEUX(params?): Promise<FceuxModule>;

export class FceuxModule {
  init: (canvasQuerySelector: string) => boolean;
  update: () => void;
  loadGame: (array: Uint8Array, filename?: string) => void;
  downloadGame: (url: RequestInfo, init?: RequestInit, filename?: string) => void;
  gameMd5: () => string;
  reset: () => void;
  setControllerBits: (bits: number) => void;
  triggerZapper: (x: number, y: number) => void;
  setThrottling: (throttling: boolean) => void;
  throttling: () => boolean;
  setPaused: (pause: boolean) => void;
  paused: () => boolean;
  advanceFrame: () => void;
  setState: (index: number) => void;
  saveState: () => void;
  loadState: () => void;
  setMuted: (muted: boolean) => void;
  muted: () => boolean;
  setConfig: <K extends keyof SettingsMap>(setting: K, value: SettingsMap[K]) => void;
  addEventListener: <K extends keyof EventMap>(name: K, listener: EventMap[K]) => void;
  removeEventListener: (listener: any) => void;
  exportSaveFiles: () => SaveFiles;
  importSaveFiles: (saveFiles: SaveFiles) => void;
  deleteSaveFiles: () => void;

  _audioContext?: AudioContext; // Web Audio context created by init().
  _defaultConfig: SettingsMap; // Default settings. Do not modify.

  // Exposed Emscripten module properties:
  then: (resolve?, reject?) => FceuxModule;
  FS: any;
}
