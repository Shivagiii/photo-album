import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

import './ImageGrid.css';
import { PhotoDetails } from '@/app/types';
import { deletePhoto } from '@/lib/api';
import AvatarInitials from '@/helpers/AvatarInitials';
import { formatFull, preloadImages, timeAgo } from '@/helpers/global';
import ImageViewBox from '../popUps/ImageViewBox';
import { useMeasure, useMedia } from '@/hooks/imageGridHooks';










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
  setRefresh: (refresh: boolean) => void
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
  setRefresh
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
      case 'top': return { x: item.x, y: -200 };
      case 'bottom': return { x: item.x, y: window.innerHeight + 200 };
      case 'left': return { x: -200, y: item.y };
      case 'right': return { x: window.innerWidth + 200, y: item.y };
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
      setRefresh(true)

    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  return (
    <div ref={containerRef} className="masonry-list">

      {/* ── Lightbox overlay ── */}
      {selectedIndex !== undefined && selectedPhoto && (

        <ImageViewBox
          closePopup={closePopup}
          showNext={showNext}
          handleDeletePhoto={handleDeletePhoto}
          showPrev={showPrev}
          selectedPhoto={selectedPhoto}
          deleteConfirm={deleteConfirm}
          deleting={deleting} />
      )}

      {/* ── Grid items ── */}
      {grid.map((item, index) => (
        <>
          {item.type !== "video" ? <div
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
          </div> :
            <div key={item._id}
              data-key={item._id}
              className="masonry-item"
              onClick={() => setSelectedIndex(index)}
              onMouseEnter={e => handleMouseEnter(e, item)}
              onMouseLeave={e => handleMouseLeave(e, item)}>
              <video
                src={item.image_url}
 autoPlay
  muted
  loop
  playsInline
  controls={false}
  onMouseEnter={(e) => e.currentTarget.controls = true}
  onMouseLeave={(e) => e.currentTarget.controls = false}
                className="w-full h-64 object-cover rounded-md" />
            </div>
          }
        </>

      ))}


    </div>
  );
};

export default Masonry;