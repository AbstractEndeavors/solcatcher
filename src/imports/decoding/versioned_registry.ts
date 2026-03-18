/**
 * versioned-registry.ts
 * 
 * Program-keyed decoder registry.
 * 
 * Problem: Global singleton registry with overlapping IDLs will collide when:
 *   - pump v0.2 lands
 *   - same event name, different layout
 *   - discriminator collisions across programs
 * 
 * Solution: Key registry by programId (or IDL hash for versioning).
 * 
 * Pattern: registries over globals; explicit environment wiring
 */

import {
  DecoderRegistry,
  buildRegistryFromIdl,
  type AnchorIDL,
} from '@imports';
import { createHash } from 'crypto';

// =============================================================================
// TYPES
// =============================================================================

export interface VersionedRegistryEntry {
  registry: DecoderRegistry;
  idlHash: string;
  programId: string;
  idlVersion: string;
  idlName: string;
  registeredAt: Date;
}

export interface DecodeContext {
  programId: string;
  signature?: string;
}

export interface DecodeResult {
  name: string;
  category: string;
  data: Record<string, unknown>;
  programId: string;
  idlVersion: string;
}

// =============================================================================
// VERSIONED REGISTRY
// =============================================================================

export class VersionedDecoderRegistry {
  /**
   * Primary index: programId → registry
   * For runtime decoding when you know the program.
   */
  private byProgramId = new Map<string, VersionedRegistryEntry>();
  
  /**
   * Secondary index: idlHash → registry
   * For detecting duplicate IDLs and version tracking.
   */
  private byIdlHash = new Map<string, VersionedRegistryEntry>();
  
  /**
   * Fallback: unified registry for unknown programs
   * (preserves original behavior as escape hatch)
   */
  private fallback: DecoderRegistry | null = null;
  
  // ─────────────────────────────────────────────
  // REGISTRATION
  // ─────────────────────────────────────────────
  private anonymous: VersionedRegistryEntry[] = [];
  /**
   * Register an IDL for a specific program.
   * 
   * @param idl - Anchor IDL
   * @param programId - Program address (from IDL metadata or explicit)
   * @returns Entry for chaining or inspection
   */
register(idl: AnchorIDL, programId?: string): VersionedRegistryEntry {
  const resolvedProgramId = programId ?? idl.metadata?.address ?? null;
  const idlHash = this.hashIdl(idl);

  // Dedup by hash
  const existingByHash = this.byIdlHash.get(idlHash);
  if (existingByHash) return existingByHash;

  const registry = buildRegistryFromIdl(idl);

  const entry: VersionedRegistryEntry = {
    registry,
    idlHash,
    programId: resolvedProgramId ?? 'anonymous',
    idlVersion: idl.version ?? 'unknown',
    idlName: idl.name ?? 'anonymous',
    registeredAt: new Date(),
  };

  if (resolvedProgramId) {
    const existing = this.byProgramId.get(resolvedProgramId);
    if (existing) {
      console.warn(
        `VersionedDecoderRegistry: programId collision ${resolvedProgramId}, replacing`
      );
    }
    this.byProgramId.set(resolvedProgramId, entry);
  } else {
    // 👇 THIS IS THE IMPORTANT PART
    this.anonymous.push(entry);
  }

  this.byIdlHash.set(idlHash, entry);
  return entry;
}

  
  /**
   * Register multiple IDLs.
   * Each IDL must have metadata.address or you must provide programIds.
   */
  registerMany(idls: AnchorIDL[], programIds?: string[]): void {
    for (let i = 0; i < idls.length; i++) {
      const idl = idls[i];
      const programId = programIds?.[i];
      
      try {
        this.register(idl, programId);
      } catch (e) {
        console.warn(`VersionedDecoderRegistry.registerMany(): skipping IDL[${i}]: ${e}`);
      }
    }
  }
  
  /**
   * Set fallback registry for unknown programs.
   * Use sparingly - prefer explicit program registration.
   */
  setFallback(registry: DecoderRegistry): void {
    this.fallback = registry;
  }
  
  // ─────────────────────────────────────────────
  // DECODING
  // ─────────────────────────────────────────────
  
  /**
   * Decode with program context (preferred).
   * Falls back to unified registry if program not found.
   */
  decode(raw: Buffer, ctx: DecodeContext): DecodeResult | null {
    const entry = this.byProgramId.get(ctx.programId);
    
    if (entry) {
      const result = entry.registry.decode(raw);
      if (result) {
        return {
          ...result,
          programId: ctx.programId,
          idlVersion: entry.idlVersion,
        };
      }
      return null;
    }
    
    // Fallback path
    for (const entry of this.anonymous) {
  const result = entry.registry.decode(raw);
  if (result) {
    return {
      ...result,
      programId: ctx.programId,
      idlVersion: entry.idlVersion,
    };
  }
}

    
    return null;
  }
  
  /**
   * Decode base64 with program context.
   */
  decodeBase64(b64: string, ctx: DecodeContext): DecodeResult | null {
    const raw = Buffer.from(b64, 'base64');
    return this.decode(raw, ctx);
  }
  
  /**
   * Decode event specifically (program-scoped).
   */
  decodeEvent(raw: Buffer, programId: string): { name: string; data: Record<string, unknown> } | null {
    const entry = this.byProgramId.get(programId);
    if (!entry) {
      return this.fallback?.decodeEvent(raw) ?? null;
    }
    return entry.registry.decodeEvent(raw);
  }
  
  // ─────────────────────────────────────────────
  // INTROSPECTION
  // ─────────────────────────────────────────────
  
  /**
   * Check if a program is registered.
   */
  hasProgram(programId: string): boolean {
    return this.byProgramId.has(programId);
  }
  
  /**
   * Get entry for a program.
   */
  getEntry(programId: string): VersionedRegistryEntry | undefined {
    return this.byProgramId.get(programId);
  }
  
  /**
   * List all registered programs.
   */
  listPrograms(): Array<{ programId: string; idlName: string; idlVersion: string }> {
    return [...this.byProgramId.values()].map(e => ({
      programId: e.programId,
      idlName: e.idlName,
      idlVersion: e.idlVersion,
    }));
  }
  
  /**
   * List events for a specific program.
   */
  listEvents(programId: string): Array<[string, string]> {
    const entry = this.byProgramId.get(programId);
    if (!entry) return [];
    return entry.registry.listEvents();
  }
  
  /**
   * List all events across all programs (for debugging).
   */
  listAllEvents(): Array<{ programId: string; name: string; discriminator: string }> {
    const results: Array<{ programId: string; name: string; discriminator: string }> = [];
    
    for (const [programId, entry] of this.byProgramId) {
      for (const [name, disc] of entry.registry.listEvents()) {
        results.push({ programId, name, discriminator: disc });
      }
    }
    
    return results;
  }
  
  // ─────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────
  
  /**
   * Compute deterministic hash of IDL for deduplication.
   */
  private hashIdl(idl: AnchorIDL): string {
    // Hash the JSON representation (stable enough for our purposes)
    const content = JSON.stringify({
      name: idl.name,
      version: idl.version,
      instructions: idl.instructions,
      accounts: idl.accounts,
      events: idl.events,
      types: idl.types,
    });
    
    return createHash('sha256').update(content).digest('hex').slice(0, 16);
  }
  
  /**
   * Clear all registrations (for testing).
   */
  clear(): void {
    this.byProgramId.clear();
    this.byIdlHash.clear();
    this.fallback = null;
  }
}

// =============================================================================
// FACTORY
// =============================================================================

/**
 * Create a versioned registry from IDLs with known program addresses.
 */
export function createVersionedRegistry(
  idls: AnchorIDL[],
  programIds?: string[]
): VersionedDecoderRegistry {
  const registry = new VersionedDecoderRegistry();
  registry.registerMany(idls, programIds);
  return registry;
}

// =============================================================================
// LAZY SINGLETON (explicit init required)
// =============================================================================

let _versionedRegistry: VersionedDecoderRegistry | null = null;

/**
 * Get the versioned registry singleton.
 * Must be initialized with initVersionedRegistry() first.
 */
export function getVersionedRegistry(): VersionedDecoderRegistry {
  if (!_versionedRegistry) {
    throw new Error(
      'VersionedDecoderRegistry not initialized. Call initVersionedRegistry() first.'
    );
  }
  return _versionedRegistry;
}

/**
 * Initialize the versioned registry singleton.
 */
export function initVersionedRegistry(
  idls: AnchorIDL[],
  programIds?: string[]
): VersionedDecoderRegistry {
  _versionedRegistry = createVersionedRegistry(idls, programIds);
  return _versionedRegistry;
}

/**
 * Check if versioned registry is initialized.
 */
export function isVersionedRegistryInitialized(): boolean {
  return _versionedRegistry !== null;
}
