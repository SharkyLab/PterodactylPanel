import React from 'react';
import { ServerContext } from '@/state/server';
import useSWR from 'swr';
import getServerSubdomains from '@/api/server/subdomain/getServerSubdomains';
import { ip } from '@/lib/formatters';
import CopyOnClick from '@/components/elements/CopyOnClick';

export interface SubdomainResponse {
    subdomains: any[],
    domains: any[],
    ipAlias: string,
}

export default () => {

    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const { data, error, mutate } = useSWR<SubdomainResponse>([uuid, '/subdomain'], key => getServerSubdomains(key), {
        revalidateOnFocus: false,
    });

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);
        return !match ? 'n/a' : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    const subdomain = !data || data.subdomains.length < 1 ? null : `${data?.subdomains[0]?.subdomain}.${data?.subdomains[0]?.domain}${data?.subdomains[0]?.record_type === 'CNAME' ? `:${data?.subdomains[0]?.port}` : ''}`

    return (
        <>
            <h2 className="text-lg font-semibold mb-3">連線位址</h2>
            <div className="mb-1">
                <span className="font-bold">IP地址:&nbsp;</span>
                <CopyOnClick text={allocation}>
                    <span className="bg-gray-600 hover:bg-gray-500 rounded inline-flex items-center">
                        <span className="p-1 text-sm">{allocation}</span>
                        <svg className="pr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width={18}
                            height={18}
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
                            <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
                        </svg>
                    </span>
                </CopyOnClick>
            </div>
            <div>
                <span className="font-bold">自定域名:&nbsp;</span>
                <CopyOnClick text={subdomain ? subdomain : allocation}>
                    <span className="bg-gray-600 hover:bg-gray-500 rounded inline-flex items-center">
                        <span className="p-1 text-sm">{subdomain ? subdomain : "未設定"}</span>
                        <svg className="pr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width={18}
                            height={18}
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
                            <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
                        </svg>
                    </span>
                </CopyOnClick>
            </div>
        </>
    )

};