import * as React from 'react';
import styled, { css, keyframes } from 'styled-components/macro';
import {
    CheckCircleIcon,
    ExclamationIcon,
    InformationCircleIcon,
    XCircleIcon,
} from '@heroicons/react/solid';

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error';

interface Props {
    title?: string;
    children: string;
    type?: FlashMessageType;
}

/**
 * Flash message.
 *
 * The old implementation returned Tailwind colour CLASSES from a switch and fed
 * them to styled-components. Two things were wrong with that:
 *
 *   - the colours were the stock palette (`bg-red-600`, `bg-green-600`), so a
 *     notification never belonged to this design system; and
 *   - the panel's colour scale is channel-based, so any colour used as a VALUE
 *     came back with Tailwind's raw `<alpha-value>` placeholder and painted
 *     nothing at all.
 *
 * It is now built as a physical object: a stamped plate with a lit top lip, a
 * dark underside and a hard contact line, carrying an enamelled colour bar on its
 * left edge. The icon is stamped into that bar in its own socket. The whole thing
 * drops in and settles, so a notification reads as an object arriving rather than
 * a rectangle appearing.
 */

const ICONS: Record<FlashMessageType, React.ComponentType<{ className?: string }>> = {
    success: CheckCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationIcon,
    error: XCircleIcon,
};

/** The enamelled bar colour + the icon's ink for each type. */
const ENAMEL: Record<FlashMessageType, { bar: string; ink: string }> = {
    success: { bar: 'var(--nx-lamp-success)', ink: '#ffffff' },
    info: { bar: 'var(--nx-lamp-accent)', ink: '#ffffff' },
    warning: { bar: 'var(--nx-lamp-warning)', ink: '#ffffff' },
    error: { bar: 'var(--nx-lamp-danger)', ink: '#ffffff' },
};

const drop = keyframes`
    from { opacity: 0; transform: translateY(-8px) scale(0.985); }
    60%  { opacity: 1; transform: translateY(1px)  scale(1.002); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
`;

const Container = styled.div<{ $type: FlashMessageType }>`
    display: flex;
    align-items: stretch;
    overflow: hidden;
    border-radius: var(--nx-radius);
    background: linear-gradient(180deg, var(--nx-raised), var(--nx-raised-2));
    color: var(--nx-ink);
    /* lit top lip, dark underside, tight contact line — the same construction as
       every other raised object in the panel */
    box-shadow: 0 1px 0 var(--nx-contact), var(--nx-raise-sm), var(--nx-bevel-top),
        inset 0 0 0 1px var(--nx-edge);
    animation: ${drop} 260ms cubic-bezier(0.2, 0.9, 0.3, 1.1) both;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`;

const Bar = styled.div<{ $type: FlashMessageType }>`
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 2.75rem;
    background: linear-gradient(
        180deg,
        color-mix(in srgb, ${(p) => ENAMEL[p.$type].bar} 88%, #fff),
        ${(p) => ENAMEL[p.$type].bar}
    );
    color: ${(p) => ENAMEL[p.$type].ink};
    /* the icon is stamped into the enamel: a shadow under its top lip and a lit
       line along the bottom of the bar */
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.3),
        inset -1px 0 0 rgba(0, 0, 0, 0.22);

    & > svg {
        width: 1.25rem;
        height: 1.25rem;
    }
`;

const Body = styled.div`
    flex: auto;
    min-width: 0;
    padding: 0.6rem 0.9rem;
    font-size: 0.8125rem;
    line-height: 1.5;
    text-align: left;
`;

const Title = styled.span<{ $type: FlashMessageType }>`
    display: inline-block;
    margin-right: 0.6rem;
    padding: 0.1rem 0.45rem;
    border-radius: 5px;
    font-family: 'Karla', system-ui, sans-serif;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    vertical-align: 0.08em;
    color: ${(p) => ENAMEL[p.$type].ink};
    background: ${(p) => ENAMEL[p.$type].bar};
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32), inset 0 -1px 2px rgba(0, 0, 0, 0.25);
`;

const MessageBox = ({ title, children, type = 'info' }: Props) => {
    const Icon = ICONS[type];

    return (
        <Container $type={type} role={'alert'}>
            <Bar $type={type}>
                <Icon />
            </Bar>
            <Body>
                {title && <Title $type={type}>{title}</Title>}
                {children}
            </Body>
        </Container>
    );
};

MessageBox.displayName = 'MessageBox';

export default MessageBox;
