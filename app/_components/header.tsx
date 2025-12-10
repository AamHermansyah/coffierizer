import Image from 'next/image'
import React from 'react'

interface IProps {
  isSystemActive?: boolean;
  onClickReset?: () => void;
  disabled?: boolean;
}

function Header({ disabled, isSystemActive, onClickReset }: IProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 rounded-full overflow-hidden">
            <Image
              src="/logo.png"
              alt="CoffieRizer"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-semibold tracking-tight text-lg text-slate-100">CoffieRizer</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            STATUS: {isSystemActive ? <span className="text-emerald-400 animate-pulse">RUNNING</span> : "IDLE"}
          </div>
          <button
            onClick={onClickReset}
            className="px-4 py-1.5 text-xs font-medium rounded-full border border-slate-700 hover:bg-slate-800 transition disabled:opacity-50"
            disabled={disabled}
          >
            RESET
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header