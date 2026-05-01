import { useCurrentAccount, useDisconnectWallet, useConnectWallet, ConnectButton } from '@mysten/dapp-kit';
import { LogOut, Wallet } from 'lucide-react';

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletStatus() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  // Force hook inclusion for some dapp-kit versions that tree-shake poorly
  useConnectWallet();

  if (!account) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden text-xs text-slate-400 md:block">Connect to vote</div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">
          <ConnectButton connectText="Connect wallet" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 sm:flex">
        <Wallet className="h-4 w-4 text-slate-300" />
        <span className="font-medium">{shortAddress(account.address)}</span>
      </div>
      <button
        type="button"
        onClick={() => disconnect()}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Disconnect</span>
      </button>
    </div>
  );
}

