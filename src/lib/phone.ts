/**
 * O'zbekiston telefon raqamlari uchun mask va validatsiya.
 *
 * Backend (`RegisterRequest` / `LoginRequest`) raqamni avval normallashtiradi
 * — barcha raqam bo'lmagan belgilarni olib tashlab, oldiga `+` qo'yadi — va
 * keyin `/^\+?998\d{9}$/` bilan tekshiradi. Ya'ni serverga aynan `998` + 9 ta
 * raqam yetib borishi shart; aks holda 422 qaytadi.
 *
 * Shuning uchun UI'da faqat 9 xonali "milliy" qism tahrirlanadi, `+998` esa
 * input'dan tashqarida turadi va o'chirilmaydi.
 */

export const PHONE_COUNTRY_CODE = '998';
export const PHONE_NATIONAL_LENGTH = 9;

/**
 * Foydalanuvchi kiritgan (yoki qo'ygan) matndan 9 xonali milliy qismni ajratadi.
 *
 * Qo'llab-quvvatlanadigan ko'rinishlar: `901234567`, `90 123 45 67`,
 * `+998901234567`, `998901234567`, `00998901234567`, `(90) 123-45-67`.
 *
 * `998` prefiksi faqat raqamlar soni 9 tadan ko'p bo'lgandagina olib
 * tashlanadi — chunki `99` ham haqiqiy operator kodi va `998123456` o'zi
 * to'liq milliy raqam bo'lishi mumkin.
 */
export function parsePhoneNational(input: string): string {
  let digits = input.replace(/\D+/g, '');

  if (digits.length > PHONE_NATIONAL_LENGTH && digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  if (digits.length > PHONE_NATIONAL_LENGTH && digits.startsWith(PHONE_COUNTRY_CODE)) {
    digits = digits.slice(PHONE_COUNTRY_CODE.length);
  }

  return digits.slice(0, PHONE_NATIONAL_LENGTH);
}

/** `901234567` → `90 123 45 67` (2-3-2-2). Qisman kiritishda ham ishlaydi. */
export function formatPhoneNational(digits: string): string {
  const d = digits.slice(0, PHONE_NATIONAL_LENGTH);
  const groups = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)];
  return groups.filter(Boolean).join(' ');
}

export function isPhoneComplete(digits: string): boolean {
  return digits.length === PHONE_NATIONAL_LENGTH;
}

/** Serverga yuboriladigan kanonik ko'rinish: `+998901234567`. */
export function toPhoneE164(digits: string): string {
  return `+${PHONE_COUNTRY_CODE}${digits}`;
}
