import { randomUUID } from "crypto";
import type { AnalysisSession, AutonomyLevel, AutonomyMapping, Capability } from "../types.js";

// In-memory store — sessions live for the lifetime of the MCP server process.
// For persistence across restarts, replace with a file or DB adapter here.
const store = new Map<string, AnalysisSession>();

export function createSession(role: string, context?: string): AnalysisSession {
  const session: AnalysisSession = {
    id: randomUUID(),
    role,
    context,
    createdAt: new Date().toISOString(),
  };
  store.set(session.id, session);
  return session;
}

export function getSession(id: string): AnalysisSession | undefined {
  return store.get(id);
}

export function updateSession(
  id: string,
  updates: Partial<Omit<AnalysisSession, "id" | "createdAt">>,
): AnalysisSession {
  const existing = store.get(id);
  if (!existing) throw new Error(`Session not found: ${id}`);
  const updated = { ...existing, ...updates };
  store.set(id, updated);
  return updated;
}

export function setCapabilities(id: string, capabilities: Capability[]): AnalysisSession {
  return updateSession(id, { capabilities });
}

export function setAutonomyMap(
  id: string,
  autonomyMap: AutonomyMapping[],
  autonomyTarget?: AutonomyLevel,
): AnalysisSession {
  return updateSession(id, { autonomyMap, ...(autonomyTarget ? { autonomyTarget } : {}) });
}

export function listSessions(): AnalysisSession[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
