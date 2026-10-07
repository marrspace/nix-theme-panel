import styled from 'styled-components/macro';
import tw from 'twin.macro';

/**
 * Field label — a small stamped caption above the well.
 *
 * Kept in Karla rather than the display face: labels sit directly above dense form
 * fields, and a serif there fights the input text. The uppercase + tracking is what
 * gives it the "engraved caption" feel without hurting legibility.
 *
 * The old `isLight` prop used to force `text-neutral-700`. That was written for the
 * OLD login page, which had a permanently dark background; once the panel gained a
 * light theme, `neutral-700` began resolving to a dark ink in dark mode, so every
 * auth label rendered at about 1.1:1 against the card — effectively invisible. The
 * label now always follows `--nx-ink-2`; the prop is kept only so existing call
 * sites do not break, exactly as `Input` already does.
 */
const Label = styled.label<{ isLight?: boolean }>`
    ${tw`block text-xs font-bold uppercase mb-1.5 sm:mb-2`};
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    color: var(--nx-ink-2);
`;

export default Label;
