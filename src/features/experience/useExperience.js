import { useEffect, useReducer, useRef } from 'react';
import { createExperienceState, experienceReducer, levels, persistLook, persistProgress } from './gameModel.js';

function browserStorage() {
  try { return window.localStorage; } catch { return null; }
}

export default function useExperience(motif = 0) {
  const [state, dispatch] = useReducer(experienceReducer, motif, (selected) => createExperienceState(browserStorage(), selected));
  const foundRef = useRef(state.game.progress.map(({ found }) => found));

  useEffect(() => { dispatch({ type: 'motif', index: motif }); }, [motif]);
  useEffect(() => { persistProgress(browserStorage(), state.game.progress); }, [state.game.progress]);
  useEffect(() => { persistLook(browserStorage(), state); }, [state.garment, state.look]);

  useEffect(() => {
    state.game.progress.forEach(({ found }, index) => {
      if (found && !foundRef.current[index]) {
        const level = levels[index];
        window.dispatchEvent(new CustomEvent('miao:motif-found', { detail: { levelId: level.id, theme: level.id, name: level.name, image: level.image } }));
      }
    });
    foundRef.current = state.game.progress.map(({ found }) => found);
  }, [state.game.progress]);

  useEffect(() => {
    if (!state.game.flipping) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: 'flipDone' }), 650);
    return () => window.clearTimeout(timer);
  }, [state.game.flipping]);

  return [state, dispatch];
}
