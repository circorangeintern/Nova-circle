/** Displays a localized metric without animation work during first paint. */
export function CountUp({ value, suffix = '', prefix = '', className }) {
  return <span className={className}>{prefix}{value.toLocaleString('en-NG')}{suffix}</span>
}
