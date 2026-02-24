/**
 * Multilingual field'dan string olish.
 * API { uz: "...", ru: "...", en: "..." } yoki oddiy string qaytarishi mumkin.
 */
export function t(value: string | Record<string, string> | undefined, lang = 'uz'): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.uz || value.ru || value.en || Object.values(value)[0] || '';
}

export function formatPrice(price: number): string {
  return price.toLocaleString('uz-UZ') + " so'm";
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'yan', 'fev', 'mar', 'apr', 'may', 'iyn',
    'iyl', 'avg', 'sen', 'okt', 'noy', 'dek',
  ];
  return `${date.getDate()}-${months[date.getMonth()]}, ${date.getFullYear()}`;
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    'yan', 'fev', 'mar', 'apr', 'may', 'iyn',
    'iyl', 'avg', 'sen', 'okt', 'noy', 'dek',
  ];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()}-${months[date.getMonth()]} ${hours}:${minutes}`;
}
