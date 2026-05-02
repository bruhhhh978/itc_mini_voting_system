import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientContext,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import type { SuiObjectResponse } from '@mysten/sui/client';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { reputationBadge } from '../poc/badge';
import { getPocPackageId, getPocRegistryId, pocStructType } from '../poc/config';
import { getMoveObjectFields, parseU64 } from '../poc/parsing';
import { queryObjectsByStructType } from '../poc/rpc';

function objectIdFromResponse(r: SuiObjectResponse): string | null {
  const anyResp = r as unknown as { objectId?: string; data?: { objectId?: string } };
  return anyResp.objectId ?? anyResp.data?.objectId ?? null;
}

export default function PocProfilePage() {
  const client = useSuiClient();
  const { network } = useSuiClientContext();
  const account = useCurrentAccount();
  const qc = useQueryClient();
  const packageId = getPocPackageId();
  const registryId = getPocRegistryId();
  const profileType = pocStructType('Profile');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['poc-profiles', network, profileType],
    queryFn: async () => {
      if (!profileType) return [];
      return queryObjectsByStructType(client, profileType, 50);
    },
    enabled: !!profileType,
  });

  const myProfile = useMemo(() => {
    if (!account?.address) return null;
    for (const r of profiles) {
      const fields = getMoveObjectFields(r);
      if (!fields) continue;
      if (fields.owner === account.address) return { resp: r, fields };
    }
    return null;
  }, [account?.address, profiles]);

  const rep = myProfile ? parseU64(myProfile.fields.reputation) : 0n;
  const badge = reputationBadge(rep);

  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction({
    onSuccess: async () => {
      await qc.invalidateQueries();
    },
  });

  const onCreateProfile = async () => {
    if (!packageId || !registryId) return;
    const tx = new Transaction();
    tx.setGasBudget(10_000_000n);
    tx.moveCall({
      target: `${packageId}::poc::create_profile`,
      arguments: [tx.object(registryId)],
    });
    await signAndExecute({ transaction: tx });
  };

  if (!packageId || !registryId) {
    return (
      <Card title="POC — Profile">
        <div className="space-y-2 text-sm text-slate-300">
          <p>
            Thiếu cấu hình on-chain. Thêm vào <code className="text-slate-200">frontend/.env</code>:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-xs text-slate-400">
            <li>
              <code>VITE_POC_PACKAGE_ID</code> — package id sau khi publish Move
            </li>
            <li>
              <code>VITE_POC_REGISTRY_ID</code> — object <code>POCRegistry</code> (tạo bởi <code>poc::init</code>)
            </li>
          </ul>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card title="On-chain profile (SBT-style)">
          {!account ? (
            <div className="text-sm text-slate-400">Kết nối ví để xem / tạo profile.</div>
          ) : isLoading ? (
            <div className="text-sm text-slate-400">Đang tải…</div>
          ) : myProfile ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Object ID</div>
                <div className="mt-1 break-all font-mono text-xs text-slate-200">
                  {objectIdFromResponse(myProfile.resp) ?? '—'}
                </div>
                <div className="mt-3 text-xs text-slate-400">Owner</div>
                <div className="mt-1 break-all font-mono text-xs text-slate-300">{account.address}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-indigo-400/30 bg-indigo-400/10 px-4 py-3">
                  <div className="text-xs text-slate-400">Reputation</div>
                  <div className="text-2xl font-semibold text-white">{rep.toString()}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-xs text-slate-400">Badge</div>
                  <div className="text-lg text-white">
                    {badge.emoji} {badge.label}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Contribution object IDs</div>
                <ul className="mt-2 max-h-48 space-y-1 overflow-auto font-mono text-xs text-slate-300">
                  {Array.isArray(myProfile.fields.contributions) &&
                  (myProfile.fields.contributions as unknown[]).length > 0 ? (
                    (myProfile.fields.contributions as unknown[]).map((id, i) => (
                      <li key={i} className="break-all">
                        {normalizeId(id)}
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">Chưa có contribution được approve.</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Địa chỉ này chưa có <span className="font-semibold text-white">Profile</span> on-chain. Tạo một lần để
                nhận reputation khi task được approve.
              </p>
              <Button onClick={onCreateProfile} disabled={isPending}>
                {isPending ? 'Đang gửi…' : 'Tạo profile on-chain'}
              </Button>
            </div>
          )}
        </Card>
      </div>
      <div>
        <Card title="Gợi ý flow">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
            <li>Tạo profile (trang này).</li>
            <li>Vào POC Tasks — nhận task, submit proof.</li>
            <li>Creator approve — reputation + lịch sử contribution cập nhật on-chain.</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}

function normalizeId(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && 'id' in v && typeof (v as { id: unknown }).id === 'string') {
    return (v as { id: string }).id;
  }
  return String(v);
}
