/**
 * Runtime colour resolution.
 *
 * The Tailwind scale points at CSS custom properties holding raw RGB channels,
 * e.g. `--nx-cyan-400: 56 152 168`. That is exactly right for CSS, and wrong in
 * two places this module exists to fix:
 *
 *   1. `theme()` / `tw` used as a VALUE (not a className) returns the template
 *      verbatim — including Tailwind's `<alpha-value>` placeholder, which is only
 *      substituted inside Tailwind's own CSS generation. Handed to a JS object it
 *      becomes the literal `rgb(var(--nx-red-500) / <alpha-value>)`, which no
 *      browser or canvas accepts. That is why flash messages and chart grid lines
 *      rendered with NO colour at all rather than a wrong one.
 *
 *   2. A <canvas> (Chart.js) has no cascade, so `var(--x)` can never resolve there.
 *      Canvas needs a concrete colour string at draw time.
 *
 * Both need the same thing: read the channels from the live cascade and compose a
 * real colour. One place, so the two can never drift apart again.
 *
 * Colours are read from `document.documentElement`, so they follow the theme
 * automatically — but a canvas will NOT repaint on its own when the class flips,
 * which is what `onThemeChange` is for.
 */

type Channels = [number, number, number];

const cache = new Map<string, Channels | null>();

/** Reads `--nx-<token>` from the live cascade as `[r, g, b]`. */
const readChannels = (token: string): Channels | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    // The cache is cleared on every theme change, so a hit is always current.
    if (cache.has(token)) {
        return cache.get(token)!;
    }

    const raw = getComputedStyle(document.documentElement).getPropertyValue(`--nx-${token}`).trim();
    if (!raw) {
        cache.set(token, null);
        return null;
    }

    const parts = raw.split(/[\s,/]+/).filter(Boolean).map(Number);
    const result: Channels | null =
        parts.length >= 3 && parts.slice(0, 3).every((v) => Number.isFinite(v))
            ? [parts[0], parts[1], parts[2]]
            : null;

    cache.set(token, result);
    return result;
};

/**
 * A concrete colour string for `token` (`'cyan-400'`, `'neutral-700'`, …).
 *
 * Falls back to `currentColor` rather than throwing: a missing token should cost
 * a wrong colour, never a blank surface or a crashed chart.
 */
export const themeColor = (token: string, alpha = 1): string => {
    const channels = readChannels(token);
    if (!channels) {
        return alpha === 1 ? 'currentColor' : `rgba(127, 127, 127, ${alpha})`;
    }

    const [r, g, b] = channels;
    return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** Subscribes to theme flips; returns the unsubscribe function. */
export const onThemeChange = (callback: () => void): (() => void) => {
    if (typeof window === 'undefined') {
        return () => undefined;
    }

    const observer = new MutationObserver(() => {
        // Values changed underneath us — drop every cached read.
        cache.clear();
        callback();
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
    });

    return () => observer.disconnect();
};

/** Clears the cache. Exported for tests and for the theme boot script. */
export const invalidateThemeColors = (): void => cache.clear();
