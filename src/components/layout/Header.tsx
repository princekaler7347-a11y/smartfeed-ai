"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  useEffect(() => {
    const supabase =
      createSupabaseBrowserClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        router.refresh();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    const supabase =
      createSupabaseBrowserClient();

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout failed:",
        error.message
      );
      return;
    }

    setUser(null);
    setMobileMenuOpen(false);

    router.push("/");
    router.refresh();
  }

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  const linkClass = (href: string) => {
    const active =
      href === "/"
        ? pathname === "/"
        : pathname.startsWith(href);

    return `
      relative rounded-lg px-3 py-2
      text-sm font-medium
      transition-all duration-200
      ${
        active
          ? "text-white"
          : "text-slate-400 hover:text-white"
      }
    `;
  };

  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-white/10
        bg-[#070b14]/80
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto flex h-[72px]
          max-w-7xl items-center
          justify-between px-4
          sm:px-6 lg:px-8
        "
      >
        {/* LOGO */}
        <Link
          href="/"
          onClick={closeMenu}
          className="
            group flex items-center
            gap-3
          "
        >
          <div
            className="
              relative flex h-10 w-10
              items-center justify-center
              overflow-hidden rounded-xl
              border border-violet-400/20
              bg-gradient-to-br
              from-violet-600
              via-indigo-600
              to-blue-600
              shadow-[0_0_28px_rgba(124,58,237,0.35)]
              transition-all duration-300
              group-hover:scale-105
              group-hover:shadow-[0_0_35px_rgba(124,58,237,0.55)]
            "
          >
            {/* AI Feed Logo */}
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 6.5H14.5"
                stroke="white"
                strokeWidth="1.7"
                strokeLinecap="round"
              />

              <path
                d="M7 10H12"
                stroke="white"
                strokeWidth="1.7"
                strokeLinecap="round"
              />

              <path
                d="M7 13.5H10.5"
                stroke="white"
                strokeWidth="1.7"
                strokeLinecap="round"
              />

              <path
                d="M16.5 10.5L17.1 12.2L18.8 12.8L17.1 13.4L16.5 15.1L15.9 13.4L14.2 12.8L15.9 12.2L16.5 10.5Z"
                fill="white"
              />

              <rect
                x="4"
                y="3.5"
                width="16"
                height="17"
                rx="4"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>

            <div
              className="
                absolute inset-0
                bg-gradient-to-tr
                from-transparent
                via-white/10
                to-white/20
              "
            />
          </div>

          <div className="leading-none">
            <div className="flex items-center gap-1">
              <span
                className="
                  text-[18px] font-bold
                  tracking-tight text-white
                "
              >
                SmartFeed
              </span>

              <span
                className="
                  bg-gradient-to-r
                  from-violet-400
                  to-blue-400
                  bg-clip-text
                  text-[18px]
                  font-bold
                  text-transparent
                "
              >
                AI
              </span>
            </div>

            <span
              className="
                hidden text-[9px]
                font-medium uppercase
                tracking-[0.22em]
                text-slate-500
                sm:block
              "
            >
              Intelligent News
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav
          className="
            hidden items-center
            gap-1 md:flex
          "
        >
          <Link
            href="/"
            className={linkClass("/")}
          >
            Home
          </Link>

          <Link
            href="/#features"
            className="
              rounded-lg px-3 py-2
              text-sm font-medium
              text-slate-400
              transition-colors
              hover:text-white
            "
          >
            Features
          </Link>

          <Link
            href="/about"
            className={linkClass("/about")}
          >
            About
          </Link>

          {!loading && user && (
            <Link
              href="/dashboard"
              className={linkClass(
                "/dashboard"
              )}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div
          className="
            hidden items-center
            gap-3 md:flex
          "
        >
          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="
                  rounded-xl px-4 py-2.5
                  text-sm font-medium
                  text-slate-300
                  transition-all
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="
                  group inline-flex
                  items-center gap-2
                  rounded-xl
                  border
                  border-violet-400/20
                  bg-gradient-to-r
                  from-violet-600
                  to-blue-600
                  px-5 py-2.5
                  text-sm font-semibold
                  text-white
                  shadow-[0_10px_30px_rgba(124,58,237,0.25)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_12px_35px_rgba(124,58,237,0.4)]
                "
              >
                Get Started

                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12H19M13 6L19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link
                href="/dashboard"
                className="
                  inline-flex
                  items-center gap-2
                  rounded-xl
                  border border-white/10
                  bg-white/5
                  px-4 py-2.5
                  text-sm font-medium
                  text-slate-200
                  transition-all
                  hover:border-violet-400/30
                  hover:bg-white/10
                "
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM4 14H10V20H4V14ZM14 14H20V20H14V14Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                </svg>

                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  rounded-xl
                  bg-gradient-to-r
                  from-violet-600
                  to-blue-600
                  px-4 py-2.5
                  text-sm font-semibold
                  text-white
                  shadow-[0_10px_30px_rgba(124,58,237,0.2)]
                  transition-all
                  hover:-translate-y-0.5
                  hover:shadow-[0_12px_35px_rgba(124,58,237,0.35)]
                "
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(
              (current) => !current
            )
          }
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            border border-white/10
            bg-white/5
            text-white
            transition
            hover:bg-white/10
            md:hidden
          "
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 7H20M4 12H20M4 17H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div
          className="
            border-t
            border-white/10
            bg-[#070b14]/95
            px-4 py-4
            backdrop-blur-xl
            md:hidden
          "
        >
          <nav
            className="
              mx-auto flex
              max-w-7xl
              flex-col gap-2
            "
          >
            <Link
              href="/"
              onClick={closeMenu}
              className="
                rounded-xl px-4 py-3
                text-sm font-medium
                text-slate-300
                hover:bg-white/5
                hover:text-white
              "
            >
              Home
            </Link>

            <Link
              href="/#features"
              onClick={closeMenu}
              className="
                rounded-xl px-4 py-3
                text-sm font-medium
                text-slate-300
                hover:bg-white/5
                hover:text-white
              "
            >
              Features
            </Link>

            <Link
              href="/about"
              onClick={closeMenu}
              className="
                rounded-xl px-4 py-3
                text-sm font-medium
                text-slate-300
                hover:bg-white/5
                hover:text-white
              "
            >
              About
            </Link>

            {!loading && user && (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="
                  rounded-xl px-4 py-3
                  text-sm font-medium
                  text-slate-300
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Dashboard
              </Link>
            )}

            <div
              className="
                my-2 h-px
                bg-white/10
              "
            />

            {!loading && !user && (
              <div
                className="
                  grid grid-cols-2
                  gap-3
                "
              >
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="
                    flex items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-4 py-3
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="
                    flex items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-r
                    from-violet-600
                    to-blue-600
                    px-4 py-3
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Get Started
                </Link>
              </div>
            )}

            {!loading && user && (
              <button
                type="button"
                onClick={handleLogout}
                className="
                  rounded-xl
                  bg-gradient-to-r
                  from-violet-600
                  to-blue-600
                  px-4 py-3
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}