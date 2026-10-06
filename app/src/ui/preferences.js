const preferenceKey='msa.ui.preferences.v1';
const themes=new Set(['light','dark','system']);

function normalizePreferences(value) {
  const preferences=value && typeof value==='object' && !Array.isArray(value)?value:{};
  return {
    theme:themes.has(preferences.theme)?preferences.theme:'light',
    vlibras:preferences.vlibras===true
  };
}

export function readPreferences(storage=globalThis.localStorage) {
  try {
    return normalizePreferences(JSON.parse(storage.getItem(preferenceKey)));
  } catch {
    return normalizePreferences();
  }
}

export function writePreferences(patch,storage=globalThis.localStorage) {
  const preferences=normalizePreferences({...readPreferences(storage),...patch});
  storage.setItem(preferenceKey,JSON.stringify(preferences));
  return preferences;
}

export function applyTheme(theme,{
  document=globalThis.document,
  media=globalThis.matchMedia?.('(prefers-color-scheme: dark)')
}={}) {
  const resolved=theme==='dark' || (theme==='system' && media?.matches)?'dark':'light';
  if(document?.documentElement) document.documentElement.dataset.theme=resolved;
  return resolved;
}
