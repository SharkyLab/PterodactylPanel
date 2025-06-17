import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
    subtitle?: string;
};

const Container = styled.div`
    ${breakpoint('sm')`
        ${tw`w-full mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`w-full mx-auto`}
    `};

    ${breakpoint('lg')`
        ${tw`w-full mx-auto`}
    `};

    ${breakpoint('xl')`
        ${tw`w-full mx-auto`}
    `};
`;

export default forwardRef<HTMLFormElement, Props>(({ title, subtitle, ...props }, ref) => (
    <>
        <div css={tw`max-w-screen-lg m-auto min-h-screen flex items-center justify-center`}>
            <Container>
                <FlashMessageRender css={tw`mb-2 px-1`} />
                <Form {...props} ref={ref}>
                    <div css={tw`w-full grid lg:grid-cols-2 grid-cols-1 bg-white shadow-lg rounded-xl p-10 mx-1 max-w-none`}>
                        <div>
                            <h1 css={tw`text-5xl font-bold text-gray-800`}>{title}</h1>
                            <p css={tw`text-gray-800 mt-5 text-lg`}>
                                {subtitle}
                            </p>
                        </div>
                        <div>{props.children}</div>
                    </div>
                </Form>
                <p css={tw`text-center text-white text-xs mt-4`}>
                    &copy; 2025 - {new Date().getFullYear()}&nbsp;
                    <a
                        rel={'noopener nofollow noreferrer'}
                        href={'https://sharkylab.com'}
                        target={'_blank'}
                        css={tw`no-underline text-white hover:text-gray-200`}
                    >
                        SharkyLab
                    </a>
                </p>
            </Container>
        </div>
    </>
));