import { useEffect } from 'react';
import { Gallery } from '@alfalab/core-components/gallery';

export function MaterialViewer({ material, onClose }: { material: { title: string; href: string }; onClose: () => void }) {
  useEffect(() => {
    // Gallery's labelled controls contain decorative glyphs with role="img".
    const hideDecorativeIcons = () => {
      document.querySelectorAll('.material-gallery [aria-label] svg[role="img"]:not([aria-hidden="true"])')
        .forEach(icon => icon.setAttribute('aria-hidden', 'true'));
    };
    hideDecorativeIcons();
    const observer = new MutationObserver(hideDecorativeIcons);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return <Gallery
    open
    images={[{ src: material.href, name: material.title, alt: material.title }]}
    onClose={onClose}
    popupClassName="material-gallery"
  />;
}
