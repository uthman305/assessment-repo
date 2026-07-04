import type { SearchFilters as SearchFiltersType } from '../types';
import './SearchFilters.css';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onChange: (filters: SearchFiltersType) => void;
  onUseMyLocation: () => void;
  locationStatus: 'idle' | 'loading' | 'granted' | 'denied';
}

const CUISINES = ['Nigerian', 'Traditional Nigerian', 'Fast Food', 'South-South Nigerian', 'Afro-Fusion'];

export function SearchFiltersBar({ filters, onChange, onUseMyLocation, locationStatus }: SearchFiltersProps) {
  return (
    <div className="filters">
      <select
        className="filters__control"
        value={filters.cuisine ?? ''}
        onChange={(e) => onChange({ ...filters, cuisine: e.target.value || undefined })}
        aria-label="Filter by cuisine"
      >
        <option value="">All cuisines</option>
        {CUISINES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        className="filters__control"
        value={filters.priceRange ?? ''}
        onChange={(e) => onChange({ ...filters, priceRange: e.target.value ? Number(e.target.value) : undefined })}
        aria-label="Filter by price range"
      >
        <option value="">Any price</option>
        <option value="1">₦</option>
        <option value="2">₦₦</option>
        <option value="3">₦₦₦</option>
        <option value="4">₦₦₦₦</option>
      </select>

      <select
        className="filters__control"
        value={filters.minRating ?? ''}
        onChange={(e) => onChange({ ...filters, minRating: e.target.value ? Number(e.target.value) : undefined })}
        aria-label="Filter by minimum rating"
      >
        <option value="">Any rating</option>
        <option value="4.5">★ 4.5+</option>
        <option value="4">★ 4.0+</option>
        <option value="3">★ 3.0+</option>
      </select>

      <button
        className={`filters__location-btn ${filters.latitude ? 'is-active' : ''}`}
        onClick={onUseMyLocation}
        disabled={locationStatus === 'loading'}
      >
        {locationStatus === 'loading' ? 'Locating…' : filters.latitude ? '📍 Sorted by distance' : '📍 Use my location'}
      </button>
    </div>
  );
}
