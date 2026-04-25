import { loginAction } from "./login-action";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params?.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-slate-900">
          GeoSurvey Login
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Enter your username and password to continue.
        </p>

        {hasError && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            Invalid username or password.
          </div>
        )}

        <form action={loginAction} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}