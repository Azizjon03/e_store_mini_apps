export type PaymentMethodId = 'click' | 'payme' | 'cash';

const PAYMENT_METHOD_LABELS: Record<PaymentMethodId, string> = {
  click: 'Click',
  payme: 'Payme',
  cash: 'Naqd pul',
};

/**
 * Uzbek label for a payment method enum value — the same wording checkout's
 * own payment-method list already shows. Order detail's `payment_method_name`
 * field from the backend is not reliably translated (observed returning the
 * raw "Cash"), so that field is not used as a label source; this derives the
 * label from the reliable `payment_method` enum instead.
 */
export function getPaymentMethodLabel(method: PaymentMethodId): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}
