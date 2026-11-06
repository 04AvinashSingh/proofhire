import { Request, Response, NextFunction } from "express";

interface CounterMetric {
  name: string;
  help: string;
  values: Map<string, number>;
}

interface HistogramMetric {
  name: string;
  help: string;
  buckets: number[];
  observations: Map<string, { count: number; sum: number; buckets: number[] }>;
}

interface GaugeMetric {
  name: string;
  help: string;
  getValue: () => number;
}

export class MetricsRegistry {
  private counters: Map<string, CounterMetric> = new Map();
  private histograms: Map<string, HistogramMetric> = new Map();
  private gauges: Map<string, GaugeMetric> = new Map();

  constructor() {
    this.registerGauge(
      "nodejs_uptime_seconds",
      "Process uptime in seconds",
      () => Math.floor(process.uptime())
    );
    this.registerGauge(
      "nodejs_heap_used_bytes",
      "Node.js memory heap used in bytes",
      () => process.memoryUsage().heapUsed
    );
  }

  public registerCounter(name: string, help: string): void {
    if (!this.counters.has(name)) {
      this.counters.set(name, { name, help, values: new Map() });
    }
  }

  public incCounter(name: string, labels: Record<string, string | number> = {}, delta = 1): void {
    const counter = this.counters.get(name);
    if (!counter) return;

    const key = this.serializeLabels(labels);
    const current = counter.values.get(key) || 0;
    counter.values.set(key, current + delta);
  }

  public registerHistogram(
    name: string,
    help: string,
    buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  ): void {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, {
        name,
        help,
        buckets: [...buckets].sort((a, b) => a - b),
        observations: new Map(),
      });
    }
  }

  public observeHistogram(
    name: string,
    value: number,
    labels: Record<string, string | number> = {}
  ): void {
    const hist = this.histograms.get(name);
    if (!hist) return;

    const key = this.serializeLabels(labels);
    let obs = hist.observations.get(key);
    if (!obs) {
      obs = { count: 0, sum: 0, buckets: new Array(hist.buckets.length).fill(0) };
      hist.observations.set(key, obs);
    }

    obs.count += 1;
    obs.sum += value;

    for (let i = 0; i < hist.buckets.length; i++) {
      const bucket = hist.buckets[i];
      if (bucket !== undefined && value <= bucket) {
        obs.buckets[i] = (obs.buckets[i] || 0) + 1;
      }
    }
  }

  public registerGauge(name: string, help: string, getValue: () => number): void {
    this.gauges.set(name, { name, help, getValue });
  }

  private serializeLabels(labels: Record<string, string | number>): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return "";
    return entries.map(([k, v]) => `${k}="${String(v).replace(/"/g, '\\"')}"`).join(",");
  }

  public render(): string {
    const lines: string[] = [];

    // Gauges
    for (const [, gauge] of this.gauges) {
      lines.push(`# HELP ${gauge.name} ${gauge.help}`);
      lines.push(`# TYPE ${gauge.name} gauge`);
      lines.push(`${gauge.name} ${gauge.getValue()}`);
    }

    // Counters
    for (const [, counter] of this.counters) {
      lines.push(`# HELP ${counter.name} ${counter.help}`);
      lines.push(`# TYPE ${counter.name} counter`);
      if (counter.values.size === 0) {
        lines.push(`${counter.name} 0`);
      } else {
        for (const [labels, val] of counter.values) {
          const labelStr = labels ? `{${labels}}` : "";
          lines.push(`${counter.name}${labelStr} ${val}`);
        }
      }
    }

    // Histograms
    for (const [, hist] of this.histograms) {
      lines.push(`# HELP ${hist.name} ${hist.help}`);
      lines.push(`# TYPE ${hist.name} histogram`);
      for (const [labels, obs] of hist.observations) {
        const prefix = labels ? `${labels},` : "";
        const labelBlock = labels ? `{${labels}}` : "";
        for (let i = 0; i < hist.buckets.length; i++) {
          lines.push(`${hist.name}_bucket{${prefix}le="${hist.buckets[i]}"} ${obs.buckets[i]}`);
        }
        lines.push(`${hist.name}_bucket{${prefix}le="+Inf"} ${obs.count}`);
        lines.push(`${hist.name}_sum${labelBlock} ${obs.sum.toFixed(6)}`);
        lines.push(`${hist.name}_count${labelBlock} ${obs.count}`);
      }
    }

    return lines.join("\n") + "\n";
  }
}

export const metrics = new MetricsRegistry();

// Initialize default HTTP metrics
metrics.registerCounter(
  "http_requests_total",
  "Total number of HTTP requests processed"
);
metrics.registerHistogram(
  "http_request_duration_seconds",
  "Duration of HTTP requests in seconds",
  [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2.5, 5, 10]
);
metrics.registerCounter(
  "ai_service_calls_total",
  "Total number of calls made to Python AI service"
);
metrics.registerHistogram(
  "ai_service_call_duration_seconds",
  "Duration of AI service requests in seconds",
  [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
);

/**
 * Express middleware to collect HTTP metrics.
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime();

  res.on("finish", () => {
    // Normalize route pattern to avoid high cardinality
    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;
    
    // Normalize path by removing UUIDs/IDs
    const cleanPath = req.baseUrl || req.path
      ? (req.baseUrl + req.path).replace(/[0-9a-fA-F-]{36}/g, ":id")
      : req.path;

    metrics.incCounter("http_requests_total", {
      method: req.method,
      route: cleanPath || "unknown",
      status: res.statusCode,
    });

    metrics.observeHistogram(
      "http_request_duration_seconds",
      durationSeconds,
      {
        method: req.method,
        route: cleanPath || "unknown",
        status: res.statusCode,
      }
    );
  });

  next();
}
