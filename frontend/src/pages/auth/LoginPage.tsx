import { useEffect, useState, type FormEvent } from "react";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/hooks/useAuthMutations";
import { InputField } from "@/components/forms/InputField";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/forms/Button";
import { showToast } from "@/store/toast.store";

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [form, setForm] = useState({ email: "", sandi: "" });
  const [err, setErr] = useState("");

  const { mutate: login, isPending: isLoginPending } = useLoginMutation();

  useEffect(() => {
    setErr("");
  }, [form]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    login(form, {
      onSuccess: (user) => {
        setUser(user);
        showToast("success", "Berhasil login");
        navigate("/rooms");
      },
      onError: (e) => {
        setErr(e.message);
      },
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-indigo-900 to-fuchsia-800 text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
        <div className="w-full p-6">
          <div className="mx-auto mb-4" style={{ maxWidth: "200px" }}>
            <h1 className="mb-2 font-bold">Login member</h1>
            <img src="/img/logo_white.svg" alt="omong logo" />
          </div>
          {err && <p className="bg-rose-900 text-sm text-rose-100 mb-4 rounded px-3 py-1">{err}</p>}
          <form onSubmit={onSubmit} className="space-y-4">
            <InputField
              label="Email"
              leftIcon={<Mail size={16} />}
              placeholder="Email"
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <InputField
              label="Password"
              leftIcon={<Lock size={16} />}
              placeholder="Password"
              type="password"
              required
              value={form.sandi}
              onChange={(e) => setForm((prev) => ({ ...prev, sandi: e.target.value }))}
            />
            <Button className="w-full mt-3" type="submit" disabled={isLoginPending}>
              {isLoginPending ? "Proccessing..." : "Login"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-slate-300 text-center">
            Don't have an account yet?{" "}
            <Link to="/signup" className="font-semibold text-white">
              Register
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
