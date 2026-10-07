import React, { useMemo } from 'react';
import styled from 'styled-components/macro';
import { v4 } from 'uuid';
import tw from 'twin.macro';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';

/**
 * Generic on/off switch.
 *
 * Rebuilt on the same physics as the theme toggle: a milled track with a brushed
 * metal cap that travels. The previous version used a near-white track on a
 * near-white surface, so the control looked permanently disabled and its state was
 * unreadable — the "off" track is now decisively darker than the page and the knob
 * carries the accent colour when on.
 */
const ToggleContainer = styled.div`
    position: relative;
    user-select: none;
    flex: none;
    width: 52px;

    & > input[type='checkbox'] {
        ${tw`hidden`};

        &:checked + label {
            background: linear-gradient(180deg, var(--nx-accent), var(--nx-accent-deep));
            box-shadow: inset 3px 3px 7px rgba(0, 0, 0, 0.34), inset -2px -2px 6px rgba(255, 255, 255, 0.22),
                0 0 0 1px var(--nx-accent-deep);
        }

        &:checked + label::before {
            left: 26px;
        }

        &:disabled + label {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    & > label {
        display: block;
        position: relative;
        width: 52px;
        height: 28px;
        margin: 0;
        border-radius: 999px;
        cursor: pointer;
        background: var(--nx-sunken-2);
        box-shadow: inset 4px 4px 8px var(--nx-shade), inset -3px -3px 8px var(--nx-light),
            inset 0 1px 3px rgba(0, 0, 0, 0.22), 0 0 0 1px var(--nx-edge);
        transition: background var(--nx-t) var(--nx-ease-press), box-shadow var(--nx-t) var(--nx-ease-press);

        &::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: radial-gradient(circle at 34% 28%, #ffffff, var(--nx-raised) 52%, var(--nx-sunken-2));
            box-shadow: 2px 2px 5px var(--nx-shade), -2px -2px 4px var(--nx-light),
                inset 0 -2px 3px rgba(0, 0, 0, 0.2), inset 0 2px 2px rgba(255, 255, 255, 0.9);
            transition: left var(--nx-t) var(--nx-ease-settle);
        }
    }
`;

export interface SwitchProps {
    name: string;
    label?: string;
    description?: string;
    defaultChecked?: boolean;
    readOnly?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children?: React.ReactNode;
}

const Switch = ({ name, label, description, defaultChecked, readOnly, onChange, children }: SwitchProps) => {
    const uuid = useMemo(() => v4(), []);

    return (
        <div css={tw`flex items-center`}>
            <ToggleContainer>
                {children || (
                    <Input
                        id={uuid}
                        name={name}
                        type={'checkbox'}
                        onChange={(e) => onChange && onChange(e)}
                        defaultChecked={defaultChecked}
                        disabled={readOnly}
                    />
                )}
                <Label htmlFor={uuid} css={tw`sr-only`} />
            </ToggleContainer>
            {(label || description) && (
                <div css={tw`ml-4 w-full`}>
                    {label && (
                        <Label css={[tw`cursor-pointer normal-case`, !!description && tw`mb-0`]} htmlFor={uuid}>
                            {label}
                        </Label>
                    )}
                    {description && (
                        <p css={tw`text-sm mt-2`} style={{ color: 'var(--nx-ink-2)' }}>
                            {description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Switch;
