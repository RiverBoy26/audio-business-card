import { ChevronDown, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { AuthDialog, type AuthMode } from '@/features/auth/ui/auth-dialog'
import { useAuth } from '@/features/auth/model/use-auth'
import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'

const navigation = [
  { label: 'Создать визитку', to: '/create' },
  { label: 'Открыть по коду', to: '/open' },
]

const navigationLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative flex h-16 items-center whitespace-nowrap px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
    isActive
      ? 'text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary'
      : 'text-foreground/75 hover:text-foreground',
  )

export function RootLayout() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const isLanding = pathname === '/'
  const requestedAuthMode: AuthMode | null = new URLSearchParams(search).has('login')
    ? 'login'
    : null

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <BrandLogo />

          {!user ? (
            <div className="ml-auto flex items-center gap-2">
              <Button className="hidden sm:inline-flex" onClick={() => setAuthMode('login')} variant="outline">
                Войти
              </Button>
              <Button onClick={() => setAuthMode('register')}>
                Регистрация
              </Button>
            </div>
          ) : (
            <>
              <nav
                aria-label="Основная навигация"
                className="mx-auto hidden h-full items-center gap-7 lg:flex"
              >
                {navigation.map((item) => (
                  <NavLink className={({ isActive }) => navigationLinkClass({ isActive: isActive || (item.to === '/open' && pathname.startsWith('/card/')) })} key={item.to} to={item.to}>
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="relative ml-auto hidden lg:block">
                <button
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  type="button"
                >
                  <span className="size-9 rounded-full bg-muted" />
                  {user?.firstName ?? 'Аккаунт'}
                  <ChevronDown aria-hidden="true" className={cn('size-4 transition', userMenuOpen && 'rotate-180')} />
                </button>
                {userMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg" role="menu">
                    <Link className="block px-4 py-3 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)} role="menuitem" to="/profile">Мой профиль</Link>
                    <Link className="block border-t border-border px-4 py-3 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)} role="menuitem" to="/cards">Мои визитки</Link>
                    <button
                      className="block w-full border-t border-border px-4 py-3 text-left text-sm hover:bg-muted"
                      onClick={() => void logout()}
                      role="menuitem"
                      type="button"
                    >
                      Выйти
                    </button>
                  </div>
                ) : null}
              </div>

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
                      isActive || (item.to === '/open' && pathname.startsWith('/card/')) ? 'bg-accent text-primary' : 'hover:bg-muted',
                    )
                  }
                  key={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink className="rounded-md px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)} to="/profile">Мой профиль</NavLink>
              <NavLink className="rounded-md px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)} to="/cards">Мои визитки</NavLink>
              {user ? (
                <button className="rounded-md px-3 py-3 text-left text-sm font-medium hover:bg-muted" onClick={() => void logout()} type="button">Выйти</button>
              ) : (
                <button className="rounded-md px-3 py-3 text-left text-sm font-medium hover:bg-muted" onClick={() => { setAuthMode('login'); setMobileMenuOpen(false) }} type="button">Войти</button>
              )}
            </div>
          </nav>
        ) : null}
      </header>
      <Outlet />
      <AuthDialog
        mode={authMode ?? requestedAuthMode}
        onClose={() => {
          setAuthMode(null)
          if (requestedAuthMode) navigate('/', { replace: true })
        }}
        onModeChange={setAuthMode}
      />
    </div>
  )
}
