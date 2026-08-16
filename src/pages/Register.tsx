import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register as registerApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/lib/toast';
import { useHaptic } from '@/hooks/useHaptic';
import { getTelegramUser, isTelegramWebApp } from '@/lib/telegram';
import { apiErrorMessage } from '@/lib/apiError';
import { isPhoneComplete, toPhoneE164 } from '@/lib/phone';
import PhoneInput from '@/components/ui/PhoneInput';

const PASSWORD_MIN_LENGTH = 8;

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const haptic = useHaptic();
  const setSession = useAuthStore((s) => s.setSession);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  // Server qoidalari bilan bir xil: raqam `+998` + 9 ta raqam, parol >= 8 belgi.
  const errors = {
    name: name.trim() ? null : 'Ismingizni kiriting.',
    phone: isPhoneComplete(phone)
      ? null
      : "Raqamni to'liq kiriting: 9 ta raqam (masalan 90 123 45 67).",
    password:
      password.length >= PASSWORD_MIN_LENGTH
        ? null
        : `Parol kamida ${PASSWORD_MIN_LENGTH} ta belgidan iborat bo'lishi kerak.`,
    confirm: confirm === password ? null : 'Parollar mos kelmadi.',
  };
  const isValid = Object.values(errors).every((e) => e === null);

  const shown = (field: keyof typeof errors) => (touched[field] ? errors[field] : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!isValid) {
      setTouched({ name: true, phone: true, password: true, confirm: true });
      haptic.notification('error');
      return;
    }

    setSubmitting(true);
    try {
      const tgUser = isTelegramWebApp ? getTelegramUser() : undefined;
      const { data, token } = await registerApi({
        name: name.trim(),
        phone: toPhoneE164(phone),
        password,
        password_confirmation: confirm,
        telegram_id: tgUser ? String(tgUser.id) : null,
      });
      setSession(data, token);
      haptic.notification('success');
      navigate(next, { replace: true });
    } catch (err: unknown) {
      haptic.notification('error');
      showToast('error', apiErrorMessage(err, "Ro'yxatdan o'tishda xatolik."));
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FieldInput
          label="Ism"
          type="text"
          autoComplete="name"
          value={name}
          onChange={setName}
          onBlur={() => markTouched('name')}
          error={shown('name')}
        />
        <PhoneInput
          value={phone}
          onChange={setPhone}
          onBlur={() => markTouched('phone')}
          error={shown('phone')}
        />
        <FieldInput
          label={`Parol (kamida ${PASSWORD_MIN_LENGTH} ta belgi)`}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          onBlur={() => markTouched('password')}
          error={shown('password')}
        />
        <FieldInput
          label="Parolni tasdiqlang"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={setConfirm}
          onBlur={() => markTouched('confirm')}
          error={shown('confirm')}
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
  error,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
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
        aria-invalid={Boolean(error)}
        className="px-3 py-3 text-[15px] outline-none"
        style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          color: 'var(--tg-theme-text-color)',
          borderRadius: 'var(--storex-radius-md)',
          border: `1px solid ${error ? 'var(--storex-danger)' : 'var(--storex-border)'}`,
        }}
      />
      {error && (
        <span className="text-[12px]" style={{ color: 'var(--storex-danger)' }}>
          {error}
        </span>
      )}
    </label>
  );
}
