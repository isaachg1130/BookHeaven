import React, { useMemo, useCallback } from 'react';
import './UnifiedContentCarousel.css';

/* ================================
   Skeleton Loader
================================ */
const SkeletonLoader = ({ count = 4 }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div key={`skeleton-${i}`} className="content-card skeleton">
                <div className="content-card__image skeleton-img" />
                <div className="content-card__info">
                    <div className="skeleton-text skeleton-title" />
                    <div className="skeleton-text skeleton-author" />
                </div>
            </div>
        ))}
    </>
);

/* ================================
   Content Badge
================================ */
const ContentBadge = React.memo(({ isPremium, type }) => (
    <div className="content-badge">
        {isPremium && <span className="badge badge--premium">✦ Premium</span>}
        {type && <span className={`badge badge--${type}`}>{type}</span>}
    </div>
));

ContentBadge.displayName = 'ContentBadge';

/* ================================
   Content Card
================================ */
const ContentCard = React.memo(({ item, onClickItem }) => {

    const handleClick = useCallback(() => {
        onClickItem?.(item);
    }, [item, onClickItem]);

    const imageSrc = useMemo(() => {
        if (!item?.imagen) return '/placeholder.jpg';

        return item.imagen.startsWith('http')
            ? item.imagen
            : `/storage/${item.imagen}`;
    }, [item?.imagen]);

    return (
        <div className="content-card" onClick={handleClick}>
            <div className="content-card__image">
                <img
                    src={imageSrc}
                    alt={item?.titulo || 'Contenido'}
                    loading="lazy"
                    className="content-card__img-element"
                    onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                    }}
                />
                {item?.is_premium && (
                    <div className="content-card__premium-overlay">
                        Premium
                    </div>
                )}
            </div>

            <div className="content-card__info">
                <h4 className="content-card__title">
                    {item?.titulo || 'Sin título'}
                </h4>
                <p className="content-card__author">
                    {item?.autor || 'Autor desconocido'}
                </p>

                <ContentBadge
                    isPremium={item?.is_premium}
                    type={item?.type}
                />
            </div>
        </div>
    );
});

ContentCard.displayName = 'ContentCard';

/* ================================
   Unified Content Carousel
================================ */
const UnifiedContentCarousel = React.memo(({
    content = [],
    loading = false,
    categories = [],
    onCategoriesChange,
    onItemClick,
    title = 'Contenido',
}) => {

    /* 🔥 Filtro REAL por categorías */
    const filteredContent = useMemo(() => {
        if (!categories?.length) return content;
        return content.filter(item => categories.includes(item.type));
    }, [content, categories]);

    /* 🔥 Callback estable */
    const handleCategoryToggle = useCallback((type) => {
        const exists = categories.includes(type);

        const newCategories = exists
            ? categories.filter(c => c !== type)
            : [...categories, type];

        onCategoriesChange?.(newCategories);
    }, [categories, onCategoriesChange]);

    /* 🔥 Constante fuera de render */
    const categoryFilters = useMemo(() => [
        { label: 'Libros', value: 'libro' },
        { label: 'Mangas', value: 'manga' },
        { label: 'Cómics', value: 'comic' },
        { label: 'Audiolibros', value: 'audiobook' },
    ], []);

    return (
        <div className="unified-carousel">
            <div className="carousel-header">
                <h2 className="carousel-title">{title}</h2>

                <div className="category-filters">
                    {categoryFilters.map(filter => {
                        const isActive = categories.includes(filter.value);

                        return (
                            <button
                                key={filter.value}
                                className={`filter-btn ${isActive ? 'active' : ''}`}
                                onClick={() => handleCategoryToggle(filter.value)}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="carousel-grid">
                {loading ? (
                    <SkeletonLoader count={8} />
                ) : filteredContent.length > 0 ? (
                    filteredContent.map(item => (
                        <ContentCard
                            key={item.id}
                            item={item}
                            onClickItem={onItemClick}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No hay contenido disponible</p>
                    </div>
                )}
            </div>
        </div>
    );
});

UnifiedContentCarousel.displayName = 'UnifiedContentCarousel';

export default UnifiedContentCarousel;
export { SkeletonLoader, ContentCard, ContentBadge };
