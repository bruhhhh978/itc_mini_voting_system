import type { SuiObjectResponse } from '@mysten/sui/client';

export function vecU8ToUtf8(v: unknown): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return new TextDecoder().decode(Uint8Array.from(v.map((x) => Number(x))));
  return '';
}

export function parseOptionAddress(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v !== null && 'Some' in v) {
    const some = (v as { Some?: unknown }).Some;
    if (typeof some === 'string') return some;
  }
  if (typeof v === 'object' && v !== null && 'fields' in v) {
    const f = (v as { fields?: { vec?: unknown[] } }).fields;
    const vec = f?.vec;
    if (Array.isArray(vec) && vec.length > 0) {
      const first = vec[0];
      if (typeof first === 'string') return first;
    }
  }
  return null;
}

export function normalizeObjectIdField(v: unknown): string | null {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && 'id' in v) {
    const id = (v as { id: unknown }).id;
    if (typeof id === 'string') return id;
  }
  return null;
}

export function getMoveObjectFields(resp: SuiObjectResponse): Record<string, unknown> | null {
  const c = resp.data?.content;
  if (!c || c.dataType !== 'moveObject') return null;
  if (!('fields' in c)) return null;
  return c.fields as Record<string, unknown>;
}

export function parseU64(v: unknown): bigint {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number') return BigInt(Math.trunc(v));
  if (typeof v === 'string') return BigInt(v);
  return 0n;
}
