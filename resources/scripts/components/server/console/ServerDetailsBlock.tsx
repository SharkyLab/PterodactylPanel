import React, { useEffect, useMemo, useState } from 'react';
import {
    faClock,
    faGlobe,
    faHdd,
    faMemory,
    faMicrochip,
    faNetworkWired,
    faWifi,
    faCalendarDay,
} from '@fortawesome/free-solid-svg-icons';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import UptimeDuration from '@/components/server/UptimeDuration';
import StatBlock from '@/components/server/console/StatBlock';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import classNames from 'classnames';
import useSWR from 'swr';
import getServerSubdomains from '@/api/server/subdomain/getServerSubdomains';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime' | 'rx' | 'tx', number>;

export interface SubdomainResponse {
    subdomains: any[],
    domains: any[],
    ipAlias: string,
}

const getBackgroundColor = (value: number, max: number | null): string | undefined => {
    const delta = !max ? 0 : value / max;

    if (delta > 0.8) {
        if (delta > 0.9) {
            return 'bg-red-500';
        }
        return 'bg-yellow-500';
    }

    return undefined;
};

const Limit = ({ limit, children }: { limit: string | null; children: React.ReactNode }) => (
    <>
        {children}
        <span className={'ml-1 text-gray-300 text-[70%] select-none'}>/ {limit || <>&infin;</>}</span>
    </>
);

const ServerDetailsBlock = ({ className }: { className?: string }) => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, tx: 0, rx: 0 });

    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const expDate = ServerContext.useStoreState((state) => state.server.data!.expDate);

    const { data, error, mutate } = useSWR<SubdomainResponse>([ uuid, '/subdomain' ], key => getServerSubdomains(key), {
        revalidateOnFocus: false,
    });

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `${limits.cpu / 100} vCores` : null,
            memory: limits?.memory ? bytesToString(mbToBytes(limits.memory)) : null,
            disk: limits?.disk ? bytesToString(mbToBytes(limits.disk)) : null,
        }),
        [limits]
    );

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);

        return !match ? 'n/a' : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }

        instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: stats.memory_bytes,
            cpu: stats.cpu_absolute,
            disk: stats.disk_bytes,
            tx: stats.network.tx_bytes,
            rx: stats.network.rx_bytes,
            uptime: stats.uptime || 0,
        });
    });

    return (
        <div className={classNames('grid grid-cols-6 gap-2 md:gap-4', className)}>
            <StatBlock icon={faWifi} title={'IP地址'} copyOnClick={allocation}>
                {allocation}
            </StatBlock>
            <StatBlock icon={faGlobe} title={'子域名'} copyOnClick={!data ? allocation : `${data?.subdomains[0]?.subdomain}.${data?.subdomains[0]?.domain}${data?.subdomains[0]?.record_type === 'CNAME' ? `:${data?.subdomains[0]?.port}` : ''}`}>
                {!data || data.subdomains.length < 1 ? "未設定" : `${data?.subdomains[0]?.subdomain}.${data?.subdomains[0]?.domain}${data?.subdomains[0]?.record_type === 'CNAME' ? `:${data?.subdomains[0]?.port}` : ''}`}
            </StatBlock>
            <StatBlock
                icon={faClock}
                title={'在線時間'}
                color={getBackgroundColor(status === 'running' ? 0 : status !== 'offline' ? 9 : 10, 10)}
            >
                {status === null || status === 'offline' ? (
                    '離線'
                ) : stats.uptime > 0 ? (
                    <UptimeDuration uptime={stats.uptime / 1000} />
                ) : (
                    <>
                        啟動中
                    </>
                )}
            </StatBlock>
            <StatBlock icon={faCalendarDay} title={'到期日'}>
                {expDate !== '0000-00-00' ? expDate : '∞'}
            </StatBlock>
            <StatBlock icon={faMicrochip} title={'CPU 用量'} color={getBackgroundColor(stats.cpu, limits.cpu)}>
                {status === 'offline' ? (
                    <span className={'text-gray-400'}>離線</span>
                ) : (
                    <Limit limit={textLimits.cpu}>{(stats.cpu > limits.cpu ? 100 : stats.cpu / limits.cpu * 100).toFixed(1)}%</Limit>
                )}
            </StatBlock>
            <StatBlock
                icon={faMemory}
                title={'記憶體'}
                color={getBackgroundColor(stats.memory / 1024, limits.memory * 1024)}
            >
                {status === 'offline' ? (
                    <span className={'text-gray-400'}>離線</span>
                ) : (
                    <Limit limit={textLimits.memory}>{bytesToString(stats.memory)}</Limit>
                )}
            </StatBlock>
            <StatBlock icon={faHdd} title={'儲存空間'} color={getBackgroundColor(stats.disk / 1024, limits.disk * 1024)}>
                <Limit limit={textLimits.disk}>{bytesToString(stats.disk)}</Limit>
            </StatBlock>
            <StatBlock icon={faNetworkWired} title={'網絡'}>
                {status === 'offline' ? <span className={'text-gray-400'}>離線 </span> : "↓" + bytesToString(stats.rx) + " ↑" + bytesToString(stats.tx)}
            </StatBlock>
        </div>
    );
};

export default ServerDetailsBlock;
