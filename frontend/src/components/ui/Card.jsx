import { cn } from '@/lib/cn'

/**
 * Card — the primary content container (Master PRD §11): 16px radius, white bg,
 * 1px neutral border, soft elevation. `interactive` adds a hover lift.
 */
export function Card({ as: Comp = 'div', interactive = false, className, children, ...props }) {
  return (
    <Comp
      className={cn(
        'rounded-card border border-line bg-white shadow-card',
        interactive &&
          'transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-e2',
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}
