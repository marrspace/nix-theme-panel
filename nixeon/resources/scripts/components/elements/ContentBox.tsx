import React from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import tw from 'twin.macro';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;

/**
 * Standard page section.
 *
 * The title is set in the display face (Fraunces) rather than the body face: it is
 * the one place on a server page where a heading is genuinely a heading, so it gets
 * the character. The body is a raised plate, matching every other card in the panel.
 */
const ContentBox = ({ title, borderColor, showFlashes, showLoadingOverlay, children, ...props }: Props) => (
    <div {...props}>
        {title && (
            <h2
                className={'nx-engraved'}
                css={tw`mb-4 px-4 text-2xl`}
                style={{ color: 'var(--nx-ink)', fontVariationSettings: "'SOFT' 22, 'WONK' 1" }}
            >
                {title}
            </h2>
        )}
        {showFlashes && (
            <FlashMessageRender byKey={typeof showFlashes === 'string' ? showFlashes : undefined} css={tw`mb-4`} />
        )}
        <div
            className={'nx-card'}
            css={[tw`p-4 relative`, !!borderColor && tw`border-t-4`]}
            style={borderColor ? { borderTopColor: borderColor } : undefined}
        >
            <SpinnerOverlay visible={showLoadingOverlay || false} />
            {children}
        </div>
    </div>
);

export default ContentBox;
