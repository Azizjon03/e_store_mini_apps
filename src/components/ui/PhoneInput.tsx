import { useLayoutEffect, useRef } from 'react';
import { formatPhoneNational, parsePhoneNational } from '@/lib/phone';

interface PhoneInputProps {
  /** 9 xonali milliy qism, masksiz: `901234567`. */
  value: string;
  onChange: (nationalDigits: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string | null;
  autoFocus?: boolean;
}

/**
 * `+998` prefiksi input'dan tashqarida — foydalanuvchi uni o'chira olmaydi,
 * shuning uchun serverga har doim to'g'ri formatda raqam ketadi.
 */
export default function PhoneInput({
  value,
  onChange,
  onBlur,
  label = 'Telefon raqam',
  error,
  autoFocus,
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // onChange'dan keyin kursor qaysi raqamdan keyin turishi kerakligi.
  const caretDigitsRef = useRef<number | null>(null);

  const formatted = formatPhoneNational(value);
  const invalid = Boolean(error);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const caret = e.target.selectionStart ?? raw.length;
    caretDigitsRef.current = raw.slice(0, caret).replace(/\D+/g, '').length;
    onChange(parsePhoneNational(raw));
  };

  // Qiymat qayta formatlangach kursor oxiriga sakrab ketmasligi uchun uni
  // o'sha raqamdan keyingi joyga qaytaramiz.
  useLayoutEffect(() => {
    const el = inputRef.current;
    const target = caretDigitsRef.current;
    caretDigitsRef.current = null;
    if (!el || target === null || document.activeElement !== el) return;

    let seen = 0;
    let pos = formatted.length;
    for (let i = 0; i <= formatted.length; i += 1) {
      if (seen === target) {
        pos = i;
        break;
      }
      if (i < formatted.length && /\d/.test(formatted[i])) seen += 1;
    }
    el.setSelectionRange(pos, pos);
  }, [formatted]);

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px]" style={{ color: 'var(--tg-theme-hint-color)' }}>
        {label}
      </span>
      <div
        className="flex items-center"
        style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          borderRadius: 'var(--storex-radius-md)',
          border: `1px solid ${invalid ? 'var(--storex-danger)' : 'var(--storex-border)'}`,
        }}
      >
        <span
          className="pl-3 pr-2 text-[15px] select-none"
          style={{ color: 'var(--tg-theme-hint-color)' }}
        >
          +998
        </span>
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          autoFocus={autoFocus}
          value={formatted}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder="90 123 45 67"
          aria-invalid={invalid}
          // `maxLength` YO'Q: foydalanuvchi odat bo'yicha `998`ni ham qo'lda
          // terishi mumkin, va u kod ekanligi faqat 10-raqam kiritilganda
          // ma'lum bo'ladi. Uzunlikni `parsePhoneNational` cheklaydi.
          className="flex-1 min-w-0 py-3 pr-3 text-[15px] bg-transparent outline-none tracking-[0.02em]"
          style={{ color: 'var(--tg-theme-text-color)' }}
        />
      </div>
      {error && (
        <span className="text-[12px]" style={{ color: 'var(--storex-danger)' }}>
          {error}
        </span>
      )}
    </label>
  );
}
