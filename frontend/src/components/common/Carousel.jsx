// src/components/common/Carousel.jsx
import React, { useState, useRef } from 'react';

export const Carousel = ({ items, title, renderItem }) => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const scroll = (direction) => {
        const element = scrollRef.current;
        const scrollAmount = 300;

        if (element) {
            element.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });

            setTimeout(checkScroll, 500);
        }
    };

    const checkScroll = () => {
        const element = scrollRef.current;
        if (element) {
            setCanScrollLeft(element.scrollLeft > 0);
            setCanScrollRight(
                element.scrollLeft < element.scrollWidth - element.clientWidth
            );
        }
    };

    React.useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <div className="relative">
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                    >
                        ←
                    </button>
                )}

                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-hidden scroll-smooth"
                >
                    {items.map((item) => (
                        <div key={item.id} className="flex-shrink-0 w-48">
                            {renderItem(item)}
                        </div>
                    ))}
                </div>

                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                    >
                        →
                    </button>
                )}
            </div>
        </div>
    );
};
