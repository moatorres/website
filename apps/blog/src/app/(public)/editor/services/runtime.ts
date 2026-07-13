'use client'

import { ManagedRuntime } from 'effect'

import { WebContainerService } from './WebContainerService'

/**
 * App-lifetime runtime for the WebContainer service layer.
 *
 * The service is scoped and its release tears the container down, so it must
 * be constructed exactly once and shared — never `Effect.provide` the layer
 * per call, or each call boots and destroys its own container.
 */
export const wcRuntime = ManagedRuntime.make(WebContainerService.Default)
