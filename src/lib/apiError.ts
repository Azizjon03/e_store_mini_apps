/**
 * Auth so'rovlaridagi xatolarni foydalanuvchiga ko'rsatiladigan o'zbekcha
 * matnga aylantiradi. Laravel 422'da birinchi maydon xatosini, 429'da esa
 * inglizcha "Too Many Attempts." qaytaradi — uni shundayligicha ko'rsatib
 * bo'lmaydi.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    code?: string;
    response?: {
      status?: number;
      data?: { message?: string; errors?: Record<string, string[]> };
    };
  };

  if (!e?.response) {
    return e?.code === 'ECONNABORTED'
      ? "So'rov vaqti tugadi. Internetni tekshirib, qayta urinib ko'ring."
      : "Serverga ulanib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.";
  }

  const { status, data } = e.response;

  if (status === 429) {
    return "Juda ko'p urinish bo'ldi. Bir daqiqadan so'ng qayta urinib ko'ring.";
  }

  if (status === 422 && data?.errors) {
    const first = Object.values(data.errors)[0]?.[0];
    if (first) return first;
  }

  if (status && status >= 500) {
    return "Serverda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.";
  }

  return data?.message ?? fallback;
}
