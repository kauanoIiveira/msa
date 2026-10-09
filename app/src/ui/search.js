export const normalizeSearch=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[º°ª]/g,'').trim();
export function matchesSearch(values,search){const haystack=normalizeSearch(values.join(' '));return normalizeSearch(search).split(/\s+/).every(word=>haystack.includes(word));}
