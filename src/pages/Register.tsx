import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register as registerApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/lib/toast';
import { useHaptic } from '@/hooks/useHaptic';
import { getTelegramUser, isTelegramWebApp } from '@/lib/telegram';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const haptic = useHaptic();
  const setSession = useAuthStore((s) => s.setSession);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const next = searchParams.get('next') || '/';

  // Prefill name from Telegram when running inside WebApp.
  useEffect(() => {
    if (!isTelegramWebApp) return;
    const tgUser = getTelegramUser();
    if (tgUser) {
      const full = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ').trim();
      if (full) setName((prev) => prev || full);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (password !== confirm) {
      showToast('error', 'Parollar mos kelmadi.');
      return;
    }

    setSubmitting(true);
    try {
      const tgUser = isTelegramWebApp ? getTelegramUser() : undefined;
      const { data, token } = await registerApi({
        name: name.trim(),
        phone,
        password,
        password_confirmation: confirm,
        telegram_id: tgUser ? String(tgUser.id) : null,
      });
      setSession(data, token);
      haptic.notification('success');
      navigate(next, { replace: true });
    } catch (err: unknown) {
      haptic.notification('error');
      const response = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
      const firstError = response?.errors ? Object.values(response.errors)[0]?.[0] : undefined;
      showToast('error', firstError ?? response?.message ?? "Ro'yxatdan o'tishda xatolik.");
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
        Ro'yxatdan o'tish
      </h1>
      <p
        className="text-[14px] mb-8"
        style={{ color: 'var(--tg-theme-hint-color)' }}
      >
        Buyurtma berish uchun hisob yarating.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FieldInput
          label="Ism"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={setName}
        />
        <FieldInput
          label="Telefon raqam"
          type="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={setPhone}
          placeholder="+998901234567"
        />
        <FieldInput
          label="Parol (kamida 8 belgi, harf va raqam)"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={setPassword}
        />
        <FieldInput
          label="Parolni tasdiqlang"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={setConfirm}
        />

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
          {submitting ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
        </button>
      </form>

      <p
        className="mt-6 text-center text-[13px]"
        style={{ color: 'var(--tg-theme-hint-color)' }}
      >
        Akkauntingiz bormi?{' '}
        <Link
          to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}
          style={{ color: 'var(--storex-primary)', fontWeight: 600 }}
        >
          Kirish
        </Link>
      </p>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
        {label}
      </span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-3 text-[15px] outline-none"
        style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          color: 'var(--tg-theme-text-color)',
          borderRadius: 'var(--storex-radius-md)',
          border: '1px solid var(--storex-border)',
        }}
      />
    </label>
  );
}
