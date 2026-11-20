'use client'

import * as React from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/store/sidebar'

export function MobileSidebarTrigger() {
  const { toggleMobile } = useSidebarStore()

  return (
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleMobile}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  )
}
