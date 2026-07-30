/** PageLoader — lightweight fallback shown while a lazy route chunk loads. */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="size-9 animate-spin rounded-full border-[3px] border-civic-400 border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
