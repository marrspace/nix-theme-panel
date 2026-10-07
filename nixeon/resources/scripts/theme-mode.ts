/**
 * Theme mode — light / dark, persisted, no FOUC.
 *
 * Deliberately tiny and dependency-free (no store model) because the toggle is
 * rendered in more than one place (auth shell + dashboard header) and those two
 * must never disagree. A module-level value with subscribers keeps every hook
 * instance in sync without threading state through easy-peasy.
 *
 * The initial class is applied by an inline boot script in the Blade wrapper,
 * BEFORE first paint — otherwise a dark-mode user gets a white flash on every
 * navigation, which is the single most common theming bug in Laravel+React apps.
 */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'nx-theme';

export const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') {
        return 'light';
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
            return stored;
        }
    } catch {
        // private mode / storage disabled — fall through to the OS preference
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/** Timer for the theme-transition window (see applyTheme). */
let themingTimer = 0;

/** Applies the theme to <html>; the CSS custom properties do the rest. */
export const applyTheme = (theme: Theme): void => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /*
     * The whole interface has to fade as ONE object. Without this the cards and
     * buttons snap to their new colours while the page behind them is still
     * animating, and the layout appears to come apart for a frame.
     *
     * The class is scoped to the switch (and removed again) because a permanent
     * transition on every element would also smear hover and press feedback.
     */
    if (!reducedMotion) {
        root.classList.add('nx-theming');
        window.clearTimeout(themingTimer);
        // matches --nx-t (180ms) plus a little slack for the longest shadow fade
        themingTimer = window.setTimeout(() => root.classList.remove('nx-theming'), 260);
    }

    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    // keeps native form controls, scrollbars and the address bar in step
    root.style.colorScheme = theme;
};

let current: Theme = getInitialTheme();
const listeners = new Set<(theme: Theme) => void>();

const emit = () => listeners.forEach((fn) => fn(current));

export const getTheme = (): Theme => current;

export const setTheme = (theme: Theme): void => {
    current = theme;

    try {
        window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // not fatal: the theme still applies for this session
    }

    applyTheme(theme);
    emit();
};

export const toggleTheme = (): void => setTheme(current === 'dark' ? 'light' : 'dark');

/**
 * Follows the OS preference only while the user has not made an explicit choice.
 * Once they toggle, their pick wins and we stop second-guessing them.
 */
export const watchSystemTheme = (): (() => void) => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
        let hasExplicitChoice = false;
        try {
            hasExplicitChoice = window.localStorage.getItem(STORAGE_KEY) !== null;
        } catch {
            hasExplicitChoice = false;
        }

        if (!hasExplicitChoice) {
            current = event.matches ? 'dark' : 'light';
            applyTheme(current);
            emit();
        }
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
};

import { useEffect, useState } from 'react';

/** React binding for the module-level theme value. */
export const useTheme = (): { theme: Theme; toggle: () => void } => {
    const [theme, setLocal] = useState<Theme>(current);

    useEffect(() => {
        const listener = (next: Theme) => setLocal(next);
        listeners.add(listener);
        const stopWatchingSystem = watchSystemTheme();

        return () => {
            listeners.delete(listener);
            stopWatchingSystem();
        };
    }, []);

    return { theme, toggle: toggleTheme };
};
