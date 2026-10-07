import React, { useEffect, useRef } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { Line } from 'react-chartjs-2';
import { useChart, useChartTickLabel } from '@/components/server/console/chart';
import { bytesToString } from '@/lib/formatters';
import { themeColor } from '@/lib/theme-colors';
import ChartBlock from '@/components/server/console/ChartBlock';
import styles from '@/components/server/console/style.module.css';

export default () => {
    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const previous = useRef<Record<'tx' | 'rx', number>>({ tx: -1, rx: -1 });

    /*
     * Each metric gets its own instrument colour.
     *
     * These are read from fixed `--nx-chart-*` tokens, NOT from the page theme:
     * the graphs are drawn on the dark console face in BOTH themes, so a themed
     * colour is wrong here. The dark-theme `yellow-400` resolves to `116 97 60`,
     * a muddy brown that disappears on a near-black face.
     *
     * CPU and Memory previously passed NO colour at all, so both fell back to the
     * grey "no data" trace and the two graphs were indistinguishable.
     */
    const cpu = useChartTickLabel('CPU', limits.cpu, '%', 2, {
        borderColor: themeColor('chart-cpu'),
        backgroundColor: themeColor('chart-cpu', 0.16),
    });
    const memory = useChartTickLabel('Memory', limits.memory, 'MiB', undefined, {
        borderColor: themeColor('chart-memory'),
        backgroundColor: themeColor('chart-memory', 0.16),
    });
    const network = useChart('Network', {
        sets: 2,
        options: {
            scales: {
                y: {
                    ticks: {
                        callback(value) {
                            return bytesToString(typeof value === 'string' ? parseInt(value, 10) : value);
                        },
                    },
                },
            },
        },
        /*
         * Datasets are pushed in [tx, rx] order (see the STATS handler below), and
         * the legend chips must match: index 0 is OUTBOUND (upload, amber) and
         * index 1 is INBOUND (download, cyan). The old code had these inverted, so
         * the amber line was labelled "In" while carrying transmit bytes.
         *
         * The colours come from the fixed `--nx-chart-*` tokens, not the page
         * theme: these graphs are drawn on the dark console face in both themes.
         */
        callback(opts, index) {
            const outbound = index === 0;
            return {
                ...opts,
                label: outbound ? 'Network Out' : 'Network In',
                borderColor: outbound ? themeColor('chart-out') : themeColor('chart-in'),
                backgroundColor: outbound ? themeColor('chart-out', 0.16) : themeColor('chart-in', 0.16),
                borderWidth: 1.5,
            };
        },
    });

    useEffect(() => {
        if (status === 'offline') {
            cpu.clear();
            memory.clear();
            network.clear();
        }
    }, [status]);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }
        cpu.push(values.cpu_absolute);
        memory.push(Math.floor(values.memory_bytes / 1024 / 1024));
        network.push([
            previous.current.tx < 0 ? 0 : Math.max(0, values.network.tx_bytes - previous.current.tx),
            previous.current.rx < 0 ? 0 : Math.max(0, values.network.rx_bytes - previous.current.rx),
        ]);

        previous.current = { tx: values.network.tx_bytes, rx: values.network.rx_bytes };
    });

    return (
        <>
            <ChartBlock title={'CPU Load'}>
                <Line {...cpu.props} />
            </ChartBlock>
            <ChartBlock title={'Memory'}>
                <Line {...memory.props} />
            </ChartBlock>
            <ChartBlock
                title={'Network'}
                legend={
                    <>
                        <span className={styles.legend_item}>
                            <span className={styles.legend_dot} style={{ ['--dot' as any]: themeColor('chart-out') }} />
                            Out
                        </span>
                        <span className={styles.legend_item}>
                            <span className={styles.legend_dot} style={{ ['--dot' as any]: themeColor('chart-in') }} />
                            In
                        </span>
                    </>
                }
            >
                <Line {...network.props} />
            </ChartBlock>
        </>
    );
};
