import pino from 'pino';

/**
 * Logger service using Pino
 * Provides standardized logging functionality across the application
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

/**
 * Create a child logger with a specific context
 * @param context - The context for the child logger (e.g., service name, resolver name)
 * @returns A child logger instance with the specified context
 */
export const createContextLogger = (context: string) => {
  return logger.child({
    context
  });
};
