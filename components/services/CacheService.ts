/* eslint-disable no-console */
import { LRUCache } from 'lru-cache';
import { CalculationResult, LoanParameters, RateProjection } from '../../App';

// Cache interface for type safety
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Rate data cache entry
interface SOFRRateData {
  date: string;
  rate: number;
  rateType: string;
}

// Calculation cache key generator
interface CalculationCacheKey {
  parameters: LoanParameters;
  projection: RateProjection;
  rateType: string;
}

// Browser-compatible base64 encoding utility
function encodeBase64(str: string): string {
  try {
    // Use browser's btoa function for base64 encoding
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    console.error('Error encoding base64:', error);
    // Fallback to a simple hash if btoa fails
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

class CacheService {
  private rateCache: LRUCache<string, CacheEntry<SOFRRateData>>;
  private calculationCache: LRUCache<string, CacheEntry<CalculationResult[]>>;
  private curveCache: LRUCache<string, CacheEntry<number>>;

  constructor() {
    // Rate cache - stores SOFR rate data for 1 hour
    this.rateCache = new LRUCache<string, CacheEntry<SOFRRateData>>({
      max: 1000, // Store up to 1000 rate entries
      ttl: 1000 * 60 * 60, // 1 hour TTL
      updateAgeOnGet: true,
      allowStale: false
    });

    // Calculation cache - stores calculation results for 30 minutes
    this.calculationCache = new LRUCache<string, CacheEntry<CalculationResult[]>>({
      max: 100, // Store up to 100 calculation sets
      ttl: 1000 * 60 * 30, // 30 minutes TTL
      updateAgeOnGet: true,
      allowStale: false
    });

    // Curve cache - stores computed curve rates for 15 minutes
    this.curveCache = new LRUCache<string, CacheEntry<number>>({
      max: 5000, // Store up to 5000 curve points
      ttl: 1000 * 60 * 15, // 15 minutes TTL
      updateAgeOnGet: true,
      allowStale: false
    });
  }

  // Generate cache key for rate data
  private generateRateKey(date: string, rateType: string): string {
    return `rate:${rateType}:${date}`;
  }

  // Generate cache key for calculations
  private generateCalculationKey(params: LoanParameters, projection: RateProjection, rateType: string): string {
    try {
      const keyObj = {
        globalParAmount: params.globalParAmount,
        ownershipPercentage: params.ownershipPercentage,
        purchasePrice: params.purchasePrice,
        startDate: params.startDate,
        endDate: params.endDate,
        dayCount: params.dayCount,
        spread: params.spread,
        floor: params.floor,
        cap: params.cap,
        compoundingType: params.compoundingType,
        projection: projection,
        rateType: rateType
      };
      
      return `calc:${encodeBase64(JSON.stringify(keyObj))}`;
    } catch (error) {
      console.error('Error generating calculation key:', error);
      // Fallback to a simple string-based key
      return `calc:${params.globalParAmount}_${params.ownershipPercentage}_${params.startDate}_${params.endDate}_${rateType}`;
    }
  }

  // Generate cache key for curve rates
  private generateCurveKey(date: string, projection: RateProjection): string {
    try {
      const curveKey = {
        date,
        mode: projection.mode,
        curveModel: projection.curveModel,
        params: projection.nelsonSiegelParams || projection.nssParams || projection.splineParams
      };
      
      return `curve:${encodeBase64(JSON.stringify(curveKey))}`;
    } catch (error) {
      console.error('Error generating curve key:', error);
      // Fallback to a simple string-based key
      return `curve:${date}_${projection.mode}_${projection.curveModel || 'manual'}`;
    }
  }

  // Cache SOFR rate data
  cacheRate(date: string, rateType: string, rate: number): void {
    try {
      const key = this.generateRateKey(date, rateType);
      const entry: CacheEntry<SOFRRateData> = {
        data: { date, rate, rateType },
        timestamp: Date.now()
      };
      
      this.rateCache.set(key, entry);
    } catch (error) {
      console.error('Error caching rate:', error);
    }
  }

  // Get cached SOFR rate data
  getCachedRate(date: string, rateType: string): SOFRRateData | null {
    try {
      const key = this.generateRateKey(date, rateType);
      const entry = this.rateCache.get(key);
      
      if (entry && this.isValidCacheEntry(entry, 1000 * 60 * 60)) { // 1 hour
        return entry.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached rate:', error);
      return null;
    }
  }

  // Cache calculation results
  cacheCalculation(params: LoanParameters, projection: RateProjection, rateType: string, results: CalculationResult[]): void {
    try {
      const key = this.generateCalculationKey(params, projection, rateType);
      const entry: CacheEntry<CalculationResult[]> = {
        data: results,
        timestamp: Date.now()
      };
      
      this.calculationCache.set(key, entry);
    } catch (error) {
      console.error('Error caching calculation:', error);
    }
  }

  // Get cached calculation results
  getCachedCalculation(params: LoanParameters, projection: RateProjection, rateType: string): CalculationResult[] | null {
    try {
      const key = this.generateCalculationKey(params, projection, rateType);
      const entry = this.calculationCache.get(key);
      
      if (entry && this.isValidCacheEntry(entry, 1000 * 60 * 30)) { // 30 minutes
        return entry.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached calculation:', error);
      return null;
    }
  }

  // Cache curve rate calculation
  cacheCurveRate(date: string, projection: RateProjection, rate: number): void {
    try {
      const key = this.generateCurveKey(date, projection);
      const entry: CacheEntry<number> = {
        data: rate,
        timestamp: Date.now()
      };
      
      this.curveCache.set(key, entry);
    } catch (error) {
      console.error('Error caching curve rate:', error);
    }
  }

  // Get cached curve rate
  getCachedCurveRate(date: string, projection: RateProjection): number | null {
    try {
      const key = this.generateCurveKey(date, projection);
      const entry = this.curveCache.get(key);
      
      if (entry && this.isValidCacheEntry(entry, 1000 * 60 * 15)) { // 15 minutes
        return entry.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached curve rate:', error);
      return null;
    }
  }

  // Check if cache entry is still valid
  private isValidCacheEntry<T>(entry: CacheEntry<T>, maxAge: number): boolean {
    return (Date.now() - entry.timestamp) < maxAge;
  }

  // Clear all caches
  clearAll(): void {
    try {
      this.rateCache.clear();
      this.calculationCache.clear();
      this.curveCache.clear();
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }

  // Clear rate cache only
  clearRateCache(): void {
    try {
      this.rateCache.clear();
    } catch (error) {
      console.error('Error clearing rate cache:', error);
    }
  }

  // Clear calculation cache only
  clearCalculationCache(): void {
    try {
      this.calculationCache.clear();
    } catch (error) {
      console.error('Error clearing calculation cache:', error);
    }
  }

  // Clear curve cache only
  clearCurveCache(): void {
    try {
      this.curveCache.clear();
    } catch (error) {
      console.error('Error clearing curve cache:', error);
    }
  }

  // Get cache statistics
  getCacheStats(): {
    rates: { size: number; maxSize: number };
    calculations: { size: number; maxSize: number };
    curves: { size: number; maxSize: number };
  } {
    try {
      return {
        rates: {
          size: this.rateCache.size,
          maxSize: this.rateCache.max
        },
        calculations: {
          size: this.calculationCache.size,
          maxSize: this.calculationCache.max
        },
        curves: {
          size: this.curveCache.size,
          maxSize: this.curveCache.max
        }
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        rates: { size: 0, maxSize: 0 },
        calculations: { size: 0, maxSize: 0 },
        curves: { size: 0, maxSize: 0 }
      };
    }
  }

  // Check if calculation is cached
  hasCalculation(params: LoanParameters, projection: RateProjection, rateType: string): boolean {
    try {
      const key = this.generateCalculationKey(params, projection, rateType);
      return this.calculationCache.has(key);
    } catch (error) {
      console.error('Error checking calculation cache:', error);
      return false;
    }
  }

  // Prune expired entries manually (LRU cache handles this automatically, but this is for explicit cleanup)
  pruneExpired(): void {
    try {
      const _now = Date.now();
      
      // Check rate cache
      for (const [key, entry] of this.rateCache.entries()) {
        if (!this.isValidCacheEntry(entry, 1000 * 60 * 60)) {
          this.rateCache.delete(key);
        }
      }
      
      // Check calculation cache
      for (const [key, entry] of this.calculationCache.entries()) {
        if (!this.isValidCacheEntry(entry, 1000 * 60 * 30)) {
          this.calculationCache.delete(key);
        }
      }
      
      // Check curve cache
      for (const [key, entry] of this.curveCache.entries()) {
        if (!this.isValidCacheEntry(entry, 1000 * 60 * 15)) {
          this.curveCache.delete(key);
        }
      }
    } catch (error) {
      console.error('Error pruning expired entries:', error);
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Export types for use in other files
export type { SOFRRateData, CalculationCacheKey };