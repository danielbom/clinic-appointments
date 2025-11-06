// @ts-check
import path from 'path'
import fs from 'fs'

const dirname = path.resolve(import.meta.dirname)
const queriesDir = path.resolve(dirname, 'queries')
const generatedQueriesDir = path.resolve(dirname, 'generated', 'queries')
const outputQueriesDir = path.resolve(dirname, 'src', 'db', 'queries')

if (!fs.existsSync(generatedQueriesDir)) fs.mkdirSync(generatedQueriesDir)

const queriesPaths = fs.readdirSync(queriesDir)

// Warn any inconsistent argument name
for (const queryName of queriesPaths) {
  const inputPath = path.resolve(queriesDir, path.basename(queryName))
  const args = Array.from(fs.readFileSync(inputPath, { encoding: 'utf-8' }).matchAll(/sqlc.arg\('(\w+)'\)/g), (re) => re[1])
  for (const arg of args) {
    if (arg.includes('_')) {
      console.warn(`[WARNING]: field '${arg}' with underscore in ${inputPath}`)
    }
  }
}

// Transform kjconroy/sqlc into pgtyped format
// Collect all query modules
const modules = []
for (const queryName of queriesPaths) {
  modules.push(path.basename(queryName).replace(/.sql$/, '.ts'))
  const inputPath = path.resolve(queriesDir, path.basename(queryName))
  const outputPath = path.resolve(generatedQueriesDir, path.basename(queryName))
  const content = fs.readFileSync(inputPath, { encoding: 'utf-8' })
  const generated = content //
    .replaceAll(/^-- name: (\S+).*/gm, '/* @name $1 */')
    .replaceAll(/sqlc.arg\('(\w+)'\)/g, ':$1')
  fs.writeFileSync(outputPath, generated)
  console.log(`[INFO] Processed ${inputPath} -> ${outputPath}`)
}

// Export query modules
fs.writeFileSync(
  path.resolve(outputQueriesDir, 'index.ts'),
  modules
    .map((name) => name.split('.')[0])
    .map((name) => `export * as ${name.replace('_queries', '')} from './${name}'`)
    .join('\n') + '\n',
)
