"use client"

import { useState,useMemo } from "react"
import Link from "next/link"
import { Menu, X, Home, Info, Mail, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePrivy } from '@privy-io/react-auth'
import ProfileAvatar from "@/components/ui/ProfileAvatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { ready, authenticated, login, user,logout } = usePrivy()
  const isClient = typeof window !== 'undefined';
  const wallet =  user?.wallet?.address || 'Unknown';
  const avatar = useMemo(() => isClient ? ProfileAvatar(wallet) : null, [wallet, isClient]);

  const toggleMenu = () => setIsOpen(!isOpen)

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Mail },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="bg-background p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
        ZuTalent
        </Link>

        {/* Mobile Menu */}
        <div className="flex items-center gap-4 md:hidden">
          {ready && authenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {avatar}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={login} disabled={!ready || (ready && authenticated)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign In
            </Button>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex md:items-center md:gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {ready && authenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {avatar}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={login} disabled={!ready || (ready && authenticated)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}