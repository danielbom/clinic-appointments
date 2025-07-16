import { AxiosError, AxiosResponse } from 'axios'

export class AssertResponseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = AssertResponseError.name
  }
}
export class Asserter<T> {
  constructor(private res: Promise<AxiosResponse<T>>) {}

  assert(valid: (res: AxiosResponse<T>) => boolean, message: string) {
    this.res = this.res.then((res) => {
      if (!valid(res)) throw new AssertResponseError(message)
      return res
    })
    return this
  }

  assertBody = (valid: (res: any) => boolean, message: string) => this.assert((res) => valid(res.data), message)

  statusCode = (code: number) => this.assert((res) => res.status === code, `expect status code ${code}`)

  bodyNumber = (count: number) => this.assertBody((data) => data === count, `body != ${count}`)

  bodyLength = (validLen: (len: number) => boolean) => this.assertBody((data) => validLen(data.length), `${validLen}`)

  undefinedField = (field: string) => this.assertBody((data) => data[field] === undefined, `body.${field} != undefined`)

  equalFields = (other: Record<string, any>, fields: string[]) =>
    this.assertBody((data) => fields.every((field) => data[field] === other[field]), `'${fields}' not equal`)

  notEqualFields = (other: Record<string, any>, fields: string[]) =>
    this.assertBody((data) => fields.every((field) => data[field] !== other[field]), `'${fields}' equal`)

  equalValue = (field: string, value: any) =>
    this.assertBody((data) => data[field] === value, `'${field}' not equal ${value}`)

  notEqualValue = (field: string, value: any) =>
    this.assertBody((data) => data[field] !== value, `'${field}' equal ${value}`)

  compare = (data: any, fields: string[], differents: string[]) =>
    this.assertBody(
      (res) =>
        fields.every((field) =>
          differents.includes(field) //
            ? data[field] !== res[field]
            : data[field] === res[field],
        ),
      'inconsistent fields',
    )

  // extends Promise
  then = (onfulfilled: (res: AxiosResponse<T>) => any, onRejected?: (err: AxiosError) => any) => {
    this.res = this.res.then(onfulfilled, onRejected)
    return this
  }

  catch = (onRejected: (err: AxiosError) => any) => {
    this.res = this.res.catch(onRejected)
    return this
  }

  map<U>(mapBody: (res: T) => U) {
    return new Asserter<U>(
      this.res.then((res) => {
        const u = mapBody(res.data)
        const newRes = { ...res, data: u } as AxiosResponse<U>
        Object.setPrototypeOf(newRes, Object.getPrototypeOf(res))
        return newRes
      }),
    )
  }
}

export function a<T = any>(res: Promise<AxiosResponse<T>>) {
  return new Asserter(res)
}
