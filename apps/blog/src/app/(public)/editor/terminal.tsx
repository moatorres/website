'use client'

import { FitAddon } from '@xterm/addon-fit'
import { Terminal as XTerm } from '@xterm/xterm'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

import '@xterm/xterm/css/xterm.css'

import { xtermDarkTheme, xtermLightTheme } from './editor-themes'

interface TerminalProps {
  onReady: (terminal: XTerm, fitAddon: FitAddon) => void
}

export function Terminal({ onReady }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const onReadyCalledRef = useRef(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (xtermRef.current) {
      const theme = resolvedTheme === 'dark' ? xtermDarkTheme : xtermLightTheme
      xtermRef.current.options.theme = theme
    }
  }, [resolvedTheme])

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return

    const initTerminal = () => {
      if (!terminalRef.current) return

      const theme = resolvedTheme === 'dark' ? xtermDarkTheme : xtermLightTheme

      const xterm = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Geist Mono, monospace',
        theme,
        convertEol: true,
      })

      const fitAddon = new FitAddon()
      xterm.loadAddon(fitAddon)

      xterm.open(terminalRef.current)

      requestAnimationFrame(() => {
        try {
          fitAddon.fit()
        } catch (error) {
          console.error('[v0] Error fitting terminal:', error)
          setTimeout(() => {
            try {
              fitAddon.fit()
            } catch (retryError) {
              console.error('[v0] Error fitting terminal on retry:', retryError)
            }
          }, 100)
        }
      })

      xtermRef.current = xterm
      fitAddonRef.current = fitAddon

      if (!onReadyCalledRef.current) {
        onReadyCalledRef.current = true
        onReady(xterm, fitAddon)
      }
    }

    const timeoutId = setTimeout(initTerminal, 50)

    const handleResize = () => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit()
        } catch (error) {
          console.error('[v0] Error fitting terminal on resize:', error)
        }
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      if (xtermRef.current) {
        xtermRef.current.dispose()
        xtermRef.current = null
      }
    }
  }, [resolvedTheme])

  useEffect(() => {
    if (xtermRef.current && fitAddonRef.current && !onReadyCalledRef.current) {
      onReadyCalledRef.current = true
      onReady(xtermRef.current, fitAddonRef.current)
    }
  }, [onReady])

  return <div ref={terminalRef} className="h-full w-full" />
}
