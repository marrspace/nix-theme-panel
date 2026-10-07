import React, { useContext } from 'react';
import { DialogContext } from './';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';

export default ({ children }: { children: React.ReactNode }) => {
    const { setFooter } = useContext(DialogContext);

    useDeepCompareEffect(() => {
        setFooter(
            <div
                className={'px-6 py-3 flex items-center justify-end space-x-3 rounded-b'}
                style={{
                    /* the footer is a sunken rail so it reads as the base of the dialog */
                    background: 'var(--nx-sunken)',
                    boxShadow: 'inset 0 1px 0 var(--nx-edge)',
                }}
            >
                {children}
            </div>
        );
    }, [children]);

    return null;
};
