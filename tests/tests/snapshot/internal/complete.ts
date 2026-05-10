import { Path } from '../../../src/lib/path'
import { getSimilarity } from './getSimilarity'

export interface Args {
  record: boolean
  currentSnapshotPath: Path
  actualSnapshotPath: Path
}

export function complete(actual: string, args: Args) {
  if (args.record) {
    args.currentSnapshotPath.writeText(actual)
    return
  }

  const expected = args.currentSnapshotPath.readText()

  if (actual === expected) {
    console.log('INFO: OK')
    if (args.actualSnapshotPath.exists()) {
      args.actualSnapshotPath.unlink()
    }
    return
  }

  args.actualSnapshotPath.writeText(actual)
  const similarity = getSimilarity(actual, expected).toFixed(2)
  console.log(`ERROR: Snapshot mismatch: ${similarity === '100.00' ? '99.99' : similarity}%`)
  console.log(`- actual:   ${args.actualSnapshotPath}`)
  console.log(`- expected: ${args.currentSnapshotPath}`)
}
