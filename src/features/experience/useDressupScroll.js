import { useEffect } from 'react';

export default function useDressupScroll(avatarRef, collectionRef, round) {
  useEffect(() => {
    // Each round starts with the portrait; its completion action stays below it.
    if (avatarRef.current) avatarRef.current.scrollTop = 0;
    let previousY = window.scrollY;
    let descending = false;
    let frame = 0;
    let atCollectionEnd = false;
    function scroll() {
      descending = window.scrollY > previousY;
      previousY = window.scrollY;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const avatar = avatarRef.current;
        const collection = collectionRef.current;
        if (!avatar || !collection || getComputedStyle(avatar).position !== 'sticky') {
          atCollectionEnd = false;
          return;
        }
        const bottom = collection.getBoundingClientRect().bottom;
        const reachedEnd = bottom <= window.innerHeight && bottom >= 0;
        // Reveal once on arrival; later manual scrolling in the left pane remains free.
        if (descending && reachedEnd && !atCollectionEnd) avatar.scrollTop = avatar.scrollHeight - avatar.clientHeight;
        atCollectionEnd = reachedEnd;
      });
    }
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', scroll);
      window.cancelAnimationFrame(frame);
    };
  }, [avatarRef, collectionRef, round]);
}
