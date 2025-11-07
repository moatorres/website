import { createStreaming, type Formatter } from '@dprint/formatter'
import { Monaco } from '@monaco-editor/react'

const formatters = new Map<string, Formatter>()

const LOCAL_REGISTRY = '/vendor/dprint/plugins/'

const PLUGIN_REGISTRY: Record<string, string[]> = {
  'json-0.21.0.wasm': ['json'],
  'typescript-0.95.12.wasm': ['typescript', 'javascript'],
}

interface FormatterPlugin {
  language: string
  url: string
}

const plugins: FormatterPlugin[] = Object.entries(PLUGIN_REGISTRY).flatMap(
  ([plugin, languages]) =>
    languages.map((language) => ({ language, url: LOCAL_REGISTRY + plugin }))
)

async function getFormatter(url: string): Promise<Formatter> {
  const cached = formatters.get(url)
  if (cached) return cached

  const formatter = await createStreaming(fetch(url))
  formatters.set(url, formatter)
  return formatter
}

export async function setupWorkspaceFormatters(monaco: Monaco) {
  monaco.editor.addEditorAction({
    id: 'format',
    label: 'Format',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    run: (editor) => {
      const action = editor.getAction('editor.action.formatDocument')
      if (action) action.run()
    },
  })

  for (const { language, url } of plugins) {
    const formatter = await getFormatter(url)

    monaco.languages.registerDocumentFormattingEditProvider(language, {
      provideDocumentFormattingEdits(model) {
        const text = formatter.formatText({
          fileText: model.getValue(),
          filePath: model.uri.toString(),
        })
        return [{ text, range: model.getFullModelRange() }]
      },
    })
  }
}
