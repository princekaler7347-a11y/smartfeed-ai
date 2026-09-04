import { LANDING_FEATURES } from "@/lib/constants";
import { Container } from "@/components/ui/Container";

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20">
      <Container as="div">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            What SmartFeed AI Will Do
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            Phase 1 sets up the project foundation. These features will be built
            in upcoming development phases.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {LANDING_FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-zinc-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
