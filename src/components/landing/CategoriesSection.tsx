import { CONTENT_CATEGORIES } from "@/lib/constants";
import { Container } from "@/components/ui/Container";

export function CategoriesSection() {
  return (
    <section className="border-y border-zinc-200 bg-zinc-50 py-16 sm:py-20">
      <Container as="div">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            12 Content Categories
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            Users will pick their interests during onboarding. Articles will be
            organized and recommended within these categories.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_CATEGORIES.map((category) => (
            <li
              key={category.id}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <h3 className="font-medium text-zinc-900">{category.label}</h3>
              <p className="mt-1 text-sm text-zinc-600">{category.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
