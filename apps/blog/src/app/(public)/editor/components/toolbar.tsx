'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shadcn/ui'
import {
  ChevronDown,
  Code2,
  Copy,
  Download,
  FolderOpen,
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

import type { Project } from '../services/types'

import { ModeToggle } from './theme-toggle'

interface ToolbarProps {
  projectName: string
  projects?: Project[]
  currentProjectId?: string
  onExportZip: () => void
  onSave: () => void
  onCopy: () => void
  onBack: () => void
  onInstall?: () => void
  isInstalling?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  onProjectChange?: (project: Project) => void
  showExplorer?: boolean
  showEditor?: boolean
  showPreview?: boolean
  showTerminal?: boolean
  onToggleExplorer?: () => void
  onToggleEditor?: () => void
  onTogglePreview?: () => void
  onToggleTerminal?: () => void
  onRunCommand?: () => void
  isRunning?: boolean
}

export function Toolbar({
  projectName,
  projects = [],
  currentProjectId,
  onExportZip,
  onSave,
  onCopy,
  onBack,
  onInstall,
  isInstalling = false,
  isFullscreen = true,
  onToggleFullscreen,
  onProjectChange,
  showExplorer = true,
  showEditor = true,
  showPreview = true,
  showTerminal = true,
  onToggleExplorer,
  onToggleEditor,
  onTogglePreview,
  onToggleTerminal,
  onRunCommand,
  isRunning = false,
}: ToolbarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-12 py-2 border-b border-border flex items-center px-4 gap-3 bg-card shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-6 h-6 bg-linear-to-br from-primary to-primary/70 rounded-md flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xs">MT</span>
        </div>
        <span className="font-semibold text-xs hidden sm:inline">
          {projectName}
        </span>
      </div>

      {/* Project Selector Dropdown */}
      {projects.length > 0 && onProjectChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 max-w-[200px] bg-transparent h-7 text-xs"
            >
              <FolderOpen className="w-3 h-3 shrink-0" />
              <span className="truncate">{projectName}</span>
              <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Switch Project
            </div>
            <DropdownMenuSeparator />
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => onProjectChange(project)}
                className="gap-2"
                disabled={project.id === currentProjectId}
              >
                <FolderOpen className="w-4 h-4" />
                <span className="flex-1 truncate">{project.name}</span>
                {project.id === currentProjectId && (
                  <span className="text-xs text-muted-foreground">✓</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onBack} className="gap-2">
              <span className="text-muted-foreground">←</span>
              <span>Back to All Projects</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
            {onToggleExplorer && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleExplorer}
                    className={`h-7 px-2 hover:bg-muted ${!showExplorer ? 'opacity-40' : ''}`}
                  >
                    <PanelLeft className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showExplorer ? 'Hide Explorer' : 'Show Explorer'}
                </TooltipContent>
              </Tooltip>
            )}

            {onToggleEditor && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleEditor}
                    className={`h-7 px-2 hover:bg-muted ${!showEditor ? 'opacity-40' : ''}`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showEditor ? 'Hide Editor' : 'Show Editor'}
                </TooltipContent>
              </Tooltip>
            )}

            {onTogglePreview && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onTogglePreview}
                    className={`h-7 px-2 hover:bg-muted ${!showPreview ? 'opacity-40' : ''}`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </TooltipContent>
              </Tooltip>
            )}

            {onToggleTerminal && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleTerminal}
                    className={`h-7 px-2 hover:bg-muted ${!showTerminal ? 'opacity-40' : ''}`}
                  >
                    <TerminalIcon className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
                </TooltipContent>
              </Tooltip>
            )}

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
