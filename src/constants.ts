/**
 * Physiological adaptations timeline (in days)
 * Based on sports science research
 */
export const ADAPTATION_TIMELINE = {
  neuromuscular: 7,
  anaerobic: 14,
  aerobic_power: 21,
  aerobic_capacity: 28,
  mitochondrial: 42,
  capillarization: 56,
} as const;

/**
 * Training phase duration recommendations
 */
export const PHASE_DURATION = {
  base: { min: 4, max: 12, optimal: 8 },
  build: { min: 3, max: 8, optimal: 6 },
  peak: { min: 2, max: 4, optimal: 3 },
  taper: { min: 1, max: 3, optimal: 2 },
  recovery: { min: 1, max: 2, optimal: 1 },
} as const;

/**
 * Training intensity distribution models
 */
export const INTENSITY_MODELS = {
  polarized: { easy: 80, moderate: 5, hard: 15 },
  pyramidal: { easy: 70, moderate: 20, hard: 10 },
  threshold: { easy: 60, moderate: 30, hard: 10 },
} as const;

/**
 * Safe training progression rates
 */
export const PROGRESSION_RATES = {
  beginner: 0.05, // 5% weekly increase
  intermediate: 0.08, // 8% weekly increase
  advanced: 0.1, // 10% weekly increase
  maxSingleWeek: 0.2, // 20% max in any single week
} as const;

/**
 * Recovery time multipliers based on workout intensity
 */
export const RECOVERY_MULTIPLIERS = {
  recovery: 0.5,
  easy: 1.0,
  steady: 1.5,
  tempo: 2.0,
  threshold: 3.0,
  vo2max: 4.0,
  speed: 3.5,
  race: 5.0,
} as const;

/**
 * Training load thresholds
 */
export const LOAD_THRESHOLDS = {
  acute_chronic_ratio: {
    veryLow: 0.8,
    low: 1.0,
    optimal: 1.25,
    high: 1.5,
    veryHigh: 2.0,
  },
  weekly_tss: {
    recovery: 300,
    maintenance: 500,
    productive: 700,
    overreaching: 900,
    risky: 1200,
  },
} as const;

/**
 * Standard workout durations (minutes)
 */
export const WORKOUT_DURATIONS = {
  recovery: { min: 20, max: 40, typical: 30 },
  easy: { min: 30, max: 90, typical: 60 },
  steady: { min: 40, max: 80, typical: 60 },
  tempo: { min: 20, max: 60, typical: 40 },
  threshold: { min: 20, max: 40, typical: 30 },
  intervals: { min: 30, max: 60, typical: 45 },
  long_run: { min: 60, max: 180, typical: 120 },
} as const;

/**
 * Race distance constants (km)
 */
export const RACE_DISTANCES = {
  "5K": 5,
  "10K": 10,
  HALF_MARATHON: 21.0975,
  MARATHON: 42.195,
  "50K": 50,
  "50_MILE": 80.4672,
  "100K": 100,
  "100_MILE": 160.9344,
} as const;

/**
 * Environmental adjustment factors
 */
export const ENVIRONMENTAL_FACTORS = {
  altitude: {
    seaLevel: 1.0,
    moderate: 0.98, // 1000-2000m
    high: 0.94, // 2000-3000m
    veryHigh: 0.88, // >3000m
  },
  temperature: {
    cold: 0.98, // <5°C
    cool: 1.0, // 5-15°C
    warm: 0.97, // 15-25°C
    hot: 0.92, // >25°C
  },
  humidity: {
    low: 1.0, // <40%
    moderate: 0.98, // 40-60%
    high: 0.95, // >60%
  },
} as const;

/**
 * Training methodology configurations
 */
export const TRAINING_METHODOLOGIES = {
  daniels: {
    name: "Jack Daniels",
    intensityDistribution: { easy: 80, moderate: 10, hard: 10, veryHard: 0 },
    workoutPriorities: ["tempo", "vo2max", "threshold", "easy", "long_run"],
    recoveryEmphasis: 0.7,
    phaseTransitions: {
      base: { duration: 8, focus: "aerobic" },
      build: { duration: 6, focus: "threshold" },
      peak: { duration: 3, focus: "vo2max" },
      taper: { duration: 2, focus: "maintenance" },
    },
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
      taper: { duration: 2, focus: "maintenance" },
    },
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
      taper: { duration: 2, focus: "maintenance" },
    },
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
      taper: { duration: 2, focus: "maintenance" },
    },
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
      taper: { duration: 2, focus: "maintenance" },
    },
  },
} as const;

/**
 * Workout emphasis multipliers for different methodologies
 */
export const WORKOUT_EMPHASIS = {
  daniels: {
    recovery: 1.0,
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
    strength: 0.9,
  },
  lydiard: {
    recovery: 1.0,
    easy: 1.5,
    steady: 1.3,
    tempo: 1.1,
    threshold: 1.0,
    vo2max: 0.8,
    speed: 0.9,
    hill_repeats: 1.3,
    fartlek: 1.0,
    progression: 1.2,
    long_run: 1.4,
    race_pace: 1.0,
    time_trial: 0.9,
    cross_training: 0.7,
    strength: 0.8,
  },
  pfitzinger: {
    recovery: 1.0,
    easy: 1.3,
    steady: 1.2,
    tempo: 1.2,
    threshold: 1.5,
    vo2max: 1.1,
    speed: 1.0,
    hill_repeats: 1.1,
    fartlek: 1.0,
    progression: 1.2,
    long_run: 1.3,
    race_pace: 1.4,
    time_trial: 1.2,
    cross_training: 0.8,
    strength: 0.9,
  },
  hudson: {
    recovery: 1.0,
    easy: 1.2,
    steady: 1.1,
    tempo: 1.4,
    threshold: 1.2,
    vo2max: 1.1,
    speed: 1.0,
    hill_repeats: 1.1,
    fartlek: 1.3,
    progression: 1.2,
    long_run: 1.2,
    race_pace: 1.2,
    time_trial: 1.1,
    cross_training: 0.9,
    strength: 1.0,
  },
  custom: {
    recovery: 1.0,
    easy: 1.2,
    steady: 1.1,
    tempo: 1.2,
    threshold: 1.2,
    vo2max: 1.1,
    speed: 1.0,
    hill_repeats: 1.1,
    fartlek: 1.2,
    progression: 1.1,
    long_run: 1.2,
    race_pace: 1.2,
    time_trial: 1.1,
    cross_training: 0.8,
    strength: 0.9,
  },
} as const;

/**
 * Methodology-specific intensity distributions by training phase
 * Each methodology has different emphasis on easy vs. hard training across phases
 */
export const METHODOLOGY_INTENSITY_DISTRIBUTIONS = {
  daniels: {
    base: { easy: 85, moderate: 10, hard: 5, veryHard: 0 }, // 80/20 approach with slight emphasis on aerobic base
    build: { easy: 80, moderate: 15, hard: 5, veryHard: 0 }, // Standard Daniels distribution
    peak: { easy: 75, moderate: 15, hard: 10, veryHard: 0 }, // More VO2max work for race preparation
    taper: { easy: 80, moderate: 15, hard: 5, veryHard: 0 }, // Return to more conservative distribution
    recovery: { easy: 95, moderate: 5, hard: 0, veryHard: 0 }, // Complete aerobic recovery
  },
  lydiard: {
    base: { easy: 90, moderate: 8, hard: 2, veryHard: 0 }, // Lydiard's signature 85%+ easy running in base
    build: { easy: 85, moderate: 12, hard: 3, veryHard: 0 }, // Maintain heavy aerobic emphasis
    peak: { easy: 80, moderate: 15, hard: 5, veryHard: 0 }, // Limited speed work after base building
    taper: { easy: 85, moderate: 12, hard: 3, veryHard: 0 }, // Conservative approach to taper
    recovery: { easy: 100, moderate: 0, hard: 0, veryHard: 0 }, // Complete rest philosophy
  },
  pfitzinger: {
    base: { easy: 75, moderate: 20, hard: 5, veryHard: 0 }, // Higher moderate emphasis (threshold work)
    build: { easy: 70, moderate: 25, hard: 5, veryHard: 0 }, // Significant lactate threshold volume
    peak: { easy: 70, moderate: 20, hard: 10, veryHard: 0 }, // Race-specific pace work increase
    taper: { easy: 75, moderate: 20, hard: 5, veryHard: 0 }, // Maintain some threshold work
    recovery: { easy: 90, moderate: 10, hard: 0, veryHard: 0 }, // Active recovery approach
  },
  hudson: {
    base: { easy: 80, moderate: 15, hard: 5, veryHard: 0 }, // Balanced approach with tempo emphasis
    build: { easy: 75, moderate: 20, hard: 5, veryHard: 0 }, // Tempo endurance focus
    peak: { easy: 70, moderate: 20, hard: 10, veryHard: 0 }, // Race pace and neuromuscular work
    taper: { easy: 80, moderate: 15, hard: 5, veryHard: 0 }, // Return to base distribution
    recovery: { easy: 90, moderate: 10, hard: 0, veryHard: 0 }, // Moderate recovery approach
  },
  custom: {
    base: { easy: 80, moderate: 15, hard: 5, veryHard: 0 }, // Default polarized approach
    build: { easy: 75, moderate: 20, hard: 5, veryHard: 0 }, // Moderate build phase
    peak: { easy: 70, moderate: 20, hard: 10, veryHard: 0 }, // Increased intensity for peaking
    taper: { easy: 80, moderate: 15, hard: 5, veryHard: 0 }, // Return to conservative distribution
    recovery: { easy: 90, moderate: 10, hard: 0, veryHard: 0 }, // Standard recovery distribution
  },
} as const;

/**
 * Phase-specific targets for each methodology
 */
export const METHODOLOGY_PHASE_TARGETS = {
  daniels: {
    base: ["aerobic_capacity", "mitochondrial"],
    build: ["lactate_threshold", "aerobic_power"],
    peak: ["vo2max", "neuromuscular"],
    taper: ["maintenance", "freshness"],
  },
  lydiard: {
    base: ["aerobic_capacity", "capillarization"],
    build: ["hill_strength", "aerobic_power"],
    peak: ["speed", "neuromuscular"],
    taper: ["maintenance", "freshness"],
  },
  pfitzinger: {
    base: ["aerobic_capacity", "mitochondrial"],
    build: ["lactate_threshold", "marathon_pace"],
    peak: ["race_pace", "aerobic_power"],
    taper: ["maintenance", "race_readiness"],
  },
  hudson: {
    base: ["aerobic_capacity", "mitochondrial"],
    build: ["tempo_endurance", "lactate_buffering"],
    peak: ["race_pace", "neuromuscular"],
    taper: ["maintenance", "freshness"],
  },
  custom: {
    base: ["aerobic_capacity", "mitochondrial"],
    build: ["lactate_threshold", "aerobic_power"],
    peak: ["vo2max", "race_pace"],
    taper: ["maintenance", "freshness"],
  },
} as const;
