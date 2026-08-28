/** Thème clair / sombre : suit le système par défaut, avec bascule manuelle. */
import { useCallback, useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';

const KEY = 'dhpm.theme';

function lire(): Theme {
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* stockage indisponible : on reste sur le thème système */
  }
  return 'system';
}

function appliquer(t: Theme): void {
  const root = document.documentElement;
  if (t === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', t);
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(lire);

  useEffect(() => {
    appliquer(theme);
  }, [theme]);

  const choisir = useCallback((t: Theme) => {
    setTheme(t);
    try {
      window.localStorage.setItem(KEY, t);
    } catch {
      /* la préférence ne sera pas retenue, l'affichage change quand même */
    }
  }, []);

  return [theme, choisir];
}
