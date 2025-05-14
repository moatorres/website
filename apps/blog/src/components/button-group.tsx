import { ButtonProps, cn } from '@shadcn/ui'
import React from 'react'

interface ButtonGroupProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  children: React.ReactElement<ButtonProps>[]
}

export const ButtonGroup = ({
  className,
  orientation = 'horizontal',
  children,
}: ButtonGroupProps) => {
  const totalButtons = React.Children.count(children)
  const isHorizontal = orientation === 'horizontal'
  const isVertical = orientation === 'vertical'

  return (
    <div className={cn('flex', isVertical && 'flex-col w-fit', className)}>
      {React.Children.map(children, (child, index) => {
        const isFirst = index === 0
        const isLast = index === totalButtons - 1

        return React.cloneElement(child, {
          className: cn(
            {
              'rounded-l-none': isHorizontal && !isFirst,
              'rounded-r-none': isHorizontal && !isLast,
              'border-l-0': isHorizontal && !isFirst,
              'rounded-t-none': isVertical && !isFirst,
              'rounded-b-none': isVertical && !isLast,
              'border-t-0': isVertical && !isFirst,
            },
            child.props.className
          ),
        })
      })}
    </div>
  )
}
