import styled from 'styled-components/macro';
import tw from 'twin.macro';

const Label = styled.label<{ isLight?: boolean }>`
    ${tw`block uppercase text-white mb-1 sm:mb-2 font-light`};
    ${(props) => props.isLight && tw`text-white`};
`;

export default Label;
