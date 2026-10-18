import { ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { AuthDialog, type AuthMode } from '@/features/auth/ui/auth-dialog'
import { useAuth } from '@/features/auth/model/use-auth'
import { UserAvatar } from '@/entities/user/ui/user-avatar'
import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/ui/brand-logo'
import { Button } from '@/shared/ui/button'

const navigation = [
  { label: 'Мероприятия', to: '/events' },
  { label: 'Мои визитки', to: '/cards' },
  { label: 'Заявки', to: '/applications' },
]

function navigationItemIsActive(pathname: string, itemTo: string) {
  if (itemTo === '/events') return pathname === '/events' || pathname.startsWith('/events/')
  if (itemTo === '/cards') return pathname === '/cards' || pathname.startsWith('/cards/')
  if (itemTo === '/applications') return pathname === '/applications' || pathname.startsWith('/applications/')
  return pathname === itemTo
}

const navigationLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative flex h-[4.5rem] items-center whitespace-nowrap px-2 font-[Sansation] text-base font-normal leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
    isActive
      ? 'text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary'
      : 'text-foreground/75 hover:text-foreground',
  )

export function RootLayout() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { avatarRevision, logout, user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const requestedAuthMode: AuthMode | null = new URLSearchParams(search).has('login')
    ? 'login'
    : null

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  function handleLogout() {
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
    void logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 backdrop-blur-xl">
        <div className="flex h-[4.5rem] w-full items-center gap-6 px-5 sm:px-6 lg:px-8">
          <BrandLogo />

          {!user ? (
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Button className="h-10 px-2 font-[Sansation] text-sm font-normal sm:px-4 sm:text-base" onClick={() => setAuthMode('login')} variant="ghost">
                Войти
              </Button>
              <Button className="h-10 px-3 font-[Sansation] text-sm sm:px-4 sm:text-base" onClick={() => setAuthMode('register')}>
                Регистрация
              </Button>
            </div>
          ) : (
            <>
              <nav
                aria-label="Основная навигация"
                className="mx-auto hidden h-full items-center gap-10 xl:flex"
              >
                {navigation.map((item) => (
                  <NavLink className={() => navigationLinkClass({ isActive: navigationItemIsActive(pathname, item.to) })} key={item.to} to={item.to}>
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="relative ml-auto hidden xl:block">
                <button
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-md px-2 py-1 font-[Sansation] text-base font-normal leading-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  type="button"
                >
                  <UserAvatar
                    avatarUrl={user.avatarUrl}
                    className="size-9"
                    firstName={user.firstName}
                    lastName={user.lastName}
                    revision={avatarRevision}
                  />
                  <span className="max-w-32 truncate">{user.firstName}</span>
                  <ChevronDown aria-hidden="true" className={cn('size-4 transition', userMenuOpen && 'rotate-180')} />
                </button>
                {userMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg" role="menu">
                    <Link className="block px-4 py-3 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)} role="menuitem" to="/profile">Мой профиль</Link>
                    <Link className="block border-t border-border px-4 py-3 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)} role="menuitem" to="/my-events">Мои мероприятия</Link>
                    <Link className="block border-t border-border px-4 py-3 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)} role="menuitem" to="/open">Открыть визитку по коду</Link>
                    <button
                      className="block w-full border-t border-border px-4 py-3 text-left text-sm hover:bg-muted"
                      onClick={handleLogout}
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
                className="ml-auto gap-2 px-2 xl:hidden"
                onClick={() => setMobileMenuOpen((open) => !open)}
                variant="ghost"
              >
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  className="size-8"
                  firstName={user.firstName}
                  lastName={user.lastName}
                  revision={avatarRevision}
                />
                {mobileMenuOpen ? (
                  <X aria-hidden="true" className="size-5" />
                ) : (
                  <Menu aria-hidden="true" className="size-5" />
                )}
              </Button>
            </>
          )}
        </div>

        {mobileMenuOpen ? (
          <nav
            aria-label="Мобильная навигация"
            className="border-t border-border bg-card px-4 py-3 xl:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              {navigation.map((item) => (
                <NavLink
                  className={() =>
                    cn(
                      'rounded-md px-3 py-3 text-sm font-medium',
                      navigationItemIsActive(pathname, item.to) ? 'bg-accent text-primary' : 'hover:bg-muted',
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
              <NavLink className="rounded-md px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)} to="/my-events">Мои мероприятия</NavLink>
              <NavLink className="rounded-md px-3 py-3 text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)} to="/open">Открыть визитку по коду</NavLink>
              {user ? (
                <button className="rounded-md px-3 py-3 text-left text-sm font-medium hover:bg-muted" onClick={handleLogout} type="button">Выйти</button>
              ) : (
                <button className="rounded-md px-3 py-3 text-left text-sm font-medium hover:bg-muted" onClick={() => { setAuthMode('login'); setMobileMenuOpen(false) }} type="button">Войти</button>
              )}
            </div>
          </nav>
        ) : null}
      </header>
      <Outlet />
      <footer className="mt-auto border-t border-border bg-card px-5 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2">
          <Link className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to="/privacy">Политика обработки персональных данных</Link>
          <Link className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to="/personal-data-consent">Согласие на обработку персональных данных</Link>
        </div>
      </footer>
      <AuthDialog
        mode={authMode ?? requestedAuthMode}
        onClose={() => {
          setAuthMode(null)
          if (requestedAuthMode) {
            const nextSearch = new URLSearchParams(search)
            nextSearch.delete('login')
            navigate({ pathname, search: nextSearch.toString() }, { replace: true })
          }
        }}
        onModeChange={setAuthMode}
      />
    </div>
  )
}
