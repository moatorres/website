import { create } from 'zustand'

export type StatusTone = 'info' | 'success' | 'error' | 'muted'

export type StatusKind = 'activity' | 'indicator'

export interface Status {
  id: string
  label: string
  tone: StatusTone
  /** show a spinner instead of the tone dot while work is in flight */
  busy?: boolean
  /**
   * 'activity' (default) statuses compete for the single narrative slot;
   * 'indicator' statuses are persistent facts pinned to the right — publish
   * one only while the fact it reports is true, and clear it after.
   */
  kind?: StatusKind
}

export interface PublishedStatus extends Status {
  /** publish order — newer activities win priority ties */
  seq: number
}

interface StatusState {
  statuses: PublishedStatus[]
  /**
   * Upsert a status by id. Pass `ttl` to auto-clear it after a delay —
   * useful for transient confirmations like "Dependencies installed".
   */
  publish(status: Status, options?: { ttl?: number }): void
  clear(id: string): void
}

let nextSeq = 0

const expiryTimers = new Map<string, ReturnType<typeof setTimeout>>()

export const useStatusBar = create<StatusState>((set, get) => ({
  statuses: [],

  publish: (status, options) => {
    const pending = expiryTimers.get(status.id)
    if (pending) {
      clearTimeout(pending)
      expiryTimers.delete(status.id)
    }

    const entry: PublishedStatus = { ...status, seq: nextSeq++ }

    set((state) => {
      const index = state.statuses.findIndex((s) => s.id === status.id)
      if (index === -1) return { statuses: [...state.statuses, entry] }
      const statuses = [...state.statuses]
      statuses[index] = entry
      return { statuses }
    })

    if (options?.ttl) {
      expiryTimers.set(
        status.id,
        setTimeout(() => get().clear(status.id), options.ttl)
      )
    }
  },

  clear: (id) => {
    const pending = expiryTimers.get(id)
    if (pending) {
      clearTimeout(pending)
      expiryTimers.delete(id)
    }
    set((state) => ({ statuses: state.statuses.filter((s) => s.id !== id) }))
  },
}))
