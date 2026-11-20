'use client'

import * as React from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useSidebarStore } from '@/store/sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isMobileOpen, setMobileOpen } = useSidebarStore()

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile sidebar sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main
        className="flex min-h-screen flex-col"
        style={{ marginLeft: '256px' }}
      >
        <Header />
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
