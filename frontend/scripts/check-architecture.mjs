import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const sourceRoot = path.resolve('src')
const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']
const importPattern = /(?:from\s+|import\s*)['"]@\/([^/'"]+)/g
const violations = []

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name)

      if (entry.isDirectory()) return collectFiles(absolutePath)
      if (/\.(ts|tsx)$/.test(entry.name)) return [absolutePath]
      return []
    }),
  )

  return nested.flat()
}

for (const file of await collectFiles(sourceRoot)) {
  const relativePath = path.relative(sourceRoot, file)
  const sourceLayer = relativePath.split(path.sep)[0]
  const sourceRank = layers.indexOf(sourceLayer)

  if (sourceRank === -1) continue

  const content = await readFile(file, 'utf8')

  for (const match of content.matchAll(importPattern)) {
    const targetLayer = match[1]
    const targetRank = layers.indexOf(targetLayer)

    if (targetRank !== -1 && targetRank < sourceRank) {
      violations.push(
        `${relativePath}: ${sourceLayer} cannot import from ${targetLayer}`,
      )
    }
  }
}

if (violations.length > 0) {
  console.error(['Architecture violations:', ...violations].join('\n'))
  process.exit(1)
}

console.log('Architecture boundaries are valid.')
