import { ATLAS_RECORDS, initialAtlasState } from '../../data/atlas.js';

export function atlasAllowed(record, state) {
  return (state.year === 'all' || record.year <= Number(state.year)) && (state.area === 'all' || record.zone === state.area);
}
export function filteredAtlas(state) { return ATLAS_RECORDS.filter((record) => atlasAllowed(record, state)); }

export function atlasReducer(state, action) {
  switch (action.type) {
    case 'reset': return { ...initialAtlasState };
    case 'view': return { ...state, view: action.value, selected: null };
    case 'year': return { ...state, year: action.value, area: 'all', selected: null };
    case 'area': return { ...state, area: action.value, selected: null, view: action.value === '湘西' ? 'all' : action.value === 'all' ? state.view : 'guizhou' };
    case 'province': return action.value === '贵州' ? { ...state, view: 'guizhou', area: 'all', selected: null } : { ...state, view: 'all', area: '湘西', selected: 'xiangxi' };
    case 'point': {
      const record = ATLAS_RECORDS.find(({ id }) => id === action.value);
      return record && atlasAllowed(record, state) ? { ...state, selected: record.id, area: record.zone } : state;
    }
    default: return state;
  }
}
