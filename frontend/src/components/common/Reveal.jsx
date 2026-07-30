/** A semantic wrapper that keeps below-the-fold content cheap to render. */
export function Reveal({ children, className, as: Tag = 'div' }) {
  return <Tag className={className}>{children}</Tag>
}
