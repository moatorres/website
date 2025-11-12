'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shadcn/ui'
import { ChevronDown, FolderOpen, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { Project } from '../services/types'

interface ProjectSelectorProps {
  projects: Project[]
  onSelectProject: (project: Project) => void
}

export function ProjectSelector({
  projects,
  onSelectProject,
}: ProjectSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects

    const query = searchQuery.toLowerCase()
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query)
    )
  }, [projects, searchQuery])

  return (
    <>
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/50">
        <h2 className="text-2xl font-semibold text-foreground mb-1">
          Select a Project
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose a project to start coding in your browser
        </p>
      </div>

      {/* Search bar */}
      <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Project list */}
      <div className="max-h-[480px] overflow-y-auto">
        {filteredProjects.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-muted-foreground text-sm">
              No projects found matching &quot;{searchQuery}&quot;
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredProjects.map((project, index) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="w-full px-6 py-4 hover:bg-muted/50 transition-colors text-left group flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {project.name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {project.description}
                  </p>
                </div>
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border/50 rounded text-[10px] font-mono">
                      ⏎
                    </kbd>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-6 py-3 border-t border-border/50 bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-background border border-border/50 rounded text-[10px] font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-background border border-border/50 rounded text-[10px] font-mono">
                ↓
              </kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-background border border-border/50 rounded text-[10px] font-mono">
                ⏎
              </kbd>
              to select
            </span>
          </div>
          <span>{filteredProjects.length} projects</span>
        </div>
      </div>
    </>
  )
}

interface ProjectSelectorDropdownProps {
  projectName: string
  projects?: Project[]
  currentProjectId?: string
  onBack: () => void
  onProjectChange?: (project: Project) => void
}

export function ProjectSelectorDropdown({
  projectName,
  projects = [],
  currentProjectId,
  onBack,
  onProjectChange,
}: ProjectSelectorDropdownProps) {
  return (
    projects.length > 0 &&
    onProjectChange && (
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
    )
  )
}
