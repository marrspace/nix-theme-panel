import styled from 'styled-components/macro';
import tw from 'twin.macro';

/**
 * The tab strip under the server header.
 *
 * Previously a solid fill, which on a light page became a heavy grey band. It is now
 * a sunken rail: the tabs sit *in* the page, and the active tab is marked with an
 * inset accent underline rather than a bright fill.
 */
const SubNavigation = styled.div`
    ${tw`w-full overflow-x-auto`};
    background: var(--nx-sunken);
    /* a rail is a groove across the page: a hard shadow under the top lip, a lit
       line along the bottom lip, then the soft inner shading. */
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.16), var(--nx-sink-sm), inset 0 -1px 0 var(--nx-light);

    & > div {
        ${tw`flex items-center text-sm mx-auto px-2`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`inline-block py-3 px-4 no-underline whitespace-nowrap transition-all duration-150`};
            color: var(--nx-ink-2);

            &:not(:first-of-type) {
                ${tw`ml-2`};
            }

            &:hover {
                color: var(--nx-ink);
            }

            /* The active tab is a raised pill sitting in the sunken track: the
               same physical relationship as the wells and cards, so the strip
               belongs to the same object family instead of being flat text. */
            &:active,
            &.active {
                color: var(--nx-accent-ink);
                font-weight: 700;
                background: linear-gradient(180deg, var(--nx-raised), var(--nx-raised-2));
                box-shadow: var(--nx-raise-sm), var(--nx-bevel-top), inset 0 0 0 1px var(--nx-edge);
                border-radius: var(--nx-radius-sm);
            }
        }
    }
`;

export default SubNavigation;
