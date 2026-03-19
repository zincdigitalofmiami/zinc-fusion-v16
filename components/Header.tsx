'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'DASHBOARD' },
  { href: '/strategy', label: 'STRATEGY' },
  { href: '/legislation', label: 'LEGISLATION' },
  { href: '/sentiment', label: 'SENTIMENT' },
  { href: '/vegas-intel', label: 'VEGAS INTEL' },
]

export default function Header() {
  const pathname = usePathname()
  const isDashboardSurface = navItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )
  const logoSrc = isDashboardSurface ? '/logo-dashboard.svg' : '/logo.svg'

  return (
    <header className="header">
      <nav className="nav-container">
        <Link href="/" className="logo">
          <Image
            src={logoSrc}
            alt="ZINC FUSION"
            width={200}
            height={50}
            priority
          />
        </Link>
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={pathname === item.href ? 'active' : ''}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
