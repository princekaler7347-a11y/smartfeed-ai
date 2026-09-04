import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function HeroSection() {
  return (
    <section className="border-b border-zinc-200 bg-gradient-to-b from-indigo-50 to-white py-16 sm:py-24">
      <Container as="div" className="text-center">
        <p className="mb-4 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-700">
          AI-Powered Content Curation
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          {APP_NAME}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-700 sm:text-xl">
          {APP_TAGLINE}
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-600">
          {APP_DESCRIPTION}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/about">Learn About the Project</Button>
          <Button href="#features" variant="secondary">
            See Planned Features
          </Button>
        </div>
      </Container>
    </section>
  );
}
