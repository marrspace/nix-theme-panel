import React from 'react';
import classNames from 'classnames';
import styles from '@/components/server/console/style.module.css';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * A gauge card.
 *
 * The chart is set into a SUNKEN WELL inside a raised card, so it reads as a dial
 * let into an instrument face rather than a rectangle that happens to contain a
 * canvas. The title strip carries a hairline groove, matching the console bezel.
 */
export default ({ title, legend, children }: ChartBlockProps) => (
    <div className={classNames(styles.chart_container, 'group')}>
        <div className={styles.chart_title}>
            <h3
                className={'font-header font-medium transition-colors duration-100 group-hover:text-neutral-100'}
                style={{ fontSize: '0.95rem', letterSpacing: '-0.005em' }}
            >
                {title}
            </h3>
            {legend && <p className={'text-sm flex items-center gap-3'}>{legend}</p>}
        </div>
        <div className={styles.chart_well}>{children}</div>
    </div>
);
