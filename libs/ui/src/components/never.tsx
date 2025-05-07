import React from 'react'

export const Never = React.lazy(
  () =>
    new Promise(() => {
      // will never resolve
    })
)
