'use client'

import { Editor, Monaco, type OnMount } from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef } from 'react'

import { setupWorkspaceFormatters } from '../services/formatters'
import { monacoThemeDark, monacoThemeLight } from '../services/themes'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  onSave?: (value: string) => void
  language: string
  filePath: string
  onMonacoReady?: (monaco: Monaco) => void
}

export function CodeEditor({
  value,
  onChange,
  onSave,
  language,
  filePath,
  onMonacoReady,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const { resolvedTheme } = useTheme()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleEditorDidMount: OnMount = async (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    if (onMonacoReady) {
      onMonacoReady(monaco)
      await setupWorkspaceFormatters(monaco)
    }

    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2015,
      allowNonTsExtensions: true,
    })

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      allowJs: true,
      allowNonTsExtensions: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      exactOptionalPropertyTypes: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleDetection: 'force',
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      resolveJsonModule: true,
      skipLibCheck: true,
      strict: true,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      types: ['node'],
    })

    monaco.editor.defineTheme('monaco-theme-light', monacoThemeLight)
    monaco.editor.defineTheme('monaco-theme-dark', monacoThemeDark)
    monaco.editor.setTheme(
      resolvedTheme === 'dark' ? 'monaco-theme-dark' : 'monaco-theme-light'
    )

    editor.addAction({
      id: 'format-and-save',
      label: 'Format and Save',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: async (ed) => {
        // Format first
        await ed.getAction('editor.action.formatDocument')?.run()

        // Get formatted content
        const formattedContent = ed.getValue()

        // Save
        if (onSave) {
          onSave(formattedContent)
        }
      },
    })
  }

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      monacoRef.current.editor.setTheme(
        resolvedTheme === 'dark' ? 'monaco-theme-dark' : 'monaco-theme-light'
      )
    }
  }, [resolvedTheme])

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) return

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Set new timer to save after 1 second of inactivity
      debounceTimerRef.current = setTimeout(() => {
        onChange(value)
        debounceTimerRef.current = null
      }, 1000)
    },
    [onChange]
  )

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        value={value}
        path={filePath}
        language={language}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={
          resolvedTheme === 'dark' ? 'monaco-theme-dark' : 'monaco-theme-light'
        }
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          fontFamily: 'Geist Mono, monospace',
          fontLigatures: true,
          formatOnPaste: true,
          formatOnType: false,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          quickSuggestions: {
            comments: false,
            other: true,
            strings: true,
          },
          suggestOnTriggerCharacters: true,
        }}
      />
    </div>
  )
}
