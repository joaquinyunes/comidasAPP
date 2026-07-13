const isDevelopment = process.env.NODE_ENV !== "production";

function formatMessage(message: string, meta?: Record<string, unknown>): string {
  if (meta && Object.keys(meta).length > 0) {
    return `${message} ${JSON.stringify(meta)}`;
  }
  return message;
}

class Logger {
  private childBindings: Record<string, unknown>;

  constructor(bindings: Record<string, unknown> = {}) {
    this.childBindings = bindings;
  }

  private merge(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
    const merged = { ...this.childBindings, ...(meta || {}) };
    return Object.keys(merged).length > 0 ? merged : undefined;
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (isDevelopment) console.debug(formatMessage(message, this.merge(meta)));
  }

  info(message: string, meta?: Record<string, unknown>) {
    console.info(formatMessage(message, this.merge(meta)));
  }

  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(formatMessage(message, this.merge(meta)));
  }

  error(message: string, meta?: Record<string, unknown>) {
    console.error(formatMessage(message, this.merge(meta)));
  }

  fatal(message: string, meta?: Record<string, unknown>) {
    console.error(formatMessage(message, this.merge(meta)));
  }

  child(bindings: Record<string, unknown>) {
    return new Logger({ ...this.childBindings, ...bindings });
  }

  request(method: string, url: string, meta?: Record<string, unknown>) {
    this.info(`${method} ${url}`, { method, url, ...(meta || {}) });
  }

  response(statusCode: number, durationMs: number, meta?: Record<string, unknown>) {
    this.info(`Response ${statusCode} in ${durationMs}ms`, { statusCode, durationMs, ...(meta || {}) });
  }

  db(query: string, durationMs: number, meta?: Record<string, unknown>) {
    this.debug(`DB query in ${durationMs}ms`, { query, durationMs, ...(meta || {}) });
  }

  socket(event: string, tenantId?: string, meta?: Record<string, unknown>) {
    this.info(`Socket: ${event}`, { event, tenantId, ...(meta || {}) });
  }

  audit(action: string, entity: string, entityId: string, meta?: Record<string, unknown>) {
    this.info(`Audit: ${action} ${entity}`, { action, entity, entityId, ...(meta || {}) });
  }

  metric(name: string, value: number, tags?: Record<string, string>) {
    this.info(`Metric: ${name}=${value}`, { metric: name, value, tags });
  }
}

export const logger = new Logger();

export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}

export default logger;