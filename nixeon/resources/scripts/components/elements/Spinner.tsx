import React, { Suspense } from 'react';
import styled, { keyframes } from 'styled-components/macro';
import tw from 'twin.macro';
import ErrorBoundary from '@/components/elements/ErrorBoundary';

export type SpinnerSize = 'small' | 'base' | 'large';

interface Props {
    size?: SpinnerSize;
    centered?: boolean;
    isBlue?: boolean;
}

interface Spinner extends React.FC<Props> {
    Size: Record<'SMALL' | 'BASE' | 'LARGE', SpinnerSize>;
    Suspense: React.FC<Props>;
}

/**
 * A machined dial, not a spinning border.
 *
 * The stock spinner is a circle with one coloured border side and `rotate(360deg)`
 * — the single most recognisable "default loading state" on the web, and the exact
 * thing that reads as unfinished here. A control panel's busy indicator should look
 * like a GAUGE: a dial with tick marks around a sunken socket, and a lit needle
 * sweeping it. That belongs to the same physical language as the console bezel and
 * the editor nameplate.
 *
 * Built from SVG so the ticks stay crisp at 16px and the sweep can be a real arc
 * with a rounded cap rather than a quarter of a border.
 */

const GEOMETRY: Record<SpinnerSize, { px: number; stroke: number; ticks: number }> = {
    small: { px: 16, stroke: 2, ticks: 0 },
    base: { px: 32, stroke: 3, ticks: 12 },
    large: { px: 64, stroke: 5, ticks: 24 },
};

const sweep = keyframes`
    to { transform: rotate(360deg); }
`;

const Socket = styled.div<{ $px: number }>`
    position: relative;
    flex: none;
    width: ${(p) => p.$px}px;
    height: ${(p) => p.$px}px;
    border-radius: 50%;
    /* the dial sits in a shallow milled socket so it reads as inset, not stuck on */
    background: var(--nx-sunken);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.18), inset 0 -1px 0 var(--nx-light);

    & > svg {
        display: block;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
    }
`;

const Rotor = styled.g<{ $ms: number }>`
    transform-origin: 50% 50%;
    animation: ${sweep} ${(p) => p.$ms}ms linear infinite;
`;

const SpinnerComponent: React.FC<Props & { className?: string }> = ({ size = 'base', isBlue, ...rest }) => {
    const g = GEOMETRY[size] ?? GEOMETRY.base;
    const r = 50 - g.stroke; // keep the stroke inside the 100x100 viewBox
    const circ = 2 * Math.PI * r;

    /* the arc occupies a bit under half the ring, so the eye reads a needle
       sweeping rather than a ring with a gap */
    const arc = circ * 0.42;

    /* the accent: a machined dial is tinted like the rest of the panel, but keep
       the old `isBlue` escape hatch working for callers that still pass it */
    const tint = isBlue ? 'var(--nx-plate-accent)' : 'var(--nx-accent)';

    return (
        <Socket $px={g.px} role={'progressbar'} aria-label={'Loading'} {...rest}>
            <svg viewBox={'0 0 100 100'} aria-hidden>
                {/* the tick ring — only where there is room for it to read */}
                {g.ticks > 0 &&
                    Array.from({ length: g.ticks }).map((_, i) => {
                        const a = (i / g.ticks) * Math.PI * 2;
                        const x1 = 50 + Math.sin(a) * 46;
                        const y1 = 50 - Math.cos(a) * 46;
                        const x2 = 50 + Math.sin(a) * 42;
                        const y2 = 50 - Math.cos(a) * 42;
                        return (
                            <line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={'var(--nx-ink-3)'}
                                strokeOpacity={0.5}
                                strokeWidth={g.stroke * 0.6}
                                strokeLinecap={'round'}
                            />
                        );
                    })}
                {/* the track the needle runs on */}
                <circle
                    cx={50}
                    cy={50}
                    r={r}
                    fill={'none'}
                    stroke={'var(--nx-ink-3)'}
                    strokeOpacity={0.28}
                    strokeWidth={g.stroke}
                />
                {/* the sweeping needle */}
                <Rotor $ms={900}>
                    <circle
                        cx={50}
                        cy={50}
                        r={r}
                        fill={'none'}
                        stroke={tint}
                        strokeWidth={g.stroke}
                        strokeLinecap={'round'}
                        strokeDasharray={`${arc} ${circ - arc}`}
                    />
                </Rotor>
            </svg>
        </Socket>
    );
};

const Spinner: Spinner = ({ centered, ...props }) =>
    centered ? (
        <div css={[tw`flex justify-center items-center`, props.size === 'large' ? tw`m-20` : tw`m-6`]}>
            <SpinnerComponent {...props} />
        </div>
    ) : (
        <SpinnerComponent {...props} />
    );
Spinner.displayName = 'Spinner';

Spinner.Size = {
    SMALL: 'small',
    BASE: 'base',
    LARGE: 'large',
};

Spinner.Suspense = ({ children, centered = true, size = Spinner.Size.LARGE, ...props }) => (
    <Suspense fallback={<Spinner centered={centered} size={size} {...props} />}>
        <ErrorBoundary>{children}</ErrorBoundary>
    </Suspense>
);
Spinner.Suspense.displayName = 'Spinner.Suspense';

export default Spinner;
