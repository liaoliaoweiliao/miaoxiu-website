import { colorChoices, motifGroups, stitches } from '../../data/history.js';

export const initialHistoryState = {
  group: 'animal', motif: 0, stitch: 0, step: 0, playing: false, run: 0,
  colorMotif: 0, color: -1, colors: [],
};

export function colorLayerPlan(picked) {
  if (!picked.length) return [];
  if (picked.length === 1) return [picked[0], picked[0], picked[0]];
  if (picked.length === 2) return [picked[0], picked[1], picked[0]];
  return picked.slice(0, 3);
}

export function historyReducer(state, action) {
  const idle = { ...state, playing: false, step: 0 };
  switch (action.type) {
    case 'group': return motifGroups[action.group] ? { ...idle, group: action.group, motif: 0 } : state;
    case 'motif': return motifGroups[state.group].items[action.index] ? { ...idle, motif: action.index } : state;
    case 'motifMove': {
      const length = motifGroups[state.group].items.length;
      return { ...idle, motif: (state.motif + action.direction + length) % length };
    }
    case 'stitch': return stitches[action.index] ? { ...state, stitch: action.index, step: 0, playing: true, run: state.run + 1 } : state;
    case 'stitchComplete': return state.playing && action.run === state.run ? { ...state, playing: false, step: 3 } : state;
    case 'colorMotif': return Number.isInteger(action.index) && action.index >= 0 && action.index < 3 ? { ...idle, colorMotif: action.index } : state;
    case 'color': {
      if (!colorChoices[action.index]) return state;
      const picked = [...state.colors], position = picked.indexOf(action.index);
      if (position >= 0) picked.splice(position, 1);
      else {
        if (picked.length >= 3) return state;
        picked.push(action.index);
      }
      return { ...idle, colors: picked, color: action.index };
    }
    case 'colorReset': return { ...idle, colors: [], color: -1 };
    default: return state;
  }
}
