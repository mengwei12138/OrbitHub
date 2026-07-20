type LogLevel = 0 | 1 | 2 | 3;

type LogEntry = {
  timestamp: number;
  level: LogLevel;
  prefix: string;
  message: string;
  data?: unknown;
};

type LoggerConfig = {
  level: LogLevel;
  enableTimestamp: boolean;
  enablePrefix: boolean;
};

const LOG_LEVEL_NAMES: readonly ['DEBUG', 'INFO', 'WARN', 'ERROR'] = [
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
];

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level ?? (import.meta.env.MODE === 'development' ? 0 : 3),
      enableTimestamp: config.enableTimestamp ?? true,
      enablePrefix: config.enablePrefix ?? true,
    };
  }

  setLevel(level: LogLevel): void;
  setLevel(debug: boolean): void;
  setLevel(levelOrDebug: LogLevel | boolean): void {
    if (typeof levelOrDebug === 'boolean') {
      this.config.level = levelOrDebug ? 0 : 3;
    } else {
      this.config.level = levelOrDebug;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  debug(message: string, data?: unknown): void {
    this.log(0, message, data);
  }

  info(message: string, data?: unknown): void {
    this.log(1, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log(2, message, data);
  }

  error(message: string, data?: unknown): void {
    this.log(3, message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      prefix: this.config.enablePrefix ? '[VideoPlayer]' : '',
      message,
      data,
    };

    this.logs.push(entry);

    const levelName = LOG_LEVEL_NAMES[level];
    const prefix = this.formatPrefix(entry);
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';

    if (level >= 3) {
      console.error(`${prefix} ${levelName} ${message}${dataStr}`);
    } else if (level >= 2) {
      console.warn(`${prefix} ${levelName} ${message}${dataStr}`);
    } else {
      console.log(`${prefix} ${levelName} ${message}${dataStr}`);
    }
  }

  private formatPrefix(entry: LogEntry): string {
    const parts: string[] = [];

    if (entry.prefix) {
      parts.push(entry.prefix);
    }

    if (this.config.enableTimestamp) {
      const d = new Date(entry.timestamp);
      const time = `${d.getHours().toString().padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d
        .getMilliseconds()
        .toString()
        .padStart(3, '0')}`;
      parts.push(`[${time}]`);
    }

    return parts.join(' ');
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

let globalLogger: Logger | null = null;

export const getLogger = (): Logger => {
  if (!globalLogger) {
    globalLogger = new Logger();
  }
  return globalLogger;
};

export const setLoggerLevel = (debug: boolean): void => {
  getLogger().setLevel(debug);
};

export const clearLogs = (): void => {
  getLogger().clearLogs();
};

export const createEngineLogger = (
  engineType: string,
): Pick<Logger, 'debug' | 'info' | 'warn' | 'error'> => {
  const logger = getLogger();
  const prefix = `[${engineType.toUpperCase()}]`;

  return {
    debug: (msg, data) => logger.debug(`${prefix} ${msg}`, data),
    info: (msg, data) => logger.info(`${prefix} ${msg}`, data),
    warn: (msg, data) => logger.warn(`${prefix} ${msg}`, data),
    error: (msg, data) => logger.error(`${prefix} ${msg}`, data),
  };
};

export type { LogEntry, LoggerConfig, LogLevel };
