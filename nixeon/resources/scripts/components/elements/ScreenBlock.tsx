import React from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import styled, { keyframes } from 'styled-components/macro';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import NotFoundSvg from '@/assets/images/not_found.svg';
import ServerErrorSvg from '@/assets/images/server_error.svg';

interface BaseProps {
    title: string;
    image: string;
    message: string;
    onRetry?: () => void;
    onBack?: () => void;
}

interface PropsWithRetry extends BaseProps {
    onRetry?: () => void;
    onBack?: never;
}

interface PropsWithBack extends BaseProps {
    onBack?: () => void;
    onRetry?: never;
}

export type ScreenBlockProps = PropsWithBack | PropsWithRetry;

const spin = keyframes`
    to { transform: rotate(360deg) }
`;

const ActionButton = styled(Button)`
    ${tw`rounded-full w-8 h-8 flex items-center justify-center p-0`};

    &.hover\\:spin:hover {
        animation: ${spin} 2s linear infinite;
    }
`;

/*
 * The fault panel.
 *
 * This was a stock `rounded-lg shadow-lg` card — a plain white box with a centred
 * SVG and two lines of text, which is the single most generic way to present an
 * error and exactly the "standard error message" this design is meant to remove.
 *
 * An error in a control panel is a FAULT CONDITION, so it is presented the way a
 * machine reports one: a nameplate across the top carrying a lit status lamp and a
 * stamped code, the diagnostic art set into a recessed well, and the explanation
 * engraved below it. Retry/back controls sit in a footer rail attached to the plate,
 * so the action belongs to the object that failed rather than floating near it.
 */
const FaultPanel = styled.div`
    position: relative;
    width: 100%;
    max-width: 34rem;
    margin: 0 auto;
    border-radius: var(--nx-radius-lg);
    overflow: hidden;
    background: linear-gradient(180deg, var(--nx-raised), var(--nx-raised-2));
    box-shadow: 0 1px 0 var(--nx-contact), var(--nx-raise), var(--nx-bevel-top), 0 0 0 1px var(--nx-edge);
    text-align: center;

    /* the nameplate strip: lamp + stamped label */
    & > .plate-head {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.7rem 1rem;
        box-shadow: inset 0 -1px 0 var(--nx-edge), inset 0 -2px 0 var(--nx-light);

        & > .lamp {
            flex: none;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: radial-gradient(
                circle at 35% 30%,
                #fff 0%,
                var(--nx-danger) 42%,
                color-mix(in srgb, var(--nx-danger) 70%, #000) 100%
            );
            box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--nx-sunken-2),
                0 0 5px color-mix(in srgb, var(--nx-danger) 55%, transparent);
        }

        & > .code {
            flex: 1 1 auto;
            text-align: left;
            font-family: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
            font-size: 0.6875rem;
            font-weight: 600;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--nx-ink-3);
            text-shadow: 0 1px 0 var(--nx-light);
        }
    }

    /* the diagnostic art sits in a recessed well, not floating on the plate */
    & > .art {
        margin: 1.25rem 1.25rem 0;
        border-radius: var(--nx-radius);
        padding: 1.25rem 1rem;
        background: var(--nx-sunken);
        box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.18), inset 0 -1px 0 var(--nx-light),
            inset 0 0 0 1px var(--nx-edge);

        & img {
            width: 60%;
            max-width: 12rem;
            height: auto;
            margin: 0 auto;
            user-select: none;
            filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.22));
        }
    }

    /* the engraved title + explanation */
    & > h2 {
        margin-top: 1.4rem;
        padding: 0 1.25rem;
        font-family: 'Fraunces', Georgia, serif;
        font-weight: 600;
        font-size: clamp(1.5rem, 5vw, 2.1rem);
        letter-spacing: -0.01em;
        color: var(--nx-ink);
        text-shadow: 0 1px 0 var(--nx-light);
    }

    & > p {
        margin-top: 0.5rem;
        padding: 0 1.5rem;
        font-size: 0.875rem;
        line-height: 1.55;
        color: var(--nx-ink-2);
    }

    /* the footer rail: the actions belong to the panel that failed */
    & > .actions {
        display: flex;
        justify-content: center;
        gap: 0.6rem;
        margin-top: 1.5rem;
        padding: 1rem 1.25rem 1.25rem;
        box-shadow: inset 0 1px 0 var(--nx-light);
    }
`;

const ScreenBlock = ({ title, image, message, onBack, onRetry }: ScreenBlockProps) => (
    <PageContentBlock>
        <div css={tw`flex justify-center`}>
            <FaultPanel className={'nx-enter'}>
                <div className={'plate-head'}>
                    <span className={'lamp'} aria-hidden />
                    <span className={'code'}>Fault &middot; {title}</span>
                </div>
                <div className={'art'}>
                    <img src={image} alt={''} />
                </div>
                <h2>{title}</h2>
                <p>{message}</p>
                {(typeof onBack === 'function' || typeof onRetry === 'function') && (
                    <div className={'actions'}>
                        <ActionButton
                            onClick={() => (onRetry ? onRetry() : onBack ? onBack() : null)}
                            className={onRetry ? 'hover:spin' : undefined}
                        >
                            <FontAwesomeIcon icon={onRetry ? faSyncAlt : faArrowLeft} className={'w-4 h-4'} />
                            <span className={'sr-only'}>{onRetry ? 'Retry' : 'Go back'}</span>
                        </ActionButton>
                    </div>
                )}
            </FaultPanel>
        </div>
    </PageContentBlock>
);

type ServerErrorProps = (Omit<PropsWithBack, 'image' | 'title'> | Omit<PropsWithRetry, 'image' | 'title'>) & {
    title?: string;
};

const ServerError = ({ title, ...props }: ServerErrorProps) => (
    <ScreenBlock title={title || 'Something went wrong'} image={ServerErrorSvg} {...props} />
);

const NotFound = ({ title, message, onBack }: Partial<Pick<ScreenBlockProps, 'title' | 'message' | 'onBack'>>) => (
    <ScreenBlock
        title={title || '404'}
        image={NotFoundSvg}
        message={message || 'The requested resource was not found.'}
        onBack={onBack}
    />
);

export { ServerError, NotFound };
export default ScreenBlock;
