import { ATLAS_RECORDS } from '../../data/atlas.js';
import { DISTRIBUTION_POINTS, INITIAL_DISTRIBUTION } from '../../data/distribution.js';

export const projectPoint = ([longitude, latitude]) => ({ x: (longitude - 101.4) * 70, y: (30.2 - latitude) * 61 });

export function distributionPoints(state) {
  return DISTRIBUTION_POINTS.filter((point) => (state.branch === 'all' || point.branch === state.branch) && (state.province === 'all' || point.province === state.province));
}

export function distributionStats(points) {
  const archives = new Set(points.map((point) => point.archive).filter(Boolean));
  return {
    branches: new Set(points.map((point) => point.branch)).size,
    points: points.length,
    provinces: new Set(points.map((point) => point.province)).size,
    archives: ATLAS_RECORDS.filter((record) => archives.has(record.id)),
  };
}

function selectWithin(state) {
  const points = distributionPoints(state);
  return { ...state, selected: points.some((point) => point.id === state.selected) ? state.selected : points[0]?.id ?? null, metric: null };
}

export function distributionReducer(state, action) {
  switch (action.type) {
    case 'branch':
      return ['all', 'east', 'central', 'west'].includes(action.value) ? selectWithin({ ...state, branch: action.value, province: 'all' }) : state;
    case 'province': {
      const province = state.province === action.value ? 'all' : action.value;
      const next = { ...state, province };
      return distributionPoints(next).length ? selectWithin(next) : state;
    }
    case 'reset':
      return { ...INITIAL_DISTRIBUTION, visited: state.visited, heat: state.heat, run: state.run };
    case 'heat': return { ...state, heat: !state.heat };
    case 'metric': return { ...state, metric: state.metric === action.value ? null : action.value };
    case 'point': {
      if (!distributionPoints(state).some((point) => point.id === action.value)) return state;
      return { ...state, selected: action.value, visited: [...new Set([...state.visited, action.value])], run: state.run + 1 };
    }
    case 'wander': {
      const points = distributionPoints(state);
      const unseen = points.filter((point) => !state.visited.includes(point.id));
      const candidates = unseen.length ? unseen : points.filter((point) => point.id !== state.selected);
      if (!candidates.length) return state;
      const sample = Number.isFinite(action.sample) ? Math.max(0, Math.min(.999999, action.sample)) : 0;
      return distributionReducer(state, { type: 'point', value: candidates[Math.floor(sample * candidates.length)].id });
    }
    default: return state;
  }
}

// Equal-weight Gaussian kernels, fixed radius and fixed colour scale across filters.
// Keeping the scale fixed prevents one isolated point from becoming the hottest area.
export function heatCells(points) {
  const coordinates = points.map((point) => projectPoint(point.coordinates));
  const cells = [];
  for (let y = 6; y < 460; y += 12) for (let x = 6; x < 820; x += 12) {
    const value = coordinates.reduce((sum, point) => sum + Math.exp(-((x - point.x) ** 2 + (y - point.y) ** 2) / (2 * 28 ** 2)), 0);
    if (value < .12) continue;
    cells.push({ x, y, value, level: value >= 2.4 ? 3 : value >= 1.25 ? 2 : value >= .5 ? 1 : 0 });
  }
  return cells;
}
