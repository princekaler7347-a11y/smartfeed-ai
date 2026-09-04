"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();

  const [supabase] = useState(() =>
    createSupabaseBrowserClient()
  );

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
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

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
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
              SMARTFEED AI
            </div>

            <h1 className="mt-6 max-w-xl text-5xl font-bold leading-[1.08] tracking-[-0.04em] text-white">
              Welcome back to your{" "}
              <span className="gradient-text">
                personalized news
              </span>{" "}
              experience.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
              Sign in to continue exploring
              articles ranked using your
              selected interests, text
              similarity, relevance scoring,
              and interaction history.
            </p>

            <div className="mt-9 grid max-w-lg gap-4">
              <div className="glass-card flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                  ◈
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Personalized feed
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your dashboard is built
                    around the categories you
                    care about.
                  </p>
                </div>
              </div>

              <div className="glass-card flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                  ✦
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Intelligent ranking
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Relevance and cosine text
                    similarity help order your
                    recommendations.
                  </p>
                </div>
              </div>

              <div className="glass-card flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                  ↗
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Behavior-aware
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Likes, dislikes and saved
                    stories contribute to your
                    ranking adjustments.
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
                  ACCOUNT ACCESS
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to continue to your
                  personalized SmartFeed AI
                  dashboard.
                </p>

                <form
                  onSubmit={handleLogin}
                  className="mt-7 space-y-5"
                >
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
                        placeholder="Enter your email"
                        className="smart-input !pl-14"
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
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="smart-input !pl-14"
                      />
                    </div>
                  </div>

                  {message && (
                    <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300">
                      {message}
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
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-7 border-t border-white/10 pt-6 text-center">
                  <p className="text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/register"
                      className="font-semibold text-violet-300 transition hover:text-violet-200"
                    >
                      Create your account
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