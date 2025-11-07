'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shadcn/ui'
import { Copy, Download, FolderOpen, Package, Save } from 'lucide-react'

interface ToolbarProps {
  projectName: string
  onExportZip: () => void
  onSave: () => void
  onCopy: () => void
  onBack: () => void
  onInstall?: () => void
  isInstalling?: boolean
}

export function Toolbar({
  projectName,
  onExportZip,
  onSave,
  onCopy,
  onBack,
  onInstall,
  isInstalling = false,
}: ToolbarProps) {
  return (
    <div className="h-12 border-b border-border flex items-center px-4 gap-4 bg-card">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground"
      >
        ← Back to Projects
      </Button>

      <div className="flex-1" />

      <h2 className="text-sm font-semibold">{projectName}</h2>

      <div className="flex-1" />

      {onInstall && (
        <Button
          variant="outline"
          size="sm"
          onClick={onInstall}
          disabled={isInstalling}
        >
          {isInstalling ? (
            <>
              <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-2" />
              Installing...
            </>
          ) : (
            <>
              <Package className="w-4 h-4 mr-2" />
              Install & Load Types
            </>
          )}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="w-4 h-4 mr-2" />
            Project
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save to Browser
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExportZip}>
            <Download className="w-4 h-4 mr-2" />
            Export as ZIP
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy All Files
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
