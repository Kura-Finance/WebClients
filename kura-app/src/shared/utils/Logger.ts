// Logger Utility for better debugging
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private static logs: LogEntry[] = [];
  private static maxLogs = 100;

  static log(module: string, message: string, data?: any, level: LogLevel = 'info') {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
    };

    this.logs.push(entry);

    // Keep logs size manageable
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${module}]`;
    const logArgs = [prefix, message];
    if (data !== undefined) {
      logArgs.push(data);
    }
    
    switch (level) {
      case 'error':
        console.error(...logArgs);
        break;
      case 'warn':
        console.warn(...logArgs);
        break;
      case 'debug':
        console.debug(...logArgs);
        break;
      default:
        console.log(...logArgs);
    }
  }

  static debug(module: string, message: string, data?: any) {
    this.log(module, message, data, 'debug');
  }

  static info(module: string, message: string, data?: any) {
    this.log(module, message, data, 'info');
  }

  static warn(module: string, message: string, data?: any) {
    this.log(module, message, data, 'warn');
  }

  static error(module: string, message: string, data?: any) {
    this.log(module, message, data, 'error');
  }

  static getLogs(filter?: { module?: string; level?: LogLevel; limit?: number }): LogEntry[] {
    let filtered = [...this.logs];

    if (filter?.module) {
      filtered = filtered.filter((log) => log.module === filter.module);
    }

    if (filter?.level) {
      filtered = filtered.filter((log) => log.level === filter.level);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  static clearLogs() {
    this.logs = [];
  }

  static exportLogs(): string {
    return this.logs
      .map((log) => `${log.timestamp} [${log.level.toUpperCase()}] ${log.module}: ${log.message} ${log.data ? JSON.stringify(log.data) : ''}`)
      .join('\n');
  }
}

export default Logger;
