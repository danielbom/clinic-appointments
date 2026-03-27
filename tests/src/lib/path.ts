import fs from 'fs'
import path from 'path'

/**
 * Based on Python pathlib.Path class
 */
export class Path {
  private getStats() {
    return fs.statSync(this.path)
  }

  constructor(private path: string) {}

  /**
   * Examples:
   *
   * const __dir__ = Path.from(import.meta.dirname)
   * const __file__ = Path.from(import.meta.filename)
   *
   * @param partialPath
   * @returns
   */
  static from(partialPath: string): Path {
    return new Path(path.resolve(partialPath))
  }

  exists(): boolean {
    return fs.existsSync(this.path)
  }

  parent(): Path {
    return new Path(path.dirname(this.path))
  }

  append(partialPath: string): Path {
    return Path.from(this.path + '/' + partialPath)
  }

  toString(): string {
    return this.path
  }

  value(): string {
    return this.path
  }

  readText(encoding: BufferEncoding = 'utf-8'): string {
    return fs.readFileSync(this.path).toString(encoding)
  }

  writeText(content: string, encoding: BufferEncoding = 'utf-8'): void {
    fs.writeFileSync(this.path, content, { encoding })
  }

  mkdir(options: Mkdir) {
    if (!this.exists()) {
      fs.mkdirSync(this.path, { recursive: options.parents })
    } else if (!options.existsOk) {
      throw new Error(`Path '${this.path}' already exists.`)
    }
  }

  unlink() {
    fs.unlinkSync(this.path)
  }

  rmdir(options: Rmdir) {
    if (!this.exists()) {
      if (options.existsOk) return
      throw new Error(`Path '${this.path}' does not exist.`)
    }

    const stats = this.getStats()

    if (stats.isFile()) {
      fs.unlinkSync(this.path)
      return
    }

    // it's a directory
    if (options.recursive) {
      // prefer fs.rmSync when available, fall back to rmdirSync with recursive
      const rm = (fs as any).rmSync ?? (fs as any).rmdirSync
      rm.call(fs, this.path, { recursive: true })
    } else {
      fs.rmdirSync(this.path)
    }
  }

  isFile() {
    return this.getStats().isFile()
  }

  isDir() {
    return this.getStats().isDirectory()
  }

  suffix() {
    return path.extname(this.path)
  }
}

interface Mkdir {
  parents?: boolean
  existsOk?: boolean
}

interface Rmdir {
  recursive?: boolean
  existsOk?: boolean
}
