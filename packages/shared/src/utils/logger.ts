type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  [key: string]: unknown;
}

function log(level: LogLevel, context: string | undefined, message: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context } : {}),
    ...meta,
  };
  const output = JSON.stringify(entry);
  if (level === "error" || level === "warn") {
    process.stderr.write(output + "\n");
  } else {
    process.stdout.write(output + "\n");
  }
}

export function createLogger(context: string) {
  return {
    debug: (message: string, meta?: Record<string, unknown>) => log("debug", context, message, meta),
    info: (message: string, meta?: Record<string, unknown>) => log("info", context, message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => log("warn", context, message, meta),
    error: (message: string, meta?: Record<string, unknown>) => log("error", context, message, meta),
  };
}
