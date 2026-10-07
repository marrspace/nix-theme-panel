import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import BrandMark from '@/components/elements/BrandMark';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

/**
 * The auth card is a raised aluminium plate: it sits *above* the page field, so it
 * takes the large diffuse shadow plus a bright chamfer on the top edge. The mark is
 * a smaller raised tile on top of it, which gives the page a clear focal point on
 * mobile where there is no room for a hero column.
 */
const Shell = styled.div`
    width: 100%;
    max-width: 27rem;
    margin: 0 auto;
    padding: 0 1rem;

    ${breakpoint('sm')`
        padding: 0;
    `};
`;

const Plate = styled.div`
    position: relative;
    padding: 2rem 1.5rem 1.75rem;
    border-radius: var(--nx-radius-xl);
    background: linear-gradient(180deg, var(--nx-raised), var(--nx-raised-2));
    /* the hairline ring keeps the plate separated from the page field even on a
       low-contrast display, where the soft shadow alone can dissolve */
    box-shadow: var(--nx-raise-lg), var(--nx-bevel-top), var(--nx-rim), 0 0 0 1px var(--nx-edge);

    ${breakpoint('sm')`
        padding: 2.5rem 2.25rem 2rem;
    `};
`;

const Brand = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
    margin-bottom: 1.75rem;
`;

const Wordmark = styled.div`
    display: flex;
    align-items: center;
    gap: 0.7rem;
`;

const Name = styled.span`
    font-family: 'Fraunces', Georgia, serif;
    font-size: 1.6rem;
    font-weight: 600;
    letter-spacing: -0.015em;
    color: var(--nx-ink);
    font-variation-settings: 'SOFT' 22, 'WONK' 1;
`;

const Edition = styled.span`
    /* Rendered as a small inset chip rather than a floating superscript: an
       under-sized number sitting high next to the wordmark reads as a typo or an
       orphaned version tag, whereas a deliberate badge reads as an edition mark. */
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    line-height: 1;
    color: var(--nx-ink-2);
    background: var(--nx-sunken);
    border-radius: 6px;
    padding: 0.28rem 0.42rem 0.24rem;
    box-shadow: var(--nx-sink-sm);
    align-self: center;
`;

const Title = styled.h2`
    font-family: 'Fraunces', Georgia, serif;
    font-size: 1.05rem;
    font-weight: 500;
    text-align: center;
    color: var(--nx-ink-2);
    margin-bottom: 1.5rem;
    font-variation-settings: 'SOFT' 30, 'WONK' 0;
`;

const Footer = styled.p`
    text-align: center;
    font-size: 0.72rem;
    letter-spacing: 0.02em;
    color: var(--nx-ink-2);
    margin-top: 1.5rem;

    a {
        color: var(--nx-ink-2);
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: color var(--nx-t-fast) linear, border-color var(--nx-t-fast) linear;

        &:hover {
            color: var(--nx-ink);
            border-bottom-color: var(--nx-ink-2);
        }
    }
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Shell>
        <Plate>
            <Brand>
                <BrandMark size={62} tile />
                <Wordmark>
                    <Name>Nixeon</Name>
                    <Edition>408</Edition>
                </Wordmark>
            </Brand>

            {title && <Title>{title}</Title>}

            <FlashMessageRender css={tw`mb-4`} />

            <Form noValidate {...props} ref={ref}>
                {props.children}
            </Form>

            <Footer>
                &copy; 2015 &ndash; {new Date().getFullYear()} Nixeon 408 &middot; powered by{' '}
                <a rel={'noopener nofollow noreferrer'} href={'https://pterodactyl.io'} target={'_blank'}>
                    Pterodactyl
                </a>
            </Footer>
        </Plate>
    </Shell>
));
