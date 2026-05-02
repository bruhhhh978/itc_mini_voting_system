import { useMemo, useState } from 'react';
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
import { getPocPackageId, pocStructType } from '../poc/config';
import {
  getMoveObjectFields,
  normalizeObjectIdField,
  parseOptionAddress,
  parseU64,
  vecU8ToUtf8,
} from '../poc/parsing';
import { queryObjectsByStructType } from '../poc/rpc';

function objectIdFromResponse(r: SuiObjectResponse): string | null {
  const anyResp = r as unknown as { objectId?: string; data?: { objectId?: string } };
  return anyResp.objectId ?? anyResp.data?.objectId ?? null;
}

const TASK_OPEN = 0;
const TASK_IN_PROGRESS = 1;
const TASK_DONE = 2;

function statusLabel(s: number) {
  if (s === TASK_OPEN) return 'Open';
  if (s === TASK_IN_PROGRESS) return 'In progress';
  if (s === TASK_DONE) return 'Done';
  return `Unknown (${s})`;
}

export default function PocTasksPage() {
  const client = useSuiClient();
  const { network } = useSuiClientContext();
  const account = useCurrentAccount();
  const qc = useQueryClient();
  const packageId = getPocPackageId();

  const taskType = pocStructType('Task');
  const contribType = pocStructType('Contribution');
  const profileType = pocStructType('Profile');

  const [newTitle, setNewTitle] = useState('');
  const [newReward, setNewReward] = useState('10');
  const [proofByTask, setProofByTask] = useState<Record<string, string>>({});

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['poc-tasks', network, taskType],
    queryFn: async () => {
      if (!taskType) return [];
      return queryObjectsByStructType(client, taskType, 50);
    },
    enabled: !!taskType,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['poc-profiles', network, profileType],
    queryFn: async () => {
      if (!profileType) return [];
      return queryObjectsByStructType(client, profileType, 50);
    },
    enabled: !!profileType,
  });

  const profileIdByOwner = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of profiles) {
      const oid = objectIdFromResponse(r);
      const fields = getMoveObjectFields(r);
      if (!oid || !fields || typeof fields.owner !== 'string') continue;
      m.set(fields.owner, oid);
    }
    return m;
  }, [profiles]);

  const { data: inbox = [], isLoading: loadingInbox } = useQuery({
    queryKey: ['poc-contribution-inbox', network, account?.address, contribType],
    queryFn: async () => {
      if (!account?.address || !contribType) return [];
      const page = await client.getOwnedObjects({
        owner: account.address,
        filter: { StructType: contribType },
        options: { showContent: true, showType: true },
      });
      return page.data ?? [];
    },
    enabled: !!account?.address && !!contribType,
  });

  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction({
    onSuccess: async () => {
      await qc.invalidateQueries();
    },
  });

  const runTx = async (build: (tx: Transaction) => void) => {
    if (!packageId) return;
    const tx = new Transaction();
    tx.setGasBudget(15_000_000n);
    build(tx);
    await signAndExecute({ transaction: tx });
  };

  const onCreateTask = () => {
    const desc = newTitle.trim();
    if (desc.length < 2) return;
    const reward = BigInt(newReward || '0');
    return runTx((tx) => {
      tx.moveCall({
        target: `${packageId}::poc::create_task`,
        arguments: [tx.pure.vector('u8', [...new TextEncoder().encode(desc)]), tx.pure.u64(reward)],
      });
    }).then(() => {
      setNewTitle('');
      setNewReward('10');
    });
  };

  const onClaim = (taskId: string) =>
    runTx((tx) => {
      tx.moveCall({
        target: `${packageId}::poc::claim_task`,
        arguments: [tx.object(taskId)],
      });
    });

  const onSubmit = (taskId: string) => {
    const proof = (proofByTask[taskId] ?? '').trim();
    if (proof.length < 3) return;
    return runTx((tx) => {
      tx.moveCall({
        target: `${packageId}::poc::submit_contribution`,
        arguments: [tx.object(taskId), tx.pure.vector('u8', [...new TextEncoder().encode(proof)])],
      });
    });
  };

  const onApprove = async (contribution: SuiObjectResponse, taskId: string, contributor: string) => {
    const profileObj = profileIdByOwner.get(contributor);
    if (!profileObj) {
      window.alert('Contributor chưa có Profile on-chain. Họ cần tạo profile trước (trang POC Profile).');
      return;
    }
    const contribId = objectIdFromResponse(contribution);
    if (!contribId) return;
    return runTx((tx) => {
      tx.moveCall({
        target: `${packageId}::poc::approve_contribution`,
        arguments: [tx.object(contribId), tx.object(taskId), tx.object(profileObj)],
      });
    });
  };

  if (!packageId) {
    return (
      <Card title="POC — Tasks">
        <p className="text-sm text-slate-300">
          Đặt <code className="text-slate-200">VITE_POC_PACKAGE_ID</code> trong{' '}
          <code className="text-slate-200">frontend/.env</code> sau khi publish package Move.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card title="Tạo task (on-chain)">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs text-slate-400">Mô tả task</div>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                placeholder="VD: Build UI login"
              />
            </div>
            <div>
              <div className="text-xs text-slate-400">Reward (điểm reputation)</div>
              <input
                value={newReward}
                onChange={(e) => setNewReward(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                placeholder="10"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button onClick={onCreateTask} disabled={isPending || newTitle.trim().length < 2}>
              Publish task
            </Button>
          </div>
        </Card>

        <Card title="Danh sách task">
          {loadingTasks ? (
            <div className="text-sm text-slate-400">Đang tải…</div>
          ) : tasks.length === 0 ? (
            <div className="text-sm text-slate-400">Chưa có task. Tạo task ở trên hoặc publish module lên đúng network.</div>
          ) : (
            <div className="space-y-4">
              {tasks.map((t) => {
                const oid = objectIdFromResponse(t);
                const fields = getMoveObjectFields(t);
                if (!oid || !fields) return null;
                const creator = fields.creator as string;
                const status = Number(fields.status);
                const reward = parseU64(fields.reward);
                const desc = vecU8ToUtf8(fields.description);
                const assignee = parseOptionAddress(fields.assignee);
                const isCreator = account?.address === creator;
                const isAssignee = account?.address && assignee === account.address;

                return (
                  <div key={oid} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">{desc || '(empty description)'}</div>
                        <div className="mt-1 text-xs text-slate-500">ID: {oid}</div>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <div>{statusLabel(status)}</div>
                        <div className="mt-1">Reward: {reward.toString()} pts</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Creator: <span className="text-slate-400">{shortAddr(creator)}</span>
                      {assignee ? (
                        <>
                          {' '}
                          · Assignee: <span className="text-slate-400">{shortAddr(assignee)}</span>
                        </>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {status === TASK_OPEN ? (
                        <Button
                          className="px-3 py-1.5 text-xs"
                          variant="ghost"
                          onClick={() => onClaim(oid)}
                          disabled={!account || isPending}
                        >
                          Claim task
                        </Button>
                      ) : null}
                      {status === TASK_IN_PROGRESS && isAssignee ? (
                        <>
                          <input
                            value={proofByTask[oid] ?? ''}
                            onChange={(e) => setProofByTask((s) => ({ ...s, [oid]: e.target.value }))}
                            className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-indigo-400"
                            placeholder="Proof: GitHub URL / IPFS CID…"
                          />
                          <Button className="px-3 py-1.5 text-xs" onClick={() => onSubmit(oid)} disabled={isPending}>
                            Submit proof
                          </Button>
                        </>
                      ) : null}
                      {status === TASK_IN_PROGRESS && !isAssignee && account ? (
                        <span className="text-xs text-slate-500">Chỉ assignee mới submit proof.</span>
                      ) : null}
                      {isCreator && status !== TASK_DONE ? (
                        <span className="text-xs text-slate-500">Xem hộp Contribution bên phải để approve.</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Contribution inbox (creator)">
          {!account ? (
            <div className="text-sm text-slate-400">Kết nối ví.</div>
          ) : loadingInbox ? (
            <div className="text-sm text-slate-400">Đang tải…</div>
          ) : inbox.length === 0 ? (
            <div className="text-sm text-slate-400">Không có contribution nào gửi tới ví bạn.</div>
          ) : (
            <div className="space-y-3">
              {inbox.map((row) => {
                const c = row as SuiObjectResponse;
                const cid = objectIdFromResponse(c);
                const fields = getMoveObjectFields(c);
                if (!cid || !fields) return null;
                const taskId = normalizeObjectIdField(fields.task_id);
                const contributor = fields.contributor as string;
                const proof = vecU8ToUtf8(fields.proof);
                const approved = Boolean(fields.approved);
                if (!taskId) return null;
                return (
                  <div key={cid} className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                    <div className="font-mono text-slate-500">{cid}</div>
                    <div className="mt-2 text-slate-300">Task: {taskId}</div>
                    <div className="mt-1 text-slate-300">From: {shortAddr(contributor)}</div>
                    <div className="mt-1 break-all text-slate-400">Proof: {proof}</div>
                    <div className="mt-1 text-slate-500">Approved: {approved ? 'yes' : 'no'}</div>
                    {!approved ? (
                      <div className="mt-2">
                        <Button
                          className="px-3 py-1.5 text-xs"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() => onApprove(c, taskId, contributor)}
                        >
                          Approve (+reputation)
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
