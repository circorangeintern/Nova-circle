import { Link } from 'react-router-dom'
import { MapPinOff, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="grid size-16 place-items-center rounded-full bg-civic/10 text-civic-600">
        <MapPinOff className="size-8" />
      </span>
      <h1 className="mt-6 font-display text-5xl font-bold text-ink">404</h1>
      <p className="mt-3 max-w-md text-lg text-slate">
        We couldn't find that page. It may have moved, or the link is incorrect.
      </p>
      <Button as={Link} to="/" icon={Home} className="mt-8">
        Go home
      </Button>
    </section>
  )
}
