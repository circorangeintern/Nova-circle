import { Link } from 'react-router-dom'
import { Construction, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * ComingSoon — placeholder for screens scheduled after the MVP. Keeps routing
 * intact and communicates status honestly (Master PRD: never fake progress).
 */
export function ComingSoon({ title, description, roadmap = [] }) {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-civic/10 text-civic-600">
        <Construction className="size-8" />
      </span>
      <h1 className="mt-6 text-h2 font-bold text-ink">{title}</h1>
      <p className="mt-3 max-w-md text-lg text-slate">{description}</p>

      {roadmap.length > 0 && (
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {roadmap.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-slate"
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      <Button as={Link} to="/" variant="secondary" icon={ArrowLeft} className="mt-8">
        Back to home
      </Button>
    </section>
  )
}
