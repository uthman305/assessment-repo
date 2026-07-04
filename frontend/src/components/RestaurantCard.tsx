import { useState } from 'react';
import type { Restaurant } from '../types';
import { toggleFavorite } from '../api/client';
import './RestaurantCard.css';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: (id: string) => void;
}

export function RestaurantCard({ restaurant, onSelect }: RestaurantCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgSrc, setImgSrc] = useState(restaurant.images[0] || FALLBACK_IMAGE);
  const [favoriteError, setFavoriteError] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isFavorite;
    // Optimistic update: reflect the new state before the network call resolves.
    setIsFavorite(nextState);
    setFavoriteError(false);
    try {
      await toggleFavorite(restaurant.id, nextState);
    } catch {
      // Roll back on failure.
      setIsFavorite(!nextState);
      setFavoriteError(true);
    }
  };

  return (
    <article className="rcard" onClick={() => onSelect(restaurant.id)} role="button" tabIndex={0}>
      <div className="rcard__image-wrap">
        <img
          className="rcard__image"
          src={imgSrc}
          alt={restaurant.name}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          loading="lazy"
        />
        {!restaurant.isOpen && <span className="rcard__closed-badge">Closed now</span>}
        {restaurant.distance !== undefined && (
          <span className="rcard__distance-badge">{restaurant.distance} km away</span>
        )}
        <button
          className={`rcard__fav-btn ${isFavorite ? 'is-active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? `Remove ${restaurant.name} from favorites` : `Save ${restaurant.name} to favorites`}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>
      <div className="rcard__body">
        <div className="rcard__title-row">
          <h3 className="rcard__title">{restaurant.name}</h3>
          <span className="rcard__price">{'₦'.repeat(restaurant.priceRange)}</span>
        </div>
        <p className="rcard__meta">
          {restaurant.cuisine} · <span className="rcard__rating">★ {restaurant.avgRating.toFixed(1)}</span>
        </p>
        <div className="rcard__tags">
          {restaurant.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rcard__tag">
              #{tag}
            </span>
          ))}
        </div>
        {favoriteError && <p className="rcard__error">Couldn't save — try again.</p>}
      </div>
    </article>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="rcard rcard--skeleton" aria-hidden="true">
      <div className="rcard__image-wrap skeleton-block" />
      <div className="rcard__body">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--meta" />
        <div className="skeleton-line skeleton-line--tags" />
      </div>
    </div>
  );
}
