'use client'

import type { Monaco } from '@monaco-editor/react'
import type { editor, IRange, languages } from 'monaco-editor'

/**
 * Dynamic auto-imports for the playground editor.
 *
 * Monaco's built-in TS integration never suggests symbols that are not yet
 * imported: its suggest adapter queries the language service without
 * `includeCompletionsForModuleExports` and drops the code actions that carry
 * the import edit. This module pairs with public/monaco/ts-custom-worker.js
 * (loaded via `customWorkerPath`) to expose those capabilities:
 *
 * - the worker returns completion entries for every export reachable from
 *   the project files and loaded type definitions (`entry.source` set)
 * - `resolveCompletionItem` asks the language service for the entry details
 *   and converts its code actions into `additionalTextEdits` — the dynamic
 *   equivalent of a hardcoded `import { x } from 'y'` text edit
 *
 * Only entries that require an import action are returned here; everything
 * already in scope keeps coming from the built-in provider, so there are no
 * duplicate suggestions.
 */

// --- minimal shapes of the TS language service results we consume ---

interface TsCompletionEntry {
  name: string
  kind: string
  sortText: string
  insertText?: string
  source?: string
  hasAction?: boolean
  data?: unknown
}

interface TsSymbolDisplayPart {
  text: string
}

interface TsTextChange {
  span: { start: number; length: number }
  newText: string
}

interface TsCodeAction {
  description: string
  changes: { fileName: string; textChanges: TsTextChange[] }[]
}

interface TsCompletionEntryDetails {
  displayParts?: TsSymbolDisplayPart[]
  documentation?: TsSymbolDisplayPart[]
  codeActions?: TsCodeAction[]
}

interface AutoImportWorker {
  getCompletionsAtPositionAutoImport(
    fileName: string,
    offset: number
  ): Promise<{ entries: TsCompletionEntry[] } | undefined>
  getCompletionEntryDetailsAutoImport(
    fileName: string,
    offset: number,
    entryName: string,
    source: string | undefined,
    data: unknown
  ): Promise<TsCompletionEntryDetails | undefined>
}

type AutoImportItem = languages.CompletionItem & {
  autoImport?: {
    uri: string
    offset: number
    name: string
    source: string
    data: unknown
  }
}

const initialized = new WeakSet<object>()

export function setupAutoImports(monaco: Monaco) {
  if (initialized.has(monaco)) return
  initialized.add(monaco)

  const customWorkerPath = `${window.location.origin}/monaco/ts-custom-worker.js`
  monaco.languages.typescript.typescriptDefaults.setWorkerOptions({
    customWorkerPath,
  })
  monaco.languages.typescript.javascriptDefaults.setWorkerOptions({
    customWorkerPath,
  })

  const provider = createAutoImportProvider(monaco)
  monaco.languages.registerCompletionItemProvider('typescript', provider)
  monaco.languages.registerCompletionItemProvider('javascript', provider)

  const pathProvider = createImportPathProvider(monaco)
  monaco.languages.registerCompletionItemProvider('typescript', pathProvider)
  monaco.languages.registerCompletionItemProvider('javascript', pathProvider)
}

async function getWorkerClient(
  monaco: Monaco,
  model: editor.ITextModel
): Promise<AutoImportWorker> {
  const getWorker =
    model.getLanguageId() === 'javascript'
      ? await monaco.languages.typescript.getJavaScriptWorker()
      : await monaco.languages.typescript.getTypeScriptWorker()

  return (await getWorker(model.uri)) as unknown as AutoImportWorker
}

function createAutoImportProvider(
  monaco: Monaco
): languages.CompletionItemProvider {
  return {
    async provideCompletionItems(model, position) {
      const client = await getWorkerClient(monaco, model)
      const offset = model.getOffsetAt(position)
      const info = await client.getCompletionsAtPositionAutoImport(
        model.uri.toString(),
        offset
      )
      if (!info) return { suggestions: [] }

      const word = model.getWordUntilPosition(position)
      const range: IRange = {
        startLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: word.endColumn,
      }

      const suggestions: AutoImportItem[] = info.entries
        .filter((entry) => entry.source && entry.hasAction)
        .map((entry) => ({
          label: {
            label: entry.name,
            description: formatSource(entry.source!),
          },
          kind: mapKind(monaco, entry.kind),
          insertText: entry.insertText ?? entry.name,
          filterText: entry.name,
          sortText: entry.sortText,
          range,
          autoImport: {
            uri: model.uri.toString(),
            offset,
            name: entry.name,
            source: entry.source!,
            data: entry.data,
          },
        }))

      return { suggestions, incomplete: true }
    },

    async resolveCompletionItem(item) {
      const meta = (item as AutoImportItem).autoImport
      if (!meta) return item

      const model = monaco.editor.getModel(monaco.Uri.parse(meta.uri))
      if (!model) return item

      const client = await getWorkerClient(monaco, model)
      const details = await client.getCompletionEntryDetailsAutoImport(
        meta.uri,
        meta.offset,
        meta.name,
        meta.source,
        meta.data
      )
      if (!details) return item

      const codeActions = details.codeActions ?? []

      // import statement edits computed by the TS language service
      const additionalTextEdits = codeActions.flatMap((action) =>
        action.changes
          .filter((change) => change.fileName === meta.uri)
          .flatMap((change) =>
            change.textChanges.map((tc) => ({
              range: monaco.Range.fromPositions(
                model.getPositionAt(tc.span.start),
                model.getPositionAt(tc.span.start + tc.span.length)
              ),
              text: tc.newText,
            }))
          )
      )

      return {
        ...item,
        detail:
          codeActions.map((action) => action.description).join('\n') ||
          partsToString(details.displayParts),
        documentation: { value: partsToString(details.documentation) },
        additionalTextEdits,
      }
    },
  }
}

/**
 * Completions inside import-specifier strings: `import x from '|'`.
 *
 * Monaco's TS worker cannot provide these — TypeScript computes module
 * specifier completions by enumerating directories through the host's
 * `readDirectory`/`getDirectories`, which the worker host doesn't implement
 * over extraLibs. The main thread has better sources anyway: the mirrored
 * project models (relative paths) and the project's package.json (packages).
 */
const IMPORT_STRING_PATTERN =
  /(?:from\s+|import\s+|import\s*\(\s*|require\s*\(\s*)(['"])([^'"]*)$/

const STRIP_EXTENSION_PATTERN = /\.(ts|tsx|js|jsx)$/

function createImportPathProvider(
  monaco: Monaco
): languages.CompletionItemProvider {
  return {
    triggerCharacters: ["'", '"', '/'],

    provideCompletionItems(model, position) {
      const textBefore = model
        .getLineContent(position.lineNumber)
        .slice(0, position.column - 1)

      const match = textBefore.match(IMPORT_STRING_PATTERN)
      if (!match) return { suggestions: [] }

      const typed = match[2]
      const lastSlash = typed.lastIndexOf('/')
      const segment = typed.slice(lastSlash + 1)

      // complete only the segment after the last slash; '/' retriggers
      const range: IRange = {
        startLineNumber: position.lineNumber,
        startColumn: position.column - segment.length,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      }

      const suggestions = typed.startsWith('.')
        ? relativePathSuggestions(monaco, model, typed, lastSlash, range)
        : packageSuggestions(monaco, range)

      return { suggestions }
    },
  }
}

function relativePathSuggestions(
  monaco: Monaco,
  model: editor.ITextModel,
  typed: string,
  lastSlash: number,
  range: IRange
): languages.CompletionItem[] {
  const kinds = monaco.languages.CompletionItemKind
  const fromDir = model.uri.path.split('/').slice(0, -1).join('/')
  const typedDir = lastSlash === -1 ? '.' : typed.slice(0, lastSlash)
  const baseDir = resolvePath(fromDir, typedDir)

  const suggestions: languages.CompletionItem[] = []
  const seenDirs = new Set<string>()

  for (const candidate of monaco.editor.getModels()) {
    if (candidate.uri.scheme !== 'file') continue

    const path = candidate.uri.path
    if (path.startsWith('/node_modules/')) continue
    if (path === model.uri.path) continue
    if (!path.startsWith(`${baseDir}/`)) continue

    const rest = path.slice(baseDir.length + 1)
    const slash = rest.indexOf('/')

    if (slash === -1) {
      const name = rest.replace(STRIP_EXTENSION_PATTERN, '')
      suggestions.push({
        label: rest,
        kind: kinds.File,
        insertText: name,
        sortText: `1${rest}`,
        range,
      })
    } else {
      const dir = rest.slice(0, slash)
      if (seenDirs.has(dir)) continue
      seenDirs.add(dir)
      suggestions.push({
        label: `${dir}/`,
        kind: kinds.Folder,
        insertText: `${dir}/`,
        sortText: `0${dir}`,
        range,
        command: { id: 'editor.action.triggerSuggest', title: 'suggest' },
      })
    }
  }

  return suggestions
}

function packageSuggestions(
  monaco: Monaco,
  range: IRange
): languages.CompletionItem[] {
  const kinds = monaco.languages.CompletionItemKind
  const pkgModel = monaco.editor.getModel(
    monaco.Uri.parse('file:///package.json')
  )
  if (!pkgModel) return []

  let dependencies: Record<string, string>
  try {
    const pkg = JSON.parse(pkgModel.getValue())
    dependencies = { ...pkg.dependencies, ...pkg.devDependencies }
  } catch {
    return []
  }

  return Object.entries(dependencies).map(([name, version]) => ({
    label: name,
    kind: kinds.Module,
    detail: version,
    insertText: name,
    range,
  }))
}

function resolvePath(base: string, relative: string): string {
  const parts = base.split('/').filter(Boolean)
  for (const segment of relative.split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') parts.pop()
    else parts.push(segment)
  }
  return `/${parts.join('/')}`
}

function partsToString(parts?: TsSymbolDisplayPart[]): string {
  return (parts ?? []).map((part) => part.text).join('')
}

function formatSource(source: string): string {
  return source
    .replace(/^file:\/\/\//, '')
    .replace(/^\//, '')
    .replace(/^node_modules\//, '')
}

function mapKind(monaco: Monaco, kind: string): languages.CompletionItemKind {
  const kinds = monaco.languages.CompletionItemKind
  switch (kind) {
    case 'function':
    case 'local function':
      return kinds.Function
    case 'method':
    case 'construct':
      return kinds.Method
    case 'class':
      return kinds.Class
    case 'interface':
      return kinds.Interface
    case 'type':
    case 'alias':
    case 'type parameter':
      return kinds.TypeParameter
    case 'enum':
      return kinds.Enum
    case 'enum member':
      return kinds.EnumMember
    case 'module':
      return kinds.Module
    case 'const':
      return kinds.Constant
    case 'var':
    case 'let':
    case 'local var':
      return kinds.Variable
    case 'property':
    case 'getter':
    case 'setter':
      return kinds.Field
    default:
      return kinds.Property
  }
}

const PROJECT_FILE_PATTERN = /\.(ts|tsx|js|jsx|json|css|html)$/

/**
 * Mirror the project files into Monaco models so the language service sees
 * fresh cross-file content (completions, auto-imports, peek/goto). The model
 * behind the open editor is owned by @monaco-editor/react and is skipped.
 */
export function syncProjectModels(
  monaco: Monaco,
  files: Record<string, string>,
  openPath: string
) {
  for (const [path, content] of Object.entries(files)) {
    if (!PROJECT_FILE_PATTERN.test(path)) continue

    const uri = monaco.Uri.parse(`file:///${path}`)
    const model = monaco.editor.getModel(uri)

    if (!model) {
      monaco.editor.createModel(content, undefined, uri)
    } else if (path !== openPath && model.getValue() !== content) {
      model.setValue(content)
    }
  }

  // drop models for deleted project files (never touch node_modules — those
  // models back peek/goto-definition into loaded type definitions)
  for (const model of monaco.editor.getModels()) {
    if (model.uri.scheme !== 'file') continue

    const path = model.uri.path.replace(/^\//, '')

    if (
      path !== openPath &&
      !path.startsWith('node_modules/') &&
      PROJECT_FILE_PATTERN.test(path) &&
      files[path] === undefined
    ) {
      model.dispose()
    }
  }
}
