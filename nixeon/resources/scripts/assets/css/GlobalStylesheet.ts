import tw from 'twin.macro';
import { createGlobalStyle } from 'styled-components/macro';
// @ts-expect-error untyped font file
import frauncesNormal from '@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2';
// @ts-expect-error untyped font file
import frauncesItalic from '@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2';
// @ts-expect-error untyped font file
import karlaNormal from '@fontsource-variable/karla/files/karla-latin-wght-normal.woff2';
// @ts-expect-error untyped font file
import karlaItalic from '@fontsource-variable/karla/files/karla-latin-wght-italic.woff2';
// @ts-expect-error untyped font file
import plexMono400 from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2';
// @ts-expect-error untyped font file
import plexMono500 from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2';

/**
 * Nixeon 408 global stylesheet.
 *
 * Typography rationale: Fraunces carries the "stamped brass" character for headings
 * (its optical-size and wonk axes give real personality), Karla is the humanist
 * workhorse for body text, and IBM Plex Mono appears ONLY where the content genuinely
 * is machine output — console, log lines, code, IPs, keys. Mono is a semantic choice
 * here, not a stylistic one.
 *
 * Note: the old IBM Plex Sans face is gone; headings and body now use the pairing above.
 */
export default createGlobalStyle`
    @font-face {
        font-family: 'Fraunces';
        font-style: normal;
        font-display: swap;
        font-weight: 100 900;
        src: url(${frauncesNormal}) format('woff2-variations');
        unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

    @font-face {
        font-family: 'Fraunces';
        font-style: italic;
        font-display: swap;
        font-weight: 100 900;
        src: url(${frauncesItalic}) format('woff2-variations');
        unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

    @font-face {
        font-family: 'Karla';
        font-style: normal;
        font-display: swap;
        font-weight: 200 800;
        src: url(${karlaNormal}) format('woff2-variations');
        unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

    @font-face {
        font-family: 'Karla';
        font-style: italic;
        font-display: swap;
        font-weight: 200 800;
        src: url(${karlaItalic}) format('woff2-variations');
        unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

    @font-face {
        font-family: 'IBM Plex Mono';
        font-style: normal;
        font-display: swap;
        font-weight: 400;
        src: url(${plexMono400}) format('woff2');
        unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

    @font-face {
        font-family: 'IBM Plex Mono';
        font-style: normal;
        font-display: swap;
        font-weight: 500;
        src: url(${plexMono500}) format('woff2');
        unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

    html {
        /* stops iOS inflating text in landscape, which would break the grid */
        -webkit-text-size-adjust: 100%;
    }

    body {
        ${tw`font-sans`};
        background: var(--nx-base);
        color: var(--nx-ink);
        letter-spacing: 0.006em;
        /* the theme change should feel like a dimmer switch, not a flash */
        transition: background-color var(--nx-t) linear, color var(--nx-t) linear;
    }

    /* Headings wear the display face. The soft-wonk character comes from Fraunces'
       own axes; we only set weight and a tight optical tracking. */
    h1, h2, h3, h4, h5, h6 {
        ${tw`font-header`};
        color: var(--nx-ink);
        letter-spacing: -0.012em;
        font-variation-settings: 'SOFT' 22, 'WONK' 1;
    }

    h1 {
        letter-spacing: -0.02em;
    }

    p {
        /* deliberately NO colour here: a global element-selector colour rule
           overrides the colour of a paragraph inside a coloured card (element
           selectors beat the inherited value), which washed out every card body in
           the dashboard. Each surface sets its own text colour instead. */
        line-height: 1.6;
    }

    /* body copy inside a raised surface should pick up that surface's ink, not the
       page-level secondary colour */
    .nx-card p,
    .nx-surface p {
        color: inherit;
    }

    a {
        color: var(--nx-accent-ink);
        text-underline-offset: 2px;
    }

    form {
        ${tw`m-0`};
    }

    textarea, select, input, button, button:focus, button:focus-visible {
        ${tw`outline-none`};
    }

    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    input[type=number] {
        -moz-appearance: textfield !important;
    }

    /* Columns of numbers (usage stats, ports, IDs) get tabular figures. */
    table, .nx-tabular, code, pre, kbd, samp {
        font-variant-numeric: tabular-nums;
    }

    /* Scrollbar styling now lives in components.css so it follows the theme vars. */
`;
