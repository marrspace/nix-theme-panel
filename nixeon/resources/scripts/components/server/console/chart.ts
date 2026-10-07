import {
    Chart as ChartJS,
    ChartData,
    ChartDataset,
    ChartOptions,
    Filler,
    LinearScale,
    LineElement,
    PointElement,
} from 'chart.js';
import { DeepPartial } from 'ts-essentials';
import { useEffect, useState } from 'react';
import { deepmerge, deepmergeCustom } from 'deepmerge-ts';
import { themeColor, onThemeChange } from '@/lib/theme-colors';

ChartJS.register(LineElement, PointElement, Filler, LinearScale);

/**
 * The three graph panels.
 *
 * Everything here is drawn on a <canvas>, which has no cascade: `var(--nx-…)`
 * can never resolve inside it, and Tailwind's `theme()` helper leaks its
 * `<alpha-value>` placeholder when used as a runtime value. Both faults are why
 * these charts previously painted with no grid and no line colour. Colours now
 * come from `themeColor()`, which reads the live custom properties.
 *
 * The charts are a READOUT, not a terminal: they sit above the CPU/RAM stat
 * tiles and follow the theme exactly as those tiles do, so every colour comes
 * from the theme-aware `--nx-chart-*` tokens (a light recess needs dark ink, a
 * dark recess needs bright ink). The console below keeps its fixed dark palette
 * because a terminal is the machine, but a graph is a panel surface.
 *
 * A canvas also does not repaint when the theme class flips, so the chart options
 * are rebuilt on theme change (see `useThemeRevision`).
 */

const buildOptions = (): ChartOptions<'line'> => ({
    responsive: true,
    animation: false,
    // the tick labels are 10px text, so they take the readout ink token
    color: themeColor('chart-ink'),
    plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: { enabled: false },
    },
    layout: {
        padding: 0,
    },
    scales: {
        x: {
            min: 0,
            max: 19,
            type: 'linear',
            grid: {
                display: false,
                drawBorder: false,
            },
            ticks: {
                display: false,
            },
        },
        y: {
            min: 0,
            type: 'linear',
            grid: {
                display: true,
                color: themeColor('chart-grid'),
                drawBorder: false,
            },
            ticks: {
                display: true,
                count: 3,
                color: themeColor('chart-ink'),
                font: {
                    family: 'IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
                    size: 10,
                    weight: '500',
                },
            },
        },
    },
    elements: {
        point: {
            radius: 0,
        },
        line: {
            tension: 0.15,
        },
    },
});

/** Default dataset — the "no data yet" flatline. */
const emptyDataset = (label: string): ChartDataset<'line'> => ({
    fill: true,
    label,
    data: Array(20).fill(-5),
    borderColor: themeColor('chart-trace'),
    backgroundColor: themeColor('chart-trace', 0.18),
    borderWidth: 1.5,
});

type ChartDatasetCallback = (value: ChartDataset<'line'>, index: number) => ChartDataset<'line'>;

function getEmptyData(label: string, sets = 1, callback?: ChartDatasetCallback | undefined): ChartData<'line'> {
    const next = callback || ((value) => value);

    return {
        labels: Array(20)
            .fill(0)
            .map((_, index) => index),
        datasets: Array(sets)
            .fill(0)
            .map((_, index) => next(emptyDataset(label), index)),
    };
}

const merge = deepmergeCustom({ mergeArrays: false });

interface UseChartOptions {
    sets: number;
    options?: DeepPartial<ChartOptions<'line'>> | number | undefined;
    callback?: ChartDatasetCallback | undefined;
}

/**
 * Bumps whenever the theme class flips, so the canvas rebuilds its options and
 * datasets against the new custom-property values.
 */
function useThemeRevision(): number {
    const [revision, setRevision] = useState(0);

    useEffect(() => onThemeChange(() => setRevision((value) => value + 1)), []);

    return revision;
}

function useChart(label: string, opts?: UseChartOptions) {
    const revision = useThemeRevision();

    const options = deepmerge(
        buildOptions(),
        typeof opts?.options === 'number' ? { scales: { y: { min: 0, suggestedMax: opts.options } } } : opts?.options || {}
    );

    const [data, setData] = useState(getEmptyData(label, opts?.sets || 1, opts?.callback));

    /*
     * The datasets hold resolved colour strings, so a theme flip has to re-run the
     * callback (or the empty default) and merge the new colours in — otherwise the
     * chart keeps painting the previous theme's line colours on the new face.
     */
    useEffect(() => {
        setData((state) => ({
            ...state,
            datasets: state.datasets.map((value, index) => ({
                ...(opts?.callback ? opts.callback(value, index) : emptyDataset(label)),
                // keep whatever samples have already been drawn
                data: value.data,
            })),
        }));
    }, [revision]);

    const push = (items: number | null | (number | null)[]) =>
        setData((state) =>
            merge(state, {
                datasets: (Array.isArray(items) ? items : [items]).map((item, index) => ({
                    ...state.datasets[index],
                    data: state.datasets[index].data
                        .slice(1)
                        .concat(typeof item === 'number' ? Number(item.toFixed(2)) : item),
                })),
            })
        );

    const clear = () =>
        setData((state) =>
            merge(state, {
                datasets: state.datasets.map((value) => ({
                    ...value,
                    data: Array(20).fill(-5),
                })),
            })
        );

    return { props: { data, options }, push, clear };
}

/**
 * A single-series metric chart.
 *
 * `dataset` carries the metric's own instrument colour. Without it the series
 * inherits the grey "no data" trace, which is how CPU and Memory ended up looking
 * identical.
 */
function useChartTickLabel(
    label: string,
    max: number,
    tickLabel: string,
    roundTo?: number,
    dataset?: Partial<ChartDataset<'line'>>
) {
    return useChart(label, {
        sets: 1,
        options: {
            scales: {
                y: {
                    suggestedMax: max,
                    ticks: {
                        callback(value) {
                            return `${roundTo ? Number(value).toFixed(roundTo) : value}${tickLabel}`;
                        },
                    },
                },
            },
        },
        callback: (opts) => ({ ...opts, ...(dataset || {}) }),
    });
}

export { useChart, useChartTickLabel, getEmptyData };
