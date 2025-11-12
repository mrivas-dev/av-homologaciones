'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@av/ui'
import { useAppSelector } from '@/store/hooks'
import { Menu, X, Globe } from 'lucide-react'

export function Header() {
  const t = useTranslations('navigation')
  const locale = useLocale()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useAppSelector((state) => state.auth)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const switchLanguage = () => {
    const newLocale = locale === 'es' ? 'en' : 'es'
    window.location.href = `/${newLocale}`
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AV</span>
            </div>
            <span className="font-bold text-xl">Homologaciones</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href={`/${locale}`} className="text-sm font-medium hover:text-primary transition-colors">
              {t('home')}
            </Link>
            <Link href={`/${locale}/homologar`} className="text-sm font-medium hover:text-primary transition-colors">
              {t('homologate')}
            </Link>
            <Link href={`/${locale}/estado`} className="text-sm font-medium hover:text-primary transition-colors">
              {t('status')}
            </Link>
            {user?.role === 'admin' && (
              <Link href={`/${locale}/admin`} className="text-sm font-medium hover:text-primary transition-colors">
                {t('admin')}
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={switchLanguage}
              className="hidden md:flex items-center space-x-1"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">{locale === 'es' ? 'EN' : 'ES'}</span>
            </Button>

            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {user.full_name || user.email}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${locale}/profile`}>{t('profile')}</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/${locale}/logout`}>{t('logout')}</Link>
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/${locale}/login`}>{t('login')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/${locale}/register`}>{t('register')}</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <Link href={`/${locale}`} className="text-sm font-medium hover:text-primary transition-colors">
                {t('home')}
              </Link>
              <Link href={`/${locale}/homologar`} className="text-sm font-medium hover:text-primary transition-colors">
                {t('homologate')}
              </Link>
              <Link href={`/${locale}/estado`} className="text-sm font-medium hover:text-primary transition-colors">
                {t('status')}
              </Link>
              {user?.role === 'admin' && (
                <Link href={`/${locale}/admin`} className="text-sm font-medium hover:text-primary transition-colors">
                  {t('admin')}
                </Link>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={switchLanguage}
                className="justify-start items-center space-x-1"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">{locale === 'es' ? 'EN' : 'ES'}</span>
              </Button>

              {user ? (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    {user.full_name || user.email}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/${locale}/profile`}>{t('profile')}</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/${locale}/logout`}>{t('logout')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/${locale}/login`}>{t('login')}</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/${locale}/register`}>{t('register')}</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
