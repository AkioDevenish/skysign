import { describe, it, expect } from 'vitest';
import { PLAN_LIMITS, PLANS } from '../../convex/config';

describe('Plan Configuration', () => {
    it('should have correct limits for free plan', () => {
        expect(PLAN_LIMITS[PLANS.FREE].signatures).toBe(5);
        expect(PLAN_LIMITS[PLANS.FREE].teamMembers).toBe(0);
    });

    it('should have correct limits for pro plan', () => {
        expect(PLAN_LIMITS[PLANS.PRO].signatures).toBe(Infinity);
        expect(PLAN_LIMITS[PLANS.PRO].teamMembers).toBe(0);
    });

    it('should have correct limits for proplus plan', () => {
        expect(PLAN_LIMITS[PLANS.PRO_PLUS].signatures).toBe(Infinity);
        expect(PLAN_LIMITS[PLANS.PRO_PLUS].teamMembers).toBe(10);
    });
});
