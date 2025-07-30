/**
 * Zones Test Suite
 * 
 * Validates training zone calculations, personalized zone generation,
 * and zone-to-intensity mapping functionality. Tests boundary conditions
 * and performance requirements for zone calculations.
 * 
 * REQUIREMENTS TESTED:
 * - calculatePersonalizedZones with various inputs (1.6)
 * - Boundary conditions for each training zone (2.2)
 * - Zone intensity ranges (60-100%) validation (4.2)
 * - Performance benchmark for zone calculations (<5ms)
 * 
 * TEST STATUS: New test suite for zones module functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  TRAINING_ZONES,
  TrainingZone,
  calculatePersonalizedZones,
  getZoneByIntensity,
  calculateTrainingPaces
} from '../zones';
import { measureExecutionTime } from './test-utils';

describe('Training Zones Module', () => {
  describe('TRAINING_ZONES constants', () => {
    it('should have all required training zones', () => {
      const expectedZones = [
        'RECOVERY', 'EASY', 'STEADY', 'TEMPO', 
        'THRESHOLD', 'VO2_MAX', 'NEUROMUSCULAR'
      ];
      
      expectedZones.forEach(zoneName => {
        expect(TRAINING_ZONES[zoneName]).toBeDefined();
        expect(TRAINING_ZONES[zoneName].name).toBeTruthy();
        expect(TRAINING_ZONES[zoneName].rpe).toBeGreaterThan(0);
        expect(TRAINING_ZONES[zoneName].description).toBeTruthy();
        expect(TRAINING_ZONES[zoneName].purpose).toBeTruthy();
      });
    });

    it('should have proper RPE progression', () => {
      expect(TRAINING_ZONES.RECOVERY.rpe).toBe(1);
      expect(TRAINING_ZONES.EASY.rpe).toBe(2);
      expect(TRAINING_ZONES.STEADY.rpe).toBe(3);
      expect(TRAINING_ZONES.TEMPO.rpe).toBe(4);
      expect(TRAINING_ZONES.THRESHOLD.rpe).toBe(5);
      expect(TRAINING_ZONES.VO2_MAX.rpe).toBe(6);
      expect(TRAINING_ZONES.NEUROMUSCULAR.rpe).toBe(7);
    });

    it('should have valid heart rate ranges', () => {
      Object.values(TRAINING_ZONES).forEach(zone => {
        if (zone.heartRateRange) {
          expect(zone.heartRateRange.min).toBeGreaterThan(0);
          expect(zone.heartRateRange.max).toBeGreaterThan(zone.heartRateRange.min);
          expect(zone.heartRateRange.max).toBeLessThanOrEqual(100);
        }
      });
    });

    it('should have valid pace ranges', () => {
      Object.values(TRAINING_ZONES).forEach(zone => {
        if (zone.paceRange) {
          expect(zone.paceRange.min).toBeGreaterThanOrEqual(0);
          expect(zone.paceRange.max).toBeGreaterThan(zone.paceRange.min);
        }
      });
    });

    it('should have logical zone progression in heart rate', () => {
      const zones = [
        TRAINING_ZONES.RECOVERY,
        TRAINING_ZONES.EASY,
        TRAINING_ZONES.STEADY,
        TRAINING_ZONES.TEMPO,
        TRAINING_ZONES.THRESHOLD,
        TRAINING_ZONES.VO2_MAX,
        TRAINING_ZONES.NEUROMUSCULAR
      ];

      for (let i = 1; i < zones.length; i++) {
        const prevZone = zones[i - 1];
        const currentZone = zones[i];
        
        if (prevZone.heartRateRange && currentZone.heartRateRange) {
          expect(currentZone.heartRateRange.min).toBeGreaterThanOrEqual(
            prevZone.heartRateRange.max - 5 // Allow small overlap
          );
        }
      }
    });
  });

  describe('calculatePersonalizedZones', () => {
    const mockMaxHR = 190;
    const mockThresholdPace = 4.0; // 4:00/km

    it('should calculate personalized zones with valid inputs', () => {
      const personalizedZones = calculatePersonalizedZones(mockMaxHR, mockThresholdPace);

      expect(Object.keys(personalizedZones)).toHaveLength(7);
      
      Object.values(personalizedZones).forEach(zone => {
        expect(zone.name).toBeTruthy();
        expect(zone.rpe).toBeGreaterThan(0);
        expect(zone.description).toBeTruthy();
        expect(zone.purpose).toBeTruthy();
        
        if (zone.heartRateRange) {
          expect(zone.heartRateRange.min).toBeGreaterThan(0);
          expect(zone.heartRateRange.max).toBeLessThanOrEqual(mockMaxHR);
          expect(zone.heartRateRange.max).toBeGreaterThan(zone.heartRateRange.min);
        }
        
        if (zone.paceRange) {
          expect(zone.paceRange.min).toBeGreaterThanOrEqual(0);
          expect(zone.paceRange.max).toBeGreaterThan(zone.paceRange.min);
        }
      });
    });

    it('should properly scale heart rate zones', () => {
      const personalizedZones = calculatePersonalizedZones(mockMaxHR, mockThresholdPace);
      
      // Test specific zone calculations
      const recoveryZone = personalizedZones.RECOVERY;
      expect(recoveryZone.heartRateRange?.min).toBe(Math.round(0.50 * mockMaxHR)); // 95
      expect(recoveryZone.heartRateRange?.max).toBe(Math.round(0.60 * mockMaxHR)); // 114

      const thresholdZone = personalizedZones.THRESHOLD;
      expect(thresholdZone.heartRateRange?.min).toBe(Math.round(0.87 * mockMaxHR)); // 165
      expect(thresholdZone.heartRateRange?.max).toBe(Math.round(0.92 * mockMaxHR)); // 175
    });

    it('should properly scale pace zones', () => {
      const personalizedZones = calculatePersonalizedZones(mockMaxHR, mockThresholdPace);
      
      // Recovery zone should be much slower than threshold
      const recoveryZone = personalizedZones.RECOVERY;
      expect(recoveryZone.paceRange?.min).toBe(0); // No lower bound for recovery
      expect(recoveryZone.paceRange?.max).toBe((mockThresholdPace * 75) / 100); // 3:00/km

      // Threshold zone should be close to threshold pace
      const thresholdZone = personalizedZones.THRESHOLD;
      expect(thresholdZone.paceRange?.min).toBe((mockThresholdPace * 95) / 100); // 3:48/km
      expect(thresholdZone.paceRange?.max).toBe((mockThresholdPace * 100) / 100); // 4:00/km
    });

    it('should handle different max HR values', () => {
      const lowMaxHR = 160;
      const highMaxHR = 220;
      
      const lowHRZones = calculatePersonalizedZones(lowMaxHR, mockThresholdPace);
      const highHRZones = calculatePersonalizedZones(highMaxHR, mockThresholdPace);
      
      // Heart rate ranges should scale proportionally
      expect(lowHRZones.THRESHOLD.heartRateRange?.max).toBeLessThan(
        highHRZones.THRESHOLD.heartRateRange?.max || 0
      );
      
      // Pace ranges should remain the same
      expect(lowHRZones.THRESHOLD.paceRange?.max).toBe(
        highHRZones.THRESHOLD.paceRange?.max
      );
    });

    it('should handle different threshold paces', () => {
      const fastThresholdPace = 3.5; // 3:30/km
      const slowThresholdPace = 5.0; // 5:00/km
      
      const fastZones = calculatePersonalizedZones(mockMaxHR, fastThresholdPace);
      const slowZones = calculatePersonalizedZones(mockMaxHR, slowThresholdPace);
      
      // Heart rate ranges should remain the same
      expect(fastZones.THRESHOLD.heartRateRange?.max).toBe(
        slowZones.THRESHOLD.heartRateRange?.max
      );
      
      // Pace ranges should scale
      expect(fastZones.THRESHOLD.paceRange?.max).toBeLessThan(
        slowZones.THRESHOLD.paceRange?.max || 0
      );
    });

    it('should handle boundary conditions', () => {
      // Test with minimal values
      const minZones = calculatePersonalizedZones(120, 6.0);
      expect(minZones.RECOVERY.heartRateRange?.min).toBeGreaterThan(0);
      
      // Test with high values
      const maxZones = calculatePersonalizedZones(220, 3.0);
      expect(maxZones.NEUROMUSCULAR.heartRateRange?.max).toBeLessThanOrEqual(220);
    });

    it('should include VDOT parameter for future enhancement', () => {
      // Test that VDOT parameter is accepted but doesn't break calculation
      const zonesWithVDOT = calculatePersonalizedZones(mockMaxHR, mockThresholdPace, 50);
      const zonesWithoutVDOT = calculatePersonalizedZones(mockMaxHR, mockThresholdPace);
      
      // Should produce same results currently (VDOT not implemented yet)
      expect(Object.keys(zonesWithVDOT)).toEqual(Object.keys(zonesWithoutVDOT));
    });

    it('should meet performance benchmark (<5ms)', async () => {
      const { time } = await measureExecutionTime(() => {
        calculatePersonalizedZones(mockMaxHR, mockThresholdPace);
      });
      
      expect(time).toBeLessThan(5);
    });
  });

  describe('getZoneByIntensity', () => {
    it('should return correct zones for boundary intensities', () => {
      // Test exact boundaries
      expect(getZoneByIntensity(59)).toBe(TRAINING_ZONES.RECOVERY);
      expect(getZoneByIntensity(60)).toBe(TRAINING_ZONES.EASY);
      expect(getZoneByIntensity(69)).toBe(TRAINING_ZONES.EASY);
      expect(getZoneByIntensity(70)).toBe(TRAINING_ZONES.STEADY);
      expect(getZoneByIntensity(79)).toBe(TRAINING_ZONES.STEADY);
      expect(getZoneByIntensity(80)).toBe(TRAINING_ZONES.TEMPO);
      expect(getZoneByIntensity(86)).toBe(TRAINING_ZONES.TEMPO);
      expect(getZoneByIntensity(87)).toBe(TRAINING_ZONES.THRESHOLD);
      expect(getZoneByIntensity(91)).toBe(TRAINING_ZONES.THRESHOLD);
      expect(getZoneByIntensity(92)).toBe(TRAINING_ZONES.VO2_MAX);
      expect(getZoneByIntensity(96)).toBe(TRAINING_ZONES.VO2_MAX);
      expect(getZoneByIntensity(97)).toBe(TRAINING_ZONES.NEUROMUSCULAR);
      expect(getZoneByIntensity(100)).toBe(TRAINING_ZONES.NEUROMUSCULAR);
    });

    it('should handle intensity ranges (60-100%)', () => {
      // Test valid range
      for (let intensity = 60; intensity <= 100; intensity += 5) {
        const zone = getZoneByIntensity(intensity);
        expect(zone).toBeDefined();
        expect(zone.name).toBeTruthy();
      }
    });

    it('should handle edge cases', () => {
      // Very low intensity should be recovery
      expect(getZoneByIntensity(0)).toBe(TRAINING_ZONES.RECOVERY);
      expect(getZoneByIntensity(30)).toBe(TRAINING_ZONES.RECOVERY);
      
      // Very high intensity should be neuromuscular
      expect(getZoneByIntensity(110)).toBe(TRAINING_ZONES.NEUROMUSCULAR);
      expect(getZoneByIntensity(150)).toBe(TRAINING_ZONES.NEUROMUSCULAR);
    });

    it('should return zones with consistent RPE progression', () => {
      const intensities = [50, 65, 75, 83, 89, 94, 98];
      const zones = intensities.map(getZoneByIntensity);
      
      for (let i = 1; i < zones.length; i++) {
        expect(zones[i].rpe).toBeGreaterThanOrEqual(zones[i - 1].rpe);
      }
    });

    it('should handle decimal intensities', () => {
      expect(getZoneByIntensity(59.9)).toBe(TRAINING_ZONES.RECOVERY);
      expect(getZoneByIntensity(60.1)).toBe(TRAINING_ZONES.EASY);
      expect(getZoneByIntensity(86.9)).toBe(TRAINING_ZONES.TEMPO);
      expect(getZoneByIntensity(87.1)).toBe(TRAINING_ZONES.THRESHOLD);
    });

    it('should meet performance benchmark (<1ms)', async () => {
      const { time } = await measureExecutionTime(() => {
        for (let i = 0; i < 100; i++) {
          getZoneByIntensity(60 + (i % 40)); // Test range 60-100
        }
      });
      
      expect(time).toBeLessThan(1);
    });
  });

  describe('calculateTrainingPaces', () => {
    it('should calculate paces for various VDOT values', () => {
      const vdotValues = [30, 45, 60, 75];
      
      vdotValues.forEach(vdot => {
        const paces = calculateTrainingPaces(vdot);
        
        expect(paces.easy).toBeDefined();
        expect(paces.marathon).toBeDefined();
        expect(paces.threshold).toBeDefined();
        expect(paces.interval).toBeDefined();
        expect(paces.repetition).toBeDefined();
        
        // All paces should be positive
        Object.values(paces).forEach(pace => {
          expect(pace).toBeGreaterThan(0);
        });
        
        // Pace progression should be logical (faster = lower number)
        expect(paces.repetition).toBeLessThan(paces.interval);
        expect(paces.interval).toBeLessThan(paces.threshold);
        expect(paces.threshold).toBeLessThan(paces.marathon);
        expect(paces.marathon).toBeLessThan(paces.easy);
      });
    });

    it('should return faster paces for higher VDOT', () => {
      const lowVDOTPaces = calculateTrainingPaces(35);
      const highVDOTPaces = calculateTrainingPaces(65);
      
      // Higher VDOT should result in faster (lower) paces
      expect(highVDOTPaces.easy).toBeLessThan(lowVDOTPaces.easy);
      expect(highVDOTPaces.marathon).toBeLessThan(lowVDOTPaces.marathon);
      expect(highVDOTPaces.threshold).toBeLessThan(lowVDOTPaces.threshold);
      expect(highVDOTPaces.interval).toBeLessThan(lowVDOTPaces.interval);
      expect(highVDOTPaces.repetition).toBeLessThan(lowVDOTPaces.repetition);
    });

    it('should handle boundary VDOT values', () => {
      // Test minimum reasonable VDOT
      const minPaces = calculateTrainingPaces(25);
      Object.values(minPaces).forEach(pace => {
        expect(pace).toBeGreaterThan(0);
        expect(pace).toBeLessThan(15); // Reasonable upper bound for pace
      });
      
      // Test high VDOT
      const maxPaces = calculateTrainingPaces(85);
      Object.values(maxPaces).forEach(pace => {
        expect(pace).toBeGreaterThan(2); // Reasonable lower bound for pace
        expect(pace).toBeLessThan(10);
      });
    });

    it('should use correct VDOT multipliers', () => {
      const vdot = 50;
      const paces = calculateTrainingPaces(vdot);
      
      // Verify relative pace relationships match expected multipliers
      const easyToThresholdRatio = paces.easy / paces.threshold;
      const thresholdToIntervalRatio = paces.threshold / paces.interval;
      
      // Easy should be significantly slower than threshold
      expect(easyToThresholdRatio).toBeGreaterThan(1.2);
      
      // Threshold should be slower than interval
      expect(thresholdToIntervalRatio).toBeGreaterThan(1.05);
    });

    it('should provide reasonable pace values', () => {
      const averageVDOT = 45;
      const paces = calculateTrainingPaces(averageVDOT);
      
      // Sanity check: paces should be in reasonable range for recreational runners
      expect(paces.easy).toBeGreaterThan(4.5); // Slower than 4:30/km
      expect(paces.easy).toBeLessThan(8.0); // Faster than 8:00/km
      
      expect(paces.threshold).toBeGreaterThan(3.5); // Slower than 3:30/km
      expect(paces.threshold).toBeLessThan(6.0); // Faster than 6:00/km
      
      expect(paces.repetition).toBeGreaterThan(3.0); // Slower than 3:00/km
      expect(paces.repetition).toBeLessThan(5.5); // Faster than 5:30/km
    });

    it('should meet performance benchmark (<5ms)', async () => {
      const { time } = await measureExecutionTime(() => {
        calculateTrainingPaces(50);
      });
      
      expect(time).toBeLessThan(5);
    });

    it('should handle edge cases and invalid inputs gracefully', () => {
      // Very low VDOT
      const lowPaces = calculateTrainingPaces(15);
      Object.values(lowPaces).forEach(pace => {
        expect(pace).toBeGreaterThan(0);
        expect(Number.isFinite(pace)).toBe(true);
      });
      
      // Very high VDOT
      const highPaces = calculateTrainingPaces(100);
      Object.values(highPaces).forEach(pace => {
        expect(pace).toBeGreaterThan(0);
        expect(Number.isFinite(pace)).toBe(true);
      });
    });
  });

  describe('Zone Integration', () => {
    it('should have consistent zone definitions across functions', () => {
      const personalizedZones = calculatePersonalizedZones(180, 4.2);
      
      // Verify that personalized zones maintain same structure as base zones
      Object.keys(TRAINING_ZONES).forEach(zoneKey => {
        expect(personalizedZones[zoneKey]).toBeDefined();
        expect(personalizedZones[zoneKey].name).toBe(TRAINING_ZONES[zoneKey].name);
        expect(personalizedZones[zoneKey].rpe).toBe(TRAINING_ZONES[zoneKey].rpe);
      });
    });

    it('should integrate properly with intensity mapping', () => {
      // Test that zones returned by getZoneByIntensity match expected ranges
      const testCases = [
        { intensity: 55, expectedZone: 'RECOVERY' },
        { intensity: 65, expectedZone: 'EASY' },
        { intensity: 75, expectedZone: 'STEADY' },
        { intensity: 83, expectedZone: 'TEMPO' },
        { intensity: 89, expectedZone: 'THRESHOLD' },
        { intensity: 94, expectedZone: 'VO2_MAX' },
        { intensity: 98, expectedZone: 'NEUROMUSCULAR' }
      ];
      
      testCases.forEach(({ intensity, expectedZone }) => {
        const zone = getZoneByIntensity(intensity);
        expect(zone.name).toBe(TRAINING_ZONES[expectedZone].name);
      });
    });

    it('should maintain zone boundaries consistency', () => {
      // Verify no gaps in zone coverage
      for (let intensity = 0; intensity <= 100; intensity++) {
        const zone = getZoneByIntensity(intensity);
        expect(zone).toBeDefined();
        expect(zone.name).toBeTruthy();
      }
    });
  });
});