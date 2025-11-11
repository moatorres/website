'use client'

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shadcn/ui'
import {
  Code2,
  Copy,
  Download,
  Folders,
  Maximize2,
  Minimize2,
  Monitor,
  Package,
  PanelLeft,
  Play,
  Save,
  TerminalIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { usePanelVisible } from '../atoms/panels'

import { ModeToggle } from './theme-toggle'

interface ToolbarProps {
  onExportZip: () => void
  onSave: () => void
  onCopy: () => void
  onInstall?: () => void
  isInstalling?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  onRunCommand?: () => void
  isRunning?: boolean
  onOpenProjectSelector?: () => void
}

export function Toolbar({
  onExportZip,
  onSave,
  onCopy,
  onInstall,
  isInstalling = false,
  isFullscreen = true,
  onToggleFullscreen,
  onRunCommand,
  isRunning = false,
  onOpenProjectSelector,
}: ToolbarProps) {
  const [mounted, setMounted] = useState(false)
  const [
    isPanelVisible,
    { toggleEditor, toggleExplorer, togglePreview, toggleTerminal },
  ] = usePanelVisible()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-12 py-2 border-b border-border flex items-center px-4 gap-3 bg-background shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-6 h-6 bg-linear-to-br from-primary to-primary/70 rounded-md flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xs">MT</span>
        </div>
        <span className="font-semibold text-xs hidden sm:inline">
          Moa Torres | Editor
        </span>
      </div>

      {/* Project Selector Button */}
      {onOpenProjectSelector && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenProjectSelector}
              className="gap-2 bg-transparent h-7 text-xs"
            >
              <Folders className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline">Projects</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open Project Selector</TooltipContent>
        </Tooltip>
      )}

      <div className="flex-1" />

      {/* Action buttons grouped */}
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {/* Run button */}
          {onRunCommand && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onRunCommand}
                  disabled={isRunning}
                  className="h-7 px-2 gap-2"
                >
                  {isRunning ? (
                    <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  <span className="hidden sm:inline">Run</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Run dev server (npm run dev)</TooltipContent>
            </Tooltip>
          )}

          {/* View controls and project actions group */}
          <div className="flex items-center gap-0.5 p-0.5">
            {/* Panel toggle buttons */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleExplorer}
                  className={`h-7 px-2 hover:bg-muted ${!isPanelVisible('explorer') ? 'opacity-40' : ''}`}
                >
                  <PanelLeft className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPanelVisible('explorer') ? 'Hide Explorer' : 'Show Explorer'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleEditor}
                  className={`h-7 px-2 hover:bg-muted ${!isPanelVisible('editor') ? 'opacity-40' : ''}`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPanelVisible('editor') ? 'Hide Editor' : 'Show Editor'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 hover:bg-muted ${!isPanelVisible('preview') ? 'opacity-40' : ''}`}
                  onClick={togglePreview}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPanelVisible('preview') ? 'Hide Preview' : 'Show Preview'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTerminal}
                  className={`h-7 px-2 hover:bg-muted ${!isPanelVisible('terminal') ? 'opacity-40' : ''}`}
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPanelVisible('terminal') ? 'Hide Terminal' : 'Show Terminal'}
              </TooltipContent>
            </Tooltip>

            {/* Divider */}
            <div className="w-px h-5 bg-border mx-0.5" />

            {/* Fullscreen toggle */}
            {onToggleFullscreen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleFullscreen}
                    className="h-7 px-2 hover:bg-muted"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Theme toggle */}
            {mounted && <ModeToggle compact={true} />}

            {/* Divider */}
            <div className="w-px h-5 bg-border mx-0.5" />

            {/* Save to browser */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSave}
                  className="h-7 px-2 hover:bg-muted"
                >
                  <Save className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save to Browser</TooltipContent>
            </Tooltip>

            {/* Export as ZIP */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExportZip}
                  className="h-7 px-2 hover:bg-muted"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export as ZIP</TooltipContent>
            </Tooltip>

            {/* Copy all files */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCopy}
                  className="h-7 px-2 hover:bg-muted"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy All Files</TooltipContent>
            </Tooltip>
          </div>

          {/* Install button if available */}
          {onInstall && (
            <Button
              variant="outline"
              size="sm"
              onClick={onInstall}
              disabled={isInstalling}
              className="gap-2 bg-transparent"
            >
              {isInstalling ? (
                <>
                  <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                  <span className="hidden sm:inline">Installing...</span>
                </>
              ) : (
                <>
                  <Package className="w-3 h-3" />
                  <span className="hidden sm:inline">Install Types</span>
                </>
              )}
            </Button>
          )}
        </div>
      </TooltipProvider>
    </div>
  )
}
