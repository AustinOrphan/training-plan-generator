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
      {
        duration: 10,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Warm-up"
      },
      {
        duration: 30,
        intensity: 84,
        zone: TRAINING_ZONES.TEMPO,
        description: "Steady tempo effort"
      },
      {
        duration: 10,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Cool-down"
      }
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
      {
        duration: 10,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Warm-up"
      },
      {
        duration: 20,
        intensity: 88,
        zone: TRAINING_ZONES.THRESHOLD,
        description: "Threshold pace"
      },
      {
        duration: 5,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Recovery"
      },
      {
        duration: 20,
        intensity: 88,
        zone: TRAINING_ZONES.THRESHOLD,
        description: "Threshold pace"
      },
      {
        duration: 10,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Cool-down"
      }
    ],
    adaptationTarget: "Lactate threshold improvement",
    estimatedTSS: 90,
    recoveryTime: 36
  },
  THRESHOLD_PROGRESSION: {
    type: "threshold",
    primaryZone: TRAINING_ZONES.THRESHOLD,
    segments: [
      {
        duration: 10,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Warm-up"
      },
      {
        duration: 10,
        intensity: 80,
        zone: TRAINING_ZONES.STEADY,
        description: "Build"
      },
      {
        duration: 10,
        intensity: 85,
        zone: TRAINING_ZONES.TEMPO,
        description: "Tempo"
      },
      {
        duration: 10,
        intensity: 90,
        zone: TRAINING_ZONES.THRESHOLD,
        description: "Threshold"
      },
      {
        duration: 10,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Cool-down"
      }
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
      {
        duration: 15,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Warm-up"
      },
      {
        duration: 4,
        intensity: 95,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "VO2max interval"
      },
      {
        duration: 3,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Recovery"
      },
      {
        duration: 4,
        intensity: 95,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "VO2max interval"
      },
      {
        duration: 3,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Recovery"
      },
      {
        duration: 4,
        intensity: 95,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "VO2max interval"
      },
      {
        duration: 3,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Recovery"
      },
      {
        duration: 4,
        intensity: 95,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "VO2max interval"
      },
      {
        duration: 10,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Cool-down"
      }
    ],
    adaptationTarget: "VO2max improvement, aerobic power",
    estimatedTSS: 100,
    recoveryTime: 48
  },
  VO2MAX_5X3: {
    type: "vo2max",
    primaryZone: TRAINING_ZONES.VO2_MAX,
    segments: [
      {
        duration: 15,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Warm-up"
      },
      {
        duration: 3,
        intensity: 96,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "VO2max interval"
      },
      {
        duration: 2,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Recovery"
      },
      {
        duration: 3,
        intensity: 96,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "VO2max interval"
      },
      {
        duration: 2,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Recovery"
      },
      {
        duration: 3,
        intensity: 96,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "VO2max interval"
      },
      {
        duration: 2,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Recovery"
      },
      {
        duration: 3,
        intensity: 96,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "VO2max interval"
      },
      {
        duration: 2,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Recovery"
      },
      {
        duration: 3,
        intensity: 96,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "VO2max interval"
      },
      {
        duration: 10,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Cool-down"
      }
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
      {
        duration: 15,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Warm-up"
      },
      {
        duration: 0.5,
        intensity: 98,
        zone: TRAINING_ZONES.NEUROMUSCULAR,
        description: "200m rep"
      },
      {
        duration: 2,
        intensity: 50,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Walk recovery"
      },
      {
        duration: 0.5,
        intensity: 98,
        zone: TRAINING_ZONES.NEUROMUSCULAR,
        description: "200m rep"
      },
      {
        duration: 2,
        intensity: 50,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Walk recovery"
      },
      {
        duration: 0.5,
        intensity: 98,
        zone: TRAINING_ZONES.NEUROMUSCULAR,
        description: "200m rep"
      },
      {
        duration: 2,
        intensity: 50,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Walk recovery"
      },
      {
        duration: 0.5,
        intensity: 98,
        zone: TRAINING_ZONES.NEUROMUSCULAR,
        description: "200m rep"
      },
      {
        duration: 2,
        intensity: 50,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Walk recovery"
      },
      {
        duration: 0.5,
        intensity: 98,
        zone: TRAINING_ZONES.NEUROMUSCULAR,
        description: "200m rep"
      },
      {
        duration: 2,
        intensity: 50,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Walk recovery"
      },
      {
        duration: 0.5,
        intensity: 98,
        zone: TRAINING_ZONES.NEUROMUSCULAR,
        description: "200m rep"
      },
      {
        duration: 10,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Cool-down"
      }
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
      {
        duration: 15,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Warm-up to hills"
      },
      {
        duration: 2,
        intensity: 92,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "Hill repeat"
      },
      {
        duration: 3,
        intensity: 50,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Jog down"
      },
      {
        duration: 2,
        intensity: 92,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "Hill repeat"
      },
      {
        duration: 3,
        intensity: 50,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Jog down"
      },
      {
        duration: 2,
        intensity: 92,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "Hill repeat"
      },
      {
        duration: 3,
        intensity: 50,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Jog down"
      },
      {
        duration: 2,
        intensity: 92,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "Hill repeat"
      },
      {
        duration: 3,
        intensity: 50,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Jog down"
      },
      {
        duration: 2,
        intensity: 92,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "Hill repeat"
      },
      {
        duration: 3,
        intensity: 50,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Jog down"
      },
      {
        duration: 2,
        intensity: 92,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "Hill repeat"
      },
      {
        duration: 10,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Cool-down"
      }
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
      {
        duration: 10,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Warm-up"
      },
      {
        duration: 2,
        intensity: 90,
        zone: TRAINING_ZONES.THRESHOLD,
        description: "Hard surge"
      },
      {
        duration: 3,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Easy recovery"
      },
      {
        duration: 1,
        intensity: 95,
        zone: TRAINING_ZONES.VO2_MAX,
        description: "Sprint"
      },
      {
        duration: 4,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Easy recovery"
      },
      {
        duration: 3,
        intensity: 85,
        zone: TRAINING_ZONES.TEMPO,
        description: "Tempo surge"
      },
      {
        duration: 2,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Easy recovery"
      },
      {
        duration: 0.5,
        intensity: 98,
        zone: TRAINING_ZONES.NEUROMUSCULAR,
        description: "Sprint"
      },
      {
        duration: 4.5,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Easy recovery"
      },
      {
        duration: 10,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Cool-down"
      }
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
      {
        duration: 20,
        intensity: 65,
        zone: TRAINING_ZONES.EASY,
        description: "Easy start"
      },
      {
        duration: 20,
        intensity: 78,
        zone: TRAINING_ZONES.STEADY,
        description: "Steady pace"
      },
      {
        duration: 20,
        intensity: 85,
        zone: TRAINING_ZONES.TEMPO,
        description: "Tempo finish"
      },
      {
        duration: 5,
        intensity: 60,
        zone: TRAINING_ZONES.RECOVERY,
        description: "Cool-down"
      }
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
    estimatedTSS: calculateTSS(duration, primaryIntensity),
    recoveryTime: calculateRecoveryTime(type, duration, primaryIntensity)
  };
}
function calculateTSS(duration, intensity) {
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
  HALF_MARATHON: 21.0975,
  MARATHON: 42.195,
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
    intensityDistribution: { easy: 80, moderate: 10, hard: 10, veryHard: 0 },
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
    intensityDistribution: { easy: 85, moderate: 10, hard: 5, veryHard: 0 },
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
    intensityDistribution: { easy: 75, moderate: 15, hard: 10, veryHard: 0 },
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
    intensityDistribution: { easy: 70, moderate: 20, hard: 10, veryHard: 0 },
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
    intensityDistribution: { easy: 75, moderate: 15, hard: 10, veryHard: 0 },
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
    steady: 1.1,
    tempo: 1.5,
    threshold: 1.4,
    vo2max: 1.3,
    speed: 1.1,
    hill_repeats: 1.2,
    fartlek: 1.2,
    progression: 1.2,
    long_run: 1.2,
    race_pace: 1.3,
    time_trial: 1.1,
    cross_training: 0.8,
    strength: 0.9
  },
  lydiard: {
    recovery: 1,
    easy: 1.5,
    steady: 1.3,
    tempo: 1.1,
    threshold: 1,
    vo2max: 0.8,
    speed: 0.9,
    hill_repeats: 1.3,
    fartlek: 1,
    progression: 1.2,
    long_run: 1.4,
    race_pace: 1,
    time_trial: 0.9,
    cross_training: 0.7,
    strength: 0.8
  },
  pfitzinger: {
    recovery: 1,
    easy: 1.3,
    steady: 1.2,
    tempo: 1.2,
    threshold: 1.5,
    vo2max: 1.1,
    speed: 1,
    hill_repeats: 1.1,
    fartlek: 1,
    progression: 1.2,
    long_run: 1.3,
    race_pace: 1.4,
    time_trial: 1.2,
    cross_training: 0.8,
    strength: 0.9
  },
  hudson: {
    recovery: 1,
    easy: 1.2,
    steady: 1.1,
    tempo: 1.4,
    threshold: 1.2,
    vo2max: 1.1,
    speed: 1,
    hill_repeats: 1.1,
    fartlek: 1.3,
    progression: 1.2,
    long_run: 1.2,
    race_pace: 1.2,
    time_trial: 1.1,
    cross_training: 0.9,
    strength: 1
  },
  custom: {
    recovery: 1,
    easy: 1.2,
    steady: 1.1,
    tempo: 1.2,
    threshold: 1.2,
    vo2max: 1.1,
    speed: 1,
    hill_repeats: 1.1,
    fartlek: 1.2,
    progression: 1.1,
    long_run: 1.2,
    race_pace: 1.2,
    time_trial: 1.1,
    cross_training: 0.8,
    strength: 0.9
  }
};
var METHODOLOGY_INTENSITY_DISTRIBUTIONS = {
  daniels: {
    base: { easy: 85, moderate: 10, hard: 5, veryHard: 0 },
    // 80/20 approach with slight emphasis on aerobic base
    build: { easy: 80, moderate: 15, hard: 5, veryHard: 0 },
    // Standard Daniels distribution
    peak: { easy: 75, moderate: 15, hard: 10, veryHard: 0 },
    // More VO2max work for race preparation
    taper: { easy: 80, moderate: 15, hard: 5, veryHard: 0 },
    // Return to more conservative distribution
    recovery: { easy: 95, moderate: 5, hard: 0, veryHard: 0 }
    // Complete aerobic recovery
  },
  lydiard: {
    base: { easy: 90, moderate: 8, hard: 2, veryHard: 0 },
    // Lydiard's signature 85%+ easy running in base
    build: { easy: 85, moderate: 12, hard: 3, veryHard: 0 },
    // Maintain heavy aerobic emphasis
    peak: { easy: 80, moderate: 15, hard: 5, veryHard: 0 },
    // Limited speed work after base building
    taper: { easy: 85, moderate: 12, hard: 3, veryHard: 0 },
    // Conservative approach to taper
    recovery: { easy: 100, moderate: 0, hard: 0, veryHard: 0 }
    // Complete rest philosophy
  },
  pfitzinger: {
    base: { easy: 75, moderate: 20, hard: 5, veryHard: 0 },
    // Higher moderate emphasis (threshold work)
    build: { easy: 70, moderate: 25, hard: 5, veryHard: 0 },
    // Significant lactate threshold volume
    peak: { easy: 70, moderate: 20, hard: 10, veryHard: 0 },
    // Race-specific pace work increase
    taper: { easy: 75, moderate: 20, hard: 5, veryHard: 0 },
    // Maintain some threshold work
    recovery: { easy: 90, moderate: 10, hard: 0, veryHard: 0 }
    // Active recovery approach
  },
  hudson: {
    base: { easy: 80, moderate: 15, hard: 5, veryHard: 0 },
    // Balanced approach with tempo emphasis
    build: { easy: 75, moderate: 20, hard: 5, veryHard: 0 },
    // Tempo endurance focus
    peak: { easy: 70, moderate: 20, hard: 10, veryHard: 0 },
    // Race pace and neuromuscular work
    taper: { easy: 80, moderate: 15, hard: 5, veryHard: 0 },
    // Return to base distribution
    recovery: { easy: 90, moderate: 10, hard: 0, veryHard: 0 }
    // Moderate recovery approach
  },
  custom: {
    base: { easy: 80, moderate: 15, hard: 5, veryHard: 0 },
    // Default polarized approach
    build: { easy: 75, moderate: 20, hard: 5, veryHard: 0 },
    // Moderate build phase
    peak: { easy: 70, moderate: 20, hard: 10, veryHard: 0 },
    // Increased intensity for peaking
    taper: { easy: 80, moderate: 15, hard: 5, veryHard: 0 },
    // Return to conservative distribution
    recovery: { easy: 90, moderate: 10, hard: 0, veryHard: 0 }
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

// src/calculator.ts
import {
  startOfWeek,
  format
} from "date-fns";
function calculateVDOT(runs) {
  const performances = runs.filter(
    (run) => run.isRace || run.effortLevel && run.effortLevel >= 9
  );
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
  const timeTrials = runs.filter(
    (run) => run.distance >= 3 && run.effortLevel && run.effortLevel >= 8
  ).map((run) => ({
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
    return Math.round(
      economies.reduce((sum, e) => sum + e, 0) / economies.length
    );
  }
  return 200;
}
function calculateLactateThreshold(vdot) {
  const thresholdVelocity = vdot * 0.88 / 3.5;
  return thresholdVelocity;
}
function calculateTSS2(run, thresholdPace) {
  if (!run.avgPace) return 0;
  const intensityFactor = thresholdPace / run.avgPace;
  const tss = run.duration * Math.pow(intensityFactor, 2) * 100 / 60;
  return Math.round(tss);
}
function calculateTrainingLoad(runs, thresholdPace) {
  const sortedRuns = [...runs].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  let acuteLoad = 0;
  let chronicLoad = 0;
  const acuteDecay = Math.exp(-1 / 7);
  const chronicDecay = Math.exp(-1 / 28);
  const loads = sortedRuns.map((run) => {
    const tss = calculateTSS2(run, thresholdPace);
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
  const current = loads[loads.length - 1] || {
    acuteLoad: 0,
    chronicLoad: 0,
    ratio: 1
  };
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
  if (trainingLoad.ratio < 0.8)
    risk += 20;
  else if (trainingLoad.ratio > 1.5)
    risk += 40;
  else if (trainingLoad.ratio > 1.3)
    risk += 25;
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
    const weekStart = format(startOfWeek(run.date), "yyyy-MM-dd");
    if (!weeks.has(weekStart)) {
      weeks.set(weekStart, []);
    }
    weeks.get(weekStart).push(run);
  });
  const weeklyDistances = Array.from(weeks.values()).map(
    (weekRuns) => weekRuns.reduce((sum, run) => sum + run.distance, 0)
  );
  const weeklyRunCounts = Array.from(weeks.values()).map(
    (weekRuns) => weekRuns.length
  );
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
  const injuryRisk = calculateInjuryRisk(
    trainingLoad,
    weeklyIncrease,
    recoveryScore
  );
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
    const fromSnapshot = this.snapshots.find(
      (s) => s.operation === fromOperation
    );
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
      recommendations.push(
        `Consider optimizing: ${slowOps[0].operation} (avg: ${slowOps[0].avgTime.toFixed(2)}ms)`
      );
    }
    if (memoryUsage.heapUsed > 80) {
      recommendations.push(
        "High memory usage detected - consider clearing caches or reducing batch sizes"
      );
    }
    const cacheStats = CacheManager.getCacheStats();
    const totalCacheSize = Object.values(cacheStats).reduce(
      (sum, size) => sum + size,
      0
    );
    if (totalCacheSize < 10) {
      recommendations.push(
        "Low cache utilization - consider increasing cache sizes for better performance"
      );
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
import { differenceInWeeks as differenceInWeeks2 } from "date-fns";
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
    const enhancedBlocks = basePlan.blocks.map(
      (block) => this.enhanceBlock(block)
    );
    return {
      ...basePlan,
      blocks: enhancedBlocks,
      summary: {
        ...basePlan.summary,
        phases: basePlan.summary.phases.map((phase) => ({
          ...phase,
          intensityDistribution: this.getPhaseIntensityDistribution(
            phase.phase
          )
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
    const availableTemplates = Object.keys(WORKOUT_TEMPLATES).filter(
      (key) => WORKOUT_TEMPLATES[key].type === type
    );
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
      ...{
        metadata: {
          ...danielsCompliantPlan.metadata,
          danielsVDOT: currentVDOT,
          trainingPaces: this.getVDOTPaces(currentVDOT),
          intensityDistribution: intensityReport.overall,
          intensityReport,
          methodology: "daniels",
          complianceScore: intensityReport.compliance
        }
      }
    };
  }
  /**
   * Daniels-specific workout customization with VDOT integration
   */
  customizeWorkout(template, phase, weekNumber, vdot) {
    const baseCustomization = super.customizeWorkout(
      template,
      phase,
      weekNumber
    );
    const currentVDOT = vdot || this.estimateVDOTFromTemplate(template);
    const trainingPaces = this.getVDOTPaces(currentVDOT);
    const danielsSegments = baseCustomization.segments.map(
      (segment) => this.customizeSegmentWithVDOTPaces(
        segment,
        template.type,
        phase,
        trainingPaces
      )
    );
    return {
      ...baseCustomization,
      segments: danielsSegments,
      adaptationTarget: this.getDanielsAdaptationTarget(template.type, phase),
      ...{
        metadata: {
          ...baseCustomization.metadata,
          vdot: currentVDOT,
          trainingPaces,
          methodology: "daniels"
        }
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
      steady: "marathon",
      tempo: "threshold",
      threshold: "threshold",
      vo2max: "interval",
      speed: "repetition",
      hill_repeats: "repetition",
      fartlek: "threshold",
      progression: "easy",
      long_run: "easy",
      race_pace: "marathon",
      time_trial: "threshold",
      cross_training: "easy",
      strength: "easy"
    };
    const paceZone = paceMapping[workoutType] || "easy";
    const targetPace = trainingPaces[paceZone];
    const paceRange = {
      min: targetPace * 0.98,
      // 2% faster
      max: targetPace * 1.02
      // 2% slower
    };
    const customizedSegment = {
      ...segment,
      intensity: this.calculateVDOTBasedIntensity(
        segment.intensity,
        paceZone,
        phase
      ),
      paceTarget: paceRange,
      description: this.enhanceSegmentDescriptionWithPace(
        segment.description,
        workoutType,
        paceRange,
        paceZone
      )
    };
    return this.applyPhaseSpecificAdjustments(
      customizedSegment,
      phase,
      workoutType
    );
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
    const target = formatPace((pace.min + pace.max) / 2);
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
    const availableTemplates = Object.keys(WORKOUT_TEMPLATES).filter(
      (key) => WORKOUT_TEMPLATES[key].type === type
    );
    if (availableTemplates.length === 0) {
      throw new Error(`No templates available for workout type: ${type}`);
    }
    return this.selectDanielsSpecificWorkout(
      type,
      phase,
      weekInPhase,
      availableTemplates
    );
  }
  /**
   * Daniels-specific workout selection algorithm
   * Prioritizes tempo runs, intervals, and repetitions based on phase
   */
  selectDanielsSpecificWorkout(type, phase, weekInPhase, availableTemplates) {
    switch (phase) {
      case "base":
        return this.selectBasePhaseWorkout(
          type,
          weekInPhase,
          availableTemplates
        );
      case "build":
        return this.selectBuildPhaseWorkout(
          type,
          weekInPhase,
          availableTemplates
        );
      case "peak":
        return this.selectPeakPhaseWorkout(
          type,
          weekInPhase,
          availableTemplates
        );
      case "taper":
        return this.selectTaperPhaseWorkout(
          type,
          weekInPhase,
          availableTemplates
        );
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
    const vdot = calculateVDOTCached(runs);
    const paces = this.getVDOTPaces(vdot);
    return { vdot, paces };
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
      description: this.enhanceSegmentWithVDOTInfo(
        segment.description,
        segment.zone.name,
        danielsPaces
      )
    }));
    return {
      ...plannedWorkout,
      workout: {
        ...workout,
        segments: enhancedSegments,
        ...{
          vdotUsed: vdot,
          paceRecommendations: this.generatePaceRecommendations(danielsPaces)
        }
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
          min: paces.easy * 1.1,
          max: paces.easy * 1.25,
          target: paces.easy * 1.15
        };
      case "easy":
        return {
          min: paces.easy * 0.98,
          max: paces.easy * 1.02,
          target: paces.easy
        };
      case "steady":
        return {
          min: paces.easy * 0.98,
          max: paces.marathon * 1.02,
          target: (paces.easy + paces.marathon) / 2
        };
      case "tempo":
        return {
          min: paces.marathon,
          max: paces.marathon * 1.05,
          target: paces.marathon * 1.02
        };
      case "threshold":
        return {
          min: paces.threshold * 0.98,
          max: paces.threshold * 1.02,
          target: paces.threshold
        };
      case "vo2 max":
      case "vo2max":
        return {
          min: paces.interval * 0.97,
          max: paces.interval * 1.03,
          target: paces.interval
        };
      case "neuromuscular":
        return {
          min: paces.repetition * 0.95,
          max: paces.repetition * 1.05,
          target: paces.repetition
        };
      default:
        return {
          min: paces.marathon * 0.98,
          max: paces.marathon * 1.02,
          target: paces.marathon
        };
    }
  }
  /**
   * Calculate VDOT-based heart rate ranges
   */
  calculateVDOTHeartRates(zoneName, vdot) {
    const estimatedMaxHR = 220 - (vdot < 45 ? 35 : vdot < 55 ? 30 : 25);
    switch (zoneName) {
      case "Recovery":
        return {
          min: Math.round(estimatedMaxHR * 0.5),
          max: Math.round(estimatedMaxHR * 0.6)
        };
      case "Easy":
        return {
          min: Math.round(estimatedMaxHR * 0.65),
          max: Math.round(estimatedMaxHR * 0.75)
        };
      case "Steady":
        return {
          min: Math.round(estimatedMaxHR * 0.75),
          max: Math.round(estimatedMaxHR * 0.82)
        };
      case "Tempo":
        return {
          min: Math.round(estimatedMaxHR * 0.82),
          max: Math.round(estimatedMaxHR * 0.87)
        };
      case "Threshold":
        return {
          min: Math.round(estimatedMaxHR * 0.87),
          max: Math.round(estimatedMaxHR * 0.92)
        };
      case "VO2max":
        return {
          min: Math.round(estimatedMaxHR * 0.92),
          max: Math.round(estimatedMaxHR * 0.97)
        };
      case "Neuromuscular":
        return {
          min: Math.round(estimatedMaxHR * 0.95),
          max: Math.round(estimatedMaxHR * 1)
        };
      default:
        return {
          min: Math.round(estimatedMaxHR * 0.7),
          max: Math.round(estimatedMaxHR * 0.8)
        };
    }
  }
  /**
   * Enhance segment description with VDOT-specific pace information
   */
  enhanceSegmentWithVDOTInfo(description, zoneName, paces) {
    const pace = this.getDanielsSpecificPace(zoneName, paces);
    const paceStr = this.formatPaceRange(pace);
    const zoneDescriptions = {
      easy: `E pace (${paceStr}) - Build aerobic base`,
      marathon: `M pace (${paceStr}) - Race pace endurance`,
      threshold: `T pace (${paceStr}) - Lactate threshold`,
      interval: `I pace (${paceStr}) - VO2max development`,
      repetition: `R pace (${paceStr}) - Speed and power`
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
      easy: `E: ${this.formatPaceRange({ min: paces.easy * 0.98, max: paces.easy * 1.02, target: paces.easy })} - Conversational pace, aerobic base`,
      marathon: `M: ${this.formatPaceRange({ min: paces.marathon * 0.98, max: paces.marathon * 1.02, target: paces.marathon })} - Goal marathon pace`,
      threshold: `T: ${this.formatPaceRange({ min: paces.threshold * 0.98, max: paces.threshold * 1.02, target: paces.threshold })} - Comfortably hard, 1-hour effort`,
      interval: `I: ${this.formatPaceRange({ min: paces.interval * 0.97, max: paces.interval * 1.03, target: paces.interval })} - Hard intervals, VO2max`,
      repetition: `R: ${this.formatPaceRange({ min: paces.repetition * 0.95, max: paces.repetition * 1.05, target: paces.repetition })} - Short, fast repeats`
    };
  }
  /**
   * Estimate VDOT from training plan characteristics
   */
  estimateVDOTFromPlan(plan) {
    const weeklyDistance = plan.summary.totalDistance / plan.summary.totalWeeks;
    const workoutIntensity = plan.summary.phases.reduce(
      (avg, phase) => avg + phase.intensityDistribution.hard,
      0
    ) / plan.summary.phases.length;
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
    if (totalMinutes === 0)
      return { easy: 80, moderate: 15, hard: 5, veryHard: 0 };
    return {
      easy: Math.round(easyMinutes / totalMinutes * 100),
      moderate: Math.round(moderateMinutes / totalMinutes * 100),
      hard: Math.round(hardMinutes / totalMinutes * 100),
      veryHard: 0
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
      const totalDuration = workout.workout.segments.reduce(
        (sum, seg) => sum + seg.duration,
        0
      );
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
      return this.autoAdjustIntensityDistribution(
        phaseSpecificPlan,
        validatedPlan.violations
      );
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
        workouts: this.adjustWorkoutsToTargetDistribution(
          microcycle.workouts,
          targetDistribution,
          block.phase
        )
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
    return targets[phase] || {
      easy: 80,
      moderate: 5,
      hard: 15,
      veryHard: 0
    };
  }
  /**
   * Adjust workouts to meet target intensity distribution
   */
  adjustWorkoutsToTargetDistribution(workouts, target, phase) {
    const currentDistribution = this.calculateWorkoutGroupDistribution(workouts);
    const adjustmentNeeded = this.calculateDistributionAdjustment(
      currentDistribution,
      target
    );
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
    if (totalMinutes === 0)
      return { easy: 80, moderate: 5, hard: 15, veryHard: 0 };
    return {
      easy: Math.round(easyMinutes / totalMinutes * 100),
      moderate: Math.round(moderateMinutes / totalMinutes * 100),
      hard: Math.round(hardMinutes / totalMinutes * 100),
      veryHard: 0
    };
  }
  /**
   * Calculate what adjustments are needed to meet target distribution
   */
  calculateDistributionAdjustment(current, target) {
    return {
      easy: target.easy - current.easy,
      moderate: target.moderate - current.moderate,
      hard: target.hard - current.hard,
      veryHard: target.veryHard - current.veryHard
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
      const eligibleWorkouts = adjustedWorkouts.filter(
        (w) => this.canAddQuality(w)
      );
      const workoutsToModify = Math.min(2, eligibleWorkouts.length);
      for (let i = 0; i < workoutsToModify; i++) {
        const workoutIndex = adjustedWorkouts.indexOf(eligibleWorkouts[i]);
        adjustedWorkouts[workoutIndex] = this.addQualityToWorkout(
          eligibleWorkouts[i]
        );
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
    const totalDuration = workout.workout.segments.reduce(
      (sum, seg) => sum + seg.duration,
      0
    );
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
    const overallTarget = {
      ...INTENSITY_MODELS.polarized,
      veryHard: 0
      // Add missing veryHard property
    };
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
      const severityOrder = {
        low: 1,
        medium: 2,
        high: 3,
        critical: 4
      };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
    sortedViolations.forEach((violation) => {
      adjustedPlan = this.fixIntensityViolation(adjustedPlan, violation);
    });
    const revalidation = this.validateIntensityDistribution(adjustedPlan);
    if (!revalidation.isValid && revalidation.violations.length < violations.length) {
      return this.autoAdjustIntensityDistribution(
        adjustedPlan,
        revalidation.violations
      );
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
          description: this.updateSegmentDescription(
            segment.description,
            "easier"
          )
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
          description: this.updateSegmentDescription(
            segment.description,
            "reduced"
          )
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
      target: {
        ...INTENSITY_MODELS.polarized,
        veryHard: 0
      },
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
      recommendations.push(
        "Increase easy running volume to build aerobic base"
      );
      recommendations.push("Convert some moderate workouts to easy runs");
    }
    if (validation.overall.hard > 20) {
      recommendations.push(
        "Reduce high-intensity work to prevent overtraining"
      );
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
      recommendations.push(
        "Intensity distribution looks good - maintain current balance"
      );
    }
    return recommendations;
  }
  /**
   * Calculate compliance score (0-100)
   */
  calculateComplianceScore(validation) {
    const target = {
      ...INTENSITY_MODELS.polarized,
      veryHard: 0
    };
    const actual = validation.overall;
    const easyDeviation = Math.abs(actual.easy - target.easy);
    const hardDeviation = Math.abs(actual.hard - target.hard);
    const easyScore = Math.max(0, 100 - easyDeviation * 2);
    const hardScore = Math.max(0, 100 - hardDeviation * 3);
    const violationPenalty = validation.violations.reduce(
      (penalty, violation) => {
        const severityPenalty = {
          low: 2,
          medium: 5,
          high: 10,
          critical: 20
        };
        return penalty + severityPenalty[violation.severity];
      },
      0
    );
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
      recovery: "Easy jog, focus on form and relaxation",
      easy: "Conversational pace, build aerobic base",
      steady: "Steady aerobic effort, controlled breathing",
      tempo: "Comfortably hard, controlled tempo effort",
      threshold: "Threshold pace, sustainable hard effort",
      vo2max: "VO2max intensity, hard but controlled",
      speed: "Neuromuscular power, focus on form",
      hill_repeats: "Hill power, strong uphill drive",
      fartlek: "Speed play, varied intensity surges",
      progression: "Progressive buildup, finish strong",
      long_run: "Aerobic base building, steady effort",
      race_pace: "Goal race pace, rhythm practice",
      time_trial: "All-out effort, race simulation",
      cross_training: "Non-impact aerobic exercise",
      strength: "Strength training for runners"
    };
    const enhancement = danielsTerms[workoutType];
    return enhancement ? `${enhancement} - ${baseDescription}` : baseDescription;
  }
  /**
   * Get Daniels-specific adaptation targets
   */
  getDanielsAdaptationTarget(workoutType, phase) {
    const adaptationTargets = {
      easy: {
        base: "Build aerobic base, improve fat oxidation",
        build: "Maintain aerobic fitness, aid recovery",
        peak: "Active recovery between hard sessions",
        taper: "Maintain fitness, promote recovery",
        recovery: "Full recovery, blood flow maintenance"
      },
      tempo: {
        base: "Develop aerobic power, lactate clearance",
        build: "Improve tempo pace, aerobic strength",
        peak: "Race pace practice, lactate management",
        taper: "Maintain tempo fitness, race prep",
        recovery: "Light tempo work for fitness maintenance"
      },
      threshold: {
        base: "Develop lactate threshold, aerobic power",
        build: "Improve threshold pace, lactate tolerance",
        peak: "Race-specific threshold work",
        taper: "Maintain threshold fitness",
        recovery: "Easy threshold maintenance"
      },
      vo2max: {
        base: "Develop VO2max, running economy",
        build: "Improve VO2max, neuromuscular power",
        peak: "Peak VO2max fitness, race sharpening",
        taper: "Maintain VO2max, race readiness",
        recovery: "Light VO2max maintenance"
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
    if (workouts.length === 0)
      return { easy: 100, moderate: 0, hard: 0, veryHard: 0 };
    const totalDuration = workouts.reduce(
      (sum, w) => sum + (w.targetMetrics.duration || 60),
      0
    );
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
      hard: Math.round(hardDuration / totalDuration * 100),
      veryHard: 0
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
    const totalDuration = workouts.reduce(
      (sum, w) => sum + (w.targetMetrics.duration || 60),
      0
    );
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
        description: this.convertToEffortDescription(
          segment.description,
          segment.intensity
        )
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
      progressedDistance = Math.max(
        baseDistance,
        progressedDistance - progressionRate
      );
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
      violations.push(
        `Easy running: ${distribution.easy}% (target: ${this.LYDIARD_EASY_TARGET}%+)`
      );
      recommendations.push(
        `Increase easy running by ${this.LYDIARD_EASY_TARGET - distribution.easy}%`
      );
      recommendations.push(
        "Convert some tempo/threshold workouts to easy aerobic runs"
      );
      recommendations.push("Focus on time on feet rather than pace");
    }
    if (distribution.hard > this.MAX_HARD_PERCENTAGE) {
      violations.push(
        `Hard running: ${distribution.hard}% (maximum: ${this.MAX_HARD_PERCENTAGE}%)`
      );
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
      type: "hill_repeats",
      primaryZone: hillProfile.primaryZone,
      segments,
      adaptationTarget: hillProfile.adaptationTarget,
      estimatedTSS: this.calculateHillTSS(segments),
      recoveryTime: this.calculateHillRecovery(phase, segments.length),
      ...{
        id: `lydiard-hill-${phase}-week${weekInPhase}`,
        name: `Lydiard ${hillProfile.name}`,
        metadata: {
          methodology: "lydiard",
          hillType: hillProfile.type,
          phase,
          weekInPhase,
          lydiardPrinciples: hillProfile.principles
        }
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
        description: `Hill repeat ${i}/${profile.repeats} - ${profile.effort} on ${profile.gradient} gradient`
      });
      if (i < profile.repeats) {
        segments.push({
          duration: profile.recovery / 60,
          // Convert seconds to minutes
          intensity: 50,
          zone: TRAINING_ZONES.RECOVERY,
          description: `Recovery jog/walk down hill - full recovery before next effort`
        });
      }
    }
    const cooldownDuration = Math.max(10, totalDuration * 0.2);
    segments.push({
      duration: cooldownDuration,
      intensity: 60,
      zone: TRAINING_ZONES.RECOVERY,
      description: "Cool-down jog on flat terrain - easy pace to finish"
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
      base: 24,
      // Hills in base are moderate stress
      build: 36,
      // Higher intensity needs more recovery
      peak: 48,
      // Very high intensity
      taper: 18,
      // Light maintenance work
      recovery: 12
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
    templates["LYDIARD_HILL_RECOVERY"] = this.generateHillWorkout(
      "recovery",
      1
    );
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
      aerobic_base: "base",
      hill_phase: "base",
      // Hills are part of extended base in Lydiard
      anaerobic: "build",
      coordination: "peak",
      taper: "taper",
      recovery: "recovery"
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
    const endDate = config.endDate || config.targetDate;
    const totalWeeks = endDate ? Math.ceil(
      (endDate.getTime() - config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1e3)
    ) : 12;
    const durations = this.calculatePhaseDurations(
      totalWeeks,
      "half-marathon"
      // Use default race type
    );
    const blocks = [];
    let weekNumber = 1;
    blocks.push({
      id: "aerobic-base-building",
      phase: "base",
      startDate: new Date(
        config.startDate.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1e3
      ),
      endDate: new Date(
        config.startDate.getTime() + (weekNumber + durations.aerobicBase - 2) * 7 * 24 * 60 * 60 * 1e3
      ),
      weeks: durations.aerobicBase,
      focusAreas: [
        "Aerobic capacity",
        "Volume building",
        "Easy running",
        "Long runs"
      ],
      microcycles: this.createMicrocycles(
        "base",
        durations.aerobicBase,
        weekNumber
      )
    });
    weekNumber += durations.aerobicBase;
    blocks.push({
      id: "hill-strength-development",
      phase: "base",
      startDate: new Date(
        config.startDate.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1e3
      ),
      endDate: new Date(
        config.startDate.getTime() + (weekNumber + durations.hillPhase - 2) * 7 * 24 * 60 * 60 * 1e3
      ),
      weeks: durations.hillPhase,
      focusAreas: [
        "Hill strength",
        "Running economy",
        "Power development",
        "Form improvement"
      ],
      microcycles: this.createMicrocycles(
        "base",
        durations.hillPhase,
        weekNumber
      )
    });
    weekNumber += durations.hillPhase;
    blocks.push({
      id: "anaerobic-development",
      phase: "build",
      startDate: new Date(
        config.startDate.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1e3
      ),
      endDate: new Date(
        config.startDate.getTime() + (weekNumber + durations.anaerobic - 2) * 7 * 24 * 60 * 60 * 1e3
      ),
      weeks: durations.anaerobic,
      focusAreas: [
        "Anaerobic power",
        "Lactate tolerance",
        "Tempo running",
        "Time trials"
      ],
      microcycles: this.createMicrocycles(
        "build",
        durations.anaerobic,
        weekNumber
      )
    });
    weekNumber += durations.anaerobic;
    blocks.push({
      id: "coordination-sharpening",
      phase: "peak",
      startDate: new Date(
        config.startDate.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1e3
      ),
      endDate: new Date(
        config.startDate.getTime() + (weekNumber + durations.coordination - 2) * 7 * 24 * 60 * 60 * 1e3
      ),
      weeks: durations.coordination,
      focusAreas: [
        "Speed coordination",
        "Race pace",
        "Neuromuscular power",
        "Final sharpening"
      ],
      microcycles: this.createMicrocycles(
        "peak",
        durations.coordination,
        weekNumber
      )
    });
    weekNumber += durations.coordination;
    blocks.push({
      id: "race-taper",
      phase: "taper",
      startDate: new Date(
        config.startDate.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1e3
      ),
      endDate: new Date(
        config.startDate.getTime() + (weekNumber + durations.taper - 2) * 7 * 24 * 60 * 60 * 1e3
      ),
      weeks: durations.taper,
      focusAreas: [
        "Recovery",
        "Race preparation",
        "Maintain fitness",
        "Mental preparation"
      ],
      microcycles: this.createMicrocycles("taper", durations.taper, weekNumber)
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
        workoutTypes: this.getLydiardWeeklyWorkouts(
          phase,
          week,
          isRecoveryWeek
        ),
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
          return [
            "easy",
            "steady",
            "easy",
            "steady",
            "long_run",
            "easy",
            "recovery"
          ];
        }
        return [
          "easy",
          "hill_repeats",
          "easy",
          "steady",
          "long_run",
          "hill_repeats",
          "recovery"
        ];
      case "build":
        return [
          "easy",
          "tempo",
          "easy",
          "threshold",
          "long_run",
          "time_trial",
          "recovery"
        ];
      case "peak":
        return [
          "easy",
          "speed",
          "easy",
          "race_pace",
          "tempo",
          "vo2max",
          "recovery"
        ];
      case "taper":
        return [
          "easy",
          "race_pace",
          "easy",
          "tempo",
          "easy",
          "race_pace",
          "recovery"
        ];
      default:
        return [
          "recovery",
          "easy",
          "recovery",
          "easy",
          "recovery",
          "easy",
          "recovery"
        ];
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
      base: ["Aerobic development", "Running form", "Consistency"],
      build: ["Lactate threshold", "Tempo endurance", "Mental toughness"],
      peak: ["Race pace", "Speed coordination", "Race tactics"],
      taper: ["Recovery", "Race visualization", "Maintain sharpness"],
      recovery: ["Complete rest", "Regeneration", "Mental refresh"]
    };
    return baselineFocus[phase] || ["General fitness"];
  }
  /**
   * Validate phase transition readiness
   */
  validatePhaseTransition(currentPhase, completedWorkouts) {
    const requiredCompletions = {
      base: {
        minWeeks: 8,
        minLongRuns: 6,
        minWeeklyVolume: 40,
        // km
        requiredWorkoutTypes: ["long_run", "easy", "steady"]
      },
      build: {
        minWeeks: 3,
        minTempoRuns: 6,
        minThresholdWork: 4,
        requiredWorkoutTypes: ["tempo", "threshold", "time_trial"]
      },
      peak: {
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
      base: "build",
      build: "peak",
      peak: "taper",
      taper: "recovery",
      recovery: "base"
    };
    return progression[currentPhase] || "base";
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
    const totalWeeks = basePlan.summary?.totalWeeks || 12;
    const advancedConfig = basePlan.config;
    const targetRace = advancedConfig?.targetRaces?.[0] || null;
    if (targetRace) {
      const phaseDurations = this.periodizationSystem.calculatePhaseDurations(
        totalWeeks,
        targetRace.distance || "MARATHON"
      );
      const lydiardBlocks2 = this.periodizationSystem.createLydiardBlocks(
        basePlan.config
      );
      enhancedPlan.blocks = lydiardBlocks2;
    }
    const aerobicCompliantWorkouts = this.aerobicBaseCalculator.enforceAerobicBase(enhancedPlan.workouts);
    const lydiardBlocks = enhancedPlan.blocks.map(
      (block) => this.applyLydiardPhaseEmphasis(block)
    );
    const timeBasedWorkouts = aerobicCompliantWorkouts.map(
      (plannedWorkout) => ({
        ...plannedWorkout,
        workout: this.aerobicBaseCalculator.convertToTimeBased(
          plannedWorkout.workout
        )
      })
    );
    const recoveryEmphasizedWorkouts = timeBasedWorkouts.map(
      (plannedWorkout) => {
        const weekNumber = Math.floor(
          (plannedWorkout.date.getTime() - timeBasedWorkouts[0].date.getTime()) / (7 * 24 * 60 * 60 * 1e3)
        ) + 1;
        const isRecoveryWeek = weekNumber % 4 === 0;
        const phase = plannedWorkout.phase || "base";
        return {
          ...plannedWorkout,
          workout: this.applyRecoveryEmphasis(
            plannedWorkout.workout,
            phase,
            isRecoveryWeek
          )
        };
      }
    );
    const aerobicBaseReport = this.aerobicBaseCalculator.validateAerobicBase(
      recoveryEmphasizedWorkouts
    );
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
      ...{
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
      }
    };
    this.applyEffortBasedZones(lydiardPlan);
    return lydiardPlan;
  }
  /**
   * Lydiard-specific workout customization emphasizing aerobic development
   */
  customizeWorkout(template, phase, weekNumber) {
    const baseCustomization = super.customizeWorkout(
      template,
      phase,
      weekNumber
    );
    const lydiardSegments = baseCustomization.segments.map((segment) => ({
      ...segment,
      intensity: this.adjustIntensityForLydiard(
        segment.intensity,
        template.type,
        phase,
        weekNumber
      ),
      description: this.enhanceLydiardDescription(
        segment.description,
        template.type,
        phase
      )
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
    const availableTemplates = Object.keys(WORKOUT_TEMPLATES).filter(
      (key) => WORKOUT_TEMPLATES[key].type === type
    );
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
          const easierWorkout = this.convertToAerobicWorkout(
            plannedWorkout.workout
          );
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
        return { easy: 95, moderate: 4, hard: 1, veryHard: 0 };
      // Extreme aerobic emphasis
      case "build":
        return { easy: 90, moderate: 8, hard: 2, veryHard: 0 };
      // Still very aerobic
      case "peak":
        return { easy: 85, moderate: 10, hard: 5, veryHard: 0 };
      // Some intensity added
      case "taper":
        return { easy: 92, moderate: 5, hard: 3, veryHard: 0 };
      // Back to easy emphasis
      case "recovery":
        return { easy: 98, moderate: 2, hard: 0, veryHard: 0 };
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
        return [
          "Aerobic base development",
          "Mitochondrial adaptation",
          "Capillarization",
          "Hill strength"
        ];
      case "build":
        return [
          "Aerobic power",
          "Lactate clearance",
          "Time trials",
          "Coordination"
        ];
      case "peak":
        return [
          "Race sharpening",
          "Speed development",
          "Race tactics",
          "Final conditioning"
        ];
      case "taper":
        return [
          "Maintain fitness",
          "Recovery",
          "Race preparation",
          "Mental readiness"
        ];
      case "recovery":
        return [
          "Full recovery",
          "Base maintenance",
          "Form work",
          "Preparation for next cycle"
        ];
      default:
        return ["General aerobic development"];
    }
  }
  /**
   * Enhance descriptions with Lydiard terminology
   */
  enhanceLydiardDescription(baseDescription, workoutType, phase) {
    const lydiardTerms = {
      easy: {
        base: "Aerobic base building - foundation mileage",
        build: "Aerobic maintenance - recovery between harder efforts",
        peak: "Active recovery - maintain aerobic base",
        taper: "Easy aerobic - maintain fitness with minimal stress",
        recovery: "Gentle jogging - promote recovery"
      },
      steady: {
        base: "Steady state aerobic - key Lydiard development pace",
        build: "Sustained aerobic effort - lactate clearance",
        peak: "Aerobic power - controlled sustained effort",
        taper: "Steady maintenance - keep aerobic systems active",
        recovery: "Easy steady - very light aerobic work"
      },
      hill_repeats: {
        base: "Hill strength - build power and economy",
        build: "Hill power - anaerobic strength development",
        peak: "Speed hill work - final power development",
        taper: "Light hill work - maintain strength",
        recovery: "Easy hill walking - gentle strength work"
      },
      tempo: {
        base: "Aerobic tempo - controlled aerobic effort",
        build: "Tempo development - lactate threshold preparation",
        peak: "Race pace tempo - specific pace practice",
        taper: "Light tempo - maintain pace feel",
        recovery: "Easy tempo - very light sustained work"
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
      easy: {
        base: "Aerobic enzyme development, mitochondrial biogenesis, capillary density",
        build: "Maintain aerobic base while building anaerobic capacity",
        peak: "Recovery facilitation, maintain aerobic fitness",
        taper: "Fitness maintenance with minimal fatigue",
        recovery: "Complete physiological restoration"
      },
      steady: {
        base: "Aerobic power development, fat oxidation, cardiac output",
        build: "Lactate clearance, aerobic-anaerobic transition",
        peak: "Race pace conditioning, metabolic efficiency",
        taper: "Maintain aerobic power with reduced volume",
        recovery: "Light aerobic maintenance"
      },
      hill_repeats: {
        base: "Leg strength, running economy, biomechanical efficiency",
        build: "Anaerobic power, lactate tolerance, neuromuscular coordination",
        peak: "Maximum power output, race-specific strength",
        taper: "Maintain strength with reduced stress",
        recovery: "Gentle strength maintenance"
      },
      long_run: {
        base: "Aerobic base, glycogen storage, mental resilience, fat adaptation",
        build: "Sustained aerobic power, pace judgment, endurance",
        peak: "Race-specific endurance, pacing practice",
        taper: "Maintain endurance base with reduced distance",
        recovery: "Light endurance maintenance"
      }
    };
    return adaptationMatrix[workoutType]?.[phase] || `${workoutType} adaptation for ${phase} phase in Lydiard system`;
  }
  /**
   * Generate Lydiard-specific hill training workouts
   */
  generateLydiardHillTraining(phase, weekInPhase, duration = 45) {
    return this.lydiardHillGenerator.generateHillWorkout(
      phase,
      weekInPhase,
      duration
    );
  }
  /**
   * Calculate long run progression for entire plan
   */
  calculateLongRunProgressionForPlan(plan) {
    const baseBlocks = plan.blocks.filter((block) => block.phase === "base");
    const totalBaseWeeks = baseBlocks.reduce(
      (sum, block) => sum + block.weeks,
      0
    );
    const currentLongRuns = plan.workouts.filter(
      (w) => w.workout.type === "long_run"
    );
    const currentLongestDistance = currentLongRuns.length > 0 ? Math.max(
      ...currentLongRuns.map((w) => w.targetMetrics.distance || 10)
    ) : 10;
    const progression = [];
    let weekCounter = 0;
    for (const block of plan.blocks) {
      for (let week = 1; week <= block.weeks; week++) {
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
    const hillWorkout = this.lydiardHillGenerator.generateHillWorkout(
      phase,
      weekInPhase,
      duration
    );
    const customizedSegments = hillWorkout.segments.map((segment) => ({
      ...segment,
      description: this.enhanceLydiardDescription(
        segment.description,
        "hill_repeats",
        phase
      )
    }));
    return {
      ...hillWorkout,
      segments: customizedSegments,
      ...{
        metadata: {
          ...hillWorkout.metadata,
          lydiardCustomization: true,
          guidance: this.lydiardHillGenerator.getHillProgressionGuidance(phase)
        }
      }
    };
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
var PfitsingerPhilosophy = class extends BaseTrainingPhilosophy {
  constructor() {
    super("pfitzinger", "Pete Pfitzinger");
  }
  /**
   * Convert RaceDistance to kilometers
   */
  getRaceDistanceKm(distance) {
    const distances = {
      "5k": 5,
      "10k": 10,
      "15k": 15,
      "half-marathon": 21.1,
      marathon: 42.2,
      "50k": 50,
      "50-mile": 80.5,
      "100k": 100,
      "100-mile": 161,
      ultra: 50
    };
    return distances[distance];
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
    const planWithRaces = this.integrateRacesAndMediumLongs({
      ...planWithProgression,
      blocks: pfitzingerBlocks
    });
    return {
      ...planWithRaces,
      ...{
        metadata: {
          ...planWithRaces.metadata,
          methodology: "pfitzinger",
          lactateThresholdPace: ltPace,
          pfitzingerPaces,
          thresholdVolumeProgression: this.calculateLegacyThresholdVolumeProgression(planWithRaces),
          ltBasedZones: this.generateLTBasedZones(ltPace)
        }
      }
    };
  }
  /**
   * Pfitzinger-specific workout customization with threshold focus
   */
  customizeWorkout(template, phase, weekNumber) {
    const baseCustomization = super.customizeWorkout(
      template,
      phase,
      weekNumber
    );
    const pfitzingerSegments = baseCustomization.segments.map((segment) => ({
      ...segment,
      intensity: this.adjustIntensityForPfitzinger(
        segment.intensity,
        template.type,
        phase,
        weekNumber
      ),
      description: this.enhancePfitzingerDescription(
        segment.description,
        template.type,
        phase
      )
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
      adaptationTarget: this.getPfitzingerAdaptationTarget(
        template.type,
        phase
      ),
      estimatedTSS: this.adjustTSSForPfitzinger(
        baseCustomization.estimatedTSS,
        template.type
      )
    };
  }
  /**
   * Pfitzinger workout selection prioritizing threshold and progression work
   */
  selectWorkout(type, phase, weekInPhase) {
    const availableTemplates = Object.keys(WORKOUT_TEMPLATES).filter(
      (key) => WORKOUT_TEMPLATES[key].type === type
    );
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
    const enhancedMicrocycles = block.microcycles.map(
      (microcycle, weekIndex) => {
        const modifiedWorkouts = microcycle.workouts.map((plannedWorkout) => {
          if (this.shouldBeMediumLong(plannedWorkout, weekIndex, block.phase)) {
            return this.convertToMediumLong(
              plannedWorkout,
              block.phase,
              weekIndex + 1
            );
          }
          if (plannedWorkout.workout.type === "long_run" && this.shouldAddQuality(block.phase, weekIndex)) {
            return this.addQualityToLongRun(plannedWorkout);
          }
          return plannedWorkout;
        });
        return {
          ...microcycle,
          workouts: modifiedWorkouts,
          pattern: this.getPfitzingerWeeklyPattern(block.phase, weekIndex) || "Standard weekly pattern"
        };
      }
    );
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
      const weeksToGoal = differenceInWeeks2(
        plan.config.targetDate || plan.config.endDate || /* @__PURE__ */ new Date(),
        workout.date
      );
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
    const scaledPattern = this.scaleMediumLongDifficulty(
      pattern,
      weekNumber,
      phase
    );
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
    scaledPattern.totalDuration = Math.round(
      pattern.totalDuration * durationScale
    );
    scaledPattern.segments = pattern.segments.map((segment) => ({
      ...segment,
      duration: Math.round(segment.duration * durationScale),
      intensity: Math.min(95, Math.round(segment.intensity * intensityScale))
    }));
    scaledPattern.estimatedTSS = Math.round(
      pattern.estimatedTSS * durationScale * intensityScale
    );
    scaledPattern.recoveryTime = Math.round(
      pattern.recoveryTime * durationScale
    );
    return scaledPattern;
  }
  /**
   * Convert easy run to Pfitzinger-style medium-long run with embedded tempo segments
   */
  convertToMediumLong(workout, phase = "build", weekNumber = 1) {
    const mediumLongWorkout = this.generateMediumLongRun(
      workout,
      phase,
      weekNumber
    );
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
    const totalDuration = baseWorkout.segments.reduce(
      (sum, seg) => sum + seg.duration,
      0
    );
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
    const volumeProgression = this.calculateThresholdVolumeProgression(
      phase,
      weekIndex
    );
    const raceIntegration = this.getRaceSpecificIntegration(phase, weekIndex);
    return this.applyPfitzingerWeeklySpacing(
      baseStructure,
      volumeProgression,
      raceIntegration,
      weekIndex
    );
  }
  /**
   * Get Pfitzinger base weekly structure by training phase
   * Following authentic Pfitzinger day-of-week patterns
   */
  getPfitzingerBaseStructure(phase) {
    const structures = {
      base: {
        pattern: "Easy-GA-Easy-LT-Recovery-Long-Recovery",
        dayStructure: {
          monday: { type: "easy" },
          tuesday: { type: "general_aerobic" },
          wednesday: { type: "easy" },
          thursday: { type: "lactate_threshold", thresholdMinutes: 20 },
          friday: { type: "recovery" },
          saturday: { type: "long_run" },
          sunday: { type: "recovery" }
        },
        baseVolume: 40,
        qualityDays: 2,
        recoveryDays: 2,
        mediumLongRuns: 1
      },
      build: {
        pattern: "Easy-LT-MLR-Tempo-Recovery-LongQuality-Easy",
        dayStructure: {
          monday: { type: "easy" },
          tuesday: { type: "lactate_threshold", thresholdMinutes: 35 },
          wednesday: { type: "medium_long" },
          thursday: { type: "tempo" },
          friday: { type: "recovery" },
          saturday: { type: "long_quality", marathonPaceMinutes: 20 },
          sunday: { type: "easy" }
        },
        baseVolume: 60,
        qualityDays: 4,
        recoveryDays: 1,
        mediumLongRuns: 1
      },
      peak: {
        pattern: "Easy-VO2-MLR-LT-Recovery-RaceSimulation-Recovery",
        dayStructure: {
          monday: { type: "easy" },
          tuesday: { type: "vo2max" },
          wednesday: { type: "medium_long" },
          thursday: { type: "lactate_threshold", thresholdMinutes: 40 },
          friday: { type: "recovery" },
          saturday: { type: "race_simulation", marathonPaceMinutes: 30 },
          sunday: { type: "recovery" }
        },
        baseVolume: 50,
        qualityDays: 4,
        recoveryDays: 1,
        mediumLongRuns: 1
      },
      taper: {
        pattern: "Easy-Tempo-Easy-LT-Recovery-RaceTune-Recovery",
        dayStructure: {
          monday: { type: "easy" },
          tuesday: { type: "tempo" },
          wednesday: { type: "easy" },
          thursday: { type: "lactate_threshold", thresholdMinutes: 15 },
          friday: { type: "recovery" },
          saturday: { type: "race_tune" },
          sunday: { type: "recovery" }
        },
        baseVolume: 30,
        qualityDays: 3,
        recoveryDays: 2,
        mediumLongRuns: 0
      },
      recovery: {
        pattern: "Recovery-Easy-Recovery-Easy-Recovery-Easy-Recovery",
        dayStructure: {
          monday: { type: "recovery" },
          tuesday: { type: "easy" },
          wednesday: { type: "recovery" },
          thursday: { type: "easy" },
          friday: { type: "recovery" },
          saturday: { type: "easy" },
          sunday: { type: "recovery" }
        },
        baseVolume: 20,
        qualityDays: 0,
        recoveryDays: 5,
        mediumLongRuns: 0
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
    let weeklyVolume = baseStructure.thresholdVolume?.weeklyMinutes || baseStructure.baseVolume * 0.2;
    if (phase === "base" || phase === "build") {
      const thresholdData = baseStructure.thresholdVolume || {
        weeklyMinutes: baseStructure.baseVolume * 0.2,
        progressionRate: 1.1,
        maxVolume: baseStructure.baseVolume * 0.4
      };
      weeklyVolume = Math.min(
        thresholdData.weeklyMinutes * Math.pow(thresholdData.progressionRate, Math.floor(currentWeek / 2)),
        thresholdData.maxVolume
      );
    }
    if (phase === "peak") {
      weeklyVolume = baseStructure.thresholdVolume?.weeklyMinutes || baseStructure.baseVolume * 0.2;
    }
    if (phase === "taper") {
      const taperReduction = Math.pow(0.85, currentWeek);
      const thresholdBase = baseStructure.thresholdVolume?.weeklyMinutes || baseStructure.baseVolume * 0.2;
      weeklyVolume = thresholdBase * taperReduction;
    }
    return {
      week: currentWeek,
      volume: Math.round(weeklyVolume),
      pace: "6:00",
      // Fixed threshold pace per km (typical LT pace)
      sessionDistribution: this.distributeThresholdVolume(weeklyVolume, phase)
    };
  }
  /**
   * Distribute threshold volume across weekly sessions
   */
  distributeThresholdVolume(totalMinutes, phase) {
    if (totalMinutes === 0) return {};
    const distributions = {
      base: {
        thursday: 1
        // Single LT session
      },
      build: {
        tuesday: 0.6,
        // Primary LT session
        thursday: 0.4
        // Secondary tempo session
      },
      peak: {
        tuesday: 0.5,
        // VO2max with LT elements
        thursday: 0.5
        // Pure LT session
      },
      taper: {
        thursday: 1
        // Single sharpening session
      },
      recovery: {}
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
      base: { lactate_threshold: 85, tempo: 84 },
      build: { lactate_threshold: 87, tempo: 84, medium_long_quality: 75 },
      peak: { lactate_threshold: 87, vo2max: 95, race_pace: 82 },
      taper: { lactate_threshold: 87, tempo: 84 },
      recovery: {}
    };
    return targets[phase] || targets["base"];
  }
  /**
   * Get threshold recovery requirements
   */
  getThresholdRecoveryRequirements(weeklyVolume) {
    return {
      days: weeklyVolume > 30 ? 2 : 1,
      // More recovery days at high volume
      intensity: Math.max(60, 70 - weeklyVolume * 0.2).toString() + "%"
      // Easier recovery as volume increases
    };
  }
  /**
   * Integrate race-specific pace work following Pfitzinger progression
   */
  getRaceSpecificIntegration(phase, weekIndex) {
    const raceWeeksOut = this.estimateWeeksToRace(phase, weekIndex);
    return {
      raceDistance: "marathon",
      preparationWeeks: Math.max(1, raceWeeksOut),
      tapering: {
        duration: phase === "taper" ? 3 : 0,
        volumeReduction: phase === "taper" ? 0.4 : 0
      },
      marathonPaceVolume: phase === "peak" ? 0.25 : phase === "build" ? 0.15 : 0.1
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
      return { weeks: 0, volumeReduction: 0 };
    }
    return {
      weeks: Math.max(1, 4 - weeksToRace),
      volumeReduction: Math.min(0.6, 0.15 * (4 - weeksToRace))
      // Progressive 15% reduction per week
    };
  }
  /**
   * Get tune-up race schedule
   */
  getTuneUpRaceSchedule(phase, weeksToRace) {
    const tuneUps = [];
    if (phase === "build" && weeksToRace >= 8 && weeksToRace <= 12) {
      tuneUps.push({
        weeksBeforeTarget: Math.floor(weeksToRace),
        distance: "10K",
        effort: "95%"
      });
    }
    if (phase === "peak" && weeksToRace >= 3 && weeksToRace <= 6) {
      tuneUps.push({
        weeksBeforeTarget: Math.floor(weeksToRace),
        distance: "half_marathon",
        effort: "90%"
      });
    }
    return tuneUps;
  }
  /**
   * Estimate weeks to target race (simplified)
   */
  estimateWeeksToRace(phase, weekIndex) {
    const phaseWeeksToRace = {
      base: 16 - weekIndex,
      build: 8 - weekIndex,
      peak: 4 - weekIndex,
      taper: 2 - weekIndex,
      recovery: 20 - weekIndex
    };
    return Math.max(1, phaseWeeksToRace[phase] || 8);
  }
  /**
   * Apply Pfitzinger workout spacing principles
   */
  applyPfitzingerWeeklySpacing(baseStructure, volumeProgression, raceIntegration, weekIndex) {
    const enhancedStructure = { ...baseStructure };
    Object.entries(volumeProgression.sessionDistribution).forEach(
      ([day, minutes]) => {
        if (enhancedStructure.dayStructure[day]) {
          enhancedStructure.dayStructure[day].thresholdMinutes = minutes;
        }
      }
    );
    if (raceIntegration.marathonPaceVolume > 0) {
      ["wednesday", "saturday"].forEach((day) => {
        const dayStructure = enhancedStructure.dayStructure[day];
        if (dayStructure && (dayStructure.type === "medium_long" || dayStructure.type === "long_quality")) {
          dayStructure.marathonPaceMinutes = Math.round(
            raceIntegration.marathonPaceVolume * 0.6
          );
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
      {
        week: weekIndex,
        volumeMultiplier: 1,
        intensityFocus: ["tempo"],
        restDays: 2,
        keyWorkouts: ["threshold"]
      },
      {
        week: weekIndex,
        volumeMultiplier: 1.15,
        intensityFocus: ["long_run"],
        restDays: 2,
        keyWorkouts: ["long_run"]
      },
      {
        week: weekIndex,
        volumeMultiplier: 0.9,
        intensityFocus: ["vo2max"],
        restDays: 1,
        keyWorkouts: ["intervals"]
      },
      {
        week: weekIndex,
        volumeMultiplier: 0.8,
        intensityFocus: ["recovery"],
        restDays: 3,
        keyWorkouts: ["easy"]
      }
    ];
    const cyclePosition = weekIndex % 4;
    return variations[cyclePosition] || variations[0];
  }
  /**
   * Get Pfitzinger weekly pattern
   */
  getPfitzingerWeeklyPattern(phase, weekIndex) {
    const weeklyStructure = this.generatePfitzingerWeeklyStructure(
      phase,
      weekIndex
    );
    return weeklyStructure.pattern;
  }
  /**
   * Get Pfitzinger phase focus areas
   */
  getPfitzingerPhaseFocus(phase) {
    switch (phase) {
      case "base":
        return [
          "Aerobic base",
          "Lactate threshold introduction",
          "Running economy",
          "Mileage buildup"
        ];
      case "build":
        return [
          "Lactate threshold development",
          "Marathon pace work",
          "Medium-long runs",
          "Endurance"
        ];
      case "peak":
        return [
          "Race-specific fitness",
          "Tune-up races",
          "VO2max touches",
          "Peak mileage"
        ];
      case "taper":
        return [
          "Maintain fitness",
          "Reduce fatigue",
          "Race preparation",
          "Sharpening"
        ];
      case "recovery":
        return [
          "Active recovery",
          "Base maintenance",
          "Preparation for next cycle"
        ];
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
      easy: "General aerobic run - comfortable effort",
      steady: "Medium-long run - sustained aerobic development",
      tempo: "Marathon pace run - race rhythm development",
      threshold: "Lactate threshold run - push the red line",
      progression: "Progressive long run - negative split practice",
      vo2max: "VO2max intervals - top-end speed",
      long_run: "Endurance long run - time on feet",
      recovery: "Recovery run - easy regeneration",
      race_pace: "Tune-up race - competitive sharpening",
      hill_repeats: "Hill workout - strength and power",
      fartlek: "Fartlek - varied pace training",
      time_trial: "Time trial - fitness assessment",
      cross_training: "Cross-training - active recovery",
      strength: "Strength training - injury prevention"
    };
    const enhancement = pfitzingerTerms[workoutType];
    return enhancement ? `${enhancement} - ${baseDescription}` : baseDescription;
  }
  /**
   * Get Pfitzinger-specific adaptation targets
   */
  getPfitzingerAdaptationTarget(workoutType, phase) {
    const adaptationTargets = {
      threshold: {
        base: "Lactate threshold introduction, aerobic power development",
        build: "Lactate threshold improvement, marathon pace efficiency",
        peak: "Peak lactate clearance, race-specific endurance",
        taper: "Maintain threshold fitness with reduced volume",
        recovery: "Light threshold maintenance"
      },
      tempo: {
        base: "Marathon pace introduction, rhythm development",
        build: "Marathon pace efficiency, glycogen utilization",
        peak: "Race pace lock-in, mental preparation",
        taper: "Race pace feel, confidence building",
        recovery: "Easy tempo for base maintenance"
      },
      progression: {
        base: "Negative split practice, fatigue resistance",
        build: "Late-race strength, glycogen depletion training",
        peak: "Race simulation, pacing discipline",
        taper: "Pace control, race strategy",
        recovery: "Light progression for maintenance"
      },
      long_run: {
        base: "Aerobic base, time on feet, mental toughness",
        build: "Endurance with quality, marathon simulation",
        peak: "Race-specific endurance, fuel utilization",
        taper: "Maintain endurance, reduce fatigue",
        recovery: "Easy long run for base maintenance"
      }
    };
    return adaptationTargets[workoutType]?.[phase] || `${workoutType} adaptation for ${phase} phase in Pfitzinger system`;
  }
  /**
   * Adjust TSS for Pfitzinger's higher quality approach
   */
  adjustTSSForPfitzinger(baseTSS, workoutType) {
    const tssMultipliers = {
      threshold: 1.15,
      // Higher stress from threshold work
      tempo: 1.1,
      progression: 1.12,
      steady: 1.05,
      long_run: 1.08,
      // Quality long runs
      easy: 1,
      recovery: 0.9,
      vo2max: 1.2,
      race_pace: 1.25
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
      const bestRace = currentFitness.recentRaces.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      const distanceKm = this.getRaceDistanceKm(bestRace.distance);
      const raceData = {
        date: /* @__PURE__ */ new Date(),
        distance: distanceKm,
        duration: bestRace.timeInSeconds,
        isRace: true,
        effortLevel: 10
      };
      const raceVDOT = calculateVDOT([raceData]);
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
        description: this.enhancePaceDescription(
          segment.description,
          paceRange,
          segment.zone.name
        )
      };
    });
    return {
      ...workout,
      workout: {
        ...workout.workout,
        segments: pacedSegments,
        ...{
          metadata: {
            ...workout.workout.metadata,
            lactateThresholdBased: true,
            foundationPace: ltPace
          }
        }
      }
    };
  }
  /**
   * Get pace range for training zone based on Pfitzinger system
   */
  getPaceRangeForZone(zoneName, paces) {
    const zoneMapping = {
      RECOVERY: "recovery",
      EASY: "generalAerobic",
      MARATHON: "marathonPace",
      TEMPO: "lactateThreshold",
      THRESHOLD: "lactateThreshold",
      VO2_MAX: "vo2max",
      SPEED: "neuromuscular",
      NEUROMUSCULAR: "neuromuscular"
    };
    const paceKey = zoneMapping[zoneName] || "generalAerobic";
    return paces[paceKey];
  }
  /**
   * Apply progressive threshold volume calculations
   * Requirement 3.1: Progressive threshold volume calculations
   */
  applyThresholdVolumeProgression(plan) {
    const totalWeeks = plan.summary?.totalWeeks || plan.blocks.reduce((sum, block) => sum + block.weeks, 0) || 12;
    const thresholdProgression = this.calculateLegacyThresholdVolumeProgression(plan);
    const enhancedWorkouts = plan.workouts.map((workout, index) => {
      const weekIndex = Math.floor(index / 7);
      const targetThresholdVolume = thresholdProgression[weekIndex] || thresholdProgression[0];
      if (this.isThresholdWorkout(workout.type)) {
        return this.adjustWorkoutForThresholdVolume(
          workout,
          targetThresholdVolume
        );
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
    const totalWeeks = plan.summary?.totalWeeks || plan.blocks.reduce((sum, block) => sum + block.weeks, 0) || 12;
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
    return ["threshold", "tempo", "progression", "race_pace"].includes(
      workoutType
    );
  }
  /**
   * Adjust workout duration based on target threshold volume
   */
  adjustWorkoutForThresholdVolume(workout, targetVolume) {
    const thresholdSegments = workout.workout.segments.filter(
      (seg) => seg.intensity >= 84 && seg.intensity <= 92
      // Threshold intensity range
    );
    const currentThresholdTime = thresholdSegments.reduce(
      (sum, seg) => sum + seg.duration,
      0
    );
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
        estimatedTSS: Math.round(
          workout.workout.estimatedTSS * cappedAdjustment
        )
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
      RECOVERY: { min: 0.5, max: 0.75 },
      EASY: { min: 0.25, max: 0.5 },
      MARATHON: { min: 0.167, max: 0.25 },
      TEMPO: { min: -0.05, max: 0.05 },
      THRESHOLD: { min: -0.05, max: 0.05 },
      VO2_MAX: { min: -0.25, max: -0.167 },
      SPEED: { min: -0.5, max: -0.333 }
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
      RECOVERY: `Recovery pace (${minPace}-${maxPace}) - Easy effort for active recovery`,
      EASY: `General aerobic pace (${minPace}-${maxPace}) - Conversational, aerobic base building`,
      MARATHON: `Marathon pace (${minPace}-${maxPace}) - Sustainable race pace effort`,
      TEMPO: `Lactate threshold pace (${minPace}-${maxPace}) - Comfortably hard, 1-hour effort`,
      THRESHOLD: `Lactate threshold pace (${minPace}-${maxPace}) - Foundation pace (${paceStr})`,
      VO2_MAX: `VO2max pace (${minPace}-${maxPace}) - Hard intervals, oxygen uptake`,
      SPEED: `Neuromuscular pace (${minPace}-${maxPace}) - Short, fast repetitions`
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
    const intersection = new Set(
      [...priorities1].filter((x) => priorities2.has(x))
    );
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

export {
  calculateVDOT,
  calculateCriticalSpeed,
  estimateRunningEconomy,
  calculateLactateThreshold,
  calculateTSS2 as calculateTSS,
  calculateTrainingLoad,
  calculateInjuryRisk,
  calculateRecoveryScore,
  analyzeWeeklyPatterns,
  calculateFitnessMetrics,
  ADAPTATION_TIMELINE,
  PHASE_DURATION,
  INTENSITY_MODELS,
  PROGRESSION_RATES,
  RECOVERY_MULTIPLIERS,
  LOAD_THRESHOLDS,
  WORKOUT_DURATIONS,
  RACE_DISTANCES,
  ENVIRONMENTAL_FACTORS,
  TRAINING_METHODOLOGIES,
  WORKOUT_EMPHASIS,
  METHODOLOGY_INTENSITY_DISTRIBUTIONS,
  METHODOLOGY_PHASE_TARGETS,
  TRAINING_ZONES,
  calculatePersonalizedZones,
  getZoneByIntensity,
  calculateTrainingPaces,
  WORKOUT_TEMPLATES,
  createCustomWorkout,
  calculateVDOTCached,
  calculateCriticalSpeedCached,
  calculateFitnessMetricsCached,
  calculateTrainingPacesCached,
  batchCalculateVDOT,
  CalculationProfiler,
  MemoryMonitor,
  CacheManager,
  OptimizationAnalyzer,
  cacheInstances,
  BaseTrainingPhilosophy,
  PhilosophyFactory,
  PhilosophyUtils
};
