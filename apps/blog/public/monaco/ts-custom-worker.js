/**
 * Extends Monaco's TypeScript worker with auto-import-aware completion
 * methods. Loaded inside the worker via
 * `typescriptDefaults.setWorkerOptions({ customWorkerPath })`.
 *
 * The base worker methods are intentionally left untouched so the built-in
 * suggest adapter keeps its default behavior (no duplicate suggestions).
 * The editor registers a dedicated completion provider that calls the
 * *AutoImport methods below — see services/auto-imports.ts.
 */
self.customTSWorkerFactory = (TypeScriptWorker) => {
  const PREFERENCES = {
    includeCompletionsForModuleExports: true,
    includeCompletionsForImportStatements: true,
    includeCompletionsWithInsertText: true,
    allowIncompleteCompletions: true,
    // prefer `import { x } from 'effect'` over 'effect/index' or deep paths
    importModuleSpecifierPreference: 'shortest',
    importModuleSpecifierEnding: 'minimal',
  }

  // matches the editor config (tabSize: 2)
  const FORMAT_OPTIONS = {
    convertTabsToSpaces: true,
    indentSize: 2,
    tabSize: 2,
    newLineCharacter: '\n',
    insertSpaceAfterCommaDelimiter: true,
    insertSpaceBeforeAndAfterBinaryOperators: true,
    insertSpaceAfterKeywordsInControlFlowStatements: true,
  }

  return class AutoImportTSWorker extends TypeScriptWorker {
    getCompletionsAtPositionAutoImport(fileName, position) {
      try {
        return this._languageService.getCompletionsAtPosition(
          fileName,
          position,
          PREFERENCES
        )
      } catch {
        return undefined
      }
    }

    getCompletionEntryDetailsAutoImport(
      fileName,
      position,
      entryName,
      source,
      data
    ) {
      try {
        return this._languageService.getCompletionEntryDetails(
          fileName,
          position,
          entryName,
          FORMAT_OPTIONS,
          source,
          PREFERENCES,
          data
        )
      } catch {
        return undefined
      }
    }
  }
}
