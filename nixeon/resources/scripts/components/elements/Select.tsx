import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

interface Props {
    hideDropdownArrow?: boolean;
}

/**
 * Select — a well with a machined caret.
 *
 * Matches the text inputs: sunken face, no border, focus ring from the accent. The
 * caret is drawn as an inline SVG so it can be tinted with the theme's ink colour
 * instead of a fixed hex that only worked on the dark theme.
 */
const Select = styled.select<Props>`
    ${tw`block p-3 pr-8 rounded w-full text-sm transition-colors duration-150 ease-linear`};
    background: var(--nx-sunken);
    color: var(--nx-ink);
    border: 0;
    box-shadow: var(--nx-sink), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 -1px 0 var(--nx-light);

    &,
    &:hover:not(:disabled),
    &:focus {
        ${tw`outline-none`};
    }

    -webkit-appearance: none;
    -moz-appearance: none;
    background-size: 1rem;
    background-repeat: no-repeat;
    background-position-x: calc(100% - 0.75rem);
    background-position-y: center;

    &::-ms-expand {
        display: none;
    }

    ${(props) =>
        !props.hideDropdownArrow &&
        css`
            /* the caret is an inline SVG tinted to the theme's secondary ink */
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='%2369737B' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3e%3c/svg%3e ");

            &:focus {
                box-shadow: var(--nx-sink), 0 0 0 2px var(--nx-accent), 0 0 14px var(--nx-accent-shade);
            }
        `};

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export default Select;
