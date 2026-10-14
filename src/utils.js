export function escapeHtml(str){return String(str).replace(/[&"<>]/g,c=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[c]))}
