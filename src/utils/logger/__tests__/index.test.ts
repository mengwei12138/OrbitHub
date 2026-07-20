import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearLogs,
  createEngineLogger,
  getLogger,
  setLoggerLevel,
} from '../index';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    clearLogs();
    setLoggerLevel(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getLogger', () => {
    it('应返回同一个全局 logger 实例', () => {
      const logger1 = getLogger();
      const logger2 = getLogger();
      expect(logger1).toBe(logger2);
    });

    it('应支持 debug 方法', () => {
      const logger = getLogger();
      logger.debug('test message', { key: 'value' });
      expect(console.log).toHaveBeenCalled();
    });

    it('应支持 info 方法', () => {
      const logger = getLogger();
      logger.info('info message');
      expect(console.log).toHaveBeenCalled();
    });

    it('应支持 warn 方法', () => {
      const logger = getLogger();
      logger.warn('warn message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('应支持 error 方法', () => {
      const logger = getLogger();
      logger.error('error message');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('setLoggerLevel', () => {
    it('传入 true 时应设置 debug 级别', () => {
      setLoggerLevel(true);
      const logger = getLogger();
      logger.debug('debug message');
      expect(console.log).toHaveBeenCalled();
    });

    it('传入 false 时应设置 error 级别', () => {
      setLoggerLevel(false);
      const logger = getLogger();
      logger.debug('debug message');
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('createEngineLogger', () => {
    it('应返回带有引擎前缀的 logger', () => {
      const logger = createEngineLogger('plyr');
      logger.debug('test message');
      const logOutput = (console.log as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      expect(logOutput).toContain('[PLYR]');
      expect(logOutput).toContain('test message');
    });

    it('不同引擎应有不同前缀', () => {
      const plyrLogger = createEngineLogger('plyr');
      const hlsLogger = createEngineLogger('hls');

      plyrLogger.debug('test');
      hlsLogger.debug('test');

      expect(console.log).toHaveBeenCalledTimes(2);
      const calls = (console.log as ReturnType<typeof vi.fn>).mock.calls;
      expect(calls[0][0]).toContain('[PLYR]');
      expect(calls[1][0]).toContain('[HLS]');
    });

    it('应支持 info/warn/error 方法', () => {
      const logger = createEngineLogger('native');

      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Logger 实例方法', () => {
    it('getLogs 应返回日志数组', () => {
      const logger = getLogger();
      logger.debug('message 1');
      logger.info('message 2');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].message).toBe('message 1');
      expect(logs[1].message).toBe('message 2');
    });

    it('clearLogs 应清空日志', () => {
      const logger = getLogger();
      logger.debug('message');
      clearLogs();

      const logs = logger.getLogs();
      expect(logs).toHaveLength(0);
    });

    it('日志应包含 timestamp/level/prefix/message', () => {
      const logger = getLogger();
      logger.debug('test message');

      const logs = logger.getLogs();
      expect(logs[0]).toMatchObject({
        level: 0,
        message: 'test message',
      });
      expect(logs[0].timestamp).toBeDefined();
      expect(typeof logs[0].timestamp).toBe('number');
    });

    it('日志应支持 data 参数', () => {
      const logger = getLogger();
      logger.debug('message', { key: 'value', num: 123 });

      const logs = logger.getLogs();
      expect(logs[0].data).toEqual({ key: 'value', num: 123 });
    });
  });
});
