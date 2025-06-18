import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`sticky top-10 z-10 w-full bg-[#f1f5f9] shadow overflow-x-auto`};

    & > div {
        ${tw`flex items-center text-sm mx-auto px-2`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`inline-block py-3 px-4 text-black font-medium no-underline whitespace-nowrap transition-all duration-150`};

            &:not(:first-of-type) {
                ${tw`ml-2`};
            }

            &:hover {
                ${tw`text-[#0056d6]`};
            }

            &:active,
            &.active {
                ${tw`text-[#0056d6]`};
                box-shadow: inset 0 -2px #1aa1f3;
            }
        }
    }
`;

export default SubNavigation;
