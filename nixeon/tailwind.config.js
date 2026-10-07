/* ============================================================================
   Tailwind — Nixeon 408
   ----------------------------------------------------------------------------
   The colour families below are NOT static palettes. Each step resolves a CSS
   custom property holding raw RGB channels, e.g.

       neutral-800  ->  rgb(var(--nx-neutral-800) / var(--tw-bg-opacity))

   That buys two things at once:
     - the light/dark themes swap the values in tokens.css, so every existing
       `bg-neutral-800` / `text-neutral-200` in the codebase re-themes itself;
     - keeping the value as channels preserves Tailwind opacity modifiers
       (`bg-red-500/75`), which a plain hex custom property would break.

   WHY THESE ARE FUNCTIONS AND NOT STRINGS
   ---------------------------------------
   The obvious spelling is the Tailwind placeholder form:

       `rgb(var(--nx-${name}) / <alpha-value>)`

   That works ONLY when Tailwind itself writes the declaration, because Tailwind
   substitutes `<alpha-value>` during CSS generation. But this panel also consumes
   colours as runtime VALUES — `theme('colors.cyan.400')`, `css={tw`…`}`, and any
   styled-components template. twin.macro copies the template through verbatim
   there, so the placeholder survived into the bundle as the literal string
   `rgb(var(--nx-cyan-400) / <alpha-value>)`. No browser and no <canvas> accepts
   that, so those elements painted with NO colour at all (charts lost their grid
   and lines; flash messages lost their fill entirely).

   A function is the documented Tailwind 3 form for variable colours and it is
   resolved in BOTH paths: Tailwind calls it with `opacityValue:
   'var(--tw-bg-opacity)'` when writing CSS, and twin calls it with the concrete
   opacity when evaluating a runtime value. One definition, no placeholder to leak.

   `primary` stays an alias of `blue` because much of the panel still uses it.
   ========================================================================= */

/** channel triplet, alpha-aware — a function so both consumers resolve it */
const ch = (name) => ({ opacityValue }) =>
    opacityValue === undefined
        ? `rgb(var(--nx-${name}))`
        : `rgb(var(--nx-${name}) / ${opacityValue})`;

/** build a full 50..900 scale from the token file */
const scale = (family, steps) =>
    steps.reduce((acc, step) => {
        acc[step] = ch(`${family}-${step}`);
        return acc;
    }, {});

const neutral = scale('neutral', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
const blue = scale('blue', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
const red = scale('red', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
const green = scale('green', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
const yellow = scale('yellow', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
const cyan = scale('cyan', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);

module.exports = {
    darkMode: 'class',
    content: ['./resources/scripts/**/*.{js,ts,tsx}', './resources/views/**/*.blade.php'],
    theme: {
        extend: {
            fontFamily: {
                // headings — "stamped brass" display face
                header: ['Fraunces', 'Georgia', 'serif'],
                // body — humanist workhorse
                sans: ['Karla', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
                // machine output only: console, logs, code
                mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
            },
            colors: {
                // theme-driven surfaces + ink
                neutral,
                gray: neutral, // legacy alias, same scale
                primary: blue, // legacy alias
                blue,
                red,
                green,
                yellow,
                cyan,
                // pure values stay pure: `text-white` on an accent button must stay white
                white: '#ffffff',
                black: '#131a20',
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderRadius: {
                // matches the token scale so utilities and hand-written CSS agree
                DEFAULT: '13px',
                sm: '9px',
                lg: '18px',
                xl: '24px',
            },
            boxShadow: {
                // physical shadows exposed as utilities for one-off cases
                'nx-sm': 'var(--nx-raise-sm)',
                nx: 'var(--nx-raise)',
                'nx-lg': 'var(--nx-raise-lg)',
                'nx-sink': 'var(--nx-sink)',
                'nx-sink-sm': 'var(--nx-sink-sm)',
            },
            screens: {
                // mobile-first is the default; xs gives extra room for two-up stat
                // grids on larger phones
                xs: '420px',
            },
            spacing: {
                // keeps touch targets honest
                tap: '44px',
            },
            borderColor: (theme) => ({
                // a bare `border` should be a soft hairline, not the browser default.
                // Resolved from the channel tokens directly so it works whichever
                // way the colour entry is spelled.
                default: ch('neutral-300'),
            }),
        },
    },
    plugins: [require('@tailwindcss/line-clamp'), require('@tailwindcss/forms')({ strategy: 'class' })],
};
