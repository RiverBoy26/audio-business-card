import { ChevronDown, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'

const navigation = [
  { label: 'Создать визитку', to: '/create' },
  { label: 'Мои визитки', to: '/cards' },
  { label: 'Профиль', to: '/profile' },
]

const navigationLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative flex h-16 items-center whitespace-nowrap px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
    isActive
      ? 'text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary'
      : 'text-foreground/75 hover:text-foreground',
  )

export function RootLayout() {
  const { pathname } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isLanding = pathname === '/'

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <BrandLogo />

          {isLanding ? (
            <div className="ml-auto flex items-center gap-2">
              <Button className="hidden sm:inline-flex" variant="outline">
                Войти
              </Button>
              <Button asChild>
                <Link to="/create">Регистрация</Link>
              </Button>
            </div>
          ) : (
            <>
              <nav
                aria-label="Основная навигация"
                className="mx-auto hidden h-full items-center gap-7 lg:flex"
              >
                {navigation.map((item) => (
                  <NavLink className={navigationLinkClass} key={item.to} to={item.to}>
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <Link
                className="ml-auto hidden items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
                to="/profile"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  МС
                </span>
                Марк
                <ChevronDown aria-hidden="true" className="size-4" />
              </Link>

              <Button
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                className="ml-auto lg:hidden"
                onClick={() => setMobileMenuOpen((open) => !open)}
                size="icon"
                variant="ghost"
              >
                {mobileMenuOpen ? (
                  <X aria-hidden="true" className="size-5" />
                ) : (
                  <Menu aria-hidden="true" className="size-5" />
                )}
              </Button>
            </>
          )}
        </div>

        {!isLanding && mobileMenuOpen ? (
          <nav
            aria-label="Мобильная навигация"
            className="border-t border-border bg-card px-4 py-3 lg:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              {navigation.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-3 text-sm font-medium',
                      isActive ? 'bg-accent text-primary' : 'hover:bg-muted',
                    )
                  }
                  key={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        ) : null}
      </header>
      <Outlet />
    </div>
  )
}
