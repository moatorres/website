'use client'

import { Button } from '@shadcn/ui'
import {
  File,
  FileBraces,
  FileCode,
  FileSliders,
  FileText,
  X,
} from 'lucide-react'

import { useEditorTabs } from '../atoms/editor-tabs'

interface EditorTabsProps {
  files?: Record<string, string>
}

export function EditorTabs({ files }: EditorTabsProps) {
  const { openTabs, activeTab, switchTab, closeTab } = useEditorTabs()

  const getFileName = (path: string) => {
    return path.split('/').pop() || path
  }

  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()
    switch (ext) {
      case 'tsx':
      case 'jsx':
      case 'ts':
      case 'js':
        return <FileCode className="w-3.5 h-3.5 stroke-blue-300" />
      case 'css':
        return <FileSliders className="w-3.5 h-3.5 stroke-indigo-300" />
      case 'json':
        return <FileBraces className="w-3.5 h-3.5 stroke-amber-300/70" />
      case 'md':
        return <FileText className="w-3.5 h-3.5 stroke-green-300" />
      default:
        return <File className="w-3.5 h-3.5" />
    }
  }

  if (openTabs.length === 0) {
    return null
  }

  return (
    <div className="h-10 border-b border-border/50 flex items-center overflow-x-auto scrollbar-hide bg-background/50">
      <div className="flex items-center h-full">
        {openTabs.map((path) => {
          const isActive = path === activeTab

          // TODO: Track actual modifications
          const isModified = files && files[path] === undefined

          return (
            <div
              key={path}
              onClick={() => switchTab(path)}
              className={`
                group flex items-center gap-2 px-3 h-full border-r border-border/50
                cursor-pointer transition-colors relative
                ${isActive ? 'bg-background text-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}
              `}
            >
              {/* Active tab indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
              )}

              <span className="text-sm">{getFileIcon(path)}</span>
              <span className="text-sm font-medium max-w-[120px] truncate">
                {getFileName(path)}
              </span>

              {/* Modified indicator */}
              {isModified && !isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}

              {/* Close button */}
              <Button
                size="icon"
                variant="ghost"
                className={`
                  h-4 w-4 p-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity
                  hover:bg-primary/20 hover:text-primary
                `}
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(path)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
