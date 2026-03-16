export type PlanCode = "ptp_3m" | "mtp_2_3m";

export const PLAN_DETAILS: Record<PlanCode, { planName: string; amountInr: number; amountPaise: number }> = {
  ptp_3m: {
    planName: "Pre Training Program",
    amountInr: 2,
    amountPaise: 200,
  },
  mtp_2_3m: {
    planName: "Mains Training Program 2.0",
    amountInr: 3,
    amountPaise: 300,
  },
};

export function isPlanCode(value: string): value is PlanCode {
  return value === "ptp_3m" || value === "mtp_2_3m";
}
