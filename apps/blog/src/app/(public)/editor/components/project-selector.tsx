'use client'

import { Button, Card } from '@shadcn/ui'

import type { Project } from '../services/types'

interface ProjectSelectorProps {
  projects: Project[]
  onSelectProject: (project: Project) => void
}

export function ProjectSelector({
  projects,
  onSelectProject,
}: ProjectSelectorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-balance">
            WebContainer Playground
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose a project to start coding in your browser
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-6 hover:border-primary transition-colors cursor-pointer"
              onClick={() => onSelectProject(project)}
            >
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {project.description}
              </p>
              <Button className="w-full">Load Project</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
