import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

/**
 * A titled panel: a raised body with a recessed header rail.
 *
 * The header is SUNKEN and the body is RAISED, so the title reads as a stamped
 * label milled into the top of the box. That contrast between the two halves is
 * what makes it look like an instrument enclosure rather than a rounded rectangle
 * with a slightly different rectangle on top.
 */
const Body = styled.div`
    border-radius: var(--nx-radius-lg);
    overflow: hidden;
    color: var(--nx-ink);
    background: linear-gradient(180deg, var(--nx-raised), var(--nx-raised-2));
    box-shadow: var(--nx-raise), var(--nx-bevel-top), 0 0 0 1px var(--nx-edge);
`;

const Head = styled.div`
    padding: 0.7rem 0.9rem;
    background: var(--nx-sunken);
    box-shadow: inset 0 -1px 0 var(--nx-edge), inset 0 1px 0 var(--nx-light);
`;

const Content = styled.div`
    padding: 0.9rem;
`;

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <Body className={className}>
        <Head>
            {typeof title === 'string' ? (
                <p css={tw`text-xs font-bold uppercase tracking-wider m-0`} style={{ color: 'var(--nx-ink-2)' }}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2`} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </Head>
        <Content>{children}</Content>
    </Body>
);

export default memo(TitledGreyBox, isEqual);
