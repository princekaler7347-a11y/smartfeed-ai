import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
      <Container as="div" className="py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">{APP_NAME}</p>
            <p className="mt-1 max-w-md text-sm text-zinc-600">{APP_DESCRIPTION}</p>
          </div>
          <p className="text-sm text-zinc-500">
            © {currentYear} {APP_NAME}. BCA Minor Project.
          </p>
        </div>
      </Container>
    </footer>
  );
}
