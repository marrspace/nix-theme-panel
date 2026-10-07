import React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Translate from '@/components/elements/Translate';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ActivityLog } from '@definitions/user';
import ActivityLogMetaButton from '@/components/elements/activity/ActivityLogMetaButton';
import { FolderOpenIcon, TerminalIcon } from '@heroicons/react/solid';
import style from './style.module.css';
import Avatar from '@/components/Avatar';
import useLocationHash from '@/plugins/useLocationHash';
import { getObjectKeys, isObject } from '@/lib/objects';

interface Props {
    activity: ActivityLog;
    children?: React.ReactNode;
}

function wrapProperties(value: unknown): any {
    if (value === null || typeof value === 'string' || typeof value === 'number') {
        return `<strong>${String(value)}</strong>`;
    }

    if (isObject(value)) {
        return getObjectKeys(value).reduce((obj, key) => {
            if (key === 'count' || (typeof key === 'string' && key.endsWith('_count'))) {
                return { ...obj, [key]: value[key] };
            }
            return { ...obj, [key]: wrapProperties(value[key]) };
        }, {} as Record<string, unknown>);
    }

    if (Array.isArray(value)) {
        return value.map(wrapProperties);
    }

    return value;
}

/**
 * One ledger entry.
 *
 * The actor is pinned to the spine as a disc, the event identifier is set in the
 * mono face (it is a machine name, not prose), and the IP + relative time are
 * stamped small beneath. The old version used `border-gray-800` between rows,
 * which resolves to a near-white value in the light theme — the separators were
 * effectively invisible and the log read as one undifferentiated block.
 */
export default ({ activity, children }: Props) => {
    const { pathTo } = useLocationHash();
    const actor = activity.relationships.actor;
    const properties = wrapProperties(activity.properties);

    return (
        <div className={style.entry}>
            <div className={style.node}>
                <span className={style.avatar}>
                    <Avatar name={actor?.uuid || 'system'} />
                </span>
            </div>
            <div className={style.body}>
                <div className={style.headline}>
                    <Tooltip placement={'top'} content={actor?.email || 'System User'}>
                        <span className={style.actor}>{actor?.username || 'System'}</span>
                    </Tooltip>
                    <span className={style.sep}>&mdash;</span>
                    <Link to={`#${pathTo({ event: activity.event })}`} className={style.event}>
                        {activity.event}
                    </Link>
                    <span className={style.icons}>
                        {activity.isApi && (
                            <Tooltip placement={'top'} content={'Using API Key'}>
                                <TerminalIcon />
                            </Tooltip>
                        )}
                        {activity.event.startsWith('server:sftp.') && (
                            <Tooltip placement={'top'} content={'Using SFTP'}>
                                <FolderOpenIcon />
                            </Tooltip>
                        )}
                        {children}
                    </span>
                </div>
                <p className={style.description}>
                    <Translate ns={'activity'} values={properties} i18nKey={activity.event.replace(':', '.')} />
                </p>
                <div className={style.meta}>
                    {activity.ip && (
                        <>
                            <span>{activity.ip}</span>
                            <span className={style.dot} />
                        </>
                    )}
                    <Tooltip placement={'right'} content={format(activity.timestamp, 'MMM do, yyyy H:mm:ss')}>
                        <span className={style.time}>
                            {formatDistanceToNowStrict(activity.timestamp, { addSuffix: true })}
                        </span>
                    </Tooltip>
                </div>
            </div>
            {activity.hasAdditionalMetadata && <ActivityLogMetaButton meta={activity.properties} />}
        </div>
    );
};
