export type Res<TOk, TError> = { ok: true; value: TOk } | { ok: false; error: TError }
