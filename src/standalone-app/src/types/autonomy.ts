/** Autonomy level labels and exposure score types */

export type AutonomyLevel = "L1" | "L2" | "L3" | "L4" | "L5";

export type ExposureScore = "HUMAN" | "MOSTLY_HUMAN" | "SHARED" | "MOSTLY_AI" | "AI";

export type CapabilityZone = "Core" | "Contextual" | "Shared";

export interface Capability {
  id: string;
  name: string;
  zone: CapabilityZone;
  notes?: string;
}

export interface AutonomyMapping {
  capability: Capability;
  scores: Record<AutonomyLevel, ExposureScore>;
}

export interface AnalysisSession {
  role: string;
  context?: string;
  capabilities: Capability[];
  autonomyMap: AutonomyMapping[];
  autonomyTarget?: AutonomyLevel;
  createdAt: string;
}
