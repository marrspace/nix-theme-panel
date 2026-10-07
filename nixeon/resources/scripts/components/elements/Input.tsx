import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

export interface Props {
    isLight?: boolean;
    hasError?: boolean;
}

/**
 * Inputs are *wells*, not boxes: the field is milled into the surface rather than
 * drawn on top of it. That is the whole difference between neumorphism that reads as
 * a real panel and neumorphism that reads as a blurry rectangle.
 *
 * The old `isLight` prop is kept for API compatibility — every call site still passes
 * it — but it no longer switches colour schemes, because the field now follows the
 * theme. Only the label weight changes, so the prop stays meaningful.
 */
const well = css<Props>`
    background: var(--nx-sunken);
    color: var(--nx-ink);
    border: 0;
    border-radius: var(--nx-radius);
    box-shadow: var(--nx-sink), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 -1px 0 var(--nx-light);
    transition: box-shadow var(--nx-t-fast) linear;

    &::placeholder {
        color: var(--nx-ink-ph);
    }

    &:hover:not(:disabled):not(:read-only) {
        box-shadow: var(--nx-sink), inset 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 -1px 0 var(--nx-light);
    }

    /* focus reads as the well lighting up from inside, not a browser outline */
    &:not(:disabled):not(:read-only):focus {
        box-shadow: var(--nx-sink), 0 0 0 2px var(--nx-accent), 0 0 6px var(--nx-accent-shade);
    }

    &:disabled,
    &:read-only {
        opacity: 0.62;
        cursor: not-allowed;
    }

    & + .input-help {
        ${tw`mt-1.5 text-xs`};
        color: var(--nx-ink-3);
    }

    & + .input-help.error {
        color: var(--nx-danger-ink);
        display: flex;
        align-items: baseline;
        gap: 6px;

        /* a fault is a lit lamp plus its caption — the same read as the panel
           indicators, so an inline error belongs to the hardware, not the page. */
        &::before {
            content: '';
            flex: none;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--nx-danger-ink);
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4),
                0 0 6px color-mix(in srgb, var(--nx-danger-ink) 55%, transparent);
            transform: translateY(-1px);
        }
    }
`;

const errorWell = css`
    box-shadow: var(--nx-sink), 0 0 0 2px var(--nx-danger-ink);

    &:not(:disabled):not(:read-only):focus {
        box-shadow: var(--nx-sink), 0 0 0 2px var(--nx-danger-ink),
            0 0 14px color-mix(in srgb, var(--nx-danger-ink) 40%, transparent);
    }
`;

const inputStyle = css<Props>`
    resize: none;
    ${tw`appearance-none outline-none w-full min-w-0`};
    ${tw`px-3.5 py-2.5 text-sm`};
    ${well};

    ${(props) => props.hasError && errorWell};
`;

/* The checkbox is a machined stud: sunken socket, raised metal cap when checked. */
const checkboxStyle = css<Props>`
    ${tw`cursor-pointer appearance-none inline-block align-middle select-none flex-shrink-0 w-4 h-4`};
    border-radius: 5px;
    background: var(--nx-sunken);
    box-shadow: var(--nx-sink-sm);
    color-adjust: exact;
    background-origin: border-box;
    transition: background var(--nx-t-fast) linear, box-shadow var(--nx-t-fast) linear;

    &:checked {
        background-color: var(--nx-accent);
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100% 100%;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.42), inset 0 -2px 4px rgba(0, 0, 0, 0.28),
            2px 2px 5px var(--nx-accent-shade);
    }

    &:focus-visible {
        box-shadow: var(--nx-sink-sm), 0 0 0 2px var(--nx-accent);
    }
`;

const Input = styled.input<Props>`
    &:not([type='checkbox']):not([type='radio']) {
        ${inputStyle};
    }

    &[type='checkbox'],
    &[type='radio'] {
        ${checkboxStyle};

        &[type='radio'] {
            border-radius: 50%;
        }
    }
`;

const Textarea = styled.textarea<Props>`
    ${inputStyle}
`;

export { Textarea };
export default Input;
