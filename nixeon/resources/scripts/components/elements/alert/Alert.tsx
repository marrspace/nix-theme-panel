import { ExclamationIcon, ShieldExclamationIcon } from '@heroicons/react/outline';
import React from 'react';
import classNames from 'classnames';

interface AlertProps {
    type: 'warning' | 'danger';
    className?: string;
    children: React.ReactNode;
}

/**
 * Inline alert.
 *
 * Previously a translucent tint with light text, which only worked on a dark page.
 * It is now a solid tinted well with a thick coloured left edge, so it reads as a
 * stamped warning strip on a light surface and keeps AA contrast in both themes.
 */
export default ({ type, className, children }: AlertProps) => {
    const danger = type === 'danger';

    return (
        <div
            className={classNames('flex items-center rounded-md px-4 py-3', className)}
            style={{
                background: danger ? 'var(--nx-danger-soft)' : 'var(--nx-warning-soft)',
                borderLeft: `8px solid ${danger ? 'var(--nx-danger-ink)' : 'var(--nx-warning-ink)'}`,
                boxShadow: 'var(--nx-sink-sm)',
                color: 'var(--nx-ink)',
            }}
        >
            {danger ? (
                <ShieldExclamationIcon className={'w-6 h-6 mr-2'} style={{ color: 'var(--nx-danger-ink)' }} />
            ) : (
                <ExclamationIcon className={'w-6 h-6 mr-2'} style={{ color: 'var(--nx-warning-ink)' }} />
            )}
            {children}
        </div>
    );
};
