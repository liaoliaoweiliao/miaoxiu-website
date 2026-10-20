import { useEffect, useReducer, useRef } from 'react';
import { costumeSets } from '../../data/catalog.js';
import { assetUrl } from '../../utils/assets.js';
import { COLLECTION_KEY, createExperienceState, experienceReducer, levels, setById } from './gameModel.js';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function storage() { try { return window.localStorage; } catch { return null; } }

export default function useExperience(requestedTheme, requestRevision) {
  const [state, dispatch] = useReducer(experienceReducer, undefined, () => createExperienceState(storage()));
  const foundRound = useRef(null);
  const drawRevision = useRef(0);

  useEffect(() => {
    if (requestedTheme) dispatch({ type: 'pool', id: requestedTheme });
  }, [requestedTheme, requestRevision]);

  useEffect(() => {
    try {
      const target = storage();
      if (!target) throw new Error('storage unavailable');
      target.setItem(COLLECTION_KEY, JSON.stringify(state.collection));
    } catch { dispatch({ type: 'storageFailed' }); }
  }, [state.collection]);

  useEffect(() => {
    if (!state.found || foundRound.current === state.round) return;
    foundRound.current = state.round;
    const level = levels[state.level];
    window.dispatchEvent(new CustomEvent('miao:motif-found', { detail: { theme: level.id, name: level.name, image: level.image, round: state.round } }));
  }, [state.found, state.round, state.level]);

  useEffect(() => {
    if (drawRevision.current === state.drawRevision) return;
    drawRevision.current = state.drawRevision;
    const costume = setById(state.lastDraw);
    if (costume) window.dispatchEvent(new CustomEvent('miao:collection-updated', { detail: { theme: costume.theme, setId: costume.id, gender: costume.gender, fresh: state.lastFresh } }));
  }, [state.drawRevision, state.lastDraw, state.lastFresh]);

  useEffect(() => {
    if (!state.drawing) return undefined;
    const images = costumeSets.filter((costume) => costume.theme === state.theme && costume.gender === state.drawGender).map((costume) => {
      const image = new Image();
      image.src = assetUrl(costume.card);
      return image;
    });
    const timer = window.setTimeout(() => dispatch({ type: 'drawComplete', random: Math.random() }), reducedMotion() ? 0 : 3000);
    return () => { window.clearTimeout(timer); images.forEach((image) => { image.onload = null; image.onerror = null; }); };
  }, [state.drawing, state.theme, state.drawGender]);

  useEffect(() => {
    if (!state.reveal) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: 'revealDone' }), reducedMotion() ? 0 : 1500);
    return () => window.clearTimeout(timer);
  }, [state.reveal]);

  useEffect(() => {
    if (!state.dealing) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: 'dealDone' }), reducedMotion() ? 0 : 500);
    return () => window.clearTimeout(timer);
  }, [state.dealing, state.round]);

  return [state, dispatch];
}
