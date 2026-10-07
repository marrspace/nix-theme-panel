import React from 'react';

/**
 * Nixeon 408 brand mark — vector, theme-aware.
 *
 * Why a hand-authored SVG instead of the raster logo: the source render is a
 * full-bleed 3D image whose wordmark overlaps the N and whose details (hairline
 * orbit, glass refraction, sparkle) collapse below ~48px. A vector mark stays
 * legible at 16px (favicon) and can follow the light/dark theme through CSS
 * custom properties, which a flat JPEG cannot.
 *
 * Geometry note (this went through three passes):
 *  - the metal fill is a VERTICAL gradient, not a diagonal one. A diagonal gradient
 *    made the left stem near-white and the right stem dark, so at small sizes the
 *    left stem vanished and the mark read as a slash rather than an N. A vertical
 *    ramp gives both stems the same value at the same height.
 *  - the letter is wide (44 units on a 96 grid) with a 10-unit stroke, so both
 *    counters open into real triangles instead of pinching shut.
 *  - the orbit ring sits in the LOWER third so it does not slice the letter in half.
 *  - a dark keyline separates the letter from the tile at every size.
 */
interface Props {
    size?: number | string;
    className?: string;
    /** Draws the mark inside a raised "machined tile" so it survives dark backgrounds. */
    tile?: boolean;
}

const BrandMark = ({ size = 40, className, tile = false }: Props) => {
    const px = typeof size === 'number' ? `${size}px` : size;
    const gid = React.useId ? React.useId().replace(/:/g, '') : 'nx';

    const mark = (
        <svg
            viewBox={'0 0 96 96'}
            width={tile ? '68%' : px}
            height={tile ? '68%' : px}
            className={className}
            role={'img'}
            aria-label={'Nixeon 408'}
            style={{ display: 'block', overflow: 'visible' }}
        >
            <defs>
                {/* vertical ramp: identical value on both stems at any height */}
                <linearGradient id={`metal-${gid}`} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                    <stop offset={'0%'} style={{ stopColor: 'var(--nx-mark-1, #EFF5FC)' }} />
                    <stop offset={'42%'} style={{ stopColor: 'var(--nx-mark-2, #B9C9DC)' }} />
                    <stop offset={'100%'} style={{ stopColor: 'var(--nx-mark-3, #7B90AA)' }} />
                </linearGradient>
                <linearGradient id={`orbit-${gid}`} x1={'0'} y1={'0'} x2={'1'} y2={'0'}>
                    <stop offset={'0%'} style={{ stopColor: 'var(--nx-accent-deep, #1E4FA8)' }} />
                    <stop offset={'55%'} style={{ stopColor: 'var(--nx-accent, #2F6BD8)' }} />
                    <stop offset={'100%'} style={{ stopColor: 'var(--nx-accent-light, #6FB4FF)' }} />
                </linearGradient>
                <radialGradient id={`sphere-${gid}`} cx={'0.34'} cy={'0.3'} r={'0.78'}>
                    <stop offset={'0%'} style={{ stopColor: '#FFFFFF' }} />
                    <stop offset={'45%'} style={{ stopColor: 'var(--nx-accent-light, #6FB4FF)' }} />
                    <stop offset={'100%'} style={{ stopColor: 'var(--nx-accent-deep, #1E4FA8)' }} />
                </radialGradient>
            </defs>

            {/* orbit — back half, behind the letter. Kept LOW so it never crosses the
                counters: an arc through the middle of the N reads as a slash at
                small sizes and turns the letter into "Ni". */}
            <g transform={'rotate(-16 48 66)'}>
                <ellipse
                    cx={'48'}
                    cy={'66'}
                    rx={'43'}
                    ry={'13'}
                    fill={'none'}
                    stroke={`url(#orbit-${gid})`}
                    strokeWidth={'2.6'}
                    opacity={'0.4'}
                />
            </g>

            {/* the N: one continuous polyline so the joins are real joins */}
            <g fill={'none'} strokeLinecap={'round'} strokeLinejoin={'round'}>
                {/* cast shadow */}
                <path d={'M27 73 V23 L69 73 V23'} stroke={'rgba(14,26,42,0.26)'} strokeWidth={'10'} transform={'translate(1,1.6)'} />
                {/* dark keyline: keeps the letter separated from the tile at 16px */}
                <path d={'M27 73 V23 L69 73 V23'} stroke={'rgba(14,26,42,0.30)'} strokeWidth={'12.4'} />
                <path d={'M27 73 V23 L69 73 V23'} stroke={`url(#metal-${gid})`} strokeWidth={'10'} />
                {/* specular run along the upper-left edge */}
                <path
                    d={'M27 73 V23 L69 73 V23'}
                    stroke={'rgba(255,255,255,0.75)'}
                    strokeWidth={'2.2'}
                    transform={'translate(-1.5,-1.5)'}
                    opacity={'0.8'}
                />
            </g>

            {/* orbit — front arc. Sits below the baseline of the letter so the ring
                wraps the monogram instead of cutting through it. */}
            <g transform={'rotate(-16 48 66)'}>
                <path
                    d={'M 5 66 A 43 13 0 0 0 91 66'}
                    fill={'none'}
                    stroke={`url(#orbit-${gid})`}
                    strokeWidth={'3'}
                    strokeLinecap={'round'}
                />
            </g>

            {/* glass sphere riding the orbit */}
            <circle cx={'84'} cy={'54'} r={'5'} fill={`url(#sphere-${gid})`} />
            <circle cx={'82.3'} cy={'52.3'} r={'1.5'} fill={'#FFFFFF'} opacity={'0.95'} />

            {/* four-point sparkle, upper right, clear of the letterform */}
            <path
                d={'M79 8 C80 15 81.7 16.7 88.5 17.7 C81.7 18.7 80 20.4 79 27.4 C78 20.4 76.3 18.7 69.5 17.7 C76.3 16.7 78 15 79 8 Z'}
                fill={'var(--nx-sparkle, #EAF3FF)'}
                opacity={'0.95'}
            />
        </svg>
    );

    if (!tile) {
        return mark;
    }

    return (
        <span
            className={className}
            style={{
                width: px,
                height: px,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 'var(--nx-radius-lg)',
                background: 'linear-gradient(160deg, var(--nx-raised), var(--nx-raised-2))',
                boxShadow: 'var(--nx-raise), var(--nx-bevel-top), var(--nx-rim)',
            }}
        >
            {mark}
        </span>
    );
};

export default BrandMark;
