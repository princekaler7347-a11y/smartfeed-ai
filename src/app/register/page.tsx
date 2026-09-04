"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export default function RegisterPage() {
  const router = useRouter();

  const [supabase] = useState(() =>
    createSupabaseBrowserClient()
  );

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (user) {
        router.replace("/dashboard");
      }
    }

    checkUser();
  }, [router, supabase]);

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    const { error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);

    setMessage(
      "Registration successful. Please check your email if confirmation is enabled."
    );

    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden">
      <div className="pointer-events-none absolute left-[-140px] top-20 h-96 w-96 rounded-full bg-violet-600/15 blur-[140px]" />

      <div className="pointer-events-none absolute right-[-120px] bottom-10 h-96 w-96 rounded-full bg-blue-600/12 blur-[140px]" />

      <div className="pointer-events-none absolute inset-0 background-grid opacity-20" />

      <div className="page-container relative flex min-h-[calc(100vh-72px)] items-center py-12">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <section className="hidden lg:block">
            <div className="ai-badge">
              <span>✦</span>
              JOIN SMARTFEED AI
            </div>

            <h1 className="mt-6 max-w-xl text-5xl font-bold leading-[1.08] tracking-[-0.04em] text-white">
              Build a news feed around{" "}
              <span className="gradient-text">
                your interests.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
              Create your account, choose the
              topics you care about, and let
              SmartFeed AI organize relevant
              stories into a personalized
              dashboard.
            </p>

            <div className="mt-9 grid max-w-lg gap-4">
              <div className="glass-card flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                  01
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Create your account
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Register using your email
                    and password.
                  </p>
                </div>
              </div>

              <div className="glass-card flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                  02
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Choose your interests
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Select at least three
                    categories to build your
                    preference profile.
                  </p>
                </div>
              </div>

              <div className="glass-card flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                  03
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Explore your feed
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    SmartFeed ranks stories
                    using relevance, text
                    similarity, and interaction
                    history.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="glass-card relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute right-[-60px] top-[-60px] h-44 w-44 rounded-full bg-violet-600/15 blur-[70px]" />

              <div className="relative">
                <div className="mb-7 flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-lg font-bold text-white shadow-[0_10px_30px_rgba(124,58,237,0.3)]">
                    S
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      SmartFeed AI
                    </p>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                      Intelligent News
                    </p>
                  </div>
                </div>

                <div className="ai-badge">
                  CREATE ACCOUNT
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
                  Get started
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create your SmartFeed AI
                  account and personalize your
                  news experience.
                </p>

                <form
                  onSubmit={handleRegister}
                  className="mt-7 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                    >
                      Full Name
                    </label>

                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="8"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />

                          <path
                            d="M4 21C4.7 16.7 7.5 14.5 12 14.5C16.5 14.5 19.3 16.7 20 21"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(event) =>
                          setFullName(
                            event.target.value
                          )
                        }
                        required
                        autoComplete="name"
                        className="smart-input !pl-14"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="3"
                            y="5"
                            width="18"
                            height="14"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />

                          <path
                            d="M4 7L12 13L20 7"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(
                            event.target.value
                          )
                        }
                        required
                        autoComplete="email"
                        className="smart-input !pl-14"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="5"
                            y="10"
                            width="14"
                            height="11"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />

                          <path
                            d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                          setPassword(
                            event.target.value
                          )
                        }
                        required
                        minLength={6}
                        autoComplete="new-password"
                        className="smart-input !pl-14"
                        placeholder="Minimum 6 characters"
                      />
                    </div>

                    <p className="mt-2 text-[11px] text-slate-600">
                      Your password must contain
                      at least 6 characters.
                    </p>
                  </div>

                  {message && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-sm leading-5 ${
                        success
                          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                          : "border-red-400/20 bg-red-500/10 text-red-300"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5">
                          {success ? "✓" : "!"}
                        </span>

                        <span>
                          {message}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="primary-button w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-7 border-t border-white/10 pt-6 text-center">
                  <p className="text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-violet-300 transition hover:text-violet-200"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-600">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />

                    <path
                      d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>

                  Authentication powered by
                  Supabase
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}