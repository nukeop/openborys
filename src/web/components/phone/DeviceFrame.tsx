import clsx from 'clsx';
import type { ReactNode } from 'react';
import { StatusBar } from './StatusBar';

function DynamicIsland() {
  return (
    <div
      aria-hidden="true"
      className="absolute top-[11px] left-1/2 z-40 h-[34px] w-[120px] -translate-x-1/2 rounded-full bg-black"
    />
  );
}

function HomeIndicator() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-2 left-1/2 z-40 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-zinc-100"
    />
  );
}

function SideButton({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={clsx('absolute w-[3px] bg-zinc-700', className)}
    />
  );
}

/**
 * Phone hardware around the screen on sm and up. Below sm the device itself
 * is the phone, so the screen fills the viewport and the frame disappears.
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-20 sm:static sm:z-auto sm:flex sm:justify-center sm:px-8 sm:py-10">
      <div className="relative h-full sm:h-[min(844px,calc(100dvh-8rem))] sm:min-h-[600px] sm:w-[390px] sm:rounded-[60px] sm:bg-black sm:p-3 sm:shadow-[0_30px_60px_-12px_rgb(0_0_0/0.8)] sm:ring-1 sm:ring-zinc-700 sm:ring-inset">
        <div className="hidden sm:block">
          <SideButton className="top-[120px] -left-[3px] h-8 rounded-l" />
          <SideButton className="top-[180px] -left-[3px] h-14 rounded-l" />
          <SideButton className="top-[250px] -left-[3px] h-14 rounded-l" />
          <SideButton className="top-[200px] -right-[3px] h-20 rounded-r" />
        </div>
        <div className="relative h-full overflow-hidden bg-zinc-950 sm:rounded-[48px]">
          <div className="hidden sm:block">
            <DynamicIsland />
            <StatusBar />
            <HomeIndicator />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
