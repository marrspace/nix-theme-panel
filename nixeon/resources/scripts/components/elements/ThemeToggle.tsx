import React from 'react';
import styled from 'styled-components/macro';
import { useTheme } from '@/theme-mode';

/**
 * Physical light switch.
 *
 * Not a CSS pill: the knob is a brushed-metal cap sitting in a milled track. The
 * track is SUNKEN (inset shadows), the knob is RAISED (drop shadow + inner
 * top-highlight) and it *travels* on toggle with a slight overshoot, the way a
 * real rocker snaps over centre.
 *
 * Labelling: the caption is CONSTANT ("Dark mode") and the switch reads on = dark.
 * An earlier version swapped the caption to name the mode you would switch *to*,
 * which left an unlit switch sitting next to the word "Dark" — a state/label
 * mismatch that reads as a bug. A fixed caption plus a state-bearing knob is
 * unambiguous. The knob carries the sun/moon glyph so the control is legible
 * without the caption at all (compact mode in the navbar).
 */
const Track = styled.button`
    position: relative;
    width: 58px;
    height: 32px;
    flex: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    border-radius: 999px;
    /* the "off" track must be visibly darker than the page, otherwise the switch
       has no affordance on a light surface */
    background: var(--nx-sunken-2);
    box-shadow: inset 4px 4px 8px var(--nx-shade), inset -3px -3px 8px var(--nx-light),
        inset 0 1px 3px rgba(0, 0, 0, 0.22), 0 0 0 1px var(--nx-edge);
    transition: background var(--nx-t) var(--nx-ease-press), box-shadow var(--nx-t) var(--nx-ease-press);

    &[data-on='true'] {
        background: linear-gradient(180deg, var(--nx-accent), var(--nx-accent-deep));
        box-shadow: inset 3px 3px 7px rgba(0, 0, 0, 0.34), inset -2px -2px 6px rgba(255, 255, 255, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 0 1px var(--nx-accent-deep);
    }

    &:active .knob {
        /* the cap sinks under the finger */
        box-shadow: 2px 2px 5px var(--nx-shade-strong), -1px -1px 3px var(--nx-light),
            inset 0 -2px 4px rgba(0, 0, 0, 0.24), inset 0 2px 3px rgba(255, 255, 255, 0.85);
        transform: translateY(1px) scale(0.97);
    }

    /* keeps the touch target at least 44px tall without changing the visual size */
    &::after {
        content: '';
        position: absolute;
        inset: -6px -4px;
    }
`;

const Knob = styled.span`
    position: absolute;
    top: 3px;
    left: 3px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    /* brushed metal cap: bright specular top-left, darker rim bottom-right */
    background: radial-gradient(circle at 34% 28%, #ffffff, var(--nx-raised) 52%, var(--nx-sunken-2));
    box-shadow: 2px 2px 6px var(--nx-shade), -2px -2px 5px var(--nx-light),
        inset 0 -2px 3px rgba(0, 0, 0, 0.2), inset 0 2px 2px rgba(255, 255, 255, 0.9);
    color: var(--nx-ink-2);
    transition: left var(--nx-t) var(--nx-ease-settle), transform var(--nx-t-fast) var(--nx-ease-press),
        box-shadow var(--nx-t-fast) var(--nx-ease-press), color var(--nx-t) linear;

    ${Track}[data-on='true'] & {
        left: 29px;
        color: var(--nx-accent-ink);
    }
`;

const SunIcon = () => (
    <svg width={'15'} height={'15'} viewBox={'0 0 24 24'} aria-hidden={'true'} focusable={'false'}>
        <g fill={'none'} stroke={'currentColor'} strokeWidth={'2'} strokeLinecap={'round'}>
            <circle cx={'12'} cy={'12'} r={'4.2'} />
            <path
                d={'M12 2.4v2.6M12 19v2.6M2.4 12h2.6M19 12h2.6M5.2 5.2l1.9 1.9M16.9 16.9l1.9 1.9M18.8 5.2l-1.9 1.9M7.1 16.9l-1.9 1.9'}
            />
        </g>
    </svg>
);

const MoonIcon = () => (
    <svg width={'15'} height={'15'} viewBox={'0 0 24 24'} aria-hidden={'true'} focusable={'false'}>
        <path
            d={'M20 14.4A8.6 8.6 0 0 1 9.6 4 8.7 8.7 0 1 0 20 14.4Z'}
            fill={'none'}
            stroke={'currentColor'}
            strokeWidth={'2'}
            strokeLinejoin={'round'}
        />
    </svg>
);

interface Props {
    /** Hides the caption, leaving only the switch (for tight headers). */
    compact?: boolean;
    className?: string;
}

const ThemeToggle = ({ compact = false, className }: Props) => {
    const { theme, toggle } = useTheme();
    const isDark = theme === 'dark';

    return (
        <span className={className} css={'display:inline-flex;align-items:center;gap:10px;'}>
            <Track
                type={'button'}
                role={'switch'}
                aria-checked={isDark}
                aria-label={'Dark mode'}
                title={'Dark mode'}
                data-on={isDark}
                onClick={toggle}
            >
                <Knob className={'knob'}>{isDark ? <MoonIcon /> : <SunIcon />}</Knob>
            </Track>
            {!compact && (
                <span
                    css={
                        'font-size:12px;font-weight:700;letter-spacing:0.02em;color:var(--nx-ink-2);user-select:none;'
                    }
                >
                    Dark mode
                </span>
            )}
        </span>
    );
};

export default ThemeToggle;
