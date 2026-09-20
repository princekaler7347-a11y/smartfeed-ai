
import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    user?: string;
  }>;
};

type Profile = {
  id: string;
  full_name: string | null;
  role: string | null;
  created_at: string | null;
};

type ManagedUser = Profile & {
  email: string;
  lastSignIn: string | null;
  emailConfirmed: boolean;
};

function formatDate(value: string | null): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminUsersPage({
  searchParams,
}: PageProps) {
  // --------------------------------------------------
  // 1. AUTHENTICATION
  // --------------------------------------------------

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // 2. ADMIN AUTHORIZATION
  // --------------------------------------------------

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // --------------------------------------------------
  // 3. READ SEARCH PARAMETERS
  // --------------------------------------------------

  const params = await searchParams;

  const searchQuery =
    typeof params.q === "string"
      ? params.q.trim().slice(0, 100)
      : "";

  const selectedUserId =
    typeof params.user === "string"
      ? params.user
      : "";

  // --------------------------------------------------
  // 4. LOAD PROFILES
  // --------------------------------------------------

  const admin = createSupabaseAdminClient();

  const { data: profiles, error: usersError } =
    await admin
      .from("profiles")
      .select("id, full_name, role, created_at")
      .order("created_at", {
        ascending: false,
      })
      .limit(100);

  if (usersError) {
    throw new Error(
      `Unable to load users: ${usersError.message}`
    );
  }

  // --------------------------------------------------
  // 5. LOAD EMAILS FROM SUPABASE AUTH
  // --------------------------------------------------

  // The secret key stays on the server.
  // Never call listUsers() from a client component.

  const authUsers = [];

  let authPage = 1;

  const AUTH_PAGE_SIZE = 1000;

  while (true) {
    const {
      data,
      error,
    } = await admin.auth.admin.listUsers({
      page: authPage,
      perPage: AUTH_PAGE_SIZE,
    });

    if (error) {
      throw new Error(
        `Unable to load authentication users: ${error.message}`
      );
    }

    const batch = data.users ?? [];

    authUsers.push(...batch);

    if (batch.length < AUTH_PAGE_SIZE) {
      break;
    }

    authPage++;
  }

  const authUserMap = new Map(
    authUsers.map((authUser) => [
      authUser.id,
      authUser,
    ])
  );

  // --------------------------------------------------
  // 6. COMBINE PROFILES WITH AUTH DETAILS
  // --------------------------------------------------

  const users: ManagedUser[] = (
    (profiles ?? []) as Profile[]
  ).map((registeredUser) => {
    const authUser = authUserMap.get(
      registeredUser.id
    );

    return {
      ...registeredUser,
      email: authUser?.email ?? "Not available",
      lastSignIn: authUser?.last_sign_in_at ?? null,
      emailConfirmed: Boolean(
        authUser?.email_confirmed_at
      ),
    };
  });

  // --------------------------------------------------
  // 7. SEARCH BY NAME, EMAIL, OR USER ID
  // --------------------------------------------------

  const normalizedSearch = searchQuery.toLowerCase();

  const filteredUsers = normalizedSearch
    ? users.filter((registeredUser) => {
        const name =
          registeredUser.full_name?.toLowerCase() ??
          "";

        const email =
          registeredUser.email.toLowerCase();

        const id =
          registeredUser.id.toLowerCase();

        return (
          name.includes(normalizedSearch) ||
          email.includes(normalizedSearch) ||
          id.includes(normalizedSearch)
        );
      })
    : users;

  // --------------------------------------------------
  // 8. SELECT USER DETAILS
  // --------------------------------------------------

  const selectedUser =
    users.find(
      (registeredUser) =>
        registeredUser.id === selectedUserId
    ) ?? null;

  // --------------------------------------------------
  // 9. PAGE UI
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              SmartFeed AI · Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              User Management
            </h1>

            <p className="mt-2 text-slate-400">
              Search registered users and view
              account details securely.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-700 px-5 py-3 transition hover:bg-slate-800"
          >
            ← Back to Admin
          </Link>
        </div>

        {/* USER COUNT */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-violet-500/20 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Users displayed
            </p>

            <p className="mt-3 text-4xl font-bold text-violet-400">
              {users.length}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Showing up to 100 most recently
              registered users.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Search results
            </p>

            <p className="mt-3 text-4xl font-bold text-blue-400">
              {filteredUsers.length}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Matching users in the displayed list.
            </p>
          </div>
        </div>

        {/* SEARCH */}

        <form
          action="/admin/users"
          method="GET"
          className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <label
            htmlFor="user-search"
            className="mb-3 block text-sm font-semibold text-white"
          >
            Search users
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="user-search"
              name="q"
              type="search"
              defaultValue={searchQuery}
              maxLength={100}
              placeholder="Search by name, email, or user ID"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
            />

            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Search
            </button>

            <Link
              href="/admin/users"
              className="rounded-xl border border-slate-700 px-6 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Clear
            </Link>
          </div>
        </form>

        {/* SELECTED USER DETAILS */}

        {selectedUser && (
          <section className="mb-8 rounded-2xl border border-violet-500/30 bg-slate-900 p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                  Account Details
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  {selectedUser.full_name ||
                    "Unnamed User"}
                </h2>
              </div>

              <Link
                href={
                  searchQuery
                    ? `/admin/users?q=${encodeURIComponent(
                        searchQuery
                      )}`
                    : "/admin/users"
                }
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Close Details
              </Link>
            </div>

            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Full Name
                </dt>

                <dd className="mt-2 break-words text-sm text-white">
                  {selectedUser.full_name ||
                    "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Email
                </dt>

                <dd className="mt-2 break-all text-sm text-white">
                  {selectedUser.email}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Role
                </dt>

                <dd className="mt-2 text-sm text-white">
                  {selectedUser.role === "admin"
                    ? "Administrator"
                    : "User"}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Email Confirmation
                </dt>

                <dd className="mt-2 text-sm text-white">
                  {selectedUser.emailConfirmed
                    ? "Confirmed"
                    : "Not confirmed"}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Registered On
                </dt>

                <dd className="mt-2 text-sm text-white">
                  {formatDate(selectedUser.created_at)}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Last Sign In
                </dt>

                <dd className="mt-2 text-sm text-white">
                  {formatDate(selectedUser.lastSignIn)}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  User ID
                </dt>

                <dd className="mt-2 break-all font-mono text-xs text-slate-300">
                  {selectedUser.id}
                </dd>
              </div>
            </dl>
          </section>
        )}

        {/* USERS TABLE */}

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="border-b border-slate-700 bg-slate-800 text-slate-300">
              <tr>
                <th className="px-5 py-4">
                  User Name
                </th>

                <th className="px-5 py-4">
                  Email
                </th>

                <th className="px-5 py-4">
                  Role
                </th>

                <th className="px-5 py-4">
                  Registered On
                </th>

                <th className="px-5 py-4">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((registeredUser) => (
                <tr
                  key={registeredUser.id}
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-800/60"
                >
                  <td className="px-5 py-4 font-medium text-white">
                    {registeredUser.full_name ||
                      "Unnamed User"}
                  </td>

                  <td className="px-5 py-4 text-slate-400">
                    {registeredUser.email}
                  </td>

                  <td className="px-5 py-4">
                    {registeredUser.role === "admin" ? (
                      <span className="inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                        Administrator
                      </span>
                    ) : (
                      <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                        User
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-slate-400">
                    {formatDate(
                      registeredUser.created_at
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/users?${new URLSearchParams(
                        {
                          ...(searchQuery
                            ? { q: searchQuery }
                            : {}),
                          user: registeredUser.id,
                        }
                      ).toString()}`}
                      className="inline-block rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <p className="p-8 text-center text-slate-400">
              No matching users found.
            </p>
          )}
        </div>

        <p className="mt-5 text-sm text-slate-500">
          This page is read-only. Account deletion,
          restriction, and role changes are disabled.
          Only administrators can view user details.
        </p>
      </div>
    </main>
  );
}