import { useEffect, useState } from 'react';
import type { Restaurant, RestaurantDetail, SearchFilters } from '../types';
import { getRestaurant, searchRestaurants, submitReview } from '../api/client';
import { RestaurantCard, RestaurantCardSkeleton } from '../components/RestaurantCard';
import { SearchFiltersBar } from '../components/SearchFilters';
import './DiscoverPage.css';

interface DiscoverPageProps {
  userId: string;
}

export function DiscoverPage({ userId }: DiscoverPageProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchRestaurants(filters)
      .then((data) => {
        if (!cancelled) setRestaurants(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load restaurants');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus('granted');
        setFilters((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude, radius: 50 }));
      },
      () => setLocationStatus('denied'),
    );
  };

  return (
    <div className="discover">
      <SearchFiltersBar
        filters={filters}
        onChange={setFilters}
        onUseMyLocation={handleUseMyLocation}
        locationStatus={locationStatus}
      />

      {error && <p className="discover__error">Something went wrong: {error}</p>}

      {!loading && !error && restaurants.length === 0 && (
        <div className="discover__empty">
          <p>No bukas match those filters. Try widening your search.</p>
        </div>
      )}

      <div className="discover__grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)
          : restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} onSelect={setSelectedId} />)}
      </div>

      {selectedId && (
        <RestaurantDetailPanel restaurantId={selectedId} userId={userId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

interface RestaurantDetailPanelProps {
  restaurantId: string;
  userId: string;
  onClose: () => void;
}

function RestaurantDetailPanel({ restaurantId, userId, onClose }: RestaurantDetailPanelProps) {
  const [detail, setDetail] = useState<RestaurantDetail | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const load = () => {
    getRestaurant(restaurantId).then(setDetail).catch(() => setDetail(null));
  };

  useEffect(load, [restaurantId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setReviewError(null);
    try {
      await submitReview(restaurantId, { userId, rating, comment, tags: [] });
      setReviewSuccess(true);
      setComment('');
      load();
    } catch (err: any) {
      setReviewError(err.message ?? 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="detail-panel__close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {!detail ? (
          <p>Loading…</p>
        ) : (
          <>
            <h2>{detail.name}</h2>
            <p className="detail-panel__meta">
              {detail.cuisine} · {'₦'.repeat(detail.priceRange)} · ★ {detail.avgRating.toFixed(1)} · {detail.address}
            </p>
            <div className="detail-panel__tags">
              {detail.tags.map((t) => (
                <span key={t} className="rcard__tag">
                  #{t}
                </span>
              ))}
            </div>

            <h3 className="detail-panel__section-title">Reviews ({detail.reviews.length})</h3>
            <ul className="detail-panel__reviews">
              {detail.reviews.map((rev) => (
                <li key={rev.id} className="review-item">
                  <div className="review-item__head">
                    <strong>{rev.userName}</strong>
                    <span>★ {rev.rating}</span>
                  </div>
                  <p>{rev.comment}</p>
                </li>
              ))}
              {detail.reviews.length === 0 && <p className="discover__empty">No reviews yet — be the first!</p>}
            </ul>

            <h3 className="detail-panel__section-title">Leave a review</h3>
            <form className="review-form" onSubmit={handleSubmitReview}>
              <label>
                Rating
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} ★
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                placeholder="How was the food?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                minLength={1}
              />
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
              {reviewError && <p className="discover__error">{reviewError}</p>}
              {reviewSuccess && !reviewError && <p className="review-form__success">Review submitted!</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
