import React from 'react';
import tw from 'twin.macro';

/**
 * Cron reference tables.
 *
 * Previously two flat panels with hard-coded `bg-neutral-500` zebra rows, which
 * has no physical logic — the stripes were a different material from the panel
 * behind them. Here each table is a single plate and the zebra is a *recessed*
 * row inside it, so the striping reads as machining rather than as a colour swap.
 */
const Table = ({ title, rows }: { title: string; rows: [string, string][] }) => (
    <div className={'nx-card'} css={tw`md:w-1/2 h-full p-0 overflow-hidden`}>
        <h2
            css={tw`py-4 px-6 text-base`}
            style={{
                color: 'var(--nx-ink)',
                background: 'linear-gradient(180deg, var(--nx-raised), var(--nx-raised-2))',
                borderBottom: '1px solid var(--nx-edge)',
            }}
        >
            {title}
        </h2>
        <div css={tw`flex flex-col`}>
            {rows.map(([expr, meaning], i) => (
                <div
                    key={expr}
                    css={tw`flex py-4 px-6`}
                    style={
                        i % 2 === 1
                            ? { background: 'var(--nx-sunken)', boxShadow: 'inset 0 1px 0 var(--nx-edge)' }
                            : undefined
                    }
                >
                    <div className={'nx-mono'} css={tw`w-1/2 text-sm`} style={{ color: 'var(--nx-accent-ink)' }}>
                        {expr}
                    </div>
                    <div css={tw`w-1/2 text-sm`} style={{ color: 'var(--nx-ink-2)' }}>
                        {meaning}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const EXAMPLES: [string, string][] = [
    ['*/5 * * * *', 'every 5 minutes'],
    ['0 */1 * * *', 'every hour'],
    ['0 8-12 * * *', 'hour range'],
    ['0 0 * * *', 'once a day'],
    ['0 0 * * MON', 'every Monday'],
];

const SPECIAL: [string, string][] = [
    ['*', 'any value'],
    [',', 'value list separator'],
    ['-', 'range values'],
    ['/', 'step values'],
];

export default () => (
    <div css={tw`flex flex-col md:flex-row gap-4`}>
        <Table title={'Examples'} rows={EXAMPLES} />
        <Table title={'Special Characters'} rows={SPECIAL} />
    </div>
);
