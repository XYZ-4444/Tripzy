'use client'

import * as React from 'react'
import { Bell, Sun, Moon, Monitor, Search, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useThemeStore } from '@/store/theme'
import { useSidebarStore } from '@/store/sidebar'

export function Header() {
  const { theme, setTheme, toggleTheme } = useThemeStore()
  const { toggleCollapsed, isCollapsed } = useSidebarStore()
  const [searchOpen, setSearchOpen] = React.useState(false)

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  }

  const themeLabels = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4"
      style={{ left: isCollapsed ? '64px' : '256px' }}
    >
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => useSidebarStore.getState().toggleMobile()}
        aria-label="Open menu"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Sidebar toggle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Search */}
      <div className="relative flex-1 max-w-xl hidden sm:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search... (⌘K)"
          className="pl-10 bg-transparent"
          onClick={() => setSearchOpen(true)}
          readOnly
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {React.createElement(themeIcons[theme], { className: "h-4 w-4" })}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              Current: {themeLabels[theme]}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end">
              Notifications
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 px-2 py-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">john@example.com</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            {(['light', 'dark', 'system'] as const).map((t) => (
              <DropdownMenuItem
                key={t}
                onSelect={() => setTheme(t)}
                className={theme === t ? 'bg-accent' : ''}
              >
                <div className="flex items-center justify-between">
                  <span>{themeLabels[t]}</span>
                  {theme === t && <span className="text-primary">✓</span>}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/settings" className="flex w-full items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/settings/profile" className="flex w-full items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
