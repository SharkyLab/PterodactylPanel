import React from 'react';
import { ServerContext } from '@/state/server';
import UptimeDuration from '@/components/server/UptimeDuration';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime' | 'rx' | 'tx', number>;

export default ({ stats }: { stats: Stats }) => {

    const status = ServerContext.useStoreState((state) => state.status.value);

    const inConflictState = ServerContext.useStoreState((state) => state.server.inConflictState);
    const statusConf = ServerContext.useStoreState((state) => state.server.data?.status || null);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data?.isTransferring || false);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data?.isNodeUnderMaintenance || false);

    return (
        <>
            <h2 className="text-lg font-semibold mb-3">伺服器狀態</h2>
            {
                !inConflictState ? (
                    status === null || status === 'offline' ? (
                        <StatsDot status="已關機" className="bg-blue-400" />
                    ) : stats?.uptime > 0 ? (
                        <>
                            <div className="flex align-middle mb-1">
                                <StatsDot status="運行中" className="bg-green-500" />
                            </div>
                            <div>伺服器已運行 <UptimeDuration uptime={stats.uptime / 1000} /></div>
                        </>
                    ) : (
                        <StatsDot status="啟動中" className="bg-yellow-400" />
                    )
                ) : (
                    statusConf === 'installing' || statusConf === 'install_failed' || statusConf === 'reinstall_failed' ? (
                        <StatsDot status="安裝中" className="bg-yellow-500" />
                    ) : statusConf === 'suspended' ? (
                        <StatsDot status="已到期" className="bg-red-500" />
                    ) : isNodeUnderMaintenance ? (
                        <StatsDot status="主機維護中" className="bg-yellow-400" />
                    ) : isTransferring ? (
                        <StatsDot status="伺服器遷移中" className="bg-yellow-400" />
                    ) : (
                        <StatsDot status="正在從備份中恢復" className="bg-yellow-400" />
                    )
                )
            }
        </>
    )

};

export const StatsDot = ({
    status,
    className,
}: {
    status: string,
    className?: string,
}) => {
    return (
        <div className="flex item-center">
            <span className={`h-3 w-3 rounded-full mr-2 mt-1 animate-pulse ${className}`}></span>
            <p className="text-white font-bold align-middle">{status}</p>
        </div>
    )
};
