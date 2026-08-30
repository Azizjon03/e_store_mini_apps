import type { PaymentMethodOption } from '@/api/types';

/**
 * Uzbek label for a payment method id.
 *
 * The set of methods is per-store configuration and lives in the backend
 * (GET /checkout/payment-methods returns the ids together with their already
 * localised names), so this app keeps no table of its own: a store that turns
 * on a new provider must not need a frontend release to have it named.
 *
 * Order of preference:
 *  1. the name on the store's current method list — the authoritative,
 *     localised source,
 *  2. the order's own `payment_method_name`, for a method the store has since
 *     disabled and which therefore no longer appears on that list,
 *  3. the raw id, capitalised — last resort, when the list has not loaded and
 *     the order carries no name either.
 */
export function resolvePaymentLabel(
  methodId: string,
  methods: PaymentMethodOption[] | undefined,
  orderMethodName?: string,
): string {
  const known = methods?.find((m) => m.id === methodId);
  if (known) return known.name;
  if (orderMethodName) return orderMethodName;
  if (!methodId) return '—';
  return methodId.charAt(0).toUpperCase() + methodId.slice(1);
}

/**
 * The backend's `icon` field has been observed carrying a bare filename
 * ("cash.svg") with no asset behind it, which would render as a broken image.
 * Only an actual URL — absolute, or root-relative — is worth putting in an
 * `<img>`; anything else falls back to the drawn glyph.
 */
export function paymentIconUrl(icon: string | undefined): string | null {
  if (!icon) return null;
  return /^(https?:\/\/|\/)/.test(icon) ? icon : null;
}
