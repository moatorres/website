'use client'

import { Loader2 } from 'lucide-react'

import {
  type PublishedStatus,
  type StatusTone,
  useStatusBar,
} from '../atoms/status'

const toneDot: Record<StatusTone, string> = {
  info: 'bg-primary',
  success: 'bg-emerald-500',
  error: 'bg-destructive',
  muted: 'bg-muted-foreground/40',
}

const toneText: Record<StatusTone, string> = {
  info: 'text-primary',
  success: 'text-muted-foreground',
  error: 'text-destructive',
  muted: 'text-muted-foreground',
}

/** errors outrank in-flight work, which outranks transient confirmations */
function priority(status: PublishedStatus) {
  if (status.tone === 'error') return 3
  if (status.busy) return 2
  return 1
}

function StatusItem({ status }: { status: PublishedStatus }) {
  return (
    <span
      className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${toneText[status.tone]}`}
    >
      {status.busy ? (
        <Loader2 className="w-3 h-3 animate-spin shrink-0" />
      ) : (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${toneDot[status.tone]}`}
        />
      )}
      {status.label}
    </span>
  )
}

/**
 * One narrative slot on the left — the most urgent activity right now, not
 * everything true right now — and persistent indicators pinned to the right.
 * Nothing here is specific to installs, servers, or types: report progress
 * from anywhere with useStatusBar.getState().publish(...).
 */
export function StatusBar() {
  const statuses = useStatusBar((s) => s.statuses)

  const current = statuses.reduce<PublishedStatus | null>((winner, status) => {
    if (status.kind === 'indicator') return winner
    if (!winner) return status
    const diff = priority(status) - priority(winner)
    if (diff !== 0) return diff > 0 ? status : winner
    return status.seq > winner.seq ? status : winner
  }, null)

  const indicators = statuses.filter((s) => s.kind === 'indicator')

  return (
    <div className="flex-1 flex items-center gap-4 min-w-0 overflow-hidden">
      {current && <StatusItem status={current} />}
      <div className="flex-1" />
      {indicators.map((status) => (
        <StatusItem key={status.id} status={status} />
      ))}
    </div>
  )
}
