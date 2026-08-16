import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '@/lib/toast';
import { useHaptic } from '@/hooks/useHaptic';
import { apiErrorMessage } from '@/lib/apiError';
import { isPhoneComplete, toPhoneE164 } from '@/lib/phone';
import PhoneInput from '@/components/ui/PhoneInput';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const haptic = useHaptic();
  const setSession = useAuthStore((s) => s.setSession);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const next = searchParams.get('next') || '/';

  const phoneError =
    phoneTouched && !isPhoneComplete(phone)
      ? "Raqamni to'liq kiriting: 9 ta raqam (masalan 90 123 45 67)."
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!isPhoneComplete(phone)) {
      setPhoneTouched(true);
      haptic.notification('error');
      return;
    }

    setSubmitting(true);
    try {
      const { data, token } = await login({ phone: toPhoneE164(phone), password });
      setSession(data, token);
      haptic.notification('success');
      navigate(next, { replace: true });
    } catch (err: unknown) {
      haptic.notification('error');
      showToast('error', apiErrorMessage(err, "Telefon yoki parol noto'g'ri."));
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <PhoneInput
          value={phone}
          onChange={setPhone}
          onBlur={() => setPhoneTouched(true)}
          error={phoneError}
        />

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
