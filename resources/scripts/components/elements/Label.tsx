import styled from 'styled-components/macro';
import tw from 'twin.macro';

const Label = styled.label<{ isLight?: boolean }>`
    ${tw`block uppercase text-neutral-500 mb-1 sm:mb-2`};
    ${(props) => props.isLight && tw`text-neutral-800`};
`;

export default Label;
