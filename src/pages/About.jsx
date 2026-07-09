import { Link } from 'react-router-dom'
import { Eye, Camera, ShieldCheck, Scale } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/common/Reveal'

const PILLARS = [
  { icon: Camera, title: 'Public & searchable', body: 'Every report is geotagged and open, so civil society, journalists and agencies can see the full picture.' },
  { icon: ShieldCheck, title: 'Official in its response loop', body: 'LGA officials respond publicly. Non-response is itself a visible, measurable data point.' },
  { icon: Scale, title: 'Citizen-verified', body: 'Neighbours can confirm an issue or dispute a false resolution with photographic counter-evidence.' },
]

export default function About() {
  return (
    <div>
      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-civic/10 text-civic-600">
            <Eye className="size-7" />
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold text-ink sm:text-5xl">
            Making the absence of infrastructure impossible to ignore.
          </h1>
          <p className="mt-5 text-lg text-slate">
            PublicEye NG is a geotagged, photographic public infrastructure accountability platform.
            It turns a scattered, invisible backlog of broken roads, dry boreholes and roofless
            schools into a structured, verified, public record — one that government cannot ignore
            without the silence being visible.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <SectionHeading
            align="center"
            eyebrow="What makes it different"
            title="Accountability, made visible"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <Card className="h-full p-6">
                  <span className="grid size-12 place-items-center rounded-xl bg-civic/10 text-civic-600">
                    <p.icon className="size-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-ink">{p.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate">{p.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Button as={Link} to="/report" variant="accent" size="lg" icon={Camera}>
              Report an Issue
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
