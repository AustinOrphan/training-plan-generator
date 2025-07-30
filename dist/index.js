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
  ENVIRONMENTAL_FACTORS: () => ENVIRONMENTAL_FACTORS,
  INTENSITY_MODELS: () => INTENSITY_MODELS,
  LOAD_THRESHOLDS: () => LOAD_THRESHOLDS,
  METHODOLOGY_PHASE_TARGETS: () => METHODOLOGY_PHASE_TARGETS,
  PHASE_DURATION: () => PHASE_DURATION,
  PROGRESSION_RATES: () => PROGRESSION_RATES,
  RACE_DISTANCES: () => RACE_DISTANCES,
  RECOVERY_MULTIPLIERS: () => RECOVERY_MULTIPLIERS,
  TRAINING_METHODOLOGIES: () => TRAINING_METHODOLOGIES,
  TRAINING_ZONES: () => TRAINING_ZONES,
  TrainingPlanGenerator: () => TrainingPlanGenerator,
  WORKOUT_DURATIONS: () => WORKOUT_DURATIONS,
  WORKOUT_EMPHASIS: () => WORKOUT_EMPHASIS,
  WORKOUT_TEMPLATES: () => WORKOUT_TEMPLATES,
  analyzeWeeklyPatterns: () => analyzeWeeklyPatterns,
  calculateCriticalSpeed: () => calculateCriticalSpeed,
  calculateFitnessMetrics: () => calculateFitnessMetrics,
  calculateInjuryRisk: () => calculateInjuryRisk,
  calculateLactateThreshold: () => calculateLactateThreshold,
  calculatePersonalizedZones: () => calculatePersonalizedZones,
  calculateRecoveryScore: () => calculateRecoveryScore,
  calculateTSS: () => calculateTSS,
  calculateTrainingLoad: () => calculateTrainingLoad,
  calculateTrainingPaces: () => calculateTrainingPaces,
  calculateVDOT: () => calculateVDOT,
  createCustomWorkout: () => createCustomWorkout,
  estimateRunningEconomy: () => estimateRunningEconomy,
  getZoneByIntensity: () => getZoneByIntensity
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
    workoutPriorities: ["easy", "long_run", "hill_repeats", "tempo", "speed"],
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
    workouts.forEach((workout) => {
      const intensity = workout.targetMetrics.intensity;
      if (intensity < 75) easy++;
      else if (intensity < 88) moderate++;
      else hard++;
    });
    const total = workouts.length;
    return {
      easy: Math.round(easy / total * 100),
      moderate: Math.round(moderate / total * 100),
      hard: Math.round(hard / total * 100)
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
   * Create default fitness assessment
   */
  createDefaultFitness() {
    return {
      weeklyMileage: 30,
      longestRecentRun: 10,
      vdot: 40,
      trainingAge: 1
    };
  }
  /**
   * Assess fitness from run history
   */
  static assessFitnessFromRuns(runs) {
    const metrics = calculateFitnessMetrics(runs);
    const patterns = analyzeWeeklyPatterns(runs);
    return {
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
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADAPTATION_TIMELINE,
  ENVIRONMENTAL_FACTORS,
  INTENSITY_MODELS,
  LOAD_THRESHOLDS,
  METHODOLOGY_PHASE_TARGETS,
  PHASE_DURATION,
  PROGRESSION_RATES,
  RACE_DISTANCES,
  RECOVERY_MULTIPLIERS,
  TRAINING_METHODOLOGIES,
  TRAINING_ZONES,
  TrainingPlanGenerator,
  WORKOUT_DURATIONS,
  WORKOUT_EMPHASIS,
  WORKOUT_TEMPLATES,
  analyzeWeeklyPatterns,
  calculateCriticalSpeed,
  calculateFitnessMetrics,
  calculateInjuryRisk,
  calculateLactateThreshold,
  calculatePersonalizedZones,
  calculateRecoveryScore,
  calculateTSS,
  calculateTrainingLoad,
  calculateTrainingPaces,
  calculateVDOT,
  createCustomWorkout,
  estimateRunningEconomy,
  getZoneByIntensity
});
