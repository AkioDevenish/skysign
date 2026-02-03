export const PLAN_LIMITS = {
  free: {
    signatures: 5,
    teamMembers: 0,
  },
  pro: {
    signatures: Infinity,
    teamMembers: 0,
  },
  proplus: {
    signatures: Infinity,
    teamMembers: 10,
  },
};

export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  PRO_PLUS: 'proplus',
} as const;
