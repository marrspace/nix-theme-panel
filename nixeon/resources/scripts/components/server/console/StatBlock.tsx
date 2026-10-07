import React from 'react';
import Icon from '@/components/elements/Icon';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import styles from './style.module.css';
import useFitText from 'use-fit-text';
import CopyOnClick from '@/components/elements/CopyOnClick';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    color?: string | undefined;
    icon: IconDefinition;
    children: React.ReactNode;
    className?: string;
}

/**
 * A resource readout tile (CPU / RAM / disk / uptime).
 *
 * The value is set in the display face with tabular figures so the numbers line up
 * in a column and do not jitter as they change — the single most important detail
 * on a live-updating dashboard. `color` still arrives as a utility class from the
 * call sites (a status lamp colour), so it is applied only to the thin edge lamp.
 */
export default ({ title, copyOnClick, icon, color, className, children }: StatBlockProps) => {
    const { fontSize, ref } = useFitText({ minFontSize: 8, maxFontSize: 500 });

    return (
        <CopyOnClick text={copyOnClick}>
            <div className={classNames(styles.stat_block, className)}>
                <div className={classNames(styles.status_bar, color)} />
                <div className={styles.icon}>
                    <Icon icon={icon} />
                </div>
                <div className={'flex flex-col justify-center overflow-hidden w-full'}>
                    <p className={'nx-caption leading-tight'}>{title}</p>
                    <div
                        ref={ref}
                        className={'nx-readout h-[1.75rem] w-full truncate'}
                        style={{ fontSize }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
};
