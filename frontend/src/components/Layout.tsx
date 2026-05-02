import { Outlet, NavLink } from 'react-router-dom';
import { WalletStatus } from './WalletStatus';
import { cn } from '../lib/cn';

const navItems = [
  { to: '/vote', label: 'Vote' },
  { to: '/results', label: 'Results' },
  { to: '/admin', label: 'Admin' },
  { to: '/poc/tasks', label: 'POC Tasks' },
  { to: '/poc/profile', label: 'POC Profile' },
] as const;

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide text-white">Mini Voting + POC</div>
              <div className="text-xs text-slate-400">Mock voting + on-chain Proof of Contribution</div>
            </div>

            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white',
                      isActive && 'bg-white/10 text-white'
                    )
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <WalletStatus />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Mini Voting System</div>
          <div>
            Mock mode by default. Add on-chain integration later via env + contract module.
          </div>
        </div>
      </footer>
    </div>
  );
}

