import type { Address } from '@/api/types';

/**
 * Joins an address's location parts into a single display line, skipping any
 * that are empty. Seeded rows can carry an empty `city`/`district`, and an
 * unconditional join (the pattern this replaces) produced a leading ", , "
 * in front of `full_address` on the checkout address card, order detail, and
 * the addresses list.
 */
export function formatAddressLine(address: Pick<Address, 'city' | 'district' | 'full_address'>): string {
  return [address.city, address.district, address.full_address]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
}
