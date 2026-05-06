import { useState, type FormEvent } from "react";
import { Lock, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSignupMutation } from "@/hooks/useAuthMutations";
import { InputField } from "@/components/forms/InputField";
import { Button } from "@/components/forms/Button";
import { showToast } from "@/store/toast.store";

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nama: "", email: "", sandi: "" });
  const [err, setErr] = useState("");

  const { mutate: signup, isPending: isSignupPending } = useSignupMutation();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    signup(form, {
      onSuccess: (e) => {
        showToast("success", e.pesan);
        navigate("/login");
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
            <p className="mb-2 font-bold">Registration</p>
            <img src="/img/logo_white.svg" alt="omong logo" />
          </div>
          {err && <p className="bg-rose-900 text-sm text-rose-100 mb-4 rounded px-3 py-1">{err}</p>}
          <form onSubmit={onSubmit} className="space-y-4">
            <InputField
              label="Name"
              leftIcon={<UserRound size={16} />}
              placeholder="Name"
              value={form.nama}
              onChange={(e) => setForm((prev) => ({ ...prev, nama: e.target.value }))}
            />
            <InputField
              label="Email"
              leftIcon={<Mail size={16} />}
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <InputField
              label="Password"
              leftIcon={<Lock size={16} />}
              placeholder="Password"
              type="password"
              value={form.sandi}
              onChange={(e) => setForm((prev) => ({ ...prev, sandi: e.target.value }))}
            />

            <Button className="w-full mt-3" type="submit" disabled={isSignupPending}>
              {isSignupPending ? "Proccessing..." : "Register"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-slate-300 text-center">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-white">
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
