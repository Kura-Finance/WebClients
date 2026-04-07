import { createLogger, format, transports } from 'winston';

const { combine, errors, json, printf, splat, timestamp, colorize } = format;

const isProduction = process.env.NODE_ENV === 'production';

const developmentFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaText = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp as string} [${level}]: ${stack || message}${metaText}`;
});

export const appLogger = createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: isProduction
    ? combine(timestamp(), errors({ stack: true }), json())
    : combine(colorize({ all: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), splat(), developmentFormat),
  transports: [new transports.Console()],
  exitOnError: false,
});