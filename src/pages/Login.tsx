import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/lib/toast';
import { useHaptic } from '@/hooks/useHaptic';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const haptic = useHaptic();
  const setSession = useAuthStore((s) => s.setSession);

  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const next = searchParams.get('next') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data, token } = await login({ phone, password });
      setSession(data, token);
      haptic.notification('success');
      navigate(next, { replace: true });
    } catch (err: unknown) {
      haptic.notification('error');
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Telefon yoki parol noto'g'ri.";
      showToast('error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col px-4 pt-10 pb-6"
      style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
    >
      <h1
        className="text-[28px] font-bold mb-2"
        style={{ color: 'var(--tg-theme-text-color)' }}
      >
        Kirish
      </h1>
      <p
        className="text-[14px] mb-8"
        style={{ color: 'var(--tg-theme-hint-color)' }}
      >
        Buyurtma berish uchun tizimga kiring.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-[12px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
            Telefon raqam
          </span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998901234567"
            className="px-3 py-3 text-[15px] outline-none"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              color: 'var(--tg-theme-text-color)',
              borderRadius: 'var(--storex-radius-md)',
              border: '1px solid var(--storex-border)',
            }}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[12px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
            Parol
          </span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-3 text-[15px] outline-none"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              color: 'var(--tg-theme-text-color)',
              borderRadius: 'var(--storex-radius-md)',
              border: '1px solid var(--storex-border)',
            }}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 py-3 text-[15px] font-semibold press-effect disabled:opacity-50"
          style={{
            backgroundColor: 'var(--storex-primary)',
            color: '#fff',
            borderRadius: 'var(--storex-radius-md)',
          }}
        >
          {submitting ? 'Kirish...' : 'Kirish'}
        </button>
      </form>

      <p
        className="mt-6 text-center text-[13px]"
        style={{ color: 'var(--tg-theme-hint-color)' }}
      >
        Akkauntingiz yo'qmi?{' '}
        <Link
          to={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
          style={{ color: 'var(--storex-primary)', fontWeight: 600 }}
        >
          Ro'yxatdan o'tish
        </Link>
      </p>
    </div>
  );
}
