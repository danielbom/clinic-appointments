type RawData = number | string | boolean | { [key: string]: RawData } | RawData[]

type CachedItem = {
  expiresAt: number
  staleUntil: number
  data: RawData
}

type GetOrLoad<T extends RawData> = {
  key: string
  // Cache fresh duration, in milliseconds.
  ttl: number
  // Additional stale-while-revalidate duration, in milliseconds.
  staleTtl: number
  // Maximum time a caller waits for the loader, in milliseconds.
  timeout: number
  now?: number
  task: (signal: AbortSignal) => Promise<T>
}

type Flight<T extends RawData> = {
  promise: Promise<T>
  controller: AbortController
}

export class LocalCache {
  private readonly items = new Map<string, CachedItem>()

  /**
   * Contains the actual loader Promise.
   *
   * Important:
   * this Promise is removed only when the actual loader finishes.
   * A caller timing out does not remove it.
   */
  private readonly inflight = new Map<string, Flight<RawData>>()

  /**
   * Optional failure cooldown.
   *
   * Prevents an immediately failing loader from being retried
   * continuously by a stream of requests.
   */
  private readonly retryAfter = new Map<string, number>()

  public get<T extends RawData>(key: string, now = Date.now()): T | undefined {
    const item = this.items.get(key)

    if (!item) {
      return undefined
    }

    if (item.expiresAt <= now) {
      return undefined
    }

    return item.data as T
  }

  public set(key: string, ttl: number, staleTtl: number, data: RawData, now = Date.now()): void {
    this.items.set(key, {
      expiresAt: now + ttl,
      staleUntil: now + ttl + staleTtl,
      data,
    })
  }

  public async getOrLoad<T extends RawData>(options: GetOrLoad<T>): Promise<T> {
    const now = options.now ?? Date.now()
    const item = this.items.get(options.key)

    // 1. FRESH
    if (item && item.expiresAt > now) {
      return item.data as T
    }

    // 2. STALE
    //
    // Return stale immediately.
    // Start at most one background refresh.
    if (item && item.staleUntil > now) {
      this.startRefresh(options)
      return item.data as T
    }

    // 3. EXPIRED / MISSING
    //
    // There is no usable cache value, so the caller must wait.
    // All concurrent callers share the same loader.
    return this.load(options)
  }

  private startRefresh<T extends RawData>({ key, ttl, staleTtl, timeout, task }: GetOrLoad<T>): void {
    // Existing loader already owns the refresh.
    if (this.inflight.has(key)) {
      return
    }

    // Optional failure backoff.
    if (this.isInRetryCooldown(key)) {
      return
    }

    const flight = this.createFlight(task)
    this.inflight.set(key, flight)
    void this.finishFlight({ key, ttl, staleTtl, flight })

    // The timeout is deliberately not awaited here.
    //
    // This is a background refresh.
    void timeout
  }

  private async load<T extends RawData>({ key, ttl, staleTtl, timeout, task }: GetOrLoad<T>): Promise<T> {
    const existing = this.inflight.get(key)

    // Existing single-flight
    if (existing) {
      return this.waitWithTimeout<T>(existing.promise as Promise<T>, timeout)
    }

    // Failure cooldown
    if (this.isInRetryCooldown(key)) {
      throw new Error(`Cache loader temporarily unavailable: ${key}`)
    }

    // Create exactly one loader.
    const flight = this.createFlight(task)
    this.inflight.set(key, flight)
    void this.finishFlight({ key, ttl, staleTtl, flight })

    // Important:
    //
    // timeout applies only to this caller.
    // It does NOT remove inflight.
    return this.waitWithTimeout(flight.promise, timeout)
  }

  private createFlight<T extends RawData>(task: (signal: AbortSignal) => Promise<T>): Flight<T> {
    const controller = new AbortController()

    const promise = Promise.resolve().then(() => task(controller.signal))

    return {
      promise,
      controller,
    }
  }

  private async finishFlight<T extends RawData>({
    key,
    ttl,
    staleTtl,
    flight,
  }: {
    key: string
    ttl: number
    staleTtl: number
    flight: Flight<T>
  }): Promise<void> {
    try {
      const data = await flight.promise

      this.set(key, ttl, staleTtl, data)

      // Successful load removes any previous failure cooldown.
      this.retryAfter.delete(key)
    } catch (_error) {
      // Record failure to avoid immediate retry storms.
      this.setRetryCooldown(key)
    } finally {
      // Identity check prevents an old flight from deleting a newer one.
      if (this.inflight.get(key) === flight) {
        this.inflight.delete(key)
      }
    }
  }

  private waitWithTimeout<T extends RawData>(promise: Promise<T>, timeout: number): Promise<T> {
    if (timeout <= 0) {
      return promise
    }

    return new Promise<T>((resolve, reject) => {
      let settled = false

      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        reject(new Error(`Cache loader timeout`))
      }, timeout)

      promise.then(
        (value) => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          resolve(value)
        },
        (error) => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          reject(error)
        },
      )
    })
  }

  private isInRetryCooldown(key: string): boolean {
    const retryAt = this.retryAfter.get(key)

    if (retryAt === undefined) {
      return false
    }

    if (retryAt <= Date.now()) {
      this.retryAfter.delete(key)
      return false
    }

    return true
  }

  private setRetryCooldown(key: string): void {
    // Example: don't retry a failed loader for 1 second.
    //
    // In production this can use exponential backoff with jitter.
    this.retryAfter.set(key, Date.now() + 1000)
  }

  /**
   * Useful when the process is shutting down.
   *
   * This is the point where we intentionally cancel running loaders.
   */
  public abortAll(): void {
    for (const flight of this.inflight.values()) {
      flight.controller.abort()
    }
  }

  public clear(key?: string): void {
    if (key === undefined) {
      this.items.clear()
      return
    }

    this.items.delete(key)
  }
}
