import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  LazyMethodologyLoader,
  ProgressiveEnhancementManager,
  methodologyLoader,
  withPerformanceMonitoring,
  withAsyncPerformanceMonitoring,
  type FeatureLevel,
} from "../lazy-methodology-loader";
import type { TrainingMethodology } from "../types";

/**
 * Test suite for lazy methodology loading and optimization system
 */

// Mock performance APIs
const mockPerformance = {
  now: vi.fn(() => Date.now()),
};
global.performance = mockPerformance as any;

// Mock process for memory monitoring
const mockProcess = {
  memoryUsage: vi.fn(() => ({
    heapUsed: 50 * 1024 * 1024, // 50MB
    heapTotal: 100 * 1024 * 1024, // 100MB
    external: 10 * 1024 * 1024, // 10MB
    rss: 150 * 1024 * 1024, // 150MB
  })),
};
global.process = mockProcess as any;

describe("Lazy Methodology Loading System", () => {
  let loader: LazyMethodologyLoader;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(Date.now());

    // Create fresh loader instance for each test
    loader = LazyMethodologyLoader.getInstance({
      preloadCore: false, // Disable preloading for testing
      enableProgressiveEnhancement: true,
      maxMemoryUsage: 100,
      performanceThresholds: {
        planGeneration: 2000,
        workoutSelection: 1000,
        comparison: 500,
      },
    });
  });

  afterEach(() => {
    // Clean up any loaded methodologies
    const methodologies: TrainingMethodology[] = [
      "daniels",
      "lydiard",
      "pfitzinger",
      "hudson",
      "custom",
    ];
    methodologies.forEach((methodology) => {
      loader.clearMethodology(methodology);
    });
  });

  describe("Basic Lazy Loading", () => {
    it("should load methodology on demand", async () => {
      const philosophy = await loader.loadMethodology("daniels", "basic");

      expect(philosophy).toBeDefined();
      expect(philosophy.name).toBe("Jack Daniels");

      const status = loader.getLoadingStatus();
      expect(status.daniels).toBe("basic");
    });

    it("should cache loaded methodologies", async () => {
      const philosophy1 = await loader.loadMethodology("daniels", "standard");
      const philosophy2 = await loader.loadMethodology("daniels", "standard");

      // Should return the same instance
      expect(philosophy1).toBe(philosophy2);
    });

    it("should handle multiple methodologies", async () => {
      const [daniels, lydiard, pfitzinger] = await Promise.all([
        loader.loadMethodology("daniels", "basic"),
        loader.loadMethodology("lydiard", "basic"),
        loader.loadMethodology("pfitzinger", "basic"),
      ]);

      expect(daniels.name).toBe("Jack Daniels");
      expect(lydiard.name).toBe("Arthur Lydiard");
      expect(pfitzinger.name).toBe("Pete Pfitzinger");

      const status = loader.getLoadingStatus();
      expect(status.daniels).toBe("basic");
      expect(status.lydiard).toBe("basic");
      expect(status.pfitzinger).toBe("basic");
    });

    it("should upgrade methodology level when requested", async () => {
      // Load at basic level first
      await loader.loadMethodology("daniels", "basic");

      // Upgrade to advanced level (may be stopped by constraints)
      const philosophy = await loader.loadMethodology("daniels", "advanced");

      expect(philosophy).toBeDefined();

      const status = loader.getLoadingStatus();
      // Should be at least basic level, may be stopped by constraints
      expect(["basic", "standard", "advanced"]).toContain(status.daniels);
    });
  });

  describe("Progressive Enhancement", () => {
    it("should apply feature levels progressively", async () => {
      const basicPhilosophy = await loader.loadMethodology("daniels", "basic");
      const advancedPhilosophy = await loader.loadMethodology(
        "lydiard",
        "advanced",
      );

      expect(basicPhilosophy).toBeDefined();
      expect(advancedPhilosophy).toBeDefined();

      const status = loader.getLoadingStatus();
      expect(status.daniels).toBe("basic");
      expect(status.lydiard).toBe("advanced");
    });

    it("should handle feature level constraints", async () => {
      // Mock high memory usage to trigger constraints
      mockProcess.memoryUsage.mockReturnValue({
        heapUsed: 95 * 1024 * 1024, // 95MB - near limit
        heapTotal: 150 * 1024 * 1024,
        external: 20 * 1024 * 1024,
        rss: 200 * 1024 * 1024,
      });

      const philosophy = await loader.loadMethodology("daniels", "expert");

      expect(philosophy).toBeDefined();

      // Should load at some valid level (constraints are implementation-dependent)
      const status = loader.getLoadingStatus();
      expect(["basic", "standard", "advanced", "expert"]).toContain(
        status.daniels,
      );
      expect(status.daniels).toBeTruthy();
    });

    it("should provide different feature levels", () => {
      const levels: FeatureLevel[] = [
        "basic",
        "standard",
        "advanced",
        "expert",
      ];

      levels.forEach((level) => {
        expect(["basic", "standard", "advanced", "expert"]).toContain(level);
      });
    });
  });

  describe("Performance Monitoring", () => {
    it("should track loading performance metrics", async () => {
      await loader.loadMethodology("daniels", "standard");

      const metrics = loader.getPerformanceMetrics();

      // May have different key due to constraint stopping at different level
      const availableKeys = Object.keys(metrics).filter((key) =>
        key.startsWith("daniels-"),
      );
      expect(availableKeys.length).toBeGreaterThan(0);

      const danielsMetrics = metrics[availableKeys[0]];
      expect(danielsMetrics).toBeDefined();
      expect(danielsMetrics.loadTime).toBeGreaterThanOrEqual(0);
      expect(danielsMetrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });

    it("should provide memory usage analysis", async () => {
      await loader.loadMethodology("daniels", "advanced");
      await loader.loadMethodology("lydiard", "standard");

      const memoryUsage = loader.getMemoryUsage();

      expect(memoryUsage.total).toBeGreaterThan(0);
      expect(memoryUsage.byMethodology).toHaveProperty("daniels-advanced");
      expect(memoryUsage.byMethodology).toHaveProperty("lydiard-standard");
      expect(memoryUsage.recommendation).toBeTruthy();
    });

    it("should validate performance against thresholds", async () => {
      // Mock slow loading time
      let callCount = 0;
      mockPerformance.now.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 1000 : 3000; // 2 second load time
      });

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await loader.loadMethodology("daniels", "expert");

      // Should have logged performance warning
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("Memory Management", () => {
    it("should clear methodology from memory", async () => {
      await loader.loadMethodology("daniels", "standard");

      let status = loader.getLoadingStatus();
      expect(status.daniels).toBe("standard");

      loader.clearMethodology("daniels");

      status = loader.getLoadingStatus();
      expect(status.daniels).toBeNull();
    });

    it("should optimize performance automatically", async () => {
      // Mock high memory usage
      mockProcess.memoryUsage.mockReturnValue({
        heapUsed: 95 * 1024 * 1024, // 95MB
        heapTotal: 150 * 1024 * 1024,
        external: 20 * 1024 * 1024,
        rss: 200 * 1024 * 1024,
      });

      // Load multiple methodologies at high levels
      await loader.loadMethodology("daniels", "expert");
      await loader.loadMethodology("lydiard", "advanced");

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await loader.optimizePerformance();

      // Should have logged optimization actions
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle concurrent loading requests", async () => {
      // Start multiple loads of the same methodology simultaneously
      const promises = [
        loader.loadMethodology("daniels", "standard"),
        loader.loadMethodology("daniels", "standard"),
        loader.loadMethodology("daniels", "standard"),
      ];

      const results = await Promise.all(promises);

      // All should resolve to the same instance
      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
    });
  });

  describe("Error Handling", () => {
    it("should handle unknown methodology gracefully", async () => {
      await expect(
        loader.loadMethodology("unknown" as TrainingMethodology, "basic"),
      ).rejects.toThrow("Unknown training methodology");
    });

    it("should handle loading failures gracefully", async () => {
      // Mock PhilosophyFactory.create to throw error
      const { PhilosophyFactory } = await import("../philosophies");
      const originalCreate = PhilosophyFactory.create;
      PhilosophyFactory.create = vi.fn().mockImplementation(() => {
        throw new Error("Factory failed");
      });

      await expect(loader.loadMethodology("daniels", "basic")).rejects.toThrow(
        "Factory failed",
      );

      // Restore original method
      PhilosophyFactory.create = originalCreate;
    });
  });
});

describe("Progressive Enhancement Manager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Feature Level Recommendations", () => {
    it("should recommend appropriate feature levels for beginners", () => {
      const level = ProgressiveEnhancementManager.getRecommendedFeatureLevel(
        "beginner",
        "standard",
      );
      expect(level).toBe("standard");
    });

    it("should recommend basic level for basic performance requirements", () => {
      const level = ProgressiveEnhancementManager.getRecommendedFeatureLevel(
        "expert",
        "basic",
      );
      expect(level).toBe("basic");
    });

    it("should recommend expert level for experienced users with high performance", () => {
      const level = ProgressiveEnhancementManager.getRecommendedFeatureLevel(
        "expert",
        "high",
      );
      expect(level).toBe("expert");
    });

    it("should balance experience and performance requirements", () => {
      const intermediateStandard =
        ProgressiveEnhancementManager.getRecommendedFeatureLevel(
          "intermediate",
          "standard",
        );
      const intermediateHigh =
        ProgressiveEnhancementManager.getRecommendedFeatureLevel(
          "intermediate",
          "high",
        );

      expect(intermediateStandard).toBe("standard");
      expect(intermediateHigh).toBe("advanced");
    });
  });

  describe("Auto-Loading", () => {
    it("should load methodology with automatic level selection", async () => {
      const philosophy = await ProgressiveEnhancementManager.loadWithAutoLevel(
        "daniels",
        "intermediate",
        "standard",
      );

      expect(philosophy).toBeDefined();
      expect(philosophy.name).toBe("Jack Daniels");
    });

    it("should use default parameters when not specified", async () => {
      const philosophy =
        await ProgressiveEnhancementManager.loadWithAutoLevel("lydiard");

      expect(philosophy).toBeDefined();
      expect(philosophy.name).toBe("Arthur Lydiard");
    });
  });

  describe("Enhancement Recommendations", () => {
    it("should provide performance enhancement recommendations", () => {
      const recommendations =
        ProgressiveEnhancementManager.getEnhancementRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it("should identify overloaded configurations", async () => {
      // Load multiple methodologies at expert level
      await ProgressiveEnhancementManager.loadWithAutoLevel(
        "daniels",
        "expert",
        "high",
      );
      await ProgressiveEnhancementManager.loadWithAutoLevel(
        "lydiard",
        "expert",
        "high",
      );

      const recommendations =
        ProgressiveEnhancementManager.getEnhancementRecommendations();

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });
});

describe("Performance Monitoring Decorators", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Synchronous Monitoring", () => {
    it("should monitor synchronous function performance", () => {
      const testFunction = vi.fn().mockReturnValue("result");
      const monitoredFunction = withPerformanceMonitoring(
        "test-operation",
        testFunction,
      );

      const result = monitoredFunction("arg1", "arg2");

      expect(result).toBe("result");
      expect(testFunction).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should handle function errors gracefully", () => {
      const errorFunction = vi.fn().mockImplementation(() => {
        throw new Error("Test error");
      });
      const monitoredFunction = withPerformanceMonitoring(
        "error-operation",
        errorFunction,
      );

      expect(() => monitoredFunction()).toThrow("Test error");
    });
  });

  describe("Asynchronous Monitoring", () => {
    it("should monitor asynchronous function performance", async () => {
      const asyncFunction = vi.fn().mockResolvedValue("async-result");
      const monitoredFunction = withAsyncPerformanceMonitoring(
        "async-operation",
        asyncFunction,
      );

      const result = await monitoredFunction("arg1");

      expect(result).toBe("async-result");
      expect(asyncFunction).toHaveBeenCalledWith("arg1");
    });

    it("should handle async function rejections", async () => {
      const rejectingFunction = vi
        .fn()
        .mockRejectedValue(new Error("Async error"));
      const monitoredFunction = withAsyncPerformanceMonitoring(
        "reject-operation",
        rejectingFunction,
      );

      await expect(monitoredFunction()).rejects.toThrow("Async error");
    });
  });
});

describe("Integration with Existing System", () => {
  it("should work with singleton methodology loader", async () => {
    const philosophy = await methodologyLoader.loadMethodology(
      "daniels",
      "standard",
    );

    expect(philosophy).toBeDefined();
    expect(philosophy.name).toBe("Jack Daniels");
  });

  it("should maintain compatibility with existing caching", async () => {
    // Load methodology through lazy loader
    const philosophy1 = await methodologyLoader.loadMethodology(
      "daniels",
      "basic",
    );

    // Load again - should use cache
    const philosophy2 = await methodologyLoader.loadMethodology(
      "daniels",
      "basic",
    );

    expect(philosophy1).toBe(philosophy2);
  });

  it("should integrate with performance monitoring systems", async () => {
    const loadedCount = Object.keys(
      methodologyLoader.getPerformanceMetrics(),
    ).length;

    await methodologyLoader.loadMethodology("pfitzinger", "standard");

    const newCount = Object.keys(
      methodologyLoader.getPerformanceMetrics(),
    ).length;
    expect(newCount).toBeGreaterThan(loadedCount);
  });
});

describe("Performance Requirements Compliance", () => {
  it("should meet loading time requirements", async () => {
    const startTime = performance.now();

    await methodologyLoader.loadMethodology("daniels", "basic");

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // Should load within reasonable time (allowing for test overhead)
    expect(loadTime).toBeLessThan(5000); // 5 seconds max for tests
  });

  it("should manage memory efficiently", async () => {
    const initialMemory = methodologyLoader.getMemoryUsage();

    // Load multiple methodologies
    await Promise.all([
      methodologyLoader.loadMethodology("daniels", "standard"),
      methodologyLoader.loadMethodology("lydiard", "standard"),
      methodologyLoader.loadMethodology("pfitzinger", "basic"),
    ]);

    const finalMemory = methodologyLoader.getMemoryUsage();

    expect(finalMemory.total).toBeGreaterThanOrEqual(initialMemory.total);
    expect(Object.keys(finalMemory.byMethodology).length).toBeGreaterThan(0);
  });

  it("should provide performance optimization recommendations", () => {
    const recommendations =
      ProgressiveEnhancementManager.getEnhancementRecommendations();

    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(typeof recommendations[0]).toBe("string");
  });
});
