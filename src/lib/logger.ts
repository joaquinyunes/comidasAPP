import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    service: "restaurantos",
    env: process.env.NODE_ENV || "development",
  },
});

export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => logger.debug(meta, message),
  info: (message: string, meta?: Record<string, unknown>) => logger.info(meta, message),
  warn: (message: string, meta?: Record<string, unknown>) => logger.warn(meta, message),
  error: (message: string, meta?: Record<string, unknown>) => logger.error(meta, message),
  fatal: (message: string, meta?: Record<string, unknown>) => logger.fatal(meta, message),

  child: createChildLogger,

  // Métodos de conveniencia para requests
  request: (method: string, url: string, meta?: Record<string, unknown>) =>
    logger.info({ method, url, ...meta }, `${method} ${url}`),

  response: (statusCode: number, durationMs: number, meta?: Record<string, unknown>) =>
    logger.info({ statusCode, durationMs, ...meta }, `Response ${statusCode} in ${durationMs}ms`),

  // Métodos para DB
  db: (query: string, durationMs: number, meta?: Record<string, unknown>) =>
    logger.debug({ query, durationMs, ...meta }, `DB query in ${durationMs}ms`),

  // Métodos para WebSocket
  socket: (event: string, tenantId?: string, meta?: Record<string, unknown>) =>
    logger.info({ event, tenantId, ...meta }, `Socket: ${event}`),

  // Métodos para auditoría
  audit: (action: string, entity: string, entityId: string, meta?: Record<string, unknown>) =>
    logger.info({ action, entity, entityId, ...meta }, `Audit: ${action} ${entity}`),

  // Métricas
  metric: (name: string, value: number, tags?: Record<string, string>) =>
    logger.info({ metric: name, value, tags }, `Metric: ${name}=${value}`),
};

export default logger;