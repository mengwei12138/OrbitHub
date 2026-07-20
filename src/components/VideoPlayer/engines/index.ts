import { getLogger } from '@/utils/logger';
import {
  detectEngineType,
  detectEngineTypeByMimeType,
} from '../utils/detector';
import { DASHEngine } from './DASHEngine';
import { HLSEngine } from './HLSEngine';
import { NativeEngine } from './NativeEngine';
import { PlyrEngine } from './PlyrEngine';
import type { EngineType, PlayerEngine } from './types';

export { DASHEngine } from './DASHEngine';
export { HLSEngine } from './HLSEngine';
export { NativeEngine } from './NativeEngine';
export { PlyrEngine } from './PlyrEngine';
export type {
  EngineCallback,
  EngineEvent,
  EngineType,
  PlayerEngine,
} from './types';

const engineMap: Record<EngineType, () => PlayerEngine> = {
  native: () => new NativeEngine(),
  plyr: () => new PlyrEngine(),
  hls: () => new HLSEngine(),
  dash: () => new DASHEngine(),
};

export const createEngine = (type: EngineType): PlayerEngine => {
  const EngineClass = engineMap[type];
  if (!EngineClass) {
    getLogger().warn(`Unknown engine type: ${type}, falling back to Plyr`);
    return new PlyrEngine();
  }
  return EngineClass();
};

export type CreateEngineOptions = {
  mimeType?: string;
  engineType?: EngineType;
};

export const createEngineByUrl = (
  url: string,
  options?: CreateEngineOptions,
): PlayerEngine => {
  let type: EngineType;

  if (options?.engineType) {
    type = options.engineType;
  } else if (options?.mimeType) {
    type = detectEngineTypeByMimeType(options.mimeType);
  } else {
    type = detectEngineType(url);
  }

  // 临时修复：强制使用 NativeEngine 替代 Plyr，避免 Plyr ready 事件不触发的问题
  if (type === 'plyr') {
    getLogger().debug('强制使用 NativeEngine 替代 Plyr');
    return new NativeEngine();
  }

  return createEngine(type);
};

export const isEngineSupported = (type: EngineType): boolean => {
  const engine = createEngine(type);
  return engine.supported;
};
