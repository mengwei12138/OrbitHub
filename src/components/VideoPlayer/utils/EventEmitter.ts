import type { createEngineLogger } from '@/utils/logger';

import type { EngineEvent } from '../engines/types';

type EngineCallback = (...args: unknown[]) => void;

type EventEmitterLogger = Pick<ReturnType<typeof createEngineLogger>, 'debug'>;

class EventEmitter {
  private listeners = new Map<EngineEvent, Set<EngineCallback>>();
  private logger: EventEmitterLogger;

  constructor(logger: EventEmitterLogger) {
    this.logger = logger;
  }

  on(event: EngineEvent, callback: EngineCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    this.logger.debug('Event registered', {
      event,
      callbackCount: this.listeners.get(event)?.size,
    });
  }

  off(event: EngineEvent, callback: EngineCallback): void {
    this.listeners.get(event)?.delete(callback);

    this.logger.debug('Event unregistered', {
      event,
      callbackCount: this.listeners.get(event)?.size ?? 0,
    });
  }

  emit(event: EngineEvent, ...args: unknown[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(...args);
      }
    }
  }

  destroy(): void {
    this.logger.debug('EventEmitter destroyed', {
      totalEvents: this.listeners.size,
      listenersCleared: Array.from(this.listeners.values()).reduce(
        (sum, set) => sum + set.size,
        0,
      ),
    });
    this.listeners.clear();
  }

  getCallbackCount(event: EngineEvent): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export { EventEmitter };
