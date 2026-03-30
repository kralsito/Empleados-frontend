'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/actions/auth';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginAction({ email, password });
      router.push('/dashboard');
    } catch {
      setError('Credenciales inválidas. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
  <main className="login-page min-h-screen flex flex-col items-center justify-center bg-brand-black relative overflow-hidden px-4 py-8">

    <div className="login-enter relative z-10 flex flex-col items-center gap-6 w-full max-w-[420px]">

      <div className="login-enter-logo flex flex-col items-center gap-3">
        <Image
          src="/images/logologin.png"
          alt="Logo"
          width={600}
          height={240}
          priority
          className="w-48 sm:w-64 md:w-80 h-auto"
        />
        <div className="flex items-center gap-2 sm:gap-3 w-full justify-center">
          <span className="h-px w-8 sm:w-12 bg-brand-red/40" />
          <span className="text-sm sm:text-lg font-semibold text-brand-white text-center" style={{ fontFamily: 'var(--font-body)' }}>
            Sistema de gestión de empleados
          </span>
          <span className="h-px w-8 sm:w-12 bg-brand-red/40" />
        </div>
      </div>

      <div className="login-enter-card w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl shadow-[0_0_0_1px_rgba(227,6,19,0.06),0_24px_48px_rgba(0,0,0,0.5)] p-6 sm:p-8">

        <div className="mb-6 sm:mb-7">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-white tracking-tight leading-none text-center">
            Iniciar sesión
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:gap-5">

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-brand-gray/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              className="login-field w-full rounded-xl px-4 py-3 text-sm bg-white/[0.05] text-brand-white border border-white/[0.08] placeholder:text-white/20 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-brand-gray/80">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="login-field w-full rounded-xl px-4 py-3 text-sm bg-white/[0.05] text-brand-white border border-white/[0.08] placeholder:text-white/20 outline-none transition-all"
            />
          </div>

          {error && (
            <div role="alert" className="flex items-center gap-2.5 text-[0.8rem] text-red-300 bg-brand-red/10 border border-brand-red/20 rounded-xl px-4 py-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="login-btn relative mt-1 w-full overflow-hidden rounded-xl px-6 py-3.5 bg-brand-red text-brand-white font-bold text-sm tracking-widest uppercase shadow-[0_4px_20px_rgba(227,6,19,0.4)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(227,6,19,0.55)] active:translate-y-0"
          >
            <span className="login-btn-shimmer" aria-hidden="true" />
            <span className="relative z-10 flex items-center justify-center gap-2.5">
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
                  Entrando…
                </>
              ) : (
                <>
                  Entrar
                  <span className="login-btn-arrow">→</span>
                </>
              )}
            </span>
          </button>

        </form>
      </div>

      <p className="text-[0.65rem] text-white/20 tracking-widest uppercase">
        Acceso restringido · Solo personal autorizado
      </p>
    </div>
  </main>
  );
}