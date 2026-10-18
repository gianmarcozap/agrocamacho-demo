import React from 'react'
import { Header } from '../common/Header'
import { Sidebar } from './Sidebar'
import { TopContextBar } from './TopContextBar'

interface OperationalLayoutProps {
  children: React.ReactNode
}

export const OperationalLayout: React.FC<OperationalLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 font-sans antialiased text-slate-900 select-none">
      {/* Top Application Header */}
      <Header showModuleBreadcrumb={true} />

      {/* Main Operational Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Collapsible Sidebar */}
        <Sidebar />

        {/* Viewport Frame with Context Bar & Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Top Context Bar: Active Batch Selector, Sandbox badge, Reiniciar datos */}
          <TopContextBar />

          {/* Single-Screen Viewport View Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 min-h-0 flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
