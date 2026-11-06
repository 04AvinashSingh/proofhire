import { describe, it, expect } from "vitest";
import { MetricsRegistry } from "./metrics.js";

describe("Prometheus Metrics Registry", () => {
  it("registers and increments counter with labels", () => {
    const reg = new MetricsRegistry();
    reg.registerCounter("test_counter_total", "Test counter help");

    reg.incCounter("test_counter_total", { method: "GET", status: 200 });
    reg.incCounter("test_counter_total", { method: "GET", status: 200 }, 2);
    reg.incCounter("test_counter_total", { method: "POST", status: 201 });

    const output = reg.render();
    expect(output).toContain("# HELP test_counter_total Test counter help");
    expect(output).toContain("# TYPE test_counter_total counter");
    expect(output).toContain('test_counter_total{method="GET",status="200"} 3');
    expect(output).toContain('test_counter_total{method="POST",status="201"} 1');
  });

  it("registers and renders histograms with cumulative buckets", () => {
    const reg = new MetricsRegistry();
    reg.registerHistogram("test_duration_seconds", "Test histogram help", [0.1, 0.5, 1.0]);

    reg.observeHistogram("test_duration_seconds", 0.05, { route: "/jobs" });
    reg.observeHistogram("test_duration_seconds", 0.3, { route: "/jobs" });
    reg.observeHistogram("test_duration_seconds", 0.8, { route: "/jobs" });

    const output = reg.render();
    expect(output).toContain("# TYPE test_duration_seconds histogram");
    expect(output).toContain('test_duration_seconds_bucket{route="/jobs",le="0.1"} 1');
    expect(output).toContain('test_duration_seconds_bucket{route="/jobs",le="0.5"} 2');
    expect(output).toContain('test_duration_seconds_bucket{route="/jobs",le="1"} 3');
    expect(output).toContain('test_duration_seconds_bucket{route="/jobs",le="+Inf"} 3');
    expect(output).toContain('test_duration_seconds_count{route="/jobs"} 3');
  });

  it("renders process gauge metrics", () => {
    const reg = new MetricsRegistry();
    const output = reg.render();

    expect(output).toContain("# TYPE nodejs_uptime_seconds gauge");
    expect(output).toContain("# TYPE nodejs_heap_used_bytes gauge");
  });
});

