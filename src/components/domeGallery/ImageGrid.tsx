import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

import './ImageGrid.css';
import { PhotoDetails } from '@/app/types';
import { deletePhoto } from '@/lib/api';

/* ─── hooks ─── */
const useMedia = (queries: string[], values: number[], defaultValue: number): number => {
  const get = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  const [value, setValue] = useState<number>(get);
  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
  }, [queries]);
  return value;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
};

const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(
    urls.map(src => new Promise<void>(resolve => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => resolve();
    }))
  );
};

/* ─── helpers ─── */
function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatFull(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function AvatarInitials({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const palette = ['#7C6AF7','#3ABCA8','#E27259','#D45C8C','#4FA3E0','#6ABF56'];
  const bg = palette[name.charCodeAt(0) % palette.length];
  return (
    <div className="avatar-initials" style={{ background: bg }}>
      {initials}
    </div>
  );
}

/* ─── types ─── */
interface GridItem extends PhotoDetails {
  x: number; y: number; w: number; h: number;
}

interface MasonryProps {
  items: PhotoDetails[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random';
  scaleOnHover?: boolean;
  hoverScale?: number;
}

/* ─── component ─── */
const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
}) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const hasMounted = useRef(false);

  const closePopup = () => {
    setSelectedIndex(undefined);
    setDeleteConfirm(false);
    setDeleting(false);
  };

  const getInitialPosition = (item: GridItem) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };
    let direction = animateFrom;
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'];
      direction = dirs[Math.floor(Math.random() * dirs.length)] as typeof animateFrom;
    }
    switch (direction) {
      case 'top':    return { x: item.x, y: -200 };
      case 'bottom': return { x: item.x, y: window.innerHeight + 200 };
      case 'left':   return { x: -200, y: item.y };
      case 'right':  return { x: window.innerWidth + 200, y: item.y };
      case 'center': return {
        x: containerRect.width / 2 - item.w / 2,
        y: containerRect.height / 2 - item.h / 2,
      };
      default: return { x: item.x, y: item.y + 100 };
    }
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(false);
    setSelectedIndex(prev =>
      prev === undefined ? undefined : prev === 0 ? grid.length - 1 : prev - 1
    );
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(false);
    setSelectedIndex(prev =>
      prev === undefined ? undefined : prev === grid.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    preloadImages(items.map(i => i.image_url)).then(() => setImagesReady(true));
  }, [items]);

  const grid = useMemo<GridItem[]>(() => {
    if (!width) return [];
    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;
    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const height = 300;
      const y = colHeights[col];
      colHeights[col] += height;
      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width]);

  const selectedPhoto = selectedIndex !== undefined && grid[selectedIndex]
    ? grid[selectedIndex]
    : null;

  useLayoutEffect(() => {
    if (!imagesReady) return;
    grid.forEach((item, index) => {
      const selector = `[data-key="${item._id}"]`;
      const animationProps = { x: item.x, y: item.y, width: item.w, height: item.h };
      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item);
        gsap.fromTo(selector,
          { opacity: 0, x: initialPos.x, y: initialPos.y, width: item.w, height: item.h },
          { opacity: 1, ...animationProps, duration: 0.8, ease: 'power3.out', delay: index * stagger }
        );
      } else {
        gsap.to(selector, { ...animationProps, duration, ease, overwrite: 'auto' });
      }
    });
    hasMounted.current = true;
  }, [grid, imagesReady, stagger, animateFrom, duration, ease]);

  const handleMouseEnter = (_e: React.MouseEvent, item: GridItem) => {
    if (scaleOnHover) gsap.to(`[data-key="${item._id}"]`, { scale: hoverScale, duration: 0.3, ease: 'power2.out' });
  };

  const handleMouseLeave = (_e: React.MouseEvent, item: GridItem) => {
    if (scaleOnHover) gsap.to(`[data-key="${item._id}"]`, { scale: 1, duration: 0.3, ease: 'power2.out' });
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleting(true);
    try {
      await deletePhoto(photoId);
      setTimeout(closePopup, 500);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  return (
    <div ref={containerRef} className="masonry-list">

      {/* ── Lightbox overlay ── */}
      {selectedIndex !== undefined && selectedPhoto && (
        <div className="popup-overlay" onClick={closePopup}>

          <button className="popup-nav popup-nav--left" onClick={showPrev}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="popup-card" onClick={e => e.stopPropagation()}>

            {/* Image pane */}
            <div className="popup-image-pane">
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.uploaded_by_name ?? 'Photo'}
                className="popup-image"
              />
            </div>

            {/* Info sidebar */}
            <div className="popup-sidebar">

              <button className="popup-close" onClick={closePopup} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              <div className="popup-section">
                <p className="popup-label">Uploaded by</p>
                <div className="popup-uploader">
                  <AvatarInitials name={selectedPhoto.uploaded_by_name ?? 'Unknown'} />
                  <span className="popup-uploader-name">
                    {selectedPhoto.uploaded_by_name ?? 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="popup-divider" />

              <div className="popup-section">
                <p className="popup-label">Upload time</p>
                {selectedPhoto.uploaded_at ? (
                  <div className="popup-time">
                    <span className="popup-time-relative">{timeAgo(selectedPhoto.uploaded_at)}</span>
                    <span className="popup-time-full">{formatFull(selectedPhoto.uploaded_at)}</span>
                  </div>
                ) : (
                  <span className="popup-time-relative">Unknown</span>
                )}
              </div>

              <div className="popup-spacer" />

              {deleting ? (
                <p className="popup-deleted">✓ Deleted</p>
              ) : (
                <button
                  className={`popup-delete-btn${deleteConfirm ? ' popup-delete-btn--confirm' : ''}`}
                  onClick={() => handleDeletePhoto(selectedPhoto._id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                  {deleteConfirm ? 'Confirm delete?' : 'Delete image'}
                </button>
              )}
            </div>
          </div>

          <button className="popup-nav popup-nav--right" onClick={showNext}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

        </div>
      )}

      {/* ── Grid items ── */}
      {grid.map((item, index) => (
        <div
          key={item._id}
          data-key={item._id}
          className="masonry-item"
          onClick={() => setSelectedIndex(index)}
          onMouseEnter={e => handleMouseEnter(e, item)}
          onMouseLeave={e => handleMouseLeave(e, item)}
        >
          <div
            className="masonry-item-img"
            style={{ backgroundImage: `url(${item.image_url})` }}
          >
            <div className="masonry-item-overlay" />
            <div className="masonry-item-meta">
              <span className="masonry-item-uploader">{item.uploaded_by_name ?? 'Unknown'}</span>
              {item.uploaded_at && (
                <span className="masonry-item-time">{timeAgo(item.uploaded_at)}</span>
              )}
            </div>
          </div>
        </div>
      ))}

    </div>
  );
};

export default Masonry;