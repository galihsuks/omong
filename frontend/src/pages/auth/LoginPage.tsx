import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/hooks/useAuthMutations";
import { useAuthStore } from "@/store/auth.store";

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [form, setForm] = useState({ email: "", sandi: "" });

  const { mutate: login, isPending: isLoginPending, error: loginError } = useLoginMutation();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    login(form, {
      onSuccess: (user) => {
        setUser(user);
        navigate("/rooms");
      },
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-indigo-950 via-purple-950 to-fuchsia-900 text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
        <div className="w-full p-6 flex flex-col items-center">
          <h1 className="mb-6 text-2xl font-bold">Login Omong</h1>
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-500"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-500"
              placeholder="Sandi"
              type="password"
              value={form.sandi}
              onChange={(e) => setForm((prev) => ({ ...prev, sandi: e.target.value }))}
            />
            <button
              className="w-full rounded-lg bg-cyan-400 px-3 py-2 font-semibold text-slate-900 hover:bg-cyan-300 disabled:opacity-60"
              type="submit"
              disabled={isLoginPending}
            >
              {isLoginPending ? "Memproses..." : "Masuk"}
            </button>
            {loginError && <p className="text-sm text-rose-400">{(loginError as Error).message}</p>}
          </form>
          <p className="mt-5 text-sm text-slate-300">
            Belum punya akun?{" "}
            <Link to="/signup" className="text-cyan-300">
              Daftar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
