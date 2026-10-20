import { colorChoices, defaultColorSet, motifGroups, stitches } from '../../data/history.js';

export const initialHistoryState = {
  group: 'animal', motif: 0, stitch: 0, step: 0, playing: false, run: 0,
  colorMotif: 0, color: -1, colors: [], colorExample: 0, challenge: false,
};

export function appliedColors(picked) {
  if (!picked.length) return [];
  const result = [...picked];
  for (const index of defaultColorSet) if (result.length < 3 && !result.includes(index)) result.push(index);
  return result.slice(0, 3).sort((a, b) => a - b);
}

export function motifColorImage(motif, indices) {
  return indices.length ? `history/color-motifs/${motif.key}-c${indices.join('-')}.webp` : motif.line;
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
      else { if (picked.length >= 3) picked.shift(); picked.push(action.index); }
      return { ...idle, colors: picked, color: action.index };
    }
    case 'colorReset': return { ...idle, colors: [], color: -1 };
    case 'example': return Number.isInteger(action.index) && action.index >= 0 && action.index < 3 ? { ...idle, colorExample: action.index } : state;
    case 'challenge': return { ...idle, challenge: !state.challenge };
    default: return state;
  }
}

export function stitchMotionPath(points) {
  if (!points.length) return 'M 0 0';
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let index = 1; index < points.length; index += 1) {
    const [x0, y0] = points[index - 1], [x1, y1] = points[index];
    const bend = Math.max(2, Math.min(8, Math.abs(x1 - x0) * 0.24));
    const sign = y1 >= y0 ? 1 : -1;
    path += ` C ${x0 + bend} ${y0 + sign * bend}, ${x1 - bend} ${y1 - sign * bend}, ${x1} ${y1}`;
  }
  return path;
}
