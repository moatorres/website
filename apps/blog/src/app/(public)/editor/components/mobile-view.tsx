'use client'

import { Button } from '@shadcn/ui'
import { Monitor, Smartphone } from 'lucide-react'

interface MobileViewProps {
  projectName?: string
  onBack?: () => void
}

export function MobileView({ projectName, onBack }: MobileViewProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
          <div className="relative bg-linear-to-br from-primary/20 to-primary/5 rounded-3xl p-5 backdrop-blur-sm border border-primary/20">
            <Monitor
              className="w-14 h-14 text-primary mx-auto"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            Desktop Experience Required
          </h1>
          <p className="text-muted-foreground text-pretty leading-relaxed">
            The code playground is optimized for desktop screens. Please switch
            to a larger device for the best experience.
          </p>
        </div>

        {/* Project info if available */}
        {projectName && (
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
            <div className="flex items-center justify-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">Project loaded:</span>
              <span className="font-semibold font-mono text-foreground">
                {projectName}
              </span>
            </div>
          </div>
        )}

        {/* Feature list */}
        <div className="space-y-3 text-left bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-center mb-4 text-muted-foreground uppercase tracking-wide">
            Why Desktop?
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <p className="text-sm text-muted-foreground text-pretty">
                Full-featured Monaco code editor with syntax highlighting
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <p className="text-sm text-muted-foreground text-pretty">
                Multiple resizable panels for efficient workflow
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <p className="text-sm text-muted-foreground text-pretty">
                Integrated terminal with full keyboard support
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <p className="text-sm text-muted-foreground text-pretty">
                Live preview with WebContainer technology
              </p>
            </div>
          </div>
        </div>

        {/* Recommended screen size */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
          <Monitor className="w-4 h-4" />
          <span>Recommended: 1280px width or larger</span>
        </div>

        {/* Back button if available */}
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full rounded-xl h-11 bg-transparent"
          >
            Back to Projects
          </Button>
        )}

        {/* Device indicator */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Smartphone className="w-4 h-4 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground/50">
            Currently on mobile device
          </span>
        </div>
      </div>
    </div>
  )
}
