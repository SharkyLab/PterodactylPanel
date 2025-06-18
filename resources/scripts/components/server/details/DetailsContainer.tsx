import React, { useEffect, useMemo, useState } from 'react';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import PowerButtons from './PowerButtons';
import ServerStatus from './ServerStatus';
import useSWR from 'swr';
import getServerSubdomains from '@/api/server/subdomain/getServerSubdomains';
import { SubdomainResponse } from '../subdomain/SubdomainContainer';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { SocketEvent, SocketRequest } from '../events';
import ServerAddress from './ServerAddress';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime' | 'rx' | 'tx', number>;

export default () => {

    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);

    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, tx: 0, rx: 0 });

    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const expDate = ServerContext.useStoreState((state) => state.server.data!.expDate);

    const { data, error, mutate } = useSWR<SubdomainResponse>([uuid, '/subdomain'], key => getServerSubdomains(key), {
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
        <ServerContentBlock title="伺服器主頁">
            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-4 sm:col-span-2 lg:col-span-3">
                    <h1 className="font-header text-2xl text-gray-50 leading-relaxed line-clamp-2">{name}</h1>
                    <p className="text-sm line-clamp-2">{description}</p>
                </div>
                <div className="col-span-4 sm:col-span-2 lg:col-span-1 self-end">
                    <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                        <PowerButtons className="flex sm:justify-end space-x-2" />
                    </Can>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="bg-[#1f2937] rounded-xl p-3 shadow-lg border-l-4 border-[#3b82f6] hover:shadow-[#3b82f6]/10 transition">
                    <ServerStatus stats={stats} />
                </div>
                <div className="bg-[#1f2937] rounded-xl p-3 shadow-lg border-l-4 border-[#3b82f6] hover:shadow-[#3b82f6]/10 transition">
                    <ServerAddress />
                </div>
            </div>
        </ServerContentBlock>
    );
};
