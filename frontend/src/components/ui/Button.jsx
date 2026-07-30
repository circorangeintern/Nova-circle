import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Button — the single button primitive for the whole app (PRD §7.3, Part V).
 *
 * Variants: primary | secondary | outline | ghost | danger | success
 * Sizes:    sm (36) | md (44) | lg (52)
 * Props:    loading, icon (leading), iconRight, fullWidth, as (element/Link)
 *
 * States handled here: default, hover, focus-visible ring, pressed (scale),
 * loading (spinner), disabled. Min 48px touch target on md/lg.
 */
const VARIANTS = {
  primary:
    'bg-civic-500 text-white shadow-e1 hover:bg-civic-600 hover:shadow-e2 active:bg-civic-600',
  secondary:
    'bg-white text-civic border border-civic/25 hover:border-civic hover:bg-civic/[0.04] shadow-e1',
  outline:
    'bg-transparent text-white border border-white/40 hover:bg-white/10 hover:border-white/70',
  ghost: 'bg-transparent text-civic hover:bg-civic/[0.06]',
  danger: 'bg-critical text-white hover:bg-red-700 shadow-e1',
  success: 'bg-success text-white hover:bg-green-700 shadow-e1',
  accent: 'bg-accent text-white shadow-e1 hover:brightness-95 active:brightness-90',
}

const SIZES = {
  sm: 'h-9 px-4 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-[15px] gap-2 rounded-lg',
  lg: 'h-[52px] px-6 text-base gap-2 rounded-xl',
}

export const Button = forwardRef(function Button(
  {
    as: Comp = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon: Icon,
    iconRight: IconRight,
    className,
    children,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading
  return (
    <Comp
      ref={ref}
      // Buttons are frequently used for client-side navigation.  Defaulting to
      // "button" prevents a surrounding form from treating actions such as
      // "Continue" as a submit and interrupting the step transition.
      type={Comp === 'button' ? (props.type ?? 'button') : undefined}
      disabled={Comp === 'button' ? isDisabled : undefined}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-semibold',
        'transition-[transform,background-color,box-shadow,border-color] duration-150 ease-out',
        'active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-civic focus-visible:ring-offset-2',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        isDisabled && 'pointer-events-none opacity-50',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="size-[18px]" aria-hidden="true" />
      )}
      {children}
      {!loading && IconRight && <IconRight className="size-[18px]" aria-hidden="true" />}
    </Comp>
  )
})
