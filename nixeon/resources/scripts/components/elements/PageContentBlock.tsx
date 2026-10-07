import React, { useEffect } from 'react';
import ContentContainer from '@/components/elements/ContentContainer';
import { CSSTransition } from 'react-transition-group';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';

export interface PageContentBlockProps {
    title?: string;
    className?: string;
    showFlashKey?: string;
}

const PageContentBlock: React.FC<PageContentBlockProps> = ({ title, showFlashKey, className, children }) => {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);

    return (
        // The timeout must be at least the CSS transition duration, or React strips
        // the `-active` class mid-transition and the page snaps to its end state.
        // Keep it in step with `--nx-t-slow` (320ms) in components.css.
        <CSSTransition timeout={{ appear: 320, enter: 320, exit: 110 }} classNames={'nx-page'} appear in>
            <>
                <ContentContainer css={tw`my-4 sm:my-10`} className={className}>
                    {showFlashKey && <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />}
                    {children}
                </ContentContainer>
                <ContentContainer css={tw`mb-4`}>
                    <p className={'text-center text-xs'} style={{ color: 'var(--nx-ink-3)' }}>
                        &copy; 2015 &ndash; {new Date().getFullYear()} Nixeon 408 &middot; powered by{' '}
                        <a
                            rel={'noopener nofollow noreferrer'}
                            href={'https://pterodactyl.io'}
                            target={'_blank'}
                            css={tw`no-underline`}
                            style={{ color: 'var(--nx-ink-2)' }}
                        >
                            Pterodactyl
                        </a>
                    </p>
                </ContentContainer>
            </>
        </CSSTransition>
    );
};

export default PageContentBlock;
