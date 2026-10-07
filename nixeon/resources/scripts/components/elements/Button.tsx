import React from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';

interface Props {
    isLoading?: boolean;
    size?: 'xsmall' | 'small' | 'large' | 'xlarge';
    color?: 'green' | 'red' | 'primary' | 'grey';
    isSecondary?: boolean;
}

/**
 * A button is a physical key.
 *
 * The variant only changes the PLATING; it never changes the physics. Every button
 * keeps the same raised face, the same chamfer (bright top lip, dark bottom lip) and
 * the same 1px travel on press — that consistency is what makes the whole panel feel
 * like one machined object rather than a pile of styles.
 */
const key = css`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: 0;
    border-radius: var(--nx-radius);
    font-family: 'Karla', system-ui, sans-serif;
    font-weight: 700;
    font-size: 0.875rem;
    letter-spacing: 0.008em;
    min-height: var(--nx-tap);
    color: var(--nx-ink);
    /* a control is its OWN material, not the surface it sits on: --nx-raised is
       the card's face, so reusing it made buttons vanish into cards in dark mode */
    background: linear-gradient(180deg, var(--nx-control), var(--nx-control-2));
    box-shadow: var(--nx-key), var(--nx-raise-sm), inset 0 0 0 1px var(--nx-control-edge);
    transition: box-shadow var(--nx-t-fast) var(--nx-ease-press),
        transform var(--nx-t-fast) var(--nx-ease-press), background var(--nx-t-fast) linear;

    &:active:not(:disabled) {
        box-shadow: var(--nx-sink-sm), inset 0 1px 2px rgba(0, 0, 0, 0.12);
        transform: translateY(1px);
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        box-shadow: var(--nx-sink-sm);
    }
`;

/* accent = a plated cap: saturated face, bright chamfer, deep under-edge */
const accentPlate = css`
    color: #fff;
    background: linear-gradient(180deg, var(--nx-plate-accent), var(--nx-plate-accent-deep));
    /* Same light source as every other surface: a tight contact shadow at the base,
       a cast shadow down-right, and a lit top lip. A coloured halo would be an
       EMISSIVE cue, and mixing an emissive object into a lit scene is what makes a
       design read as assembled rather than built. */
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 1px 0 var(--nx-plate-accent-deep),
        1px 2px 3px var(--nx-contact), 3px 4px 10px var(--nx-accent-shade),
        inset 0 -2px 4px rgba(0, 0, 0, 0.3);

    &:active:not(:disabled) {
        box-shadow: inset 3px 3px 9px rgba(0, 0, 0, 0.34), inset -3px -3px 8px rgba(255, 255, 255, 0.16);
        transform: translateY(1px);
    }
`;

/** semantic plating driven by a token name, e.g. `--nx-danger` */
const plate = (token: string) => css`
    color: #fff;
    background: linear-gradient(180deg, var(${token}), color-mix(in srgb, var(${token}) 76%, #000));
    /* identical light model to the accent plate — only the plating colour differs */
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.42), 0 1px 0 color-mix(in srgb, var(${token}) 62%, #000),
        1px 2px 3px var(--nx-contact), 3px 4px 10px color-mix(in srgb, var(${token}) 30%, transparent),
        inset 0 -2px 4px rgba(0, 0, 0, 0.28);

    &:active:not(:disabled) {
        box-shadow: inset 3px 3px 9px rgba(0, 0, 0, 0.32), inset -3px -3px 8px rgba(255, 255, 255, 0.14);
        transform: translateY(1px);
    }
`;

const bare = css`
    color: var(--nx-ink);
    background: linear-gradient(180deg, var(--nx-control), var(--nx-control-2));
    box-shadow: var(--nx-key), var(--nx-raise-sm), inset 0 0 0 1px var(--nx-control-edge);

    &:active:not(:disabled) {
        box-shadow: var(--nx-sink-sm), inset 0 1px 2px rgba(0, 0, 0, 0.12);
    }
`;

const ButtonStyle = styled.button<Omit<Props, 'isLoading'>>`
    ${key};

    ${(p) => p.size === 'xsmall' &&
    css`
        ${tw`px-3 py-1 text-xs`};
        min-height: 30px;
        border-radius: var(--nx-radius-sm);
    `};
    ${(p) => (!p.size || p.size === 'small') && tw`px-4`};
    ${(p) => p.size === 'large' && tw`px-5`};
    ${(p) => p.size === 'xlarge' && tw`px-5 w-full`};

    /* plating — primary is the default */
    ${(p) => !p.isSecondary && (!p.color || p.color === 'primary') && accentPlate};
    ${(p) => p.color === 'red' && plate('--nx-lamp-danger')};
    ${(p) => p.color === 'green' && plate('--nx-lamp-success')};
    ${(p) => p.color === 'grey' && bare};

    /* secondary always drops back to the bare key, whatever the colour */
    ${(p) => p.isSecondary && bare};
`;

type ComponentProps = Omit<JSX.IntrinsicElements['button'], 'ref' | keyof Props> & Props;

const Button: React.FC<ComponentProps> = ({ children, isLoading, ...props }) => (
    <ButtonStyle {...props}>
        {isLoading && (
            <div css={tw`flex absolute justify-center items-center w-full h-full left-0 top-0`}>
                <Spinner size={'small'} />
            </div>
        )}
        <span css={isLoading ? tw`text-transparent` : undefined}>{children}</span>
    </ButtonStyle>
);

type LinkProps = Omit<JSX.IntrinsicElements['a'], 'ref' | keyof Props> & Props;

const LinkButton: React.FC<LinkProps> = (props) => <ButtonStyle as={'a'} {...props} />;

export { LinkButton, ButtonStyle };
export default Button;
