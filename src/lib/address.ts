import type { Address } from '@/api/types';

/**
 * Renders an address's display line.
 *
 * Verified against the running backend (`AddressController::formatAddress`
 * and the seeded rows via `GET /addresses`): `full_address` is already a
 * complete, human-readable address on its own — e.g. "Toshkent sh.,
 * Chilonzor tumani, 7-kvartal, 15-uy" — and every seeded row has empty
 * `city`/`district` (`""`, cast from `null` on the backend). `city`/
 * `district` are separate structured fields that, when a user *does* fill
 * them in, repeat words already present in `full_address` (backend
 * validation for POST/PUT /addresses never recomputes `full_address` from
 * them). Concatenating all three — the pattern this replaces — produced
 * `", , "` when the parts were empty, and a literal duplicate ("Toshkent,
 * Mirzo Ulug'bek, Toshkent sh., Mirzo Ulug'bek tumani, ...") once they were
 * filled in.
 *
 * So `full_address` is the single source of truth for display; `city`/
 * `district` are only used to compose a line in the (currently theoretical,
 * since the backend requires `full_address`) case where it's missing.
 */
export function formatAddressLine(address: Pick<Address, 'city' | 'district' | 'full_address'>): string {
  const full = address.full_address?.trim();
  if (full) return full;

  return [address.city, address.district]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
}
