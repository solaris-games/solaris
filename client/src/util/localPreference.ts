export const storeLocalPreference = <A>(key: string, value: A) => {
  localStorage.setItem(key, JSON.stringify(value));
}

export const loadLocalPreference = <A>(key: string, def: A) => {
  const existing = localStorage.getItem(key);

  if (!existing) {
    storeLocalPreference(key, def);

    return def;
  }

  return JSON.parse(existing) as A;
}
