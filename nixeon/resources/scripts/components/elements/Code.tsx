import React from 'react';
import classNames from 'classnames';

interface CodeProps {
    dark?: boolean | undefined;
    className?: string;
    children: React.ReactChild | React.ReactFragment | React.ReactPortal;
}

/**
 * Inline code.
 *
 * Rendered as a small milled well rather than a filled grey chip, so a code token
 * reads as something pressed into the page. `dark` is kept for API compatibility
 * (many call sites pass it) but no longer changes the colour — the token follows the
 * theme, because a hard black chip on a light page was the loudest remaining
 * un-themed element.
 */
export default ({ dark, className, children }: CodeProps) => (
    <code className={classNames('nx-well nx-mono text-sm px-2 py-1 inline-block', className)}>
        {children}
    </code>
);
