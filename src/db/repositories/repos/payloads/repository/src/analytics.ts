
// ──────────────────────────────────────────────────────
// ANALYTICS
// ──────────────────────────────────────────────────────
import {
  LogPayloadRepository,
  QueryRegistry
} from './imports.js';
import type {AddressLike,IntLike} from './imports.js';
export async function fetchDiscriminatorEvents(
  this:LogPayloadRepository
):
 Promise<Map<string, string[]>> {
    const result = await this.db.query<{ discriminator: string; events: string[] }>(
      QueryRegistry.FETCH_DISCRIMINATOR_EVENTS
    );

    const map = new Map<string, string[]>();
    for (const row of result.rows) {
      map.set(row.discriminator, row.events);
    }
    return map;
  }

 export async function fetchDiscriminatorVersions(
  this:LogPayloadRepository
):
 Promise<Map<string, IntLike>> {
    const result = await this.db.query<{ discriminator: string; versions: IntLike }>(
      QueryRegistry.FETCH_DISCRIMINATOR_VERSIONS
    );

    const map = new Map<string, IntLike>();
    for (const row of result.rows) {
      map.set(row.discriminator, Number(row.versions));
    }
    return map;
  }

export async function fetchDiscriminatorProgramFrequency(
  this:LogPayloadRepository
):
 Promise<
    Map<string, Map<AddressLike, IntLike>>
  > {
    const result = await this.db.query<{
      discriminator: string;
      program_id: AddressLike;
      seen: number;
    }>(QueryRegistry.FETCH_DISCRIMINATOR_PROGRAM_FREQUENCY);

    const map = new Map<string, Map<AddressLike, number>>();
    for (const row of result.rows) {
      if (!map.has(row.discriminator)) {
        map.set(row.discriminator, new Map());
      }
      map.get(row.discriminator)!.set(row.program_id, Number(row.seen));
    }
    return map;
  }

export async function countByProgram(
  this:LogPayloadRepository
):
 Promise<Map<AddressLike, IntLike>> {
    const result = await this.db.query<{ program_id: AddressLike; count: IntLike }>(
      QueryRegistry.COUNT_BY_PROGRAM
    );

    const map = new Map<AddressLike, IntLike>();
    for (const row of result.rows) {
      map.set(row.program_id, Number(row.count));
    }
    return map;
  }

export async function countUnprocessed(
  this:LogPayloadRepository
):
 Promise<IntLike> {
    const result = await this.db.query<{ count: IntLike }>(QueryRegistry.COUNT_UNPROCESSED);
    return Number(result.rows[0]?.count ?? 0);
  }
