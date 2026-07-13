'use client'

import { FitAddon } from '@xterm/addon-fit'
import { Terminal as XTerm } from '@xterm/xterm'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

import '@xterm/xterm/css/xterm.css'

import { useWebContainer } from '../contexts/webcontainer'
import { xtermDarkTheme, xtermLightTheme } from '../services/themes'

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  const { attachTerminal } = useWebContainer()

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

      requestAnimationFrame(() => fitAddon.fit())

      xtermRef.current = xterm
      fitAddonRef.current = fitAddon

      void attachTerminal(xterm, fitAddon)
    }

    const timeoutId = setTimeout(initTerminal, 50)

    const handleResize = () => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit()
        } catch (error) {
          console.error('Error fitting terminal on resize:', error)
        }
      }
    }

    let resizeObserver: ResizeObserver | null = null

    if (terminalRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize()
      })
      resizeObserver.observe(terminalRef.current)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      if (xtermRef.current) {
        xtermRef.current.dispose()
        xtermRef.current = null
      }
    }

    // Empty dependency array ensures terminal will only init once - DO NOT CHANGE THIS
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={terminalRef} className="h-full w-full" />
}
