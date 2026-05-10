export interface Writable {
  write(text: string): void
}

export class WriteStr implements Writable {
  buffer: string[] = []

  write(text: string): void {
    this.buffer.push(text)
  }

  value(): string {
    return this.buffer.join('')
  }
}

export class WriteStdout implements Writable {
  write(text: string): void {
    process.stdout.write(text)
  }
}

export class WriteCombined implements Writable {
  constructor(private writes: Writable[]) {}

  write(text: string): void {
    this.writes.forEach((w) => w.write(text))
  }
}
