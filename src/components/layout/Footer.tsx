
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
      <Container as="div" className="py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Project information */}
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              {APP_NAME}
            </p>

            <p className="mt-1 max-w-md text-sm text-zinc-600">
              {APP_DESCRIPTION}
            </p>
          </div>

          {/* Developer information */}
          <div className="text-left sm:text-right">
            <p className="text-sm text-zinc-700">
              Developed by{" "}
              <span className="font-semibold text-violet-700">
                Gurpal Singh
              </span>
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              © {currentYear} {APP_NAME}. BCA Minor Project.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}