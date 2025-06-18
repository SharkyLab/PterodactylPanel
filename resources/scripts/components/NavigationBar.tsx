import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw, { theme } from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center h-full no-underline text-white px-6 cursor-pointer transition-all duration-150`};

        &:active,
        &:hover {
            ${tw`text-neutral-100 bg-[#0048b4]`};
        }

        &:active,
        &:hover,
        &.active {
            box-shadow: inset 0 -2px #1aa1f3;
        }
    }
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <>
            <div className={'sticky top-0 z-10 w-full shadow-md overflow-hidden bg-[#0056d6] text-white'}>
                <div className="mx-auto w-full max-w-[1200px]">
                    <SpinnerOverlay visible={isLoggingOut} />
                    <div className="flex h-10 items-center justify-between pb-1">
                        <div className="flex items-center justify-center sm:items-stretch sm:justify-start w-full">
                            <Link to={`/`} className="flex shrink-0 items-center">
                                <img src={'/favicons/favicon-96x96.png'} className={'w-8 h-8 hidden sm:block'} />
                                <span className='text-2xl font-header pl-1 no-underline hover:text-neutral-100 transition-colors duration-150 font-skl' translate="no">
                                    {name}
                                </span>
                            </Link>
                        </div>
                        <div className="h-full">
                            <RightNavigation className={'flex h-full items-center justify-center'}>
                                <SearchContainer />
                                <Tooltip placement={'bottom'} content={'伺服器列表'}>
                                    <NavLink to={'/'} exact>
                                        <FontAwesomeIcon icon={faLayerGroup} />
                                    </NavLink>
                                </Tooltip>
                                {rootAdmin && (
                                    <Tooltip placement={'bottom'} content={'管理員'}>
                                        <a href={'/admin'} rel={'noreferrer'}>
                                            <FontAwesomeIcon icon={faCogs} />
                                        </a>
                                    </Tooltip>
                                )}
                                <Tooltip placement={'bottom'} content={'帳號設定賬號'}>
                                    <NavLink to={'/account'}>
                                        <span className={'flex items-center w-5 h-5'}>
                                            <Avatar.User />
                                        </span>
                                    </NavLink>
                                </Tooltip>
                                <Tooltip placement={'bottom'} content={'登出賬號'}>
                                    <button onClick={onTriggerLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} />
                                    </button>
                                </Tooltip>
                            </RightNavigation>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
