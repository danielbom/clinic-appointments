import { ZodSafeParse } from './vitest'
import _ from 'lodash'

expect.extend({
  toParseZod(received: object, schema: ZodSafeParse<any>) {
    const result = schema.safeParse(received)
    if (result.success) {
      return {
        message: () => `Expected match zod schema fail but it succeeds`,
        pass: true,
      }
    } else {
      return {
        message: () => `Expected match zod schema but got errors: ${result.error}`,
        pass: false,
      }
    }
  },
  members(received: object, fields: string[]) {
    const keys = _.keys(received)
    const diff = _.difference(keys, fields)
    if (diff.length === 0) {
      return {
        message: () => `Expected ${keys} not to be ${fields}`,
        pass: true,
      }
    } else {
      return {
        message: () => `Expected ${keys} to be ${fields}`,
        pass: false,
      }
    }
  },
  toLossyBe(received, expected, fields: string[]) {
    const a = _.entries(_.pick(received, fields))
    const b = _.entries(_.pick(expected, fields))
    const pass = _.some(fields, (key) => this.equals(expected[key], received[key]))
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${this.utils.printReceived(a)} not to ${this.utils.printExpected(b)}`
          : `Expected ${this.utils.printReceived(a)} to ${this.utils.printExpected(b)}`,
    }
  },
})
