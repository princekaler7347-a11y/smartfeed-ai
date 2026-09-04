import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function CtaSection() {
  return (
    <section className="py-16 sm:py-20">
      <Container as="div">
        <div className="rounded-2xl bg-indigo-600 px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Building Phase by Phase
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-indigo-100">
            SmartFeed AI is being developed as a real full-stack application for a
            BCA minor project. Authentication, content ingestion, and AI features
            will be added in later phases.
          </p>
          <div className="mt-8">
            <Button href="/about" variant="secondary">
              View Project Roadmap
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
