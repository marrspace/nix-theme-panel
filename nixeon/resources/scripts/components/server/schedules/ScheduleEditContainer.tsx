import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import getServerSchedule from '@/api/server/schedules/getServerSchedule';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import EditScheduleModal from '@/components/server/schedules/EditScheduleModal';
import NewTaskButton from '@/components/server/schedules/NewTaskButton';
import DeleteScheduleButton from '@/components/server/schedules/DeleteScheduleButton';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import ScheduleTaskRow from '@/components/server/schedules/ScheduleTaskRow';
import isEqual from 'react-fast-compare';
import { format } from 'date-fns';
import ScheduleCronRow from '@/components/server/schedules/ScheduleCronRow';
import RunScheduleButton from '@/components/server/schedules/RunScheduleButton';

interface Params {
    id: string;
}

/**
 * A single cron field (minute / hour / day ...).
 *
 * Read as a milled well rather than a grey tile: the value is the thing you look
 * at, so it sits *inside* the surface on the raised plate of the header. The
 * label is a caption, the value is a tabular readout so the five boxes align.
 */
const CronBox = ({ title, value }: { title: string; value: string }) => (
    <div
        css={tw`rounded p-3`}
        style={{
            background: 'var(--nx-sunken)',
            boxShadow: 'var(--nx-sink-sm), inset 0 -1px 0 var(--nx-light)',
        }}
    >
        <p className={'nx-caption'}>{title}</p>
        {/* An asterisk is drawn high in the em box, so in a row of cron values it
            reads as debris floating above the baseline while the digits sit low.
            A bare `*` is optically re-centred onto the digits' optical line. */}
        <p className={'nx-readout text-xl'}>
            {value === '*' ? (
                <span style={{ display: 'inline-block', transform: 'translateY(0.19em)' }}>&#42;</span>
            ) : (
                value
            )}
        </p>
    </div>
);

/**
 * Active / Inactive state lamp.
 *
 * The lamp is a LENS SET INTO the card, not a badge stuck onto it. The card's own
 * grammar is: raised = lit top lip + dark underside; recessed = dark top inner
 * shadow + lit bottom inner edge. A badge that uses the raised signature on a
 * raised card reads as a floating decal, so the lamp deliberately uses the
 * RECESSED signature — it is a tell-tale pressed into the surface, which is also
 * what a real indicator light in a machined panel looks like.
 */
const ActivePill = ({ active }: { active: boolean }) => (
    <span
        css={tw`rounded-full px-2 py-px text-xs ml-4 uppercase font-bold`}
        style={{
            background: active
                ? 'linear-gradient(180deg, var(--nx-lamp-success), color-mix(in srgb, var(--nx-lamp-success) 78%, #000))'
                : 'linear-gradient(180deg, var(--nx-lamp-danger), color-mix(in srgb, var(--nx-lamp-danger) 78%, #000))',
            color: '#fff',
            /* recessed signature: dark shadow under the top lip, a hard lit line
               along the bottom inner edge, and a dark socket ring around it. */
            boxShadow:
                'inset 0 2px 3px rgba(0, 0, 0, 0.38), inset 0 -1px 0 rgba(255, 255, 255, 0.4), 0 0 0 1px var(--nx-sunken-2)',
        }}
    >
        {active ? 'Active' : 'Inactive'}
    </span>
);

export default () => {
    const history = useHistory();
    const { id: scheduleId } = useParams<Params>();

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    const schedule = ServerContext.useStoreState(
        (st) => st.schedules.data.find((s) => s.id === Number(scheduleId)),
        isEqual
    );
    const appendSchedule = ServerContext.useStoreActions((actions) => actions.schedules.appendSchedule);

    useEffect(() => {
        if (schedule?.id === Number(scheduleId)) {
            setIsLoading(false);
            return;
        }

        clearFlashes('schedules');
        getServerSchedule(uuid, Number(scheduleId))
            .then((schedule) => appendSchedule(schedule))
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ error, key: 'schedules' });
            })
            .then(() => setIsLoading(false));
    }, [scheduleId]);

    const toggleEditModal = useCallback(() => {
        setShowEditModal((s) => !s);
    }, []);

    return (
        <PageContentBlock title={'Schedules'}>
            <FlashMessageRender byKey={'schedules'} css={tw`mb-4`} />
            {!schedule || isLoading ? (
                <Spinner size={'large'} centered />
            ) : (
                <>
                    <div
                        className={'sm:hidden mb-4 p-3'}
                        style={{
                            background: 'var(--nx-raised)',
                            borderRadius: 'var(--nx-radius)',
                            boxShadow: 'var(--nx-raise-sm), var(--nx-bevel-top), 0 0 0 1px var(--nx-edge)',
                        }}
                    >
                        <ScheduleCronRow cron={schedule.cron} />
                    </div>
                    <div className={'nx-card'} css={tw`p-0 overflow-hidden`}>
                        <div
                            className={'flex flex-wrap items-center p-3 sm:p-6'}
                            style={{
                                background: 'linear-gradient(180deg, var(--nx-raised), var(--nx-raised-2))',
                                boxShadow: 'inset 0 -1px 0 var(--nx-edge), inset 0 -2px 0 var(--nx-light)',
                            }}
                        >
                            <div css={tw`flex-1`}>
                                <h3 css={tw`flex items-center text-2xl`} style={{ color: 'var(--nx-ink)' }}>
                                    {schedule.name}
                                    {schedule.isProcessing ? (
                                        <span
                                            css={tw`flex items-center rounded-full px-2 py-px text-xs ml-4 uppercase font-bold`}
                                            style={{
                                                background: 'var(--nx-sunken)',
                                                color: 'var(--nx-ink-2)',
                                                boxShadow: 'var(--nx-sink-sm)',
                                            }}
                                        >
                                            <Spinner css={tw`w-3! h-3! mr-2`} />
                                            Processing
                                        </span>
                                    ) : (
                                        <ActivePill active={schedule.isActive} />
                                    )}
                                </h3>
                                <p css={tw`mt-1 text-sm`} style={{ color: 'var(--nx-ink-2)' }}>
                                    Last run at:&nbsp;
                                    {schedule.lastRunAt ? (
                                        format(schedule.lastRunAt, "MMM do 'at' h:mma")
                                    ) : (
                                        <span style={{ color: 'var(--nx-ink-3)' }}>n/a</span>
                                    )}
                                    <span
                                        css={tw`ml-4 pl-4 py-px`}
                                        style={{ borderLeft: '4px solid var(--nx-edge)' }}
                                    >
                                        Next run at:&nbsp;
                                        {schedule.nextRunAt ? (
                                            format(schedule.nextRunAt, "MMM do 'at' h:mma")
                                        ) : (
                                            <span style={{ color: 'var(--nx-ink-3)' }}>n/a</span>
                                        )}
                                    </span>
                                </p>
                            </div>
                            <div css={tw`flex sm:block mt-3 sm:mt-0`}>
                                <Can action={'schedule.update'}>
                                    <Button.Text className={'flex-1 mr-4'} onClick={toggleEditModal}>
                                        Edit
                                    </Button.Text>
                                    <NewTaskButton schedule={schedule} />
                                </Can>
                            </div>
                        </div>
                        <div css={tw`hidden sm:grid grid-cols-5 md:grid-cols-5 gap-4 m-4`}>
                            <CronBox title={'Minute'} value={schedule.cron.minute} />
                            <CronBox title={'Hour'} value={schedule.cron.hour} />
                            <CronBox title={'Day (Month)'} value={schedule.cron.dayOfMonth} />
                            <CronBox title={'Month'} value={schedule.cron.month} />
                            <CronBox title={'Day (Week)'} value={schedule.cron.dayOfWeek} />
                        </div>
                        <div
                            style={{
                                background: 'var(--nx-sunken)',
                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.18), inset 0 -1px 0 var(--nx-light)',
                            }}
                        >
                            {schedule.tasks.length > 0
                                ? schedule.tasks
                                      .sort((a, b) =>
                                          a.sequenceId === b.sequenceId ? 0 : a.sequenceId > b.sequenceId ? 1 : -1
                                      )
                                      .map((task) => (
                                          <ScheduleTaskRow
                                              key={`${schedule.id}_${task.id}`}
                                              task={task}
                                              schedule={schedule}
                                          />
                                      ))
                                : null}
                        </div>
                        {/* Actions on the object live ON the object. These used to
                            float on the bare page below the card, which read as
                            orphaned controls belonging to nothing. The footer rail
                            reuses the header's seam so the card reads as one milled
                            body with a top and bottom lip. */}
                        <div
                            className={'flex flex-wrap items-center justify-end gap-3 px-4 py-3 sm:px-6'}
                            style={{
                                background: 'linear-gradient(180deg, var(--nx-raised-2), var(--nx-sunken))',
                                boxShadow: 'inset 0 1px 0 var(--nx-edge), inset 0 2px 0 var(--nx-light)',
                            }}
                        >
                            {schedule.tasks.length > 0 && (
                                <Can action={'schedule.update'}>
                                    <RunScheduleButton schedule={schedule} />
                                </Can>
                            )}
                            <Can action={'schedule.delete'}>
                                <DeleteScheduleButton
                                    scheduleId={schedule.id}
                                    onDeleted={() => history.push(`/server/${id}/schedules`)}
                                />
                            </Can>
                        </div>
                    </div>
                    <EditScheduleModal visible={showEditModal} schedule={schedule} onModalDismissed={toggleEditModal} />
                </>
            )}
        </PageContentBlock>
    );
};
