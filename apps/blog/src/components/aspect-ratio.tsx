/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'

export function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}
