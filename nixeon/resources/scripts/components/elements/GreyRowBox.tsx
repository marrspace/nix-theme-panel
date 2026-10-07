import styled from 'styled-components/macro';

/**
 * The standard row surface for the dashboard and most server lists.
 *
 * It is a RAISED plate, not a filled rectangle: gradient face, stacked shadows,
 * bright top chamfer, and a hairline ring so it stays readable on a low-contrast
 * display. Hover lifts it a little further and tints the ring with the accent,
 * which is the only hover cue that survives on both themes.
 */
export default styled.div<{ $hoverable?: boolean }>`
    display: flex;
    align-items: center;
    padding: 1rem;
    border-radius: var(--nx-radius-lg);
    overflow: hidden;
    text-decoration: none;
    color: var(--nx-ink);
    background: linear-gradient(180deg, var(--nx-raised), var(--nx-raised-2));
    /* the hard 1px line at the base is the occlusion line: it is what tells the eye
       the row is RESTING on the page. Without it the blurred cast alone reads as
       hovering, which is the classic neumorphism failure. */
    box-shadow: 0 1px 0 var(--nx-contact), var(--nx-raise), var(--nx-bevel-top), 0 0 0 1px var(--nx-edge);
    transition: box-shadow var(--nx-t) var(--nx-ease-press), transform var(--nx-t) var(--nx-ease-press);

    &:hover {
        box-shadow: 0 1px 0 var(--nx-contact), var(--nx-raise-lg), var(--nx-bevel-top),
            0 0 0 1px var(--nx-accent);
        transform: translateY(-1px);
    }

    &:active {
        box-shadow: var(--nx-sink), 0 0 0 1px var(--nx-edge);
        transform: translateY(0);
    }

    & .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: none;
        width: 3rem;
        height: 3rem;
        border-radius: var(--nx-radius);
        padding: 0.6rem;
        color: var(--nx-accent);
        /* the icon sits in its own milled socket, which visually anchors the row */
        background: var(--nx-sunken);
        box-shadow: var(--nx-sink-sm);
    }
`;
