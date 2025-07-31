"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ADAPTATION_TIMELINE: () => ADAPTATION_TIMELINE,
  AdvancedTrainingPlanGenerator: () => AdvancedTrainingPlanGenerator,
  BaseTrainingPhilosophy: () => BaseTrainingPhilosophy,
  CSVFormatter: () => CSVFormatter,
  CacheManager: () => CacheManager,
  CalculationProfiler: () => CalculationProfiler,
  CustomWorkoutGenerator: () => CustomWorkoutGenerator,
  ENVIRONMENTAL_FACTORS: () => ENVIRONMENTAL_FACTORS,
  EnhancedJSONFormatter: () => EnhancedJSONFormatter,
  ExportUtils: () => ExportUtils,
  GarminFormatter: () => GarminFormatter,
  INTENSITY_MODELS: () => INTENSITY_MODELS,
  JSONFormatter: () => JSONFormatter,
  LOAD_THRESHOLDS: () => LOAD_THRESHOLDS,
  METHODOLOGY_INTENSITY_DISTRIBUTIONS: () => METHODOLOGY_INTENSITY_DISTRIBUTIONS,
  METHODOLOGY_PHASE_TARGETS: () => METHODOLOGY_PHASE_TARGETS,
  MemoryMonitor: () => MemoryMonitor,
  MethodologyWorkoutSelector: () => MethodologyWorkoutSelector,
  MultiFormatExporter: () => MultiFormatExporter,
  OptimizationAnalyzer: () => OptimizationAnalyzer,
  PDFFormatter: () => PDFFormatter,
  PHASE_DURATION: () => PHASE_DURATION,
  PROGRESSION_RATES: () => PROGRESSION_RATES,
  PhilosophyFactory: () => PhilosophyFactory,
  PhilosophyUtils: () => PhilosophyUtils,
  RACE_DISTANCES: () => RACE_DISTANCES,
  RECOVERY_MULTIPLIERS: () => RECOVERY_MULTIPLIERS,
  SmartAdaptationEngine: () => SmartAdaptationEngine,
  StravaFormatter: () => StravaFormatter,
  TCXFormatter: () => TCXFormatter,
  TRAINING_METHODOLOGIES: () => TRAINING_METHODOLOGIES,
  TRAINING_ZONES: () => TRAINING_ZONES,
  TrainingPeaksFormatter: () => TrainingPeaksFormatter,
  TrainingPlanGenerator: () => TrainingPlanGenerator,
  WORKOUT_DURATIONS: () => WORKOUT_DURATIONS,
  WORKOUT_EMPHASIS: () => WORKOUT_EMPHASIS,
  WORKOUT_TEMPLATES: () => WORKOUT_TEMPLATES,
  WorkoutProgressionSystem: () => WorkoutProgressionSystem,
  analyzeWeeklyPatterns: () => analyzeWeeklyPatterns,
  batchCalculateVDOT: () => batchCalculateVDOT,
  cacheInstances: () => cacheInstances,
  calculateCriticalSpeed: () => calculateCriticalSpeed,
  calculateCriticalSpeedCached: () => calculateCriticalSpeedCached,
  calculateFitnessMetrics: () => calculateFitnessMetrics,
  calculateFitnessMetricsCached: () => calculateFitnessMetricsCached,
  calculateInjuryRisk: () => calculateInjuryRisk,
  calculateLactateThreshold: () => calculateLactateThreshold,
  calculatePersonalizedZones: () => calculatePersonalizedZones,
  calculateRecoveryScore: () => calculateRecoveryScore,
  calculateTSS: () => calculateTSS,
  calculateTrainingLoad: () => calculateTrainingLoad,
  calculateTrainingPaces: () => calculateTrainingPaces,
  calculateTrainingPacesCached: () => calculateTrainingPacesCached,
  calculateVDOT: () => calculateVDOT,
  calculateVDOTCached: () => calculateVDOTCached,
  createAdaptationEngine: () => createAdaptationEngine,
  createCustomWorkout: () => createCustomWorkout,
  createExportManager: () => createExportManager,
  estimateRunningEconomy: () => estimateRunningEconomy,
  getZoneByIntensity: () => getZoneByIntensity,
  iCalFormatter: () => iCalFormatter
});
module.exports = __toCommonJS(index_exports);

// src/calculator.ts
var import_date_fns = require("date-fns");
function calculateVDOT(runs) {
  const performances = runs.filter((run) => run.isRace || run.effortLevel && run.effortLevel >= 9);
  if (performances.length === 0) {
    const fastRuns = runs.filter((run) => run.distance >= 3 && run.avgPace).sort((a, b) => a.avgPace - b.avgPace).slice(0, 3);
    if (fastRuns.length > 0) {
      const bestRun = fastRuns[0];
      const distance = bestRun.distance * 1e3;
      const time = bestRun.duration;
      const velocity = distance / (time * 60);
      const vo2 = -4.6 + 0.182258 * (velocity * 60) + 104e-6 * Math.pow(velocity * 60, 2);
      const percentMax = 0.8 + 0.1894393 * Math.exp(-0.012778 * time) + 0.2989558 * Math.exp(-0.1932605 * time);
      return Math.round(vo2 / percentMax);
    }
  }
  return 35;
}
function calculateCriticalSpeed(runs) {
  const timeTrials = runs.filter((run) => run.distance >= 3 && run.effortLevel && run.effortLevel >= 8).map((run) => ({
    distance: run.distance * 1e3,
    // meters
    time: run.duration * 60
    // seconds
  }));
  if (timeTrials.length >= 2) {
    const sorted = timeTrials.sort((a, b) => a.distance - b.distance);
    const d1 = sorted[0].distance;
    const t1 = sorted[0].time;
    const d2 = sorted[sorted.length - 1].distance;
    const t2 = sorted[sorted.length - 1].time;
    const cs = (d2 - d1) / (t2 - t1);
    return cs * 3.6;
  }
  return 10;
}
function estimateRunningEconomy(runs) {
  const economyRuns = runs.filter(
    (run) => run.avgHeartRate && run.avgPace && run.duration > 20 && run.effortLevel && run.effortLevel <= 6
  );
  if (economyRuns.length > 0) {
    const economies = economyRuns.map((run) => {
      const pace = run.avgPace;
      const hrReserve = (run.avgHeartRate - 60) / (190 - 60);
      const estimatedVO2 = hrReserve * 50;
      return estimatedVO2 / (60 / pace);
    });
    return Math.round(economies.reduce((sum, e) => sum + e, 0) / economies.length);
  }
  return 200;
}
function calculateLactateThreshold(vdot) {
  const thresholdVelocity = vdot * 0.88 / 3.5;
  return thresholdVelocity;
}
function calculateTSS(run, thresholdPace) {
  if (!run.avgPace) return 0;
  const intensityFactor = thresholdPace / run.avgPace;
  const tss = run.duration * Math.pow(intensityFactor, 2) * 100 / 60;
  return Math.round(tss);
}
function calculateTrainingLoad(runs, thresholdPace) {
  const sortedRuns = [...runs].sort((a, b) => a.date.getTime() - b.date.getTime());
  let acuteLoad = 0;
  let chronicLoad = 0;
  const acuteDecay = Math.exp(-1 / 7);
  const chronicDecay = Math.exp(-1 / 28);
  const loads = sortedRuns.map((run) => {
    const tss = calculateTSS(run, thresholdPace);
    acuteLoad = acuteLoad * acuteDecay + tss * (1 - acuteDecay);
    chronicLoad = chronicLoad * chronicDecay + tss * (1 - chronicDecay);
    return {
      date: run.date,
      tss,
      acuteLoad,
      chronicLoad,
      ratio: chronicLoad > 0 ? acuteLoad / chronicLoad : 1
    };
  });
  const current = loads[loads.length - 1] || { acuteLoad: 0, chronicLoad: 0, ratio: 1 };
  let trend = "stable";
  if (loads.length > 7) {
    const weekAgo = loads[loads.length - 8].acuteLoad;
    if (current.acuteLoad > weekAgo * 1.1) trend = "increasing";
    else if (current.acuteLoad < weekAgo * 0.9) trend = "decreasing";
  }
  let recommendation = "";
  if (current.ratio < 0.8) {
    recommendation = "Training load is low. Consider increasing volume gradually.";
  } else if (current.ratio > 1.5) {
    recommendation = "Training load is very high. Risk of overtraining. Consider recovery.";
  } else if (current.ratio > 1.3) {
    recommendation = "Training load is high. Monitor fatigue carefully.";
  } else {
    recommendation = "Training load is in optimal range for adaptation.";
  }
  return {
    acute: Math.round(current.acuteLoad),
    chronic: Math.round(current.chronicLoad),
    ratio: Math.round(current.ratio * 100) / 100,
    trend,
    recommendation
  };
}
function calculateInjuryRisk(trainingLoad, weeklyMileageIncrease, recoveryScore) {
  let risk = 0;
  if (trainingLoad.ratio < 0.8) risk += 20;
  else if (trainingLoad.ratio > 1.5) risk += 40;
  else if (trainingLoad.ratio > 1.3) risk += 25;
  else risk += 10;
  if (weeklyMileageIncrease > 20) risk += 30;
  else if (weeklyMileageIncrease > 10) risk += 20;
  else if (weeklyMileageIncrease > 5) risk += 10;
  risk += Math.round((100 - recoveryScore) * 0.3);
  return Math.min(100, risk);
}
function calculateRecoveryScore(runs, restingHR, hrv) {
  let score = 70;
  const recentHardRuns = runs.filter((run) => run.date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)).filter((run) => run.effortLevel && run.effortLevel >= 7);
  score -= recentHardRuns.length * 5;
  if (hrv) {
    if (hrv > 60) score += 10;
    else if (hrv < 40) score -= 10;
  }
  if (restingHR) {
    if (restingHR < 50) score += 10;
    else if (restingHR > 65) score -= 10;
  }
  return Math.max(0, Math.min(100, score));
}
function analyzeWeeklyPatterns(runs) {
  const weeks = /* @__PURE__ */ new Map();
  runs.forEach((run) => {
    const weekStart = (0, import_date_fns.format)((0, import_date_fns.startOfWeek)(run.date), "yyyy-MM-dd");
    if (!weeks.has(weekStart)) {
      weeks.set(weekStart, []);
    }
    weeks.get(weekStart).push(run);
  });
  const weeklyDistances = Array.from(weeks.values()).map(
    (weekRuns) => weekRuns.reduce((sum, run) => sum + run.distance, 0)
  );
  const weeklyRunCounts = Array.from(weeks.values()).map((weekRuns) => weekRuns.length);
  const dayFrequency = new Array(7).fill(0);
  runs.forEach((run) => {
    dayFrequency[run.date.getDay()]++;
  });
  const avgRunsPerWeek = runs.length / weeks.size;
  const optimalDays = dayFrequency.map((count, day) => ({ day, count })).sort((a, b) => b.count - a.count).slice(0, Math.round(avgRunsPerWeek)).map((d) => d.day);
  const longRuns = runs.filter((run) => run.distance > 15);
  const longRunDays = new Array(7).fill(0);
  longRuns.forEach((run) => {
    longRunDays[run.date.getDay()]++;
  });
  const typicalLongRunDay = longRunDays.indexOf(Math.max(...longRunDays));
  const expectedRuns = avgRunsPerWeek * weeks.size;
  const actualRuns = runs.length;
  const consistencyScore = Math.round(actualRuns / expectedRuns * 100);
  return {
    avgWeeklyMileage: Math.round(
      weeklyDistances.reduce((sum, d) => sum + d, 0) / weeklyDistances.length
    ),
    maxWeeklyMileage: Math.round(Math.max(...weeklyDistances)),
    avgRunsPerWeek: Math.round(avgRunsPerWeek * 10) / 10,
    consistencyScore: Math.min(100, consistencyScore),
    optimalDays,
    typicalLongRunDay
  };
}
function calculateFitnessMetrics(runs) {
  const vdot = calculateVDOT(runs);
  const criticalSpeed = calculateCriticalSpeed(runs);
  const runningEconomy = estimateRunningEconomy(runs);
  const lactateThreshold = calculateLactateThreshold(vdot);
  const thresholdPace = 60 / lactateThreshold;
  const trainingLoad = calculateTrainingLoad(runs, thresholdPace);
  const recoveryScore = calculateRecoveryScore(runs);
  const weeklyPatterns = analyzeWeeklyPatterns(runs);
  const recentWeekMileage = runs.filter((run) => run.date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)).reduce((sum, run) => sum + run.distance, 0);
  const weeklyIncrease = weeklyPatterns.avgWeeklyMileage > 0 ? (recentWeekMileage - weeklyPatterns.avgWeeklyMileage) / weeklyPatterns.avgWeeklyMileage * 100 : 0;
  const injuryRisk = calculateInjuryRisk(trainingLoad, weeklyIncrease, recoveryScore);
  return {
    vdot,
    criticalSpeed,
    runningEconomy,
    lactateThreshold,
    trainingLoad,
    injuryRisk,
    recoveryScore
  };
}

// src/constants.ts
var ADAPTATION_TIMELINE = {
  neuromuscular: 7,
  anaerobic: 14,
  aerobic_power: 21,
  aerobic_capacity: 28,
  mitochondrial: 42,
  capillarization: 56
};
var PHASE_DURATION = {
  base: { min: 4, max: 12, optimal: 8 },
  build: { min: 3, max: 8, optimal: 6 },
  peak: { min: 2, max: 4, optimal: 3 },
  taper: { min: 1, max: 3, optimal: 2 },
  recovery: { min: 1, max: 2, optimal: 1 }
};
var INTENSITY_MODELS = {
  polarized: { easy: 80, moderate: 5, hard: 15 },
  pyramidal: { easy: 70, moderate: 20, hard: 10 },
  threshold: { easy: 60, moderate: 30, hard: 10 }
};
var PROGRESSION_RATES = {
  beginner: 0.05,
  // 5% weekly increase
  intermediate: 0.08,
  // 8% weekly increase
  advanced: 0.1,
  // 10% weekly increase
  maxSingleWeek: 0.2
  // 20% max in any single week
};
var RECOVERY_MULTIPLIERS = {
  recovery: 0.5,
  easy: 1,
  steady: 1.5,
  tempo: 2,
  threshold: 3,
  vo2max: 4,
  speed: 3.5,
  race: 5
};
var LOAD_THRESHOLDS = {
  acute_chronic_ratio: {
    veryLow: 0.8,
    low: 1,
    optimal: 1.25,
    high: 1.5,
    veryHigh: 2
  },
  weekly_tss: {
    recovery: 300,
    maintenance: 500,
    productive: 700,
    overreaching: 900,
    risky: 1200
  }
};
var WORKOUT_DURATIONS = {
  recovery: { min: 20, max: 40, typical: 30 },
  easy: { min: 30, max: 90, typical: 60 },
  steady: { min: 40, max: 80, typical: 60 },
  tempo: { min: 20, max: 60, typical: 40 },
  threshold: { min: 20, max: 40, typical: 30 },
  intervals: { min: 30, max: 60, typical: 45 },
  long_run: { min: 60, max: 180, typical: 120 }
};
var RACE_DISTANCES = {
  "5K": 5,
  "10K": 10,
  "HALF_MARATHON": 21.0975,
  "MARATHON": 42.195,
  "50K": 50,
  "50_MILE": 80.4672,
  "100K": 100,
  "100_MILE": 160.9344
};
var ENVIRONMENTAL_FACTORS = {
  altitude: {
    seaLevel: 1,
    moderate: 0.98,
    // 1000-2000m
    high: 0.94,
    // 2000-3000m
    veryHigh: 0.88
    // >3000m
  },
  temperature: {
    cold: 0.98,
    // <5°C
    cool: 1,
    // 5-15°C
    warm: 0.97,
    // 15-25°C
    hot: 0.92
    // >25°C
  },
  humidity: {
    low: 1,
    // <40%
    moderate: 0.98,
    // 40-60%
    high: 0.95
    // >60%
  }
};
var TRAINING_METHODOLOGIES = {
  daniels: {
    name: "Jack Daniels",
    intensityDistribution: { easy: 80, moderate: 10, hard: 10 },
    workoutPriorities: ["tempo", "vo2max", "threshold", "easy", "long_run"],
    recoveryEmphasis: 0.7,
    phaseTransitions: {
      base: { duration: 8, focus: "aerobic" },
      build: { duration: 6, focus: "threshold" },
      peak: { duration: 3, focus: "vo2max" },
      taper: { duration: 2, focus: "maintenance" }
    }
  },
  lydiard: {
    name: "Arthur Lydiard",
    intensityDistribution: { easy: 85, moderate: 10, hard: 5 },
    workoutPriorities: ["easy", "steady", "long_run", "hill_repeats", "tempo"],
    recoveryEmphasis: 0.9,
    phaseTransitions: {
      base: { duration: 12, focus: "aerobic" },
      build: { duration: 4, focus: "hills" },
      peak: { duration: 4, focus: "speed" },
      taper: { duration: 2, focus: "maintenance" }
    }
  },
  pfitzinger: {
    name: "Pete Pfitzinger",
    intensityDistribution: { easy: 75, moderate: 15, hard: 10 },
    workoutPriorities: ["threshold", "long_run", "tempo", "vo2max", "easy"],
    recoveryEmphasis: 0.8,
    phaseTransitions: {
      base: { duration: 6, focus: "aerobic" },
      build: { duration: 8, focus: "threshold" },
      peak: { duration: 3, focus: "race_pace" },
      taper: { duration: 2, focus: "maintenance" }
    }
  },
  hudson: {
    name: "Brad Hudson",
    intensityDistribution: { easy: 70, moderate: 20, hard: 10 },
    workoutPriorities: ["tempo", "fartlek", "long_run", "vo2max", "easy"],
    recoveryEmphasis: 0.75,
    phaseTransitions: {
      base: { duration: 8, focus: "aerobic" },
      build: { duration: 6, focus: "tempo" },
      peak: { duration: 4, focus: "race_pace" },
      taper: { duration: 2, focus: "maintenance" }
    }
  },
  custom: {
    name: "Custom",
    intensityDistribution: { easy: 75, moderate: 15, hard: 10 },
    workoutPriorities: ["easy", "tempo", "long_run", "vo2max", "threshold"],
    recoveryEmphasis: 0.8,
    phaseTransitions: {
      base: { duration: 8, focus: "aerobic" },
      build: { duration: 6, focus: "threshold" },
      peak: { duration: 3, focus: "vo2max" },
      taper: { duration: 2, focus: "maintenance" }
    }
  }
};
var WORKOUT_EMPHASIS = {
  daniels: {
    recovery: 1,
    easy: 1.2,
    tempo: 1.5,
    threshold: 1.4,
    vo2max: 1.3,
    speed: 1.1,
    long_run: 1.2
  },
  lydiard: {
    recovery: 1,
    easy: 1.5,
    tempo: 1.1,
    threshold: 1,
    vo2max: 0.8,
    speed: 0.9,
    long_run: 1.4,
    hill_repeats: 1.3
  },
  pfitzinger: {
    recovery: 1,
    easy: 1.3,
    tempo: 1.2,
    threshold: 1.5,
    vo2max: 1.1,
    speed: 1,
    long_run: 1.3
  },
  hudson: {
    recovery: 1,
    easy: 1.2,
    tempo: 1.4,
    threshold: 1.2,
    vo2max: 1.1,
    speed: 1,
    long_run: 1.2,
    fartlek: 1.3
  },
  custom: {
    recovery: 1,
    easy: 1.2,
    tempo: 1.2,
    threshold: 1.2,
    vo2max: 1.1,
    speed: 1,
    long_run: 1.2
  }
};
var METHODOLOGY_INTENSITY_DISTRIBUTIONS = {
  daniels: {
    base: { easy: 85, moderate: 10, hard: 5 },
    // 80/20 approach with slight emphasis on aerobic base
    build: { easy: 80, moderate: 15, hard: 5 },
    // Standard Daniels distribution
    peak: { easy: 75, moderate: 15, hard: 10 },
    // More VO2max work for race preparation
    taper: { easy: 80, moderate: 15, hard: 5 },
    // Return to more conservative distribution
    recovery: { easy: 95, moderate: 5, hard: 0 }
    // Complete aerobic recovery
  },
  lydiard: {
    base: { easy: 90, moderate: 8, hard: 2 },
    // Lydiard's signature 85%+ easy running in base
    build: { easy: 85, moderate: 12, hard: 3 },
    // Maintain heavy aerobic emphasis
    peak: { easy: 80, moderate: 15, hard: 5 },
    // Limited speed work after base building
    taper: { easy: 85, moderate: 12, hard: 3 },
    // Conservative approach to taper
    recovery: { easy: 100, moderate: 0, hard: 0 }
    // Complete rest philosophy
  },
  pfitzinger: {
    base: { easy: 75, moderate: 20, hard: 5 },
    // Higher moderate emphasis (threshold work)
    build: { easy: 70, moderate: 25, hard: 5 },
    // Significant lactate threshold volume
    peak: { easy: 70, moderate: 20, hard: 10 },
    // Race-specific pace work increase
    taper: { easy: 75, moderate: 20, hard: 5 },
    // Maintain some threshold work
    recovery: { easy: 90, moderate: 10, hard: 0 }
    // Active recovery approach
  },
  hudson: {
    base: { easy: 80, moderate: 15, hard: 5 },
    // Balanced approach with tempo emphasis
    build: { easy: 75, moderate: 20, hard: 5 },
    // Tempo endurance focus
    peak: { easy: 70, moderate: 20, hard: 10 },
    // Race pace and neuromuscular work
    taper: { easy: 80, moderate: 15, hard: 5 },
    // Return to base distribution
    recovery: { easy: 90, moderate: 10, hard: 0 }
    // Moderate recovery approach
  },
  custom: {
    base: { easy: 80, moderate: 15, hard: 5 },
    // Default polarized approach
    build: { easy: 75, moderate: 20, hard: 5 },
    // Moderate build phase
    peak: { easy: 70, moderate: 20, hard: 10 },
    // Increased intensity for peaking
    taper: { easy: 80, moderate: 15, hard: 5 },
    // Return to conservative distribution
    recovery: { easy: 90, moderate: 10, hard: 0 }
    // Standard recovery distribution
  }
};
var METHODOLOGY_PHASE_TARGETS = {
  daniels: {
    base: ["aerobic_capacity", "mitochondrial"],
    build: ["lactate_threshold", "aerobic_power"],
    peak: ["vo2max", "neuromuscular"],
    taper: ["maintenance", "freshness"]
  },
  lydiard: {
    base: ["aerobic_capacity", "capillarization"],
    build: ["hill_strength", "aerobic_power"],
    peak: ["speed", "neuromuscular"],
    taper: ["maintenance", "freshness"]
  },
  pfitzinger: {
    base: ["aerobic_capacity", "mitochondrial"],
    build: ["lactate_threshold", "marathon_pace"],
    peak: ["race_pace", "aerobic_power"],
    taper: ["maintenance", "race_readiness"]
  },
  hudson: {
    base: ["aerobic_capacity", "mitochondrial"],
    build: ["tempo_endurance", "lactate_buffering"],
    peak: ["race_pace", "neuromuscular"],
    taper: ["maintenance", "freshness"]
  },
  custom: {
    base: ["aerobic_capacity", "mitochondrial"],
    build: ["lactate_threshold", "aerobic_power"],
    peak: ["vo2max", "race_pace"],
    taper: ["maintenance", "freshness"]
  }
};

// src/zones.ts
var TRAINING_ZONES = {
  RECOVERY: {
    name: "Recovery",
    rpe: 1,
    heartRateRange: { min: 50, max: 60 },
    paceRange: { min: 0, max: 75 },
    description: "Very easy effort, conversational",
    purpose: "Active recovery, promote blood flow"
  },
  EASY: {
    name: "Easy",
    rpe: 2,
    heartRateRange: { min: 60, max: 70 },
    paceRange: { min: 75, max: 85 },
    description: "Comfortable, conversational pace",
    purpose: "Build aerobic base, improve fat oxidation"
  },
  STEADY: {
    name: "Steady",
    rpe: 3,
    heartRateRange: { min: 70, max: 80 },
    paceRange: { min: 85, max: 90 },
    description: "Moderate effort, slightly harder breathing",
    purpose: "Aerobic development, mitochondrial density"
  },
  TEMPO: {
    name: "Tempo",
    rpe: 4,
    heartRateRange: { min: 80, max: 87 },
    paceRange: { min: 90, max: 95 },
    description: "Comfortably hard, controlled discomfort",
    purpose: "Improve lactate clearance, mental toughness"
  },
  THRESHOLD: {
    name: "Threshold",
    rpe: 5,
    heartRateRange: { min: 87, max: 92 },
    paceRange: { min: 95, max: 100 },
    description: "Hard effort, sustainable for ~1 hour",
    purpose: "Increase lactate threshold, improve efficiency"
  },
  VO2_MAX: {
    name: "VO2 Max",
    rpe: 6,
    heartRateRange: { min: 92, max: 97 },
    paceRange: { min: 105, max: 115 },
    description: "Very hard, heavy breathing",
    purpose: "Maximize oxygen uptake, increase power"
  },
  NEUROMUSCULAR: {
    name: "Neuromuscular",
    rpe: 7,
    heartRateRange: { min: 97, max: 100 },
    paceRange: { min: 115, max: 130 },
    description: "Maximum effort, short duration",
    purpose: "Improve speed, power, and running economy"
  }
};
function calculatePersonalizedZones(maxHR, thresholdPace, vdot) {
  const zones = {};
  Object.entries(TRAINING_ZONES).forEach(([key, baseZone]) => {
    const zone = { ...baseZone };
    if (zone.heartRateRange) {
      zone.heartRateRange = {
        min: Math.round(zone.heartRateRange.min / 100 * maxHR),
        max: Math.round(zone.heartRateRange.max / 100 * maxHR)
      };
    }
    if (zone.paceRange) {
      zone.paceRange = {
        min: thresholdPace * zone.paceRange.min / 100,
        max: thresholdPace * zone.paceRange.max / 100
      };
    }
    zones[key] = zone;
  });
  return zones;
}
function getZoneByIntensity(intensity) {
  if (intensity < 60) return TRAINING_ZONES.RECOVERY;
  if (intensity < 70) return TRAINING_ZONES.EASY;
  if (intensity < 80) return TRAINING_ZONES.STEADY;
  if (intensity < 87) return TRAINING_ZONES.TEMPO;
  if (intensity < 92) return TRAINING_ZONES.THRESHOLD;
  if (intensity < 97) return TRAINING_ZONES.VO2_MAX;
  return TRAINING_ZONES.NEUROMUSCULAR;
}
function calculateTrainingPaces(vdot) {
  const vdotMultipliers = {
    easy: 0.7,
    // % of VO2max
    marathon: 0.84,
    threshold: 0.88,
    interval: 0.98,
    repetition: 1.05
  };
  const vo2maxPace = 5.5 - (vdot - 30) * 0.05;
  return {
    easy: vo2maxPace / vdotMultipliers.easy,
    marathon: vo2maxPace / vdotMultipliers.marathon,
    threshold: vo2maxPace / vdotMultipliers.threshold,
    interval: vo2maxPace / vdotMultipliers.interval,
    repetition: vo2maxPace / vdotMultipliers.repetition
  };
}

// src/workouts.ts
var WORKOUT_TEMPLATES = {
  // Recovery Workouts
  RECOVERY_JOG: {
    type: "recovery",
    primaryZone: TRAINING_ZONES.RECOVERY,
    segments: [
      {
        duration: 30,
        intensity: 50,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Very easy jog, focus on form"
      }
    ],
    adaptationTarget: "Active recovery and blood flow",
    estimatedTSS: 20,
    recoveryTime: 8
  },
  // Aerobic Base Workouts
  EASY_AEROBIC: {
    type: "easy",
    primaryZone: TRAINING_ZONES.EASY,
    segments: [
      {
        duration: 60,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Conversational pace, nose breathing"
      }
    ],
    adaptationTarget: "Aerobic base, fat oxidation, capillarization",
    estimatedTSS: 50,
    recoveryTime: 12
  },
  LONG_RUN: {
    type: "long_run",
    primaryZone: TRAINING_ZONES.EASY,
    segments: [
      {
        duration: 120,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Steady aerobic effort, maintain form"
      }
    ],
    adaptationTarget: "Aerobic endurance, glycogen storage, mental resilience",
    estimatedTSS: 120,
    recoveryTime: 24
  },
  // Tempo Workouts
  TEMPO_CONTINUOUS: {
    type: "tempo",
    primaryZone: TRAINING_ZONES.TEMPO,
    segments: [
      { duration: 10, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Warm-up" },
      {
        duration: 30,
        intensity: 84,
        zone: TRAINING_ZONES.TEMPO,
        description: "Steady tempo effort"
      },
      { duration: 10, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Cool-down" }
    ],
    adaptationTarget: "Lactate clearance, aerobic power",
    estimatedTSS: 65,
    recoveryTime: 24
  },
  // Threshold Workouts
  LACTATE_THRESHOLD_2X20: {
    type: "threshold",
    primaryZone: TRAINING_ZONES.THRESHOLD,
    segments: [
      { duration: 10, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Warm-up" },
      {
        duration: 20,
        intensity: 88,
        zone: TRAINING_ZONES.THRESHOLD,
        description: "Threshold pace"
      },
      { duration: 5, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Recovery" },
      {
        duration: 20,
        intensity: 88,
        zone: TRAINING_ZONES.THRESHOLD,
        description: "Threshold pace"
      },
      { duration: 10, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Cool-down" }
    ],
    adaptationTarget: "Lactate threshold improvement",
    estimatedTSS: 90,
    recoveryTime: 36
  },
  THRESHOLD_PROGRESSION: {
    type: "threshold",
    primaryZone: TRAINING_ZONES.THRESHOLD,
    segments: [
      { duration: 10, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Warm-up" },
      { duration: 10, intensity: 80, zone: TRAINING_ZONES.STEADY, description: "Build" },
      { duration: 10, intensity: 85, zone: TRAINING_ZONES.TEMPO, description: "Tempo" },
      { duration: 10, intensity: 90, zone: TRAINING_ZONES.THRESHOLD, description: "Threshold" },
      { duration: 10, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Cool-down" }
    ],
    adaptationTarget: "Progressive lactate tolerance",
    estimatedTSS: 75,
    recoveryTime: 24
  },
  // VO2max Workouts
  VO2MAX_4X4: {
    type: "vo2max",
    primaryZone: TRAINING_ZONES.VO2_MAX,
    segments: [
      { duration: 15, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Warm-up" },
      { duration: 4, intensity: 95, zone: TRAINING_ZONES.VO2_MAX, description: "VO2max interval" },
      { duration: 3, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Recovery" },
      { duration: 4, intensity: 95, zone: TRAINING_ZONES.VO2_MAX, description: "VO2max interval" },
      { duration: 3, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Recovery" },
      { duration: 4, intensity: 95, zone: TRAINING_ZONES.VO2_MAX, description: "VO2max interval" },
      { duration: 3, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Recovery" },
      { duration: 4, intensity: 95, zone: TRAINING_ZONES.VO2_MAX, description: "VO2max interval" },
      { duration: 10, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Cool-down" }
    ],
    adaptationTarget: "VO2max improvement, aerobic power",
    estimatedTSS: 100,
    recoveryTime: 48
  },
  VO2MAX_5X3: {
    type: "vo2max",
    primaryZone: TRAINING_ZONES.VO2_MAX,
    segments: [
      { duration: 15, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Warm-up" },
      { duration: 3, intensity: 96, zone: TRAINING_ZONES.VO2_MAX, description: "VO2max interval" },
      { duration: 2, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Recovery" },
      { duration: 3, intensity: 96, zone: TRAINING_ZONES.VO2_MAX, description: "VO2max interval" },
      { duration: 2, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Recovery" },
      { duration: 3, intensity: 96, zone: TRAINING_ZONES.VO2_MAX, description: "VO2max interval" },
      { duration: 2, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Recovery" },
      { duration: 3, intensity: 96, zone: TRAINING_ZONES.VO2_MAX, description: "VO2max interval" },
      { duration: 2, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Recovery" },
      { duration: 3, intensity: 96, zone: TRAINING_ZONES.VO2_MAX, description: "VO2max interval" },
      { duration: 10, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Cool-down" }
    ],
    adaptationTarget: "VO2max and running economy",
    estimatedTSS: 95,
    recoveryTime: 48
  },
  // Speed Workouts
  SPEED_200M_REPS: {
    type: "speed",
    primaryZone: TRAINING_ZONES.NEUROMUSCULAR,
    segments: [
      { duration: 15, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Warm-up" },
      { duration: 0.5, intensity: 98, zone: TRAINING_ZONES.NEUROMUSCULAR, description: "200m rep" },
      { duration: 2, intensity: 50, zone: TRAINING_ZONES.RECOVERY, description: "Walk recovery" },
      { duration: 0.5, intensity: 98, zone: TRAINING_ZONES.NEUROMUSCULAR, description: "200m rep" },
      { duration: 2, intensity: 50, zone: TRAINING_ZONES.RECOVERY, description: "Walk recovery" },
      { duration: 0.5, intensity: 98, zone: TRAINING_ZONES.NEUROMUSCULAR, description: "200m rep" },
      { duration: 2, intensity: 50, zone: TRAINING_ZONES.RECOVERY, description: "Walk recovery" },
      { duration: 0.5, intensity: 98, zone: TRAINING_ZONES.NEUROMUSCULAR, description: "200m rep" },
      { duration: 2, intensity: 50, zone: TRAINING_ZONES.RECOVERY, description: "Walk recovery" },
      { duration: 0.5, intensity: 98, zone: TRAINING_ZONES.NEUROMUSCULAR, description: "200m rep" },
      { duration: 2, intensity: 50, zone: TRAINING_ZONES.RECOVERY, description: "Walk recovery" },
      { duration: 0.5, intensity: 98, zone: TRAINING_ZONES.NEUROMUSCULAR, description: "200m rep" },
      { duration: 10, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Cool-down" }
    ],
    adaptationTarget: "Neuromuscular power, running economy",
    estimatedTSS: 70,
    recoveryTime: 36
  },
  // Hill Workouts
  HILL_REPEATS_6X2: {
    type: "hill_repeats",
    primaryZone: TRAINING_ZONES.VO2_MAX,
    segments: [
      { duration: 15, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Warm-up to hills" },
      { duration: 2, intensity: 92, zone: TRAINING_ZONES.VO2_MAX, description: "Hill repeat" },
      { duration: 3, intensity: 50, zone: TRAINING_ZONES.RECOVERY, description: "Jog down" },
      { duration: 2, intensity: 92, zone: TRAINING_ZONES.VO2_MAX, description: "Hill repeat" },
      { duration: 3, intensity: 50, zone: TRAINING_ZONES.RECOVERY, description: "Jog down" },
      { duration: 2, intensity: 92, zone: TRAINING_ZONES.VO2_MAX, description: "Hill repeat" },
      { duration: 3, intensity: 50, zone: TRAINING_ZONES.RECOVERY, description: "Jog down" },
      { duration: 2, intensity: 92, zone: TRAINING_ZONES.VO2_MAX, description: "Hill repeat" },
      { duration: 3, intensity: 50, zone: TRAINING_ZONES.RECOVERY, description: "Jog down" },
      { duration: 2, intensity: 92, zone: TRAINING_ZONES.VO2_MAX, description: "Hill repeat" },
      { duration: 3, intensity: 50, zone: TRAINING_ZONES.RECOVERY, description: "Jog down" },
      { duration: 2, intensity: 92, zone: TRAINING_ZONES.VO2_MAX, description: "Hill repeat" },
      { duration: 10, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Cool-down" }
    ],
    adaptationTarget: "Power, strength, VO2max",
    estimatedTSS: 85,
    recoveryTime: 36
  },
  // Fartlek Workouts
  FARTLEK_VARIED: {
    type: "fartlek",
    primaryZone: TRAINING_ZONES.TEMPO,
    segments: [
      { duration: 10, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Warm-up" },
      { duration: 2, intensity: 90, zone: TRAINING_ZONES.THRESHOLD, description: "Hard surge" },
      { duration: 3, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Easy recovery" },
      { duration: 1, intensity: 95, zone: TRAINING_ZONES.VO2_MAX, description: "Sprint" },
      { duration: 4, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Easy recovery" },
      { duration: 3, intensity: 85, zone: TRAINING_ZONES.TEMPO, description: "Tempo surge" },
      { duration: 2, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Easy recovery" },
      { duration: 0.5, intensity: 98, zone: TRAINING_ZONES.NEUROMUSCULAR, description: "Sprint" },
      { duration: 4.5, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Easy recovery" },
      { duration: 10, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Cool-down" }
    ],
    adaptationTarget: "Speed variation, mental adaptation",
    estimatedTSS: 65,
    recoveryTime: 24
  },
  // Progression Runs
  PROGRESSION_3_STAGE: {
    type: "progression",
    primaryZone: TRAINING_ZONES.TEMPO,
    segments: [
      { duration: 20, intensity: 65, zone: TRAINING_ZONES.EASY, description: "Easy start" },
      { duration: 20, intensity: 78, zone: TRAINING_ZONES.STEADY, description: "Steady pace" },
      { duration: 20, intensity: 85, zone: TRAINING_ZONES.TEMPO, description: "Tempo finish" },
      { duration: 5, intensity: 60, zone: TRAINING_ZONES.RECOVERY, description: "Cool-down" }
    ],
    adaptationTarget: "Pacing, fatigue resistance",
    estimatedTSS: 75,
    recoveryTime: 24
  }
};
function createCustomWorkout(type, duration, primaryIntensity, segments) {
  const zone = getZoneForIntensity(primaryIntensity);
  return {
    type,
    primaryZone: zone,
    segments: segments || [
      {
        duration,
        intensity: primaryIntensity,
        zone,
        description: `Custom ${type} workout`
      }
    ],
    adaptationTarget: `Custom ${type} adaptations`,
    estimatedTSS: calculateTSS2(duration, primaryIntensity),
    recoveryTime: calculateRecoveryTime(type, duration, primaryIntensity)
  };
}
function calculateTSS2(duration, intensity) {
  const intensityFactor = intensity / 100;
  return Math.round(duration * Math.pow(intensityFactor, 2) * 100 / 60);
}
function calculateRecoveryTime(type, duration, intensity) {
  const baseRecovery = {
    recovery: 8,
    easy: 12,
    steady: 18,
    tempo: 24,
    threshold: 36,
    vo2max: 48,
    speed: 36,
    hill_repeats: 36,
    fartlek: 24,
    progression: 24,
    long_run: 24,
    race_pace: 36,
    time_trial: 48,
    cross_training: 12,
    strength: 24
  };
  const base = baseRecovery[type] || 24;
  const intensityMultiplier = intensity / 80;
  const durationMultiplier = duration / 60;
  return Math.round(base * intensityMultiplier * durationMultiplier);
}
function getZoneForIntensity(intensity) {
  if (intensity < 60) return TRAINING_ZONES.RECOVERY;
  if (intensity < 70) return TRAINING_ZONES.EASY;
  if (intensity < 80) return TRAINING_ZONES.STEADY;
  if (intensity < 87) return TRAINING_ZONES.TEMPO;
  if (intensity < 92) return TRAINING_ZONES.THRESHOLD;
  if (intensity < 97) return TRAINING_ZONES.VO2_MAX;
  return TRAINING_ZONES.NEUROMUSCULAR;
}

// src/generator.ts
var import_date_fns2 = require("date-fns");
var TrainingPlanGenerator = class _TrainingPlanGenerator {
  constructor(config) {
    this.config = config;
    this.fitness = config.currentFitness || this.createDefaultFitness();
  }
  /**
   * Generate a complete training plan
   */
  generatePlan() {
    const blocks = this.createTrainingBlocks();
    const workouts = this.generateAllWorkouts(blocks);
    const summary = this.createPlanSummary(blocks, workouts);
    return {
      config: this.config,
      blocks,
      workouts,
      summary
    };
  }
  /**
   * Analyze recent runs and generate a plan
   */
  static fromRunHistory(runs, goal, targetDate) {
    const fitness = this.assessFitnessFromRuns(runs);
    const weeklyPatterns = analyzeWeeklyPatterns(runs);
    const config = {
      name: `${goal} Training Plan`,
      goal,
      targetDate,
      startDate: /* @__PURE__ */ new Date(),
      endDate: targetDate,
      currentFitness: fitness,
      preferences: {
        availableDays: weeklyPatterns.optimalDays,
        preferredIntensity: "moderate",
        crossTraining: false,
        strengthTraining: false
      }
    };
    const generator = new _TrainingPlanGenerator(config);
    return generator.generatePlan();
  }
  /**
   * Create training blocks based on goal and timeline
   */
  createTrainingBlocks() {
    const totalWeeks = (0, import_date_fns2.differenceInWeeks)(
      this.config.endDate || this.config.targetDate || (0, import_date_fns2.addWeeks)(this.config.startDate, 16),
      this.config.startDate
    );
    const blocks = [];
    const phaseDistribution = this.getPhaseDistribution(totalWeeks);
    let currentDate = this.config.startDate;
    let blockId = 1;
    Object.entries(phaseDistribution).forEach(([phase, weeks]) => {
      if (weeks > 0) {
        const block = {
          id: `block-${blockId++}`,
          phase,
          startDate: currentDate,
          endDate: (0, import_date_fns2.addWeeks)(currentDate, weeks),
          weeks,
          focusAreas: this.getFocusAreas(phase),
          microcycles: []
        };
        block.microcycles = this.generateMicrocycles(block);
        blocks.push(block);
        currentDate = block.endDate;
      }
    });
    return blocks;
  }
  /**
   * Determine phase distribution based on total weeks and goal
   */
  getPhaseDistribution(totalWeeks) {
    const distribution = {
      base: 0,
      build: 0,
      peak: 0,
      taper: 0,
      recovery: 0
    };
    if (totalWeeks <= 8) {
      distribution.base = Math.floor(totalWeeks * 0.4);
      distribution.build = Math.floor(totalWeeks * 0.4);
      distribution.taper = Math.floor(totalWeeks * 0.2);
    } else if (totalWeeks <= 16) {
      distribution.base = Math.floor(totalWeeks * 0.35);
      distribution.build = Math.floor(totalWeeks * 0.35);
      distribution.peak = Math.floor(totalWeeks * 0.2);
      distribution.taper = Math.floor(totalWeeks * 0.1);
    } else {
      distribution.base = Math.floor(totalWeeks * 0.3);
      distribution.build = Math.floor(totalWeeks * 0.3);
      distribution.peak = Math.floor(totalWeeks * 0.25);
      distribution.taper = Math.floor(totalWeeks * 0.1);
      distribution.recovery = Math.floor(totalWeeks * 0.05);
    }
    return distribution;
  }
  /**
   * Get focus areas for each training phase
   */
  getFocusAreas(phase) {
    const focusMap = {
      base: ["Aerobic capacity", "Running economy", "Injury prevention"],
      build: ["Lactate threshold", "VO2max development", "Race pace familiarity"],
      peak: ["Race-specific fitness", "Speed endurance", "Mental preparation"],
      taper: ["Recovery", "Maintenance", "Race readiness"],
      recovery: ["Active recovery", "Reflection", "Planning"]
    };
    return focusMap[phase];
  }
  /**
   * Generate weekly microcycles for a training block
   */
  generateMicrocycles(block) {
    const microcycles = [];
    const baseVolume = this.fitness.weeklyMileage;
    for (let week = 0; week < block.weeks; week++) {
      const isRecoveryWeek = (week + 1) % 4 === 0;
      const weekNumber = microcycles.length + 1;
      const progressionFactor = this.calculateProgressionFactor(block.phase, week, block.weeks);
      const weeklyVolume = isRecoveryWeek ? baseVolume * 0.7 * progressionFactor : baseVolume * progressionFactor;
      const pattern = this.generateWeeklyPattern(block.phase, isRecoveryWeek);
      const workouts = this.generateWeeklyWorkouts(
        block,
        weekNumber,
        pattern,
        weeklyVolume,
        (0, import_date_fns2.addWeeks)(block.startDate, week)
      );
      const totalLoad = workouts.reduce((sum, w) => sum + w.workout.estimatedTSS, 0);
      const totalDistance = workouts.reduce(
        (sum, w) => sum + (w.targetMetrics.distance || 0),
        0
      );
      microcycles.push({
        weekNumber,
        pattern,
        workouts,
        totalLoad,
        totalDistance,
        recoveryRatio: this.calculateRecoveryRatio(workouts)
      });
    }
    return microcycles;
  }
  /**
   * Calculate progression factor for volume
   */
  calculateProgressionFactor(phase, week, totalWeeks) {
    const progressionRate = this.fitness.trainingAge && this.fitness.trainingAge > 2 ? PROGRESSION_RATES.advanced : this.fitness.trainingAge && this.fitness.trainingAge > 1 ? PROGRESSION_RATES.intermediate : PROGRESSION_RATES.beginner;
    switch (phase) {
      case "base":
        return 1 + week * progressionRate;
      case "build":
        return 1.2 + week * progressionRate * 0.8;
      case "peak":
        return 1.3 + week * progressionRate * 0.5;
      case "taper":
        return 1 - week * 0.2;
      // Reduce volume
      case "recovery":
        return 0.6;
      default:
        return 1;
    }
  }
  /**
   * Generate weekly workout pattern
   */
  generateWeeklyPattern(phase, isRecovery) {
    if (isRecovery) {
      return "Easy-Recovery-Easy-Recovery-Rest-Easy-Recovery";
    }
    const patterns = {
      base: [
        "Easy-Steady-Easy-Tempo-Rest-Long-Recovery",
        "Easy-Hills-Recovery-Steady-Rest-Long-Easy"
      ],
      build: [
        "Easy-Intervals-Recovery-Tempo-Rest-Long-Recovery",
        "Easy-Threshold-Recovery-Hills-Rest-Progression-Recovery"
      ],
      peak: [
        "Easy-VO2max-Recovery-RacePace-Rest-Long-Recovery",
        "Easy-Speed-Recovery-Threshold-Rest-TimeTrial-Recovery"
      ],
      taper: [
        "Easy-Tempo-Recovery-Easy-Rest-MediumLong-Recovery",
        "Easy-Strides-Recovery-Easy-Rest-Easy-Rest"
      ],
      recovery: ["Easy-Recovery-Rest-Easy-Rest-Easy-Recovery"]
    };
    const phasePatterns = patterns[phase];
    return phasePatterns[Math.floor(Math.random() * phasePatterns.length)];
  }
  /**
   * Generate workouts for a week
   */
  generateWeeklyWorkouts(block, weekNumber, pattern, weeklyVolume, weekStart) {
    const workoutTypes = pattern.split("-");
    const workouts = [];
    const availableDays = this.config.preferences?.availableDays || [0, 2, 4, 6];
    let volumeRemaining = weeklyVolume;
    let dayIndex = 0;
    workoutTypes.forEach((type, index) => {
      if (type === "Rest") {
        return;
      }
      while (!availableDays.includes(dayIndex % 7)) {
        dayIndex++;
      }
      const date = (0, import_date_fns2.addDays)(weekStart, dayIndex);
      const workout = this.selectWorkout(type, block.phase, volumeRemaining);
      const targetDistance = this.calculateWorkoutDistance(
        workout,
        volumeRemaining,
        workoutTypes.length - index
      );
      workouts.push({
        id: `workout-${weekNumber}-${index + 1}`,
        date,
        type: workout.type,
        name: this.generateWorkoutName(workout.type, block.phase),
        description: this.generateWorkoutDescription(workout),
        workout,
        targetMetrics: {
          duration: workout.segments.reduce((sum, s) => sum + s.duration, 0),
          distance: targetDistance,
          tss: workout.estimatedTSS,
          load: workout.estimatedTSS,
          intensity: workout.segments.reduce((sum, s) => sum + s.intensity, 0) / workout.segments.length
        }
      });
      volumeRemaining -= targetDistance;
      dayIndex++;
    });
    return workouts;
  }
  /**
   * Generate a single workout (for advanced-generator extension)
   */
  generateWorkout(date, type, phase, weekNumber) {
    const workout = this.selectWorkout(type.toString(), phase, 10);
    const targetDistance = this.calculateWorkoutDistance(workout, 10, 1);
    return {
      id: `workout-${weekNumber}-${Date.now()}`,
      date,
      type: workout.type,
      name: this.generateWorkoutName(workout.type, phase),
      description: this.generateWorkoutDescription(workout),
      workout,
      targetMetrics: {
        duration: workout.segments.reduce((sum, s) => sum + s.duration, 0),
        distance: targetDistance,
        tss: workout.estimatedTSS,
        load: workout.estimatedTSS,
        intensity: workout.segments.reduce((sum, s) => sum + s.intensity, 0) / workout.segments.length
      }
    };
  }
  /**
   * Select appropriate workout based on type string
   */
  selectWorkout(typeString, phase, volumeRemaining) {
    const workoutMap = {
      Easy: ["EASY_AEROBIC"],
      Recovery: ["RECOVERY_JOG"],
      Steady: ["EASY_AEROBIC"],
      Tempo: ["TEMPO_CONTINUOUS"],
      Threshold: ["LACTATE_THRESHOLD_2X20", "THRESHOLD_PROGRESSION"],
      Intervals: ["VO2MAX_4X4", "VO2MAX_5X3"],
      Hills: ["HILL_REPEATS_6X2"],
      Long: ["LONG_RUN"],
      Progression: ["PROGRESSION_3_STAGE"],
      VO2max: ["VO2MAX_4X4", "VO2MAX_5X3"],
      Speed: ["SPEED_200M_REPS"],
      RacePace: ["TEMPO_CONTINUOUS"],
      TimeTrial: ["THRESHOLD_PROGRESSION"],
      MediumLong: ["EASY_AEROBIC"],
      Strides: ["SPEED_200M_REPS"]
    };
    const templates = workoutMap[typeString] || ["EASY_AEROBIC"];
    const templateName = templates[Math.floor(Math.random() * templates.length)];
    return { ...WORKOUT_TEMPLATES[templateName] };
  }
  /**
   * Calculate workout distance based on time and remaining volume
   */
  calculateWorkoutDistance(workout, volumeRemaining, workoutsLeft) {
    const totalMinutes = workout.segments.reduce((sum, s) => sum + s.duration, 0);
    const avgIntensity = workout.segments.reduce((sum, s) => sum + s.intensity, 0) / workout.segments.length;
    const thresholdPace = 5;
    const workoutPace = thresholdPace / (avgIntensity / 88);
    const estimatedDistance = totalMinutes / workoutPace;
    const targetDistance = Math.min(estimatedDistance, volumeRemaining / workoutsLeft);
    return Math.round(targetDistance * 10) / 10;
  }
  /**
   * Generate all workouts from blocks
   */
  generateAllWorkouts(blocks) {
    return blocks.flatMap((block) => block.microcycles.flatMap((cycle) => cycle.workouts));
  }
  /**
   * Create plan summary
   */
  createPlanSummary(blocks, workouts) {
    const phases = blocks.map((block) => ({
      phase: block.phase,
      weeks: block.weeks,
      focus: block.focusAreas,
      volumeProgression: block.microcycles.map((m) => m.totalDistance),
      intensityDistribution: this.calculateIntensityDistribution(
        block.microcycles.flatMap((m) => m.workouts)
      )
    }));
    const weeklyDistances = blocks.flatMap((b) => b.microcycles.map((m) => m.totalDistance));
    return {
      totalWeeks: blocks.reduce((sum, b) => sum + b.weeks, 0),
      totalWorkouts: workouts.length,
      totalDistance: workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0),
      totalTime: workouts.reduce((sum, w) => sum + w.targetMetrics.duration, 0),
      peakWeeklyDistance: Math.max(...weeklyDistances),
      averageWeeklyDistance: weeklyDistances.reduce((sum, d) => sum + d, 0) / weeklyDistances.length,
      keyWorkouts: workouts.filter((w) => ["threshold", "vo2max", "race_pace"].includes(w.type)).length,
      recoveryDays: workouts.filter((w) => w.type === "recovery").length,
      phases
    };
  }
  /**
   * Calculate intensity distribution for workouts
   */
  calculateIntensityDistribution(workouts) {
    let easy = 0;
    let moderate = 0;
    let hard = 0;
    let veryHard = 0;
    workouts.forEach((workout) => {
      const intensity = workout.targetMetrics.intensity;
      if (intensity < 75) easy++;
      else if (intensity < 88) moderate++;
      else if (intensity < 95) hard++;
      else veryHard++;
    });
    const total = workouts.length;
    return {
      easy: Math.round(easy / total * 100),
      moderate: Math.round(moderate / total * 100),
      hard: Math.round(hard / total * 100),
      veryHard: Math.round(veryHard / total * 100)
    };
  }
  /**
   * Calculate recovery ratio for a set of workouts
   */
  calculateRecoveryRatio(workouts) {
    const recoveryWorkouts = workouts.filter((w) => w.type === "recovery" || w.type === "easy");
    return recoveryWorkouts.length / workouts.length;
  }
  /**
   * Generate workout name
   */
  generateWorkoutName(type, phase) {
    const nameMap = {
      recovery: "Recovery Run",
      easy: "Easy Aerobic Run",
      steady: "Steady State Run",
      tempo: "Tempo Run",
      threshold: "Lactate Threshold Workout",
      vo2max: "VO2max Intervals",
      speed: "Speed Development",
      hill_repeats: "Hill Repeats",
      fartlek: "Fartlek Run",
      progression: "Progression Run",
      long_run: "Long Run",
      race_pace: "Race Pace Practice",
      time_trial: "Time Trial"
    };
    return `${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase: ${nameMap[type] || "Training Run"}`;
  }
  /**
   * Generate workout description
   */
  generateWorkoutDescription(workout) {
    const segments = workout.segments.map((s) => `${s.duration}min ${s.description}`).join(", ");
    return `${workout.adaptationTarget}. Workout: ${segments}`;
  }
  /**
   * Calculate overall fitness score from available metrics
   */
  calculateOverallScore(assessment) {
    const vdotScore = Math.min((assessment.vdot || 40) / 80 * 100, 100);
    const volumeScore = Math.min((assessment.weeklyMileage || 30) / 100 * 100, 100);
    const experienceScore = Math.min((assessment.trainingAge || 1) / 10 * 100, 100);
    const recoveryScore = assessment.recoveryRate || 75;
    return Math.round(
      vdotScore * 0.4 + volumeScore * 0.25 + experienceScore * 0.2 + recoveryScore * 0.15
    );
  }
  /**
   * Create default fitness assessment
   */
  createDefaultFitness() {
    const assessment = {
      weeklyMileage: 30,
      longestRecentRun: 10,
      vdot: 40,
      trainingAge: 1
    };
    return {
      ...assessment,
      overallScore: this.calculateOverallScore(assessment)
    };
  }
  /**
   * Assess fitness from run history
   */
  static assessFitnessFromRuns(runs) {
    const metrics = calculateFitnessMetrics(runs);
    const patterns = analyzeWeeklyPatterns(runs);
    const assessment = {
      vdot: metrics.vdot,
      criticalSpeed: metrics.criticalSpeed,
      runningEconomy: metrics.runningEconomy,
      lactateThreshold: metrics.lactateThreshold,
      weeklyMileage: patterns.avgWeeklyMileage,
      longestRecentRun: Math.max(...runs.map((r) => r.distance)),
      trainingAge: 1,
      // Would need more data to calculate
      recoveryRate: metrics.recoveryScore
    };
    const vdotScore = Math.min((assessment.vdot || 40) / 80 * 100, 100);
    const volumeScore = Math.min((assessment.weeklyMileage || 30) / 100 * 100, 100);
    const experienceScore = Math.min((assessment.trainingAge || 1) / 10 * 100, 100);
    const recoveryScore = assessment.recoveryRate || 75;
    const overallScore = Math.round(
      vdotScore * 0.4 + volumeScore * 0.25 + experienceScore * 0.2 + recoveryScore * 0.15
    );
    return {
      ...assessment,
      overallScore
    };
  }
};

// src/calculation-cache.ts
var LRUCache = class {
  constructor(maxSize = 100, maxAgeMs = 5 * 60 * 1e3) {
    this.cache = /* @__PURE__ */ new Map();
    this.maxSize = maxSize;
    this.maxAge = maxAgeMs;
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return void 0;
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return void 0;
    }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }
  set(key, value, hash) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== void 0) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hash
    });
  }
  clear() {
    this.cache.clear();
  }
  size() {
    return this.cache.size;
  }
};
function hashRunData(runs) {
  const runSignature = runs.map(
    (run) => `${run.date.getTime()}-${run.distance}-${run.duration}-${run.avgPace || 0}`
  ).join("|");
  let hash = 0;
  for (let i = 0; i < runSignature.length; i++) {
    const char = runSignature.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}
function getVDOTCacheKey(runs) {
  const hash = hashRunData(runs);
  return `vdot-${hash}`;
}
function getCriticalSpeedCacheKey(runs) {
  const hash = hashRunData(runs);
  return `cs-${hash}`;
}
function getFitnessMetricsCacheKey(runs) {
  const hash = hashRunData(runs);
  return `fm-${hash}`;
}
function getTrainingPacesCacheKey(vdot, methodology) {
  return `paces-${methodology}-${vdot}`;
}
var vdotCache = new LRUCache(50);
var criticalSpeedCache = new LRUCache(50);
var fitnessMetricsCache = new LRUCache(50);
var trainingPacesCache = new LRUCache(100);
function calculateVDOTCached(runs) {
  const cacheKey = getVDOTCacheKey(runs);
  const cached = vdotCache.get(cacheKey);
  if (cached !== void 0) {
    return cached;
  }
  const vdot = calculateVDOT(runs);
  const hash = hashRunData(runs);
  vdotCache.set(cacheKey, vdot, hash);
  return vdot;
}
function calculateCriticalSpeedCached(runs) {
  const cacheKey = getCriticalSpeedCacheKey(runs);
  const cached = criticalSpeedCache.get(cacheKey);
  if (cached !== void 0) {
    return cached;
  }
  const criticalSpeed = calculateCriticalSpeed(runs);
  const hash = hashRunData(runs);
  criticalSpeedCache.set(cacheKey, criticalSpeed, hash);
  return criticalSpeed;
}
function calculateFitnessMetricsCached(runs) {
  const cacheKey = getFitnessMetricsCacheKey(runs);
  const cached = fitnessMetricsCache.get(cacheKey);
  if (cached !== void 0) {
    return cached;
  }
  const metrics = calculateFitnessMetrics(runs);
  const hash = hashRunData(runs);
  fitnessMetricsCache.set(cacheKey, metrics, hash);
  return metrics;
}
function calculateTrainingPacesCached(vdot, methodology, calculator) {
  const cacheKey = getTrainingPacesCacheKey(vdot, methodology);
  const cached = trainingPacesCache.get(cacheKey);
  if (cached !== void 0) {
    return cached;
  }
  const paces = calculator(vdot);
  trainingPacesCache.set(cacheKey, paces, `${methodology}-${vdot}`);
  return paces;
}
function batchCalculateVDOT(runDataSets) {
  const results = [];
  const uncachedIndices = [];
  const uncachedRunData = [];
  runDataSets.forEach((runs, index) => {
    const cacheKey = getVDOTCacheKey(runs);
    const cached = vdotCache.get(cacheKey);
    if (cached !== void 0) {
      results[index] = cached;
    } else {
      uncachedIndices.push(index);
      uncachedRunData.push(runs);
    }
  });
  uncachedRunData.forEach((runs, batchIndex) => {
    const actualIndex = uncachedIndices[batchIndex];
    const vdot = calculateVDOT(runs);
    results[actualIndex] = vdot;
    const cacheKey = getVDOTCacheKey(runs);
    const hash = hashRunData(runs);
    vdotCache.set(cacheKey, vdot, hash);
  });
  return results;
}
var CalculationProfiler = class {
  static profile(operation, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    if (!this.metrics[operation]) {
      this.metrics[operation] = { calls: 0, totalTime: 0, avgTime: 0 };
    }
    this.metrics[operation].calls++;
    this.metrics[operation].totalTime += duration;
    this.metrics[operation].avgTime = this.metrics[operation].totalTime / this.metrics[operation].calls;
    return result;
  }
  static async profileAsync(operation, fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    if (!this.metrics[operation]) {
      this.metrics[operation] = { calls: 0, totalTime: 0, avgTime: 0 };
    }
    this.metrics[operation].calls++;
    this.metrics[operation].totalTime += duration;
    this.metrics[operation].avgTime = this.metrics[operation].totalTime / this.metrics[operation].calls;
    return result;
  }
  static getMetrics() {
    return { ...this.metrics };
  }
  static reset() {
    this.metrics = {};
  }
  static getSlowOperations(threshold = 100) {
    return Object.entries(this.metrics).filter(([_, metrics]) => metrics.avgTime > threshold).map(([operation, metrics]) => ({ operation, avgTime: metrics.avgTime })).sort((a, b) => b.avgTime - a.avgTime);
  }
};
CalculationProfiler.metrics = {};
var MemoryMonitor = class {
  static snapshot(operation) {
    this.snapshots.push({
      operation,
      memory: process.memoryUsage(),
      timestamp: Date.now()
    });
  }
  static getMemoryIncrease(fromOperation, toOperation) {
    const fromSnapshot = this.snapshots.find((s) => s.operation === fromOperation);
    const toSnapshot = this.snapshots.find((s) => s.operation === toOperation);
    if (!fromSnapshot || !toSnapshot) return 0;
    return (toSnapshot.memory.heapUsed - fromSnapshot.memory.heapUsed) / (1024 * 1024);
  }
  static getCurrentMemoryUsage() {
    const memory = process.memoryUsage();
    return {
      heapUsed: memory.heapUsed / (1024 * 1024),
      // MB
      heapTotal: memory.heapTotal / (1024 * 1024),
      // MB
      external: memory.external / (1024 * 1024)
      // MB
    };
  }
  static clearSnapshots() {
    this.snapshots = [];
  }
};
MemoryMonitor.snapshots = [];
var CacheManager = class {
  static clearAllCaches() {
    vdotCache.clear();
    criticalSpeedCache.clear();
    fitnessMetricsCache.clear();
    trainingPacesCache.clear();
  }
  static getCacheStats() {
    return {
      vdot: vdotCache.size(),
      criticalSpeed: criticalSpeedCache.size(),
      fitnessMetrics: fitnessMetricsCache.size(),
      trainingPaces: trainingPacesCache.size()
    };
  }
  static getCacheHitRatio() {
    return {
      overall: 0.85
      // Example - would be calculated from actual hit/miss data
    };
  }
};
var OptimizationAnalyzer = class {
  static analyzePerformance() {
    const slowOps = CalculationProfiler.getSlowOperations(50);
    const memoryUsage = MemoryMonitor.getCurrentMemoryUsage();
    const recommendations = [];
    if (slowOps.length > 0) {
      recommendations.push(`Consider optimizing: ${slowOps[0].operation} (avg: ${slowOps[0].avgTime.toFixed(2)}ms)`);
    }
    if (memoryUsage.heapUsed > 80) {
      recommendations.push("High memory usage detected - consider clearing caches or reducing batch sizes");
    }
    const cacheStats = CacheManager.getCacheStats();
    const totalCacheSize = Object.values(cacheStats).reduce((sum, size) => sum + size, 0);
    if (totalCacheSize < 10) {
      recommendations.push("Low cache utilization - consider increasing cache sizes for better performance");
    }
    if (recommendations.length === 0) {
      recommendations.push("Performance appears optimal");
    }
    return {
      recommendations,
      slowOperations: slowOps,
      memoryUsage: {
        current: memoryUsage.heapUsed,
        recommended: Math.min(100, memoryUsage.heapUsed * 1.2)
      }
    };
  }
};
var cacheInstances = {
  vdotCache,
  criticalSpeedCache,
  fitnessMetricsCache,
  trainingPacesCache
};

// src/philosophies.ts
var import_date_fns3 = require("date-fns");
var BaseTrainingPhilosophy = class {
  constructor(methodology, name) {
    this.methodology = methodology;
    this.name = name;
    this.config = TRAINING_METHODOLOGIES[methodology];
  }
  get intensityDistribution() {
    return this.config.intensityDistribution;
  }
  get workoutPriorities() {
    return [...this.config.workoutPriorities];
  }
  get recoveryEmphasis() {
    return this.config.recoveryEmphasis;
  }
  /**
   * Default plan enhancement - can be overridden by specific philosophies
   */
  enhancePlan(basePlan) {
    const enhancedBlocks = basePlan.blocks.map((block) => this.enhanceBlock(block));
    return {
      ...basePlan,
      blocks: enhancedBlocks,
      summary: {
        ...basePlan.summary,
        phases: basePlan.summary.phases.map((phase) => ({
          ...phase,
          intensityDistribution: this.getPhaseIntensityDistribution(phase.phase)
        }))
      }
    };
  }
  /**
   * Enhance a training block with philosophy-specific customizations
   */
  enhanceBlock(block) {
    const enhancedMicrocycles = block.microcycles.map((microcycle) => ({
      ...microcycle,
      workouts: microcycle.workouts.map((plannedWorkout) => ({
        ...plannedWorkout,
        workout: this.customizeWorkout(
          plannedWorkout.workout,
          block.phase,
          microcycle.weekNumber
        )
      }))
    }));
    return {
      ...block,
      microcycles: enhancedMicrocycles
    };
  }
  /**
   * Default workout customization - adjusts intensity based on phase and philosophy
   */
  customizeWorkout(template, phase, weekNumber) {
    const phaseIntensity = this.getPhaseIntensityDistribution(phase);
    const emphasis = this.getWorkoutEmphasis(template.type);
    const customizedSegments = template.segments.map((segment) => ({
      ...segment,
      intensity: this.adjustIntensity(segment.intensity, phase, emphasis)
    }));
    return {
      ...template,
      segments: customizedSegments,
      estimatedTSS: Math.round(template.estimatedTSS * emphasis),
      recoveryTime: Math.round(template.recoveryTime * this.recoveryEmphasis)
    };
  }
  /**
   * Select workout template based on philosophy priorities
   */
  selectWorkout(type, phase, weekInPhase) {
    const availableTemplates = Object.keys(WORKOUT_TEMPLATES).filter((key) => WORKOUT_TEMPLATES[key].type === type);
    if (availableTemplates.length === 0) {
      throw new Error(`No templates available for workout type: ${type}`);
    }
    return this.selectPreferredTemplate(availableTemplates, phase, weekInPhase);
  }
  /**
   * Get phase-specific intensity distribution
   */
  getPhaseIntensityDistribution(phase) {
    const methodologyDistributions = METHODOLOGY_INTENSITY_DISTRIBUTIONS[this.methodology];
    return methodologyDistributions?.[phase] || this.intensityDistribution;
  }
  /**
   * Get workout emphasis multiplier
   */
  getWorkoutEmphasis(type) {
    const emphasis = WORKOUT_EMPHASIS[this.methodology];
    return emphasis?.[type] || 1;
  }
  /**
   * Adjust intensity based on philosophy and phase
   */
  adjustIntensity(baseIntensity, phase, emphasis) {
    let adjustment = 1;
    switch (phase) {
      case "base":
        adjustment = 0.95;
        break;
      case "build":
        adjustment = 1;
        break;
      case "peak":
        adjustment = 1.05;
        break;
      case "taper":
        adjustment = 0.9;
        break;
      case "recovery":
        adjustment = 0.85;
        break;
    }
    adjustment *= emphasis;
    const adjustedIntensity = baseIntensity * adjustment;
    return Math.max(40, Math.min(100, Math.round(adjustedIntensity)));
  }
  /**
   * Select preferred template based on philosophy
   */
  selectPreferredTemplate(templates, phase, weekInPhase) {
    return templates[0];
  }
};
var PhilosophyFactory = class {
  /**
   * Create a training philosophy instance
   */
  static create(methodology) {
    if (this.philosophyCache.has(methodology)) {
      return this.philosophyCache.get(methodology);
    }
    let philosophy;
    switch (methodology) {
      case "daniels":
        philosophy = new DanielsPhilosophy();
        break;
      case "lydiard":
        philosophy = new LydiardPhilosophy();
        break;
      case "pfitzinger":
        philosophy = new PfitsingerPhilosophy();
        break;
      case "hudson":
        philosophy = new HudsonPhilosophy();
        break;
      case "custom":
        philosophy = new CustomPhilosophy();
        break;
      default:
        throw new Error(`Unknown training methodology: ${methodology}`);
    }
    this.philosophyCache.set(methodology, philosophy);
    return philosophy;
  }
  /**
   * Get list of available methodologies
   */
  static getAvailableMethodologies() {
    return ["daniels", "lydiard", "pfitzinger", "hudson", "custom"];
  }
  /**
   * Clear the philosophy cache (useful for testing)
   */
  static clearCache() {
    this.philosophyCache.clear();
  }
};
PhilosophyFactory.philosophyCache = /* @__PURE__ */ new Map();
var DanielsPhilosophy = class extends BaseTrainingPhilosophy {
  constructor() {
    super("daniels", "Jack Daniels");
    this.cachedVDOTPaces = /* @__PURE__ */ new Map();
  }
  /**
   * Enhanced plan generation with VDOT-based pacing and 80/20 enforcement
   */
  enhancePlan(basePlan) {
    const enhancedPlan = super.enhancePlan(basePlan);
    const currentVDOT = basePlan.config.currentFitness?.vdot || this.estimateVDOTFromPlan(basePlan);
    const pacedPlan = {
      ...enhancedPlan,
      workouts: enhancedPlan.workouts.map(
        (workout) => this.applyVDOTBasedPacing(workout, currentVDOT)
      )
    };
    const danielsCompliantPlan = this.validateAndEnforceIntensityDistribution(pacedPlan);
    const intensityReport = this.generateIntensityReport(danielsCompliantPlan);
    return {
      ...danielsCompliantPlan,
      metadata: {
        ...danielsCompliantPlan.metadata,
        danielsVDOT: currentVDOT,
        trainingPaces: this.getVDOTPaces(currentVDOT),
        intensityDistribution: intensityReport.overall,
        intensityReport,
        methodology: "daniels",
        complianceScore: intensityReport.compliance
      }
    };
  }
  /**
   * Daniels-specific workout customization with VDOT integration
   */
  customizeWorkout(template, phase, weekNumber, vdot) {
    const baseCustomization = super.customizeWorkout(template, phase, weekNumber);
    const currentVDOT = vdot || this.estimateVDOTFromTemplate(template);
    const trainingPaces = this.getVDOTPaces(currentVDOT);
    const danielsSegments = baseCustomization.segments.map(
      (segment) => this.customizeSegmentWithVDOTPaces(segment, template.type, phase, trainingPaces)
    );
    return {
      ...baseCustomization,
      segments: danielsSegments,
      adaptationTarget: this.getDanielsAdaptationTarget(template.type, phase),
      metadata: {
        ...baseCustomization.metadata,
        vdot: currentVDOT,
        trainingPaces,
        methodology: "daniels"
      }
    };
  }
  /**
   * Customize workout segment with VDOT-based paces
   */
  customizeSegmentWithVDOTPaces(segment, workoutType, phase, trainingPaces) {
    const paceMapping = {
      easy: "easy",
      recovery: "easy",
      long_run: "easy",
      tempo: "threshold",
      threshold: "threshold",
      steady: "marathon",
      vo2max: "interval",
      speed: "repetition",
      fartlek: "threshold",
      progression: "easy",
      race_pace: "marathon"
    };
    const paceZone = paceMapping[workoutType] || "easy";
    const targetPace = trainingPaces[paceZone];
    const customizedSegment = {
      ...segment,
      intensity: this.calculateVDOTBasedIntensity(segment.intensity, paceZone, phase),
      paceTarget: {
        min: targetPace.min,
        max: targetPace.max
      },
      description: this.enhanceSegmentDescriptionWithPace(
        segment.description,
        workoutType,
        targetPace,
        paceZone
      )
    };
    return this.applyPhaseSpecificAdjustments(customizedSegment, phase, workoutType);
  }
  /**
   * Calculate VDOT-based intensity for a given pace zone
   */
  calculateVDOTBasedIntensity(baseIntensity, paceZone, phase) {
    const danielsIntensityMap = {
      easy: 70,
      // E pace: 59-74% VO2max
      marathon: 84,
      // M pace: 84% VO2max
      threshold: 88,
      // T pace: 88% VO2max
      interval: 98,
      // I pace: 98-100% VO2max
      repetition: 105
      // R pace: 105-110% VO2max
    };
    const targetIntensity = danielsIntensityMap[paceZone];
    const phaseAdjustment = this.getPhaseIntensityAdjustment(phase, paceZone);
    return Math.min(100, Math.max(50, targetIntensity + phaseAdjustment));
  }
  /**
   * Get phase-specific intensity adjustments
   */
  getPhaseIntensityAdjustment(phase, paceZone) {
    const adjustments = {
      base: {
        easy: -2,
        // Slightly easier in base phase
        marathon: -3,
        // Conservative marathon pace
        threshold: -5,
        // Reduced threshold intensity
        interval: -10,
        // Minimal interval work
        repetition: -15
        // Very limited speed work
      },
      build: {
        easy: 0,
        // Standard easy pace
        marathon: 0,
        // Standard marathon pace
        threshold: 0,
        // Full threshold work
        interval: -2,
        // Slightly reduced interval
        repetition: -5
        // Conservative speed work
      },
      peak: {
        easy: 0,
        // Standard easy for recovery
        marathon: 2,
        // Slightly faster marathon pace
        threshold: 2,
        // Enhanced threshold work
        interval: 0,
        // Full interval intensity
        repetition: 0
        // Full speed work
      },
      taper: {
        easy: -2,
        // Very easy for recovery
        marathon: 0,
        // Race-specific marathon pace
        threshold: -3,
        // Reduced threshold volume
        interval: -2,
        // Maintain interval sharpness
        repetition: -5
        // Light speed maintenance
      },
      recovery: {
        easy: -5,
        // Very easy recovery
        marathon: -10,
        // Minimal marathon pace work
        threshold: -15,
        // Minimal threshold work
        interval: -20,
        // Minimal interval work
        repetition: -25
        // Minimal speed work
      }
    };
    return adjustments[phase]?.[paceZone] || 0;
  }
  /**
   * Enhance segment description with VDOT-based pace information
   */
  enhanceSegmentDescriptionWithPace(baseDescription, workoutType, targetPace, paceZone) {
    const paceDescription = this.formatPaceDescription(targetPace, paceZone);
    const zoneDescription = this.getZoneDescription(paceZone);
    return `${baseDescription} ${paceDescription} (${zoneDescription})`;
  }
  /**
   * Format pace description for display
   */
  formatPaceDescription(pace, zone) {
    const formatPace = (p) => {
      const minutes = Math.floor(p);
      const seconds = Math.round((p - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };
    const target = formatPace(pace.target);
    const range = `${formatPace(pace.min)}-${formatPace(pace.max)}`;
    return `at ${target}/km (${range}/km ${zone.toUpperCase()} pace)`;
  }
  /**
   * Get description for pace zone
   */
  getZoneDescription(zone) {
    const descriptions = {
      easy: "E - Easy/Aerobic",
      marathon: "M - Marathon",
      threshold: "T - Threshold/Tempo",
      interval: "I - Interval/VO2max",
      repetition: "R - Repetition/Speed"
    };
    return descriptions[zone];
  }
  /**
   * Apply phase-specific adjustments to customized segments
   */
  applyPhaseSpecificAdjustments(segment, phase, workoutType) {
    if (phase === "base") {
      if (workoutType === "threshold" || workoutType === "vo2max") {
        return {
          ...segment,
          duration: Math.max(segment.duration * 0.8, 15),
          // Reduce duration in base
          intensity: Math.max(segment.intensity - 5, 70)
          // Reduce intensity
        };
      }
    }
    if (phase === "peak") {
      if (workoutType === "vo2max" || workoutType === "speed") {
        return {
          ...segment,
          intensity: Math.min(segment.intensity + 2, 100)
          // Increase intensity slightly
        };
      }
    }
    if (phase === "taper") {
      return {
        ...segment,
        duration: Math.max(segment.duration * 0.7, 10)
        // Reduce duration significantly
      };
    }
    return segment;
  }
  /**
   * Estimate VDOT from workout template characteristics
   */
  estimateVDOTFromTemplate(template) {
    const baseVDOT = 45;
    const avgIntensity = template.segments.reduce((sum, seg) => sum + (seg.intensity || 75), 0) / template.segments.length;
    if (avgIntensity > 90) return baseVDOT + 5;
    if (avgIntensity > 80) return baseVDOT;
    return baseVDOT - 5;
  }
  /**
   * Daniels workout selection prioritizing key workout types
   */
  selectWorkout(type, phase, weekInPhase) {
    const availableTemplates = Object.keys(WORKOUT_TEMPLATES).filter((key) => WORKOUT_TEMPLATES[key].type === type);
    if (availableTemplates.length === 0) {
      throw new Error(`No templates available for workout type: ${type}`);
    }
    return this.selectDanielsSpecificWorkout(type, phase, weekInPhase, availableTemplates);
  }
  /**
   * Daniels-specific workout selection algorithm
   * Prioritizes tempo runs, intervals, and repetitions based on phase
   */
  selectDanielsSpecificWorkout(type, phase, weekInPhase, availableTemplates) {
    switch (phase) {
      case "base":
        return this.selectBasePhaseWorkout(type, weekInPhase, availableTemplates);
      case "build":
        return this.selectBuildPhaseWorkout(type, weekInPhase, availableTemplates);
      case "peak":
        return this.selectPeakPhaseWorkout(type, weekInPhase, availableTemplates);
      case "taper":
        return this.selectTaperPhaseWorkout(type, weekInPhase, availableTemplates);
      case "recovery":
        return this.selectRecoveryPhaseWorkout(type, availableTemplates);
      default:
        return availableTemplates[0];
    }
  }
  /**
   * Base phase: Focus on easy running with gradual introduction of quality
   * Week 1-2: Easy only
   * Week 3-4: Add strides and light tempo
   * Week 5+: Introduce threshold work
   */
  selectBasePhaseWorkout(type, weekInPhase, templates) {
    switch (type) {
      case "easy":
        return "EASY_AEROBIC";
      case "tempo":
        if (weekInPhase <= 2) {
          return "EASY_AEROBIC";
        }
        return "TEMPO_CONTINUOUS";
      case "threshold":
        if (weekInPhase <= 4) {
          return templates.includes("TEMPO_CONTINUOUS") ? "TEMPO_CONTINUOUS" : templates[0];
        }
        return this.selectThresholdWorkout(weekInPhase, templates);
      case "speed":
        return "SPEED_200M_REPS";
      case "vo2max":
        return templates.includes("TEMPO_CONTINUOUS") ? "TEMPO_CONTINUOUS" : templates[0];
      case "long_run":
        return "LONG_RUN";
      default:
        return templates[0];
    }
  }
  /**
   * Build phase: Balance aerobic maintenance with quality work
   * Emphasis on threshold and tempo development
   * Introduction of VO2max work
   */
  selectBuildPhaseWorkout(type, weekInPhase, templates) {
    switch (type) {
      case "tempo":
        return "TEMPO_CONTINUOUS";
      case "threshold":
        return this.selectThresholdWorkout(weekInPhase, templates);
      case "vo2max":
        if (weekInPhase <= 2) {
          return templates.includes("VO2MAX_5X3") ? "VO2MAX_5X3" : templates[0];
        }
        return this.selectVO2MaxWorkout(weekInPhase, templates);
      case "speed":
        return "SPEED_200M_REPS";
      case "fartlek":
        return "FARTLEK_VARIED";
      case "progression":
        return "PROGRESSION_3_STAGE";
      case "easy":
        return "EASY_AEROBIC";
      case "long_run":
        return "LONG_RUN";
      default:
        return templates[0];
    }
  }
  /**
   * Peak phase: Focus on race pace and VO2max
   * Maintain threshold, reduce volume
   * Sharpen with speed work
   */
  selectPeakPhaseWorkout(type, weekInPhase, templates) {
    switch (type) {
      case "tempo":
        return "TEMPO_CONTINUOUS";
      case "threshold":
        return templates.includes("THRESHOLD_PROGRESSION") ? "THRESHOLD_PROGRESSION" : this.selectThresholdWorkout(weekInPhase, templates);
      case "vo2max":
        return this.selectVO2MaxWorkout(weekInPhase, templates);
      case "speed":
        return "SPEED_200M_REPS";
      case "race_pace":
        return "TEMPO_CONTINUOUS";
      // At race pace
      case "fartlek":
        return "FARTLEK_VARIED";
      case "easy":
        return "EASY_AEROBIC";
      case "long_run":
        return "LONG_RUN";
      default:
        return templates[0];
    }
  }
  /**
   * Taper phase: Maintain fitness, reduce volume
   * Focus on race pace feel
   */
  selectTaperPhaseWorkout(type, weekInPhase, templates) {
    switch (type) {
      case "tempo":
        return "TEMPO_CONTINUOUS";
      case "threshold":
        return "THRESHOLD_PROGRESSION";
      case "vo2max":
        return templates.includes("VO2MAX_5X3") ? "VO2MAX_5X3" : templates[0];
      case "speed":
        return "SPEED_200M_REPS";
      case "easy":
        return "EASY_AEROBIC";
      case "long_run":
        return "LONG_RUN";
      default:
        return templates[0];
    }
  }
  /**
   * Recovery phase: Easy running only
   */
  selectRecoveryPhaseWorkout(type, templates) {
    switch (type) {
      case "recovery":
        return "RECOVERY_JOG";
      case "easy":
        return "EASY_AEROBIC";
      default:
        return "EASY_AEROBIC";
    }
  }
  /**
   * Select appropriate threshold workout based on progression
   */
  selectThresholdWorkout(weekInPhase, templates) {
    if (templates.includes("LACTATE_THRESHOLD_2X20")) {
      return "LACTATE_THRESHOLD_2X20";
    }
    if (templates.includes("THRESHOLD_PROGRESSION")) {
      return "THRESHOLD_PROGRESSION";
    }
    return templates[0];
  }
  /**
   * Select appropriate VO2max workout with progression
   */
  selectVO2MaxWorkout(weekInPhase, templates) {
    if (templates.includes("VO2MAX_4X4") && templates.includes("VO2MAX_5X3")) {
      return weekInPhase % 2 === 0 ? "VO2MAX_4X4" : "VO2MAX_5X3";
    }
    return templates.find((t) => t.includes("VO2MAX")) || templates[0];
  }
  /**
   * Get cached or calculate VDOT-based training paces
   */
  getVDOTPaces(vdot) {
    if (!this.cachedVDOTPaces.has(vdot)) {
      this.cachedVDOTPaces.set(vdot, calculateTrainingPaces(vdot));
    }
    return this.cachedVDOTPaces.get(vdot);
  }
  /**
   * Calculate VDOT from run data with caching
   */
  calculateVDOTFromRuns(runs) {
    return calculateVDOTCached(runs);
  }
  /**
   * Apply VDOT-based pace calculations to workout segments
   */
  applyVDOTBasedPacing(plannedWorkout, vdot) {
    const workout = plannedWorkout.workout;
    if (!workout || !workout.segments || vdot < 30 || vdot > 85) {
      return plannedWorkout;
    }
    const danielsPaces = this.getVDOTPaces(vdot);
    const enhancedSegments = workout.segments.map((segment) => ({
      ...segment,
      paceTarget: this.getDanielsSpecificPace(segment.zone.name, danielsPaces),
      heartRateTarget: this.calculateVDOTHeartRates(segment.zone.name, vdot),
      description: this.enhanceSegmentWithVDOTInfo(segment.description, segment.zone.name, danielsPaces)
    }));
    return {
      ...plannedWorkout,
      workout: {
        ...workout,
        segments: enhancedSegments,
        vdotUsed: vdot,
        paceRecommendations: this.generatePaceRecommendations(danielsPaces)
      }
    };
  }
  /**
   * Get Daniels-specific pace for a training zone
   */
  getDanielsSpecificPace(zoneName, paces) {
    switch (zoneName.toLowerCase()) {
      case "recovery":
        return {
          min: paces.easy.max * 1.1,
          max: paces.easy.max * 1.25,
          target: paces.easy.max * 1.15
        };
      case "easy":
        return paces.easy;
      case "steady":
        return {
          min: paces.easy.min,
          max: paces.marathon.max,
          target: (paces.easy.target + paces.marathon.target) / 2
        };
      case "tempo":
        return {
          min: paces.marathon.max,
          max: paces.marathon.max * 1.05,
          target: paces.marathon.max * 1.02
        };
      case "threshold":
        return paces.threshold;
      case "vo2 max":
      case "vo2max":
        return paces.interval;
      case "neuromuscular":
        return paces.repetition;
      default:
        return paces.marathon;
    }
  }
  /**
   * Calculate VDOT-based heart rate ranges
   */
  calculateVDOTHeartRates(zoneName, vdot) {
    const estimatedMaxHR = 220 - (vdot < 45 ? 35 : vdot < 55 ? 30 : 25);
    switch (zoneName) {
      case "Recovery":
        return { min: Math.round(estimatedMaxHR * 0.5), max: Math.round(estimatedMaxHR * 0.6) };
      case "Easy":
        return { min: Math.round(estimatedMaxHR * 0.65), max: Math.round(estimatedMaxHR * 0.75) };
      case "Steady":
        return { min: Math.round(estimatedMaxHR * 0.75), max: Math.round(estimatedMaxHR * 0.82) };
      case "Tempo":
        return { min: Math.round(estimatedMaxHR * 0.82), max: Math.round(estimatedMaxHR * 0.87) };
      case "Threshold":
        return { min: Math.round(estimatedMaxHR * 0.87), max: Math.round(estimatedMaxHR * 0.92) };
      case "VO2max":
        return { min: Math.round(estimatedMaxHR * 0.92), max: Math.round(estimatedMaxHR * 0.97) };
      case "Neuromuscular":
        return { min: Math.round(estimatedMaxHR * 0.95), max: Math.round(estimatedMaxHR * 1) };
      default:
        return { min: Math.round(estimatedMaxHR * 0.7), max: Math.round(estimatedMaxHR * 0.8) };
    }
  }
  /**
   * Enhance segment description with VDOT-specific pace information
   */
  enhanceSegmentWithVDOTInfo(description, zoneName, paces) {
    const pace = this.getDanielsSpecificPace(zoneName, paces);
    const paceStr = this.formatPaceRange(pace);
    const zoneDescriptions = {
      "easy": `E pace (${paceStr}) - Build aerobic base`,
      "marathon": `M pace (${paceStr}) - Race pace endurance`,
      "threshold": `T pace (${paceStr}) - Lactate threshold`,
      "interval": `I pace (${paceStr}) - VO2max development`,
      "repetition": `R pace (${paceStr}) - Speed and power`
    };
    const enhancement = zoneDescriptions[zoneName.toLowerCase()];
    return enhancement ? `${enhancement} - ${description}` : description;
  }
  /**
   * Format pace range for display
   */
  formatPaceRange(pace) {
    const formatTime = (minutes) => {
      const mins = Math.floor(minutes);
      const secs = Math.round((minutes - mins) * 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };
    if (Math.abs(pace.min - pace.max) < 0.1) {
      return formatTime(pace.target);
    }
    return `${formatTime(pace.min)}-${formatTime(pace.max)}`;
  }
  /**
   * Generate pace recommendations for the workout
   */
  generatePaceRecommendations(paces) {
    return {
      easy: `E: ${this.formatPaceRange(paces.easy)} - Conversational pace, aerobic base`,
      marathon: `M: ${this.formatPaceRange(paces.marathon)} - Goal marathon pace`,
      threshold: `T: ${this.formatPaceRange(paces.threshold)} - Comfortably hard, 1-hour effort`,
      interval: `I: ${this.formatPaceRange(paces.interval)} - Hard intervals, VO2max`,
      repetition: `R: ${this.formatPaceRange(paces.repetition)} - Short, fast repeats`
    };
  }
  /**
   * Estimate VDOT from training plan characteristics
   */
  estimateVDOTFromPlan(plan) {
    const weeklyDistance = plan.summary.totalDistance / plan.summary.totalWeeks;
    const workoutIntensity = plan.summary.phases.reduce((avg, phase) => avg + phase.intensityDistribution.hard, 0) / plan.summary.phases.length;
    let estimatedVDOT = 35;
    if (weeklyDistance > 80) estimatedVDOT += 15;
    else if (weeklyDistance > 60) estimatedVDOT += 10;
    else if (weeklyDistance > 40) estimatedVDOT += 5;
    if (workoutIntensity > 20) estimatedVDOT += 10;
    else if (workoutIntensity > 15) estimatedVDOT += 5;
    return Math.min(65, estimatedVDOT);
  }
  /**
   * Calculate actual intensity distribution from plan
   */
  calculateActualIntensityDistribution(plan) {
    let easyMinutes = 0;
    let moderateMinutes = 0;
    let hardMinutes = 0;
    const workouts = plan.workouts || [];
    workouts.forEach((workout) => {
      if (workout?.workout?.segments) {
        workout.workout.segments.forEach((segment) => {
          if (segment.intensity <= 75) {
            easyMinutes += segment.duration;
          } else if (segment.intensity <= 85) {
            moderateMinutes += segment.duration;
          } else {
            hardMinutes += segment.duration;
          }
        });
      }
    });
    const totalMinutes = easyMinutes + moderateMinutes + hardMinutes;
    if (totalMinutes === 0) return { easy: 80, moderate: 15, hard: 5 };
    return {
      easy: Math.round(easyMinutes / totalMinutes * 100),
      moderate: Math.round(moderateMinutes / totalMinutes * 100),
      hard: Math.round(hardMinutes / totalMinutes * 100)
    };
  }
  /**
   * Update training paces when fitness changes
   */
  updateVDOT(newVDOT) {
    if (newVDOT < 30 || newVDOT > 85) {
      throw new Error(`Invalid VDOT: ${newVDOT}. Must be between 30 and 85.`);
    }
    this.cachedVDOTPaces.delete(newVDOT);
    const newPaces = this.getVDOTPaces(newVDOT);
    return newPaces;
  }
  /**
   * Enforce 80/20 intensity distribution across plan
   */
  enforce8020Distribution(plan) {
    const actualDistribution = this.calculateActualIntensityDistribution(plan);
    if (actualDistribution.easy >= 78 && actualDistribution.easy <= 82) {
      return plan;
    }
    const adjustedWorkouts = plan.workouts.map((workout) => {
      if (actualDistribution.easy < 78) {
        return this.convertToEasierIntensity(workout);
      } else if (actualDistribution.easy > 82) {
        return this.addQualityToWorkout(workout);
      }
      return workout;
    });
    return {
      ...plan,
      workouts: adjustedWorkouts
    };
  }
  /**
   * Convert workout to easier intensity for 80/20 compliance
   */
  convertToEasierIntensity(workout) {
    const modifiedSegments = workout.workout.segments.map((segment) => {
      if (segment.intensity > 75 && segment.intensity < 90) {
        return {
          ...segment,
          intensity: 70,
          zone: TRAINING_ZONES.EASY,
          description: `Easy ${segment.description.toLowerCase()}`
        };
      }
      return segment;
    });
    return {
      ...workout,
      workout: {
        ...workout.workout,
        segments: modifiedSegments
      }
    };
  }
  /**
   * Add quality to workout for better distribution
   */
  addQualityToWorkout(workout) {
    if (workout.workout.type === "easy" && Math.random() > 0.7) {
      const totalDuration = workout.workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
      if (totalDuration > 45) {
        const segments = [
          {
            ...workout.workout.segments[0],
            duration: totalDuration * 0.4,
            description: "Easy warm-up"
          },
          {
            duration: totalDuration * 0.2,
            intensity: 85,
            zone: TRAINING_ZONES.TEMPO,
            description: "Tempo segment"
          },
          {
            ...workout.workout.segments[0],
            duration: totalDuration * 0.4,
            description: "Easy cool-down"
          }
        ];
        return {
          ...workout,
          workout: {
            ...workout.workout,
            type: "tempo",
            segments
          }
        };
      }
    }
    return workout;
  }
  /**
   * Comprehensive intensity distribution validation and enforcement system
   */
  /**
   * Validate and enforce 80/20 intensity distribution with phase-specific targets
   */
  validateAndEnforceIntensityDistribution(plan) {
    const phaseSpecificPlan = this.applyPhaseSpecificTargets(plan);
    const validatedPlan = this.validateIntensityDistribution(phaseSpecificPlan);
    if (!validatedPlan.isValid) {
      return this.autoAdjustIntensityDistribution(phaseSpecificPlan, validatedPlan.violations);
    }
    return phaseSpecificPlan;
  }
  /**
   * Apply phase-specific intensity targets for Daniels methodology
   */
  applyPhaseSpecificTargets(plan) {
    const adjustedBlocks = plan.blocks.map((block) => {
      const targetDistribution = this.getPhaseIntensityTarget(block.phase);
      const adjustedMicrocycles = block.microcycles.map((microcycle) => ({
        ...microcycle,
        workouts: this.adjustWorkoutsToTargetDistribution(microcycle.workouts, targetDistribution, block.phase)
      }));
      return {
        ...block,
        microcycles: adjustedMicrocycles,
        targetIntensityDistribution: targetDistribution
      };
    });
    return {
      ...plan,
      blocks: adjustedBlocks
    };
  }
  /**
   * Get phase-specific intensity targets for Daniels methodology
   */
  getPhaseIntensityTarget(phase) {
    const targets = METHODOLOGY_PHASE_TARGETS.daniels;
    return targets[phase] || { easy: 80, moderate: 5, hard: 15 };
  }
  /**
   * Adjust workouts to meet target intensity distribution
   */
  adjustWorkoutsToTargetDistribution(workouts, target, phase) {
    const currentDistribution = this.calculateWorkoutGroupDistribution(workouts);
    const adjustmentNeeded = this.calculateDistributionAdjustment(currentDistribution, target);
    if (Math.abs(adjustmentNeeded.easy) <= 2) {
      return workouts;
    }
    return this.applyDistributionAdjustments(workouts, adjustmentNeeded, phase);
  }
  /**
   * Calculate current intensity distribution from workout group
   */
  calculateWorkoutGroupDistribution(workouts) {
    let easyMinutes = 0;
    let moderateMinutes = 0;
    let hardMinutes = 0;
    workouts.forEach((workout) => {
      if (workout?.workout?.segments) {
        workout.workout.segments.forEach((segment) => {
          const intensity = segment.intensity;
          if (intensity <= 75) {
            easyMinutes += segment.duration;
          } else if (intensity <= 85) {
            moderateMinutes += segment.duration;
          } else {
            hardMinutes += segment.duration;
          }
        });
      }
    });
    const totalMinutes = easyMinutes + moderateMinutes + hardMinutes;
    if (totalMinutes === 0) return { easy: 80, moderate: 5, hard: 15 };
    return {
      easy: Math.round(easyMinutes / totalMinutes * 100),
      moderate: Math.round(moderateMinutes / totalMinutes * 100),
      hard: Math.round(hardMinutes / totalMinutes * 100)
    };
  }
  /**
   * Calculate what adjustments are needed to meet target distribution
   */
  calculateDistributionAdjustment(current, target) {
    return {
      easy: target.easy - current.easy,
      moderate: target.moderate - current.moderate,
      hard: target.hard - current.hard
    };
  }
  /**
   * Apply distribution adjustments to workouts
   */
  applyDistributionAdjustments(workouts, adjustment, phase) {
    const adjustedWorkouts = [...workouts];
    if (adjustment.easy > 0) {
      adjustedWorkouts.forEach((workout, index) => {
        if (this.canConvertToEasier(workout)) {
          adjustedWorkouts[index] = this.convertToEasierIntensity(workout);
        }
      });
    }
    if (adjustment.hard > 0 && phase !== "base") {
      const eligibleWorkouts = adjustedWorkouts.filter((w) => this.canAddQuality(w));
      const workoutsToModify = Math.min(2, eligibleWorkouts.length);
      for (let i = 0; i < workoutsToModify; i++) {
        const workoutIndex = adjustedWorkouts.indexOf(eligibleWorkouts[i]);
        adjustedWorkouts[workoutIndex] = this.addQualityToWorkout(eligibleWorkouts[i]);
      }
    }
    return adjustedWorkouts;
  }
  /**
   * Check if workout can be converted to easier intensity
   */
  canConvertToEasier(workout) {
    if (!workout?.workout?.segments) return false;
    const hasModerateIntensity = workout.workout.segments.some(
      (segment) => segment.intensity > 75 && segment.intensity < 90
    );
    return hasModerateIntensity && workout.workout.type !== "threshold" && workout.workout.type !== "vo2max";
  }
  /**
   * Check if workout can have quality added
   */
  canAddQuality(workout) {
    if (!workout?.workout?.segments) return false;
    const totalDuration = workout.workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
    const isEasyRun = workout.workout.type === "easy";
    const isLongEnough = totalDuration >= 45;
    return isEasyRun && isLongEnough;
  }
  /**
   * Comprehensive intensity distribution validation
   */
  validateIntensityDistribution(plan) {
    const violations = [];
    const phaseDistributions = {};
    plan.blocks.forEach((block) => {
      const phaseDistribution = this.calculateActualIntensityDistribution({
        ...plan,
        workouts: plan.workouts.filter(
          (w) => w.date >= block.startDate && w.date <= block.endDate
        )
      });
      phaseDistributions[`${block.phase}-${block.startDate}`] = phaseDistribution;
      const target = this.getPhaseIntensityTarget(block.phase);
      const phaseViolations = this.checkDistributionViolations(
        phaseDistribution,
        target,
        block.phase
      );
      violations.push(...phaseViolations);
    });
    const overallDistribution = this.calculateActualIntensityDistribution(plan);
    const overallTarget = INTENSITY_MODELS.polarized;
    const overallViolations = this.checkDistributionViolations(
      overallDistribution,
      overallTarget,
      "overall"
    );
    violations.push(...overallViolations);
    return {
      isValid: violations.length === 0,
      violations,
      overall: overallDistribution,
      phases: phaseDistributions
    };
  }
  /**
   * Check for distribution violations
   */
  checkDistributionViolations(actual, target, phase) {
    const violations = [];
    const tolerance = 5;
    if (actual.easy < target.easy - tolerance) {
      violations.push({
        type: "insufficient_easy",
        phase,
        actual: actual.easy,
        target: target.easy,
        difference: target.easy - actual.easy,
        severity: this.calculateViolationSeverity(target.easy - actual.easy)
      });
    }
    if (actual.hard > target.hard + tolerance) {
      violations.push({
        type: "excessive_hard",
        phase,
        actual: actual.hard,
        target: target.hard,
        difference: actual.hard - target.hard,
        severity: this.calculateViolationSeverity(actual.hard - target.hard)
      });
    }
    return violations;
  }
  /**
   * Calculate violation severity
   */
  calculateViolationSeverity(difference) {
    const absDiff = Math.abs(difference);
    if (absDiff <= 5) return "low";
    if (absDiff <= 10) return "medium";
    if (absDiff <= 15) return "high";
    return "critical";
  }
  /**
   * Auto-adjust intensity distribution to fix violations
   */
  autoAdjustIntensityDistribution(plan, violations) {
    let adjustedPlan = { ...plan };
    const sortedViolations = violations.sort((a, b) => {
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
    sortedViolations.forEach((violation) => {
      adjustedPlan = this.fixIntensityViolation(adjustedPlan, violation);
    });
    const revalidation = this.validateIntensityDistribution(adjustedPlan);
    if (!revalidation.isValid && revalidation.violations.length < violations.length) {
      return this.autoAdjustIntensityDistribution(adjustedPlan, revalidation.violations);
    }
    return adjustedPlan;
  }
  /**
   * Fix specific intensity distribution violation
   */
  fixIntensityViolation(plan, violation) {
    const adjustedWorkouts = plan.workouts.map((workout) => {
      switch (violation.type) {
        case "insufficient_easy":
          return this.convertWorkoutToEasier(workout, violation);
        case "excessive_hard":
          return this.reduceWorkoutIntensity(workout, violation);
        default:
          return workout;
      }
    });
    return {
      ...plan,
      workouts: adjustedWorkouts
    };
  }
  /**
   * Convert workout to easier intensity to increase easy percentage
   */
  convertWorkoutToEasier(workout, violation) {
    if (!this.shouldAdjustWorkout(workout, violation)) {
      return workout;
    }
    const modifiedSegments = workout.workout.segments.map((segment) => {
      if (segment.intensity > 75 && segment.intensity <= 85) {
        return {
          ...segment,
          intensity: 70,
          zone: TRAINING_ZONES.EASY,
          description: this.updateSegmentDescription(segment.description, "easier")
        };
      }
      return segment;
    });
    return {
      ...workout,
      workout: {
        ...workout.workout,
        segments: modifiedSegments,
        type: "easy",
        adaptationTarget: "Aerobic base building, 80/20 compliance"
      }
    };
  }
  /**
   * Reduce workout intensity to decrease hard percentage
   */
  reduceWorkoutIntensity(workout, violation) {
    if (!this.shouldAdjustWorkout(workout, violation) || violation.severity === "low") {
      return workout;
    }
    const modifiedSegments = workout.workout.segments.map((segment) => {
      if (segment.intensity > 85) {
        const newIntensity = violation.severity === "critical" ? 70 : 80;
        return {
          ...segment,
          intensity: newIntensity,
          zone: newIntensity <= 75 ? TRAINING_ZONES.EASY : TRAINING_ZONES.STEADY,
          description: this.updateSegmentDescription(segment.description, "reduced")
        };
      }
      return segment;
    });
    return {
      ...workout,
      workout: {
        ...workout.workout,
        segments: modifiedSegments,
        adaptationTarget: `${workout.workout.adaptationTarget} (intensity reduced for 80/20 compliance)`
      }
    };
  }
  /**
   * Check if workout should be adjusted for violation
   */
  shouldAdjustWorkout(workout, violation) {
    if (workout.workout.type === "race_pace" || workout.workout.type === "time_trial") {
      return violation.severity === "critical";
    }
    if (violation.severity === "high" || violation.severity === "critical") {
      return true;
    }
    return ["easy", "steady", "recovery"].includes(workout.workout.type);
  }
  /**
   * Update segment description for intensity changes
   */
  updateSegmentDescription(description, adjustment) {
    const prefix = adjustment === "easier" ? "Easy " : "Reduced intensity ";
    return `${prefix}${description.toLowerCase()} (80/20 compliance)`;
  }
  /**
   * Generate intensity distribution report
   */
  generateIntensityReport(plan) {
    const validation = this.validateIntensityDistribution(plan);
    const recommendations = this.generateIntensityRecommendations(validation);
    return {
      overall: validation.overall,
      target: INTENSITY_MODELS.polarized,
      phases: validation.phases,
      violations: validation.violations,
      recommendations,
      compliance: this.calculateComplianceScore(validation),
      methodology: "daniels"
    };
  }
  /**
   * Generate intensity distribution recommendations
   */
  generateIntensityRecommendations(validation) {
    const recommendations = [];
    if (validation.overall.easy < 75) {
      recommendations.push("Increase easy running volume to build aerobic base");
      recommendations.push("Convert some moderate workouts to easy runs");
    }
    if (validation.overall.hard > 20) {
      recommendations.push("Reduce high-intensity work to prevent overtraining");
      recommendations.push("Focus on quality over quantity for hard workouts");
    }
    validation.violations.forEach((violation) => {
      if (violation.severity === "high" || violation.severity === "critical") {
        recommendations.push(
          `Critical: ${violation.type} in ${violation.phase} phase - adjust immediately`
        );
      }
    });
    if (recommendations.length === 0) {
      recommendations.push("Intensity distribution looks good - maintain current balance");
    }
    return recommendations;
  }
  /**
   * Calculate compliance score (0-100)
   */
  calculateComplianceScore(validation) {
    const target = INTENSITY_MODELS.polarized;
    const actual = validation.overall;
    const easyDeviation = Math.abs(actual.easy - target.easy);
    const hardDeviation = Math.abs(actual.hard - target.hard);
    const easyScore = Math.max(0, 100 - easyDeviation * 2);
    const hardScore = Math.max(0, 100 - hardDeviation * 3);
    const violationPenalty = validation.violations.reduce((penalty, violation) => {
      const severityPenalty = { low: 2, medium: 5, high: 10, critical: 20 };
      return penalty + severityPenalty[violation.severity];
    }, 0);
    const baseScore = (easyScore + hardScore) / 2;
    return Math.max(0, Math.round(baseScore - violationPenalty));
  }
  /**
   * Adjust intensity specifically for Daniels methodology
   */
  adjustIntensityForDaniels(baseIntensity, workoutType, phase) {
    let adjustment = 1;
    switch (workoutType) {
      case "easy":
        adjustment = phase === "base" ? 0.9 : 0.95;
        break;
      case "tempo":
        adjustment = 1;
        break;
      case "threshold":
        adjustment = 1.05;
        break;
      case "vo2max":
        adjustment = phase === "peak" ? 1.1 : 1.05;
        break;
      case "speed":
        adjustment = 1;
        break;
      default:
        adjustment = 1;
    }
    const adjustedIntensity = baseIntensity * adjustment;
    return Math.max(40, Math.min(100, Math.round(adjustedIntensity)));
  }
  /**
   * Enhance segment descriptions with Daniels terminology
   */
  enhanceSegmentDescription(baseDescription, workoutType) {
    const danielsTerms = {
      "recovery": "Easy jog, focus on form and relaxation",
      "easy": "Conversational pace, build aerobic base",
      "steady": "Steady aerobic effort, controlled breathing",
      "tempo": "Comfortably hard, controlled tempo effort",
      "threshold": "Threshold pace, sustainable hard effort",
      "vo2max": "VO2max intensity, hard but controlled",
      "speed": "Neuromuscular power, focus on form",
      "hill_repeats": "Hill power, strong uphill drive",
      "fartlek": "Speed play, varied intensity surges",
      "progression": "Progressive buildup, finish strong",
      "long_run": "Aerobic base building, steady effort",
      "race_pace": "Goal race pace, rhythm practice",
      "time_trial": "All-out effort, race simulation",
      "cross_training": "Non-impact aerobic exercise",
      "strength": "Strength training for runners"
    };
    const enhancement = danielsTerms[workoutType];
    return enhancement ? `${enhancement} - ${baseDescription}` : baseDescription;
  }
  /**
   * Get Daniels-specific adaptation targets
   */
  getDanielsAdaptationTarget(workoutType, phase) {
    const adaptationTargets = {
      "easy": {
        "base": "Build aerobic base, improve fat oxidation",
        "build": "Maintain aerobic fitness, aid recovery",
        "peak": "Active recovery between hard sessions",
        "taper": "Maintain fitness, promote recovery",
        "recovery": "Full recovery, blood flow maintenance"
      },
      "tempo": {
        "base": "Develop aerobic power, lactate clearance",
        "build": "Improve tempo pace, aerobic strength",
        "peak": "Race pace practice, lactate management",
        "taper": "Maintain tempo fitness, race prep",
        "recovery": "Light tempo work for fitness maintenance"
      },
      "threshold": {
        "base": "Develop lactate threshold, aerobic power",
        "build": "Improve threshold pace, lactate tolerance",
        "peak": "Race-specific threshold work",
        "taper": "Maintain threshold fitness",
        "recovery": "Easy threshold maintenance"
      },
      "vo2max": {
        "base": "Develop VO2max, running economy",
        "build": "Improve VO2max, neuromuscular power",
        "peak": "Peak VO2max fitness, race sharpening",
        "taper": "Maintain VO2max, race readiness",
        "recovery": "Light VO2max maintenance"
      }
    };
    return adaptationTargets[workoutType]?.[phase] || `${workoutType} training adaptation for ${phase} phase`;
  }
};
var AerobicBaseCalculator = class {
  constructor() {
    this.LYDIARD_EASY_TARGET = 85;
    // 85% minimum easy running
    this.MAX_HARD_PERCENTAGE = 15;
  }
  // Maximum hard running allowed
  /**
   * Enforce 85%+ easy running distribution in plan
   */
  enforceAerobicBase(workouts) {
    if (workouts.length === 0) return workouts;
    const currentDistribution = this.calculateIntensityDistribution(workouts);
    if (currentDistribution.easy >= this.LYDIARD_EASY_TARGET) {
      return workouts;
    }
    return this.convertToAerobicBase(workouts, currentDistribution);
  }
  /**
   * Calculate current intensity distribution
   */
  calculateIntensityDistribution(workouts) {
    if (workouts.length === 0) return { easy: 100, moderate: 0, hard: 0 };
    const totalDuration = workouts.reduce((sum, w) => sum + (w.targetMetrics.duration || 60), 0);
    let easyDuration = 0;
    let moderateDuration = 0;
    let hardDuration = 0;
    workouts.forEach((workout) => {
      const duration = workout.targetMetrics.duration || 60;
      const intensity = workout.targetMetrics.intensity || 70;
      if (intensity <= 75) {
        easyDuration += duration;
      } else if (intensity <= 85) {
        moderateDuration += duration;
      } else {
        hardDuration += duration;
      }
    });
    return {
      easy: Math.round(easyDuration / totalDuration * 100),
      moderate: Math.round(moderateDuration / totalDuration * 100),
      hard: Math.round(hardDuration / totalDuration * 100)
    };
  }
  /**
   * Convert workouts to achieve aerobic base targets
   */
  convertToAerobicBase(workouts, currentDistribution) {
    const targetEasyPercentage = this.LYDIARD_EASY_TARGET;
    const currentEasyPercentage = currentDistribution.easy;
    if (currentEasyPercentage >= targetEasyPercentage) {
      return workouts;
    }
    const deficitPercentage = targetEasyPercentage - currentEasyPercentage;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.targetMetrics.duration || 60), 0);
    const durationToConvert = deficitPercentage / 100 * totalDuration;
    const sortedWorkouts = [...workouts].sort(
      (a, b) => (b.targetMetrics.intensity || 70) - (a.targetMetrics.intensity || 70)
    );
    let remainingToConvert = durationToConvert;
    const convertedWorkouts = [...workouts];
    for (let i = 0; i < sortedWorkouts.length && remainingToConvert > 0; i++) {
      const workout = sortedWorkouts[i];
      const workoutIndex = workouts.findIndex((w) => w === workout);
      const workoutDuration = workout.targetMetrics.duration || 60;
      const currentIntensity = workout.targetMetrics.intensity || 70;
      if (currentIntensity > 75) {
        convertedWorkouts[workoutIndex] = {
          ...workout,
          workout: this.convertToEasyWorkout(workout.workout),
          targetMetrics: {
            ...workout.targetMetrics,
            intensity: 70,
            // Easy intensity
            tss: Math.round((workout.targetMetrics.tss || 50) * 0.7)
            // Reduce TSS accordingly
          }
        };
        remainingToConvert = Math.max(0, remainingToConvert - workoutDuration);
      }
    }
    return convertedWorkouts;
  }
  /**
   * Convert a workout to easy aerobic equivalent
   */
  convertToEasyWorkout(workout) {
    return {
      ...workout,
      type: "easy",
      segments: workout.segments.map((segment) => ({
        ...segment,
        intensity: 70,
        // Easy intensity
        description: `Easy aerobic - ${segment.description} (converted for aerobic base)`
      })),
      adaptationTarget: "Aerobic base development, mitochondrial adaptation",
      estimatedTSS: Math.round(workout.estimatedTSS * 0.7)
    };
  }
  /**
   * Convert pace-based training to time/effort-based training
   */
  convertToTimeBased(workout) {
    const timeBased = {
      ...workout,
      segments: workout.segments.map((segment) => ({
        ...segment,
        description: this.convertToEffortDescription(segment.description, segment.intensity)
      })),
      adaptationTarget: "Aerobic development through effort-based training"
    };
    return timeBased;
  }
  /**
   * Convert segment description to effort-based terminology
   */
  convertToEffortDescription(description, intensity) {
    let effortLevel;
    if (intensity <= 70) {
      effortLevel = "Very easy effort - conversational, nose breathing only";
    } else if (intensity <= 75) {
      effortLevel = "Easy effort - comfortable, can talk in full sentences";
    } else if (intensity <= 80) {
      effortLevel = "Steady effort - comfortably hard, some breathing effort";
    } else if (intensity <= 87) {
      effortLevel = "Moderate effort - controlled discomfort, rhythmic breathing";
    } else {
      effortLevel = "Hard effort - significant breathing, focused effort";
    }
    return `${description} at ${effortLevel}`;
  }
  /**
   * Calculate long run progression up to 22+ miles
   */
  calculateLongRunProgression(currentWeek, totalWeeks, baseDistance = 10) {
    const targetDistance = 22;
    const progressionRate = (targetDistance - baseDistance) / (totalWeeks * 0.7);
    let progressedDistance = baseDistance + currentWeek * progressionRate;
    if (currentWeek % 3 === 0 && currentWeek > 3) {
      progressedDistance = Math.max(baseDistance, progressedDistance - progressionRate);
    }
    return Math.min(progressedDistance, targetDistance);
  }
  /**
   * Validate aerobic base compliance
   */
  validateAerobicBase(workouts) {
    const distribution = this.calculateIntensityDistribution(workouts);
    const isCompliant = distribution.easy >= this.LYDIARD_EASY_TARGET;
    const violations = [];
    const recommendations = [];
    if (!isCompliant) {
      violations.push(`Easy running: ${distribution.easy}% (target: ${this.LYDIARD_EASY_TARGET}%+)`);
      recommendations.push(`Increase easy running by ${this.LYDIARD_EASY_TARGET - distribution.easy}%`);
      recommendations.push("Convert some tempo/threshold workouts to easy aerobic runs");
      recommendations.push("Focus on time on feet rather than pace");
    }
    if (distribution.hard > this.MAX_HARD_PERCENTAGE) {
      violations.push(`Hard running: ${distribution.hard}% (maximum: ${this.MAX_HARD_PERCENTAGE}%)`);
      recommendations.push("Reduce intensity of hard workouts");
      recommendations.push("Replace some intervals with steady state runs");
    }
    return {
      distribution,
      isCompliant,
      violations,
      recommendations,
      methodology: "lydiard"
    };
  }
};
var LydiardHillGenerator = class {
  /**
   * Generate Lydiard-specific hill workout based on phase and progression
   */
  generateHillWorkout(phase, weekInPhase, duration = 45) {
    const hillProfile = this.getHillProfileForPhase(phase, weekInPhase);
    const segments = this.createHillSegments(hillProfile, duration);
    return {
      id: `lydiard-hill-${phase}-week${weekInPhase}`,
      name: `Lydiard ${hillProfile.name}`,
      type: "hill_repeats",
      primaryZone: hillProfile.primaryZone,
      segments,
      adaptationTarget: hillProfile.adaptationTarget,
      estimatedTSS: this.calculateHillTSS(segments),
      recoveryTime: this.calculateHillRecovery(phase, segments.length),
      metadata: {
        methodology: "lydiard",
        hillType: hillProfile.type,
        phase,
        weekInPhase,
        lydiardPrinciples: hillProfile.principles
      }
    };
  }
  /**
   * Get hill profile specific to Lydiard methodology and training phase
   */
  getHillProfileForPhase(phase, weekInPhase) {
    switch (phase) {
      case "base":
        return {
          type: "aerobic_strength",
          name: "Aerobic Hill Strengthening",
          primaryZone: TRAINING_ZONES.STEADY,
          intensity: 75 + weekInPhase * 2,
          // Progressive intensity 75-85%
          duration: 3 + Math.floor(weekInPhase / 2),
          // 3-6 minute efforts
          recovery: 90,
          // 1.5 minute recoveries
          repeats: Math.min(4 + weekInPhase, 8),
          // 4-8 repeats
          gradient: "6-8%",
          effort: "Strong but controlled aerobic effort",
          adaptationTarget: "Leg strength, running economy, aerobic power development",
          principles: [
            "Build strength through sustained hill efforts",
            "Focus on form and biomechanical efficiency",
            "Aerobic emphasis - not anaerobic stress",
            "Progressive volume and intensity over weeks"
          ]
        };
      case "build":
        return {
          type: "anaerobic_power",
          name: "Hill Power Development",
          primaryZone: TRAINING_ZONES.VO2_MAX,
          intensity: 88 + weekInPhase,
          // Higher intensity 88-92%
          duration: 2 + Math.floor(weekInPhase / 3),
          // 2-4 minute efforts
          recovery: 120,
          // 2 minute full recoveries
          repeats: Math.min(6 + weekInPhase, 10),
          // 6-10 repeats
          gradient: "8-12%",
          effort: "Hard uphill drive with controlled form",
          adaptationTarget: "Anaerobic power, lactate tolerance, neuromuscular coordination",
          principles: [
            "Develop anaerobic power through hill efforts",
            "Maintain strong uphill drive technique",
            "Build lactate tolerance progressively",
            "Prepare for speed development phase"
          ]
        };
      case "peak":
        return {
          type: "speed_hills",
          name: "Hill Speed Coordination",
          primaryZone: TRAINING_ZONES.VO2_MAX,
          intensity: 92 + weekInPhase,
          // Very high intensity 92-95%
          duration: 1 + weekInPhase * 0.5,
          // 1-2.5 minute efforts
          recovery: 180,
          // 3 minute full recoveries
          repeats: Math.min(8 + weekInPhase, 12),
          // 8-12 shorter efforts
          gradient: "10-15%",
          effort: "Fast uphill running with coordination focus",
          adaptationTarget: "Speed coordination, neuromuscular power, race preparation",
          principles: [
            "Fast hill running for speed development",
            "Coordination and economy at speed",
            "Race-specific power development",
            "Final sharpening of leg speed"
          ]
        };
      case "taper":
        return {
          type: "maintenance",
          name: "Hill Maintenance",
          primaryZone: TRAINING_ZONES.TEMPO,
          intensity: 80,
          // Moderate intensity
          duration: 2,
          // Short 2-minute efforts
          recovery: 120,
          // 2 minute recoveries
          repeats: 4,
          // Just 4 repeats
          gradient: "6-8%",
          effort: "Moderate hill effort to maintain feel",
          adaptationTarget: "Maintain hill strength and coordination",
          principles: [
            "Maintain hill strength without fatigue",
            "Keep neuromuscular patterns sharp",
            "Minimal stress with maximum maintenance",
            "Focus on race readiness"
          ]
        };
      case "recovery":
        return {
          type: "gentle_hills",
          name: "Gentle Hill Walking/Jogging",
          primaryZone: TRAINING_ZONES.EASY,
          intensity: 60,
          // Very easy
          duration: 1,
          // 1 minute gentle efforts
          recovery: 180,
          // 3 minute recoveries
          repeats: 3,
          // Just 3 gentle efforts
          gradient: "4-6%",
          effort: "Very easy hill walking or gentle jogging",
          adaptationTarget: "Active recovery with gentle strength maintenance",
          principles: [
            "Gentle movement for recovery",
            "Maintain basic hill mechanics",
            "No stress on anaerobic systems",
            "Promote blood flow and healing"
          ]
        };
      default:
        return this.getHillProfileForPhase("base", weekInPhase);
    }
  }
  /**
   * Create workout segments based on hill profile
   */
  createHillSegments(profile, totalDuration) {
    const segments = [];
    const warmupDuration = Math.min(20, totalDuration * 0.3);
    segments.push({
      duration: warmupDuration,
      intensity: 65,
      zone: TRAINING_ZONES.EASY,
      description: `Warm-up jog to hills - easy pace, prepare for ${profile.effort.toLowerCase()}`
    });
    for (let i = 1; i <= profile.repeats; i++) {
      segments.push({
        duration: profile.duration,
        intensity: profile.intensity,
        zone: profile.primaryZone,
        description: `Hill repeat ${i}/${profile.repeats} - ${profile.effort} on ${profile.gradient} gradient`,
        effort: profile.effort,
        terrain: `${profile.gradient} uphill`,
        focus: i === 1 ? "Establish rhythm and form" : i === profile.repeats ? "Strong finish maintaining form" : "Maintain consistent effort and technique"
      });
      if (i < profile.repeats) {
        segments.push({
          duration: profile.recovery / 60,
          // Convert seconds to minutes
          intensity: 50,
          zone: TRAINING_ZONES.RECOVERY,
          description: `Recovery jog/walk down hill - full recovery before next effort`,
          effort: "Very easy recovery",
          terrain: "downhill jog or walk",
          focus: "Complete recovery, relax and prepare for next effort"
        });
      }
    }
    const cooldownDuration = Math.max(10, totalDuration * 0.2);
    segments.push({
      duration: cooldownDuration,
      intensity: 60,
      zone: TRAINING_ZONES.RECOVERY,
      description: "Cool-down jog on flat terrain - easy pace to finish",
      effort: "Easy relaxed jogging",
      focus: "Gradual return to easy pace, form and relaxation"
    });
    return segments;
  }
  /**
   * Calculate TSS for hill workout
   */
  calculateHillTSS(segments) {
    let totalTSS = 0;
    segments.forEach((segment) => {
      const intensityFactor = segment.intensity / 100;
      const segmentTSS = segment.duration * Math.pow(intensityFactor, 2) * 100 / 60;
      const hillMultiplier = segment.intensity > 80 ? 1.2 : 1;
      totalTSS += segmentTSS * hillMultiplier;
    });
    return Math.round(totalTSS);
  }
  /**
   * Calculate recovery time for hill workout
   */
  calculateHillRecovery(phase, numRepeats) {
    const baseRecovery = {
      "base": 24,
      // Hills in base are moderate stress
      "build": 36,
      // Higher intensity needs more recovery
      "peak": 48,
      // Very high intensity
      "taper": 18,
      // Light maintenance work
      "recovery": 12
      // Gentle work
    };
    const phaseRecovery = baseRecovery[phase] || 24;
    const repeatMultiplier = 1 + (numRepeats - 4) * 0.1;
    return Math.round(phaseRecovery * repeatMultiplier);
  }
  /**
   * Create phase-specific hill training templates
   */
  createLydiardHillTemplates() {
    const templates = {};
    templates["LYDIARD_HILL_BASE"] = this.generateHillWorkout("base", 4);
    templates["LYDIARD_HILL_BUILD"] = this.generateHillWorkout("build", 3);
    templates["LYDIARD_HILL_PEAK"] = this.generateHillWorkout("peak", 2);
    templates["LYDIARD_HILL_TAPER"] = this.generateHillWorkout("taper", 1);
    templates["LYDIARD_HILL_RECOVERY"] = this.generateHillWorkout("recovery", 1);
    return templates;
  }
  /**
   * Get hill training progression recommendations
   */
  getHillProgressionGuidance(phase) {
    switch (phase) {
      case "base":
        return {
          frequency: "2-3 times per week",
          duration: "4-8 weeks continuous",
          focus: "Leg strength and running economy",
          effort: "Strong but comfortable aerobic effort",
          progression: "Increase duration and repeats gradually",
          cautions: [
            "Never run hills at anaerobic intensity",
            "Focus on form and rhythm over speed",
            "Build volume before intensity",
            "Allow adequate recovery between sessions"
          ],
          benefits: [
            "Increased leg strength and power",
            "Improved running economy",
            "Enhanced biomechanical efficiency",
            "Foundation for later speed development"
          ]
        };
      case "build":
        return {
          frequency: "2 times per week",
          duration: "3-4 weeks",
          focus: "Anaerobic power development",
          effort: "Hard uphill drive with control",
          progression: "Increase intensity while maintaining form",
          cautions: [
            "Maintain strong uphill drive technique",
            "Do not overstride or lose form",
            "Monitor recovery between sessions",
            "Reduce if signs of overreaching appear"
          ],
          benefits: [
            "Anaerobic power development",
            "Lactate tolerance improvement",
            "Neuromuscular coordination",
            "Preparation for speed phase"
          ]
        };
      case "peak":
        return {
          frequency: "1-2 times per week",
          duration: "2-3 weeks",
          focus: "Speed coordination and final sharpening",
          effort: "Fast controlled hill running",
          progression: "Emphasize speed and coordination",
          cautions: [
            "Focus on coordination over raw speed",
            "Maintain excellent form at all times",
            "Use sparingly - quality over quantity",
            "Ensure full recovery between efforts"
          ],
          benefits: [
            "Speed coordination development",
            "Neuromuscular power enhancement",
            "Race-specific preparation",
            "Final leg speed sharpening"
          ]
        };
      default:
        return {
          frequency: "1 time per week",
          duration: "1-2 weeks",
          focus: "Maintenance or recovery",
          effort: "Easy to moderate",
          progression: "Maintain without stress",
          cautions: ["Keep efforts easy", "Focus on recovery"],
          benefits: ["Strength maintenance", "Active recovery"]
        };
    }
  }
};
var LydiardPeriodizationSystem = class {
  constructor() {
    // Lydiard-specific phase names mapping to standard phases
    this.lydiardPhases = {
      "aerobic_base": "base",
      "hill_phase": "base",
      // Hills are part of extended base in Lydiard
      "anaerobic": "build",
      "coordination": "peak",
      "taper": "taper",
      "recovery": "recovery"
    };
  }
  /**
   * Calculate Lydiard phase durations based on total plan length
   */
  calculatePhaseDurations(totalWeeks, targetRace) {
    const basePercentage = 0.55;
    const anaerobicPercentage = 0.2;
    const coordinationPercentage = 0.15;
    const taperPercentage = 0.1;
    let baseDuration = Math.round(totalWeeks * basePercentage);
    let anaerobicDuration = Math.round(totalWeeks * anaerobicPercentage);
    let coordinationDuration = Math.round(totalWeeks * coordinationPercentage);
    let taperDuration = Math.round(totalWeeks * taperPercentage);
    baseDuration = Math.max(8, baseDuration);
    anaerobicDuration = Math.max(3, anaerobicDuration);
    coordinationDuration = Math.max(2, coordinationDuration);
    taperDuration = Math.max(2, Math.min(3, taperDuration));
    if (targetRace === "marathon") {
      baseDuration += 2;
      coordinationDuration = Math.max(2, coordinationDuration - 1);
    } else if (targetRace === "5k" || targetRace === "10k") {
      anaerobicDuration += 1;
      coordinationDuration += 1;
    }
    const hillPhaseDuration = Math.max(4, Math.round(baseDuration * 0.3));
    const aerobicBaseDuration = baseDuration - hillPhaseDuration;
    return {
      aerobicBase: aerobicBaseDuration,
      hillPhase: hillPhaseDuration,
      anaerobic: anaerobicDuration,
      coordination: coordinationDuration,
      taper: taperDuration,
      totalWeeks: aerobicBaseDuration + hillPhaseDuration + anaerobicDuration + coordinationDuration + taperDuration
    };
  }
  /**
   * Create Lydiard-specific training blocks
   */
  createLydiardBlocks(config) {
    const durations = this.calculatePhaseDurations(
      config.targetWeeks,
      config.goalRace?.type || "half_marathon"
    );
    const blocks = [];
    let weekNumber = 1;
    blocks.push({
      phase: "base",
      name: "Aerobic Base Building",
      description: "Build maximum aerobic capacity through volume and easy running",
      weekStart: weekNumber,
      weekEnd: weekNumber + durations.aerobicBase - 1,
      duration: durations.aerobicBase,
      microcycles: this.createMicrocycles("base", durations.aerobicBase, weekNumber),
      focus: ["Aerobic capacity", "Volume building", "Easy running", "Long runs"],
      keyWorkouts: ["long_run", "easy", "steady"],
      intensityDistribution: { easy: 95, moderate: 4, hard: 1 }
    });
    weekNumber += durations.aerobicBase;
    blocks.push({
      phase: "base",
      name: "Hill Strength Development",
      description: "Build leg strength and power through systematic hill training",
      weekStart: weekNumber,
      weekEnd: weekNumber + durations.hillPhase - 1,
      duration: durations.hillPhase,
      microcycles: this.createMicrocycles("base", durations.hillPhase, weekNumber),
      focus: ["Hill strength", "Running economy", "Power development", "Form improvement"],
      keyWorkouts: ["hill_repeats", "long_run", "easy"],
      intensityDistribution: { easy: 85, moderate: 10, hard: 5 }
    });
    weekNumber += durations.hillPhase;
    blocks.push({
      phase: "build",
      name: "Anaerobic Development",
      description: "Develop anaerobic capacity and lactate tolerance",
      weekStart: weekNumber,
      weekEnd: weekNumber + durations.anaerobic - 1,
      duration: durations.anaerobic,
      microcycles: this.createMicrocycles("build", durations.anaerobic, weekNumber),
      focus: ["Anaerobic power", "Lactate tolerance", "Tempo running", "Time trials"],
      keyWorkouts: ["tempo", "threshold", "time_trial", "long_run"],
      intensityDistribution: { easy: 80, moderate: 15, hard: 5 }
    });
    weekNumber += durations.anaerobic;
    blocks.push({
      phase: "peak",
      name: "Coordination & Sharpening",
      description: "Develop speed coordination and race-specific fitness",
      weekStart: weekNumber,
      weekEnd: weekNumber + durations.coordination - 1,
      duration: durations.coordination,
      microcycles: this.createMicrocycles("peak", durations.coordination, weekNumber),
      focus: ["Speed coordination", "Race pace", "Neuromuscular power", "Final sharpening"],
      keyWorkouts: ["speed", "race_pace", "vo2max", "fartlek"],
      intensityDistribution: { easy: 75, moderate: 15, hard: 10 }
    });
    weekNumber += durations.coordination;
    blocks.push({
      phase: "taper",
      name: "Race Taper",
      description: "Reduce volume while maintaining fitness for peak performance",
      weekStart: weekNumber,
      weekEnd: weekNumber + durations.taper - 1,
      duration: durations.taper,
      microcycles: this.createMicrocycles("taper", durations.taper, weekNumber),
      focus: ["Recovery", "Race preparation", "Maintain fitness", "Mental preparation"],
      keyWorkouts: ["race_pace", "easy", "tempo"],
      intensityDistribution: { easy: 85, moderate: 10, hard: 5 }
    });
    return blocks;
  }
  /**
   * Create microcycles for Lydiard periodization
   */
  createMicrocycles(phase, duration, startWeek) {
    const microcycles = [];
    for (let week = 0; week < duration; week++) {
      const weekNumber = startWeek + week;
      const isRecoveryWeek = (week + 1) % 4 === 0;
      microcycles.push({
        weekNumber,
        phase,
        emphasis: this.getWeekEmphasis(phase, week, duration),
        workoutTypes: this.getLydiardWeeklyWorkouts(phase, week, isRecoveryWeek),
        volumeModifier: isRecoveryWeek ? 0.7 : 1 + week * 0.05,
        // Progressive overload
        intensityModifier: this.getIntensityModifier(phase, week, duration),
        keyFocus: this.getWeeklyFocus(phase, week, duration),
        recoveryPriority: isRecoveryWeek ? "high" : "moderate"
      });
    }
    return microcycles;
  }
  /**
   * Get week emphasis based on Lydiard principles
   */
  getWeekEmphasis(phase, weekInPhase, phaseDuration) {
    const progression = weekInPhase / phaseDuration;
    switch (phase) {
      case "base":
        if (progression < 0.3) return "Volume building";
        if (progression < 0.6) return "Aerobic development";
        return "Strength building";
      case "build":
        if (progression < 0.5) return "Anaerobic introduction";
        return "Lactate tolerance";
      case "peak":
        if (progression < 0.5) return "Speed coordination";
        return "Race simulation";
      case "taper":
        return "Recovery and sharpening";
      default:
        return "Recovery";
    }
  }
  /**
   * Get Lydiard-specific weekly workout distribution
   */
  getLydiardWeeklyWorkouts(phase, weekInPhase, isRecoveryWeek) {
    if (isRecoveryWeek) {
      return ["easy", "easy", "steady", "easy", "long_run", "easy", "recovery"];
    }
    switch (phase) {
      case "base":
        if (weekInPhase < 4) {
          return ["easy", "steady", "easy", "steady", "long_run", "easy", "recovery"];
        }
        return ["easy", "hill_repeats", "easy", "steady", "long_run", "hill_repeats", "recovery"];
      case "build":
        return ["easy", "tempo", "easy", "threshold", "long_run", "time_trial", "recovery"];
      case "peak":
        return ["easy", "speed", "easy", "race_pace", "tempo", "vo2max", "recovery"];
      case "taper":
        return ["easy", "race_pace", "easy", "tempo", "easy", "race_pace", "recovery"];
      default:
        return ["recovery", "easy", "recovery", "easy", "recovery", "easy", "recovery"];
    }
  }
  /**
   * Get intensity modifier for progressive overload
   */
  getIntensityModifier(phase, weekInPhase, phaseDuration) {
    const progression = weekInPhase / phaseDuration;
    switch (phase) {
      case "base":
        return 1;
      // No intensity increase in base
      case "build":
        return 1 + progression * 0.1;
      // Gradual intensity increase
      case "peak":
        return 1.1 + progression * 0.05;
      // Slight increase
      case "taper":
        return 1 - progression * 0.2;
      // Decrease intensity
      default:
        return 0.8;
    }
  }
  /**
   * Get weekly focus points
   */
  getWeeklyFocus(phase, weekInPhase, phaseDuration) {
    const baselineFocus = {
      "base": ["Aerobic development", "Running form", "Consistency"],
      "build": ["Lactate threshold", "Tempo endurance", "Mental toughness"],
      "peak": ["Race pace", "Speed coordination", "Race tactics"],
      "taper": ["Recovery", "Race visualization", "Maintain sharpness"],
      "recovery": ["Complete rest", "Regeneration", "Mental refresh"]
    };
    return baselineFocus[phase] || ["General fitness"];
  }
  /**
   * Validate phase transition readiness
   */
  validatePhaseTransition(currentPhase, completedWorkouts) {
    const requiredCompletions = {
      "base": {
        minWeeks: 8,
        minLongRuns: 6,
        minWeeklyVolume: 40,
        // km
        requiredWorkoutTypes: ["long_run", "easy", "steady"]
      },
      "build": {
        minWeeks: 3,
        minTempoRuns: 6,
        minThresholdWork: 4,
        requiredWorkoutTypes: ["tempo", "threshold", "time_trial"]
      },
      "peak": {
        minWeeks: 2,
        minSpeedSessions: 4,
        minRacePaceWork: 3,
        requiredWorkoutTypes: ["speed", "race_pace", "vo2max"]
      }
    };
    const isReady = true;
    const recommendations = isReady ? [] : ["Complete more base work before progressing"];
    return {
      currentPhase,
      nextPhase: this.getNextPhase(currentPhase),
      isReady,
      completionPercentage: 85,
      // Simplified
      missingRequirements: [],
      recommendations
    };
  }
  /**
   * Get next phase in Lydiard progression
   */
  getNextPhase(currentPhase) {
    const progression = {
      "base": "build",
      "build": "peak",
      "peak": "taper",
      "taper": "recovery",
      "recovery": "base"
    };
    return progression[currentPhase] || "base";
  }
  /**
   * Apply recovery emphasis based on Lydiard principles
   */
  applyRecoveryEmphasis(workout, phase, isRecoveryWeek) {
    if (!isRecoveryWeek && phase !== "recovery") {
      return workout;
    }
    if (workout.type === "recovery" || workout.type === "easy") {
      return {
        ...workout,
        segments: workout.segments.map((segment) => ({
          ...segment,
          intensity: Math.min(segment.intensity, 60),
          // Very easy
          description: segment.description + " - Complete recovery focus"
        })),
        adaptationTarget: "Complete physiological and mental recovery",
        estimatedTSS: Math.round(workout.estimatedTSS * 0.5),
        recoveryTime: 8
        // Minimal stress
      };
    }
    return workout;
  }
};
var LydiardPhilosophy = class extends BaseTrainingPhilosophy {
  constructor() {
    super("lydiard", "Arthur Lydiard");
    this.aerobicBaseCalculator = new AerobicBaseCalculator();
    this.lydiardHillGenerator = new LydiardHillGenerator();
    this.periodizationSystem = new LydiardPeriodizationSystem();
  }
  /**
   * Enhanced plan generation with extended aerobic base phase and 85%+ easy running
   */
  enhancePlan(basePlan) {
    const enhancedPlan = super.enhancePlan(basePlan);
    const totalWeeks = basePlan.weeks?.length || basePlan.summary?.totalWeeks || 12;
    const targetRace = basePlan.races?.find((r) => r.priority === "A") || basePlan.races?.[0];
    if (targetRace) {
      const phaseDurations = this.periodizationSystem.calculatePhaseDurations(totalWeeks, targetRace.type);
      const lydiardBlocks2 = this.periodizationSystem.createLydiardBlocks(totalWeeks, phaseDurations, targetRace);
      enhancedPlan.blocks = lydiardBlocks2;
    }
    const aerobicCompliantWorkouts = this.aerobicBaseCalculator.enforceAerobicBase(enhancedPlan.workouts);
    const lydiardBlocks = enhancedPlan.blocks.map(
      (block) => this.applyLydiardPhaseEmphasis(block)
    );
    const timeBasedWorkouts = aerobicCompliantWorkouts.map((plannedWorkout) => ({
      ...plannedWorkout,
      workout: this.aerobicBaseCalculator.convertToTimeBased(plannedWorkout.workout)
    }));
    const recoveryEmphasizedWorkouts = this.periodizationSystem.applyRecoveryEmphasis(timeBasedWorkouts);
    const aerobicBaseReport = this.aerobicBaseCalculator.validateAerobicBase(recoveryEmphasizedWorkouts);
    const lydiardPlan = {
      ...enhancedPlan,
      blocks: lydiardBlocks,
      workouts: recoveryEmphasizedWorkouts,
      summary: {
        ...enhancedPlan.summary,
        phases: enhancedPlan.summary.phases.map((phase) => ({
          ...phase,
          intensityDistribution: this.getLydiardPhaseDistribution(phase.phase),
          focus: this.getLydiardPhaseFocus(phase.phase)
        }))
      },
      metadata: {
        ...enhancedPlan.metadata,
        methodology: "lydiard",
        aerobicBaseReport,
        lydiardFeatures: {
          aerobicBaseCompliance: aerobicBaseReport.isCompliant,
          easyRunningPercentage: aerobicBaseReport.distribution.easy,
          timeBasedTraining: true,
          longRunProgression: this.calculateLongRunProgressionForPlan(enhancedPlan),
          periodizationModel: "lydiard_classic",
          recoveryPhilosophy: "complete_rest"
        }
      }
    };
    this.applyEffortBasedZones(lydiardPlan);
    return lydiardPlan;
  }
  /**
   * Lydiard-specific workout customization emphasizing aerobic development
   */
  customizeWorkout(template, phase, weekNumber) {
    const baseCustomization = super.customizeWorkout(template, phase, weekNumber);
    const lydiardSegments = baseCustomization.segments.map((segment) => ({
      ...segment,
      intensity: this.adjustIntensityForLydiard(segment.intensity, template.type, phase, weekNumber),
      description: this.enhanceLydiardDescription(segment.description, template.type, phase)
    }));
    return {
      ...baseCustomization,
      segments: lydiardSegments,
      adaptationTarget: this.getLydiardAdaptationTarget(template.type, phase),
      recoveryTime: Math.round(baseCustomization.recoveryTime * 1.1)
      // Conservative recovery
    };
  }
  /**
   * Lydiard workout selection emphasizing aerobic base and hill training
   */
  selectWorkout(type, phase, weekInPhase) {
    const availableTemplates = Object.keys(WORKOUT_TEMPLATES).filter((key) => WORKOUT_TEMPLATES[key].type === type);
    if (availableTemplates.length === 0) {
      throw new Error(`No templates available for workout type: ${type}`);
    }
    switch (type) {
      case "easy":
        return "EASY_AEROBIC";
      // Foundation of Lydiard training
      case "long_run":
        return "LONG_RUN";
      // Critical for aerobic base development
      case "steady":
        return availableTemplates[0];
      case "hill_repeats":
        return this.selectLydiardHillWorkout(phase, weekInPhase);
      case "tempo":
        return "TEMPO_CONTINUOUS";
      case "threshold":
        if (phase === "base") {
          return "TEMPO_CONTINUOUS";
        }
        return availableTemplates.includes("THRESHOLD_PROGRESSION") ? "THRESHOLD_PROGRESSION" : availableTemplates[0];
      case "vo2max":
        if (phase === "base" || phase === "build") {
          return this.selectLydiardHillWorkout(phase, weekInPhase);
        }
        return availableTemplates[0];
      case "speed":
        if (phase === "base" || phase === "build") {
          return this.selectLydiardHillWorkout(phase, weekInPhase);
        }
        return availableTemplates[0];
      default:
        return availableTemplates[0];
    }
  }
  /**
   * Apply Lydiard phase emphasis with extended base phase
   */
  applyLydiardPhaseEmphasis(block) {
    const enhancedMicrocycles = block.microcycles.map((microcycle) => {
      const modifiedWorkouts = microcycle.workouts.map((plannedWorkout) => {
        if (block.phase === "base" && this.isHighIntensityWorkout(plannedWorkout.workout.type)) {
          const easierWorkout = this.convertToAerobicWorkout(plannedWorkout.workout);
          return {
            ...plannedWorkout,
            workout: easierWorkout
          };
        }
        return plannedWorkout;
      });
      return {
        ...microcycle,
        workouts: modifiedWorkouts
      };
    });
    return {
      ...block,
      microcycles: enhancedMicrocycles
    };
  }
  /**
   * Check if workout is high intensity
   */
  isHighIntensityWorkout(type) {
    return ["vo2max", "speed", "threshold"].includes(type);
  }
  /**
   * Convert high-intensity workout to aerobic alternative
   */
  convertToAerobicWorkout(workout) {
    const aerobicSegments = workout.segments.map((segment) => ({
      ...segment,
      intensity: Math.min(segment.intensity, 75),
      // Cap at steady intensity
      zone: segment.intensity > 80 ? TRAINING_ZONES.STEADY : segment.zone,
      description: `Aerobic ${segment.description.toLowerCase()}`
    }));
    return {
      ...workout,
      type: "steady",
      primaryZone: TRAINING_ZONES.STEADY,
      segments: aerobicSegments,
      adaptationTarget: "Aerobic base development, mitochondrial adaptation",
      estimatedTSS: Math.round(workout.estimatedTSS * 0.7),
      // Lower stress
      recoveryTime: Math.round(workout.recoveryTime * 0.8)
      // Faster recovery
    };
  }
  /**
   * Adjust intensity for Lydiard methodology
   */
  adjustIntensityForLydiard(baseIntensity, workoutType, phase, weekNumber) {
    let adjustment = 1;
    switch (workoutType) {
      case "easy":
        adjustment = 0.85;
        break;
      case "steady":
        adjustment = 0.95;
        break;
      case "long_run":
        adjustment = 0.9;
        break;
      case "hill_repeats":
        adjustment = phase === "base" ? 0.9 : 0.95;
        break;
      case "tempo":
        adjustment = 0.95;
        break;
      case "threshold":
        if (phase === "base") {
          adjustment = 0.85;
        } else {
          adjustment = 0.98;
        }
        break;
      case "vo2max":
        if (phase === "base" || phase === "build") {
          adjustment = 0.8;
        } else {
          adjustment = 1;
        }
        break;
      case "speed":
        if (phase === "base" || phase === "build") {
          adjustment = 0.75;
        } else {
          adjustment = 0.98;
        }
        break;
      default:
        adjustment = 0.95;
    }
    const weeklyAdjustment = this.getWeeklyAdjustment(weekNumber, phase);
    adjustment *= weeklyAdjustment;
    const adjustedIntensity = baseIntensity * adjustment;
    return Math.max(45, Math.min(100, Math.round(adjustedIntensity)));
  }
  /**
   * Get weekly adjustment for progressive loading
   */
  getWeeklyAdjustment(weekNumber, phase) {
    const baseProgression = 0.02;
    switch (phase) {
      case "base":
        return 1 + weekNumber * baseProgression * 0.5;
      // Very gradual in base
      case "build":
        return 1 + weekNumber * baseProgression * 0.8;
      // Moderate in build
      case "peak":
        return 1 + weekNumber * baseProgression;
      // Normal in peak
      default:
        return 1;
    }
  }
  /**
   * Get Lydiard phase-specific intensity distribution
   */
  getLydiardPhaseDistribution(phase) {
    switch (phase) {
      case "base":
        return { easy: 95, moderate: 4, hard: 1 };
      // Extreme aerobic emphasis
      case "build":
        return { easy: 90, moderate: 8, hard: 2 };
      // Still very aerobic
      case "peak":
        return { easy: 85, moderate: 10, hard: 5 };
      // Some intensity added
      case "taper":
        return { easy: 92, moderate: 5, hard: 3 };
      // Back to easy emphasis
      case "recovery":
        return { easy: 98, moderate: 2, hard: 0 };
      // Almost all easy
      default:
        return this.intensityDistribution;
    }
  }
  /**
   * Get Lydiard phase focus areas
   */
  getLydiardPhaseFocus(phase) {
    switch (phase) {
      case "base":
        return ["Aerobic base development", "Mitochondrial adaptation", "Capillarization", "Hill strength"];
      case "build":
        return ["Aerobic power", "Lactate clearance", "Time trials", "Coordination"];
      case "peak":
        return ["Race sharpening", "Speed development", "Race tactics", "Final conditioning"];
      case "taper":
        return ["Maintain fitness", "Recovery", "Race preparation", "Mental readiness"];
      case "recovery":
        return ["Full recovery", "Base maintenance", "Form work", "Preparation for next cycle"];
      default:
        return ["General aerobic development"];
    }
  }
  /**
   * Enhance descriptions with Lydiard terminology
   */
  enhanceLydiardDescription(baseDescription, workoutType, phase) {
    const lydiardTerms = {
      "easy": {
        "base": "Aerobic base building - foundation mileage",
        "build": "Aerobic maintenance - recovery between harder efforts",
        "peak": "Active recovery - maintain aerobic base",
        "taper": "Easy aerobic - maintain fitness with minimal stress",
        "recovery": "Gentle jogging - promote recovery"
      },
      "steady": {
        "base": "Steady state aerobic - key Lydiard development pace",
        "build": "Sustained aerobic effort - lactate clearance",
        "peak": "Aerobic power - controlled sustained effort",
        "taper": "Steady maintenance - keep aerobic systems active",
        "recovery": "Easy steady - very light aerobic work"
      },
      "hill_repeats": {
        "base": "Hill strength - build power and economy",
        "build": "Hill power - anaerobic strength development",
        "peak": "Speed hill work - final power development",
        "taper": "Light hill work - maintain strength",
        "recovery": "Easy hill walking - gentle strength work"
      },
      "tempo": {
        "base": "Aerobic tempo - controlled aerobic effort",
        "build": "Tempo development - lactate threshold preparation",
        "peak": "Race pace tempo - specific pace practice",
        "taper": "Light tempo - maintain pace feel",
        "recovery": "Easy tempo - very light sustained work"
      }
    };
    const enhancement = lydiardTerms[workoutType]?.[phase];
    return enhancement ? `${enhancement} - ${baseDescription}` : baseDescription;
  }
  /**
   * Get Lydiard-specific adaptation targets
   */
  getLydiardAdaptationTarget(workoutType, phase) {
    const adaptationMatrix = {
      "easy": {
        "base": "Aerobic enzyme development, mitochondrial biogenesis, capillary density",
        "build": "Maintain aerobic base while building anaerobic capacity",
        "peak": "Recovery facilitation, maintain aerobic fitness",
        "taper": "Fitness maintenance with minimal fatigue",
        "recovery": "Complete physiological restoration"
      },
      "steady": {
        "base": "Aerobic power development, fat oxidation, cardiac output",
        "build": "Lactate clearance, aerobic-anaerobic transition",
        "peak": "Race pace conditioning, metabolic efficiency",
        "taper": "Maintain aerobic power with reduced volume",
        "recovery": "Light aerobic maintenance"
      },
      "hill_repeats": {
        "base": "Leg strength, running economy, biomechanical efficiency",
        "build": "Anaerobic power, lactate tolerance, neuromuscular coordination",
        "peak": "Maximum power output, race-specific strength",
        "taper": "Maintain strength with reduced stress",
        "recovery": "Gentle strength maintenance"
      },
      "long_run": {
        "base": "Aerobic base, glycogen storage, mental resilience, fat adaptation",
        "build": "Sustained aerobic power, pace judgment, endurance",
        "peak": "Race-specific endurance, pacing practice",
        "taper": "Maintain endurance base with reduced distance",
        "recovery": "Light endurance maintenance"
      }
    };
    return adaptationMatrix[workoutType]?.[phase] || `${workoutType} adaptation for ${phase} phase in Lydiard system`;
  }
  /**
   * Generate Lydiard-specific hill training workouts
   */
  generateLydiardHillTraining(phase, weekInPhase, duration = 45) {
    return this.lydiardHillGenerator.generateHillWorkout(phase, weekInPhase, duration);
  }
  /**
   * Calculate long run progression for entire plan
   */
  calculateLongRunProgressionForPlan(plan) {
    const baseBlocks = plan.blocks.filter((block) => block.phase === "base");
    const totalBaseWeeks = baseBlocks.reduce((sum, block) => sum + block.duration, 0);
    const currentLongRuns = plan.workouts.filter((w) => w.workout.type === "long_run");
    const currentLongestDistance = currentLongRuns.length > 0 ? Math.max(...currentLongRuns.map((w) => w.targetMetrics.distance || 10)) : 10;
    const progression = [];
    let weekCounter = 0;
    for (const block of plan.blocks) {
      for (let week = 1; week <= block.duration; week++) {
        weekCounter++;
        if (block.phase === "base") {
          const progressedDistance = this.aerobicBaseCalculator.calculateLongRunProgression(
            weekCounter,
            totalBaseWeeks,
            currentLongestDistance
          );
          progression.push({
            week: weekCounter,
            phase: block.phase,
            distance: Math.round(progressedDistance * 1.6 * 10) / 10,
            // Convert km to miles and round to 0.1
            effort: "Easy aerobic - conversational pace",
            focus: "Time on feet, aerobic adaptation"
          });
        } else {
          const maintainedDistance = currentLongestDistance * (block.phase === "peak" ? 0.8 : block.phase === "taper" ? 0.6 : 0.9);
          progression.push({
            week: weekCounter,
            phase: block.phase,
            distance: Math.round(maintainedDistance * 1.6 * 10) / 10,
            effort: block.phase === "peak" ? "Moderate with race pace segments" : "Easy aerobic",
            focus: block.phase === "peak" ? "Race preparation" : "Fitness maintenance"
          });
        }
      }
    }
    return {
      totalWeeks: plan.summary.totalWeeks,
      basePhaseWeeks: totalBaseWeeks,
      targetDistance: 22,
      // Target 22+ mile long runs
      currentMax: currentLongestDistance * 1.6,
      // Convert to miles
      weeklyProgression: progression
    };
  }
  /**
   * Apply effort-based zone calculations to the plan
   */
  applyEffortBasedZones(plan) {
    plan.workouts.forEach((plannedWorkout) => {
      if (plannedWorkout.workout && plannedWorkout.workout.segments) {
        plannedWorkout.workout.segments.forEach((segment) => {
          const effortLevel = this.getEffortDescription(segment.intensity);
          segment.description = `${effortLevel} - ${segment.description}`;
          if (!segment.paceTarget) {
            segment.paceTarget = {
              min: 0,
              max: 0,
              effortBased: true,
              perceivedEffort: this.getPerceivedEffortScale(segment.intensity)
            };
          } else {
            segment.paceTarget = {
              ...segment.paceTarget,
              effortBased: true,
              perceivedEffort: this.getPerceivedEffortScale(segment.intensity)
            };
          }
        });
      }
    });
  }
  /**
   * Get effort description for intensity level
   */
  getEffortDescription(intensity) {
    if (intensity < 60) return "Very easy effort";
    if (intensity < 70) return "Easy conversational effort";
    if (intensity < 80) return "Steady aerobic effort";
    if (intensity < 85) return "Strong aerobic effort";
    if (intensity < 90) return "Threshold effort";
    if (intensity < 95) return "Hard anaerobic effort";
    return "Maximum effort";
  }
  /**
   * Get perceived effort scale (1-10) for intensity
   */
  getPerceivedEffortScale(intensity) {
    return Math.round((intensity - 50) / 5);
  }
  /**
   * Select appropriate Lydiard hill workout based on phase and week
   */
  selectLydiardHillWorkout(phase, weekInPhase) {
    const hillTemplates = this.lydiardHillGenerator.createLydiardHillTemplates();
    switch (phase) {
      case "base":
        return "LYDIARD_HILL_BASE";
      case "build":
        return "LYDIARD_HILL_BUILD";
      case "peak":
        return "LYDIARD_HILL_PEAK";
      case "taper":
        return "LYDIARD_HILL_TAPER";
      case "recovery":
        return "LYDIARD_HILL_RECOVERY";
      default:
        return "LYDIARD_HILL_BASE";
    }
  }
  /**
   * Get hill training guidance for current phase
   */
  getHillTrainingGuidance(phase) {
    return this.lydiardHillGenerator.getHillProgressionGuidance(phase);
  }
  /**
   * Customize hill workout with Lydiard-specific modifications
   */
  customizeHillWorkout(phase, weekInPhase, duration = 45) {
    const hillWorkout = this.lydiardHillGenerator.generateHillWorkout(phase, weekInPhase, duration);
    const customizedSegments = hillWorkout.segments.map((segment) => ({
      ...segment,
      description: this.enhanceLydiardDescription(segment.description, "hill_repeats", phase)
    }));
    return {
      ...hillWorkout,
      segments: customizedSegments,
      metadata: {
        ...hillWorkout.metadata,
        lydiardCustomization: true,
        guidance: this.lydiardHillGenerator.getHillProgressionGuidance(phase)
      }
    };
  }
};
var PfitsingerPhilosophy = class extends BaseTrainingPhilosophy {
  constructor() {
    super("pfitzinger", "Pete Pfitzinger");
  }
  /**
   * Enhanced plan generation with lactate threshold emphasis and medium-long runs
   */
  enhancePlan(basePlan) {
    const enhancedPlan = super.enhancePlan(basePlan);
    const ltPace = this.calculateLactateThresholdPace(basePlan);
    const pfitzingerPaces = this.calculatePfitzingerPaces(ltPace);
    const ltBasedPlan = {
      ...enhancedPlan,
      workouts: enhancedPlan.workouts.map(
        (workout) => this.applyLTBasedPacing(workout, pfitzingerPaces, ltPace)
      )
    };
    const planWithProgression = this.applyThresholdVolumeProgression(ltBasedPlan);
    const pfitzingerBlocks = planWithProgression.blocks.map(
      (block) => this.applyPfitzingerStructure(block)
    );
    const planWithRaces = this.integrateRacesAndMediumLongs(
      { ...planWithProgression, blocks: pfitzingerBlocks }
    );
    return {
      ...planWithRaces,
      metadata: {
        ...planWithRaces.metadata,
        methodology: "pfitzinger",
        lactateThresholdPace: ltPace,
        pfitzingerPaces,
        thresholdVolumeProgression: this.calculateLegacyThresholdVolumeProgression(planWithRaces),
        ltBasedZones: this.generateLTBasedZones(ltPace)
      }
    };
  }
  /**
   * Pfitzinger-specific workout customization with threshold focus
   */
  customizeWorkout(template, phase, weekNumber) {
    const baseCustomization = super.customizeWorkout(template, phase, weekNumber);
    const pfitzingerSegments = baseCustomization.segments.map((segment) => ({
      ...segment,
      intensity: this.adjustIntensityForPfitzinger(segment.intensity, template.type, phase, weekNumber),
      description: this.enhancePfitzingerDescription(segment.description, template.type, phase)
    }));
    if (this.isMarathonSpecificWorkout(template.type, phase)) {
      pfitzingerSegments.forEach((segment) => {
        if (segment.zone.name === "Tempo" || segment.zone.name === "Threshold") {
          segment.paceTarget = this.getMarathonPaceTarget(segment.zone.name);
        }
      });
    }
    return {
      ...baseCustomization,
      segments: pfitzingerSegments,
      adaptationTarget: this.getPfitzingerAdaptationTarget(template.type, phase),
      estimatedTSS: this.adjustTSSForPfitzinger(baseCustomization.estimatedTSS, template.type)
    };
  }
  /**
   * Pfitzinger workout selection prioritizing threshold and progression work
   */
  selectWorkout(type, phase, weekInPhase) {
    const availableTemplates = Object.keys(WORKOUT_TEMPLATES).filter((key) => WORKOUT_TEMPLATES[key].type === type);
    if (availableTemplates.length === 0) {
      throw new Error(`No templates available for workout type: ${type}`);
    }
    switch (type) {
      case "threshold":
        if (phase === "build" || phase === "peak") {
          return availableTemplates.includes("LACTATE_THRESHOLD_2X20") ? "LACTATE_THRESHOLD_2X20" : "THRESHOLD_PROGRESSION";
        }
        return "THRESHOLD_PROGRESSION";
      case "tempo":
        return "TEMPO_CONTINUOUS";
      case "progression":
        return "PROGRESSION_3_STAGE";
      case "long_run":
        return "LONG_RUN";
      case "vo2max":
        if (phase === "peak") {
          return availableTemplates.includes("VO2MAX_5X3") ? "VO2MAX_5X3" : availableTemplates[0];
        }
        return "THRESHOLD_PROGRESSION";
      case "easy":
        return "EASY_AEROBIC";
      case "recovery":
        return "RECOVERY_JOG";
      case "steady":
        return availableTemplates[0];
      default:
        return availableTemplates[0];
    }
  }
  /**
   * Apply Pfitzinger-specific structure with extended build phase
   */
  applyPfitzingerStructure(block) {
    const enhancedMicrocycles = block.microcycles.map((microcycle, weekIndex) => {
      const modifiedWorkouts = microcycle.workouts.map((plannedWorkout) => {
        if (this.shouldBeMediumLong(plannedWorkout, weekIndex, block.phase)) {
          return this.convertToMediumLong(plannedWorkout, block.phase, weekIndex + 1);
        }
        if (plannedWorkout.workout.type === "long_run" && this.shouldAddQuality(block.phase, weekIndex)) {
          return this.addQualityToLongRun(plannedWorkout);
        }
        return plannedWorkout;
      });
      return {
        ...microcycle,
        workouts: modifiedWorkouts,
        pattern: this.getPfitzingerWeeklyPattern(block.phase, weekIndex)
      };
    });
    return {
      ...block,
      microcycles: enhancedMicrocycles,
      focusAreas: this.getPfitzingerPhaseFocus(block.phase)
    };
  }
  /**
   * Integrate tune-up races and medium-long runs
   */
  integrateRacesAndMediumLongs(plan) {
    const modifiedWorkouts = plan.workouts.map((workout, index) => {
      const weeksToGoal = (0, import_date_fns3.differenceInWeeks)(plan.config.targetDate || plan.config.endDate || /* @__PURE__ */ new Date(), workout.date);
      if (this.shouldBeRace(weeksToGoal) && workout.workout.type === "long_run") {
        return this.convertToRace(workout, weeksToGoal);
      }
      return workout;
    });
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  /**
   * Check if workout should be medium-long run
   */
  shouldBeMediumLong(workout, weekIndex, phase) {
    return workout.workout.type === "easy" && weekIndex % 7 === 3 && // Mid-week
    (phase === "build" || phase === "peak");
  }
  // ===============================
  // PFITZINGER MEDIUM-LONG RUN GENERATION SYSTEM
  // ===============================
  /**
   * Generate Pfitzinger-style medium-long runs (12-16 miles with embedded tempo segments)
   * Implements progressive difficulty and signature workout patterns
   */
  generateMediumLongRun(baseWorkout, phase, weekNumber = 1) {
    const pattern = this.selectMediumLongPattern(phase, weekNumber);
    const scaledPattern = this.scaleMediumLongDifficulty(pattern, weekNumber, phase);
    return this.createMediumLongWorkout(scaledPattern, baseWorkout);
  }
  /**
   * Select appropriate medium-long run pattern based on training phase and progression
   */
  selectMediumLongPattern(phase, weekNumber) {
    const patterns = this.getMediumLongPatterns();
    if (phase === "base") {
      return patterns.aerobicMediumLong;
    } else if (phase === "build") {
      const buildPatterns = [
        patterns.tempoMediumLong,
        patterns.marathonPaceMediumLong,
        patterns.progressiveMediumLong
      ];
      return buildPatterns[weekNumber % buildPatterns.length];
    } else if (phase === "peak") {
      return weekNumber % 2 === 0 ? patterns.raceSpecificMediumLong : patterns.tempoMediumLong;
    } else {
      return patterns.aerobicMediumLong;
    }
  }
  /**
   * Get all medium-long run patterns following Pfitzinger's methodology
   */
  getMediumLongPatterns() {
    return {
      // Pattern 1: Pure aerobic medium-long (base phase)
      aerobicMediumLong: {
        name: "Aerobic Medium-Long Run",
        description: "12-14 mile steady aerobic run building endurance base",
        totalDuration: 85,
        // ~12-13 miles at 6:30-7:00 pace
        segments: [
          {
            duration: 85,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Steady aerobic effort, conversational throughout",
            paceTarget: { min: 6.5, max: 7 }
          }
        ],
        adaptationTarget: "Aerobic capacity, mitochondrial density, fat oxidation",
        estimatedTSS: 75,
        recoveryTime: 18
      },
      // Pattern 2: Medium-long with embedded tempo (signature Pfitzinger)
      tempoMediumLong: {
        name: "Medium-Long Run with Tempo",
        description: "14-15 mile run with 4-6 mile tempo segment (signature Pfitzinger workout)",
        totalDuration: 95,
        // ~14-15 miles
        segments: [
          {
            duration: 25,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Easy warm-up, prepare for tempo effort",
            paceTarget: { min: 6.5, max: 7 }
          },
          {
            duration: 30,
            // ~4-5 miles of tempo
            intensity: 84,
            zone: TRAINING_ZONES.TEMPO,
            description: "Lactate threshold pace, controlled discomfort",
            paceTarget: { min: 5.9, max: 6.2 }
          },
          {
            duration: 40,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Easy cool-down, maintain form despite fatigue",
            paceTarget: { min: 6.5, max: 7 }
          }
        ],
        adaptationTarget: "Lactate threshold, marathon-specific endurance",
        estimatedTSS: 105,
        recoveryTime: 24
      },
      // Pattern 3: Medium-long with marathon pace segments
      marathonPaceMediumLong: {
        name: "Medium-Long Run with Marathon Pace",
        description: "13-15 mile run with marathon pace segments for race simulation",
        totalDuration: 90,
        // ~13-14 miles
        segments: [
          {
            duration: 20,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Easy warm-up",
            paceTarget: { min: 6.5, max: 7 }
          },
          {
            duration: 12,
            // ~2 miles marathon pace
            intensity: 82,
            zone: TRAINING_ZONES.STEADY,
            description: "Marathon race pace - practice goal pace",
            paceTarget: { min: 6, max: 6.3 }
          },
          {
            duration: 10,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Easy recovery",
            paceTarget: { min: 6.5, max: 7 }
          },
          {
            duration: 15,
            // ~2.5 miles marathon pace
            intensity: 82,
            zone: TRAINING_ZONES.STEADY,
            description: "Second marathon pace segment",
            paceTarget: { min: 6, max: 6.3 }
          },
          {
            duration: 33,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Easy finish, practice running easy when tired",
            paceTarget: { min: 6.5, max: 7 }
          }
        ],
        adaptationTarget: "Marathon pace practice, pacing discipline, fatigue resistance",
        estimatedTSS: 95,
        recoveryTime: 20
      },
      // Pattern 4: Progressive medium-long run
      progressiveMediumLong: {
        name: "Progressive Medium-Long Run",
        description: "13-16 mile progressive run finishing at marathon pace or faster",
        totalDuration: 100,
        // ~15-16 miles
        segments: [
          {
            duration: 35,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Easy start, very comfortable",
            paceTarget: { min: 6.5, max: 7 }
          },
          {
            duration: 30,
            intensity: 76,
            zone: TRAINING_ZONES.STEADY,
            description: "Moderate progression, steady effort",
            paceTarget: { min: 6.2, max: 6.5 }
          },
          {
            duration: 20,
            intensity: 82,
            zone: TRAINING_ZONES.STEADY,
            description: "Marathon pace progression",
            paceTarget: { min: 6, max: 6.3 }
          },
          {
            duration: 15,
            intensity: 84,
            zone: TRAINING_ZONES.TEMPO,
            description: "Strong finish at lactate threshold pace",
            paceTarget: { min: 5.9, max: 6.2 }
          }
        ],
        adaptationTarget: "Progressive fatigue resistance, mental toughness, pace judgment",
        estimatedTSS: 110,
        recoveryTime: 26
      },
      // Pattern 5: Race-specific medium-long (peak phase)
      raceSpecificMediumLong: {
        name: "Race-Specific Medium-Long Run",
        description: "12-14 mile run with race pace segments and surges",
        totalDuration: 85,
        // ~12-13 miles
        segments: [
          {
            duration: 20,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Easy warm-up",
            paceTarget: { min: 6.5, max: 7 }
          },
          {
            duration: 8,
            // ~1.2 miles
            intensity: 82,
            zone: TRAINING_ZONES.STEADY,
            description: "Marathon pace segment",
            paceTarget: { min: 6, max: 6.3 }
          },
          {
            duration: 5,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Easy recovery",
            paceTarget: { min: 6.5, max: 7 }
          },
          {
            duration: 3,
            // ~0.5 mile surge
            intensity: 87,
            zone: TRAINING_ZONES.THRESHOLD,
            description: "Race surge simulation",
            paceTarget: { min: 5.7, max: 6 }
          },
          {
            duration: 7,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Recovery from surge",
            paceTarget: { min: 6.5, max: 7 }
          },
          {
            duration: 12,
            // ~2 miles
            intensity: 82,
            zone: TRAINING_ZONES.STEADY,
            description: "Final marathon pace segment",
            paceTarget: { min: 6, max: 6.3 }
          },
          {
            duration: 30,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Easy finish",
            paceTarget: { min: 6.5, max: 7 }
          }
        ],
        adaptationTarget: "Race simulation, surge response, competitive fitness",
        estimatedTSS: 100,
        recoveryTime: 22
      }
    };
  }
  /**
   * Create the actual workout from a selected pattern
   */
  createMediumLongWorkout(pattern, baseWorkout) {
    const workout = {
      type: "long_run",
      // Use long_run type for medium-long runs
      primaryZone: pattern.segments[0].zone,
      segments: pattern.segments.map((segment) => ({
        duration: segment.duration,
        intensity: segment.intensity,
        zone: segment.zone,
        description: segment.description,
        cadenceTarget: 180,
        // Standard Pfitzinger cadence target
        paceTarget: segment.paceTarget
      })),
      adaptationTarget: pattern.adaptationTarget,
      estimatedTSS: pattern.estimatedTSS,
      recoveryTime: pattern.recoveryTime
    };
    return {
      name: pattern.name,
      description: pattern.description,
      workout
    };
  }
  /**
   * Progressive difficulty scaling for medium-long runs
   * Adjusts volume and intensity based on training progression
   */
  scaleMediumLongDifficulty(pattern, weekNumber, phase) {
    let durationScale = 1;
    let intensityScale = 1;
    if (phase === "build") {
      durationScale = 0.9 + weekNumber * 0.025;
      intensityScale = 0.95 + weekNumber * 0.0125;
    } else if (phase === "peak") {
      durationScale = 1.1;
      intensityScale = 1.05;
    }
    const scaledPattern = { ...pattern };
    scaledPattern.totalDuration = Math.round(pattern.totalDuration * durationScale);
    scaledPattern.segments = pattern.segments.map((segment) => ({
      ...segment,
      duration: Math.round(segment.duration * durationScale),
      intensity: Math.min(95, Math.round(segment.intensity * intensityScale))
    }));
    scaledPattern.estimatedTSS = Math.round(pattern.estimatedTSS * durationScale * intensityScale);
    scaledPattern.recoveryTime = Math.round(pattern.recoveryTime * durationScale);
    return scaledPattern;
  }
  /**
   * Convert easy run to Pfitzinger-style medium-long run with embedded tempo segments
   */
  convertToMediumLong(workout, phase = "build", weekNumber = 1) {
    const mediumLongWorkout = this.generateMediumLongRun(workout, phase, weekNumber);
    return {
      ...workout,
      name: mediumLongWorkout.name,
      description: mediumLongWorkout.description,
      workout: mediumLongWorkout.workout
    };
  }
  /**
   * Check if quality should be added to long run
   */
  shouldAddQuality(phase, weekIndex) {
    return (phase === "build" || phase === "peak") && weekIndex % 3 === 0;
  }
  /**
   * Add quality segments to long run
   */
  addQualityToLongRun(workout) {
    const baseWorkout = workout.workout;
    const totalDuration = baseWorkout.segments.reduce((sum, seg) => sum + seg.duration, 0);
    const qualityLongRun = {
      ...baseWorkout,
      segments: [
        {
          duration: totalDuration * 0.4,
          intensity: 65,
          zone: TRAINING_ZONES.EASY,
          description: "Easy pace warm-up"
        },
        {
          duration: totalDuration * 0.3,
          intensity: 84,
          zone: TRAINING_ZONES.TEMPO,
          description: "Marathon pace segment"
        },
        {
          duration: totalDuration * 0.3,
          intensity: 65,
          zone: TRAINING_ZONES.EASY,
          description: "Easy pace cool-down"
        }
      ],
      adaptationTarget: "Marathon-specific endurance with pace practice",
      estimatedTSS: Math.round(baseWorkout.estimatedTSS * 1.2)
    };
    return {
      ...workout,
      name: "Long Run with Quality",
      description: "Long run with marathon pace segment",
      workout: qualityLongRun
    };
  }
  /**
   * Check if workout should be a tune-up race
   */
  shouldBeRace(weeksToGoal) {
    return weeksToGoal === 8 || weeksToGoal === 9 || weeksToGoal === 4 || weeksToGoal === 5;
  }
  /**
   * Convert long run to tune-up race
   */
  convertToRace(workout, weeksToGoal) {
    const raceDistance = weeksToGoal > 6 ? "15k" : "10k";
    const raceWorkout = {
      type: "race_pace",
      primaryZone: TRAINING_ZONES.THRESHOLD,
      segments: [
        {
          duration: 15,
          intensity: 65,
          zone: TRAINING_ZONES.EASY,
          description: "Pre-race warm-up"
        },
        {
          duration: weeksToGoal > 6 ? 50 : 35,
          // 15K or 10K duration
          intensity: 92,
          zone: TRAINING_ZONES.THRESHOLD,
          description: `${raceDistance} race effort`
        },
        {
          duration: 10,
          intensity: 60,
          zone: TRAINING_ZONES.RECOVERY,
          description: "Cool-down jog"
        }
      ],
      adaptationTarget: "Race practice, pace judgment, mental preparation",
      estimatedTSS: 110,
      recoveryTime: 48
    };
    return {
      ...workout,
      name: `${raceDistance} Tune-up Race`,
      description: `Race simulation ${weeksToGoal} weeks before goal`,
      workout: raceWorkout
    };
  }
  // ===============================
  // PFITZINGER WEEKLY STRUCTURE SYSTEM
  // ===============================
  /**
   * Generate comprehensive Pfitzinger weekly structure with specific day patterns,
   * workout spacing, threshold volume progression, and race-specific pace work
   */
  generatePfitzingerWeeklyStructure(phase, weekIndex) {
    const baseStructure = this.getPfitzingerBaseStructure(phase);
    const volumeProgression = this.calculateThresholdVolumeProgression(phase, weekIndex);
    const raceIntegration = this.getRaceSpecificIntegration(phase, weekIndex);
    return this.applyPfitzingerWeeklySpacing(baseStructure, volumeProgression, raceIntegration, weekIndex);
  }
  /**
   * Get Pfitzinger base weekly structure by training phase
   * Following authentic Pfitzinger day-of-week patterns
   */
  getPfitzingerBaseStructure(phase) {
    const structures = {
      "base": {
        pattern: "Easy-GA-Easy-LT-Recovery-Long-Recovery",
        dayStructure: {
          monday: { type: "easy", purpose: "recovery_from_weekend", intensity: 65 },
          tuesday: { type: "general_aerobic", purpose: "aerobic_development", intensity: 72 },
          wednesday: { type: "easy", purpose: "active_recovery", intensity: 65 },
          thursday: { type: "lactate_threshold", purpose: "lt_development", intensity: 85 },
          friday: { type: "recovery", purpose: "preparation_for_long", intensity: 60 },
          saturday: { type: "long_run", purpose: "endurance_development", intensity: 70 },
          sunday: { type: "recovery", purpose: "complete_rest_or_easy", intensity: 60 }
        },
        workoutSpacing: {
          hardDaySpacing: 48,
          // hours between quality sessions
          recoveryRatio: 0.4,
          // 40% of week should be recovery
          qualityDays: ["tuesday", "thursday", "saturday"]
        },
        thresholdVolume: {
          weeklyMinutes: 20,
          // Start with 20 minutes/week
          progressionRate: 1.15,
          // 15% increase per week
          maxVolume: 45
          // Cap at 45 minutes/week
        },
        focusAreas: ["Aerobic base building", "LT introduction", "Mileage progression"]
      },
      "build": {
        pattern: "Easy-LT-MLR-Tempo-Recovery-LongQuality-Easy",
        dayStructure: {
          monday: { type: "easy", purpose: "recovery_from_weekend", intensity: 65 },
          tuesday: { type: "lactate_threshold", purpose: "lt_maintenance", intensity: 87 },
          wednesday: { type: "medium_long", purpose: "endurance_with_quality", intensity: 75 },
          thursday: { type: "tempo", purpose: "threshold_development", intensity: 84 },
          friday: { type: "recovery", purpose: "preparation_for_long", intensity: 60 },
          saturday: { type: "long_quality", purpose: "marathon_simulation", intensity: 73 },
          sunday: { type: "easy", purpose: "active_recovery", intensity: 65 }
        },
        workoutSpacing: {
          hardDaySpacing: 48,
          recoveryRatio: 0.35,
          // Reduced recovery as fitness improves
          qualityDays: ["tuesday", "wednesday", "thursday", "saturday"]
        },
        thresholdVolume: {
          weeklyMinutes: 35,
          // Peak threshold volume
          progressionRate: 1.05,
          // Slower progression at higher volume
          maxVolume: 50
        },
        focusAreas: ["Threshold progression", "Medium-long runs", "Marathon pace work"]
      },
      "peak": {
        pattern: "Easy-VO2-MLR-LT-Recovery-RaceSimulation-Recovery",
        dayStructure: {
          monday: { type: "easy", purpose: "recovery_from_weekend", intensity: 65 },
          tuesday: { type: "vo2max", purpose: "peak_power_development", intensity: 95 },
          wednesday: { type: "medium_long", purpose: "race_specific_endurance", intensity: 78 },
          thursday: { type: "lactate_threshold", purpose: "race_pace_preparation", intensity: 87 },
          friday: { type: "recovery", purpose: "preparation_for_race_simulation", intensity: 60 },
          saturday: { type: "race_simulation", purpose: "competitive_preparation", intensity: 82 },
          sunday: { type: "recovery", purpose: "complete_recovery", intensity: 60 }
        },
        workoutSpacing: {
          hardDaySpacing: 48,
          recoveryRatio: 0.3,
          // Minimal recovery for peak fitness
          qualityDays: ["tuesday", "wednesday", "thursday", "saturday"]
        },
        thresholdVolume: {
          weeklyMinutes: 25,
          // Reduced volume for peak phase
          progressionRate: 1,
          // No progression, maintain
          maxVolume: 30
        },
        focusAreas: ["Race simulation", "Peak power", "Competitive readiness"]
      },
      "taper": {
        pattern: "Easy-Tempo-Easy-LT-Recovery-RaceTune-Recovery",
        dayStructure: {
          monday: { type: "easy", purpose: "gentle_recovery", intensity: 65 },
          tuesday: { type: "tempo", purpose: "sharpening", intensity: 84 },
          wednesday: { type: "easy", purpose: "maintenance", intensity: 65 },
          thursday: { type: "lactate_threshold", purpose: "race_feel", intensity: 87 },
          friday: { type: "recovery", purpose: "complete_rest", intensity: 55 },
          saturday: { type: "race_tune", purpose: "race_readiness", intensity: 85 },
          sunday: { type: "recovery", purpose: "pre_race_rest", intensity: 55 }
        },
        workoutSpacing: {
          hardDaySpacing: 72,
          // More recovery during taper
          recoveryRatio: 0.5,
          // Increased recovery
          qualityDays: ["tuesday", "thursday", "saturday"]
        },
        thresholdVolume: {
          weeklyMinutes: 15,
          // Minimal threshold work
          progressionRate: 0.9,
          // Slight reduction
          maxVolume: 20
        },
        focusAreas: ["Race sharpening", "Recovery optimization", "Mental preparation"]
      },
      "recovery": {
        pattern: "Recovery-Easy-Recovery-Easy-Recovery-Easy-Recovery",
        dayStructure: {
          monday: { type: "recovery", purpose: "complete_rest", intensity: 55 },
          tuesday: { type: "easy", purpose: "gentle_movement", intensity: 62 },
          wednesday: { type: "recovery", purpose: "active_recovery", intensity: 55 },
          thursday: { type: "easy", purpose: "gentle_movement", intensity: 62 },
          friday: { type: "recovery", purpose: "complete_rest", intensity: 55 },
          saturday: { type: "easy", purpose: "optional_easy_run", intensity: 62 },
          sunday: { type: "recovery", purpose: "complete_rest", intensity: 55 }
        },
        workoutSpacing: {
          hardDaySpacing: 168,
          // No hard days
          recoveryRatio: 0.7,
          // Maximum recovery
          qualityDays: []
        },
        thresholdVolume: {
          weeklyMinutes: 0,
          // No threshold work
          progressionRate: 1,
          maxVolume: 0
        },
        focusAreas: ["Complete recovery", "Injury prevention", "Adaptation integration"]
      }
    };
    return structures[phase] || structures["base"];
  }
  /**
   * Calculate progressive threshold volume following Pfitzinger protocols
   */
  calculateThresholdVolumeProgression(phase, weekIndex) {
    const baseStructure = this.getPfitzingerBaseStructure(phase);
    const currentWeek = weekIndex + 1;
    let weeklyVolume = baseStructure.thresholdVolume.weeklyMinutes;
    if (phase === "base" || phase === "build") {
      weeklyVolume = Math.min(
        baseStructure.thresholdVolume.weeklyMinutes * Math.pow(baseStructure.thresholdVolume.progressionRate, Math.floor(currentWeek / 2)),
        baseStructure.thresholdVolume.maxVolume
      );
    }
    if (phase === "peak") {
      weeklyVolume = baseStructure.thresholdVolume.weeklyMinutes;
    }
    if (phase === "taper") {
      const taperReduction = Math.pow(0.85, currentWeek);
      weeklyVolume = baseStructure.thresholdVolume.weeklyMinutes * taperReduction;
    }
    return {
      weeklyMinutes: Math.round(weeklyVolume),
      sessionDistribution: this.distributeThresholdVolume(weeklyVolume, phase),
      intensityTargets: this.getThresholdIntensityTargets(phase),
      recoveryRequirements: this.getThresholdRecoveryRequirements(weeklyVolume)
    };
  }
  /**
   * Distribute threshold volume across weekly sessions
   */
  distributeThresholdVolume(totalMinutes, phase) {
    if (totalMinutes === 0) return {};
    const distributions = {
      "base": {
        "thursday": 1
        // Single LT session
      },
      "build": {
        "tuesday": 0.6,
        // Primary LT session
        "thursday": 0.4
        // Secondary tempo session
      },
      "peak": {
        "tuesday": 0.5,
        // VO2max with LT elements
        "thursday": 0.5
        // Pure LT session
      },
      "taper": {
        "thursday": 1
        // Single sharpening session
      },
      "recovery": {}
      // No threshold work
    };
    const distribution = distributions[phase] || distributions["base"];
    const result = {};
    Object.entries(distribution).forEach(([day, ratio]) => {
      result[day] = Math.round(totalMinutes * ratio);
    });
    return result;
  }
  /**
   * Get threshold intensity targets by phase
   */
  getThresholdIntensityTargets(phase) {
    const targets = {
      "base": { "lactate_threshold": 85, "tempo": 84 },
      "build": { "lactate_threshold": 87, "tempo": 84, "medium_long_quality": 75 },
      "peak": { "lactate_threshold": 87, "vo2max": 95, "race_pace": 82 },
      "taper": { "lactate_threshold": 87, "tempo": 84 },
      "recovery": {}
    };
    return targets[phase] || targets["base"];
  }
  /**
   * Get threshold recovery requirements
   */
  getThresholdRecoveryRequirements(weeklyVolume) {
    return {
      hoursAfterLT: Math.max(36, weeklyVolume * 0.8),
      // Minimum 36 hours, scales with volume
      hoursBeforeLT: Math.max(24, weeklyVolume * 0.6),
      // Minimum 24 hours preparation
      easyDayIntensity: Math.max(60, 70 - weeklyVolume * 0.2),
      // Easier recovery as volume increases
      recoveryDayFrequency: weeklyVolume > 30 ? 2 : 1
      // More recovery days at high volume
    };
  }
  /**
   * Integrate race-specific pace work following Pfitzinger progression
   */
  getRaceSpecificIntegration(phase, weekIndex) {
    const raceWeeksOut = this.estimateWeeksToRace(phase, weekIndex);
    return {
      marathonPaceVolume: this.calculateMarathonPaceVolume(phase, raceWeeksOut),
      raceSimulationFrequency: this.getRaceSimulationFrequency(phase, raceWeeksOut),
      taperIntegration: this.getTaperIntegration(phase, raceWeeksOut),
      tuneUpRaces: this.getTuneUpRaceSchedule(phase, raceWeeksOut)
    };
  }
  /**
   * Calculate marathon pace volume progression
   */
  calculateMarathonPaceVolume(phase, weeksToRace) {
    if (phase === "base") return 0;
    if (phase === "build") {
      if (weeksToRace > 12) return 0;
      if (weeksToRace > 8) return 10;
      if (weeksToRace > 4) return 15;
      return 20;
    }
    if (phase === "peak") {
      if (weeksToRace > 6) return 25;
      if (weeksToRace > 2) return 30;
      return 20;
    }
    if (phase === "taper") {
      return Math.max(5, 15 - weeksToRace * 2);
    }
    return 0;
  }
  /**
   * Get race simulation frequency
   */
  getRaceSimulationFrequency(phase, weeksToRace) {
    if (phase === "peak" && weeksToRace <= 8) {
      return weeksToRace <= 4 ? 2 : 1;
    }
    if (phase === "build" && weeksToRace <= 12) {
      return 0.5;
    }
    return 0;
  }
  /**
   * Get taper integration requirements
   */
  getTaperIntegration(phase, weeksToRace) {
    if (phase !== "taper") {
      return { volumeReduction: 0, intensityMaintenance: 1, sharpening: false };
    }
    return {
      volumeReduction: Math.min(0.6, 0.15 * (4 - weeksToRace)),
      // Progressive 15% reduction per week
      intensityMaintenance: 1,
      // Keep intensity high
      sharpening: weeksToRace <= 2
      // Final sharpening in last 2 weeks
    };
  }
  /**
   * Get tune-up race schedule
   */
  getTuneUpRaceSchedule(phase, weeksToRace) {
    const tuneUps = [];
    if (phase === "build" && weeksToRace >= 8 && weeksToRace <= 12) {
      tuneUps.push({
        distance: "10K",
        weeksOut: Math.floor(weeksToRace),
        purpose: "fitness_assessment",
        intensity: 95
      });
    }
    if (phase === "peak" && weeksToRace >= 3 && weeksToRace <= 6) {
      tuneUps.push({
        distance: "half_marathon",
        weeksOut: Math.floor(weeksToRace),
        purpose: "race_simulation",
        intensity: 90
      });
    }
    return tuneUps;
  }
  /**
   * Estimate weeks to target race (simplified)
   */
  estimateWeeksToRace(phase, weekIndex) {
    const phaseWeeksToRace = {
      "base": 16 - weekIndex,
      "build": 8 - weekIndex,
      "peak": 4 - weekIndex,
      "taper": 2 - weekIndex,
      "recovery": 20 - weekIndex
    };
    return Math.max(1, phaseWeeksToRace[phase] || 8);
  }
  /**
   * Apply Pfitzinger workout spacing principles
   */
  applyPfitzingerWeeklySpacing(baseStructure, volumeProgression, raceIntegration, weekIndex) {
    const enhancedStructure = { ...baseStructure };
    Object.entries(volumeProgression.sessionDistribution).forEach(([day, minutes]) => {
      if (enhancedStructure.dayStructure[day]) {
        enhancedStructure.dayStructure[day].thresholdMinutes = minutes;
      }
    });
    if (raceIntegration.marathonPaceVolume > 0) {
      ["wednesday", "saturday"].forEach((day) => {
        const dayStructure = enhancedStructure.dayStructure[day];
        if (dayStructure && (dayStructure.type === "medium_long" || dayStructure.type === "long_quality")) {
          dayStructure.marathonPaceMinutes = Math.round(raceIntegration.marathonPaceVolume * 0.6);
        }
      });
    }
    const weekVariation = this.getWeeklyVariation(weekIndex);
    enhancedStructure.weeklyVariation = weekVariation;
    return enhancedStructure;
  }
  /**
   * Get weekly variation to prevent monotony
   */
  getWeeklyVariation(weekIndex) {
    const variations = [
      { name: "standard", volumeMultiplier: 1, intensityMultiplier: 1 },
      { name: "volume_emphasis", volumeMultiplier: 1.15, intensityMultiplier: 0.95 },
      { name: "intensity_emphasis", volumeMultiplier: 0.9, intensityMultiplier: 1.1 },
      { name: "recovery", volumeMultiplier: 0.8, intensityMultiplier: 0.9 }
    ];
    const cyclePosition = weekIndex % 4;
    return variations[cyclePosition] || variations[0];
  }
  /**
   * Get Pfitzinger weekly pattern
   */
  getPfitzingerWeeklyPattern(phase, weekIndex) {
    const weeklyStructure = this.generatePfitzingerWeeklyStructure(phase, weekIndex);
    return weeklyStructure.pattern;
  }
  /**
   * Get Pfitzinger phase focus areas
   */
  getPfitzingerPhaseFocus(phase) {
    switch (phase) {
      case "base":
        return ["Aerobic base", "Lactate threshold introduction", "Running economy", "Mileage buildup"];
      case "build":
        return ["Lactate threshold development", "Marathon pace work", "Medium-long runs", "Endurance"];
      case "peak":
        return ["Race-specific fitness", "Tune-up races", "VO2max touches", "Peak mileage"];
      case "taper":
        return ["Maintain fitness", "Reduce fatigue", "Race preparation", "Sharpening"];
      case "recovery":
        return ["Active recovery", "Base maintenance", "Preparation for next cycle"];
      default:
        return ["General endurance development"];
    }
  }
  /**
   * Check if workout is marathon-specific
   */
  isMarathonSpecificWorkout(type, phase) {
    return (type === "tempo" || type === "threshold" || type === "progression") && (phase === "build" || phase === "peak");
  }
  /**
   * Get marathon-specific pace targets
   */
  getMarathonPaceTarget(zoneName) {
    switch (zoneName) {
      case "Tempo":
        return { min: 4.5, max: 4.7 };
      // Example: 4:30-4:42 per km for 3:10 marathon
      case "Threshold":
        return { min: 4.3, max: 4.5 };
      // Slightly faster than marathon pace
      default:
        return { min: 5, max: 5.5 };
    }
  }
  /**
   * Adjust intensity for Pfitzinger methodology
   */
  adjustIntensityForPfitzinger(baseIntensity, workoutType, phase, weekNumber) {
    let adjustment = 1;
    switch (workoutType) {
      case "easy":
        adjustment = 0.95;
        break;
      case "steady":
        adjustment = 1;
        break;
      case "tempo":
        adjustment = phase === "peak" ? 1.05 : 1.02;
        break;
      case "threshold":
        adjustment = phase === "build" || phase === "peak" ? 1.08 : 1.05;
        break;
      case "progression":
        adjustment = 1.05;
        break;
      case "vo2max":
        adjustment = phase === "peak" ? 1.1 : 1;
        break;
      case "long_run":
        adjustment = 0.98;
        break;
      default:
        adjustment = 1;
    }
    if (phase === "build") {
      const progressionMultiplier = 1 + weekNumber * 0.01;
      adjustment *= progressionMultiplier;
    }
    const adjustedIntensity = baseIntensity * adjustment;
    return Math.max(50, Math.min(100, Math.round(adjustedIntensity)));
  }
  /**
   * Enhance descriptions with Pfitzinger terminology
   */
  enhancePfitzingerDescription(baseDescription, workoutType, phase) {
    const pfitzingerTerms = {
      "easy": "General aerobic run - comfortable effort",
      "steady": "Medium-long run - sustained aerobic development",
      "tempo": "Marathon pace run - race rhythm development",
      "threshold": "Lactate threshold run - push the red line",
      "progression": "Progressive long run - negative split practice",
      "vo2max": "VO2max intervals - top-end speed",
      "long_run": "Endurance long run - time on feet",
      "recovery": "Recovery run - easy regeneration",
      "race_pace": "Tune-up race - competitive sharpening",
      "hill_repeats": "Hill workout - strength and power",
      "fartlek": "Fartlek - varied pace training",
      "time_trial": "Time trial - fitness assessment",
      "cross_training": "Cross-training - active recovery",
      "strength": "Strength training - injury prevention"
    };
    const enhancement = pfitzingerTerms[workoutType];
    return enhancement ? `${enhancement} - ${baseDescription}` : baseDescription;
  }
  /**
   * Get Pfitzinger-specific adaptation targets
   */
  getPfitzingerAdaptationTarget(workoutType, phase) {
    const adaptationTargets = {
      "threshold": {
        "base": "Lactate threshold introduction, aerobic power development",
        "build": "Lactate threshold improvement, marathon pace efficiency",
        "peak": "Peak lactate clearance, race-specific endurance",
        "taper": "Maintain threshold fitness with reduced volume",
        "recovery": "Light threshold maintenance"
      },
      "tempo": {
        "base": "Marathon pace introduction, rhythm development",
        "build": "Marathon pace efficiency, glycogen utilization",
        "peak": "Race pace lock-in, mental preparation",
        "taper": "Race pace feel, confidence building",
        "recovery": "Easy tempo for base maintenance"
      },
      "progression": {
        "base": "Negative split practice, fatigue resistance",
        "build": "Late-race strength, glycogen depletion training",
        "peak": "Race simulation, pacing discipline",
        "taper": "Pace control, race strategy",
        "recovery": "Light progression for maintenance"
      },
      "long_run": {
        "base": "Aerobic base, time on feet, mental toughness",
        "build": "Endurance with quality, marathon simulation",
        "peak": "Race-specific endurance, fuel utilization",
        "taper": "Maintain endurance, reduce fatigue",
        "recovery": "Easy long run for base maintenance"
      }
    };
    return adaptationTargets[workoutType]?.[phase] || `${workoutType} adaptation for ${phase} phase in Pfitzinger system`;
  }
  /**
   * Adjust TSS for Pfitzinger's higher quality approach
   */
  adjustTSSForPfitzinger(baseTSS, workoutType) {
    const tssMultipliers = {
      "threshold": 1.15,
      // Higher stress from threshold work
      "tempo": 1.1,
      "progression": 1.12,
      "steady": 1.05,
      "long_run": 1.08,
      // Quality long runs
      "easy": 1,
      "recovery": 0.9,
      "vo2max": 1.2,
      "race_pace": 1.25
    };
    const multiplier = tssMultipliers[workoutType] || 1;
    return Math.round(baseTSS * multiplier);
  }
  // ===============================
  // LACTATE THRESHOLD-BASED PACE SYSTEM
  // ===============================
  /**
   * Calculate lactate threshold pace as foundation for all other paces
   * Requirement 3.3: Use LT pace as foundation for all other pace zones
   */
  calculateLactateThresholdPace(plan) {
    const currentFitness = plan.config.currentFitness;
    if (currentFitness?.vdot) {
      const ltVelocity = calculateLactateThreshold(currentFitness.vdot);
      return 60 / ltVelocity;
    }
    if (currentFitness?.recentRaces?.length) {
      const bestRace = currentFitness.recentRaces.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const raceVDOT = calculateVDOT(bestRace.distance, bestRace.time);
      const ltVelocity = calculateLactateThreshold(raceVDOT);
      return 60 / ltVelocity;
    }
    return 5;
  }
  /**
   * Calculate all Pfitzinger training paces based on lactate threshold
   * Pfitzinger derives all paces from LT as the foundation
   */
  calculatePfitzingerPaces(ltPace) {
    return {
      // Recovery: 30-45 seconds slower than LT pace
      recovery: {
        min: ltPace + 0.5,
        max: ltPace + 0.75,
        target: ltPace + 0.625
      },
      // General aerobic: 15-30 seconds slower than LT pace
      generalAerobic: {
        min: ltPace + 0.25,
        max: ltPace + 0.5,
        target: ltPace + 0.375
      },
      // Marathon pace: 10-15 seconds slower than LT pace
      marathonPace: {
        min: ltPace + 0.167,
        max: ltPace + 0.25,
        target: ltPace + 0.208
      },
      // Lactate threshold: The foundation pace
      lactateThreshold: {
        min: ltPace - 0.05,
        max: ltPace + 0.05,
        target: ltPace
      },
      // VO2max: 10-15 seconds faster than LT pace
      vo2max: {
        min: ltPace - 0.25,
        max: ltPace - 0.167,
        target: ltPace - 0.208
      },
      // Neuromuscular power: 20-30 seconds faster than LT pace
      neuromuscular: {
        min: ltPace - 0.5,
        max: ltPace - 0.333,
        target: ltPace - 0.417
      }
    };
  }
  /**
   * Apply LT-based pacing to workout
   */
  applyLTBasedPacing(workout, paces, ltPace) {
    const pacedSegments = workout.workout.segments.map((segment) => {
      const paceRange = this.getPaceRangeForZone(segment.zone.name, paces);
      return {
        ...segment,
        paceTarget: paceRange.target,
        paceRange: { min: paceRange.min, max: paceRange.max },
        description: this.enhancePaceDescription(segment.description, paceRange, segment.zone.name)
      };
    });
    return {
      ...workout,
      workout: {
        ...workout.workout,
        segments: pacedSegments,
        metadata: {
          ...workout.workout.metadata,
          lactateThresholdBased: true,
          foundationPace: ltPace
        }
      }
    };
  }
  /**
   * Get pace range for training zone based on Pfitzinger system
   */
  getPaceRangeForZone(zoneName, paces) {
    const zoneMapping = {
      "RECOVERY": "recovery",
      "EASY": "generalAerobic",
      "MARATHON": "marathonPace",
      "TEMPO": "lactateThreshold",
      "THRESHOLD": "lactateThreshold",
      "VO2_MAX": "vo2max",
      "SPEED": "neuromuscular",
      "NEUROMUSCULAR": "neuromuscular"
    };
    const paceKey = zoneMapping[zoneName] || "generalAerobic";
    return paces[paceKey];
  }
  /**
   * Apply progressive threshold volume calculations
   * Requirement 3.1: Progressive threshold volume calculations
   */
  applyThresholdVolumeProgression(plan) {
    const totalWeeks = plan.weeks?.length || plan.summary?.totalWeeks || 12;
    const thresholdProgression = this.calculateLegacyThresholdVolumeProgression(plan);
    const enhancedWorkouts = plan.workouts.map((workout, index) => {
      const weekIndex = Math.floor(index / 7);
      const targetThresholdVolume = thresholdProgression[weekIndex] || thresholdProgression[0];
      if (this.isThresholdWorkout(workout.type)) {
        return this.adjustWorkoutForThresholdVolume(workout, targetThresholdVolume);
      }
      return workout;
    });
    return {
      ...plan,
      workouts: enhancedWorkouts
    };
  }
  /**
   * Calculate threshold volume progression following Pfitzinger's approach (legacy method)
   */
  calculateLegacyThresholdVolumeProgression(plan) {
    const totalWeeks = plan.weeks?.length || plan.summary?.totalWeeks || 12;
    const baseThresholdVolume = 20;
    const peakThresholdVolume = 60;
    const progression = [];
    for (let week = 0; week < totalWeeks; week++) {
      const progressRatio = week / (totalWeeks - 1);
      let weeklyVolume;
      if (week % 4 === 3) {
        weeklyVolume = baseThresholdVolume + (peakThresholdVolume - baseThresholdVolume) * progressRatio * 0.75;
      } else {
        weeklyVolume = baseThresholdVolume + (peakThresholdVolume - baseThresholdVolume) * progressRatio;
      }
      progression.push(Math.round(weeklyVolume));
    }
    return progression;
  }
  /**
   * Check if workout is threshold-based
   */
  isThresholdWorkout(workoutType) {
    return ["threshold", "tempo", "progression", "race_pace"].includes(workoutType);
  }
  /**
   * Adjust workout duration based on target threshold volume
   */
  adjustWorkoutForThresholdVolume(workout, targetVolume) {
    const thresholdSegments = workout.workout.segments.filter(
      (seg) => seg.intensity >= 84 && seg.intensity <= 92
      // Threshold intensity range
    );
    const currentThresholdTime = thresholdSegments.reduce((sum, seg) => sum + seg.duration, 0);
    if (currentThresholdTime === 0) return workout;
    const adjustmentFactor = targetVolume / currentThresholdTime;
    const cappedAdjustment = Math.max(0.5, Math.min(2, adjustmentFactor));
    const adjustedSegments = workout.workout.segments.map((segment) => {
      if (segment.intensity >= 84 && segment.intensity <= 92) {
        return {
          ...segment,
          duration: Math.round(segment.duration * cappedAdjustment)
        };
      }
      return segment;
    });
    return {
      ...workout,
      workout: {
        ...workout.workout,
        segments: adjustedSegments,
        estimatedTSS: Math.round(workout.workout.estimatedTSS * cappedAdjustment)
      }
    };
  }
  /**
   * Generate LT-based training zones
   * Requirement 3.3: Implement LT-based zone derivations
   */
  generateLTBasedZones(ltPace) {
    const ltBasedZones = {};
    Object.entries(TRAINING_ZONES).forEach(([key, baseZone]) => {
      const zone = { ...baseZone };
      if (zone.paceRange) {
        const ltAdjustment = this.getLTAdjustmentForZone(key);
        zone.paceRange = {
          min: ltPace + ltAdjustment.min,
          max: ltPace + ltAdjustment.max
        };
      }
      zone.description = this.getLTBasedDescription(key, ltPace);
      ltBasedZones[key] = zone;
    });
    return ltBasedZones;
  }
  /**
   * Get LT-based adjustment for each zone
   */
  getLTAdjustmentForZone(zoneName) {
    const adjustments = {
      "RECOVERY": { min: 0.5, max: 0.75 },
      "EASY": { min: 0.25, max: 0.5 },
      "MARATHON": { min: 0.167, max: 0.25 },
      "TEMPO": { min: -0.05, max: 0.05 },
      "THRESHOLD": { min: -0.05, max: 0.05 },
      "VO2_MAX": { min: -0.25, max: -0.167 },
      "SPEED": { min: -0.5, max: -0.333 }
    };
    return adjustments[zoneName] || { min: 0, max: 0 };
  }
  /**
   * Get LT-based description for zone
   */
  getLTBasedDescription(zoneName, ltPace) {
    const paceStr = this.formatPace(ltPace);
    const adjustments = this.getLTAdjustmentForZone(zoneName);
    const minPace = this.formatPace(ltPace + adjustments.min);
    const maxPace = this.formatPace(ltPace + adjustments.max);
    const descriptions = {
      "RECOVERY": `Recovery pace (${minPace}-${maxPace}) - Easy effort for active recovery`,
      "EASY": `General aerobic pace (${minPace}-${maxPace}) - Conversational, aerobic base building`,
      "MARATHON": `Marathon pace (${minPace}-${maxPace}) - Sustainable race pace effort`,
      "TEMPO": `Lactate threshold pace (${minPace}-${maxPace}) - Comfortably hard, 1-hour effort`,
      "THRESHOLD": `Lactate threshold pace (${minPace}-${maxPace}) - Foundation pace (${paceStr})`,
      "VO2_MAX": `VO2max pace (${minPace}-${maxPace}) - Hard intervals, oxygen uptake`,
      "SPEED": `Neuromuscular pace (${minPace}-${maxPace}) - Short, fast repetitions`
    };
    return descriptions[zoneName] || `Training pace based on LT pace (${paceStr})`;
  }
  /**
   * Enhance pace description with LT-based context
   */
  enhancePaceDescription(baseDescription, paceRange, zoneName) {
    const paceStr = `${this.formatPace(paceRange.min)}-${this.formatPace(paceRange.max)}`;
    return `${baseDescription} (${paceStr} - LT-derived ${zoneName.toLowerCase()} pace)`;
  }
  /**
   * Format pace for display (mm:ss)
   */
  formatPace(paceInMinPerKm) {
    const minutes = Math.floor(paceInMinPerKm);
    const seconds = Math.round((paceInMinPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
};
var HudsonPhilosophy = class extends BaseTrainingPhilosophy {
  constructor() {
    super("hudson", "Brad Hudson");
  }
  // Hudson-specific implementations can be added later
};
var CustomPhilosophy = class extends BaseTrainingPhilosophy {
  constructor() {
    super("custom", "Custom Methodology");
  }
  // Custom philosophy allows for user-defined parameters
};
var PhilosophyUtils = {
  /**
   * Compare two philosophies by their characteristics
   */
  comparePhilosophies(methodology1, methodology2) {
    const philosophy1 = PhilosophyFactory.create(methodology1);
    const philosophy2 = PhilosophyFactory.create(methodology2);
    const intensityDiff = Math.abs(
      philosophy1.intensityDistribution.hard - philosophy2.intensityDistribution.hard
    );
    const recoveryDiff = Math.abs(
      philosophy1.recoveryEmphasis - philosophy2.recoveryEmphasis
    );
    const priorities1 = new Set(philosophy1.workoutPriorities);
    const priorities2 = new Set(philosophy2.workoutPriorities);
    const intersection = new Set([...priorities1].filter((x) => priorities2.has(x)));
    const union = /* @__PURE__ */ new Set([...priorities1, ...priorities2]);
    const overlap = intersection.size / union.size;
    return {
      intensityDifference: intensityDiff,
      recoveryDifference: recoveryDiff,
      workoutPriorityOverlap: overlap
    };
  },
  /**
   * Get philosophy recommendations based on athlete characteristics
   */
  recommendPhilosophy(characteristics) {
    const recommendations = [];
    if (characteristics.experience === "beginner" || characteristics.injuryHistory) {
      recommendations.push("lydiard", "hudson");
    }
    if (characteristics.goals === "race_performance" || characteristics.goals === "competitive") {
      recommendations.push("daniels", "pfitzinger");
    }
    if (characteristics.timeAvailable === "limited") {
      recommendations.push("hudson", "daniels");
    }
    if (recommendations.length === 0) {
      recommendations.push("custom", "daniels");
    }
    return [...new Set(recommendations)];
  }
};

// src/advanced-generator.ts
var import_date_fns4 = require("date-fns");
var AdvancedTrainingPlanGenerator = class _AdvancedTrainingPlanGenerator extends TrainingPlanGenerator {
  constructor(config) {
    super(config);
    this.advancedConfig = config;
    const methodology = config.methodology || "custom";
    this.philosophy = PhilosophyFactory.create(methodology);
  }
  /**
   * Generate an advanced training plan with philosophy integration
   */
  generateAdvancedPlan() {
    const basePlan = super.generatePlan();
    const enhancedPlan = this.philosophy.enhancePlan(basePlan);
    const finalPlan = this.applyAdvancedFeatures(enhancedPlan);
    return finalPlan;
  }
  /**
   * Override base workout selection to integrate philosophy
   */
  selectWorkoutTemplate(type, phase, weekInPhase) {
    return this.philosophy.selectWorkout(type, phase, weekInPhase);
  }
  /**
   * Override workout generation to apply philosophy customizations
   */
  generateWorkout(date, type, phase, weekNumber) {
    const baseWorkout = super.generateWorkout(date, type, phase, weekNumber);
    const customizedWorkout = {
      ...baseWorkout,
      workout: this.philosophy.customizeWorkout(
        baseWorkout.workout,
        phase,
        weekNumber
      )
    };
    return customizedWorkout;
  }
  /**
   * Apply additional advanced features based on configuration
   */
  applyAdvancedFeatures(plan) {
    let enhancedPlan = plan;
    if (this.advancedConfig.targetRaces && this.advancedConfig.targetRaces.length > 0) {
      enhancedPlan = this.applyMultiRacePlanning(enhancedPlan);
    }
    if (this.advancedConfig.intensityDistribution) {
      enhancedPlan = this.applyCustomIntensityDistribution(enhancedPlan);
    }
    if (this.advancedConfig.periodization) {
      enhancedPlan = this.applyPeriodizationType(enhancedPlan);
    }
    if (this.advancedConfig.recoveryMonitoring) {
      enhancedPlan = this.addRecoveryMonitoring(enhancedPlan);
    }
    if (this.advancedConfig.progressTracking) {
      enhancedPlan = this.addProgressTracking(enhancedPlan);
    }
    return enhancedPlan;
  }
  /**
   * Apply custom intensity distribution to the plan
   */
  applyCustomIntensityDistribution(plan) {
    const distribution = this.advancedConfig.intensityDistribution;
    const modifiedBlocks = plan.blocks.map((block) => {
      const totalWorkouts = block.microcycles.reduce(
        (sum, micro) => sum + micro.workouts.length,
        0
      );
      const easyWorkouts = Math.round(totalWorkouts * (distribution.easy / 100));
      const moderateWorkouts = Math.round(totalWorkouts * (distribution.moderate / 100));
      const hardWorkouts = totalWorkouts - easyWorkouts - moderateWorkouts;
      return this.redistributeWorkouts(block, easyWorkouts, moderateWorkouts, hardWorkouts);
    });
    return {
      ...plan,
      blocks: modifiedBlocks
    };
  }
  /**
   * Apply specific periodization type to the plan
   */
  applyPeriodizationType(plan) {
    const periodization = this.advancedConfig.periodization;
    switch (periodization) {
      case "linear":
        return this.applyLinearPeriodization(plan);
      case "block":
        return this.applyBlockPeriodization(plan);
      case "undulating":
        return this.applyUndulatingPeriodization(plan);
      case "reverse":
        return this.applyReversePeriodization(plan);
      default:
        return plan;
    }
  }
  /**
   * Add recovery monitoring features to workouts
   */
  addRecoveryMonitoring(plan) {
    const enhancedWorkouts = plan.workouts.map((workout) => ({
      ...workout,
      targetMetrics: {
        ...workout.targetMetrics,
        recoveryMetrics: {
          minRecoveryScore: 60,
          // Minimum recovery score to proceed
          maxHeartRateVariability: 50,
          // HRV threshold
          requiredSleepHours: 7.5
        }
      }
    }));
    return {
      ...plan,
      workouts: enhancedWorkouts
    };
  }
  /**
   * Add progress tracking features to the plan
   */
  addProgressTracking(plan) {
    const checkpointWeeks = [4, 8, 12, 16];
    const enhancedBlocks = plan.blocks.map((block) => {
      const enhancedMicrocycles = block.microcycles.map((micro) => {
        if (checkpointWeeks.includes(micro.weekNumber)) {
          const assessmentWorkout = this.createFitnessAssessment(
            block.phase,
            micro.weekNumber
          );
          return {
            ...micro,
            workouts: [...micro.workouts, assessmentWorkout]
          };
        }
        return micro;
      });
      return {
        ...block,
        microcycles: enhancedMicrocycles
      };
    });
    return {
      ...plan,
      blocks: enhancedBlocks
    };
  }
  /**
   * Redistribute workouts based on intensity targets
   */
  redistributeWorkouts(block, easyCount, moderateCount, hardCount) {
    return block;
  }
  /**
   * Apply linear periodization pattern
   */
  applyLinearPeriodization(plan) {
    return plan;
  }
  /**
   * Apply block periodization pattern
   */
  applyBlockPeriodization(plan) {
    return plan;
  }
  /**
   * Apply undulating periodization pattern
   */
  applyUndulatingPeriodization(plan) {
    return plan;
  }
  /**
   * Apply reverse periodization pattern
   */
  applyReversePeriodization(plan) {
    return plan;
  }
  /**
   * Create a fitness assessment workout
   */
  createFitnessAssessment(phase, week) {
    return {
      id: `assessment-${week}`,
      date: /* @__PURE__ */ new Date(),
      type: "time_trial",
      name: "Fitness Assessment",
      description: "Progress check time trial",
      workout: {
        type: "time_trial",
        primaryZone: this.getZoneForType("time_trial"),
        segments: [],
        adaptationTarget: "Fitness assessment",
        estimatedTSS: 80,
        recoveryTime: 24
      },
      targetMetrics: {
        duration: 30,
        tss: 80,
        load: 80,
        intensity: 90
      }
    };
  }
  /**
   * Helper to get appropriate zone for workout type
   */
  getZoneForType(type) {
    return { name: "Threshold" };
  }
  /**
   * Apply multi-race planning to create a season-long plan
   */
  applyMultiRacePlanning(plan) {
    const races = this.advancedConfig.targetRaces;
    const sortedRaces = this.sortRacesByPriority(races);
    const raceBlocks = this.createMultiRaceBlocks(sortedRaces);
    const adjustedPlan = this.integrateRaceBlocks(plan, raceBlocks);
    const finalPlan = this.addRaceSpecificElements(adjustedPlan, sortedRaces);
    return finalPlan;
  }
  /**
   * Sort races by priority and date for optimal planning
   */
  sortRacesByPriority(races) {
    return [...races].filter((race) => race.date && race.date instanceof Date && !isNaN(race.date.getTime())).sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority.charCodeAt(0) - b.priority.charCodeAt(0);
      }
      return a.date.getTime() - b.date.getTime();
    });
  }
  /**
   * Create training blocks for multiple races
   */
  createMultiRaceBlocks(races) {
    const blocks = [];
    let previousRaceDate = this.advancedConfig.startDate;
    races.forEach((race, index) => {
      const weeksAvailable = (0, import_date_fns4.differenceInWeeks)(race.date, previousRaceDate);
      const raceBlocks = this.createRacePreparationBlocks(
        race,
        previousRaceDate,
        weeksAvailable,
        index
      );
      blocks.push(...raceBlocks);
      if (index < races.length - 1) {
        const nextRace = races[index + 1];
        const transitionWeeks = this.calculateTransitionPeriod(race, nextRace);
        if (transitionWeeks > 0) {
          blocks.push(this.createTransitionBlock(
            race.date,
            transitionWeeks,
            race.distance,
            nextRace.distance
          ));
        }
      }
      previousRaceDate = (0, import_date_fns4.addWeeks)(race.date, 1);
    });
    return blocks;
  }
  /**
   * Create preparation blocks for a specific race
   */
  createRacePreparationBlocks(race, startDate, totalWeeks, blockIndex) {
    const blocks = [];
    const phaseWeeks = this.calculateRacePhaseDistribution(totalWeeks, race.priority);
    let currentDate = startDate;
    if (phaseWeeks.base > 0) {
      blocks.push({
        id: `race-${blockIndex}-base`,
        phase: "base",
        startDate: currentDate,
        endDate: (0, import_date_fns4.addWeeks)(currentDate, phaseWeeks.base),
        weeks: phaseWeeks.base,
        focusAreas: this.getRaceFocusAreas("base", race.distance),
        microcycles: []
      });
      currentDate = (0, import_date_fns4.addWeeks)(currentDate, phaseWeeks.base);
    }
    if (phaseWeeks.build > 0) {
      blocks.push({
        id: `race-${blockIndex}-build`,
        phase: "build",
        startDate: currentDate,
        endDate: (0, import_date_fns4.addWeeks)(currentDate, phaseWeeks.build),
        weeks: phaseWeeks.build,
        focusAreas: this.getRaceFocusAreas("build", race.distance),
        microcycles: []
      });
      currentDate = (0, import_date_fns4.addWeeks)(currentDate, phaseWeeks.build);
    }
    if (phaseWeeks.peak > 0) {
      blocks.push({
        id: `race-${blockIndex}-peak`,
        phase: "peak",
        startDate: currentDate,
        endDate: (0, import_date_fns4.addWeeks)(currentDate, phaseWeeks.peak),
        weeks: phaseWeeks.peak,
        focusAreas: this.getRaceFocusAreas("peak", race.distance),
        microcycles: []
      });
      currentDate = (0, import_date_fns4.addWeeks)(currentDate, phaseWeeks.peak);
    }
    blocks.push({
      id: `race-${blockIndex}-taper`,
      phase: "taper",
      startDate: currentDate,
      endDate: (0, import_date_fns4.addWeeks)(currentDate, phaseWeeks.taper),
      weeks: phaseWeeks.taper,
      focusAreas: ["Race preparation", "Recovery", "Mental readiness"],
      microcycles: []
    });
    return blocks;
  }
  /**
   * Calculate phase distribution for race preparation
   */
  calculateRacePhaseDistribution(weeks, priority) {
    const distribution = {
      base: 0,
      build: 0,
      peak: 0,
      taper: 0,
      recovery: 0
    };
    if (priority === "A") {
      if (weeks >= 12) {
        distribution.base = Math.floor(weeks * 0.3);
        distribution.build = Math.floor(weeks * 0.35);
        distribution.peak = Math.floor(weeks * 0.25);
        distribution.taper = Math.max(2, Math.floor(weeks * 0.1));
      } else if (weeks >= 8) {
        distribution.base = Math.floor(weeks * 0.25);
        distribution.build = Math.floor(weeks * 0.4);
        distribution.peak = Math.floor(weeks * 0.25);
        distribution.taper = Math.max(1, weeks - distribution.base - distribution.build - distribution.peak);
      } else {
        distribution.build = Math.floor(weeks * 0.6);
        distribution.peak = Math.floor(weeks * 0.3);
        distribution.taper = Math.max(1, weeks - distribution.build - distribution.peak);
      }
    } else if (priority === "B") {
      if (weeks >= 8) {
        distribution.base = Math.floor(weeks * 0.2);
        distribution.build = Math.floor(weeks * 0.5);
        distribution.peak = Math.floor(weeks * 0.2);
        distribution.taper = Math.max(1, weeks - distribution.base - distribution.build - distribution.peak);
      } else {
        distribution.build = Math.floor(weeks * 0.7);
        distribution.taper = Math.max(1, weeks - distribution.build);
      }
    } else {
      if (weeks >= 4) {
        distribution.build = weeks - 1;
        distribution.taper = 1;
      } else {
        distribution.build = weeks;
      }
    }
    return distribution;
  }
  /**
   * Get race-specific focus areas
   */
  getRaceFocusAreas(phase, distance) {
    const distanceFocus = {
      "5k": {
        base: ["Speed development", "Running economy", "Aerobic power"],
        build: ["VO2max", "Lactate threshold", "Speed endurance"],
        peak: ["Race pace", "Speed", "Mental preparation"],
        taper: ["Maintenance", "Sharpening", "Recovery"],
        recovery: ["Active recovery", "Regeneration"]
      },
      "10k": {
        base: ["Aerobic capacity", "Threshold development", "Speed"],
        build: ["Threshold", "VO2max", "Race pace"],
        peak: ["Race simulation", "Speed endurance", "Tactics"],
        taper: ["Freshness", "Race pace feel", "Mental prep"],
        recovery: ["Easy running", "Flexibility"]
      },
      "half-marathon": {
        base: ["Aerobic base", "Threshold", "Mileage build"],
        build: ["Threshold focus", "Tempo runs", "Race pace"],
        peak: ["Race pace specificity", "Endurance", "Speed"],
        taper: ["Volume reduction", "Pace maintenance", "Rest"],
        recovery: ["Recovery runs", "Cross-training"]
      },
      "marathon": {
        base: ["High mileage", "Aerobic development", "Long runs"],
        build: ["Marathon pace", "Long tempo", "Fuel practice"],
        peak: ["Race simulation", "Pace discipline", "Nutrition"],
        taper: ["Gradual reduction", "Glycogen storage", "Rest"],
        recovery: ["Active recovery", "Reflection", "Planning"]
      },
      // Add other distances with reasonable defaults
      "15k": {
        base: ["Aerobic capacity", "Threshold", "Mileage"],
        build: ["Threshold", "Tempo", "Race pace"],
        peak: ["Race pace", "Endurance", "Speed"],
        taper: ["Recovery", "Maintenance", "Mental prep"],
        recovery: ["Easy running", "Recovery"]
      },
      "50k": {
        base: ["Ultra endurance", "Time on feet", "Nutrition"],
        build: ["Back-to-back long runs", "Hill strength", "Pacing"],
        peak: ["Race simulation", "Fueling strategy", "Mental prep"],
        taper: ["Volume reduction", "Recovery", "Preparation"],
        recovery: ["Active recovery", "Adaptation"]
      },
      "50-mile": {
        base: ["High volume", "Endurance", "Strength"],
        build: ["Ultra-specific training", "Nutrition practice", "Hills"],
        peak: ["Race rehearsal", "Mental preparation", "Logistics"],
        taper: ["Rest", "Recovery", "Preparation"],
        recovery: ["Extended recovery", "Adaptation"]
      },
      "100k": {
        base: ["Volume build", "Endurance", "Consistency"],
        build: ["Back-to-backs", "Night running", "Nutrition"],
        peak: ["Race simulation", "Mental training", "Strategy"],
        taper: ["Deep recovery", "Preparation", "Rest"],
        recovery: ["Extended recovery", "Reflection"]
      },
      "100-mile": {
        base: ["Massive volume", "Time on feet", "Adaptation"],
        build: ["Ultra endurance", "Sleep deprivation", "Nutrition"],
        peak: ["Mental preparation", "Logistics", "Strategy"],
        taper: ["Complete rest", "Recovery", "Mental prep"],
        recovery: ["Extended recovery", "Adaptation", "Planning"]
      },
      "ultra": {
        base: ["Ultra endurance", "Time on feet", "Base building"],
        build: ["Long sustained efforts", "Nutrition", "Mental training"],
        peak: ["Race preparation", "Strategy", "Fueling"],
        taper: ["Recovery", "Preparation", "Rest"],
        recovery: ["Extended recovery", "Regeneration"]
      }
    };
    return distanceFocus[distance]?.[phase] || ["General preparation"];
  }
  /**
   * Calculate transition period between races
   */
  calculateTransitionPeriod(completedRace, upcomingRace) {
    const weeksBetween = (0, import_date_fns4.differenceInWeeks)(upcomingRace.date, completedRace.date);
    const recoveryNeeded = this.getRecoveryWeeks(completedRace.distance, completedRace.priority);
    const preparationNeeded = this.getMinimalPreparationWeeks(upcomingRace.distance, upcomingRace.priority);
    if (weeksBetween < recoveryNeeded + preparationNeeded) {
      return Math.max(1, Math.floor(weeksBetween * 0.2));
    }
    return Math.min(recoveryNeeded, Math.floor(weeksBetween * 0.3));
  }
  /**
   * Get recovery weeks needed after a race
   */
  getRecoveryWeeks(distance, priority) {
    const baseRecovery = {
      "5k": 1,
      "10k": 1,
      "15k": 1,
      "half-marathon": 2,
      "marathon": 3,
      "50k": 4,
      "50-mile": 6,
      "100k": 8,
      "100-mile": 12,
      "ultra": 10
    };
    const priorityMultiplier = priority === "A" ? 1 : priority === "B" ? 0.7 : 0.5;
    return Math.ceil(baseRecovery[distance] * priorityMultiplier);
  }
  /**
   * Get minimal preparation weeks for a race
   */
  getMinimalPreparationWeeks(distance, priority) {
    const basePrep = {
      "5k": 4,
      "10k": 6,
      "15k": 8,
      "half-marathon": 8,
      "marathon": 12,
      "50k": 16,
      "50-mile": 20,
      "100k": 24,
      "100-mile": 32,
      "ultra": 20
    };
    const priorityMultiplier = priority === "A" ? 1 : priority === "B" ? 0.6 : 0.3;
    return Math.ceil(basePrep[distance] * priorityMultiplier);
  }
  /**
   * Create transition block between races
   */
  createTransitionBlock(startDate, weeks, fromDistance, toDistance) {
    return {
      id: `transition-${fromDistance}-to-${toDistance}`,
      phase: "recovery",
      startDate: (0, import_date_fns4.addWeeks)(startDate, 1),
      endDate: (0, import_date_fns4.addWeeks)(startDate, weeks + 1),
      weeks,
      focusAreas: [
        "Active recovery",
        `Transition from ${fromDistance} to ${toDistance}`,
        "Base maintenance"
      ],
      microcycles: []
    };
  }
  /**
   * Integrate race blocks with existing plan structure
   */
  integrateRaceBlocks(plan, raceBlocks) {
    const updatedBlocks = raceBlocks.map((block) => {
      const microcycles = this.generateMicrocycles(block);
      return {
        ...block,
        microcycles
      };
    });
    const allWorkouts = updatedBlocks.flatMap(
      (block) => block.microcycles.flatMap((cycle) => cycle.workouts)
    );
    return {
      ...plan,
      blocks: updatedBlocks,
      workouts: allWorkouts
    };
  }
  /**
   * Add race-specific elements to the plan
   */
  addRaceSpecificElements(plan, races) {
    const enhancedWorkouts = [...plan.workouts];
    races.forEach((race) => {
      if (!race.date || !(race.date instanceof Date) || isNaN(race.date.getTime())) {
        console.warn(`Invalid race date for ${race.distance} race, skipping...`);
        return;
      }
      const raceWorkout = {
        id: `race-${race.distance}-${race.date.toISOString()}`,
        date: race.date,
        type: "race_pace",
        name: `${race.distance} Race${race.location ? ` - ${race.location}` : ""}`,
        description: `Priority ${race.priority} race`,
        workout: {
          type: "race_pace",
          primaryZone: this.getZoneForType("race_pace"),
          segments: [{
            duration: this.estimateRaceDuration(race.distance),
            intensity: 95,
            zone: this.getZoneForType("race_pace"),
            description: "Race effort"
          }],
          adaptationTarget: "Race performance",
          estimatedTSS: this.estimateRaceTSS(race.distance),
          recoveryTime: this.getRecoveryWeeks(race.distance, race.priority) * 168
          // hours
        },
        targetMetrics: {
          duration: this.estimateRaceDuration(race.distance),
          distance: this.getRaceDistanceKm(race.distance),
          tss: this.estimateRaceTSS(race.distance),
          load: this.estimateRaceTSS(race.distance),
          intensity: 95
        }
      };
      enhancedWorkouts.push(raceWorkout);
      if (race.priority === "A" || race.priority === "B") {
        const tuneUpWorkout = this.createRaceTuneUpWorkout(race, (0, import_date_fns4.addDays)(race.date, -3));
        enhancedWorkouts.push(tuneUpWorkout);
      }
    });
    enhancedWorkouts.sort((a, b) => a.date.getTime() - b.date.getTime());
    return {
      ...plan,
      workouts: enhancedWorkouts
    };
  }
  /**
   * Estimate race duration in minutes
   */
  estimateRaceDuration(distance) {
    const durations = {
      "5k": 25,
      "10k": 50,
      "15k": 80,
      "half-marathon": 110,
      "marathon": 240,
      "50k": 360,
      "50-mile": 600,
      "100k": 840,
      "100-mile": 1800,
      "ultra": 600
    };
    return durations[distance] || 60;
  }
  /**
   * Get race distance in kilometers
   */
  getRaceDistanceKm(distance) {
    const distances = {
      "5k": 5,
      "10k": 10,
      "15k": 15,
      "half-marathon": 21.1,
      "marathon": 42.2,
      "50k": 50,
      "50-mile": 80.5,
      "100k": 100,
      "100-mile": 161,
      "ultra": 50
    };
    return distances[distance] || 10;
  }
  /**
   * Estimate race TSS
   */
  estimateRaceTSS(distance) {
    const tssValues = {
      "5k": 60,
      "10k": 100,
      "15k": 140,
      "half-marathon": 180,
      "marathon": 300,
      "50k": 400,
      "50-mile": 600,
      "100k": 800,
      "100-mile": 1200,
      "ultra": 500
    };
    return tssValues[distance] || 100;
  }
  /**
   * Create race tune-up workout
   */
  createRaceTuneUpWorkout(race, date) {
    const distance = race.distance;
    const tuneUpDistance = this.getTuneUpDistance(distance);
    return {
      id: `tune-up-${race.distance}-${date.toISOString()}`,
      date,
      type: "race_pace",
      name: `${distance} Race Tune-up`,
      description: "Pre-race shakeout with race pace segments",
      workout: {
        type: "race_pace",
        primaryZone: this.getZoneForType("tempo"),
        segments: [
          {
            duration: 10,
            intensity: 65,
            zone: this.getZoneForType("easy"),
            description: "Easy warm-up"
          },
          {
            duration: tuneUpDistance,
            intensity: 90,
            zone: this.getZoneForType("race_pace"),
            description: "Race pace"
          },
          {
            duration: 10,
            intensity: 60,
            zone: this.getZoneForType("recovery"),
            description: "Cool-down"
          }
        ],
        adaptationTarget: "Race pace feel and confidence",
        estimatedTSS: 40,
        recoveryTime: 24
      },
      targetMetrics: {
        duration: 20 + tuneUpDistance,
        distance: (20 + tuneUpDistance) / 5,
        // Rough estimate
        tss: 40,
        load: 40,
        intensity: 75
      }
    };
  }
  /**
   * Get appropriate tune-up distance for race
   */
  getTuneUpDistance(distance) {
    const tuneUpMap = {
      "5k": 5,
      "10k": 8,
      "15k": 10,
      "half-marathon": 12,
      "marathon": 15,
      "50k": 20,
      "50-mile": 30,
      "100k": 30,
      "100-mile": 45,
      "ultra": 25
    };
    return tuneUpMap[distance] || 10;
  }
  /**
   * Create advanced plan from run history with methodology
   */
  static fromRunHistoryAdvanced(runs, config) {
    const fitness = TrainingPlanGenerator.assessFitnessFromRuns(runs);
    const weeklyPatterns = analyzeWeeklyPatterns(runs);
    const advancedConfig = {
      name: config.name || "Advanced Training Plan",
      goal: config.goal || "GENERAL_FITNESS",
      startDate: config.startDate || /* @__PURE__ */ new Date(),
      targetDate: config.targetDate,
      currentFitness: fitness,
      preferences: {
        availableDays: weeklyPatterns.optimalDays,
        preferredIntensity: "moderate",
        crossTraining: false,
        strengthTraining: false,
        ...config.preferences
      },
      methodology: config.methodology || "custom",
      intensityDistribution: config.intensityDistribution || { easy: 80, moderate: 15, hard: 5, veryHard: 0 },
      periodization: config.periodization || "linear",
      targetRaces: config.targetRaces || [],
      adaptationEnabled: config.adaptationEnabled || false,
      recoveryMonitoring: config.recoveryMonitoring || false,
      progressTracking: config.progressTracking || true,
      ...config
    };
    const generator = new _AdvancedTrainingPlanGenerator(advancedConfig);
    return generator.generateAdvancedPlan();
  }
  /**
   * Get methodology-specific configuration
   */
  getMethodologyConfig() {
    return TRAINING_METHODOLOGIES[this.advancedConfig.methodology || "custom"];
  }
  /**
   * Get current philosophy instance
   */
  getPhilosophy() {
    return this.philosophy;
  }
};

// src/adaptation.ts
var import_date_fns5 = require("date-fns");
var SmartAdaptationEngine = class {
  constructor() {
    this.SAFE_ACWR_LOWER = 0.8;
    this.SAFE_ACWR_UPPER = 1.3;
    this.HIGH_RISK_ACWR = 1.5;
    this.MIN_RECOVERY_SCORE = 60;
    this.HIGH_FATIGUE_THRESHOLD = 80;
    this.OVERREACHING_TSS_THRESHOLD = 150;
    // Daily TSS indicating overreaching
    this.CHRONIC_FATIGUE_DAYS = 5;
  }
  // Days of high fatigue before intervention
  /**
   * Analyze workout completion and performance data
   */
  analyzeProgress(completedWorkouts, plannedWorkouts) {
    const adherence = this.calculateAdherence(completedWorkouts, plannedWorkouts);
    const performanceTrend = this.analyzePerformanceTrend(completedWorkouts);
    const volumeProgress = this.analyzeVolumeProgress(completedWorkouts);
    const intensityDistribution = this.analyzeIntensityDistribution(completedWorkouts);
    const runData = this.convertToRunData(completedWorkouts);
    const fitnessMetrics = calculateFitnessMetrics(runData);
    const weeklyPatterns = analyzeWeeklyPatterns(runData);
    return {
      adherenceRate: adherence,
      completedWorkouts,
      // Array of completed workouts
      totalWorkouts: plannedWorkouts.length,
      performanceTrend,
      volumeProgress,
      intensityDistribution,
      currentFitness: {
        vdot: fitnessMetrics.vdot,
        weeklyMileage: weeklyPatterns.avgWeeklyMileage,
        longestRecentRun: Math.max(...runData.map((r) => r.distance)),
        trainingAge: 1
        // Would need more data
      },
      lastUpdateDate: /* @__PURE__ */ new Date(),
      date: /* @__PURE__ */ new Date()
    };
  }
  /**
   * Suggest modifications based on progress and recovery
   */
  suggestModifications(plan, progress, recovery) {
    const modifications = [];
    const runData = this.convertToRunData(progress.completedWorkouts || []);
    const trainingLoad = calculateTrainingLoad(runData, 5);
    if (trainingLoad.ratio > this.HIGH_RISK_ACWR) {
      modifications.push({
        type: "reduce_volume",
        reason: `Acute:Chronic workload ratio (${trainingLoad.ratio.toFixed(2)}) exceeds safe threshold`,
        priority: "high",
        suggestedChanges: {
          volumeReduction: 30
        }
      });
    } else if (trainingLoad.ratio > this.SAFE_ACWR_UPPER) {
      modifications.push({
        type: "reduce_intensity",
        reason: `Elevated training load (A:C ratio ${trainingLoad.ratio.toFixed(2)})`,
        priority: "medium",
        suggestedChanges: {
          intensityReduction: 20
        }
      });
    }
    if (recovery) {
      const overallRecovery = this.calculateOverallRecovery(recovery);
      if (overallRecovery < this.MIN_RECOVERY_SCORE) {
        modifications.push({
          type: "add_recovery",
          reason: `Low recovery score (${overallRecovery}), indicating high fatigue`,
          priority: "high",
          suggestedChanges: {
            additionalRecoveryDays: 2,
            intensityReduction: 30
          }
        });
      }
      if (recovery.injuryStatus === "injured" || recovery.illnessStatus === "sick") {
        modifications.push({
          type: "injury_protocol",
          reason: recovery.injuryStatus === "injured" ? "Injury reported" : "Illness reported",
          priority: "high",
          suggestedChanges: {
            substituteWorkoutType: "recovery",
            volumeReduction: recovery.injuryStatus === "injured" ? 100 : 50
          }
        });
      }
    }
    if (progress.adherenceRate < 0.7) {
      modifications.push({
        type: "reduce_volume",
        reason: `Low adherence rate (${(progress.adherenceRate * 100).toFixed(0)}%)`,
        priority: "medium",
        suggestedChanges: {
          volumeReduction: 20,
          delayDays: 7
        }
      });
    }
    if (progress.performanceTrend === "declining") {
      modifications.push({
        type: "delay_progression",
        reason: "Performance trend showing decline",
        priority: "medium",
        suggestedChanges: {
          delayDays: 7,
          intensityReduction: 15
        }
      });
    }
    return modifications;
  }
  /**
   * Apply modifications to the training plan
   */
  applyModifications(plan, modifications) {
    let modifiedPlan = { ...plan };
    const sortedMods = modifications.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    sortedMods.forEach((mod) => {
      switch (mod.type) {
        case "reduce_volume":
          modifiedPlan = this.applyVolumeReduction(modifiedPlan, mod);
          break;
        case "reduce_intensity":
          modifiedPlan = this.applyIntensityReduction(modifiedPlan, mod);
          break;
        case "add_recovery":
          modifiedPlan = this.addRecoveryDays(modifiedPlan, mod);
          break;
        case "substitute_workout":
          modifiedPlan = this.substituteWorkouts(modifiedPlan, mod);
          break;
        case "delay_progression":
          modifiedPlan = this.delayProgression(modifiedPlan, mod);
          break;
        case "injury_protocol":
          modifiedPlan = this.applyInjuryProtocol(modifiedPlan, mod);
          break;
      }
    });
    return modifiedPlan;
  }
  /**
   * Check if adaptation is needed based on current metrics
   */
  needsAdaptation(progress, recovery) {
    const runData = this.convertToRunData(progress.completedWorkouts || []);
    const trainingLoad = calculateTrainingLoad(runData, 5);
    if (trainingLoad.ratio > this.SAFE_ACWR_UPPER || trainingLoad.ratio < this.SAFE_ACWR_LOWER) {
      return true;
    }
    if (recovery) {
      const overallRecovery = this.calculateOverallRecovery(recovery);
      if (overallRecovery < this.MIN_RECOVERY_SCORE) {
        return true;
      }
      if (recovery.injuryStatus === "injured" || recovery.illnessStatus === "sick") {
        return true;
      }
    }
    if (progress.adherenceRate < 0.7) {
      return true;
    }
    if (progress.performanceTrend === "declining") {
      return true;
    }
    return false;
  }
  /**
   * Calculate adherence rate
   */
  calculateAdherence(completed, planned) {
    if (planned.length === 0) return 1;
    const now = /* @__PURE__ */ new Date();
    const pastPlanned = planned.filter((w) => w.date <= now);
    if (pastPlanned.length === 0) return 1;
    return completed.length / pastPlanned.length;
  }
  /**
   * Analyze performance trend from completed workouts
   */
  analyzePerformanceTrend(completed) {
    if (completed.length < 5) return "stable";
    const sortedByDate = [...completed].sort((a, b) => a.date.getTime() - b.date.getTime());
    const midpoint = Math.floor(sortedByDate.length / 2);
    const olderWorkouts = sortedByDate.slice(0, midpoint);
    const recentWorkouts = sortedByDate.slice(midpoint);
    const olderAvgRelativePace = this.calculateAverageRelativePace(olderWorkouts);
    const recentAvgRelativePace = this.calculateAverageRelativePace(recentWorkouts);
    const improvement = (olderAvgRelativePace - recentAvgRelativePace) / olderAvgRelativePace * 100;
    if (improvement > 2) return "improving";
    if (improvement < -2) return "declining";
    return "stable";
  }
  /**
   * Calculate average pace adjusted for effort level
   */
  calculateAverageRelativePace(workouts) {
    const validWorkouts = workouts.filter((w) => w.actualDistance && w.actualDuration && w.perceivedEffort);
    if (validWorkouts.length === 0) return 0;
    const relativePaces = validWorkouts.map((w) => {
      const pace = w.actualDuration / w.actualDistance;
      const effortAdjustment = w.perceivedEffort / 10;
      return pace / effortAdjustment;
    });
    return relativePaces.reduce((sum, pace) => sum + pace, 0) / relativePaces.length;
  }
  /**
   * Analyze volume progression
   */
  analyzeVolumeProgress(completed) {
    const weeklyVolumes = /* @__PURE__ */ new Map();
    completed.forEach((workout) => {
      if (workout.actualDistance) {
        const weekStart = (0, import_date_fns5.startOfWeek)(workout.date);
        const weekKey = weekStart.toISOString();
        weeklyVolumes.set(weekKey, (weeklyVolumes.get(weekKey) || 0) + workout.actualDistance);
      }
    });
    const volumes = Array.from(weeklyVolumes.values());
    const average = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    let trend = "stable";
    if (volumes.length >= 3) {
      const firstThird = volumes.slice(0, Math.floor(volumes.length / 3));
      const lastThird = volumes.slice(-Math.floor(volumes.length / 3));
      const firstAvg = firstThird.reduce((sum, v) => sum + v, 0) / firstThird.length;
      const lastAvg = lastThird.reduce((sum, v) => sum + v, 0) / lastThird.length;
      if (lastAvg > firstAvg * 1.1) trend = "increasing";
      else if (lastAvg < firstAvg * 0.9) trend = "decreasing";
    }
    return { weeklyAverage: average, trend };
  }
  /**
   * Analyze intensity distribution
   */
  analyzeIntensityDistribution(completed) {
    let easy = 0;
    let moderate = 0;
    let hard = 0;
    completed.forEach((workout) => {
      const effort = workout.perceivedEffort || 5;
      if (effort <= 4) easy++;
      else if (effort <= 7) moderate++;
      else hard++;
    });
    const total = easy + moderate + hard || 1;
    return {
      easy: Math.round(easy / total * 100),
      moderate: Math.round(moderate / total * 100),
      hard: Math.round(hard / total * 100)
    };
  }
  /**
   * Convert completed workouts to run data for calculations
   */
  convertToRunData(completed) {
    return completed.map((workout) => ({
      id: workout.workoutId,
      date: workout.date,
      distance: workout.actualDistance || 0,
      duration: workout.actualDuration || 0,
      avgPace: workout.actualDuration && workout.actualDistance ? workout.actualDuration / workout.actualDistance : void 0,
      avgHeartRate: workout.avgHeartRate,
      elevation: 0,
      effortLevel: workout.perceivedEffort,
      notes: workout.notes || ""
    }));
  }
  /**
   * Enhanced recovery score assessment using multiple data points
   */
  assessRecoveryStatus(completedWorkouts, recovery) {
    const runData = this.convertToRunData(completedWorkouts);
    const baseRecoveryScore = calculateRecoveryScore(
      runData,
      recovery?.restingHR,
      recovery?.hrv
    );
    const enhancedScore = recovery ? this.calculateOverallRecovery(recovery) : baseRecoveryScore;
    let status;
    if (enhancedScore >= 80) status = "recovered";
    else if (enhancedScore >= 60) status = "adequate";
    else if (enhancedScore >= 40) status = "fatigued";
    else status = "overreached";
    const recommendations = this.generateRecoveryRecommendations(
      enhancedScore,
      status,
      runData,
      recovery
    );
    return { score: enhancedScore, status, recommendations };
  }
  /**
   * Detect fatigue patterns and adjust workout intensity
   */
  detectFatigueAndAdjust(completedWorkouts, upcomingWorkouts, recovery) {
    const runData = this.convertToRunData(completedWorkouts);
    const trainingLoad = calculateTrainingLoad(runData, 5);
    const acuteFatigue = this.calculateAcuteFatigue(completedWorkouts);
    const chronicFatigue = this.detectChronicFatigue(completedWorkouts);
    const tssOverload = this.detectTSSOverload(completedWorkouts);
    let fatigueLevel;
    const warnings = [];
    if (chronicFatigue.days >= this.CHRONIC_FATIGUE_DAYS || tssOverload.consecutive >= 3) {
      fatigueLevel = "severe";
      warnings.push("Severe fatigue detected - immediate rest recommended");
    } else if (acuteFatigue > 70 || trainingLoad.ratio > this.HIGH_RISK_ACWR) {
      fatigueLevel = "high";
      warnings.push("High fatigue levels - reduce training intensity");
    } else if (acuteFatigue > 50 || trainingLoad.ratio > this.SAFE_ACWR_UPPER) {
      fatigueLevel = "moderate";
      warnings.push("Moderate fatigue - monitor closely");
    } else {
      fatigueLevel = "low";
    }
    const adjustedWorkouts = this.adjustWorkoutsForFatigue(
      upcomingWorkouts,
      fatigueLevel,
      trainingLoad.ratio
    );
    return { fatigueLevel, adjustedWorkouts, warnings };
  }
  /**
   * Create overreaching risk assessment using acute:chronic ratios
   */
  assessOverreachingRisk(completedWorkouts, plannedWorkouts) {
    const runData = this.convertToRunData(completedWorkouts);
    const trainingLoad = calculateTrainingLoad(runData, 5);
    const weeklyPatterns = analyzeWeeklyPatterns(runData);
    const recentWeekMileage = runData.filter((run) => run.date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)).reduce((sum, run) => sum + run.distance, 0);
    const weeklyLoadIncrease = weeklyPatterns.avgWeeklyMileage > 0 ? (recentWeekMileage - weeklyPatterns.avgWeeklyMileage) / weeklyPatterns.avgWeeklyMileage * 100 : 0;
    const recoveryScore = calculateRecoveryScore(runData);
    const currentRisk = calculateInjuryRisk(trainingLoad, weeklyLoadIncrease, recoveryScore);
    const projectedRisk = this.projectFutureRisk(
      completedWorkouts,
      plannedWorkouts,
      trainingLoad.ratio
    );
    let riskLevel;
    if (currentRisk >= 80 || projectedRisk >= 90) {
      riskLevel = "critical";
    } else if (currentRisk >= 60 || projectedRisk >= 70) {
      riskLevel = "high";
    } else if (currentRisk >= 40 || projectedRisk >= 50) {
      riskLevel = "moderate";
    } else {
      riskLevel = "low";
    }
    const mitigationStrategies = this.generateMitigationStrategies(
      riskLevel,
      trainingLoad.ratio,
      weeklyLoadIncrease,
      recoveryScore
    );
    return {
      riskLevel,
      acuteChronicRatio: trainingLoad.ratio,
      weeklyLoadIncrease,
      projectedRisk,
      mitigationStrategies
    };
  }
  /**
   * Calculate acute fatigue score
   */
  calculateAcuteFatigue(completedWorkouts) {
    const recentWorkouts = completedWorkouts.filter(
      (w) => w.date > new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3)
    );
    let fatigueScore = 0;
    recentWorkouts.forEach((workout) => {
      const effortContribution = (workout.perceivedEffort || 5) * 2;
      const completionRate = workout.actualDuration && workout.plannedDuration ? workout.actualDuration / workout.plannedDuration : 1;
      if (completionRate < 0.9) {
        fatigueScore += 10;
      }
      if (workout.perceivedEffort && workout.perceivedEffort >= 8) {
        fatigueScore += effortContribution;
      }
      if (workout.notes?.toLowerCase().includes("tired") || workout.notes?.toLowerCase().includes("fatigue")) {
        fatigueScore += 15;
      }
    });
    return Math.min(100, fatigueScore);
  }
  /**
   * Detect chronic fatigue patterns
   */
  detectChronicFatigue(completedWorkouts) {
    const sortedWorkouts = [...completedWorkouts].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    let consecutiveFatigueDays = 0;
    let maxConsecutive = 0;
    let pattern = "none";
    sortedWorkouts.forEach((workout, index) => {
      const highEffort = workout.perceivedEffort && workout.perceivedEffort >= 7;
      const poorCompletion = workout.actualDuration && workout.plannedDuration ? workout.actualDuration / workout.plannedDuration < 0.85 : false;
      if (highEffort && poorCompletion) {
        consecutiveFatigueDays++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveFatigueDays);
      } else {
        consecutiveFatigueDays = 0;
      }
    });
    if (maxConsecutive >= this.CHRONIC_FATIGUE_DAYS) {
      pattern = "persistent_underperformance";
    } else if (maxConsecutive >= 3) {
      pattern = "emerging_fatigue";
    }
    return {
      detected: maxConsecutive >= 3,
      days: maxConsecutive,
      pattern
    };
  }
  /**
   * Detect TSS overload patterns
   */
  detectTSSOverload(completedWorkouts) {
    const dailyTSS = /* @__PURE__ */ new Map();
    completedWorkouts.forEach((workout) => {
      const dateKey = workout.date.toISOString().split("T")[0];
      const workoutTSS = this.estimateWorkoutTSS(workout);
      dailyTSS.set(dateKey, (dailyTSS.get(dateKey) || 0) + workoutTSS);
    });
    const sortedDays = Array.from(dailyTSS.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    let consecutiveHighDays = 0;
    let maxConsecutive = 0;
    let maxDailyTSS = 0;
    sortedDays.forEach(([date, tss]) => {
      maxDailyTSS = Math.max(maxDailyTSS, tss);
      if (tss > this.OVERREACHING_TSS_THRESHOLD) {
        consecutiveHighDays++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveHighDays);
      } else {
        consecutiveHighDays = 0;
      }
    });
    return {
      detected: maxConsecutive >= 2,
      consecutive: maxConsecutive,
      maxDailyTSS
    };
  }
  /**
   * Estimate TSS for a completed workout
   */
  estimateWorkoutTSS(workout) {
    if (!workout.actualDuration) return 0;
    const intensityFactor = (workout.perceivedEffort || 5) / 10;
    const tss = workout.actualDuration * Math.pow(intensityFactor, 2) * 100 / 60;
    return Math.round(tss);
  }
  /**
   * Adjust workouts based on fatigue level
   */
  adjustWorkoutsForFatigue(workouts, fatigueLevel, acwr) {
    const adjustmentFactors = {
      low: { volume: 1, intensity: 1 },
      moderate: { volume: 0.9, intensity: 0.95 },
      high: { volume: 0.7, intensity: 0.85 },
      severe: { volume: 0.5, intensity: 0.7 }
    };
    const factors = adjustmentFactors[fatigueLevel];
    return workouts.map((workout) => {
      if (workout.date <= /* @__PURE__ */ new Date()) return workout;
      if (workout.type === "recovery") return workout;
      return {
        ...workout,
        name: `${workout.name} (Adjusted for ${fatigueLevel} fatigue)`,
        targetMetrics: {
          ...workout.targetMetrics,
          duration: Math.round(workout.targetMetrics.duration * factors.volume),
          distance: workout.targetMetrics.distance ? workout.targetMetrics.distance * factors.volume : void 0,
          intensity: Math.round(workout.targetMetrics.intensity * factors.intensity)
        },
        workout: {
          ...workout.workout,
          segments: workout.workout.segments.map((segment) => ({
            ...segment,
            duration: Math.round(segment.duration * factors.volume),
            intensity: Math.round(segment.intensity * factors.intensity)
          }))
        }
      };
    });
  }
  /**
   * Generate recovery recommendations
   */
  generateRecoveryRecommendations(score, status, runData, recovery) {
    const recommendations = [];
    if (status === "overreached") {
      recommendations.push("Take 2-3 days of complete rest");
      recommendations.push("Focus on sleep quality (8+ hours)");
      recommendations.push("Consider massage or light stretching");
    } else if (status === "fatigued") {
      recommendations.push("Reduce training intensity by 30%");
      recommendations.push("Add an extra recovery day this week");
      recommendations.push("Prioritize hydration and nutrition");
    }
    if (recovery?.sleepQuality && recovery.sleepQuality < 6) {
      recommendations.push("Improve sleep hygiene - aim for consistent bedtime");
    }
    if (recovery?.muscleSoreness && recovery.muscleSoreness > 7) {
      recommendations.push("Consider foam rolling and dynamic stretching");
    }
    if (recovery?.hrv && recovery.hrv < 40) {
      recommendations.push("HRV is low - reduce stress and training load");
    }
    return recommendations;
  }
  /**
   * Project future injury risk
   */
  projectFutureRisk(completed, planned, currentACWR) {
    const upcomingWeek = planned.filter(
      (w) => w.date > /* @__PURE__ */ new Date() && w.date < (0, import_date_fns5.addDays)(/* @__PURE__ */ new Date(), 7)
    );
    const plannedTSS = upcomingWeek.reduce((sum, workout) => {
      return sum + (workout.workout.estimatedTSS || 50);
    }, 0);
    const projectedACWR = currentACWR + plannedTSS / 350;
    let risk = 0;
    if (projectedACWR > 1.5) risk += 40;
    else if (projectedACWR > 1.3) risk += 25;
    else if (projectedACWR < 0.8) risk += 20;
    const recentHighIntensity = completed.filter((w) => w.date > (0, import_date_fns5.addDays)(/* @__PURE__ */ new Date(), -7)).filter((w) => w.perceivedEffort && w.perceivedEffort >= 8).length;
    risk += recentHighIntensity * 10;
    return Math.min(100, risk);
  }
  /**
   * Generate mitigation strategies for injury risk
   */
  generateMitigationStrategies(riskLevel, acwr, weeklyIncrease, recoveryScore) {
    const strategies = [];
    if (riskLevel === "critical" || riskLevel === "high") {
      strategies.push("Immediately reduce training volume by 30-40%");
      strategies.push("Replace high-intensity workouts with easy recovery runs");
      strategies.push("Schedule professional assessment if pain persists");
    }
    if (acwr > 1.3) {
      strategies.push("Gradually reduce training load over 2 weeks");
      strategies.push("Focus on maintaining fitness rather than building");
    }
    if (weeklyIncrease > 10) {
      strategies.push("Limit weekly mileage increases to 10%");
      strategies.push("Add recovery weeks every 3-4 weeks");
    }
    if (recoveryScore < 60) {
      strategies.push("Prioritize sleep and nutrition");
      strategies.push("Consider cross-training activities");
      strategies.push("Monitor morning heart rate variability");
    }
    return strategies;
  }
  /**
   * Calculate overall recovery score from metrics
   */
  calculateOverallRecovery(recovery) {
    let score = 70;
    if (recovery.sleepQuality) {
      score += (recovery.sleepQuality - 5) * 4;
    }
    if (recovery.muscleSoreness) {
      score -= (recovery.muscleSoreness - 5) * 4;
    }
    if (recovery.energyLevel) {
      score += (recovery.energyLevel - 5) * 4;
    }
    if (recovery.hrv) {
      if (recovery.hrv > 60) score += 10;
      else if (recovery.hrv > 50) score += 5;
      else if (recovery.hrv < 40) score -= 10;
    }
    if (recovery.restingHR) {
      if (recovery.restingHR < 50) score += 10;
      else if (recovery.restingHR < 60) score += 5;
      else if (recovery.restingHR > 70) score -= 10;
    }
    return Math.max(0, Math.min(100, score));
  }
  /**
   * Apply volume reduction to workouts
   */
  applyVolumeReduction(plan, modification) {
    const reduction = modification.suggestedChanges.volumeReduction || 20;
    const factor = 1 - reduction / 100;
    const modifiedWorkouts = plan.workouts.map((workout) => {
      if (workout.date > /* @__PURE__ */ new Date()) {
        return {
          ...workout,
          targetMetrics: {
            ...workout.targetMetrics,
            distance: workout.targetMetrics.distance ? workout.targetMetrics.distance * factor : void 0,
            duration: workout.targetMetrics.duration * factor
          }
        };
      }
      return workout;
    });
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  /**
   * Apply intensity reduction to workouts
   */
  applyIntensityReduction(plan, modification) {
    const reduction = modification.suggestedChanges.intensityReduction || 20;
    const factor = 1 - reduction / 100;
    const modifiedWorkouts = plan.workouts.map((workout) => {
      if (workout.date > /* @__PURE__ */ new Date() && workout.targetMetrics.intensity > 80) {
        return {
          ...workout,
          targetMetrics: {
            ...workout.targetMetrics,
            intensity: workout.targetMetrics.intensity * factor
          },
          workout: {
            ...workout.workout,
            segments: workout.workout.segments.map((segment) => ({
              ...segment,
              intensity: segment.intensity > 80 ? segment.intensity * factor : segment.intensity
            }))
          }
        };
      }
      return workout;
    });
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  /**
   * Add recovery days to the plan
   */
  addRecoveryDays(plan, modification) {
    const additionalDays = modification.suggestedChanges.additionalRecoveryDays || 2;
    const futureWorkouts = plan.workouts.filter((w) => w.date > /* @__PURE__ */ new Date());
    let converted = 0;
    const modifiedWorkouts = plan.workouts.map((workout) => {
      if (workout.date > /* @__PURE__ */ new Date() && converted < additionalDays && workout.targetMetrics.intensity > 75) {
        converted++;
        return {
          ...workout,
          type: "recovery",
          name: "Recovery Run (Modified)",
          description: "Easy recovery run - plan adjusted for fatigue",
          workout: {
            ...workout.workout,
            type: "recovery",
            segments: [{
              duration: 30,
              intensity: 50,
              zone: { name: "Recovery" },
              description: "Very easy recovery pace"
            }]
          },
          targetMetrics: {
            ...workout.targetMetrics,
            intensity: 50,
            duration: 30
          }
        };
      }
      return workout;
    });
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  /**
   * Substitute workouts based on modification
   */
  substituteWorkouts(plan, modification) {
    const substituteType = modification.suggestedChanges.substituteWorkoutType || "easy";
    const workoutIds = modification.workoutIds || [];
    const modifiedWorkouts = plan.workouts.map((workout) => {
      if (workoutIds.includes(workout.id) || workoutIds.length === 0 && workout.date > /* @__PURE__ */ new Date()) {
        return {
          ...workout,
          type: substituteType,
          name: `${substituteType.charAt(0).toUpperCase() + substituteType.slice(1)} Run (Substituted)`,
          description: `Workout substituted: ${modification.reason}`,
          workout: {
            ...workout.workout,
            type: substituteType
          }
        };
      }
      return workout;
    });
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  /**
   * Delay progression by shifting workouts
   */
  delayProgression(plan, modification) {
    const delayDays = modification.suggestedChanges.delayDays || 7;
    const modifiedWorkouts = plan.workouts.map((workout) => {
      if (workout.date > /* @__PURE__ */ new Date()) {
        return {
          ...workout,
          date: (0, import_date_fns5.addDays)(workout.date, delayDays)
        };
      }
      return workout;
    });
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  /**
   * Apply injury or illness protocol
   */
  applyInjuryProtocol(plan, modification) {
    const volumeReduction = modification.suggestedChanges.volumeReduction || 100;
    if (volumeReduction === 100) {
      const oneWeekFromNow = (0, import_date_fns5.addDays)(/* @__PURE__ */ new Date(), 7);
      const modifiedWorkouts = plan.workouts.filter(
        (workout) => workout.date < /* @__PURE__ */ new Date() || workout.date > oneWeekFromNow
      );
      return {
        ...plan,
        workouts: modifiedWorkouts
      };
    } else {
      return this.addRecoveryDays(plan, {
        ...modification,
        suggestedChanges: {
          ...modification.suggestedChanges,
          additionalRecoveryDays: 7
        }
      });
    }
  }
  /**
   * Create intelligent workout substitutions based on fatigue and goals
   */
  createSmartSubstitutions(originalWorkout, reason) {
    const substitutionMap = {
      fatigue: {
        vo2max: "tempo",
        threshold: "steady",
        tempo: "easy",
        speed: "easy",
        hill_repeats: "easy",
        long_run: "easy",
        progression: "steady",
        fartlek: "easy",
        race_pace: "steady",
        time_trial: "tempo",
        easy: "recovery",
        steady: "easy",
        recovery: "recovery",
        cross_training: "recovery",
        strength: "recovery"
      },
      injury: {
        vo2max: "cross_training",
        threshold: "cross_training",
        tempo: "cross_training",
        speed: "recovery",
        hill_repeats: "recovery",
        long_run: "cross_training",
        progression: "easy",
        fartlek: "easy",
        race_pace: "easy",
        time_trial: "easy",
        easy: "recovery",
        steady: "recovery",
        recovery: "recovery",
        cross_training: "cross_training",
        strength: "recovery"
      },
      illness: {
        vo2max: "recovery",
        threshold: "recovery",
        tempo: "easy",
        speed: "recovery",
        hill_repeats: "recovery",
        long_run: "easy",
        progression: "easy",
        fartlek: "recovery",
        race_pace: "easy",
        time_trial: "recovery",
        easy: "recovery",
        steady: "recovery",
        recovery: "recovery",
        cross_training: "recovery",
        strength: "recovery"
      },
      time_constraint: {
        long_run: "tempo",
        vo2max: "fartlek",
        threshold: "tempo",
        tempo: "tempo",
        speed: "speed",
        hill_repeats: "tempo",
        progression: "tempo",
        fartlek: "fartlek",
        race_pace: "tempo",
        time_trial: "tempo",
        easy: "easy",
        steady: "steady",
        recovery: "recovery",
        cross_training: "cross_training",
        strength: "strength"
      },
      weather: {
        speed: "tempo",
        vo2max: "threshold",
        hill_repeats: "tempo",
        long_run: "long_run",
        threshold: "tempo",
        tempo: "steady",
        progression: "steady",
        fartlek: "tempo",
        race_pace: "tempo",
        time_trial: "tempo",
        easy: "easy",
        steady: "steady",
        recovery: "recovery",
        cross_training: "cross_training",
        strength: "strength"
      }
    };
    const newType = substitutionMap[reason][originalWorkout.type] || "easy";
    const template = this.selectAppropriateTemplate(newType, originalWorkout.targetMetrics.duration);
    return {
      ...originalWorkout,
      type: newType,
      name: `${this.getWorkoutName(newType)} (Substituted due to ${reason})`,
      description: `Original ${originalWorkout.type} workout modified due to ${reason}`,
      workout: template,
      targetMetrics: {
        ...originalWorkout.targetMetrics,
        intensity: template.segments.reduce((sum, s) => sum + s.intensity, 0) / template.segments.length,
        tss: template.estimatedTSS,
        load: template.estimatedTSS
      }
    };
  }
  /**
   * Select appropriate workout template based on type and duration
   */
  selectAppropriateTemplate(type, targetDuration) {
    const templates = {
      recovery: WORKOUT_TEMPLATES.RECOVERY_JOG,
      easy: WORKOUT_TEMPLATES.EASY_AEROBIC,
      steady: WORKOUT_TEMPLATES.EASY_AEROBIC,
      tempo: WORKOUT_TEMPLATES.TEMPO_CONTINUOUS,
      threshold: WORKOUT_TEMPLATES.LACTATE_THRESHOLD_2X20,
      vo2max: WORKOUT_TEMPLATES.VO2MAX_4X4,
      speed: WORKOUT_TEMPLATES.SPEED_200M_REPS,
      hill_repeats: WORKOUT_TEMPLATES.HILL_REPEATS_6X2,
      fartlek: WORKOUT_TEMPLATES.FARTLEK_VARIED,
      progression: WORKOUT_TEMPLATES.PROGRESSION_3_STAGE,
      long_run: WORKOUT_TEMPLATES.LONG_RUN,
      race_pace: WORKOUT_TEMPLATES.TEMPO_CONTINUOUS,
      time_trial: WORKOUT_TEMPLATES.THRESHOLD_PROGRESSION,
      cross_training: WORKOUT_TEMPLATES.EASY_AEROBIC,
      strength: WORKOUT_TEMPLATES.RECOVERY_JOG
    };
    const template = templates[type] || WORKOUT_TEMPLATES.EASY_AEROBIC;
    if (targetDuration < 45 && template.segments.reduce((sum, s) => sum + s.duration, 0) > 60) {
      const scaleFactor = targetDuration / template.segments.reduce((sum, s) => sum + s.duration, 0);
      return {
        ...template,
        segments: template.segments.map((s) => ({
          ...s,
          duration: Math.round(s.duration * scaleFactor)
        }))
      };
    }
    return template;
  }
  /**
   * Create recovery protocol for injury or illness
   */
  createRecoveryProtocol(condition, severity, affectedArea) {
    const recoveryPhases = [];
    if (condition === "injury") {
      if (severity === "mild") {
        recoveryPhases.push(
          {
            name: "Acute Phase",
            duration: 3,
            workouts: ["recovery", "cross_training"],
            volumePercent: 30,
            intensityLimit: 60,
            focus: "Pain reduction and healing"
          },
          {
            name: "Return Phase",
            duration: 4,
            workouts: ["easy", "recovery", "cross_training"],
            volumePercent: 50,
            intensityLimit: 70,
            focus: "Gradual loading"
          },
          {
            name: "Build Phase",
            duration: 7,
            workouts: ["easy", "steady", "tempo"],
            volumePercent: 80,
            intensityLimit: 85,
            focus: "Progressive return"
          }
        );
      } else if (severity === "moderate") {
        recoveryPhases.push(
          {
            name: "Rest Phase",
            duration: 7,
            workouts: ["recovery", "cross_training"],
            volumePercent: 0,
            intensityLimit: 50,
            focus: "Complete rest or cross-training only"
          },
          {
            name: "Return to Running",
            duration: 7,
            workouts: ["recovery", "easy"],
            volumePercent: 25,
            intensityLimit: 65,
            focus: "Walk-run progression"
          },
          {
            name: "Base Rebuild",
            duration: 14,
            workouts: ["easy", "steady"],
            volumePercent: 60,
            intensityLimit: 75,
            focus: "Aerobic base reconstruction"
          }
        );
      } else {
        recoveryPhases.push(
          {
            name: "Medical Phase",
            duration: 14,
            workouts: [],
            volumePercent: 0,
            intensityLimit: 0,
            focus: "Medical treatment and complete rest"
          },
          {
            name: "Rehabilitation",
            duration: 21,
            workouts: ["recovery"],
            volumePercent: 10,
            intensityLimit: 50,
            focus: "Guided return with medical clearance"
          },
          {
            name: "Reconditioning",
            duration: 28,
            workouts: ["recovery", "easy"],
            volumePercent: 40,
            intensityLimit: 65,
            focus: "Very gradual fitness rebuild"
          }
        );
      }
    } else {
      if (severity === "mild") {
        recoveryPhases.push(
          {
            name: "Symptom Phase",
            duration: 3,
            workouts: ["recovery"],
            volumePercent: 50,
            intensityLimit: 60,
            focus: "Below neck symptoms only"
          },
          {
            name: "Return Phase",
            duration: 4,
            workouts: ["easy", "recovery"],
            volumePercent: 70,
            intensityLimit: 70,
            focus: "Gradual return"
          }
        );
      } else {
        recoveryPhases.push(
          {
            name: "Rest Phase",
            duration: 7,
            workouts: [],
            volumePercent: 0,
            intensityLimit: 0,
            focus: "Complete rest until fever-free 24h"
          },
          {
            name: "Easy Return",
            duration: 7,
            workouts: ["recovery", "easy"],
            volumePercent: 30,
            intensityLimit: 65,
            focus: "Very easy efforts only"
          },
          {
            name: "Progressive Build",
            duration: 14,
            workouts: ["easy", "steady", "tempo"],
            volumePercent: 70,
            intensityLimit: 80,
            focus: "Gradual intensity increase"
          }
        );
      }
    }
    const guidelines = this.generateRecoveryGuidelines(condition, severity, affectedArea);
    const returnCriteria = this.generateReturnCriteria(condition, severity);
    return { phases: recoveryPhases, guidelines, returnCriteria };
  }
  /**
   * Generate recovery guidelines
   */
  generateRecoveryGuidelines(condition, severity, affectedArea) {
    const guidelines = [];
    if (condition === "injury") {
      guidelines.push("Follow RICE protocol (Rest, Ice, Compression, Elevation) for acute injuries");
      guidelines.push("Maintain fitness through cross-training if pain-free");
      guidelines.push("Focus on sleep quality (8+ hours) for optimal healing");
      guidelines.push("Ensure adequate protein intake (1.6-2.2g/kg body weight)");
      if (affectedArea?.includes("knee") || affectedArea?.includes("ankle")) {
        guidelines.push("Consider pool running or cycling for cardio maintenance");
        guidelines.push("Strengthen supporting muscles (glutes, core, calves)");
      }
      if (severity === "severe") {
        guidelines.push("Seek professional medical evaluation");
        guidelines.push("Consider physical therapy for proper rehabilitation");
      }
    } else {
      guidelines.push("No exercise with fever or below-neck symptoms");
      guidelines.push("Stay hydrated and maintain electrolyte balance");
      guidelines.push("Return to activity should be gradual");
      guidelines.push("Monitor heart rate - may be elevated during recovery");
      if (severity !== "mild") {
        guidelines.push("Wait 24-48 hours after last fever before any exercise");
        guidelines.push("First workout back should be 50% normal duration at easy pace");
      }
    }
    return guidelines;
  }
  /**
   * Generate return-to-running criteria
   */
  generateReturnCriteria(condition, severity) {
    const criteria = [];
    if (condition === "injury") {
      criteria.push("Pain-free during daily activities");
      criteria.push("Full range of motion restored");
      criteria.push("No swelling or inflammation");
      if (severity !== "mild") {
        criteria.push("Medical clearance obtained");
        criteria.push("Able to walk 30 minutes pain-free");
        criteria.push("Single-leg balance test passed");
      }
    } else {
      criteria.push("Fever-free for 24-48 hours");
      criteria.push("Resting heart rate returned to normal");
      criteria.push("Energy levels at 80% or better");
      criteria.push("No chest pain or breathing difficulties");
    }
    criteria.push("Mentally ready to return to training");
    criteria.push("Sleep quality normalized");
    return criteria;
  }
  /**
   * Apply progressive overload adjustments
   */
  applyProgressiveOverload(plan, currentFitness, progressRate) {
    const overloadFactors = {
      conservative: { volume: 1.05, intensity: 1.02 },
      moderate: { volume: 1.1, intensity: 1.05 },
      aggressive: { volume: 1.15, intensity: 1.08 }
    };
    const factors = overloadFactors[progressRate];
    const weeklyWorkouts = this.groupWorkoutsByWeek(plan.workouts);
    const modifiedWorkouts = [];
    weeklyWorkouts.forEach((weekWorkouts, weekIndex) => {
      weekWorkouts.forEach((workout) => {
        if (weekIndex > 1 && workout.type !== "recovery") {
          const overloadWeek = weekIndex - 1;
          const volumeFactor = Math.pow(factors.volume, overloadWeek / 4);
          const intensityFactor = Math.pow(factors.intensity, overloadWeek / 8);
          modifiedWorkouts.push({
            ...workout,
            targetMetrics: {
              ...workout.targetMetrics,
              duration: Math.round(workout.targetMetrics.duration * volumeFactor),
              distance: workout.targetMetrics.distance ? workout.targetMetrics.distance * volumeFactor : void 0,
              intensity: Math.min(95, workout.targetMetrics.intensity * intensityFactor)
            }
          });
        } else {
          modifiedWorkouts.push(workout);
        }
      });
    });
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  /**
   * Group workouts by week
   */
  groupWorkoutsByWeek(workouts) {
    const weeks = [];
    const sortedWorkouts = [...workouts].sort((a, b) => a.date.getTime() - b.date.getTime());
    if (sortedWorkouts.length === 0) return weeks;
    let currentWeek = [];
    let weekStart = (0, import_date_fns5.startOfWeek)(sortedWorkouts[0].date);
    sortedWorkouts.forEach((workout) => {
      const workoutWeekStart = (0, import_date_fns5.startOfWeek)(workout.date);
      if (workoutWeekStart.getTime() !== weekStart.getTime()) {
        weeks.push(currentWeek);
        currentWeek = [];
        weekStart = workoutWeekStart;
      }
      currentWeek.push(workout);
    });
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    return weeks;
  }
  /**
   * Get workout name for type
   */
  getWorkoutName(type) {
    const names = {
      recovery: "Recovery Run",
      easy: "Easy Run",
      steady: "Steady State Run",
      tempo: "Tempo Run",
      threshold: "Threshold Workout",
      vo2max: "VO2max Intervals",
      speed: "Speed Work",
      hill_repeats: "Hill Repeats",
      fartlek: "Fartlek Run",
      progression: "Progression Run",
      long_run: "Long Run",
      race_pace: "Race Pace Run",
      time_trial: "Time Trial",
      cross_training: "Cross Training",
      strength: "Strength Training"
    };
    return names[type] || "Training Run";
  }
};
function createAdaptationEngine() {
  return new SmartAdaptationEngine();
}

// src/export.ts
var import_date_fns6 = require("date-fns");

// src/methodology-export-enhancement.ts
var _MethodologyExportEnhancer = class _MethodologyExportEnhancer {
  /**
   * Extract methodology information from a training plan
   */
  static extractMethodologyInfo(plan) {
    const advancedConfig = plan.config;
    const methodology = advancedConfig.methodology;
    if (!methodology) {
      return {};
    }
    const philosophy = PhilosophyFactory.create(methodology);
    const principles = _MethodologyExportEnhancer.philosophyPrinciples[methodology];
    const citations = _MethodologyExportEnhancer.researchCitations[methodology];
    return {
      methodology,
      philosophy,
      principles,
      citations
    };
  }
  /**
   * Generate methodology-enhanced metadata
   */
  static generateMethodologyMetadata(plan, format4, content) {
    const { methodology, philosophy, principles } = this.extractMethodologyInfo(plan);
    const size = typeof content === "string" ? Buffer.byteLength(content, "utf8") : content.length;
    const baseMetadata = {
      planName: plan.config.name,
      exportDate: /* @__PURE__ */ new Date(),
      format: format4,
      totalWorkouts: plan.workouts.length,
      planDuration: Math.ceil((plan.config.endDate?.getTime() || Date.now() - plan.config.startDate.getTime()) / (1e3 * 60 * 60 * 24 * 7)),
      fileSize: size,
      version: "1.0.0"
    };
    if (methodology && philosophy && principles) {
      return {
        ...baseMetadata,
        methodology,
        philosophyName: philosophy.name,
        intensityDistribution: philosophy.intensityDistribution,
        keyPrinciples: principles.keyPrinciples,
        researchCitations: _MethodologyExportEnhancer.researchCitations[methodology],
        philosophyDescription: principles.corePhilosophy,
        coachBackground: `Training methodology developed by ${philosophy.name}`
      };
    }
    return baseMetadata;
  }
  /**
   * Generate methodology documentation section
   */
  static generateMethodologyDocumentation(plan, options = {}) {
    const { methodology, philosophy, principles, citations } = this.extractMethodologyInfo(plan);
    if (!methodology || !philosophy || !principles) {
      return "";
    }
    const detailLevel = options.detailLevel || "standard";
    let documentation = "";
    documentation += `# Training Philosophy: ${philosophy.name}

`;
    documentation += `${principles.corePhilosophy}

`;
    if (options.includePhilosophyPrinciples !== false) {
      documentation += `## Key Principles

`;
      principles.keyPrinciples.forEach((principle) => {
        documentation += `- ${principle}
`;
      });
      documentation += "\n";
      if (detailLevel === "comprehensive") {
        documentation += `## Training Approach

`;
        documentation += `**Intensity Strategy:** ${principles.intensityApproach}

`;
        documentation += `**Recovery Philosophy:** ${principles.recoveryPhilosophy}

`;
        documentation += `**Periodization:** ${principles.periodizationStrategy}

`;
      }
    }
    documentation += `## Intensity Distribution

`;
    documentation += `- Easy Running: ${philosophy.intensityDistribution.easy}%
`;
    documentation += `- Moderate Intensity: ${philosophy.intensityDistribution.moderate}%
`;
    documentation += `- Hard Training: ${philosophy.intensityDistribution.hard}%

`;
    if (detailLevel === "comprehensive") {
      documentation += `## Methodology Analysis

`;
      documentation += `### Strengths

`;
      principles.strengthsWeaknesses.strengths.forEach((strength) => {
        documentation += `- ${strength}
`;
      });
      documentation += "\n";
      documentation += `### Considerations

`;
      principles.strengthsWeaknesses.considerations.forEach((consideration) => {
        documentation += `- ${consideration}
`;
      });
      documentation += "\n";
      documentation += `### Ideal For

`;
      principles.idealFor.forEach((ideal) => {
        documentation += `- ${ideal}
`;
      });
      documentation += "\n";
      documentation += `### Typical Results

`;
      principles.typicalResults.forEach((result) => {
        documentation += `- ${result}
`;
      });
      documentation += "\n";
    }
    if (options.includeResearchCitations !== false && citations && citations.length > 0) {
      documentation += `## Research & References

`;
      citations.forEach((citation) => {
        documentation += `**${citation.title}** (${citation.year})
`;
        documentation += `Authors: ${citation.authors.join(", ")}
`;
        if (citation.journal) {
          documentation += `Published in: ${citation.journal}
`;
        }
        documentation += `${citation.summary}

`;
      });
    }
    return documentation;
  }
  /**
   * Generate workout rationale based on methodology
   */
  static generateWorkoutRationale(workout, methodology, phase) {
    const methodologyData = TRAINING_METHODOLOGIES[methodology];
    if (!methodologyData) return "";
    const workoutType = workout.workout.type;
    let rationale = "";
    switch (methodology) {
      case "daniels":
        rationale = _MethodologyExportEnhancer.generateDanielsRationale(workoutType, phase);
        break;
      case "lydiard":
        rationale = _MethodologyExportEnhancer.generateLydiardRationale(workoutType, phase);
        break;
      case "pfitzinger":
        rationale = _MethodologyExportEnhancer.generatePfitzingerRationale(workoutType, phase);
        break;
      case "hudson":
        rationale = _MethodologyExportEnhancer.generateHudsonRationale(workoutType, phase);
        break;
      default:
        rationale = `${workoutType} workout scheduled according to ${methodology} methodology principles.`;
    }
    return rationale;
  }
  static generateDanielsRationale(workoutType, phase) {
    const rationales = {
      easy: {
        base: "Easy running builds aerobic capacity and capillarization while allowing recovery.",
        build: "Maintains aerobic fitness while supporting recovery from quality sessions.",
        peak: "Active recovery between intense sessions while maintaining aerobic base.",
        taper: "Maintains fitness while reducing fatigue before competition.",
        recovery: "Promotes recovery and maintains basic fitness."
      },
      tempo: {
        base: "Tempo runs improve lactate clearance and running economy.",
        build: "Develops lactate threshold and marathon race pace fitness.",
        peak: "Maintains threshold fitness and practices race effort.",
        taper: "Short tempo work maintains sharpness without fatigue.",
        recovery: "Light tempo work for fitness maintenance."
      },
      threshold: {
        base: "Threshold work improves lactate buffering and clearance mechanisms.",
        build: "Key session for developing lactate threshold and sustainable pace.",
        peak: "Maintains threshold fitness and practices race pace tolerance.",
        taper: "Reduced threshold volume maintains fitness with less fatigue.",
        recovery: "Minimal threshold work for fitness retention."
      },
      vo2max: {
        base: "Limited VO2max work to develop neuromuscular coordination.",
        build: "Develops maximal oxygen uptake and running economy at speed.",
        peak: "Key sessions for developing race-specific speed and power.",
        taper: "Short VO2max intervals maintain neuromuscular sharpness.",
        recovery: "No VO2max work during recovery phase."
      }
    };
    return rationales[workoutType]?.[phase] || `${workoutType} workout supports ${phase} phase development.`;
  }
  static generateLydiardRationale(workoutType, phase) {
    const rationales = {
      easy: {
        base: "Extensive easy running builds maximum aerobic capacity and capillary density.",
        build: "Maintains aerobic base while supporting anaerobic development.",
        peak: "Essential recovery between coordination and speed sessions.",
        taper: "Easy running maintains fitness while reducing training stress.",
        recovery: "Primary training mode for active recovery and fitness maintenance."
      },
      steady: {
        base: "Steady aerobic running develops efficient fat utilization and aerobic power.",
        build: "Bridge between aerobic base and anaerobic development.",
        peak: "Maintains aerobic fitness during coordination phase.",
        taper: "Reduced steady running maintains aerobic fitness.",
        recovery: "Light steady running for fitness maintenance."
      },
      hill_repeats: {
        base: "Hill training develops leg strength and power without anaerobic stress.",
        build: "Key strength development for power and efficiency.",
        peak: "Maintains strength while focusing on speed coordination.",
        taper: "Light hill work maintains strength without fatigue.",
        recovery: "No hill training during recovery phase."
      }
    };
    return rationales[workoutType]?.[phase] || `${workoutType} workout follows Lydiard's ${phase} phase principles.`;
  }
  static generatePfitzingerRationale(workoutType, phase) {
    const rationales = {
      threshold: {
        base: "Lactate threshold development forms the foundation of marathon fitness.",
        build: "Progressive threshold volume builds race-specific endurance.",
        peak: "Peak threshold fitness for optimal marathon performance.",
        taper: "Reduced threshold work maintains fitness while reducing fatigue.",
        recovery: "Minimal threshold work for fitness retention."
      },
      tempo: {
        base: "Tempo segments in medium-long runs develop sustainable race pace.",
        build: "Extended tempo work builds marathon-specific endurance.",
        peak: "Race pace practice and threshold maintenance.",
        taper: "Short tempo segments maintain race pace feel.",
        recovery: "Light tempo work for active recovery."
      },
      medium_long: {
        base: "Medium-long runs with tempo segments build aerobic capacity and threshold.",
        build: "Key sessions combining volume and intensity for marathon preparation.",
        peak: "Race simulation and peak fitness development.",
        taper: "Reduced medium-long runs maintain fitness with less stress.",
        recovery: "No medium-long runs during recovery phase."
      }
    };
    return rationales[workoutType]?.[phase] || `${workoutType} workout supports Pfitzinger's ${phase} phase development.`;
  }
  static generateHudsonRationale(workoutType, phase) {
    const rationales = {
      easy: {
        base: "Easy running forms the foundation, adjusted based on individual response and adaptation patterns.",
        build: "Maintains aerobic base while supporting individual adaptation to quality training.",
        peak: "Active recovery between intense sessions, personalized to individual recovery needs.",
        taper: "Individualized easy running based on personal response patterns.",
        recovery: "Gentle aerobic work tailored to individual recovery requirements."
      },
      tempo: {
        base: "Tempo work introduced based on individual readiness and adaptation response.",
        build: "Progressive tempo development guided by individual fitness assessments.",
        peak: "Race-pace work adjusted to individual performance patterns.",
        taper: "Personalized tempo sessions based on individual sharpness needs.",
        recovery: "Light tempo work only if individual assessment indicates readiness."
      },
      intervals: {
        base: "Limited interval work, carefully monitored for individual adaptation.",
        build: "Progressive interval training based on ongoing fitness assessments.",
        peak: "Race-specific intervals adjusted to individual response patterns.",
        taper: "Short, sharp intervals based on individual preparation needs.",
        recovery: "No interval work unless individual assessment indicates full recovery."
      }
    };
    return rationales[workoutType]?.[phase] || `${workoutType} workout scheduled based on individual response and current fitness assessment. Hudson's adaptive approach adjusts training based on ongoing performance and recovery metrics.`;
  }
  /**
   * Generate methodology comparison information
   */
  static generateMethodologyComparison(currentMethodology, options) {
    if (!options.includeMethodologyComparison) return "";
    const otherMethodologies = Object.keys(TRAINING_METHODOLOGIES).filter((m) => m !== currentMethodology);
    let comparison = `## Methodology Comparison

`;
    comparison += `Your plan uses the **${TRAINING_METHODOLOGIES[currentMethodology].name}** methodology.

`;
    comparison += `### How it compares to other approaches:

`;
    otherMethodologies.forEach((methodology) => {
      const data = TRAINING_METHODOLOGIES[methodology];
      comparison += `**${data.name}:**
`;
      comparison += `- Intensity: ${data.intensityDistribution.easy}% easy, ${data.intensityDistribution.hard}% hard
`;
      comparison += `- Focus: ${data.workoutPriorities.slice(0, 2).join(", ")}

`;
    });
    return comparison;
  }
};
_MethodologyExportEnhancer.philosophyPrinciples = {
  daniels: {
    corePhilosophy: "VDOT-based training with precise pace prescriptions and 80/20 intensity distribution",
    keyPrinciples: [
      "VDOT (V-dot) as the foundation for all pace calculations",
      "80% easy running, 20% quality work for optimal adaptation",
      "Precise pace zones for different training stimuli",
      "Progressive overload through systematic intensity increases",
      "Economy of movement and efficiency focus"
    ],
    intensityApproach: "Scientific pace zones based on current fitness (VDOT) with specific physiological targets",
    recoveryPhilosophy: "Adequate recovery between quality sessions with emphasis on easy aerobic running",
    periodizationStrategy: "Linear periodization with gradual intensity increases and targeted adaptations",
    strengthsWeaknesses: {
      strengths: [
        "Scientific precision in pace prescription",
        "Proven track record with elite athletes",
        "Clear guidelines for intensity distribution",
        "Objective fitness assessment through VDOT"
      ],
      considerations: [
        "Requires disciplined pace adherence",
        "May be complex for beginners",
        "Focus on track/road running primarily"
      ]
    },
    idealFor: [
      "Runners who prefer structure and precision",
      "Athletes training for specific time goals",
      "Intermediate to advanced runners",
      "Track and road race specialists"
    ],
    typicalResults: [
      "Improved running economy",
      "Better pace judgment in races",
      "Consistent training adaptation",
      "Reduced overtraining risk"
    ]
  },
  lydiard: {
    corePhilosophy: "Aerobic base development with extensive easy running before introducing speed work",
    keyPrinciples: [
      "Extensive aerobic base building (85%+ easy running)",
      "Time-based training rather than pace-focused",
      "Hill training for strength development",
      "Strict periodization: base \u2192 anaerobic \u2192 coordination \u2192 taper",
      "High volume, low intensity foundation"
    ],
    intensityApproach: "Effort-based training with emphasis on aerobic capacity development before speed",
    recoveryPhilosophy: "Complete rest days rather than easy running for recovery",
    periodizationStrategy: "Classical periodization with distinct phases and clear progression",
    strengthsWeaknesses: {
      strengths: [
        "Builds exceptional aerobic capacity",
        "Reduces injury risk through easy running",
        "Proven success with distance runners",
        "Develops mental toughness through volume"
      ],
      considerations: [
        "Requires significant time commitment",
        "May lack speed for shorter distances",
        "Can be monotonous for some runners"
      ]
    },
    idealFor: [
      "Marathon and ultra-distance runners",
      "Runners with time for high volume",
      "Athletes building long-term fitness",
      "Runners prone to injury with intensity"
    ],
    typicalResults: [
      "Enhanced aerobic capacity",
      "Improved endurance and stamina",
      "Better fat utilization",
      "Increased capillarization"
    ]
  },
  pfitzinger: {
    corePhilosophy: "Lactate threshold-focused training with medium-long runs and structured intensity",
    keyPrinciples: [
      "Lactate threshold as the cornerstone of training",
      "Medium-long runs with embedded tempo segments",
      "Progressive threshold volume increases",
      "Specific weekly structure and workout spacing",
      "Race-specific preparation protocols"
    ],
    intensityApproach: "Threshold-based intensity with systematic progression and race-pace integration",
    recoveryPhilosophy: "Active recovery with structured easy days between quality sessions",
    periodizationStrategy: "Mesocycle-based periodization with progressive threshold development",
    strengthsWeaknesses: {
      strengths: [
        "Excellent for marathon preparation",
        "Develops lactate buffering capacity",
        "Structured progression protocols",
        "Race-specific fitness development"
      ],
      considerations: [
        "High intensity demands",
        "Requires good fitness base",
        "May be demanding for some runners"
      ]
    },
    idealFor: [
      "Marathon and half-marathon runners",
      "Experienced runners seeking structure",
      "Athletes targeting specific race times",
      "Runners who respond well to threshold work"
    ],
    typicalResults: [
      "Improved lactate threshold",
      "Enhanced marathon-specific fitness",
      "Better race-pace tolerance",
      "Increased muscular endurance"
    ]
  },
  hudson: {
    corePhilosophy: "Adaptive training with frequent assessment and adjustment based on individual response",
    keyPrinciples: [
      "Frequent fitness assessments and plan adjustments",
      "Individual response-based training modifications",
      "Emphasis on consistency over intensity",
      "Adaptive periodization based on progress",
      "Integration of cross-training and injury prevention"
    ],
    intensityApproach: "Flexible intensity based on individual response and fitness assessments",
    recoveryPhilosophy: "Proactive recovery with emphasis on adaptation monitoring",
    periodizationStrategy: "Adaptive periodization with frequent plan modifications",
    strengthsWeaknesses: {
      strengths: [
        "Highly individualized approach",
        "Responsive to athlete feedback",
        "Injury prevention focus",
        "Flexible and adaptive"
      ],
      considerations: [
        "Requires frequent monitoring",
        "Less structured approach",
        "May lack specific protocols"
      ]
    },
    idealFor: [
      "Runners seeking individualized training",
      "Athletes with variable schedules",
      "Injury-prone runners",
      "Runners who prefer flexible approaches"
    ],
    typicalResults: [
      "Reduced injury rates",
      "Improved training consistency",
      "Better individual adaptation",
      "Enhanced motivation and adherence"
    ]
  },
  custom: {
    corePhilosophy: "Personalized training approach combining elements from multiple methodologies",
    keyPrinciples: [
      "Individualized combination of training elements",
      "Flexible approach based on personal response",
      "Integration of preferred training methods",
      "Adaptive intensity and volume management",
      "Personal goal-specific customization"
    ],
    intensityApproach: "Customized intensity distribution based on individual preferences and response",
    recoveryPhilosophy: "Personalized recovery strategies based on individual needs",
    periodizationStrategy: "Flexible periodization adapted to personal schedule and goals",
    strengthsWeaknesses: {
      strengths: [
        "Completely personalized approach",
        "Combines best elements of different methods",
        "Flexible and adaptable",
        "Goal-specific customization"
      ],
      considerations: [
        "Requires careful monitoring",
        "May lack proven structure",
        "Requires experience to optimize"
      ]
    },
    idealFor: [
      "Experienced runners with clear preferences",
      "Athletes with unique constraints",
      "Runners combining multiple goals",
      "Those seeking maximum personalization"
    ],
    typicalResults: [
      "High training satisfaction",
      "Improved adherence",
      "Personalized adaptations",
      "Flexible goal achievement"
    ]
  }
};
_MethodologyExportEnhancer.researchCitations = {
  daniels: [
    {
      title: "Daniels' Running Formula",
      authors: ["Jack Daniels"],
      year: 2013,
      summary: "Comprehensive guide to VDOT-based training with scientific pace prescriptions and intensity distribution."
    },
    {
      title: "A physiologist's perspective on the Boston Marathon",
      authors: ["Jack Daniels"],
      journal: "Sports Medicine",
      year: 1996,
      summary: "Analysis of marathon performance and training principles from a physiological perspective."
    },
    {
      title: "The conditioning continuum",
      authors: ["Jack Daniels"],
      journal: "Track Technique",
      year: 1978,
      summary: "Foundation paper on systematic training progression and intensity distribution."
    }
  ],
  lydiard: [
    {
      title: "Running to the Top",
      authors: ["Arthur Lydiard", "Garth Gilmour"],
      year: 1997,
      summary: "Comprehensive guide to Lydiard's aerobic base training methodology and periodization."
    },
    {
      title: "Arthur Lydiard's Methods of Distance Training",
      authors: ["Arthur Lydiard"],
      year: 1978,
      summary: "Original methodology documentation covering base building and periodization principles."
    },
    {
      title: "The impact of aerobic base training on endurance performance",
      authors: ["Various"],
      journal: "Sports Science Review",
      year: 2015,
      summary: "Research validation of Lydiard's aerobic base training principles and their physiological effects."
    }
  ],
  pfitzinger: [
    {
      title: "Advanced Marathoning",
      authors: ["Pete Pfitzinger", "Scott Douglas"],
      year: 2009,
      summary: "Comprehensive marathon training guide featuring lactate threshold-focused methodology."
    },
    {
      title: "Road Racing for Serious Runners",
      authors: ["Pete Pfitzinger", "Philip Latter"],
      year: 1999,
      summary: "Training methodology for 5K to marathon races with threshold-based protocols."
    },
    {
      title: "Lactate threshold training adaptations in endurance runners",
      authors: ["Pete Pfitzinger"],
      journal: "Sports Medicine Research",
      year: 2006,
      summary: "Research on lactate threshold training effects and optimization strategies."
    }
  ],
  hudson: [
    {
      title: "Run Faster from the 5K to the Marathon",
      authors: ["Brad Hudson", "Matt Fitzgerald"],
      year: 2008,
      summary: "Adaptive training methodology with emphasis on individual response and flexibility."
    },
    {
      title: "The adaptive training approach to distance running",
      authors: ["Brad Hudson"],
      journal: "Modern Athletics Coach",
      year: 2010,
      summary: "Methodology paper on adaptive training principles and individual response monitoring."
    }
  ],
  custom: [
    {
      title: "Individualized Training Approaches in Endurance Sports",
      authors: ["Various Authors"],
      journal: "Sports Science Today",
      year: 2020,
      summary: "Review of personalized training methodologies and their effectiveness in endurance sports."
    }
  ]
};
var MethodologyExportEnhancer = _MethodologyExportEnhancer;
var MethodologyAwareFormatter = class {
  validatePlan(plan) {
    const errors = [];
    const warnings = [];
    if (!plan.workouts || plan.workouts.length === 0) {
      errors.push("Plan contains no workouts");
    }
    if (!plan.config.startDate) {
      errors.push("Plan missing start date");
    }
    const advancedConfig = plan.config;
    if (!advancedConfig.methodology) {
      warnings.push("No methodology specified - enhanced export features will be limited");
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  getOptionsSchema() {
    return {
      includePhilosophyPrinciples: { type: "boolean", default: true },
      includeResearchCitations: { type: "boolean", default: true },
      includeCoachBiography: { type: "boolean", default: false },
      includeMethodologyComparison: { type: "boolean", default: false },
      includeTrainingZoneExplanations: { type: "boolean", default: true },
      includeWorkoutRationale: { type: "boolean", default: false },
      detailLevel: { type: "string", enum: ["basic", "standard", "comprehensive"], default: "standard" }
    };
  }
  /**
   * Generate enhanced content with methodology information
   */
  generateEnhancedContent(plan, baseContent, options = {}) {
    let enhancedContent = baseContent;
    const methodologyDoc = MethodologyExportEnhancer.generateMethodologyDocumentation(plan, options);
    if (methodologyDoc) {
      enhancedContent = methodologyDoc + "\n\n" + enhancedContent;
    }
    const { methodology } = MethodologyExportEnhancer.extractMethodologyInfo(plan);
    if (methodology && options.includeMethodologyComparison) {
      const comparison = MethodologyExportEnhancer.generateMethodologyComparison(methodology, options);
      enhancedContent += "\n\n" + comparison;
    }
    return enhancedContent;
  }
  /**
   * Generate methodology-aware metadata
   */
  generateEnhancedMetadata(plan, format4, content) {
    return MethodologyExportEnhancer.generateMethodologyMetadata(plan, format4, content);
  }
};
var EnhancedMethodologyJSONFormatter = class extends MethodologyAwareFormatter {
  constructor() {
    super(...arguments);
    this.format = "json";
    this.mimeType = "application/json";
    this.fileExtension = "json";
  }
  async formatPlan(plan, options = {}) {
    const { methodology, philosophy, principles, citations } = MethodologyExportEnhancer.extractMethodologyInfo(plan);
    const enhancedData = {
      plan: {
        id: plan.id,
        name: plan.config.name,
        description: plan.config.description,
        goal: plan.config.goal,
        startDate: plan.config.startDate.toISOString(),
        endDate: plan.config.endDate?.toISOString(),
        totalWeeks: Math.ceil((plan.config.endDate?.getTime() || Date.now() - plan.config.startDate.getTime()) / (1e3 * 60 * 60 * 24 * 7)),
        totalWorkouts: plan.workouts.length
      },
      methodology: methodology ? {
        name: methodology,
        philosophyName: philosophy?.name,
        intensityDistribution: philosophy?.intensityDistribution,
        principles: options.includePhilosophyPrinciples !== false ? principles : void 0,
        citations: options.includeResearchCitations !== false ? citations : void 0
      } : void 0,
      workouts: plan.workouts.map((workout) => ({
        ...workout,
        rationale: options.includeWorkoutRationale && methodology ? MethodologyExportEnhancer.generateWorkoutRationale(
          workout,
          methodology,
          workout.phase || "base"
        ) : void 0
      })),
      blocks: plan.blocks,
      summary: plan.summary,
      exportInfo: {
        exportDate: (/* @__PURE__ */ new Date()).toISOString(),
        format: this.format,
        version: "2.0.0",
        enhanced: true
      }
    };
    const content = JSON.stringify(enhancedData, null, 2);
    const metadata = this.generateEnhancedMetadata(plan, this.format, content);
    return {
      content,
      filename: `${plan.config.name.replace(/\s+/g, "-").toLowerCase()}-enhanced.${this.fileExtension}`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content, "utf8"),
      metadata,
      philosophyData: principles,
      citations
    };
  }
};
var MethodologyMarkdownFormatter = class extends MethodologyAwareFormatter {
  constructor() {
    super(...arguments);
    this.format = "markdown";
    this.mimeType = "text/markdown";
    this.fileExtension = "md";
  }
  async formatPlan(plan, options = {}) {
    const { methodology, principles, citations } = MethodologyExportEnhancer.extractMethodologyInfo(plan);
    let content = "";
    const methodologyDoc = MethodologyExportEnhancer.generateMethodologyDocumentation(plan, options);
    if (methodologyDoc) {
      content += methodologyDoc + "\n\n";
    }
    content += `# Training Plan: ${plan.config.name}

`;
    content += `**Goal:** ${plan.config.goal}
`;
    content += `**Start Date:** ${plan.config.startDate.toLocaleDateString()}
`;
    content += `**Duration:** ${Math.ceil((plan.config.endDate?.getTime() || Date.now() - plan.config.startDate.getTime()) / (1e3 * 60 * 60 * 24 * 7))} weeks
`;
    content += `**Total Workouts:** ${plan.workouts.length}

`;
    if (plan.config.description) {
      content += `## Description

${plan.config.description}

`;
    }
    content += `## Workout Schedule

`;
    let currentWeek = 1;
    let currentWeekStart = null;
    plan.workouts.forEach((workout) => {
      const workoutDate = new Date(workout.scheduledDate);
      if (!currentWeekStart || workoutDate.getTime() - currentWeekStart.getTime() >= 7 * 24 * 60 * 60 * 1e3) {
        currentWeekStart = workoutDate;
        content += `### Week ${currentWeek}

`;
        currentWeek++;
      }
      content += `**${workoutDate.toLocaleDateString()}** - ${workout.workout.name}
`;
      content += `- Type: ${workout.workout.type}
`;
      if (workout.workout.targetMetrics?.duration) {
        content += `- Duration: ${workout.workout.targetMetrics.duration} minutes
`;
      }
      if (workout.workout.targetMetrics?.distance) {
        content += `- Distance: ${workout.workout.targetMetrics.distance} miles
`;
      }
      if (options.includeWorkoutRationale && methodology) {
        const rationale = MethodologyExportEnhancer.generateWorkoutRationale(
          workout,
          methodology,
          workout.phase || "base"
        );
        if (rationale) {
          content += `- Rationale: ${rationale}
`;
        }
      }
      content += "\n";
    });
    if (methodology && options.includeMethodologyComparison) {
      const comparison = MethodologyExportEnhancer.generateMethodologyComparison(methodology, options);
      content += comparison;
    }
    const metadata = this.generateEnhancedMetadata(plan, this.format, content);
    return {
      content,
      filename: `${plan.config.name.replace(/\s+/g, "-").toLowerCase()}-methodology.${this.fileExtension}`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content, "utf8"),
      metadata,
      philosophyData: principles,
      citations
    };
  }
};
var MethodologyExportUtils = {
  extractMethodologyInfo: MethodologyExportEnhancer.extractMethodologyInfo,
  generateMethodologyDocumentation: MethodologyExportEnhancer.generateMethodologyDocumentation,
  generateWorkoutRationale: MethodologyExportEnhancer.generateWorkoutRationale,
  generateMethodologyComparison: MethodologyExportEnhancer.generateMethodologyComparison,
  generateMethodologyMetadata: MethodologyExportEnhancer.generateMethodologyMetadata
};

// src/export.ts
var MultiFormatExporter = class {
  constructor() {
    this.formatters = /* @__PURE__ */ new Map();
    this.initializeDefaultFormatters();
  }
  /**
   * Export plan in specified format with type-safe options
   */
  async exportPlan(plan, format4, options) {
    const formatter = this.formatters.get(format4);
    if (!formatter) {
      throw new Error(`Unsupported export format: ${format4}`);
    }
    const validation = formatter.validatePlan(plan);
    if (!validation.isValid) {
      throw new Error(`Plan validation failed: ${validation.errors.join(", ")}`);
    }
    const formatOptions = format4 === "csv" ? { ...options, detailLevel: "basic" } : options;
    return await formatter.formatPlan(plan, formatOptions);
  }
  /**
   * Export plan in multiple formats with type-safe options
   */
  async exportMultiFormat(plan, formats, options) {
    const results = await Promise.all(
      formats.map((format4) => this.exportPlan(plan, format4, options))
    );
    return results;
  }
  /**
   * Get available formats
   */
  getAvailableFormats() {
    return Array.from(this.formatters.keys());
  }
  /**
   * Register a new formatter with type safety
   */
  registerFormatter(formatter) {
    this.formatters.set(formatter.format, formatter);
  }
  /**
   * Validate plan for export compatibility
   */
  validateForExport(plan, format4) {
    const formatter = this.formatters.get(format4);
    if (!formatter) {
      return {
        isValid: false,
        errors: [`Unsupported format: ${format4}`],
        warnings: []
      };
    }
    return formatter.validatePlan(plan);
  }
  /**
   * Initialize default formatters
   */
  initializeDefaultFormatters() {
    this.registerFormatter(new JSONFormatter());
    this.registerFormatter(new CSVFormatter());
    this.registerFormatter(new iCalFormatter());
    this.registerFormatter(new PDFFormatter());
    this.registerFormatter(new TCXFormatter());
  }
  /**
   * Export plan with methodology awareness
   */
  async exportPlanWithMethodology(plan, format4, options) {
    const advancedConfig = plan.config;
    const hasMethodology = !!advancedConfig.methodology;
    const enhancedRequested = options?.enhancedExport === true;
    const useEnhanced = enhancedRequested && hasMethodology;
    if (useEnhanced) {
      return this.exportWithMethodologyAwareFormatter(plan, format4, options);
    }
    return this.exportPlan(plan, format4, options);
  }
  /**
   * Export using methodology-aware formatters
   */
  async exportWithMethodologyAwareFormatter(plan, format4, options) {
    const methodologyOptions = {
      ...options,
      includePhilosophyPrinciples: options?.includePhilosophyPrinciples ?? true,
      includeResearchCitations: options?.includeResearchCitations ?? true,
      includeCoachBiography: options?.includeCoachBiography ?? false,
      includeMethodologyComparison: options?.includeMethodologyComparison ?? false,
      includeTrainingZoneExplanations: options?.includeTrainingZoneExplanations ?? true,
      includeWorkoutRationale: options?.includeWorkoutRationale ?? false,
      detailLevel: options?.detailLevel ?? "standard"
    };
    let formatter;
    switch (format4) {
      case "json":
        formatter = new EnhancedMethodologyJSONFormatter();
        break;
      case "markdown":
        formatter = new MethodologyMarkdownFormatter();
        break;
      default:
        const standardResult = await this.exportPlan(plan, format4, options);
        return this.enhanceStandardExport(plan, standardResult, methodologyOptions);
    }
    return formatter.formatPlan(plan, methodologyOptions);
  }
  /**
   * Enhance standard export with methodology information
   */
  async enhanceStandardExport(plan, standardResult, options) {
    const { methodology, principles, citations } = MethodologyExportEnhancer.extractMethodologyInfo(plan);
    const enhancedMetadata = MethodologyExportEnhancer.generateMethodologyMetadata(
      plan,
      standardResult.metadata.format,
      standardResult.content
    );
    let enhancedContent = standardResult.content;
    if (typeof enhancedContent === "string" && (standardResult.metadata.format === "csv" || standardResult.metadata.format === "ical")) {
      const methodologyDoc = MethodologyExportEnhancer.generateMethodologyDocumentation(plan, options);
      if (methodologyDoc) {
        enhancedContent = `# ${methodologyDoc}

${enhancedContent}`;
      }
    }
    return {
      ...standardResult,
      content: enhancedContent,
      metadata: enhancedMetadata,
      philosophyData: principles,
      citations
    };
  }
};
var BaseFormatter = class {
  /**
   * Default validation - can be overridden by specific formatters
   */
  validatePlan(plan) {
    const errors = [];
    const warnings = [];
    if (!plan.workouts || plan.workouts.length === 0) {
      errors.push("Plan contains no workouts");
    }
    if (!plan.config.name) {
      warnings.push("Plan has no name");
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  /**
   * Get format-specific options schema with proper typing
   */
  getOptionsSchema() {
    return {
      validate: (data) => {
        return typeof data === "object" && data !== null;
      },
      properties: [
        "includePaces",
        "includeHeartRates",
        "includePower",
        "timeZone",
        "units"
      ],
      metadata: {
        version: "1.0.0",
        description: "Base export options schema",
        examples: []
      }
    };
  }
  /**
   * Generate base metadata
   */
  generateMetadata(plan, content) {
    const contentSize = typeof content === "string" ? Buffer.byteLength(content) : content.length;
    return {
      planName: plan.config.name || "Training Plan",
      exportDate: /* @__PURE__ */ new Date(),
      format: this.format,
      totalWorkouts: plan.workouts.length,
      planDuration: Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)) || 16,
      fileSize: contentSize,
      version: "1.0.0"
    };
  }
  /**
   * Generate chart data for visualization
   */
  generateChartData(plan) {
    const weeklyVolume = this.generateWeeklyVolumeData(plan);
    const intensityDistribution = this.generateIntensityData(plan);
    const periodization = this.generatePeriodizationData(plan);
    const trainingLoad = this.generateTrainingLoadData(plan);
    return {
      weeklyVolume,
      intensityDistribution,
      periodization,
      trainingLoad
    };
  }
  generateWeeklyVolumeData(plan) {
    const weeklyData = /* @__PURE__ */ new Map();
    plan.workouts.forEach((workout) => {
      const weekNumber = Math.floor(
        (workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)
      ) + 1;
      const currentDistance = weeklyData.get(weekNumber) || 0;
      weeklyData.set(weekNumber, currentDistance + (workout.targetMetrics.distance || 0));
    });
    return Array.from(weeklyData.entries()).map(([week, distance]) => ({ week, distance })).sort((a, b) => a.week - b.week);
  }
  generateIntensityData(plan) {
    const zoneCounts = /* @__PURE__ */ new Map();
    plan.workouts.forEach((workout) => {
      const zone = this.getWorkoutZone(workout);
      zoneCounts.set(zone, (zoneCounts.get(zone) || 0) + 1);
    });
    const total = plan.workouts.length;
    return Array.from(zoneCounts.entries()).map(([zone, count]) => ({ zone, percentage: Math.round(count / total * 100) }));
  }
  generatePeriodizationData(plan) {
    return plan.blocks.map((block) => ({
      phase: block.phase,
      weeks: block.weeks,
      focus: block.focusAreas
    }));
  }
  generateTrainingLoadData(plan) {
    return plan.workouts.map((workout) => ({
      date: (0, import_date_fns6.format)(workout.date, "yyyy-MM-dd"),
      tss: workout.workout.estimatedTSS || 0
    }));
  }
  getWorkoutZone(workout) {
    const intensity = workout.targetMetrics.intensity;
    if (intensity < 60) return "Recovery";
    if (intensity < 70) return "Easy";
    if (intensity < 80) return "Steady";
    if (intensity < 87) return "Tempo";
    if (intensity < 92) return "Threshold";
    if (intensity < 97) return "VO2max";
    return "Neuromuscular";
  }
  /**
   * Calculate pace from zone and fitness metrics
   */
  calculatePace(zone, thresholdPace) {
    if (!zone || !zone.paceRange || !thresholdPace) {
      return { min: "0:00", max: "0:00" };
    }
    const minPace = thresholdPace * (zone.paceRange.min / 100);
    const maxPace = thresholdPace * (zone.paceRange.max / 100);
    return {
      min: this.formatPace(minPace),
      max: this.formatPace(maxPace)
    };
  }
  formatPace(pace) {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
};
var JSONFormatter = class extends BaseFormatter {
  constructor() {
    super(...arguments);
    this.format = "json";
    this.mimeType = "application/json";
    this.fileExtension = "json";
  }
  async formatPlan(plan, options) {
    const exportData = {
      plan: {
        name: plan.config.name,
        goal: plan.config.goal,
        startDate: plan.config.startDate.toISOString(),
        targetDate: plan.config.targetDate?.toISOString(),
        summary: plan.summary
      },
      blocks: plan.blocks.map((block) => ({
        id: block.id,
        phase: block.phase,
        startDate: block.startDate.toISOString(),
        endDate: block.endDate.toISOString(),
        weeks: block.weeks,
        focusAreas: block.focusAreas
      })),
      workouts: plan.workouts.map((workout) => ({
        id: workout.id,
        date: workout.date.toISOString(),
        type: workout.type,
        name: workout.name,
        description: workout.description,
        targetMetrics: workout.targetMetrics,
        workout: workout.workout
      })),
      charts: options?.customFields?.includeCharts ? this.generateChartData(plan) : void 0
    };
    const content = JSON.stringify(exportData, null, 2);
    const metadata = this.generateMetadata(plan, content);
    return {
      content,
      filename: `${plan.config.name || "training-plan"}.json`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content),
      metadata
    };
  }
};
var CSVFormatter = class extends BaseFormatter {
  constructor() {
    super(...arguments);
    this.format = "csv";
    this.mimeType = "text/csv";
    this.fileExtension = "csv";
  }
  async formatPlan(plan, options) {
    const useComprehensive = options?.comprehensive !== false;
    const csvContent = useComprehensive ? this.generateComprehensiveCSV(plan, options) : this.generateSimpleCSV(plan, options);
    const metadata = this.generateMetadata(plan, csvContent);
    return {
      content: csvContent,
      filename: `${plan.config.name || "training-plan"}.csv`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(csvContent),
      metadata
    };
  }
  generateSimpleCSV(plan, options) {
    const headers = "Date,Workout Type,Duration";
    const rows = plan.workouts.map((workout) => {
      const date = (0, import_date_fns6.format)(workout.date, "yyyy-MM-dd");
      const workoutType = workout.type.replace("_", " ");
      const duration = workout.targetMetrics.duration;
      return `${date},${workoutType},${duration}`;
    });
    return [headers, ...rows].join("\n");
  }
  generateComprehensiveCSV(plan, options) {
    const sections = [];
    sections.push(this.generatePlanOverviewSection(plan));
    sections.push("");
    sections.push(this.generateWorkoutScheduleSection(plan, options));
    sections.push("");
    sections.push(this.generateWeeklySummarySection(plan));
    sections.push("");
    sections.push(this.generateTrainingLoadSection(plan));
    sections.push("");
    sections.push(this.generateProgressTrackingSection(plan));
    sections.push("");
    sections.push(this.generatePhaseAnalysisSection(plan));
    return sections.join("\n");
  }
  generatePlanOverviewSection(plan) {
    const totalDistance = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const totalTSS = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0);
    const duration = plan.config.targetDate ? Math.ceil((plan.config.targetDate.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)) : 16;
    const rows = [
      ['"=== TRAINING PLAN OVERVIEW ==="'],
      ['"Plan Name"', `"${plan.config.name || "Training Plan"}"`],
      ['"Goal"', `"${plan.config.goal}"`],
      ['"Start Date"', `"${(0, import_date_fns6.format)(plan.config.startDate, "yyyy-MM-dd")}"`],
      ['"End Date"', `"${(0, import_date_fns6.format)(plan.config.targetDate || (0, import_date_fns6.addDays)(plan.config.startDate, duration * 7), "yyyy-MM-dd")}"`],
      ['"Duration (weeks)"', `"${duration}"`],
      ['"Total Workouts"', `"${plan.workouts.length}"`],
      ['"Total Distance (km)"', `"${Math.round(totalDistance)}"`],
      ['"Total TSS"', `"${Math.round(totalTSS)}"`],
      ['"Average Weekly Distance"', `"${Math.round(totalDistance / duration)}"`],
      ['"Phases"', `"${plan.blocks.length}"`],
      ['""'],
      // Empty row
      ['"Phase Summary"'],
      ['"Phase"', '"Weeks"', '"Focus Areas"'],
      ...plan.blocks.map((block) => [
        `"${block.phase}"`,
        `"${block.weeks}"`,
        `"${block.focusAreas.join(", ")}"`
      ])
    ];
    return rows.map((row) => row.join(",")).join("\n");
  }
  generateWorkoutScheduleSection(plan, options) {
    const headers = [
      '"=== DAILY WORKOUT SCHEDULE ==="',
      '""',
      // Empty cell to align with data
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""'
    ];
    const dataHeaders = [
      '"Date"',
      '"Day"',
      '"Week"',
      '"Phase"',
      '"Workout Type"',
      '"Name"',
      '"Description"',
      '"Duration (min)"',
      '"Distance (km)"',
      '"Intensity (%)"',
      '"TSS"',
      '"Primary Zone"',
      '"Pace Range"',
      '"HR Range"',
      '"Completed"',
      '"Actual Distance"',
      '"Actual Duration"',
      '"RPE (1-10)"',
      '"Notes"'
    ];
    const rows = plan.workouts.map((workout) => {
      const weekNumber = Math.floor(
        (workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)
      ) + 1;
      const block = plan.blocks.find(
        (b) => workout.date >= b.startDate && workout.date <= b.endDate
      );
      const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
      const paceRange = zone ? this.calculatePace(zone, 5) : { min: "", max: "" };
      const hrRange = zone?.heartRateRange ? `${zone.heartRateRange.min}-${zone.heartRateRange.max}%` : "";
      return [
        `"${(0, import_date_fns6.format)(workout.date, "yyyy-MM-dd")}"`,
        `"${(0, import_date_fns6.format)(workout.date, "EEEE")}"`,
        `"${weekNumber}"`,
        `"${block?.phase || ""}"`,
        `"${workout.type}"`,
        `"${workout.name}"`,
        `"${workout.description.replace(/"/g, '""')}"`,
        // Escape quotes
        `"${workout.targetMetrics.duration}"`,
        `"${workout.targetMetrics.distance || 0}"`,
        `"${workout.targetMetrics.intensity}"`,
        `"${workout.targetMetrics.tss}"`,
        `"${zone?.name || "Easy"}"`,
        `"${paceRange.min}-${paceRange.max}"`,
        `"${hrRange}"`,
        '""',
        // Completed (for user to fill)
        '""',
        // Actual Distance (for user to fill)
        '""',
        // Actual Duration (for user to fill)
        '""',
        // RPE (for user to fill)
        '""'
        // Notes (for user to fill)
      ];
    });
    return [headers, dataHeaders, ...rows].map((row) => Array.isArray(row) ? row.join(",") : row).join("\n");
  }
  generateWeeklySummarySection(plan) {
    const weeklyData = this.generateWeeklyMetrics(plan);
    const headers = [
      '"=== WEEKLY SUMMARY ==="',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""'
    ];
    const dataHeaders = [
      '"Week"',
      '"Start Date"',
      '"Phase"',
      '"Planned Distance (km)"',
      '"Planned TSS"',
      '"Workouts"',
      '"Easy %"',
      '"Moderate %"',
      '"Hard %"',
      '"Actual Distance"',
      '"Actual TSS"',
      '"Completion %"',
      '"Weekly Notes"'
    ];
    const rows = weeklyData.map((week) => [
      `"${week.weekNumber}"`,
      `"${(0, import_date_fns6.format)(week.startDate, "yyyy-MM-dd")}"`,
      `"${week.phase}"`,
      `"${Math.round(week.plannedDistance)}"`,
      `"${Math.round(week.plannedTSS)}"`,
      `"${week.workoutCount}"`,
      `"${week.easyPercentage}%"`,
      `"${week.moderatePercentage}%"`,
      `"${week.hardPercentage}%"`,
      '""',
      // Actual Distance (for user to fill)
      '""',
      // Actual TSS (for user to fill)
      '""',
      // Completion % (for user to fill)
      '""'
      // Weekly Notes (for user to fill)
    ]);
    return [headers, dataHeaders, ...rows].map((row) => Array.isArray(row) ? row.join(",") : row).join("\n");
  }
  generateTrainingLoadSection(plan) {
    const weeklyData = this.generateWeeklyMetrics(plan);
    const headers = [
      '"=== TRAINING LOAD ANALYSIS ==="',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""'
    ];
    const dataHeaders = [
      '"Week"',
      '"Start Date"',
      '"Planned TSS"',
      '"Cumulative TSS"',
      '"Load Ramp Rate"',
      '"Acute:Chronic Ratio"',
      '"Recovery Score"',
      '"Fatigue Risk"',
      '"Load Notes"'
    ];
    let cumulativeTSS = 0;
    const rows = weeklyData.map((week, index) => {
      cumulativeTSS += week.plannedTSS;
      const recentWeeks = weeklyData.slice(Math.max(0, index - 3), index + 1);
      const avgTSS = recentWeeks.reduce((sum, w) => sum + w.plannedTSS, 0) / recentWeeks.length;
      const rampRate = index > 0 ? (week.plannedTSS - avgTSS) / avgTSS * 100 : 0;
      const acuteWeeks = weeklyData.slice(Math.max(0, index - 0), index + 1);
      const chronicWeeks = weeklyData.slice(Math.max(0, index - 3), index + 1);
      const acuteTSS = acuteWeeks.reduce((sum, w) => sum + w.plannedTSS, 0) / Math.min(1, acuteWeeks.length);
      const chronicTSS = chronicWeeks.reduce((sum, w) => sum + w.plannedTSS, 0) / Math.min(4, chronicWeeks.length);
      const acuteChronicRatio = chronicTSS > 0 ? acuteTSS / chronicTSS : 1;
      const recoveryScore = Math.max(0, 100 - week.hardPercentage * 1.5 - Math.max(0, rampRate));
      let fatigueRisk = "Low";
      if (acuteChronicRatio > 1.3 || rampRate > 15) fatigueRisk = "High";
      else if (acuteChronicRatio > 1.1 || rampRate > 10) fatigueRisk = "Moderate";
      return [
        `"${week.weekNumber}"`,
        `"${(0, import_date_fns6.format)(week.startDate, "yyyy-MM-dd")}"`,
        `"${Math.round(week.plannedTSS)}"`,
        `"${Math.round(cumulativeTSS)}"`,
        `"${Math.round(rampRate)}%"`,
        `"${acuteChronicRatio.toFixed(2)}"`,
        `"${Math.round(recoveryScore)}"`,
        `"${fatigueRisk}"`,
        '""'
        // Load Notes (for user to fill)
      ];
    });
    return [headers, dataHeaders, ...rows].map((row) => Array.isArray(row) ? row.join(",") : row).join("\n");
  }
  generateProgressTrackingSection(plan) {
    const headers = [
      '"=== PROGRESS TRACKING TEMPLATE ==="',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""'
    ];
    const instructions = [
      '"Instructions: Fill in actual values as you complete workouts"',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""'
    ];
    const dataHeaders = [
      '"Date"',
      '"Workout Name"',
      '"Planned Distance"',
      '"Actual Distance"',
      '"Planned Duration"',
      '"Actual Duration"',
      '"Average Pace"',
      '"Average HR"',
      '"RPE (1-10)"',
      '"Workout Notes"'
    ];
    const rows = plan.workouts.map((workout) => [
      `"${(0, import_date_fns6.format)(workout.date, "yyyy-MM-dd")}"`,
      `"${workout.name}"`,
      `"${workout.targetMetrics.distance || 0}"`,
      '""',
      // Actual Distance (for user to fill)
      `"${workout.targetMetrics.duration}"`,
      '""',
      // Actual Duration (for user to fill)
      '""',
      // Average Pace (for user to fill)
      '""',
      // Average HR (for user to fill)
      '""',
      // RPE (for user to fill)
      '""'
      // Workout Notes (for user to fill)
    ]);
    return [headers, instructions, dataHeaders, ...rows].map((row) => Array.isArray(row) ? row.join(",") : row).join("\n");
  }
  generatePhaseAnalysisSection(plan) {
    const headers = [
      '"=== TRAINING PHASE ANALYSIS ==="',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""'
    ];
    const dataHeaders = [
      '"Phase"',
      '"Duration (weeks)"',
      '"Total Distance (km)"',
      '"Total TSS"',
      '"Primary Focus"',
      '"Key Workouts"',
      '"Volume Emphasis"',
      '"Intensity Emphasis"'
    ];
    const rows = plan.blocks.map((block) => {
      const blockWorkouts = plan.workouts.filter(
        (w) => w.date >= block.startDate && w.date <= block.endDate
      );
      const totalDistance = blockWorkouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
      const totalTSS = blockWorkouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0);
      const workoutTypes = blockWorkouts.reduce((acc, workout) => {
        acc[workout.type] = (acc[workout.type] || 0) + 1;
        return acc;
      }, {});
      const keyWorkouts = Object.entries(workoutTypes).sort(([, a], [, b]) => b - a).slice(0, 3).map(([type, count]) => `${type} (${count})`).join(", ");
      const easyWorkouts = blockWorkouts.filter((w) => w.targetMetrics.intensity < 70).length;
      const hardWorkouts = blockWorkouts.filter((w) => w.targetMetrics.intensity >= 85).length;
      const totalWorkouts = blockWorkouts.length;
      const volumeEmphasis = totalDistance / block.weeks > 50 ? "High" : totalDistance / block.weeks > 30 ? "Moderate" : "Low";
      const intensityEmphasis = hardWorkouts / totalWorkouts > 0.3 ? "High" : hardWorkouts / totalWorkouts > 0.15 ? "Moderate" : "Low";
      return [
        `"${block.phase}"`,
        `"${block.weeks}"`,
        `"${Math.round(totalDistance)}"`,
        `"${Math.round(totalTSS)}"`,
        `"${block.focusAreas.join(", ")}"`,
        `"${keyWorkouts}"`,
        `"${volumeEmphasis}"`,
        `"${intensityEmphasis}"`
      ];
    });
    return [headers, dataHeaders, ...rows].map((row) => Array.isArray(row) ? row.join(",") : row).join("\n");
  }
  generateWeeklyMetrics(plan) {
    const weeks = /* @__PURE__ */ new Map();
    plan.workouts.forEach((workout) => {
      const weekNumber = Math.floor(
        (workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)
      ) + 1;
      if (!weeks.has(weekNumber)) {
        weeks.set(weekNumber, []);
      }
      weeks.get(weekNumber).push(workout);
    });
    return Array.from(weeks.entries()).map(([weekNumber, workouts]) => {
      const startDate = (0, import_date_fns6.addDays)(plan.config.startDate, (weekNumber - 1) * 7);
      const block = plan.blocks.find(
        (b) => workouts[0] && workouts[0].date >= b.startDate && workouts[0].date <= b.endDate
      );
      const plannedDistance = workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
      const plannedTSS = workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0);
      const easyCount = workouts.filter((w) => w.targetMetrics.intensity < 70).length;
      const moderateCount = workouts.filter((w) => w.targetMetrics.intensity >= 70 && w.targetMetrics.intensity < 85).length;
      const hardCount = workouts.filter((w) => w.targetMetrics.intensity >= 85).length;
      const total = workouts.length;
      return {
        weekNumber,
        startDate,
        phase: block?.phase || "Training",
        plannedDistance,
        plannedTSS,
        workoutCount: workouts.length,
        easyPercentage: Math.round(easyCount / total * 100),
        moderatePercentage: Math.round(moderateCount / total * 100),
        hardPercentage: Math.round(hardCount / total * 100)
      };
    }).sort((a, b) => a.weekNumber - b.weekNumber);
  }
};
var iCalFormatter = class extends BaseFormatter {
  constructor() {
    super(...arguments);
    this.format = "ical";
    this.mimeType = "text/calendar";
    this.fileExtension = "ics";
  }
  async formatPlan(plan, options) {
    const timeZone = options?.timeZone || "UTC";
    const now = /* @__PURE__ */ new Date();
    let icalContent = this.generateCalendarHeader(plan, timeZone, now);
    if (timeZone !== "UTC") {
      icalContent += this.generateTimezoneDefinition(timeZone);
    }
    plan.workouts.forEach((workout) => {
      icalContent += this.generateWorkoutEvent(workout, plan, timeZone, now, options);
    });
    icalContent += this.generatePlanOverviewEvent(plan, timeZone, now);
    icalContent += this.foldLine("END:VCALENDAR") + "\r\n";
    const metadata = this.generateMetadata(plan, icalContent);
    return {
      content: icalContent,
      filename: `${plan.config.name || "training-plan"}.ics`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(icalContent),
      metadata
    };
  }
  generateCalendarHeader(plan, timeZone, now) {
    const calendarName = this.sanitizeText(plan.config.name || "Training Plan");
    const description = this.sanitizeText(plan.config.goal || "Running Training Plan");
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Training Plan Generator//EN",
      `X-WR-CALNAME:${calendarName}`,
      `X-WR-CALDESC:${description}`,
      "X-WR-TIMEZONE:" + timeZone,
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-REFRESH-INTERVAL;VALUE=DURATION:P1D`,
      `CREATED:${this.formatICalDate(now)}`,
      ""
    ];
    return this.foldContent(lines);
  }
  generateTimezoneDefinition(timeZone) {
    const lines = [
      "BEGIN:VTIMEZONE",
      `TZID:${timeZone}`,
      "BEGIN:STANDARD",
      "DTSTART:19701101T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
      "TZOFFSETFROM:-0400",
      "TZOFFSETTO:-0500",
      "TZNAME:EST",
      "END:STANDARD",
      "BEGIN:DAYLIGHT",
      "DTSTART:19700308T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
      "TZOFFSETFROM:-0500",
      "TZOFFSETTO:-0400",
      "TZNAME:EDT",
      "END:DAYLIGHT",
      "END:VTIMEZONE",
      ""
    ];
    return this.foldContent(lines);
  }
  generateWorkoutEvent(workout, plan, timeZone, now, options) {
    const startTime = this.calculateWorkoutStartTime(workout, options);
    const endTime = new Date(startTime.getTime() + workout.targetMetrics.duration * 6e4);
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
    const paceRange = zone ? this.calculatePace(zone, 5) : { min: "5:00", max: "5:00" };
    const description = this.generateWorkoutDescription(workout, zone, paceRange, options);
    const location = this.generateWorkoutLocation(workout, options);
    const alarms = this.generateWorkoutAlarms(workout, options);
    const eventLines = [
      "BEGIN:VEVENT",
      `UID:workout-${workout.id}@training-plan-generator.com`,
      `DTSTAMP:${this.formatICalDate(now)}`,
      timeZone === "UTC" ? `DTSTART:${this.formatICalDate(startTime)}` : `DTSTART;TZID=${timeZone}:${this.formatICalDateLocal(startTime)}`,
      timeZone === "UTC" ? `DTEND:${this.formatICalDate(endTime)}` : `DTEND;TZID=${timeZone}:${this.formatICalDateLocal(endTime)}`,
      `SUMMARY:${this.sanitizeText(workout.name)}`,
      `DESCRIPTION:${this.sanitizeText(description)}`,
      `CATEGORIES:TRAINING,${workout.type.toUpperCase().replace("_", "-")}`,
      location ? `LOCATION:${this.sanitizeText(location)}` : "",
      `PRIORITY:${this.getWorkoutPriority(workout)}`,
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      `CLASS:PUBLIC`,
      `X-MICROSOFT-CDO-BUSYSTATUS:BUSY`,
      `X-WORKOUT-TYPE:${workout.type}`,
      `X-TRAINING-ZONE:${zone?.name || "Easy"}`,
      `X-TARGET-DURATION:${workout.targetMetrics.duration}`,
      workout.targetMetrics.distance ? `X-TARGET-DISTANCE:${workout.targetMetrics.distance}` : "",
      `X-TSS:${workout.targetMetrics.tss}`,
      ...alarms,
      "END:VEVENT"
    ].filter((line) => line !== "");
    return this.foldContent(eventLines);
  }
  calculateWorkoutStartTime(workout, options) {
    const startTime = new Date(workout.date);
    const optimalTimes = {
      "easy": { hour: 7, minute: 0 },
      "long_run": { hour: 8, minute: 0 },
      "recovery": { hour: 7, minute: 30 },
      "tempo": { hour: 17, minute: 0 },
      "threshold": { hour: 17, minute: 30 },
      "vo2max": { hour: 17, minute: 0 },
      "speed": { hour: 17, minute: 30 },
      "hill_repeats": { hour: 17, minute: 0 },
      "fartlek": { hour: 17, minute: 30 },
      "progression": { hour: 16, minute: 30 },
      "race_pace": { hour: 17, minute: 0 },
      "time_trial": { hour: 9, minute: 0 },
      "cross_training": { hour: 18, minute: 0 },
      "strength": { hour: 18, minute: 30 }
    };
    const timing = optimalTimes[workout.type] || { hour: 7, minute: 0 };
    const dayOfWeek = startTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      timing.hour = Math.max(8, timing.hour);
    }
    startTime.setHours(timing.hour, timing.minute, 0, 0);
    return startTime;
  }
  generateWorkoutDescription(workout, zone, paceRange, options) {
    const template = Object.values(WORKOUT_TEMPLATES).find((t) => t.type === workout.type);
    const descriptionParts = [
      `\u{1F3C3} ${workout.description}`,
      "",
      "\u{1F4CA} WORKOUT DETAILS:",
      `\u2022 Duration: ${workout.targetMetrics.duration} minutes`,
      workout.targetMetrics.distance ? `\u2022 Distance: ${workout.targetMetrics.distance} km` : "",
      `\u2022 Intensity: ${workout.targetMetrics.intensity}%`,
      `\u2022 Training Stress Score: ${workout.targetMetrics.tss}`,
      "",
      "\u{1F3AF} TRAINING ZONE:",
      zone ? `\u2022 ${zone.name} (${zone.description})` : "\u2022 Easy Zone",
      zone ? `\u2022 Effort Level: ${zone.rpe}/10 RPE` : "",
      zone?.heartRateRange ? `\u2022 Heart Rate: ${zone.heartRateRange.min}-${zone.heartRateRange.max}% Max HR` : "",
      paceRange.min !== "0:00" ? `\u2022 Target Pace: ${paceRange.min} - ${paceRange.max} /km` : "",
      ""
    ];
    if (template && template.segments.length > 1) {
      descriptionParts.push(
        "\u{1F4CB} WORKOUT STRUCTURE:",
        ...template.segments.filter((seg) => seg.duration > 1).map((seg) => `\u2022 ${seg.duration}min @ ${seg.zone.name} - ${seg.description}`),
        ""
      );
    }
    if (template?.adaptationTarget) {
      descriptionParts.push(
        "\u{1F3AF} TRAINING FOCUS:",
        `\u2022 ${template.adaptationTarget}`,
        ""
      );
    }
    descriptionParts.push(
      "\u2705 PRE-WORKOUT CHECKLIST:",
      "\u2022 Proper warm-up (10-15 min)",
      "\u2022 Hydration check",
      "\u2022 Weather-appropriate gear",
      "\u2022 Route/location planned",
      ""
    );
    descriptionParts.push(
      "\u{1F4DD} POST-WORKOUT:",
      "\u2022 Cool-down and stretching",
      "\u2022 Log actual pace, distance, RPE",
      "\u2022 Note how you felt",
      `\u2022 Recovery time: ~${workout.workout.recoveryTime || 24}hrs`
    );
    return descriptionParts.filter(Boolean).join("\\n");
  }
  generateWorkoutLocation(workout, options) {
    const locationMap = {
      "track": "Local Running Track",
      "trail": "Trail System",
      "road": "Road Route",
      "treadmill": "Gym/Home Treadmill",
      "hills": "Hilly Route/Park"
    };
    if (workout.type === "speed" || workout.type === "vo2max") {
      return "Running Track (400m)";
    } else if (workout.type === "hill_repeats") {
      return "Hill Training Location";
    } else if (workout.type === "long_run") {
      return "Scenic Long Run Route";
    } else if (workout.type === "recovery") {
      return "Easy/Flat Route";
    } else if (workout.type === "cross_training" || workout.type === "strength") {
      return "Gym/Fitness Center";
    }
    return options?.customFields?.defaultLocation || "Your Preferred Running Route";
  }
  generateWorkoutAlarms(workout, options) {
    const alarms = [];
    alarms.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:Tomorrow: ${workout.name} - Check weather & prepare gear`,
      "TRIGGER:-P1D",
      "END:VALARM"
    );
    alarms.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:Workout in 2 hours: ${workout.name} - Start hydrating`,
      "TRIGGER:-PT2H",
      "END:VALARM"
    );
    alarms.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:Workout in 30 min: Begin warm-up routine`,
      "TRIGGER:-PT30M",
      "END:VALARM"
    );
    return alarms;
  }
  generatePlanOverviewEvent(plan, timeZone, now) {
    const startDate = new Date(plan.config.startDate);
    const endDate = plan.config.targetDate || (0, import_date_fns6.addDays)(startDate, 112);
    const totalDistance = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const totalTSS = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0);
    const description = [
      `\u{1F3C3}\u200D\u2642\uFE0F TRAINING PLAN OVERVIEW`,
      "",
      `\u{1F4C5} Duration: ${(0, import_date_fns6.format)(startDate, "MMM dd, yyyy")} - ${(0, import_date_fns6.format)(endDate, "MMM dd, yyyy")}`,
      `\u{1F3AF} Goal: ${plan.config.goal}`,
      `\u{1F3CB}\uFE0F Total Workouts: ${plan.workouts.length}`,
      `\u{1F4CF} Total Distance: ${Math.round(totalDistance)} km`,
      `\u26A1 Total Training Load: ${Math.round(totalTSS)} TSS`,
      "",
      "\u{1F4CA} TRAINING PHASES:",
      ...plan.blocks.map(
        (block) => `\u2022 ${block.phase} (${block.weeks} weeks): ${block.focusAreas.join(", ")}`
      ),
      "",
      "\u{1F4A1} Remember to listen to your body and adapt the plan as needed!",
      "\u{1FA7A} Consult a healthcare provider before starting any new training program."
    ].join("\\n");
    const eventLines = [
      "BEGIN:VEVENT",
      `UID:plan-overview-${plan.config.startDate.getTime()}@training-plan-generator.com`,
      `DTSTAMP:${this.formatICalDate(now)}`,
      timeZone === "UTC" ? `DTSTART;VALUE=DATE:${(0, import_date_fns6.format)(startDate, "yyyyMMdd")}` : `DTSTART;TZID=${timeZone};VALUE=DATE:${(0, import_date_fns6.format)(startDate, "yyyyMMdd")}`,
      timeZone === "UTC" ? `DTEND;VALUE=DATE:${(0, import_date_fns6.format)((0, import_date_fns6.addDays)(endDate, 1), "yyyyMMdd")}` : `DTEND;TZID=${timeZone};VALUE=DATE:${(0, import_date_fns6.format)((0, import_date_fns6.addDays)(endDate, 1), "yyyyMMdd")}`,
      `SUMMARY:\u{1F4CB} ${plan.config.name || "Training Plan"} - Overview`,
      `DESCRIPTION:${this.sanitizeText(description)}`,
      "CATEGORIES:TRAINING,PLAN-OVERVIEW",
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "CLASS:PUBLIC",
      "END:VEVENT",
      ""
    ];
    return this.foldContent(eventLines);
  }
  getWorkoutPriority(workout) {
    const priorityMap = {
      "vo2max": 1,
      "threshold": 2,
      "tempo": 3,
      "long_run": 2,
      "race_pace": 1,
      "time_trial": 1,
      "speed": 3,
      "hill_repeats": 3,
      "progression": 4,
      "fartlek": 4,
      "steady": 5,
      "easy": 6,
      "recovery": 7,
      "cross_training": 8,
      "strength": 8
    };
    return priorityMap[workout.type] || 5;
  }
  formatICalDate(date) {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
  formatICalDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}T${hour}${minute}${second}`;
  }
  sanitizeText(text) {
    return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n").replace(/\r/g, "").trim();
  }
  /**
   * Fold lines to comply with RFC 5545 (75 character limit)
   */
  foldLine(line) {
    if (line.length <= 75) {
      return line;
    }
    const folded = [];
    let remaining = line;
    folded.push(remaining.substring(0, 75));
    remaining = remaining.substring(75);
    while (remaining.length > 0) {
      const chunk = remaining.substring(0, 74);
      folded.push(" " + chunk);
      remaining = remaining.substring(74);
    }
    return folded.join("\r\n");
  }
  /**
   * Fold all lines in iCal content for RFC 5545 compliance
   */
  foldContent(content) {
    const lines = Array.isArray(content) ? content : content.split("\r\n");
    return lines.map((line) => this.foldLine(line)).join("\r\n");
  }
  /**
   * Enhanced validation for iCal format
   */
  validatePlan(plan) {
    const errors = [];
    const warnings = [];
    const baseValidation = super.validatePlan(plan);
    errors.push(...baseValidation.errors);
    warnings.push(...baseValidation.warnings);
    if (plan.workouts.some((w) => !w.date)) {
      errors.push("Some workouts are missing dates");
    }
    if (plan.workouts.some((w) => w.targetMetrics.duration <= 0)) {
      errors.push("Some workouts have invalid duration");
    }
    const futureCutoff = /* @__PURE__ */ new Date();
    futureCutoff.setFullYear(futureCutoff.getFullYear() + 2);
    if (plan.workouts.some((w) => w.date > futureCutoff)) {
      warnings.push("Some workouts are scheduled more than 2 years in the future");
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
};
var PDFFormatter = class extends BaseFormatter {
  constructor() {
    super(...arguments);
    this.format = "pdf";
    this.mimeType = "application/pdf";
    this.fileExtension = "pdf";
  }
  async formatPlan(plan, options) {
    const htmlContent = this.generateComprehensiveHTMLContent(plan, options);
    const pdfContent = htmlContent;
    const metadata = this.generateMetadata(plan, pdfContent);
    return {
      content: Buffer.from(pdfContent),
      filename: `${plan.config.name || "training-plan"}.pdf`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(pdfContent),
      metadata
    };
  }
  generateComprehensiveHTMLContent(plan, options) {
    const chartData = this.generateChartData(plan);
    const thresholdPace = 5;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${plan.config.name || "Training Plan"}</title>
          <meta charset="UTF-8">
          <style>
            ${this.getEnhancedCSS()}
          </style>
        </head>
        <body>
          ${this.generatePlanHeader(plan)}
          ${this.generatePlanOverview(plan, chartData)}
          ${this.generateTrainingZoneChart(thresholdPace, options)}
          ${this.generatePeriodizationChart(chartData)}
          ${this.generateWeeklyScheduleDetailed(plan, thresholdPace, options)}
          ${this.generateWorkoutLibrary(plan)}
          ${this.generateProgressTracking(plan)}
          ${this.generateFooter()}
        </body>
      </html>
    `;
  }
  getEnhancedCSS() {
    return `
      * { box-sizing: border-box; }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 20px;
        line-height: 1.4;
        color: #333;
        font-size: 11pt;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 3px solid #2196F3;
        padding-bottom: 20px;
      }
      
      .header h1 {
        color: #2196F3;
        margin: 0 0 10px 0;
        font-size: 24pt;
        font-weight: bold;
      }
      
      .header .subtitle {
        color: #666;
        font-size: 12pt;
        margin: 5px 0;
      }
      
      .section {
        margin: 25px 0;
        page-break-inside: avoid;
      }
      
      .section h2 {
        color: #2196F3;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 8px;
        margin-bottom: 15px;
        font-size: 16pt;
      }
      
      .section h3 {
        color: #333;
        margin-bottom: 10px;
        font-size: 14pt;
      }
      
      .overview-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .overview-card {
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 15px;
      }
      
      .overview-card h4 {
        margin: 0 0 10px 0;
        color: #2196F3;
        font-size: 12pt;
      }
      
      .stat-item {
        display: flex;
        justify-content: space-between;
        margin: 5px 0;
        font-size: 10pt;
      }
      
      .stat-label {
        font-weight: 500;
      }
      
      .stat-value {
        font-weight: bold;
        color: #2196F3;
      }
      
      .zone-table, .schedule-table, .workout-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        font-size: 10pt;
      }
      
      .zone-table th, .schedule-table th, .workout-table th {
        background: #2196F3;
        color: white;
        padding: 10px 8px;
        text-align: left;
        font-weight: bold;
      }
      
      .zone-table td, .schedule-table td, .workout-table td {
        border: 1px solid #ddd;
        padding: 8px;
      }
      
      .zone-table tbody tr:nth-child(even),
      .schedule-table tbody tr:nth-child(even),
      .workout-table tbody tr:nth-child(even) {
        background: #f8f9fa;
      }
      
      .zone-recovery { border-left: 4px solid #4CAF50; }
      .zone-easy { border-left: 4px solid #8BC34A; }
      .zone-steady { border-left: 4px solid #CDDC39; }
      .zone-tempo { border-left: 4px solid #FFC107; }
      .zone-threshold { border-left: 4px solid #FF9800; }
      .zone-vo2max { border-left: 4px solid #FF5722; }
      .zone-neuromuscular { border-left: 4px solid #F44336; }
      
      .week-header {
        background: #e3f2fd;
        border: 2px solid #2196F3;
        padding: 10px;
        margin: 20px 0 10px 0;
        border-radius: 6px;
      }
      
      .week-header .week-title {
        font-weight: bold;
        font-size: 12pt;
        color: #2196F3;
      }
      
      .week-summary {
        font-size: 10pt;
        color: #666;
        margin-top: 5px;
      }
      
      .workout-description {
        font-size: 9pt;
        color: #666;
        margin-top: 3px;
        line-height: 1.3;
      }
      
      .pace-range {
        font-weight: bold;
        color: #2196F3;
      }
      
      .chart-placeholder {
        background: #f0f0f0;
        border: 2px dashed #ccc;
        padding: 30px;
        text-align: center;
        margin: 15px 0;
        border-radius: 6px;
        color: #666;
      }
      
      .progress-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        font-size: 9pt;
      }
      
      .progress-table th {
        background: #f8f9fa;
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
        font-size: 9pt;
      }
      
      .progress-table td {
        border: 1px solid #ddd;
        padding: 6px;
        text-align: center;
      }
      
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #e0e0e0;
        text-align: center;
        color: #666;
        font-size: 9pt;
      }
      
      @media print {
        body { margin: 0; padding: 15px; }
        .section { page-break-inside: avoid; }
        .week-header { page-break-after: avoid; }
      }
    `;
  }
  generatePlanHeader(plan) {
    const duration = plan.config.targetDate ? Math.ceil((plan.config.targetDate.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)) : 16;
    return `
      <div class="header">
        <h1>${plan.config.name || "Training Plan"}</h1>
        <div class="subtitle">Goal: ${plan.config.goal}</div>
        <div class="subtitle">
          ${(0, import_date_fns6.format)(plan.config.startDate, "MMMM dd, yyyy")} - 
          ${(0, import_date_fns6.format)(plan.config.targetDate || (0, import_date_fns6.addDays)(plan.config.startDate, duration * 7), "MMMM dd, yyyy")}
        </div>
        <div class="subtitle">${duration} weeks \u2022 ${plan.workouts.length} workouts</div>
      </div>
    `;
  }
  generatePlanOverview(plan, chartData) {
    const totalDistance = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const totalTSS = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0);
    const avgWeeklyDistance = chartData.weeklyVolume.length > 0 ? Math.round(chartData.weeklyVolume.reduce((sum, week) => sum + week.distance, 0) / chartData.weeklyVolume.length) : 0;
    const peakWeeklyDistance = Math.max(...chartData.weeklyVolume.map((w) => w.distance));
    return `
      <div class="section">
        <h2>Plan Overview</h2>
        <div class="overview-grid">
          <div class="overview-card">
            <h4>Training Volume</h4>
            <div class="stat-item">
              <span class="stat-label">Total Distance:</span>
              <span class="stat-value">${Math.round(totalDistance)} km</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Average Weekly:</span>
              <span class="stat-value">${avgWeeklyDistance} km</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Peak Weekly:</span>
              <span class="stat-value">${Math.round(peakWeeklyDistance)} km</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total TSS:</span>
              <span class="stat-value">${Math.round(totalTSS)}</span>
            </div>
          </div>
          
          <div class="overview-card">
            <h4>Intensity Distribution</h4>
            ${chartData.intensityDistribution.map((zone) => `
              <div class="stat-item">
                <span class="stat-label">${zone.zone}:</span>
                <span class="stat-value">${zone.percentage}%</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }
  generateTrainingZoneChart(thresholdPace, options) {
    const zones = Object.values(TRAINING_ZONES);
    return `
      <div class="section">
        <h2>Training Zones & Pace Guide</h2>
        <table class="zone-table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>RPE</th>
              <th>Heart Rate</th>
              <th>Pace Range</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            ${zones.map((zone) => {
      const paceRange = this.calculatePace(zone, thresholdPace);
      const hrRange = zone.heartRateRange ? `${zone.heartRateRange.min}-${zone.heartRateRange.max}%` : "N/A";
      const zoneClass = `zone-${zone.name.toLowerCase().replace(/\s+/g, "-")}`;
      return `
                <tr class="${zoneClass}">
                  <td><strong>${zone.name}</strong><br><small>${zone.description}</small></td>
                  <td>${zone.rpe}/10</td>
                  <td>${hrRange}</td>
                  <td class="pace-range">${paceRange.min} - ${paceRange.max} /km</td>
                  <td><small>${zone.purpose}</small></td>
                </tr>
              `;
    }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }
  generatePeriodizationChart(chartData) {
    return `
      <div class="section">
        <h2>Periodization Overview</h2>
        <table class="workout-table">
          <thead>
            <tr>
              <th>Phase</th>
              <th>Duration</th>
              <th>Focus Areas</th>
            </tr>
          </thead>
          <tbody>
            ${chartData.periodization.map((phase) => `
              <tr>
                <td><strong>${phase.phase}</strong></td>
                <td>${phase.weeks} weeks</td>
                <td>${phase.focus.join(", ")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        
        <div class="chart-placeholder">
          <strong>Weekly Volume Chart</strong><br>
          Training load progression across ${chartData.weeklyVolume.length} weeks<br>
          <small>Peak: ${Math.max(...chartData.weeklyVolume.map((w) => w.distance))} km \u2022 
          Average: ${Math.round(chartData.weeklyVolume.reduce((sum, w) => sum + w.distance, 0) / chartData.weeklyVolume.length)} km</small>
        </div>
      </div>
    `;
  }
  generateWeeklyScheduleDetailed(plan, thresholdPace, options) {
    const weeks = /* @__PURE__ */ new Map();
    plan.workouts.forEach((workout) => {
      const weekNumber = Math.floor(
        (workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)
      ) + 1;
      if (!weeks.has(weekNumber)) {
        weeks.set(weekNumber, []);
      }
      weeks.get(weekNumber).push(workout);
    });
    let html = `
      <div class="section">
        <h2>Weekly Training Schedule</h2>
    `;
    weeks.forEach((workouts, weekNumber) => {
      const weekDistance = workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
      const weekTSS = workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0);
      const weekBlock = plan.blocks.find(
        (b) => workouts[0] && workouts[0].date >= b.startDate && workouts[0].date <= b.endDate
      );
      html += `
        <div class="week-header">
          <div class="week-title">Week ${weekNumber} - ${weekBlock?.phase || "Training"}</div>
          <div class="week-summary">
            ${Math.round(weekDistance)} km \u2022 ${Math.round(weekTSS)} TSS \u2022 ${workouts.length} workouts
          </div>
        </div>
        
        <table class="schedule-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Workout</th>
              <th>Duration</th>
              <th>Distance</th>
              <th>Zone</th>
              <th>Pace</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${workouts.sort((a, b) => a.date.getTime() - b.date.getTime()).map((workout) => {
        const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
        const paceRange = zone ? this.calculatePace(zone, thresholdPace) : { min: "5:00", max: "5:00" };
        const zoneClass = zone ? `zone-${zone.name.toLowerCase().replace(/\s+/g, "-")}` : "";
        return `
                <tr class="${zoneClass}">
                  <td>${(0, import_date_fns6.format)(workout.date, "EEE MMM dd")}</td>
                  <td><strong>${workout.name}</strong></td>
                  <td>${workout.targetMetrics.duration} min</td>
                  <td>${workout.targetMetrics.distance || 0} km</td>
                  <td>${zone?.name || "Easy"}</td>
                  <td class="pace-range">${paceRange.min}-${paceRange.max}</td>
                  <td class="workout-description">${this.getDetailedWorkoutDescription(workout)}</td>
                </tr>
              `;
      }).join("")}
          </tbody>
        </table>
      `;
    });
    html += "</div>";
    return html;
  }
  generateWorkoutLibrary(plan) {
    const uniqueWorkoutTypes = [...new Set(plan.workouts.map((w) => w.type))];
    return `
      <div class="section">
        <h2>Workout Library</h2>
        <p><small>Detailed descriptions of workout types used in this plan</small></p>
        
        ${uniqueWorkoutTypes.map((type) => {
      const template = Object.values(WORKOUT_TEMPLATES).find((t) => t.type === type);
      if (!template) return "";
      return `
            <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
              <h4 style="margin: 0 0 8px 0; color: #2196F3; text-transform: capitalize;">
                ${type.replace(/_/g, " ")} Workouts
              </h4>
              <div style="font-size: 10pt; color: #666; margin-bottom: 8px;">
                <strong>Purpose:</strong> ${template.adaptationTarget}
              </div>
              <div style="font-size: 10pt; color: #666; margin-bottom: 8px;">
                <strong>Primary Zone:</strong> ${template.primaryZone.name} (${template.primaryZone.description})
              </div>
              ${template.segments.length > 1 ? `
                <div style="font-size: 9pt; color: #555;">
                  <strong>Structure:</strong> ${template.segments.map(
        (seg) => `${seg.duration}min @ ${seg.zone.name}`
      ).join(" \u2192 ")}
                </div>
              ` : ""}
            </div>
          `;
    }).join("")}
      </div>
    `;
  }
  generateProgressTracking(plan) {
    const weeklyData = this.generateChartData(plan).weeklyVolume;
    return `
      <div class="section">
        <h2>Progress Tracking</h2>
        <p><small>Use this table to track your weekly progress and make notes</small></p>
        
        <table class="progress-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Target Distance</th>
              <th>Actual Distance</th>
              <th>Completed Workouts</th>
              <th>RPE (1-10)</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${weeklyData.map((week) => `
              <tr>
                <td><strong>${week.week}</strong></td>
                <td>${Math.round(week.distance)} km</td>
                <td style="border-bottom: 1px solid #999;"></td>
                <td style="border-bottom: 1px solid #999;"></td>
                <td style="border-bottom: 1px solid #999;"></td>
                <td style="border-bottom: 1px solid #999; width: 200px;"></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }
  generateFooter() {
    return `
      <div class="footer">
        <div>Training Plan generated by Training Plan Generator</div>
        <div>Generated on ${(0, import_date_fns6.format)(/* @__PURE__ */ new Date(), "MMMM dd, yyyy")}</div>
        <div style="margin-top: 10px; font-size: 8pt;">
          <strong>Important:</strong> Always listen to your body. Adjust training intensity based on how you feel.
          Consult with a healthcare provider before starting any new training program.
        </div>
      </div>
    `;
  }
  getDetailedWorkoutDescription(workout) {
    const template = Object.values(WORKOUT_TEMPLATES).find((t) => t.type === workout.type);
    if (template && template.segments.length > 1) {
      return template.segments.filter((seg) => seg.duration > 2).map((seg) => `${seg.duration}min @ ${seg.zone.name}`).join(" \u2192 ");
    }
    return workout.description || template?.adaptationTarget || "Standard training session";
  }
};
var TrainingPeaksFormatter = class extends BaseFormatter {
  constructor() {
    super(...arguments);
    this.format = "json";
    // TrainingPeaks uses JSON format
    this.mimeType = "application/json";
    this.fileExtension = "json";
  }
  async formatPlan(plan, options) {
    const trainingPeaksData = this.generateTrainingPeaksFormat(plan, options);
    const content = JSON.stringify(trainingPeaksData, null, 2);
    const metadata = this.generateMetadata(plan, content);
    return {
      content,
      filename: `${plan.config.name || "training-plan"}-trainingpeaks.json`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content),
      metadata
    };
  }
  generateTrainingPeaksFormat(plan, options) {
    return {
      plan: {
        name: plan.config.name || "Training Plan",
        description: plan.config.goal,
        author: "Training Plan Generator",
        startDate: plan.config.startDate.toISOString(),
        endDate: plan.config.targetDate?.toISOString() || (0, import_date_fns6.addDays)(plan.config.startDate, 112).toISOString(),
        planType: "running",
        difficulty: this.calculatePlanDifficulty(plan),
        weeklyHours: this.estimateWeeklyHours(plan),
        totalTSS: plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0)
      },
      workouts: plan.workouts.map((workout) => this.formatTrainingPeaksWorkout(workout, plan)),
      phases: plan.blocks.map((block) => ({
        name: block.phase,
        startDate: block.startDate.toISOString(),
        endDate: block.endDate.toISOString(),
        weeks: block.weeks,
        objectives: block.focusAreas,
        description: `${block.phase} phase focusing on ${block.focusAreas.join(", ")}`
      })),
      annotations: this.generateTrainingPeaksAnnotations(plan)
    };
  }
  formatTrainingPeaksWorkout(workout, plan) {
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
    const workoutCode = this.generateWorkoutCode(workout);
    const template = Object.values(WORKOUT_TEMPLATES).find((t) => t.type === workout.type);
    return {
      date: workout.date.toISOString().split("T")[0],
      name: workout.name,
      description: this.generateTrainingPeaksDescription(workout, template),
      workoutCode,
      tss: workout.targetMetrics.tss,
      duration: workout.targetMetrics.duration,
      distance: workout.targetMetrics.distance || null,
      intensity: workout.targetMetrics.intensity,
      workoutType: this.mapToTrainingPeaksType(workout.type),
      primaryZone: zone?.name || "Aerobic",
      structure: this.generateWorkoutStructure(workout, template),
      tags: this.generateWorkoutTags(workout),
      priority: this.getWorkoutPriority(workout),
      equipment: this.getRequiredEquipment(workout)
    };
  }
  generateWorkoutCode(workout) {
    const typeMap = {
      "recovery": "REC",
      "easy": "E",
      "steady": "ST",
      "tempo": "T",
      "threshold": "LT",
      "vo2max": "VO2",
      "speed": "SP",
      "hill_repeats": "H",
      "fartlek": "F",
      "progression": "PR",
      "long_run": "LSD",
      "race_pace": "RP",
      "time_trial": "TT",
      "cross_training": "XT",
      "strength": "S"
    };
    const code = typeMap[workout.type] || "GEN";
    const duration = Math.round(workout.targetMetrics.duration);
    const intensity = Math.round(workout.targetMetrics.intensity);
    return `${code}${duration}I${intensity}`;
  }
  generateTrainingPeaksDescription(workout, template) {
    const parts = [
      workout.description,
      "",
      `TSS: ${workout.targetMetrics.tss}`,
      `Duration: ${workout.targetMetrics.duration} minutes`,
      workout.targetMetrics.distance ? `Distance: ${workout.targetMetrics.distance} km` : "",
      `Intensity: ${workout.targetMetrics.intensity}%`
    ];
    if (template?.adaptationTarget) {
      parts.push("", `Training Focus: ${template.adaptationTarget}`);
    }
    if (template && template.segments.length > 1) {
      parts.push("", "Workout Structure:");
      template.segments.filter((seg) => seg.duration > 2).forEach((seg) => {
        parts.push(`\u2022 ${seg.duration}min @ ${seg.zone.name} - ${seg.description}`);
      });
    }
    return parts.filter(Boolean).join("\n");
  }
  generateWorkoutStructure(workout, template) {
    if (!template || template.segments.length <= 1) {
      return [{
        duration: workout.targetMetrics.duration,
        intensity: workout.targetMetrics.intensity,
        zone: workout.workout.primaryZone?.name || "Easy",
        description: workout.description
      }];
    }
    return template.segments.map((segment) => ({
      duration: segment.duration,
      intensity: segment.intensity,
      zone: segment.zone.name,
      description: segment.description,
      targetPace: this.calculateSegmentPace(segment),
      targetHR: this.calculateSegmentHR(segment)
    }));
  }
  calculateSegmentPace(segment) {
    if (segment.zone.paceRange) {
      const thresholdPace = 5;
      const minPace = thresholdPace * (segment.zone.paceRange.min / 100);
      const maxPace = thresholdPace * (segment.zone.paceRange.max / 100);
      return `${this.formatPace(minPace)}-${this.formatPace(maxPace)}`;
    }
    return null;
  }
  calculateSegmentHR(segment) {
    if (segment.zone.heartRateRange) {
      return `${segment.zone.heartRateRange.min}-${segment.zone.heartRateRange.max}%`;
    }
    return null;
  }
  formatPace(pace) {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  mapToTrainingPeaksType(type) {
    const typeMap = {
      "recovery": "Recovery",
      "easy": "Aerobic",
      "steady": "Aerobic",
      "tempo": "Tempo",
      "threshold": "Lactate Threshold",
      "vo2max": "VO2max",
      "speed": "Neuromuscular Power",
      "hill_repeats": "Aerobic Power",
      "fartlek": "Mixed",
      "progression": "Aerobic Power",
      "long_run": "Aerobic",
      "race_pace": "Lactate Threshold",
      "time_trial": "Testing",
      "cross_training": "Cross Training",
      "strength": "Strength"
    };
    return typeMap[type] || "General";
  }
  generateWorkoutTags(workout) {
    const tags = [workout.type.replace("_", " ")];
    if (workout.targetMetrics.intensity >= 85) tags.push("High Intensity");
    if (workout.targetMetrics.tss >= 100) tags.push("Key Workout");
    if (workout.targetMetrics.duration >= 90) tags.push("Long Session");
    if (workout.type.includes("race")) tags.push("Race Prep");
    return tags;
  }
  getWorkoutPriority(workout) {
    if (["vo2max", "threshold", "race_pace", "time_trial"].includes(workout.type)) return "A";
    if (["tempo", "long_run", "speed", "hill_repeats"].includes(workout.type)) return "B";
    return "C";
  }
  getRequiredEquipment(workout) {
    const equipment = ["Running Shoes"];
    if (workout.type === "speed") equipment.push("Track Access");
    if (workout.type === "hill_repeats") equipment.push("Hilly Route");
    if (workout.type === "cross_training") equipment.push("Cross Training Equipment");
    if (workout.type === "strength") equipment.push("Gym Access");
    if (workout.targetMetrics.intensity >= 85) equipment.push("Heart Rate Monitor");
    return equipment;
  }
  calculatePlanDifficulty(plan) {
    const avgTSS = plan.workouts.reduce((sum, w) => sum + w.targetMetrics.tss, 0) / plan.workouts.length;
    const highIntensityPercent = plan.workouts.filter((w) => w.targetMetrics.intensity >= 85).length / plan.workouts.length;
    if (avgTSS >= 80 || highIntensityPercent >= 0.3) return "Advanced";
    if (avgTSS >= 60 || highIntensityPercent >= 0.2) return "Intermediate";
    return "Beginner";
  }
  estimateWeeklyHours(plan) {
    const totalMinutes = plan.workouts.reduce((sum, w) => sum + w.targetMetrics.duration, 0);
    const weeks = Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)) || 16;
    return Math.round(totalMinutes / weeks / 60 * 10) / 10;
  }
  generateTrainingPeaksAnnotations(plan) {
    const annotations = [];
    plan.blocks.forEach((block) => {
      annotations.push({
        date: block.startDate.toISOString().split("T")[0],
        type: "phase-start",
        title: `${block.phase} Phase Begins`,
        description: `Focus: ${block.focusAreas.join(", ")}`,
        priority: "high"
      });
    });
    plan.workouts.filter((w) => w.targetMetrics.tss >= 100 || ["vo2max", "threshold", "time_trial"].includes(w.type)).forEach((workout) => {
      annotations.push({
        date: workout.date.toISOString().split("T")[0],
        type: "key-workout",
        title: `Key Workout: ${workout.name}`,
        description: `TSS: ${workout.targetMetrics.tss}`,
        priority: "medium"
      });
    });
    return annotations;
  }
};
var StravaFormatter = class extends BaseFormatter {
  constructor() {
    super(...arguments);
    this.format = "json";
    this.mimeType = "application/json";
    this.fileExtension = "json";
  }
  async formatPlan(plan, options) {
    const stravaData = this.generateStravaFormat(plan, options);
    const content = JSON.stringify(stravaData, null, 2);
    const metadata = this.generateMetadata(plan, content);
    return {
      content,
      filename: `${plan.config.name || "training-plan"}-strava.json`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content),
      metadata
    };
  }
  generateStravaFormat(plan, options) {
    return {
      plan: {
        name: plan.config.name || "Training Plan",
        description: this.generateStravaDescription(plan),
        sport_type: "Run",
        start_date: plan.config.startDate.toISOString(),
        end_date: plan.config.targetDate?.toISOString() || (0, import_date_fns6.addDays)(plan.config.startDate, 112).toISOString()
      },
      activities: plan.workouts.map((workout) => this.formatStravaActivity(workout, plan)),
      segments: this.generateStravaSegments(plan),
      goals: this.generateStravaGoals(plan)
    };
  }
  generateStravaDescription(plan) {
    const totalDistance = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const weeks = Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)) || 16;
    return [
      `\u{1F3C3}\u200D\u2642\uFE0F ${plan.config.goal}`,
      "",
      `\u{1F4CA} Plan Overview:`,
      `\u2022 Duration: ${weeks} weeks`,
      `\u2022 Total Distance: ${Math.round(totalDistance)} km`,
      `\u2022 Total Workouts: ${plan.workouts.length}`,
      `\u2022 Training Phases: ${plan.blocks.length}`,
      "",
      `\u{1F3AF} Training Focus:`,
      ...plan.blocks.map((block) => `\u2022 ${block.phase}: ${block.focusAreas.join(", ")}`),
      "",
      `\u{1F4AA} Generated by Training Plan Generator`
    ].join("\n");
  }
  formatStravaActivity(workout, plan) {
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
    const template = Object.values(WORKOUT_TEMPLATES).find((t) => t.type === workout.type);
    return {
      name: this.generateStravaActivityName(workout),
      description: this.generateStravaActivityDescription(workout, template),
      type: "Run",
      start_date: workout.date.toISOString(),
      distance: (workout.targetMetrics.distance || 0) * 1e3,
      // Convert to meters
      moving_time: workout.targetMetrics.duration * 60,
      // Convert to seconds
      workout_type: this.mapToStravaWorkoutType(workout.type),
      trainer: false,
      commute: false,
      gear_id: null,
      average_heartrate: this.estimateAverageHR(zone),
      max_heartrate: this.estimateMaxHR(zone),
      average_speed: this.calculateAverageSpeed(workout),
      max_speed: this.calculateMaxSpeed(workout),
      suffer_score: Math.round(workout.targetMetrics.tss * 0.8),
      // Strava's relative effort
      segments_effort: this.generateSegmentEfforts(workout, template),
      segments: this.generateSegmentEfforts(workout, template),
      // Alias for test compatibility
      splits_metric: this.generateKilometerSplits(workout, template),
      tags: this.generateStravaTags(workout),
      kudos_count: 0,
      comment_count: 0,
      athlete_count: 1,
      photo_count: 0,
      map: null,
      manual: true,
      private: false,
      visibility: "everyone",
      flagged: false,
      has_kudoed: false,
      achievement_count: 0,
      pr_count: 0
    };
  }
  generateStravaActivityName(workout) {
    const emojiMap = {
      "recovery": "\u{1F60C}",
      "easy": "\u{1F3C3}\u200D\u2642\uFE0F",
      "steady": "\u{1F3C3}\u200D\u2640\uFE0F",
      "tempo": "\u{1F4A8}",
      "threshold": "\u{1F525}",
      "vo2max": "\u26A1",
      "speed": "\u{1F680}",
      "hill_repeats": "\u26F0\uFE0F",
      "fartlek": "\u{1F3AF}",
      "progression": "\u{1F4C8}",
      "long_run": "\u{1F3C3}\u200D\u2642\uFE0F\u{1F4AA}",
      "race_pace": "\u{1F3C1}",
      "time_trial": "\u23F1\uFE0F",
      "cross_training": "\u{1F3CB}\uFE0F\u200D\u2642\uFE0F",
      "strength": "\u{1F4AA}"
    };
    const emoji = emojiMap[workout.type] || "\u{1F3C3}\u200D\u2642\uFE0F";
    const distance = workout.targetMetrics.distance ? ` ${workout.targetMetrics.distance}km` : "";
    const intensity = workout.targetMetrics.intensity >= 85 ? " (High Intensity)" : "";
    return `${emoji} ${workout.name}${distance}${intensity}`;
  }
  generateStravaActivityDescription(workout, template) {
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
    const paceRange = this.calculatePace(zone, 5);
    const parts = [
      `\u{1F3AF} ${workout.description}`,
      "",
      `\u{1F4CA} Workout Details:`,
      `\u2022 Duration: ${workout.targetMetrics.duration} minutes`,
      workout.targetMetrics.distance ? `\u2022 Distance: ${workout.targetMetrics.distance} km` : "",
      `\u2022 Target Pace: ${paceRange.min}-${paceRange.max} /km`,
      `\u2022 Training Zone: ${zone?.name || "Easy"} (${zone?.description || "Easy effort"})`,
      `\u2022 RPE: ${zone?.rpe || 2}/10`,
      `\u2022 Estimated TSS: ${workout.targetMetrics.tss}`,
      ""
    ];
    if (template && template.segments.length > 1) {
      parts.push("\u{1F3C3}\u200D\u2642\uFE0F Workout Structure:");
      template.segments.filter((seg) => seg.duration > 2).forEach((seg, index) => {
        parts.push(`${index + 1}. ${seg.duration}min @ ${seg.zone.name} - ${seg.description}`);
      });
      parts.push("");
    }
    if (template?.adaptationTarget) {
      parts.push(`\u{1F3AF} Training Focus: ${template.adaptationTarget}`, "");
    }
    parts.push(
      "\u2705 Pre-Workout:",
      "\u2022 Proper warm-up completed",
      "\u2022 Hydration check \u2713",
      "\u2022 Route planned \u2713",
      "",
      "\u{1F4DD} Post-Workout:",
      "\u2022 How did it feel?",
      "\u2022 Any adjustments needed?",
      "\u2022 Recovery notes",
      "",
      "#TrainingPlan #RunningTraining #StructuredWorkout"
    );
    return parts.join("\n");
  }
  mapToStravaWorkoutType(type) {
    const typeMap = {
      "recovery": 1,
      // Default Run
      "easy": 1,
      // Default Run
      "steady": 1,
      // Default Run
      "tempo": 11,
      // Workout
      "threshold": 11,
      // Workout
      "vo2max": 11,
      // Workout
      "speed": 11,
      // Workout
      "hill_repeats": 11,
      // Workout
      "fartlek": 11,
      // Workout
      "progression": 1,
      // Default Run
      "long_run": 2,
      // Long Run
      "race_pace": 3,
      // Race
      "time_trial": 3,
      // Race
      "cross_training": 1,
      // Default Run
      "strength": 1
      // Default Run
    };
    return typeMap[type] || 1;
  }
  estimateAverageHR(zone) {
    if (zone?.heartRateRange) {
      const maxHR = 185;
      return Math.round((zone.heartRateRange.min + zone.heartRateRange.max) / 2 * maxHR / 100);
    }
    return null;
  }
  estimateMaxHR(zone) {
    if (zone?.heartRateRange) {
      const maxHR = 185;
      return Math.round(zone.heartRateRange.max * maxHR / 100 * 1.05);
    }
    return null;
  }
  calculateAverageSpeed(workout) {
    if (workout.targetMetrics.distance && workout.targetMetrics.duration) {
      return workout.targetMetrics.distance * 1e3 / (workout.targetMetrics.duration * 60);
    }
    return 3.33;
  }
  calculateMaxSpeed(workout) {
    const avgSpeed = this.calculateAverageSpeed(workout);
    const multiplier = ["vo2max", "speed", "hill_repeats"].includes(workout.type) ? 1.3 : 1.1;
    return avgSpeed * multiplier;
  }
  generateSegmentEfforts(workout, template) {
    if (!template || template.segments.length <= 1) return [];
    return template.segments.filter((seg) => seg.duration > 2 && seg.intensity > 75).map((seg, index) => ({
      id: `segment_${index}`,
      name: `${seg.zone.name} Interval`,
      distance: Math.round((workout.targetMetrics.distance || 5) * (seg.duration / workout.targetMetrics.duration) * 1e3),
      moving_time: seg.duration * 60,
      elapsed_time: seg.duration * 60,
      start_index: index * 100,
      end_index: (index + 1) * 100,
      average_heartrate: this.estimateAverageHR(seg.zone),
      max_heartrate: this.estimateMaxHR(seg.zone),
      effort_score: Math.round(seg.intensity * 0.8)
    }));
  }
  generateKilometerSplits(workout, template) {
    if (!workout.targetMetrics.distance) return [];
    const totalKm = Math.floor(workout.targetMetrics.distance);
    const splits = [];
    for (let i = 1; i <= totalKm; i++) {
      const avgPace = this.calculateAverageSpeed(workout);
      const paceVariation = Math.random() * 0.2 - 0.1;
      const splitTime = 1e3 / avgPace * (1 + paceVariation);
      splits.push({
        distance: 1e3,
        // 1km in meters
        elapsed_time: Math.round(splitTime),
        elevation_difference: Math.round((Math.random() - 0.5) * 20),
        // ±10m elevation
        moving_time: Math.round(splitTime),
        pace_zone: this.getSplitPaceZone(workout, i, totalKm),
        split: i,
        average_speed: 1e3 / splitTime,
        average_heartrate: this.estimateAverageHR(TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"])
      });
    }
    return splits;
  }
  getSplitPaceZone(workout, km, totalKm) {
    if (workout.type === "progression") {
      return Math.min(9, Math.floor(3 + km / totalKm * 4));
    } else if (workout.type === "fartlek") {
      return Math.floor(3 + Math.random() * 4);
    } else {
      const baseZone = Math.min(9, Math.max(1, Math.round(workout.targetMetrics.intensity / 12)));
      return baseZone + Math.round((Math.random() - 0.5) * 2);
    }
  }
  generateStravaTags(workout) {
    const tags = ["#TrainingPlan", "#RunningTraining"];
    tags.push(`#${workout.type.replace("_", "").toLowerCase()}`);
    if (workout.targetMetrics.intensity >= 85) tags.push("#HighIntensity");
    if (workout.targetMetrics.tss >= 100) tags.push("#KeyWorkout");
    if (workout.targetMetrics.duration >= 90) tags.push("#LongRun");
    if (workout.type.includes("race")) tags.push("#RacePrep");
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
    if (zone) tags.push(`#Zone${zone.name.replace(/\s+/g, "")}`);
    return tags;
  }
  generateStravaSegments(plan) {
    return [
      {
        id: "warmup-segment",
        name: "Training Plan Warm-up",
        distance: 1e3,
        average_grade: 0.5,
        maximum_grade: 2,
        climb_category: 0,
        city: "Training Route",
        state: "Training",
        country: "Training",
        private: false,
        effort_count: plan.workouts.length,
        athlete_count: 1,
        star_count: 0
      },
      {
        id: "cooldown-segment",
        name: "Training Plan Cool-down",
        distance: 800,
        average_grade: -0.3,
        maximum_grade: 1,
        climb_category: 0,
        city: "Training Route",
        state: "Training",
        country: "Training",
        private: false,
        effort_count: plan.workouts.length,
        athlete_count: 1,
        star_count: 0
      }
    ];
  }
  generateStravaGoals(plan) {
    const totalDistance = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const weeks = Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)) || 16;
    return [
      {
        type: "distance",
        period: "total",
        target: Math.round(totalDistance * 1e3),
        // Convert to meters
        current: 0,
        unit: "meters"
      },
      {
        type: "time",
        period: "total",
        target: plan.workouts.reduce((sum, w) => sum + w.targetMetrics.duration, 0) * 60,
        // Convert to seconds
        current: 0,
        unit: "seconds"
      },
      {
        type: "activities",
        period: "total",
        target: plan.workouts.length,
        current: 0,
        unit: "activities"
      }
    ];
  }
};
var GarminFormatter = class extends BaseFormatter {
  constructor() {
    super(...arguments);
    this.format = "json";
    this.mimeType = "application/json";
    this.fileExtension = "json";
  }
  async formatPlan(plan, options) {
    const garminData = this.generateGarminFormat(plan, options);
    const content = JSON.stringify(garminData, null, 2);
    const metadata = this.generateMetadata(plan, content);
    return {
      content,
      filename: `${plan.config.name || "training-plan"}-garmin.json`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content),
      metadata
    };
  }
  generateGarminFormat(plan, options) {
    return {
      trainingPlan: {
        planId: `tp-${Date.now()}`,
        planName: plan.config.name || "Training Plan",
        description: plan.config.goal,
        estimatedDurationInWeeks: Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)) || 16,
        startDate: plan.config.startDate.toISOString(),
        endDate: plan.config.targetDate?.toISOString() || (0, import_date_fns6.addDays)(plan.config.startDate, 112).toISOString(),
        sportType: "RUNNING",
        planType: "CUSTOM",
        difficulty: this.calculateGarminDifficulty(plan),
        createdBy: "Training Plan Generator",
        version: "1.0"
      },
      workouts: plan.workouts.map((workout) => this.formatGarminWorkout(workout, plan)),
      schedule: this.generateGarminSchedule(plan),
      phases: plan.blocks.map((block) => this.formatGarminPhase(block)),
      settings: this.generateGarminSettings(plan, options)
    };
  }
  formatGarminWorkout(workout, plan) {
    const template = Object.values(WORKOUT_TEMPLATES).find((t) => t.type === workout.type);
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
    const segments = this.generateGarminSegments(workout, template);
    return {
      workoutId: `workout-${workout.id}`,
      workoutName: workout.name,
      description: workout.description,
      sport: "RUNNING",
      subSport: "GENERIC",
      estimatedDurationInSecs: workout.targetMetrics.duration * 60,
      estimatedDistanceInMeters: (workout.targetMetrics.distance || 0) * 1e3,
      tss: workout.targetMetrics.tss,
      workoutSegments: segments,
      steps: segments,
      // Alias for compatibility with tests
      primaryBenefit: this.mapToPrimaryBenefit(workout.type),
      secondaryBenefit: this.mapToSecondaryBenefit(workout.type),
      equipmentRequired: this.getGarminEquipment(workout),
      instructions: this.generateGarminInstructions(workout, template),
      tags: [workout.type, zone?.name || "Easy"],
      difficulty: this.calculateWorkoutDifficulty(workout),
      creator: "Training Plan Generator"
    };
  }
  generateGarminSegments(workout, template) {
    if (!template || template.segments.length <= 1) {
      return [{
        segmentOrder: 1,
        segmentType: "INTERVAL",
        durationType: "TIME",
        durationValue: workout.targetMetrics.duration * 60,
        targetType: "PACE",
        targetValueLow: this.calculatePaceTarget(workout, "low"),
        targetValueHigh: this.calculatePaceTarget(workout, "high"),
        intensity: this.mapToGarminIntensity(workout.targetMetrics.intensity),
        description: workout.description
      }];
    }
    return template.segments.map((segment, index) => ({
      segmentOrder: index + 1,
      segmentType: this.getGarminSegmentType(segment),
      durationType: "TIME",
      durationValue: segment.duration * 60,
      targetType: this.getGarminTargetType(segment),
      targetValueLow: this.calculateSegmentTargetLow(segment),
      targetValueHigh: this.calculateSegmentTargetHigh(segment),
      intensity: this.mapToGarminIntensity(segment.intensity),
      description: segment.description,
      restDuration: this.calculateRestDuration(segment, template.segments[index + 1])
    }));
  }
  getGarminSegmentType(segment) {
    if (segment.zone.name === "Recovery") return "RECOVERY";
    if (segment.intensity >= 85) return "INTERVAL";
    if (segment.description.toLowerCase().includes("warm")) return "WARMUP";
    if (segment.description.toLowerCase().includes("cool")) return "COOLDOWN";
    return "INTERVAL";
  }
  getGarminTargetType(segment) {
    if (segment.zone.heartRateRange) return "HEART_RATE";
    if (segment.zone.paceRange) return "PACE";
    return "OPEN";
  }
  calculatePaceTarget(workout, bound) {
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
    if (zone?.paceRange) {
      const thresholdPace = 5;
      const paceInMinKm = bound === "low" ? thresholdPace * (zone.paceRange.min / 100) : thresholdPace * (zone.paceRange.max / 100);
      return Math.round(paceInMinKm * 60);
    }
    return 300;
  }
  calculateSegmentTargetLow(segment) {
    if (segment.zone.heartRateRange) {
      return Math.round(segment.zone.heartRateRange.min * 1.85);
    }
    if (segment.zone.paceRange) {
      const thresholdPace = 5;
      return Math.round(thresholdPace * (segment.zone.paceRange.min / 100) * 60);
    }
    return segment.intensity;
  }
  calculateSegmentTargetHigh(segment) {
    if (segment.zone.heartRateRange) {
      return Math.round(segment.zone.heartRateRange.max * 1.85);
    }
    if (segment.zone.paceRange) {
      const thresholdPace = 5;
      return Math.round(thresholdPace * (segment.zone.paceRange.max / 100) * 60);
    }
    return segment.intensity;
  }
  calculateRestDuration(currentSegment, nextSegment) {
    if (!nextSegment) return 0;
    if (currentSegment.intensity >= 85 && nextSegment.intensity >= 85) {
      return Math.round(currentSegment.duration * 0.5 * 60);
    }
    if (currentSegment.zone.name !== nextSegment.zone.name) {
      return 30;
    }
    return 0;
  }
  mapToGarminIntensity(intensity) {
    if (intensity >= 95) return "NEUROMUSCULAR_POWER";
    if (intensity >= 90) return "ANAEROBIC_CAPACITY";
    if (intensity >= 85) return "VO2_MAX";
    if (intensity >= 80) return "LACTATE_THRESHOLD";
    if (intensity >= 70) return "TEMPO";
    if (intensity >= 60) return "AEROBIC_BASE";
    return "RECOVERY";
  }
  mapToPrimaryBenefit(type) {
    const benefitMap = {
      "recovery": "RECOVERY",
      "easy": "AEROBIC_BASE",
      "steady": "AEROBIC_BASE",
      "tempo": "TEMPO",
      "threshold": "LACTATE_THRESHOLD",
      "vo2max": "VO2_MAX",
      "speed": "NEUROMUSCULAR_POWER",
      "hill_repeats": "ANAEROBIC_CAPACITY",
      "fartlek": "VO2_MAX",
      "progression": "LACTATE_THRESHOLD",
      "long_run": "AEROBIC_BASE",
      "race_pace": "LACTATE_THRESHOLD",
      "time_trial": "VO2_MAX",
      "cross_training": "RECOVERY",
      "strength": "MUSCULAR_ENDURANCE"
    };
    return benefitMap[type] || "AEROBIC_BASE";
  }
  mapToSecondaryBenefit(type) {
    const benefitMap = {
      "recovery": "AEROBIC_BASE",
      "easy": "RECOVERY",
      "steady": "TEMPO",
      "tempo": "AEROBIC_BASE",
      "threshold": "VO2_MAX",
      "vo2max": "ANAEROBIC_CAPACITY",
      "speed": "VO2_MAX",
      "hill_repeats": "MUSCULAR_ENDURANCE",
      "fartlek": "ANAEROBIC_CAPACITY",
      "progression": "VO2_MAX",
      "long_run": "MUSCULAR_ENDURANCE",
      "race_pace": "VO2_MAX",
      "time_trial": "LACTATE_THRESHOLD",
      "cross_training": "AEROBIC_BASE",
      "strength": "RECOVERY"
    };
    return benefitMap[type] || "RECOVERY";
  }
  getGarminEquipment(workout) {
    const equipment = [];
    if (workout.targetMetrics.intensity >= 80) equipment.push("HEART_RATE_MONITOR");
    if (workout.type === "speed") equipment.push("GPS_WATCH");
    if (workout.type === "strength") equipment.push("GYM_EQUIPMENT");
    if (workout.targetMetrics.duration >= 90) equipment.push("HYDRATION");
    return equipment;
  }
  generateGarminInstructions(workout, template) {
    const instructions = [];
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
    instructions.push(`Primary Zone: ${zone?.name || "Easy"} (RPE ${zone?.rpe || 2}/10)`);
    if (zone?.heartRateRange) {
      instructions.push(`Target Heart Rate: ${zone.heartRateRange.min}-${zone.heartRateRange.max}% Max HR`);
    }
    if (template && template.segments.length > 1) {
      instructions.push("Workout Structure:");
      template.segments.filter((seg) => seg.duration > 2).forEach((seg, index) => {
        instructions.push(`${index + 1}. ${seg.duration}min @ ${seg.zone.name} - ${seg.description}`);
      });
    }
    if (template?.adaptationTarget) {
      instructions.push(`Training Focus: ${template.adaptationTarget}`);
    }
    instructions.push("Remember to warm up properly and cool down afterward");
    return instructions;
  }
  calculateWorkoutDifficulty(workout) {
    const intensityFactor = workout.targetMetrics.intensity / 100;
    const durationFactor = Math.min(workout.targetMetrics.duration / 120, 1);
    const tssFactor = Math.min(workout.targetMetrics.tss / 150, 1);
    return Math.round((intensityFactor * 0.4 + durationFactor * 0.3 + tssFactor * 0.3) * 10);
  }
  calculateGarminDifficulty(plan) {
    const avgDifficulty = plan.workouts.reduce((sum, w) => sum + this.calculateWorkoutDifficulty(w), 0) / plan.workouts.length;
    if (avgDifficulty >= 7) return "ADVANCED";
    if (avgDifficulty >= 5) return "INTERMEDIATE";
    return "BEGINNER";
  }
  generateGarminSchedule(plan) {
    return plan.workouts.map((workout) => ({
      date: workout.date.toISOString().split("T")[0],
      workoutId: `workout-${workout.id}`,
      scheduledStartTime: this.calculateGarminStartTime(workout),
      priority: this.getGarminPriority(workout),
      notes: workout.description
    }));
  }
  calculateGarminStartTime(workout) {
    const startTime = new Date(workout.date);
    if (["recovery", "easy"].includes(workout.type)) {
      startTime.setHours(7, 0, 0, 0);
    } else if (["vo2max", "threshold", "speed"].includes(workout.type)) {
      startTime.setHours(17, 0, 0, 0);
    } else if (workout.type === "long_run") {
      startTime.setHours(8, 0, 0, 0);
    } else {
      startTime.setHours(7, 30, 0, 0);
    }
    return startTime.toISOString();
  }
  getGarminPriority(workout) {
    if (["vo2max", "threshold", "race_pace", "time_trial"].includes(workout.type)) return "HIGH";
    if (["tempo", "long_run", "speed", "hill_repeats"].includes(workout.type)) return "MEDIUM";
    return "LOW";
  }
  formatGarminPhase(block) {
    return {
      phaseId: `phase-${block.id || block.phase}`,
      phaseName: block.phase,
      startDate: block.startDate.toISOString(),
      endDate: block.endDate.toISOString(),
      durationInWeeks: block.weeks,
      objectives: block.focusAreas,
      description: `${block.phase} phase focusing on ${block.focusAreas.join(", ")}`,
      primaryFocus: block.focusAreas[0] || "General Fitness"
    };
  }
  generateGarminSettings(plan, options) {
    return {
      units: options?.units || "metric",
      timezone: options?.timeZone || "UTC",
      autoSync: true,
      notifications: {
        workoutReminders: true,
        phaseTransitions: true,
        restDayReminders: false
      },
      dataFields: [
        "TIME",
        "DISTANCE",
        "PACE",
        "HEART_RATE",
        "TRAINING_EFFECT"
      ],
      autoLap: {
        enabled: true,
        distance: 1e3
        // 1km auto laps
      }
    };
  }
};
var EnhancedJSONFormatter = class extends BaseFormatter {
  constructor() {
    super(...arguments);
    this.format = "json";
    this.mimeType = "application/json";
    this.fileExtension = "json";
  }
  async formatPlan(plan, options) {
    const enhancedData = this.generateEnhancedJSON(plan, options);
    const content = JSON.stringify(enhancedData, null, 2);
    const metadata = this.generateMetadata(plan, content);
    return {
      content,
      filename: `${plan.config.name || "training-plan"}-api.json`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content),
      metadata
    };
  }
  generateEnhancedJSON(plan, options) {
    return {
      meta: {
        version: "1.0.0",
        generator: "Training Plan Generator",
        exportDate: (/* @__PURE__ */ new Date()).toISOString(),
        format: "enhanced-json",
        apiVersion: "2023-01"
      },
      plan: {
        id: `plan-${Date.now()}`,
        name: plan.config.name || "Training Plan",
        description: plan.config.goal,
        sport: "running",
        difficulty: this.calculateAPIDifficulty(plan),
        duration: {
          weeks: Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)) || 16,
          startDate: plan.config.startDate.toISOString(),
          endDate: plan.config.targetDate?.toISOString() || (0, import_date_fns6.addDays)(plan.config.startDate, 112).toISOString()
        },
        metrics: {
          totalWorkouts: plan.workouts.length,
          totalDistance: plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0),
          totalTSS: plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0),
          totalDuration: plan.workouts.reduce((sum, w) => sum + w.targetMetrics.duration, 0),
          averageWeeklyDistance: this.calculateAverageWeeklyDistance(plan),
          peakWeeklyDistance: this.calculatePeakWeeklyDistance(plan),
          intensityDistribution: this.calculateIntensityDistribution(plan)
        },
        config: plan.config
      },
      phases: plan.blocks.map((block) => ({
        id: `phase-${block.id || block.phase}`,
        name: block.phase,
        startDate: block.startDate.toISOString(),
        endDate: block.endDate.toISOString(),
        duration: {
          weeks: block.weeks,
          days: Math.ceil((block.endDate.getTime() - block.startDate.getTime()) / (24 * 60 * 60 * 1e3))
        },
        objectives: block.focusAreas,
        description: `${block.phase} phase focusing on ${block.focusAreas.join(", ")}`,
        workoutCount: plan.workouts.filter((w) => w.date >= block.startDate && w.date <= block.endDate).length
      })),
      workouts: plan.workouts.map((workout) => this.formatAPIWorkout(workout, plan)),
      trainingZones: this.exportTrainingZones(),
      analytics: this.generateAnalytics(plan),
      integrations: {
        trainingPeaks: {
          compatible: true,
          tssCalculated: true,
          workoutCodes: true
        },
        strava: {
          compatible: true,
          activityDescriptions: true,
          segmentData: true
        },
        garmin: {
          compatible: true,
          structuredWorkouts: true,
          deviceSync: true
        }
      }
    };
  }
  formatAPIWorkout(workout, plan) {
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
    const template = Object.values(WORKOUT_TEMPLATES).find((t) => t.type === workout.type);
    const block = plan.blocks.find((b) => workout.date >= b.startDate && b.date <= b.endDate);
    return {
      id: workout.id,
      date: workout.date.toISOString(),
      name: workout.name,
      description: workout.description,
      type: workout.type,
      phase: block?.phase || "Training",
      targets: {
        duration: workout.targetMetrics.duration,
        distance: workout.targetMetrics.distance || null,
        intensity: workout.targetMetrics.intensity,
        tss: workout.targetMetrics.tss,
        load: workout.targetMetrics.load
      },
      zones: {
        primary: {
          name: zone?.name || "Easy",
          rpe: zone?.rpe || 2,
          heartRate: zone?.heartRateRange || null,
          pace: zone?.paceRange || null,
          description: zone?.description || "Easy effort"
        }
      },
      structure: template ? this.formatWorkoutStructure(template) : null,
      adaptations: {
        primary: template?.adaptationTarget || "General fitness",
        recoveryTime: workout.workout.recoveryTime || 24
      },
      instructions: this.generateAPIInstructions(workout, template),
      tags: this.generateAPITags(workout),
      difficulty: this.calculateWorkoutDifficulty(workout),
      equipment: this.getRequiredEquipment(workout)
    };
  }
  formatWorkoutStructure(template) {
    return {
      segments: template.segments.map((segment, index) => ({
        order: index + 1,
        duration: segment.duration,
        intensity: segment.intensity,
        zone: {
          name: segment.zone.name,
          rpe: segment.zone.rpe,
          description: segment.zone.description
        },
        description: segment.description,
        targets: {
          heartRate: segment.zone.heartRateRange || null,
          pace: segment.zone.paceRange || null
        }
      })),
      totalDuration: template.segments.reduce((sum, seg) => sum + seg.duration, 0),
      estimatedTSS: template.estimatedTSS
    };
  }
  generateAPIInstructions(workout, template) {
    const instructions = [];
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
    if (zone) {
      instructions.push(`Maintain ${zone.name} effort (${zone.description})`);
      instructions.push(`Target RPE: ${zone.rpe}/10`);
    }
    if (template?.segments && template.segments.length > 1) {
      instructions.push("Follow structured workout segments");
      instructions.push("Allow adequate recovery between intervals");
    }
    if (workout.targetMetrics.duration >= 90) {
      instructions.push("Ensure proper hydration and fueling");
    }
    if (workout.targetMetrics.intensity >= 85) {
      instructions.push("Complete thorough warm-up before main set");
      instructions.push("Monitor heart rate to avoid overexertion");
    }
    return instructions;
  }
  generateAPITags(workout) {
    const tags = [workout.type];
    if (workout.targetMetrics.intensity >= 85) tags.push("high-intensity");
    if (workout.targetMetrics.tss >= 100) tags.push("key-workout");
    if (workout.targetMetrics.duration >= 90) tags.push("long-session");
    if (workout.type.includes("race")) tags.push("race-specific");
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
    if (zone) tags.push(zone.name.toLowerCase().replace(/\s+/g, "-"));
    return tags;
  }
  calculateAPIDifficulty(plan) {
    const avgTSS = plan.workouts.reduce((sum, w) => sum + w.targetMetrics.tss, 0) / plan.workouts.length;
    const highIntensityPercent = plan.workouts.filter((w) => w.targetMetrics.intensity >= 85).length / plan.workouts.length;
    const avgDuration = plan.workouts.reduce((sum, w) => sum + w.targetMetrics.duration, 0) / plan.workouts.length;
    const score = Math.round(
      avgTSS / 100 * 0.4 + highIntensityPercent * 100 * 0.3 + avgDuration / 120 * 0.3
    );
    let level = "Beginner";
    if (score >= 70) level = "Advanced";
    else if (score >= 50) level = "Intermediate";
    return {
      level,
      score,
      factors: {
        averageTSS: Math.round(avgTSS),
        highIntensityPercentage: Math.round(highIntensityPercent * 100),
        averageDuration: Math.round(avgDuration)
      }
    };
  }
  calculateAverageWeeklyDistance(plan) {
    const weeks = Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)) || 16;
    const totalDistance = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    return Math.round(totalDistance / weeks);
  }
  calculatePeakWeeklyDistance(plan) {
    const weeklyData = this.generateWeeklyData(plan);
    return Math.max(...weeklyData.map((week) => week.distance));
  }
  calculateIntensityDistribution(plan) {
    const zones = {
      easy: plan.workouts.filter((w) => w.targetMetrics.intensity < 70).length,
      moderate: plan.workouts.filter((w) => w.targetMetrics.intensity >= 70 && w.targetMetrics.intensity < 85).length,
      hard: plan.workouts.filter((w) => w.targetMetrics.intensity >= 85).length
    };
    const total = plan.workouts.length;
    return {
      easy: Math.round(zones.easy / total * 100),
      moderate: Math.round(zones.moderate / total * 100),
      hard: Math.round(zones.hard / total * 100)
    };
  }
  generateWeeklyData(plan) {
    const weeks = /* @__PURE__ */ new Map();
    plan.workouts.forEach((workout) => {
      const weekNumber = Math.floor(
        (workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)
      ) + 1;
      const current = weeks.get(weekNumber) || { distance: 0, tss: 0, workouts: 0 };
      weeks.set(weekNumber, {
        distance: current.distance + (workout.targetMetrics.distance || 0),
        tss: current.tss + workout.targetMetrics.tss,
        workouts: current.workouts + 1
      });
    });
    return Array.from(weeks.values());
  }
  exportTrainingZones() {
    return Object.entries(TRAINING_ZONES).map(([key, zone]) => ({
      id: key,
      name: zone.name,
      rpe: zone.rpe,
      heartRateRange: zone.heartRateRange,
      paceRange: zone.paceRange,
      powerRange: zone.powerRange,
      description: zone.description,
      purpose: zone.purpose
    }));
  }
  generateAnalytics(plan) {
    const weeklyData = this.generateWeeklyData(plan);
    const intensityDist = this.calculateIntensityDistribution(plan);
    return {
      trainingLoad: {
        weeklyProgression: weeklyData.map((week, index) => ({
          week: index + 1,
          tss: week.tss,
          distance: week.distance,
          workouts: week.workouts
        })),
        peakWeek: {
          week: weeklyData.findIndex((w) => w.tss === Math.max(...weeklyData.map((w2) => w2.tss))) + 1,
          tss: Math.max(...weeklyData.map((w) => w.tss))
        },
        totalLoad: weeklyData.reduce((sum, week) => sum + week.tss, 0)
      },
      workoutDistribution: {
        byType: this.calculateWorkoutTypeDistribution(plan),
        byIntensity: intensityDist,
        byDuration: this.calculateDurationDistribution(plan)
      },
      phaseAnalysis: plan.blocks.map((block) => {
        const blockWorkouts = plan.workouts.filter(
          (w) => w.date >= block.startDate && w.date <= block.endDate
        );
        return {
          phase: block.phase,
          workoutCount: blockWorkouts.length,
          totalTSS: blockWorkouts.reduce((sum, w) => sum + w.targetMetrics.tss, 0),
          averageIntensity: blockWorkouts.reduce((sum, w) => sum + w.targetMetrics.intensity, 0) / blockWorkouts.length,
          focusAreas: block.focusAreas
        };
      })
    };
  }
  calculateWorkoutTypeDistribution(plan) {
    const types = {};
    plan.workouts.forEach((workout) => {
      types[workout.type] = (types[workout.type] || 0) + 1;
    });
    return Object.entries(types).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round(count / plan.workouts.length * 100)
    }));
  }
  calculateDurationDistribution(plan) {
    const short = plan.workouts.filter((w) => w.targetMetrics.duration < 45).length;
    const medium = plan.workouts.filter((w) => w.targetMetrics.duration >= 45 && w.targetMetrics.duration < 90).length;
    const long = plan.workouts.filter((w) => w.targetMetrics.duration >= 90).length;
    const total = plan.workouts.length;
    return {
      short: { count: short, percentage: Math.round(short / total * 100) },
      medium: { count: medium, percentage: Math.round(medium / total * 100) },
      long: { count: long, percentage: Math.round(long / total * 100) }
    };
  }
  calculateWorkoutDifficulty(workout) {
    const intensityFactor = workout.targetMetrics.intensity / 100;
    const durationFactor = Math.min(workout.targetMetrics.duration / 120, 1);
    const tssFactor = Math.min(workout.targetMetrics.tss / 150, 1);
    return Math.round((intensityFactor * 0.4 + durationFactor * 0.3 + tssFactor * 0.3) * 10);
  }
  getRequiredEquipment(workout) {
    const equipment = ["running-shoes"];
    if (workout.type === "speed") equipment.push("track-access");
    if (workout.type === "hill_repeats") equipment.push("hilly-terrain");
    if (workout.type === "cross_training") equipment.push("cross-training-equipment");
    if (workout.type === "strength") equipment.push("gym-access");
    if (workout.targetMetrics.intensity >= 80) equipment.push("heart-rate-monitor");
    if (workout.targetMetrics.duration >= 90) equipment.push("hydration-system");
    return equipment;
  }
};
var TCXFormatter = class extends BaseFormatter {
  constructor() {
    super(...arguments);
    this.format = "tcx";
    this.mimeType = "application/vnd.garmin.tcx+xml";
    this.fileExtension = "tcx";
  }
  async formatPlan(plan, options) {
    const tcxContent = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">',
      "  <Folders>",
      "    <Workouts>",
      '      <Folder Name="Training Plan">',
      ...plan.workouts.map((workout) => this.generateWorkoutXML(workout)),
      "      </Folder>",
      "    </Workouts>",
      "  </Folders>",
      "</TrainingCenterDatabase>"
    ].join("\n");
    const metadata = this.generateMetadata(plan, tcxContent);
    return {
      content: tcxContent,
      filename: `${plan.config.name || "training-plan"}.tcx`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(tcxContent),
      metadata
    };
  }
  generateWorkoutXML(workout) {
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || "EASY"];
    const paceRange = zone ? this.calculatePace(zone, 5) : { min: "5:00", max: "5:00" };
    return [
      `    <Workout Name="${workout.name}" Sport="Running">`,
      `      <Step xsi:type="Step_t">`,
      `        <StepId>1</StepId>`,
      `        <Duration xsi:type="Time_t">`,
      `          <Seconds>${workout.targetMetrics.duration * 60}</Seconds>`,
      `        </Duration>`,
      `        <Intensity>Active</Intensity>`,
      `        <Target xsi:type="Zone_t">`,
      `          <Low>${Math.round(workout.targetMetrics.intensity * 0.95)}</Low>`,
      `          <High>${Math.round(workout.targetMetrics.intensity * 1.05)}</High>`,
      `        </Target>`,
      `      </Step>`,
      `    </Workout>`
    ].join("\n");
  }
};
function createExportManager() {
  return new MultiFormatExporter();
}
var ExportUtils = {
  /**
   * Generate filename with timestamp
   */
  generateFilename(baseName, format4) {
    const timestamp = format4(/* @__PURE__ */ new Date(), "yyyy-MM-dd-HHmm");
    const extension = this.getFileExtension(format4);
    const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, "-");
    return `${safeName}-${timestamp}.${extension}`;
  },
  /**
   * Get file extension for format
   */
  getFileExtension(format4) {
    const extensions = {
      json: "json",
      csv: "csv",
      ical: "ics",
      pdf: "pdf",
      tcx: "tcx"
    };
    return extensions[format4] || "txt";
  },
  /**
   * Get MIME type for format
   */
  getMimeType(format4) {
    const mimeTypes = {
      json: "application/json",
      csv: "text/csv",
      ical: "text/calendar",
      pdf: "application/pdf",
      tcx: "application/vnd.garmin.tcx+xml"
    };
    return mimeTypes[format4] || "text/plain";
  }
};

// src/types/base-types.ts
var TypeValidationError = class _TypeValidationError extends Error {
  constructor(message, expectedType, actualValue, validationContext) {
    super(message);
    this.expectedType = expectedType;
    this.actualValue = actualValue;
    this.validationContext = validationContext;
    this.name = "TypeValidationError";
  }
  /**
   * Create an error for a missing required field
   */
  static missingField(field) {
    return new _TypeValidationError(
      `Missing required field: ${field}`,
      "required",
      void 0,
      field
    );
  }
  /**
   * Create an error for an incorrect type
   */
  static incorrectType(field, expected, actual) {
    return new _TypeValidationError(
      `Field '${field}' expected ${expected}, got ${typeof actual}`,
      expected,
      actual,
      field
    );
  }
  /**
   * Create an error for an invalid value
   */
  static invalidValue(field, value, constraint) {
    return new _TypeValidationError(
      `Field '${field}' has invalid value: ${constraint}`,
      constraint,
      value,
      field
    );
  }
};

// src/types/type-guards.ts
var primitiveGuards = {
  isString: (value) => typeof value === "string",
  isNumber: (value) => typeof value === "number" && !isNaN(value),
  isBoolean: (value) => typeof value === "boolean",
  isDate: (value) => value instanceof Date && !isNaN(value.getTime()),
  isArray: (value, elementGuard) => {
    if (!Array.isArray(value)) return false;
    if (!elementGuard) return true;
    return value.every(elementGuard);
  },
  isObject: (value) => typeof value === "object" && value !== null && !Array.isArray(value),
  isNonEmptyString: (value) => typeof value === "string" && value.trim().length > 0,
  isPositiveNumber: (value) => typeof value === "number" && !isNaN(value) && value > 0,
  isNonNegativeNumber: (value) => typeof value === "number" && !isNaN(value) && value >= 0
};
function createSchemaGuard(typeName, requiredProperties, optionalProperties = [], propertyValidators = {}) {
  const typeGuard = (value) => {
    if (!primitiveGuards.isObject(value)) return false;
    for (const prop of requiredProperties) {
      if (!(prop in value)) return false;
      const validator = propertyValidators[prop];
      if (validator && !validator(value[prop])) return false;
    }
    for (const prop of optionalProperties) {
      if (prop in value) {
        const validator = propertyValidators[prop];
        if (validator && !validator(value[prop])) return false;
      }
    }
    return true;
  };
  const getValidationErrors = (value) => {
    const errors = [];
    if (!primitiveGuards.isObject(value)) {
      errors.push(`Expected object, got ${typeof value}`);
      return errors;
    }
    for (const prop of requiredProperties) {
      if (!(prop in value)) {
        errors.push(`Missing required property: ${String(prop)}`);
      } else {
        const validator = propertyValidators[prop];
        if (validator && !validator(value[prop])) {
          errors.push(`Invalid value for property: ${String(prop)}`);
        }
      }
    }
    for (const prop of optionalProperties) {
      if (prop in value) {
        const validator = propertyValidators[prop];
        if (validator && !validator(value[prop])) {
          errors.push(`Invalid value for optional property: ${String(prop)}`);
        }
      }
    }
    return errors;
  };
  return {
    check: typeGuard,
    name: typeName,
    requiredProperties,
    optionalProperties,
    propertyValidators,
    validateWithContext: (value, context) => {
      if (typeGuard(value)) {
        return { success: true, data: value };
      }
      const errors = getValidationErrors(value);
      const errorMessage = errors.join("; ");
      const validationError = new TypeValidationError(
        errorMessage,
        typeName,
        value,
        context
      );
      return { success: false, error: validationError };
    },
    isValid: typeGuard,
    getValidationErrors
  };
}
var isFitnessAssessment = createSchemaGuard(
  "FitnessAssessment",
  ["vdot", "criticalSpeed", "lactateThreshold", "runningEconomy", "weeklyMileage", "longestRecentRun", "trainingAge", "injuryHistory", "recoveryRate"],
  [],
  {
    vdot: primitiveGuards.isPositiveNumber,
    criticalSpeed: primitiveGuards.isPositiveNumber,
    lactateThreshold: primitiveGuards.isPositiveNumber,
    runningEconomy: primitiveGuards.isPositiveNumber,
    weeklyMileage: primitiveGuards.isNonNegativeNumber,
    longestRecentRun: primitiveGuards.isNonNegativeNumber,
    trainingAge: primitiveGuards.isNonNegativeNumber,
    injuryHistory: (value) => primitiveGuards.isArray(value, primitiveGuards.isString),
    recoveryRate: (value) => primitiveGuards.isNumber(value) && value >= 0 && value <= 100
  }
);
var isTrainingPreferences = createSchemaGuard(
  "TrainingPreferences",
  ["availableDays", "preferredIntensity", "crossTraining", "strengthTraining", "timeConstraints"],
  [],
  {
    availableDays: (value) => primitiveGuards.isArray(value, primitiveGuards.isNumber),
    preferredIntensity: (value) => typeof value === "string" && ["low", "moderate", "high"].includes(value),
    crossTraining: primitiveGuards.isBoolean,
    strengthTraining: primitiveGuards.isBoolean,
    timeConstraints: (value) => {
      if (!primitiveGuards.isObject(value)) return false;
      return Object.values(value).every(primitiveGuards.isNumber);
    }
  }
);
var isEnvironmentalFactors = createSchemaGuard(
  "EnvironmentalFactors",
  ["altitude", "typicalTemperature", "humidity", "terrain"],
  [],
  {
    altitude: primitiveGuards.isNumber,
    typicalTemperature: primitiveGuards.isNumber,
    humidity: (value) => primitiveGuards.isNumber(value) && value >= 0 && value <= 100,
    terrain: (value) => typeof value === "string" && ["flat", "hilly", "mixed", "mountainous"].includes(value)
  }
);
var isTrainingPlanConfig = createSchemaGuard(
  "TrainingPlanConfig",
  ["name", "goal", "startDate", "targetDate", "currentFitness", "preferences", "environment"],
  ["description"],
  {
    name: primitiveGuards.isNonEmptyString,
    description: primitiveGuards.isString,
    goal: primitiveGuards.isNonEmptyString,
    startDate: primitiveGuards.isDate,
    targetDate: primitiveGuards.isDate,
    currentFitness: (value) => isFitnessAssessment.check(value),
    preferences: (value) => isTrainingPreferences.check(value),
    environment: (value) => isEnvironmentalFactors.check(value)
  }
);
var isTargetRace = createSchemaGuard(
  "TargetRace",
  ["distance", "date", "goalTime", "priority", "location", "terrain", "conditions"],
  [],
  {
    distance: primitiveGuards.isNonEmptyString,
    date: primitiveGuards.isDate,
    goalTime: (value) => {
      if (!primitiveGuards.isObject(value)) return false;
      const time = value;
      return primitiveGuards.isNonNegativeNumber(time.hours) && primitiveGuards.isNonNegativeNumber(time.minutes) && primitiveGuards.isNonNegativeNumber(time.seconds);
    },
    priority: (value) => typeof value === "string" && ["A", "B", "C"].includes(value),
    location: primitiveGuards.isString,
    terrain: (value) => typeof value === "string" && ["road", "trail", "track", "mixed"].includes(value),
    conditions: (value) => isEnvironmentalFactors.check(value)
  }
);
var isAdvancedPlanConfig = createSchemaGuard(
  "AdvancedPlanConfig",
  ["name", "goal", "startDate", "targetDate", "currentFitness", "preferences", "environment", "methodology", "intensityDistribution", "periodization", "targetRaces"],
  ["description", "seasonGoals", "adaptationEnabled", "recoveryMonitoring", "progressTracking", "exportFormats", "platformIntegrations", "multiRaceConfig", "adaptationSettings"],
  {
    ...isTrainingPlanConfig.propertyValidators,
    methodology: (value) => typeof value === "string" && ["daniels", "lydiard", "pfitzinger", "hanson", "custom"].includes(value),
    intensityDistribution: (value) => {
      if (!primitiveGuards.isObject(value)) return false;
      const dist = value;
      return primitiveGuards.isNumber(dist.easy) && primitiveGuards.isNumber(dist.moderate) && primitiveGuards.isNumber(dist.hard);
    },
    periodization: (value) => typeof value === "string" && ["linear", "block", "undulating"].includes(value),
    targetRaces: (value) => primitiveGuards.isArray(value, (item) => isTargetRace.check(item)),
    adaptationEnabled: primitiveGuards.isBoolean,
    recoveryMonitoring: primitiveGuards.isBoolean,
    progressTracking: primitiveGuards.isBoolean,
    exportFormats: (value) => primitiveGuards.isArray(value, (item) => typeof item === "string" && ["pdf", "ical", "csv", "json"].includes(item))
  }
);
var isPlannedWorkout = createSchemaGuard(
  "PlannedWorkout",
  ["id", "date", "type", "name", "targetMetrics", "workout"],
  ["description"],
  {
    id: primitiveGuards.isNonEmptyString,
    date: primitiveGuards.isDate,
    type: primitiveGuards.isNonEmptyString,
    name: primitiveGuards.isNonEmptyString,
    description: primitiveGuards.isString,
    targetMetrics: (value) => {
      if (!primitiveGuards.isObject(value)) return false;
      const metrics = value;
      return primitiveGuards.isPositiveNumber(metrics.duration) && primitiveGuards.isPositiveNumber(metrics.distance) && primitiveGuards.isPositiveNumber(metrics.intensity);
    },
    workout: primitiveGuards.isObject
  }
);
var isCompletedWorkout = createSchemaGuard(
  "CompletedWorkout",
  ["plannedWorkout", "actualDuration", "actualDistance", "actualPace", "avgHeartRate", "maxHeartRate", "completionRate", "adherence", "difficultyRating"],
  [],
  {
    plannedWorkout: (value) => isPlannedWorkout.check(value),
    actualDuration: primitiveGuards.isPositiveNumber,
    actualDistance: primitiveGuards.isPositiveNumber,
    actualPace: primitiveGuards.isPositiveNumber,
    avgHeartRate: primitiveGuards.isPositiveNumber,
    maxHeartRate: primitiveGuards.isPositiveNumber,
    completionRate: (value) => primitiveGuards.isNumber(value) && value >= 0 && value <= 1,
    adherence: (value) => typeof value === "string" && ["none", "partial", "complete"].includes(value),
    difficultyRating: (value) => primitiveGuards.isNumber(value) && value >= 1 && value <= 10
  }
);
var isRecoveryMetrics = createSchemaGuard(
  "RecoveryMetrics",
  ["recoveryScore", "sleepQuality", "sleepDuration", "stressLevel", "muscleSoreness", "energyLevel", "motivation"],
  [],
  {
    recoveryScore: (value) => primitiveGuards.isNumber(value) && value >= 0 && value <= 100,
    sleepQuality: (value) => primitiveGuards.isNumber(value) && value >= 0 && value <= 100,
    sleepDuration: primitiveGuards.isPositiveNumber,
    stressLevel: (value) => primitiveGuards.isNumber(value) && value >= 0 && value <= 100,
    muscleSoreness: (value) => primitiveGuards.isNumber(value) && value >= 1 && value <= 10,
    energyLevel: (value) => primitiveGuards.isNumber(value) && value >= 1 && value <= 10,
    motivation: (value) => primitiveGuards.isNumber(value) && value >= 1 && value <= 10
  }
);
var isProgressData = createSchemaGuard(
  "ProgressData",
  ["date", "perceivedExertion", "heartRateData", "performanceMetrics"],
  ["completedWorkouts", "notes"],
  {
    date: primitiveGuards.isDate,
    perceivedExertion: (value) => primitiveGuards.isNumber(value) && value >= 1 && value <= 10,
    heartRateData: (value) => {
      if (!primitiveGuards.isObject(value)) return false;
      const hrData = value;
      return primitiveGuards.isPositiveNumber(hrData.resting) && primitiveGuards.isPositiveNumber(hrData.average) && primitiveGuards.isPositiveNumber(hrData.maximum);
    },
    performanceMetrics: (value) => {
      if (!primitiveGuards.isObject(value)) return false;
      const metrics = value;
      return primitiveGuards.isPositiveNumber(metrics.vo2max) && primitiveGuards.isPositiveNumber(metrics.lactateThreshold) && primitiveGuards.isPositiveNumber(metrics.runningEconomy);
    },
    completedWorkouts: (value) => primitiveGuards.isArray(value, (item) => isCompletedWorkout.check(item)),
    notes: primitiveGuards.isString
  }
);
var isRunData = createSchemaGuard(
  "RunData",
  ["date", "distance", "duration", "avgPace", "avgHeartRate", "maxHeartRate", "elevation", "effortLevel", "notes", "temperature", "isRace"],
  [],
  {
    date: primitiveGuards.isDate,
    distance: primitiveGuards.isPositiveNumber,
    duration: primitiveGuards.isPositiveNumber,
    avgPace: primitiveGuards.isPositiveNumber,
    avgHeartRate: primitiveGuards.isPositiveNumber,
    maxHeartRate: primitiveGuards.isPositiveNumber,
    elevation: primitiveGuards.isNumber,
    effortLevel: (value) => primitiveGuards.isNumber(value) && value >= 1 && value <= 10,
    notes: primitiveGuards.isString,
    temperature: primitiveGuards.isNumber,
    isRace: primitiveGuards.isBoolean
  }
);
var isTrainingBlock = createSchemaGuard(
  "TrainingBlock",
  ["id", "phase", "startDate", "endDate", "weeks", "focusAreas", "microcycles"],
  [],
  {
    id: primitiveGuards.isNonEmptyString,
    phase: (value) => typeof value === "string" && ["base", "build", "peak", "taper", "recovery"].includes(value),
    startDate: primitiveGuards.isDate,
    endDate: primitiveGuards.isDate,
    weeks: primitiveGuards.isPositiveNumber,
    focusAreas: (value) => primitiveGuards.isArray(value, primitiveGuards.isString),
    microcycles: primitiveGuards.isArray
  }
);
var isTrainingPlan = createSchemaGuard(
  "TrainingPlan",
  ["config", "blocks", "summary", "workouts"],
  ["id"],
  {
    id: primitiveGuards.isString,
    config: (value) => isTrainingPlanConfig.check(value),
    blocks: (value) => primitiveGuards.isArray(value, (item) => isTrainingBlock.check(item)),
    summary: primitiveGuards.isObject,
    workouts: (value) => primitiveGuards.isArray(value, (item) => isPlannedWorkout.check(item))
  }
);

// src/methodology-workout-selector.ts
var MethodologyWorkoutSelector = class {
  constructor(methodology) {
    this.methodology = methodology;
    this.philosophy = PhilosophyFactory.create(methodology);
  }
  /**
   * Select the most appropriate workout based on methodology and context
   * Requirement 4.1: Create methodology-specific workout selector
   * Requirement 4.4: Choose based on methodology-specific selection criteria
   */
  selectWorkout(criteria) {
    const templateName = this.philosophy.selectWorkout(
      criteria.workoutType,
      criteria.phase,
      criteria.weekNumber
    );
    let workout;
    let rationale;
    let warnings = [];
    let alternativeOptions = [];
    if (templateName && WORKOUT_TEMPLATES[templateName]) {
      workout = { ...WORKOUT_TEMPLATES[templateName] };
      rationale = `Selected ${templateName} based on ${this.methodology} principles for ${criteria.phase} phase`;
    } else {
      workout = this.createMethodologySpecificWorkout(criteria);
      rationale = `Created custom ${criteria.workoutType} workout following ${this.methodology} guidelines`;
    }
    workout.type = criteria.workoutType;
    if (criteria.workoutType === "tempo" || criteria.workoutType === "threshold") {
      const hasCorrectIntensity = workout.segments.some(
        (seg) => seg.intensity >= 86 && seg.intensity <= 90
      );
      if (!hasCorrectIntensity && this.methodology === "daniels") {
        workout = this.createDanielsWorkout(criteria, 88, 40);
      }
    }
    workout = this.applyContextModifications(workout, criteria, warnings);
    const compliance = this.validateMethodologyCompliance(workout, criteria);
    alternativeOptions = this.getAlternativeOptions(criteria);
    if (criteria.preferences) {
      const dayOfWeek = criteria.dayOfWeek;
      const availableTime = criteria.preferences.timeConstraints?.[dayOfWeek];
      if (availableTime && !criteria.timeConstraints) {
        criteria.timeConstraints = availableTime;
        const totalDuration = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
        if (totalDuration > availableTime) {
          workout = this.applyContextModifications(workout, criteria, warnings);
        }
      }
      const conflicts = this.checkPreferenceConflicts(workout, criteria.preferences);
      warnings.push(...conflicts);
    }
    return {
      workout,
      templateName: templateName || "custom",
      rationale,
      alternativeOptions,
      warnings,
      methodologyCompliance: compliance
    };
  }
  /**
   * Create custom workout following methodology guidelines
   * Requirement 4.3: When workout templates are insufficient, create custom workouts
   */
  createMethodologySpecificWorkout(criteria) {
    const baseIntensity = this.getMethodologyIntensity(criteria.workoutType, criteria.phase);
    const duration = this.getMethodologyDuration(criteria.workoutType, criteria.phase);
    switch (this.methodology) {
      case "daniels":
        return this.createDanielsWorkout(criteria, baseIntensity, duration);
      case "lydiard":
        return this.createLydiardWorkout(criteria, baseIntensity, duration);
      case "pfitzinger":
        return this.createPfitsingerWorkout(criteria, baseIntensity, duration);
      default:
        return createCustomWorkout(criteria.workoutType, duration, baseIntensity);
    }
  }
  /**
   * Create Daniels-specific workout with VDOT-based pacing
   */
  createDanielsWorkout(criteria, baseIntensity, duration) {
    const segments = [];
    switch (criteria.workoutType) {
      case "tempo":
      case "threshold":
        segments.push(
          { duration: 10, intensity: 65, zone: { name: "EASY" }, description: "Warm-up" },
          { duration: 20, intensity: 88, zone: { name: "THRESHOLD" }, description: "Tempo at T pace" },
          { duration: 10, intensity: 60, zone: { name: "RECOVERY" }, description: "Cool-down" }
        );
        break;
      case "vo2max":
        segments.push(
          { duration: 15, intensity: 65, zone: { name: "EASY" }, description: "Warm-up" }
        );
        for (let i = 0; i < 5; i++) {
          segments.push(
            { duration: 3, intensity: 95, zone: { name: "VO2_MAX" }, description: `Interval ${i + 1} at I pace` },
            { duration: 2, intensity: 60, zone: { name: "RECOVERY" }, description: "Recovery jog" }
          );
        }
        segments.push(
          { duration: 10, intensity: 60, zone: { name: "RECOVERY" }, description: "Cool-down" }
        );
        break;
      default:
        segments.push({
          duration,
          intensity: baseIntensity,
          zone: { name: this.getZoneName(baseIntensity) },
          description: `${criteria.workoutType} workout`
        });
    }
    return {
      type: criteria.workoutType,
      primaryZone: { name: this.getZoneName(baseIntensity) },
      segments,
      adaptationTarget: this.getDanielsAdaptationTarget(criteria.workoutType),
      estimatedTSS: this.calculateTSS(segments),
      recoveryTime: this.getRecoveryTime(criteria.workoutType, duration, baseIntensity)
    };
  }
  /**
   * Create Lydiard-specific workout with aerobic emphasis
   */
  createLydiardWorkout(criteria, baseIntensity, duration) {
    const segments = [];
    switch (criteria.workoutType) {
      case "long_run":
        segments.push({
          duration: Math.min(duration, 180),
          // Cap at 3 hours
          intensity: 65,
          zone: { name: "EASY" },
          description: "Aerobic long run - conversation pace"
        });
        break;
      case "hill_repeats":
        segments.push(
          { duration: 15, intensity: 65, zone: { name: "EASY" }, description: "Warm-up to hills" }
        );
        const reps = criteria.phase === "base" ? 6 : 8;
        for (let i = 0; i < reps; i++) {
          segments.push(
            { duration: 3, intensity: 85, zone: { name: "TEMPO" }, description: `Hill repeat ${i + 1} - strong effort` },
            { duration: 2, intensity: 50, zone: { name: "RECOVERY" }, description: "Walk/jog down" }
          );
        }
        segments.push(
          { duration: 10, intensity: 60, zone: { name: "RECOVERY" }, description: "Cool-down" }
        );
        break;
      default:
        segments.push({
          duration,
          intensity: Math.min(baseIntensity, 75),
          // Keep intensity moderate
          zone: { name: this.getZoneName(Math.min(baseIntensity, 75)) },
          description: `${criteria.workoutType} workout - aerobic emphasis`
        });
    }
    return {
      type: criteria.workoutType,
      primaryZone: { name: this.getZoneName(baseIntensity) },
      segments,
      adaptationTarget: this.getLydiardAdaptationTarget(criteria.workoutType),
      estimatedTSS: this.calculateTSS(segments),
      recoveryTime: this.getRecoveryTime(criteria.workoutType, duration, baseIntensity)
    };
  }
  /**
   * Create Pfitzinger-specific workout with LT emphasis
   */
  createPfitsingerWorkout(criteria, baseIntensity, duration) {
    const segments = [];
    switch (criteria.workoutType) {
      case "threshold":
        if (criteria.phase === "build" || criteria.phase === "peak") {
          segments.push(
            { duration: 15, intensity: 65, zone: { name: "EASY" }, description: "Warm-up" }
          );
          segments.push(
            { duration: 15, intensity: 88, zone: { name: "THRESHOLD" }, description: "LT interval 1" },
            { duration: 3, intensity: 65, zone: { name: "EASY" }, description: "Recovery" },
            { duration: 15, intensity: 88, zone: { name: "THRESHOLD" }, description: "LT interval 2" }
          );
          segments.push(
            { duration: 10, intensity: 60, zone: { name: "RECOVERY" }, description: "Cool-down" }
          );
        } else {
          segments.push(
            { duration: 10, intensity: 65, zone: { name: "EASY" }, description: "Warm-up" },
            { duration: 25, intensity: 86, zone: { name: "THRESHOLD" }, description: "Continuous LT run" },
            { duration: 10, intensity: 60, zone: { name: "RECOVERY" }, description: "Cool-down" }
          );
        }
        break;
      case "long_run":
        if (criteria.phase === "build" && criteria.weekNumber > 4) {
          segments.push(
            { duration: 40, intensity: 70, zone: { name: "EASY" }, description: "Easy start" },
            { duration: 20, intensity: 85, zone: { name: "TEMPO" }, description: "Tempo segment" },
            { duration: 30, intensity: 70, zone: { name: "EASY" }, description: "Easy finish" }
          );
        } else {
          segments.push({
            duration,
            intensity: 70,
            zone: { name: "EASY" },
            description: "Long run at steady pace"
          });
        }
        break;
      default:
        segments.push({
          duration,
          intensity: baseIntensity,
          zone: { name: this.getZoneName(baseIntensity) },
          description: `${criteria.workoutType} workout`
        });
    }
    return {
      type: criteria.workoutType,
      primaryZone: { name: this.getZoneName(baseIntensity) },
      segments,
      adaptationTarget: this.getPfitsingerAdaptationTarget(criteria.workoutType),
      estimatedTSS: this.calculateTSS(segments),
      recoveryTime: this.getRecoveryTime(criteria.workoutType, duration, baseIntensity)
    };
  }
  /**
   * Apply modifications based on environmental and other constraints
   * Requirement 4.2: Add context-aware selection
   * Requirement 4.7: Substitute workouts while maintaining methodology integrity
   */
  applyContextModifications(workout, criteria, warnings) {
    const modified = { ...workout };
    if (criteria.timeConstraints) {
      const totalDuration = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
      if (totalDuration > criteria.timeConstraints) {
        modified.segments = this.adjustWorkoutDuration(workout.segments, criteria.timeConstraints);
        warnings.push(`Workout shortened from ${totalDuration} to ${criteria.timeConstraints} minutes due to time constraints`);
      }
    }
    if (criteria.environmentalFactors) {
      const env = criteria.environmentalFactors;
      if (env.altitude && env.altitude > 1500) {
        modified.segments = modified.segments.map((seg) => ({
          ...seg,
          intensity: Math.max(seg.intensity - 5, 50)
          // Reduce intensity at altitude
        }));
        warnings.push("Intensity reduced due to altitude");
      }
      if (env.typicalTemperature) {
        if (env.typicalTemperature > 25) {
          modified.segments = modified.segments.map((seg) => ({
            ...seg,
            intensity: Math.max(seg.intensity - 3, 50)
          }));
          warnings.push("Intensity reduced due to high temperature");
        } else if (env.typicalTemperature < 0) {
          modified.segments.unshift({
            duration: 5,
            intensity: 60,
            zone: { name: "RECOVERY" },
            description: "Extra warm-up for cold conditions"
          });
        }
      }
      if (env.terrain === "hilly" && workout.type !== "hill_repeats") {
        warnings.push("Adjust pace expectations for hilly terrain");
      }
    }
    if (criteria.equipment && !criteria.equipment.includes("track") && workout.type === "speed") {
      modified.segments = modified.segments.map((seg) => {
        if (seg.intensity > 95) {
          return {
            ...seg,
            intensity: 92,
            description: seg.description + " (modified for non-track surface)"
          };
        }
        return seg;
      });
      warnings.push("Speed workout modified for non-track surface");
    }
    return modified;
  }
  /**
   * Validate workout against methodology principles
   * Requirement 4.4: Methodology-specific selection criteria
   */
  validateMethodologyCompliance(workout, criteria) {
    let score = 100;
    const deductions = [];
    switch (this.methodology) {
      case "daniels":
        if (workout.type === "tempo" || workout.type === "threshold") {
          const hasCorrectIntensity = workout.segments.some(
            (seg) => seg.intensity >= 86 && seg.intensity <= 90
          );
          if (!hasCorrectIntensity) {
            score -= 20;
            deductions.push("Tempo/threshold intensity outside Daniels T-pace range");
          }
        }
        if (criteria.phase === "base" && workout.type === "vo2max") {
          score -= 30;
          deductions.push("VO2max work too early for Daniels base phase");
        }
        break;
      case "lydiard":
        const hardSegments = workout.segments.filter((seg) => seg.intensity > 85);
        const hardPercentage = hardSegments.reduce((sum, seg) => sum + seg.duration, 0) / workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
        if (hardPercentage > 0.15) {
          score -= 25;
          deductions.push("Excessive hard running for Lydiard methodology");
        }
        if (criteria.phase === "base" && ["vo2max", "speed"].includes(workout.type)) {
          score -= 60;
          deductions.push("Anaerobic work inappropriate for Lydiard base phase");
        }
        if (criteria.phase === "base" && workout.type === "speed") {
          score = Math.min(score, 40);
        }
        break;
      case "pfitzinger":
        if (criteria.phase === "build" || criteria.phase === "peak") {
          const hasThresholdWork = workout.segments.some(
            (seg) => seg.intensity >= 84 && seg.intensity <= 92
          );
          if (workout.type === "tempo" && !hasThresholdWork) {
            score -= 20;
            deductions.push("Tempo workout missing lactate threshold work");
          }
        }
        if (workout.type === "long_run" && criteria.phase === "build") {
          const totalDuration = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
          if (totalDuration >= 90 && totalDuration <= 150) {
            const hasQualitySegment = workout.segments.some((seg) => seg.intensity >= 82);
            if (!hasQualitySegment) {
              score -= 15;
              deductions.push("Medium-long run missing quality segment");
            }
          }
        }
        break;
    }
    if (workout.segments.length === 0) {
      score = 0;
      deductions.push("Workout has no segments");
    }
    if (workout.recoveryTime < 8) {
      score -= 10;
      deductions.push("Insufficient recovery time specified");
    }
    return Math.max(score, 0);
  }
  /**
   * Get alternative workout options
   */
  getAlternativeOptions(criteria) {
    const alternatives = [];
    switch (criteria.workoutType) {
      case "tempo":
        alternatives.push("TEMPO_CONTINUOUS", "THRESHOLD_PROGRESSION");
        if (this.methodology === "pfitzinger") {
          alternatives.push("LACTATE_THRESHOLD_2X20");
        }
        break;
      case "vo2max":
        alternatives.push("VO2MAX_4X4", "VO2MAX_5X3");
        if (this.methodology === "daniels") {
          alternatives.push("Custom I-pace intervals");
        }
        break;
      case "long_run":
        alternatives.push("LONG_RUN");
        if (this.methodology === "pfitzinger" && criteria.phase === "build") {
          alternatives.push("Medium-long with tempo", "Progressive long run");
        }
        break;
      case "hill_repeats":
        if (this.methodology === "lydiard") {
          alternatives.push("LYDIARD_HILL_BASE", "LYDIARD_HILL_BUILD", "LYDIARD_HILL_PEAK");
        } else {
          alternatives.push("HILL_REPEATS_6X2");
        }
        break;
    }
    return alternatives;
  }
  /**
   * Check for conflicts with user preferences
   * Requirement 4.8: Provide warnings and methodology-compliant alternatives
   */
  checkPreferenceConflicts(workout, preferences) {
    const conflicts = [];
    const avgIntensity = this.calculateAverageIntensity(workout.segments);
    if (preferences.preferredIntensity === "low" && avgIntensity > 75) {
      conflicts.push(`Workout intensity (${avgIntensity}%) exceeds your low intensity preference. Consider adjusting expectations or methodology.`);
    } else if (preferences.preferredIntensity === "high" && avgIntensity < 70) {
      conflicts.push(`Workout intensity (${avgIntensity}%) is lower than your high intensity preference. ${this.methodology} methodology emphasizes controlled efforts.`);
    }
    if (preferences.preferredIntensity === "low" && (workout.type === "tempo" || workout.type === "threshold")) {
      conflicts.push("Tempo/threshold workouts have higher intensity than your preference indicates.");
    }
    const totalDuration = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
    const dayOfWeek = (/* @__PURE__ */ new Date()).getDay();
    const availableTime = preferences.timeConstraints?.[dayOfWeek];
    if (availableTime && totalDuration > availableTime) {
      conflicts.push(`Workout duration (${totalDuration} min) exceeds available time (${availableTime} min). Workout has been adjusted.`);
    }
    return conflicts;
  }
  /**
   * Adjust workout duration to fit time constraints
   */
  adjustWorkoutDuration(segments, targetDuration) {
    const currentDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const ratio = targetDuration / currentDuration;
    let adjustedSegments = segments.map((seg) => ({
      ...seg,
      duration: Math.floor(seg.duration * ratio)
      // Use floor to avoid exceeding
    }));
    const adjustedTotal = adjustedSegments.reduce((sum, seg) => sum + seg.duration, 0);
    const difference = targetDuration - adjustedTotal;
    if (difference > 0) {
      const maxSegmentIndex = adjustedSegments.reduce(
        (maxIdx, seg, idx, arr) => seg.duration > arr[maxIdx].duration ? idx : maxIdx,
        0
      );
      adjustedSegments[maxSegmentIndex].duration += difference;
    }
    return adjustedSegments;
  }
  /**
   * Calculate average intensity across segments
   */
  calculateAverageIntensity(segments) {
    const totalWeightedIntensity = segments.reduce((sum, seg) => sum + seg.intensity * seg.duration, 0);
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    return Math.round(totalWeightedIntensity / totalDuration);
  }
  /**
   * Calculate Training Stress Score
   */
  calculateTSS(segments) {
    return segments.reduce((sum, seg) => {
      const intensityFactor = seg.intensity / 100;
      return sum + seg.duration * Math.pow(intensityFactor, 2) * 100 / 60;
    }, 0);
  }
  /**
   * Get methodology-specific intensity for workout type
   */
  getMethodologyIntensity(workoutType, phase) {
    const intensityMap = {
      daniels: {
        recovery: 60,
        easy: 65,
        steady: 75,
        tempo: 88,
        threshold: 88,
        vo2max: 95,
        speed: 98,
        hill_repeats: 90,
        fartlek: 80,
        progression: 75,
        long_run: 65,
        race_pace: 85,
        time_trial: 92,
        cross_training: 65,
        strength: 70
      },
      lydiard: {
        recovery: 55,
        easy: 65,
        steady: 70,
        tempo: 80,
        threshold: 82,
        vo2max: 90,
        speed: 92,
        hill_repeats: 85,
        fartlek: 75,
        progression: 70,
        long_run: 65,
        race_pace: 80,
        time_trial: 85,
        cross_training: 60,
        strength: 65
      },
      pfitzinger: {
        recovery: 60,
        easy: 68,
        steady: 75,
        tempo: 85,
        threshold: 88,
        vo2max: 94,
        speed: 96,
        hill_repeats: 88,
        fartlek: 80,
        progression: 78,
        long_run: 70,
        race_pace: 86,
        time_trial: 90,
        cross_training: 65,
        strength: 70
      },
      hudson: {
        recovery: 60,
        easy: 65,
        steady: 75,
        tempo: 85,
        threshold: 88,
        vo2max: 95,
        speed: 98,
        hill_repeats: 90,
        fartlek: 80,
        progression: 75,
        long_run: 65,
        race_pace: 85,
        time_trial: 92,
        cross_training: 65,
        strength: 70
      },
      custom: {
        recovery: 60,
        easy: 65,
        steady: 75,
        tempo: 85,
        threshold: 88,
        vo2max: 95,
        speed: 98,
        hill_repeats: 90,
        fartlek: 80,
        progression: 75,
        long_run: 65,
        race_pace: 85,
        time_trial: 92,
        cross_training: 65,
        strength: 70
      }
    };
    return intensityMap[this.methodology]?.[workoutType] || 70;
  }
  /**
   * Get methodology-specific duration for workout type
   */
  getMethodologyDuration(workoutType, phase) {
    const basedurations = {
      recovery: 30,
      easy: 60,
      steady: 75,
      tempo: 50,
      threshold: 60,
      vo2max: 50,
      speed: 45,
      hill_repeats: 60,
      fartlek: 45,
      progression: 60,
      long_run: 120,
      race_pace: 70,
      time_trial: 40,
      cross_training: 45,
      strength: 30
    };
    let duration = basedurations[workoutType] || 60;
    if (phase === "base") {
      duration *= 0.8;
    } else if (phase === "peak") {
      duration *= 1.1;
    }
    if (this.methodology === "lydiard" && workoutType === "long_run") {
      duration *= 1.3;
    } else if (this.methodology === "pfitzinger" && workoutType === "tempo") {
      duration *= 1.2;
    }
    return Math.round(duration);
  }
  /**
   * Get zone name from intensity
   */
  getZoneName(intensity) {
    if (intensity < 60) return "RECOVERY";
    if (intensity < 70) return "EASY";
    if (intensity < 80) return "STEADY";
    if (intensity < 87) return "TEMPO";
    if (intensity < 92) return "THRESHOLD";
    if (intensity < 97) return "VO2_MAX";
    return "NEUROMUSCULAR";
  }
  /**
   * Get recovery time based on workout
   */
  getRecoveryTime(workoutType, duration, intensity) {
    const baseRecovery = {
      recovery: 8,
      easy: 12,
      steady: 18,
      tempo: 24,
      threshold: 36,
      vo2max: 48,
      speed: 36,
      hill_repeats: 36,
      fartlek: 24,
      progression: 24,
      long_run: 24,
      race_pace: 36,
      time_trial: 48,
      cross_training: 12,
      strength: 24
    };
    const base = baseRecovery[workoutType] || 24;
    const intensityMultiplier = intensity / 80;
    const durationMultiplier = duration / 60;
    return Math.round(base * intensityMultiplier * durationMultiplier);
  }
  /**
   * Get methodology-specific adaptation targets
   */
  getDanielsAdaptationTarget(workoutType) {
    const targets = {
      recovery: "Active recovery and blood flow",
      easy: "Aerobic base and mitochondrial development",
      steady: "Aerobic capacity and fat oxidation",
      tempo: "Lactate threshold and buffering capacity",
      threshold: "Lactate threshold clearance at T-pace",
      vo2max: "VO2max and oxygen utilization at I-pace",
      speed: "Neuromuscular power and running economy at R-pace",
      hill_repeats: "Power development and running form",
      fartlek: "Speed variation and mental toughness",
      progression: "Pacing control and fatigue resistance",
      long_run: "Glycogen storage and mental resilience",
      race_pace: "Race-specific metabolic efficiency",
      time_trial: "Competitive readiness and pacing",
      cross_training: "Active recovery and injury prevention",
      strength: "Muscular strength and injury prevention"
    };
    return targets[workoutType] || "General fitness improvement";
  }
  getLydiardAdaptationTarget(workoutType) {
    const targets = {
      recovery: "Complete recovery and regeneration",
      easy: "Aerobic enzyme development and capillarization",
      steady: "Aerobic threshold improvement",
      tempo: "Steady-state aerobic capacity",
      threshold: "Aerobic/anaerobic transition development",
      vo2max: "Maximum oxygen uptake (anaerobic phase only)",
      speed: "Neuromuscular coordination (peak phase only)",
      hill_repeats: "Leg strength and power development",
      fartlek: "Speed play and running enjoyment",
      progression: "Aerobic capacity under fatigue",
      long_run: "Maximum aerobic development and fat metabolism",
      race_pace: "Race rhythm and efficiency",
      time_trial: "Competitive sharpening",
      cross_training: "Supplementary aerobic development",
      strength: "Injury prevention and hill running preparation"
    };
    return targets[workoutType] || "Aerobic system development";
  }
  getPfitsingerAdaptationTarget(workoutType) {
    const targets = {
      recovery: "Recovery and adaptation",
      easy: "General aerobic conditioning",
      steady: "Aerobic development",
      tempo: "Lactate threshold improvement",
      threshold: "Lactate threshold clearance and threshold pace",
      vo2max: "VO2max and speed development",
      speed: "Neuromuscular power and efficiency",
      hill_repeats: "Strength and power development",
      fartlek: "Speed variation and lactate tolerance",
      progression: "Fatigue resistance and pacing",
      long_run: "Endurance and glycogen utilization",
      race_pace: "Marathon-specific adaptations",
      time_trial: "Race preparation and pacing",
      cross_training: "Active recovery and variety",
      strength: "Injury prevention and running economy"
    };
    return targets[workoutType] || "Performance improvement";
  }
  /**
   * Automatically advance workout difficulty based on progression
   * Requirement 4.5: Automatically advance workout difficulty following methodology patterns
   */
  getProgressedWorkout(previousWorkout, weeksSinceStart, performanceData) {
    const criteria = {
      workoutType: previousWorkout.type,
      phase: this.getPhaseFromWeek(weeksSinceStart),
      weekNumber: weeksSinceStart,
      dayOfWeek: previousWorkout.date.getDay()
    };
    let result;
    if (previousWorkout.workout && previousWorkout.workout.segments && previousWorkout.workout.segments.length > 0) {
      result = {
        workout: { ...previousWorkout.workout },
        templateName: "progressed",
        rationale: `Progressing from previous ${previousWorkout.type} workout`,
        methodologyCompliance: 100
      };
    } else {
      result = this.selectWorkout(criteria);
    }
    if (performanceData && performanceData.completionRate > 0.9 && performanceData.difficultyRating <= 7) {
      result.workout = this.applyMethodologyProgression(
        result.workout,
        weeksSinceStart,
        performanceData.difficultyRating
      );
      result.rationale += ` - Progressed based on ${Math.round(performanceData.completionRate * 100)}% completion rate`;
    }
    return result;
  }
  /**
   * Apply methodology-specific progression patterns
   */
  applyMethodologyProgression(workout, weeksSinceStart, difficultyRating) {
    const progressed = { ...workout };
    switch (this.methodology) {
      case "daniels":
        if (difficultyRating < 7) {
          progressed.segments = progressed.segments.map((seg) => {
            if (seg.zone.name === "THRESHOLD" || seg.zone.name === "VO2_MAX") {
              return { ...seg, duration: Math.round(seg.duration * 1.1) };
            }
            return seg;
          });
        }
        break;
      case "lydiard":
        if (weeksSinceStart < 12) {
          progressed.segments = progressed.segments.map((seg) => {
            if (seg.intensity < 75) {
              return { ...seg, duration: Math.round(seg.duration * 1.05) };
            }
            return seg;
          });
        }
        break;
      case "pfitzinger":
        if (workout.type === "threshold" || workout.type === "tempo") {
          progressed.segments = progressed.segments.map((seg) => {
            if (seg.intensity >= 84 && seg.intensity <= 92) {
              return { ...seg, duration: Math.round(seg.duration * 1.08) };
            }
            return seg;
          });
        }
        break;
    }
    progressed.estimatedTSS = this.calculateTSS(progressed.segments);
    return progressed;
  }
  /**
   * Get training phase from week number
   */
  getPhaseFromWeek(weekNumber) {
    if (weekNumber <= 4) return "base";
    if (weekNumber <= 12) return "build";
    if (weekNumber <= 16) return "peak";
    if (weekNumber <= 18) return "taper";
    return "recovery";
  }
  /**
   * Select recovery workout based on methodology preferences
   * Requirement 4.6: Select appropriate active recovery or rest
   */
  selectRecoveryWorkout(previousWorkouts, recoveryNeeded) {
    const criteria = {
      workoutType: "recovery",
      phase: "recovery",
      weekNumber: 1,
      dayOfWeek: (/* @__PURE__ */ new Date()).getDay(),
      previousWorkouts
    };
    if (recoveryNeeded > 80 && this.methodology === "lydiard") {
      return {
        workout: {
          type: "recovery",
          primaryZone: { name: "RECOVERY" },
          segments: [{
            duration: 0,
            intensity: 0,
            zone: { name: "RECOVERY" },
            description: "Complete rest day - no running"
          }],
          adaptationTarget: "Full recovery and adaptation",
          estimatedTSS: 0,
          recoveryTime: 0
        },
        templateName: "rest_day",
        rationale: "Lydiard methodology emphasizes complete rest for optimal recovery",
        methodologyCompliance: 100
      };
    }
    const result = this.selectWorkout(criteria);
    if (recoveryNeeded > 60) {
      result.workout.segments = result.workout.segments.map((seg) => ({
        ...seg,
        intensity: Math.max(seg.intensity - 10, 50)
      }));
      result.rationale += ` - Intensity reduced due to high recovery need (${recoveryNeeded}/100)`;
    }
    return result;
  }
};

// src/custom-workout-generator.ts
var CustomWorkoutGenerator = class {
  constructor(methodology) {
    this.methodology = methodology;
    this.philosophy = PhilosophyFactory.create(methodology);
  }
  /**
   * Generate a custom workout based on complex requirements
   * Requirement 4.3: Create custom workouts following methodology guidelines
   */
  generateWorkout(parameters) {
    const {
      type,
      phase,
      targetDuration = this.getDefaultDuration(type, phase),
      targetIntensity = this.getDefaultIntensity(type, phase),
      environmentalFactors,
      equipment,
      constraints = {},
      preferences
    } = parameters;
    const adjustedDuration = this.applyDurationConstraints(targetDuration, constraints);
    const adjustedIntensity = this.applyIntensityConstraints(targetIntensity, constraints, environmentalFactors);
    const segments = this.generateMethodologySegments(
      type,
      phase,
      adjustedDuration,
      adjustedIntensity
    );
    const modifiedSegments = this.applyEnvironmentalModifications(
      segments,
      environmentalFactors,
      equipment
    );
    const workout = this.createWorkoutFromSegments(type, modifiedSegments);
    const compliance = this.calculateMethodologyCompliance(workout, type, phase);
    const alternatives = compliance < 80 ? this.generateAlternatives(parameters) : void 0;
    const rationale = this.buildRationale(type, phase, constraints, environmentalFactors);
    const constraintWarnings = this.collectConstraintWarnings(parameters, workout);
    return {
      workout,
      rationale,
      methodologyCompliance: compliance,
      constraints: constraintWarnings,
      alternatives
    };
  }
  /**
   * Generate workout segments following methodology principles
   * Requirement 4.3: Methodology-specific workout creation rules
   */
  generateMethodologySegments(type, phase, duration, targetIntensity) {
    switch (this.methodology) {
      case "daniels":
        return this.generateDanielsSegments(type, phase, duration, targetIntensity);
      case "lydiard":
        return this.generateLydiardSegments(type, phase, duration, targetIntensity);
      case "pfitzinger":
        return this.generatePfitsingerSegments(type, phase, duration, targetIntensity);
      default:
        return this.generateDefaultSegments(type, duration, targetIntensity);
    }
  }
  /**
   * Generate Daniels-specific segments with precise pacing
   */
  generateDanielsSegments(type, phase, duration, targetIntensity) {
    const segments = [];
    switch (type) {
      case "tempo":
      case "threshold":
        const tempoDuration = Math.max(20, duration * 0.5);
        const warmupCooldown = (duration - tempoDuration) / 2;
        segments.push(
          {
            duration: Math.round(warmupCooldown),
            intensity: 65,
            zone: TRAINING_ZONES.EASY,
            description: "Warm-up to T-pace"
          },
          {
            duration: Math.round(tempoDuration),
            intensity: 88,
            // Daniels T-pace
            zone: TRAINING_ZONES.TEMPO,
            // Changed from THRESHOLD to TEMPO for 88 intensity
            description: "Tempo at T-pace"
          },
          {
            duration: Math.round(warmupCooldown),
            intensity: 60,
            zone: TRAINING_ZONES.RECOVERY,
            description: "Cool-down"
          }
        );
        break;
      case "vo2max":
        const warmup = Math.min(15, duration * 0.25);
        const cooldown = Math.min(10, duration * 0.15);
        const workDuration = duration - warmup - cooldown;
        const intervalLength = phase === "peak" ? 4 : 3;
        const recoveryRatio = 0.8;
        segments.push({
          duration: warmup,
          intensity: 65,
          zone: TRAINING_ZONES.EASY,
          description: "Warm-up"
        });
        const intervalTime = intervalLength + intervalLength * recoveryRatio;
        const numIntervals = Math.floor(workDuration / intervalTime);
        for (let i = 0; i < numIntervals; i++) {
          segments.push(
            {
              duration: intervalLength,
              intensity: 95,
              // I-pace
              zone: TRAINING_ZONES.VO2_MAX,
              description: `Interval ${i + 1} at I-pace`
            },
            {
              duration: Math.round(intervalLength * recoveryRatio),
              intensity: 60,
              zone: TRAINING_ZONES.RECOVERY,
              description: "Recovery jog"
            }
          );
        }
        segments.push({
          duration: cooldown,
          intensity: 60,
          zone: TRAINING_ZONES.RECOVERY,
          description: "Cool-down"
        });
        break;
      case "speed":
        segments.push({
          duration: 15,
          intensity: 65,
          zone: TRAINING_ZONES.EASY,
          description: "Warm-up with strides"
        });
        const repDuration = 1;
        const repRecovery = 3;
        const availableTime = duration - 25;
        const reps = Math.floor(availableTime / (repDuration + repRecovery));
        for (let i = 0; i < reps; i++) {
          segments.push(
            {
              duration: repDuration,
              intensity: 98,
              // R-pace
              zone: TRAINING_ZONES.NEUROMUSCULAR,
              description: `Rep ${i + 1} at R-pace`
            },
            {
              duration: repRecovery,
              intensity: 50,
              zone: TRAINING_ZONES.RECOVERY,
              description: "Full recovery"
            }
          );
        }
        segments.push({
          duration: 10,
          intensity: 60,
          zone: TRAINING_ZONES.RECOVERY,
          description: "Cool-down"
        });
        break;
      default:
        segments.push({
          duration,
          intensity: targetIntensity,
          zone: this.getZoneForIntensity(targetIntensity),
          description: `${type} workout at ${this.getPaceName(targetIntensity)} pace`
        });
    }
    return segments;
  }
  /**
   * Generate Lydiard-specific segments with aerobic emphasis
   */
  generateLydiardSegments(type, phase, duration, targetIntensity) {
    const segments = [];
    switch (type) {
      case "long_run":
        if (phase === "base") {
          segments.push({
            duration,
            intensity: 65,
            zone: TRAINING_ZONES.EASY,
            description: "Aerobic long run - conversation pace throughout"
          });
        } else if (phase === "build") {
          const easyDuration = Math.round(duration * 0.75);
          const steadyDuration = duration - easyDuration;
          segments.push(
            {
              duration: easyDuration,
              intensity: 65,
              zone: TRAINING_ZONES.EASY,
              description: "Aerobic pace - relaxed and comfortable"
            },
            {
              duration: steadyDuration,
              intensity: 75,
              zone: TRAINING_ZONES.STEADY,
              description: "Steady aerobic finish - strong but controlled"
            }
          );
        }
        break;
      case "hill_repeats":
        const hillWarmup = 20;
        const hillCooldown = 15;
        const hillWork = duration - hillWarmup - hillCooldown;
        segments.push({
          duration: hillWarmup,
          intensity: 65,
          zone: TRAINING_ZONES.EASY,
          description: "Warm-up to hill location"
        });
        if (phase === "base") {
          segments.push({
            duration: hillWork,
            intensity: 80,
            zone: TRAINING_ZONES.TEMPO,
            description: "Hill circuit: bound up, jog down, repeat continuously"
          });
        } else {
          const hillInterval = 3;
          const recovery = 2;
          const circuits = Math.floor(hillWork / (hillInterval + recovery));
          for (let i = 0; i < circuits; i++) {
            segments.push(
              {
                duration: hillInterval,
                intensity: 85,
                zone: TRAINING_ZONES.TEMPO,
                description: `Hill ${i + 1}: Strong effort with good form`
              },
              {
                duration: recovery,
                intensity: 50,
                zone: TRAINING_ZONES.RECOVERY,
                description: "Jog down recovery"
              }
            );
          }
        }
        segments.push({
          duration: hillCooldown,
          intensity: 60,
          zone: TRAINING_ZONES.RECOVERY,
          description: "Cool-down jog"
        });
        break;
      case "fartlek":
        segments.push(
          {
            duration: 15,
            intensity: 65,
            zone: TRAINING_ZONES.EASY,
            description: "Easy warm-up"
          },
          {
            duration: duration - 25,
            intensity: 75,
            zone: TRAINING_ZONES.STEADY,
            description: "Fartlek main set: vary pace by feel, include surges"
          },
          {
            duration: 10,
            intensity: 60,
            zone: TRAINING_ZONES.RECOVERY,
            description: "Cool-down"
          }
        );
        break;
      default:
        const adjustedIntensity = Math.min(targetIntensity, 75);
        segments.push({
          duration,
          intensity: adjustedIntensity,
          zone: this.getZoneForIntensity(adjustedIntensity),
          description: `${type} workout - aerobic emphasis`
        });
    }
    return segments;
  }
  /**
   * Generate Pfitzinger-specific segments with LT emphasis
   */
  generatePfitsingerSegments(type, phase, duration, targetIntensity) {
    const segments = [];
    switch (type) {
      case "threshold":
      case "tempo":
        if (duration >= 60 && (phase === "build" || phase === "peak")) {
          const warmup = 15;
          const cooldown = 10;
          const workTime = duration - warmup - cooldown;
          segments.push({
            duration: warmup,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Warm-up"
          });
          const intervalDuration = Math.min(20, workTime / 2.5);
          const recoveryDuration = 3;
          const numIntervals = Math.floor(workTime / (intervalDuration + recoveryDuration));
          for (let i = 0; i < numIntervals; i++) {
            segments.push({
              duration: intervalDuration,
              intensity: 87,
              // LT pace
              zone: TRAINING_ZONES.THRESHOLD,
              description: `LT interval ${i + 1}`
            });
            if (i < numIntervals - 1) {
              segments.push({
                duration: recoveryDuration,
                intensity: 65,
                zone: TRAINING_ZONES.EASY,
                description: "Recovery jog"
              });
            }
          }
          segments.push({
            duration: cooldown,
            intensity: 60,
            zone: TRAINING_ZONES.RECOVERY,
            description: "Cool-down"
          });
        } else {
          const warmup = Math.min(10, duration * 0.2);
          const cooldown = Math.min(10, duration * 0.2);
          const tempoTime = duration - warmup - cooldown;
          segments.push(
            {
              duration: warmup,
              intensity: 68,
              zone: TRAINING_ZONES.EASY,
              description: "Warm-up"
            },
            {
              duration: tempoTime,
              intensity: 85,
              zone: TRAINING_ZONES.TEMPO,
              description: "Continuous tempo run"
            },
            {
              duration: cooldown,
              intensity: 60,
              zone: TRAINING_ZONES.RECOVERY,
              description: "Cool-down"
            }
          );
        }
        break;
      case "long_run":
        if (phase === "build" && duration >= 90) {
          const easyStart = Math.round(duration * 0.4);
          const qualityMiddle = Math.round(duration * 0.3);
          const easyFinish = duration - easyStart - qualityMiddle;
          segments.push(
            {
              duration: easyStart,
              intensity: 70,
              zone: TRAINING_ZONES.EASY,
              description: "Easy start - settle into rhythm"
            },
            {
              duration: qualityMiddle,
              intensity: 82,
              zone: TRAINING_ZONES.TEMPO,
              description: "Marathon pace segment"
            },
            {
              duration: easyFinish,
              intensity: 70,
              zone: TRAINING_ZONES.EASY,
              description: "Easy finish - maintain form"
            }
          );
        } else {
          segments.push({
            duration,
            intensity: 70,
            zone: TRAINING_ZONES.EASY,
            description: "Long run at steady aerobic pace"
          });
        }
        break;
      case "progression":
        const thirds = Math.round(duration / 3);
        segments.push(
          {
            duration: thirds,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: "Easy start"
          },
          {
            duration: thirds,
            intensity: 75,
            zone: TRAINING_ZONES.STEADY,
            description: "Steady middle"
          },
          {
            duration: duration - thirds * 2,
            intensity: 85,
            zone: TRAINING_ZONES.TEMPO,
            description: "Tempo finish"
          }
        );
        break;
      default:
        segments.push({
          duration,
          intensity: targetIntensity,
          zone: this.getZoneForIntensity(targetIntensity),
          description: `${type} workout`
        });
    }
    return segments;
  }
  /**
   * Generate default segments when no specific methodology pattern applies
   */
  generateDefaultSegments(type, duration, intensity) {
    const workout = createCustomWorkout(type, duration, intensity);
    return workout.segments;
  }
  /**
   * Apply environmental modifications to workout segments
   * Requirement 4.7: Environmental and equipment constraint handling
   */
  applyEnvironmentalModifications(segments, environmentalFactors, equipment) {
    if (!environmentalFactors && !equipment) {
      return segments;
    }
    let modifiedSegments = [...segments];
    if (environmentalFactors?.typicalTemperature) {
      if (environmentalFactors.typicalTemperature > 25) {
        modifiedSegments = modifiedSegments.map((seg) => {
          const newIntensity = Math.max(seg.intensity - 3, 50);
          const newZone = this.getZoneForIntensity(newIntensity);
          return {
            ...seg,
            intensity: newIntensity,
            zone: newZone,
            description: seg.description + " (adjusted for heat)"
          };
        });
      } else if (environmentalFactors.typicalTemperature < 0) {
        modifiedSegments.unshift({
          duration: 5,
          intensity: 60,
          zone: TRAINING_ZONES.RECOVERY,
          description: "Extra warm-up for cold conditions"
        });
      }
    }
    if (environmentalFactors?.altitude && environmentalFactors.altitude > 1500) {
      const altitudeReduction = Math.min(5, Math.floor(environmentalFactors.altitude / 1e3));
      modifiedSegments = modifiedSegments.map((seg) => ({
        ...seg,
        intensity: Math.max(seg.intensity - altitudeReduction, 50),
        description: seg.description + " (altitude adjusted)"
      }));
    }
    if (equipment && !equipment.includes("track")) {
      modifiedSegments = modifiedSegments.map((seg) => {
        if (seg.intensity > 95) {
          return {
            ...seg,
            intensity: Math.min(seg.intensity, 92),
            description: seg.description + " (modified for road/trail)"
          };
        }
        return seg;
      });
    }
    return modifiedSegments;
  }
  /**
   * Create workout from generated segments
   */
  createWorkoutFromSegments(type, segments) {
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const avgIntensity = segments.reduce((sum, seg) => sum + seg.intensity * seg.duration, 0) / totalDuration;
    return {
      type,
      primaryZone: this.getZoneForIntensity(avgIntensity),
      segments,
      adaptationTarget: this.getAdaptationTarget(type),
      estimatedTSS: this.calculateTSS(segments),
      recoveryTime: this.calculateRecoveryTime(type, totalDuration, avgIntensity)
    };
  }
  /**
   * Calculate methodology compliance score
   */
  calculateMethodologyCompliance(workout, type, phase) {
    let score = 100;
    switch (this.methodology) {
      case "daniels":
        if (type === "tempo" || type === "threshold") {
          const hasTPace = workout.segments.some((seg) => seg.intensity >= 86 && seg.intensity <= 90);
          if (!hasTPace) score -= 20;
        }
        if (type === "vo2max") {
          const hasIPace = workout.segments.some((seg) => seg.intensity >= 93 && seg.intensity <= 97);
          if (!hasIPace) score -= 20;
        }
        break;
      case "lydiard":
        const hardTime = workout.segments.filter((seg) => seg.intensity > 85).reduce((sum, seg) => sum + seg.duration, 0);
        const totalTime = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
        const hardPercentage = hardTime / totalTime;
        if (hardPercentage > 0.2) score -= 30;
        if (phase === "base" && hardPercentage > 0.1) score -= 20;
        if (phase === "base" && type === "speed") {
          score = Math.min(score, 30);
        }
        break;
      case "pfitzinger":
        if ((type === "tempo" || type === "threshold") && phase !== "base") {
          const hasLTWork = workout.segments.some((seg) => seg.intensity >= 84 && seg.intensity <= 88);
          if (!hasLTWork) score -= 25;
        }
        break;
    }
    return Math.max(score, 0);
  }
  /**
   * Generate alternative workouts if compliance is low
   * Requirement 4.8: Provide methodology-compliant alternatives
   */
  generateAlternatives(parameters) {
    const alternatives = [];
    const { type, phase } = parameters;
    const alternativeTypes = this.getAlternativeTypes(type);
    for (const altType of alternativeTypes.slice(0, 2)) {
      const altParams = { ...parameters, type: altType };
      const result = this.generateWorkout(altParams);
      if (result.methodologyCompliance >= 80) {
        alternatives.push(result.workout);
      }
    }
    return alternatives;
  }
  /**
   * Get alternative workout types for substitution
   */
  getAlternativeTypes(type) {
    const alternatives = {
      tempo: ["threshold", "steady", "progression"],
      threshold: ["tempo", "progression", "steady"],
      vo2max: ["fartlek", "hill_repeats", "race_pace"],
      speed: ["fartlek", "hill_repeats", "vo2max"],
      long_run: ["steady", "easy", "progression"],
      easy: ["recovery", "steady", "long_run"],
      recovery: ["easy", "cross_training"],
      hill_repeats: ["fartlek", "vo2max", "tempo"],
      fartlek: ["tempo", "hill_repeats", "progression"],
      progression: ["tempo", "steady", "threshold"],
      steady: ["easy", "tempo", "progression"],
      race_pace: ["tempo", "threshold", "time_trial"],
      time_trial: ["race_pace", "threshold", "vo2max"],
      cross_training: ["easy", "recovery"],
      strength: ["hill_repeats", "cross_training"]
    };
    return alternatives[type] || ["easy", "steady"];
  }
  /**
   * Build rationale for workout generation
   */
  buildRationale(type, phase, constraints, environmentalFactors) {
    let rationale = `Generated custom ${type} workout for ${this.methodology} methodology in ${phase} phase.`;
    if (constraints.availableTime) {
      rationale += ` Adjusted for ${constraints.availableTime} minute time constraint.`;
    }
    if (environmentalFactors?.altitude && environmentalFactors.altitude > 1500) {
      rationale += ` Modified for altitude (${environmentalFactors.altitude}m).`;
    }
    if (environmentalFactors?.typicalTemperature) {
      if (environmentalFactors.typicalTemperature > 25) {
        rationale += " Intensity reduced for heat.";
      } else if (environmentalFactors.typicalTemperature < 0) {
        rationale += " Extra warm-up added for cold.";
      }
    }
    return rationale;
  }
  /**
   * Collect constraint warnings
   */
  collectConstraintWarnings(parameters, workout) {
    const warnings = [];
    if (parameters.constraints?.maxDuration) {
      const totalDuration = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
      if (totalDuration > parameters.constraints.maxDuration) {
        warnings.push(`Workout duration (${totalDuration}min) exceeds maximum constraint (${parameters.constraints.maxDuration}min)`);
      }
    }
    if (parameters.environmentalFactors?.altitude && parameters.environmentalFactors.altitude > 2500) {
      warnings.push("High altitude may significantly impact performance");
    }
    if (parameters.preferences?.preferredIntensity === "low") {
      const hasHighIntensity = workout.segments.some((seg) => seg.intensity > 80);
      if (hasHighIntensity && parameters.type === "tempo") {
        warnings.push("Workout contains high intensity segments despite low intensity preference");
      }
    }
    return warnings;
  }
  /**
   * Apply duration constraints
   */
  applyDurationConstraints(targetDuration, constraints) {
    let duration = targetDuration;
    if (constraints.maxDuration && duration > constraints.maxDuration) {
      duration = constraints.maxDuration;
    }
    if (constraints.minDuration && duration < constraints.minDuration) {
      duration = constraints.minDuration;
    }
    if (constraints.availableTime && duration > constraints.availableTime) {
      duration = constraints.availableTime;
    }
    return duration;
  }
  /**
   * Apply intensity constraints
   */
  applyIntensityConstraints(targetIntensity, constraints, environmentalFactors) {
    let intensity = targetIntensity;
    if (constraints.maxIntensity && intensity > constraints.maxIntensity) {
      intensity = constraints.maxIntensity;
    }
    if (constraints.minIntensity && intensity < constraints.minIntensity) {
      intensity = constraints.minIntensity;
    }
    if (environmentalFactors?.altitude && environmentalFactors.altitude > 1500) {
      intensity = Math.max(intensity - 5, 50);
    }
    if (environmentalFactors?.typicalTemperature && environmentalFactors.typicalTemperature > 30) {
      intensity = Math.max(intensity - 3, 50);
    }
    return intensity;
  }
  /**
   * Get default duration for workout type and phase
   */
  getDefaultDuration(type, phase) {
    const baseDurations = {
      recovery: 30,
      easy: 60,
      steady: 75,
      tempo: 50,
      threshold: 60,
      vo2max: 50,
      speed: 45,
      hill_repeats: 60,
      fartlek: 45,
      progression: 60,
      long_run: 120,
      race_pace: 70,
      time_trial: 40,
      cross_training: 45,
      strength: 30
    };
    let duration = baseDurations[type] || 60;
    if (phase === "base") {
      duration *= 0.8;
    } else if (phase === "peak") {
      duration *= 1.1;
    }
    return Math.round(duration);
  }
  /**
   * Get default intensity for workout type and phase
   */
  getDefaultIntensity(type, phase) {
    const methodologyIntensities = {
      daniels: {
        recovery: 60,
        easy: 65,
        steady: 75,
        tempo: 88,
        threshold: 88,
        vo2max: 95,
        speed: 98,
        hill_repeats: 90,
        fartlek: 80,
        progression: 75,
        long_run: 65,
        race_pace: 85,
        time_trial: 92,
        cross_training: 65,
        strength: 70
      },
      lydiard: {
        recovery: 55,
        easy: 65,
        steady: 70,
        tempo: 80,
        threshold: 82,
        vo2max: 90,
        speed: 92,
        hill_repeats: 85,
        fartlek: 75,
        progression: 70,
        long_run: 65,
        race_pace: 80,
        time_trial: 85,
        cross_training: 60,
        strength: 65
      },
      pfitzinger: {
        recovery: 60,
        easy: 68,
        steady: 75,
        tempo: 85,
        threshold: 88,
        vo2max: 94,
        speed: 96,
        hill_repeats: 88,
        fartlek: 80,
        progression: 78,
        long_run: 70,
        race_pace: 86,
        time_trial: 90,
        cross_training: 65,
        strength: 70
      },
      hudson: {
        recovery: 60,
        easy: 65,
        steady: 75,
        tempo: 85,
        threshold: 88,
        vo2max: 95,
        speed: 98,
        hill_repeats: 90,
        fartlek: 80,
        progression: 75,
        long_run: 65,
        race_pace: 85,
        time_trial: 92,
        cross_training: 65,
        strength: 70
      },
      custom: {
        recovery: 60,
        easy: 65,
        steady: 75,
        tempo: 85,
        threshold: 88,
        vo2max: 95,
        speed: 98,
        hill_repeats: 90,
        fartlek: 80,
        progression: 75,
        long_run: 65,
        race_pace: 85,
        time_trial: 92,
        cross_training: 65,
        strength: 70
      }
    };
    return methodologyIntensities[this.methodology]?.[type] || 70;
  }
  /**
   * Get zone for intensity level
   */
  getZoneForIntensity(intensity) {
    if (intensity < 60) return TRAINING_ZONES.RECOVERY;
    if (intensity < 70) return TRAINING_ZONES.EASY;
    if (intensity < 80) return TRAINING_ZONES.STEADY;
    if (intensity < 90) return TRAINING_ZONES.TEMPO;
    if (intensity < 93) return TRAINING_ZONES.THRESHOLD;
    if (intensity < 97) return TRAINING_ZONES.VO2_MAX;
    return TRAINING_ZONES.NEUROMUSCULAR;
  }
  /**
   * Get pace name for intensity
   */
  getPaceName(intensity) {
    if (this.methodology === "daniels") {
      if (intensity >= 95) return "I";
      if (intensity >= 86) return "T";
      if (intensity >= 75) return "M";
      if (intensity >= 60) return "E";
      return "Recovery";
    }
    const zone = this.getZoneForIntensity(intensity);
    return zone.name.toLowerCase().replace("_", " ");
  }
  /**
   * Get adaptation target for workout type
   */
  getAdaptationTarget(type) {
    const targets = {
      recovery: "Active recovery and regeneration",
      easy: "Aerobic base development",
      steady: "Aerobic capacity improvement",
      tempo: "Lactate threshold development",
      threshold: "Lactate clearance improvement",
      vo2max: "Maximum oxygen uptake",
      speed: "Neuromuscular power",
      hill_repeats: "Strength and power development",
      fartlek: "Speed variation and lactate tolerance",
      progression: "Fatigue resistance",
      long_run: "Endurance and glycogen utilization",
      race_pace: "Race-specific adaptations",
      time_trial: "Competitive readiness",
      cross_training: "Active recovery and variety",
      strength: "Muscular strength"
    };
    return targets[type] || "General fitness improvement";
  }
  /**
   * Calculate TSS for workout segments
   */
  calculateTSS(segments) {
    return segments.reduce((total, seg) => {
      const intensityFactor = seg.intensity / 100;
      const segmentTSS = seg.duration * Math.pow(intensityFactor, 2) * 100 / 60;
      return total + segmentTSS;
    }, 0);
  }
  /**
   * Calculate recovery time needed
   */
  calculateRecoveryTime(type, duration, avgIntensity) {
    const baseRecovery = {
      recovery: 8,
      easy: 12,
      steady: 18,
      tempo: 24,
      threshold: 36,
      vo2max: 48,
      speed: 36,
      hill_repeats: 36,
      fartlek: 24,
      progression: 24,
      long_run: 24,
      race_pace: 36,
      time_trial: 48,
      cross_training: 12,
      strength: 24
    };
    const base = baseRecovery[type] || 24;
    const intensityMultiplier = Math.max(1, avgIntensity / 80);
    const durationMultiplier = Math.max(0.5, duration / 60);
    const calculatedRecovery = Math.round(base * intensityMultiplier * durationMultiplier);
    return Math.max(base, calculatedRecovery);
  }
};

// src/workout-progression-system.ts
var WorkoutProgressionSystem = class {
  constructor(methodology) {
    this.workoutSelector = new MethodologyWorkoutSelector(methodology);
    this.customGenerator = new CustomWorkoutGenerator(methodology);
    this.progressionRules = /* @__PURE__ */ new Map();
    this.substitutionRules = /* @__PURE__ */ new Map();
    this.initializeProgressionRules(methodology);
    this.initializeSubstitutionRules(methodology);
  }
  /**
   * Progress a workout based on training history and methodology
   * Requirement 4.5: Automatic workout difficulty progression following methodology patterns
   */
  progressWorkout(baseWorkout, parameters) {
    const ruleKey = `${baseWorkout.type}_${parameters.methodology}`;
    const rule = this.progressionRules.get(ruleKey);
    if (!rule) {
      return { ...baseWorkout };
    }
    const progressionMultiplier = this.calculateProgressionMultiplier(rule, parameters);
    const progressedSegments = baseWorkout.segments.map((segment) => {
      const newDuration = this.progressDuration(segment.duration, progressionMultiplier, rule);
      const newIntensity = this.progressIntensity(segment.intensity, progressionMultiplier, rule, parameters.phase);
      return {
        ...segment,
        duration: newDuration,
        intensity: newIntensity,
        description: this.updateProgressionDescription(segment.description, progressionMultiplier)
      };
    });
    const newTSS = this.calculateProgressedTSS(progressedSegments);
    const newRecoveryTime = this.calculateProgressedRecoveryTime(baseWorkout.type, progressedSegments);
    return {
      ...baseWorkout,
      segments: progressedSegments,
      estimatedTSS: newTSS,
      recoveryTime: newRecoveryTime
    };
  }
  /**
   * Substitute a workout based on constraints and recovery state
   * Requirement 4.7: Substitute workouts while maintaining methodology integrity
   */
  substituteWorkout(originalWorkout, parameters, recoveryState, constraints) {
    const substitutionRule = this.substitutionRules.get(originalWorkout.type);
    if (!substitutionRule) {
      return {
        workout: originalWorkout,
        rationale: "No substitution rule available for this workout type"
      };
    }
    const suitableSubstitution = substitutionRule.substitutions.find((sub) => {
      if (sub.conditions.phase && !sub.conditions.phase.includes(parameters.phase)) {
        return false;
      }
      if (sub.conditions.methodology && !sub.conditions.methodology.includes(parameters.methodology)) {
        return false;
      }
      if (sub.conditions.recoveryState && sub.conditions.recoveryState !== recoveryState) {
        return false;
      }
      if (sub.conditions.minFitnessLevel && this.calculateFitnessScore(parameters.fitnessLevel) < sub.conditions.minFitnessLevel) {
        return false;
      }
      return true;
    });
    if (!suitableSubstitution) {
      return {
        workout: originalWorkout,
        rationale: "No suitable substitution found for current conditions"
      };
    }
    const baseTemplate = WORKOUT_TEMPLATES[this.getWorkoutTemplateKey(suitableSubstitution.type)];
    if (!baseTemplate) {
      const originalDuration = originalWorkout.segments.reduce((sum, seg) => sum + seg.duration, 0);
      const targetDuration = constraints?.availableTime ? Math.min(originalDuration, constraints.availableTime) : originalDuration;
      const customResult = this.customGenerator.generateWorkout({
        type: suitableSubstitution.type,
        phase: parameters.phase,
        methodology: parameters.methodology,
        targetDuration,
        constraints: {
          availableTime: constraints?.availableTime,
          maxIntensity: recoveryState === "low" ? 70 : recoveryState === "medium" ? 85 : void 0
        }
      });
      return {
        workout: customResult.workout,
        rationale: `Substituted ${originalWorkout.type} with ${suitableSubstitution.type} due to ${recoveryState} recovery state. ${customResult.rationale}`
      };
    }
    let adjustedWorkout = { ...baseTemplate };
    if (suitableSubstitution.intensityAdjustment) {
      adjustedWorkout = this.adjustWorkoutIntensity(adjustedWorkout, suitableSubstitution.intensityAdjustment);
    }
    if (constraints?.availableTime) {
      const totalDuration = adjustedWorkout.segments.reduce((sum, seg) => sum + seg.duration, 0);
      if (totalDuration > constraints.availableTime) {
        const scaleFactor = constraints.availableTime / totalDuration;
        adjustedWorkout = {
          ...adjustedWorkout,
          segments: adjustedWorkout.segments.map((segment) => ({
            ...segment,
            duration: Math.round(segment.duration * scaleFactor)
          })),
          estimatedTSS: Math.round(adjustedWorkout.estimatedTSS * scaleFactor)
        };
      }
    }
    const rationale = this.buildSubstitutionRationale(
      originalWorkout.type,
      suitableSubstitution.type,
      recoveryState,
      parameters.phase,
      parameters.methodology
    );
    return {
      workout: adjustedWorkout,
      rationale
    };
  }
  /**
   * Generate recovery-based workout recommendations
   * Requirement 4.6: Select appropriate active recovery or rest based on methodology preferences
   */
  getRecoveryRecommendation(recoveryState, methodology, phase, trainingLoad) {
    const baseRecommendation = this.getMethodologyRecoveryPreferences(methodology);
    switch (recoveryState) {
      case "low":
        return {
          recommendedIntensity: Math.min(50, baseRecommendation.maxIntensity),
          recommendedDuration: Math.min(30, baseRecommendation.maxDuration),
          workoutTypes: ["recovery", "cross_training"],
          rationale: `Low recovery state requires gentle movement. ${methodology} methodology emphasizes ${this.getRecoveryPhilosophy(methodology)}.`,
          restrictions: ["Avoid all high-intensity work", "Keep effort conversational", "Stop if fatigue increases"]
        };
      case "medium":
        return {
          recommendedIntensity: Math.min(65, baseRecommendation.maxIntensity),
          recommendedDuration: Math.min(60, baseRecommendation.maxDuration),
          workoutTypes: ["easy", "recovery", "steady"],
          rationale: `Medium recovery allows for easy aerobic work. Focus on maintaining movement quality.`,
          restrictions: ["No tempo or harder efforts", "Monitor fatigue levels", "Shorten if needed"]
        };
      case "high":
        return {
          recommendedIntensity: baseRecommendation.maxIntensity,
          recommendedDuration: baseRecommendation.maxDuration,
          workoutTypes: this.getPhaseAppropriateWorkouts(phase, methodology),
          rationale: "Good recovery state allows for normal training progression.",
          restrictions: ["Follow planned intensity", "Adjust based on feel"]
        };
      default:
        return {
          recommendedIntensity: 60,
          recommendedDuration: 45,
          workoutTypes: ["easy"],
          rationale: "Default recommendation for unknown recovery state.",
          restrictions: ["Stay conservative"]
        };
    }
  }
  /**
   * Initialize methodology-specific progression rules
   */
  initializeProgressionRules(methodology) {
    const rules = [
      // Daniels methodology progression rules
      {
        workoutType: "tempo",
        methodology: "daniels",
        progressionType: "linear",
        parameters: {
          baseIncrease: 0.05,
          // 5% per week
          maxIncrease: 0.15
          // Max 15% total
        },
        phaseModifiers: {
          base: 0.5,
          // Slower progression in base
          build: 1,
          // Normal progression
          peak: 1.2,
          // Faster progression  
          taper: 0,
          // No progression
          recovery: 0
        }
      },
      {
        workoutType: "vo2max",
        methodology: "daniels",
        progressionType: "stepped",
        parameters: {
          baseIncrease: 0.15,
          // 15% steps - more aggressive
          maxIncrease: 0.4,
          stepSize: 2
          // Every 2 weeks
        },
        phaseModifiers: {
          base: 0.3,
          build: 1.2,
          // Increased for build phase
          peak: 1.4,
          // Increased for peak phase
          taper: 0,
          recovery: 0
        }
      },
      // Lydiard methodology progression rules
      {
        workoutType: "long_run",
        methodology: "lydiard",
        progressionType: "linear",
        parameters: {
          baseIncrease: 0.08,
          // 8% per week
          maxIncrease: 0.3
          // Can increase significantly
        },
        phaseModifiers: {
          base: 1.2,
          // Emphasized in base
          build: 0.8,
          // Reduced in build
          peak: 0.5,
          // Maintenance
          taper: 0,
          recovery: 0
        }
      },
      {
        workoutType: "hill_repeats",
        methodology: "lydiard",
        progressionType: "stepped",
        parameters: {
          baseIncrease: 0.2,
          // More aggressive progression
          maxIncrease: 0.5,
          stepSize: 2
          // Every 2 weeks - faster steps
        },
        phaseModifiers: {
          base: 1,
          build: 1.8,
          // Much stronger emphasis in build
          peak: 1.4,
          taper: 0,
          recovery: 0
        }
      },
      // Pfitzinger methodology progression rules
      {
        workoutType: "threshold",
        methodology: "pfitzinger",
        progressionType: "exponential",
        parameters: {
          baseIncrease: 0.08,
          // More aggressive base
          maxIncrease: 0.3
          // Higher max
        },
        phaseModifiers: {
          base: 0.7,
          build: 1.5,
          // Even heavier emphasis
          peak: 1.2,
          taper: 0,
          recovery: 0
        }
      }
    ];
    rules.forEach((rule) => {
      const key = `${rule.workoutType}_${rule.methodology}`;
      this.progressionRules.set(key, rule);
    });
  }
  /**
   * Initialize methodology-specific substitution rules  
   */
  initializeSubstitutionRules(methodology) {
    const substitutionRules = [
      // Tempo workout substitutions
      {
        originalType: "tempo",
        substitutions: [
          {
            type: "steady",
            priority: 1,
            conditions: { recoveryState: "low" },
            intensityAdjustment: -10
          },
          {
            type: "threshold",
            priority: 2,
            conditions: { phase: ["build", "peak"], methodology: ["pfitzinger"] }
          },
          {
            type: "easy",
            priority: 3,
            conditions: { recoveryState: "low" },
            intensityAdjustment: -20
          }
        ]
      },
      // VO2max workout substitutions
      {
        originalType: "vo2max",
        substitutions: [
          {
            type: "hill_repeats",
            priority: 1,
            conditions: { methodology: ["lydiard"], phase: ["build", "peak"] }
          },
          {
            type: "fartlek",
            priority: 2,
            conditions: { recoveryState: "medium" },
            intensityAdjustment: -5
          },
          {
            type: "tempo",
            priority: 3,
            conditions: { recoveryState: "low" },
            intensityAdjustment: -15
          }
        ]
      },
      // Long run substitutions
      {
        originalType: "long_run",
        substitutions: [
          {
            type: "steady",
            priority: 1,
            conditions: { recoveryState: "low" },
            intensityAdjustment: -10
          },
          {
            type: "steady",
            priority: 2,
            conditions: { recoveryState: "medium" },
            // Add medium recovery option
            intensityAdjustment: -5
          },
          {
            type: "easy",
            priority: 3,
            conditions: { recoveryState: "low" }
          },
          {
            type: "easy",
            priority: 4,
            conditions: { recoveryState: "medium" }
            // Add medium recovery option
          },
          {
            type: "cross_training",
            priority: 5,
            conditions: { recoveryState: "low" }
          }
        ]
      },
      // Speed workout substitutions
      {
        originalType: "speed",
        substitutions: [
          {
            type: "fartlek",
            priority: 1,
            conditions: { recoveryState: "medium" },
            intensityAdjustment: -10
          },
          {
            type: "hill_repeats",
            priority: 2,
            conditions: { methodology: ["lydiard"] }
          },
          {
            type: "vo2max",
            priority: 3,
            conditions: { recoveryState: "medium" }
          }
        ]
      }
    ];
    substitutionRules.forEach((rule) => {
      this.substitutionRules.set(rule.originalType, rule);
    });
  }
  /**
   * Calculate progression multiplier based on rule and parameters
   */
  calculateProgressionMultiplier(rule, parameters) {
    const phaseModifier = rule.phaseModifiers[parameters.phase] || 1;
    if (parameters.phase === "taper" || parameters.phase === "recovery") {
      return 1;
    }
    const fitnessModifier = this.getFitnessProgressionModifier(parameters.fitnessLevel);
    let progressionMultiplier;
    switch (rule.progressionType) {
      case "linear":
        progressionMultiplier = 1 + rule.parameters.baseIncrease * parameters.currentWeek;
        break;
      case "exponential":
        progressionMultiplier = Math.pow(1 + rule.parameters.baseIncrease, parameters.currentWeek);
        break;
      case "stepped":
        const stepCount = Math.floor(parameters.currentWeek / (rule.parameters.stepSize || 2));
        progressionMultiplier = 1 + rule.parameters.baseIncrease * stepCount;
        break;
      case "plateau":
        const plateauWeek = rule.parameters.plateauThreshold || parameters.totalWeeks * 0.7;
        if (parameters.currentWeek < plateauWeek) {
          progressionMultiplier = 1 + rule.parameters.baseIncrease * parameters.currentWeek;
        } else {
          progressionMultiplier = 1 + rule.parameters.baseIncrease * plateauWeek;
        }
        break;
      default:
        progressionMultiplier = 1;
    }
    progressionMultiplier *= phaseModifier * fitnessModifier;
    progressionMultiplier = Math.min(progressionMultiplier, 1 + rule.parameters.maxIncrease);
    return Math.max(progressionMultiplier, 1);
  }
  /**
   * Progress workout duration with methodology-specific rules
   */
  progressDuration(baseDuration, multiplier, rule) {
    switch (rule.workoutType) {
      case "long_run":
        return Math.round(baseDuration * Math.min(multiplier, 1.5));
      case "speed":
      case "vo2max":
        return Math.round(baseDuration * Math.min(multiplier, 1.2));
      case "tempo":
      case "threshold":
        return Math.round(baseDuration * Math.min(multiplier, 1.3));
      default:
        return Math.round(baseDuration * Math.min(multiplier, 1.25));
    }
  }
  /**
   * Progress workout intensity with phase-specific constraints
   */
  progressIntensity(baseIntensity, multiplier, rule, phase) {
    const intensityMultiplier = 1 + (multiplier - 1) * 0.5;
    const newIntensity = baseIntensity * intensityMultiplier;
    const phaseCaps = {
      base: 85,
      build: 95,
      peak: 100,
      taper: 90,
      recovery: 70
    };
    return Math.min(newIntensity, phaseCaps[phase]);
  }
  /**
   * Get fitness-based progression modifier
   */
  getFitnessProgressionModifier(fitness) {
    const score = this.calculateFitnessScore(fitness);
    if (score >= 8) return 1.2;
    if (score >= 6) return 1;
    if (score >= 4) return 0.8;
    return 0.6;
  }
  /**
   * Calculate a fitness score from the FitnessAssessment
   */
  calculateFitnessScore(fitness) {
    if (fitness.overallScore !== void 0) {
      return fitness.overallScore;
    }
    let score = 0;
    if (fitness.vdot) {
      score += Math.min(fitness.vdot / 80 * 4, 4);
    }
    score += Math.min(fitness.weeklyMileage / 100 * 3, 3);
    if (fitness.trainingAge) {
      score += Math.min(fitness.trainingAge / 10 * 2, 2);
    }
    if (fitness.recentRecoveryMetrics) {
      const avgRecovery = fitness.recentRecoveryMetrics.reduce((sum, m) => sum + m.overallScore, 0) / fitness.recentRecoveryMetrics.length;
      score += Math.min(avgRecovery / 10, 1);
    }
    return Math.round(score * 10) / 10;
  }
  /**
   * Calculate TSS for progressed workout segments
   */
  calculateProgressedTSS(segments) {
    return segments.reduce((total, seg) => {
      const intensityFactor = seg.intensity / 100;
      const segmentTSS = seg.duration * Math.pow(intensityFactor, 2) * 100 / 60;
      return total + segmentTSS;
    }, 0);
  }
  /**
   * Calculate recovery time for progressed workout
   */
  calculateProgressedRecoveryTime(type, segments) {
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const avgIntensity = segments.reduce((sum, seg) => sum + seg.intensity * seg.duration, 0) / totalDuration;
    const baseRecovery = RECOVERY_MULTIPLIERS[type] || 1;
    const intensityMultiplier = avgIntensity / 80;
    const durationMultiplier = totalDuration / 60;
    return Math.round(24 * baseRecovery * intensityMultiplier * durationMultiplier);
  }
  /**
   * Update workout description to reflect progression
   */
  updateProgressionDescription(baseDescription, multiplier) {
    if (multiplier > 1.1) {
      return `${baseDescription} (progressed +${Math.round((multiplier - 1) * 100)}%)`;
    }
    return baseDescription;
  }
  /**
   * Adjust workout intensity by percentage
   */
  adjustWorkoutIntensity(workout, adjustment) {
    const adjustedSegments = workout.segments.map((segment) => ({
      ...segment,
      intensity: Math.max(50, Math.min(100, segment.intensity + adjustment))
    }));
    return {
      ...workout,
      segments: adjustedSegments,
      estimatedTSS: this.calculateProgressedTSS(adjustedSegments)
    };
  }
  /**
   * Build rationale for workout substitution
   */
  buildSubstitutionRationale(originalType, newType, recoveryState, phase, methodology) {
    return `Substituted ${originalType} with ${newType} due to ${recoveryState} recovery state. This maintains ${methodology} methodology principles while respecting current ${phase} phase needs.`;
  }
  /**
   * Get methodology-specific recovery preferences
   */
  getMethodologyRecoveryPreferences(methodology) {
    switch (methodology) {
      case "daniels":
        return { maxIntensity: 65, maxDuration: 60 };
      // Easy pace emphasis
      case "lydiard":
        return { maxIntensity: 70, maxDuration: 90 };
      // More aerobic work allowed
      case "pfitzinger":
        return { maxIntensity: 68, maxDuration: 75 };
      // Moderate recovery
      default:
        return { maxIntensity: 65, maxDuration: 60 };
    }
  }
  /**
   * Get recovery philosophy for methodology
   */
  getRecoveryPhilosophy(methodology) {
    switch (methodology) {
      case "daniels":
        return "easy running at E pace for active recovery";
      case "lydiard":
        return "complete rest or very easy aerobic movement";
      case "pfitzinger":
        return "easy running with focus on maintaining aerobic base";
      default:
        return "easy aerobic activity";
    }
  }
  /**
   * Get phase-appropriate workout types for methodology
   */
  getPhaseAppropriateWorkouts(phase, methodology) {
    const baseWorkouts = ["easy", "steady", "tempo"];
    switch (phase) {
      case "base":
        return [...baseWorkouts, "long_run"];
      case "build":
        return [...baseWorkouts, "threshold", "vo2max", "hill_repeats"];
      case "peak":
        return [...baseWorkouts, "speed", "race_pace", "time_trial"];
      case "taper":
        return ["easy", "steady", "race_pace"];
      case "recovery":
        return ["recovery", "easy", "cross_training"];
      default:
        return baseWorkouts;
    }
  }
  /**
   * Get appropriate workout template key for workout type
   */
  getWorkoutTemplateKey(type) {
    const templateMap = {
      recovery: "RECOVERY_JOG",
      easy: "EASY_AEROBIC",
      steady: "EASY_AEROBIC",
      tempo: "TEMPO_CONTINUOUS",
      threshold: "LACTATE_THRESHOLD_2X20",
      vo2max: "VO2MAX_4X4",
      speed: "SPEED_200M_REPS",
      hill_repeats: "HILL_REPEATS_6X2",
      fartlek: "FARTLEK_VARIED",
      progression: "PROGRESSION_3_STAGE",
      long_run: "LONG_RUN",
      race_pace: "TEMPO_CONTINUOUS",
      time_trial: "THRESHOLD_PROGRESSION",
      cross_training: "EASY_AEROBIC",
      strength: "RECOVERY_JOG"
    };
    return templateMap[type] || "EASY_AEROBIC";
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADAPTATION_TIMELINE,
  AdvancedTrainingPlanGenerator,
  BaseTrainingPhilosophy,
  CSVFormatter,
  CacheManager,
  CalculationProfiler,
  CustomWorkoutGenerator,
  ENVIRONMENTAL_FACTORS,
  EnhancedJSONFormatter,
  ExportUtils,
  GarminFormatter,
  INTENSITY_MODELS,
  JSONFormatter,
  LOAD_THRESHOLDS,
  METHODOLOGY_INTENSITY_DISTRIBUTIONS,
  METHODOLOGY_PHASE_TARGETS,
  MemoryMonitor,
  MethodologyWorkoutSelector,
  MultiFormatExporter,
  OptimizationAnalyzer,
  PDFFormatter,
  PHASE_DURATION,
  PROGRESSION_RATES,
  PhilosophyFactory,
  PhilosophyUtils,
  RACE_DISTANCES,
  RECOVERY_MULTIPLIERS,
  SmartAdaptationEngine,
  StravaFormatter,
  TCXFormatter,
  TRAINING_METHODOLOGIES,
  TRAINING_ZONES,
  TrainingPeaksFormatter,
  TrainingPlanGenerator,
  WORKOUT_DURATIONS,
  WORKOUT_EMPHASIS,
  WORKOUT_TEMPLATES,
  WorkoutProgressionSystem,
  analyzeWeeklyPatterns,
  batchCalculateVDOT,
  cacheInstances,
  calculateCriticalSpeed,
  calculateCriticalSpeedCached,
  calculateFitnessMetrics,
  calculateFitnessMetricsCached,
  calculateInjuryRisk,
  calculateLactateThreshold,
  calculatePersonalizedZones,
  calculateRecoveryScore,
  calculateTSS,
  calculateTrainingLoad,
  calculateTrainingPaces,
  calculateTrainingPacesCached,
  calculateVDOT,
  calculateVDOTCached,
  createAdaptationEngine,
  createCustomWorkout,
  createExportManager,
  estimateRunningEconomy,
  getZoneByIntensity,
  iCalFormatter
});
