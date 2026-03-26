import 'vitest'
import { ZodSafeParseResult } from 'zod'

interface ZodSafeParse<T> {
  safeParse(value: unknown): ZodSafeParseResult<T>
}

declare module 'vitest' {
  interface Assertion<T = any> {
    /// strict
    // toLossyBe(expected: Partial<T>, fields: string[]): void
    // toParseZod(schema: ZodSafeParse<T>): void

    /// lossy
    toLossyBe(expected: Partial<any>, fields: string[]): void
    toParseZod(schema: ZodSafeParse<any>): void
  }
}
