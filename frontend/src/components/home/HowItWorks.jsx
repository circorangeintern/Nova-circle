import { Camera, Send, LineChart, ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/common/Reveal'
import { howItWorks } from '@/data/mockData'

const ICONS = { 1: Camera, 2: Send, 3: LineChart }

/** HowItWorks — 3 connected steps (Landing §3.1: Take a Photo → Submit → Track). */
export function HowItWorks() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Simple by design"
          title="How PublicEye Works"
          description="From spotting a problem to holding officials accountable — three steps, under 90 seconds."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {howItWorks.map((step, i) => {
            const Icon = ICONS[step.step]
            return (
              <Reveal key={step.step} delay={i * 0.1} className="relative">
                <div className="flex h-full flex-col items-center rounded-panel border border-line bg-surface p-8 text-center">
                  <span className="relative grid size-16 place-items-center rounded-full bg-civic-500 text-white shadow-e2">
                    <Icon className="size-7" strokeWidth={2} />
                    <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full border-2 border-white bg-accent font-data text-sm font-bold text-white">
                      {step.step}
                    </span>
                  </span>
                  <h3 className="mt-6 text-xl font-bold text-ink">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate">{step.body}</p>
                </div>

                {/* Connector arrow (desktop only, between cards) */}
                {i < howItWorks.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-1/2 hidden size-8 -translate-y-1/2 text-civic-400 md:block" />
                )}
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
