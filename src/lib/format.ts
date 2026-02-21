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
