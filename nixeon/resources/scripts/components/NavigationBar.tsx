import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';
import BrandMark from '@/components/elements/BrandMark';
import ThemeToggle from '@/components/elements/ThemeToggle';

/**
 * Top navigation.
 *
 * It is a raised rail: the surface takes the large shadow plus a bottom chamfer, so
 * the content below reads as recessed into the page rather than floating.
 *
 * Mobile-first notes:
 *  - the rail is horizontally scrollable instead of wrapping, so the icons never
 *    stack into a second row on a narrow phone;
 *  - the wordmark hides below `sm` (the mark alone identifies the panel) which frees
 *    the width the action icons need;
 *  - every control keeps a 44px minimum touch target.
 *
 * The old hover style used `bg-black`, which is unreadable once the header is light.
 * It now uses the theme's raised surface plus an accent underline.
 */
const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`relative flex items-center justify-center h-full no-underline px-2.5 xs:px-3.5 sm:px-5 cursor-pointer`};
        min-width: 40px;
        color: var(--nx-ink-2);
        transition: color var(--nx-t-fast) linear;

        /* below 420px the action row is the tightest thing on the page, so the
           touch target stays 40px wide while the label-free icons lose padding */
        @media (min-width: 420px) {
            min-width: var(--nx-tap);
        }

        &:active,
        &:hover,
        &.active {
            color: var(--nx-ink);
        }

        /* The glyph sits in a milled socket. The socket is present at REST (a very
           shallow dish) and bites in on hover — otherwise the resting state is a
           bare glyph next to a keycap, and the icon family looks unfinished. */
        &::before {
            content: '';
            position: absolute;
            left: 6px;
            right: 6px;
            top: 50%;
            height: 32px;
            transform: translateY(-50%);
            border-radius: var(--nx-radius-sm);
            /* a shallow dish at rest: deep enough to read as a milled recess
               (so it matches the active well), quiet enough not to become a
               button in a navigation rail. */
            background: color-mix(in srgb, var(--nx-sunken) 55%, transparent);
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.16), inset 0 -1px 0 var(--nx-light);
            transition: box-shadow var(--nx-t-fast) linear, background var(--nx-t-fast) linear;
        }

        &:hover::before,
        &.active::before {
            background: var(--nx-sunken);
            box-shadow: var(--nx-sink-sm), inset 0 -1px 0 var(--nx-light);
        }

        & > * {
            position: relative;
            z-index: 1;
        }

        /* A short accent tick marks the active route. It had a coloured glow, which
           is an emissive cue in a scene lit from the top-left — the same mistake the
           status lamp made. It now has a lit top lip and a dark underside, so it
           reads as an inlaid indicator rather than a light source. */
        &:active::after,
        &:hover::after,
        &.active::after {
            content: '';
            position: absolute;
            left: 12px;
            right: 12px;
            bottom: 0;
            height: 3px;
            border-radius: 3px 3px 0 0;
            background: linear-gradient(180deg, var(--nx-accent), var(--nx-accent-deep));
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
        }
    }
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <div
            className={'w-full overflow-x-auto'}
            style={{
                /* the navbar floats over the page, so it takes the glass treatment
                   rather than a solid fill — you can see content scroll behind it */
                background: 'var(--nx-glass-bg)',
                WebkitBackdropFilter: 'blur(var(--nx-glass-blur)) saturate(1.4)',
                backdropFilter: 'blur(var(--nx-glass-blur)) saturate(1.4)',
                boxShadow:
                    '0 1px 0 var(--nx-edge), 0 2px 0 var(--nx-light), 0 8px 22px rgba(0, 0, 0, 0.16), inset 0 1px 0 var(--nx-glass-sheen)',
                color: 'var(--nx-ink)',
            }}
        >
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'mx-auto w-full flex items-center h-14 max-w-[1200px]'}>
                <div id={'logo'} className={'flex-1 min-w-0'}>
                    <Link
                        to={'/'}
                        className={'flex items-center gap-2.5 px-3 sm:px-5 no-underline min-w-0'}
                    >
                        <BrandMark size={30} />
                        <span
                            className={'hidden sm:block text-lg font-header font-semibold truncate'}
                            css={'color: var(--nx-ink); letter-spacing:-0.012em;'}
                        >
                            {name}
                        </span>
                    </Link>
                </div>
                <RightNavigation className={'flex h-full items-center justify-center flex-none'}>
                    <SearchContainer />
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin'}>
                            <a href={'/admin'} rel={'noreferrer'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'}>
                            {/* the avatar is a colourful disc, which is the one element
                                that can't be re-coloured by the theme. Giving it a
                                circular socket + rim makes it read as a lens set into
                                the rail, so it belongs to the material family instead
                                of floating as a stray coloured blob. */}
                            <span
                                className={'flex items-center justify-center w-5 h-5 rounded-full overflow-hidden'}
                                style={{
                                    boxShadow:
                                        '0 0 0 1px var(--nx-sunken-2), inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 0 var(--nx-contact)',
                                }}
                            >
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
                    <span className={'flex items-center px-3 sm:px-5'}>
                        <ThemeToggle compact />
                    </span>
                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button onClick={onTriggerLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </div>
        </div>
    );
};
