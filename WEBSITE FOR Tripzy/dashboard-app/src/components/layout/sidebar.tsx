'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Users,
  DollarSign,
  Activity,
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Bell,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSidebarStore } from '@/store/sidebar'
import type { NavItem } from '@/types'

const navigation: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  {
    label: 'Management',
    href: '#',
    icon: 'Users',
    children: [
      { label: 'Users', href: '/dashboard/users', icon: 'Users' },
      { label: 'Teams', href: '/dashboard/teams', icon: 'Users' },
      { label: 'Roles', href: '/dashboard/roles', icon: 'Settings' },
    ],
  },
  {
    label: 'Reports',
    href: '#',
    icon: 'FileText',
    children: [
      { label: 'Revenue', href: '/dashboard/reports/revenue', icon: 'DollarSign' },
      { label: 'Activity', href: '/dashboard/reports/activity', icon: 'Activity' },
      { label: 'Export', href: '/dashboard/reports/export', icon: 'FileText' },
    ],
  },
]

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BarChart3,
  Settings,
  Users,
  DollarSign,
  Activity,
  Home,
  FileText,
  Bell,
  HelpCircle,
  LogOut,
}

function NavLink({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || (item.children && pathname.startsWith(item.href.replace('#', '')))
  const Icon = iconMap[item.icon]

  if (item.children) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isCollapsed && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className={cn('truncate', isCollapsed && 'invisible')}>{item.label}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" align="start">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        isCollapsed && 'justify-center'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className={cn('truncate', isCollapsed && 'invisible')}>{item.label}</span>
    </Link>
  )
}

export function Sidebar() {
  const { isCollapsed, toggleCollapsed } = useSidebarStore()
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Main navigation"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn('flex h-16 items-center justify-center border-b px-4', isCollapsed && 'justify-center')}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-foreground">Dashboard</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <nav className="flex flex-1 flex-col px-3 py-4 space-y-1" aria-label="Sidebar navigation">
            {navigation.map((item) => (
              <NavLink key={item.href} item={item} isCollapsed={isCollapsed} />
            ))}
          </nav>
        </ScrollArea>

        {/* Bottom section */}
        <div className="border-t p-3">
          <Separator className="mb-3" />
          
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  isCollapsed && 'justify-center'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex flex-col truncate">
                    <span className="truncate font-medium text-foreground">John Doe</span>
                    <span className="truncate text-xs text-muted-foreground">Admin</span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">john@example.com</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex w-full items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/profile" className="flex w-full items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/billing" className="flex w-full items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Collapse toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('w-full justify-center', isCollapsed && 'rotate-180')}
                  onClick={toggleCollapsed}
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </aside>
  )
}
