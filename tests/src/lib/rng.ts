function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class Random {
  constructor(public random: () => number) {}

  integer(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min
  }

  range(start: number, end: number, step: number): number {
    const min = start / step
    const max = end / step
    return this.integer(min, max) * step
  }

  date(minYear: number, maxYear: number): string {
    const year = this.integer(minYear, maxYear)
    const month = this.integer(1, 12).toString().padStart(2, '0')
    const day = this.integer(1, 28).toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  choice<T>(xs: T[]): T {
    const i = this.integer(0, xs.length - 1)
    return xs[i]
  }

  choices<T>(n: number, xs: T[]): T[] {
    return Array.from({ length: n }, (_) => this.choice(xs))
  }

  shuffle<T>(xs: T[]) {
    const n = xs.length / 2
    for (let i = 0; i < n; i++) {
      const j = this.integer(i + 1, xs.length - 1)
      const tmp = xs[i]
      xs[i] = xs[j]
      xs[j] = tmp
    }
  }
}

export const rng = {
  mulberry32,
}
