'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { Menu, X, Check, ShoppingCart, Package, BarChart3, Users, Wifi, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  APP_NAME,
  LANDING,
  FEATURE_LIST,
  PRICING_LIST,
  FAQ_LIST,
} from '@/lib/constants/copy'
import { ROUTES } from '@/lib/constants/routes'

const FEATURE_ICONS = [ShoppingCart, Package, BarChart3, Users, Wifi, Sparkles]

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isSignedIn, isLoaded } = useAuth()

  const primaryHref = isSignedIn ? ROUTES.DASHBOARD : ROUTES.SIGN_UP
  const primaryLabel = isSignedIn ? LANDING.CTA_DASHBOARD : LANDING.HERO_CTA_PRIMARY

  return (
    <div className="min-h-screen bg-white text-zinc-900">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-zinc-100 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            <span className="text-xl font-bold text-brand">{APP_NAME}</span>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA — auth-aware */}
            {isLoaded && (
              <div className="hidden md:flex items-center gap-3">
                {isSignedIn ? (
                  <Link
                    href={ROUTES.DASHBOARD}
                    className={cn(buttonVariants(), 'bg-brand hover:bg-brand-dark text-white')}
                  >
                    {LANDING.CTA_DASHBOARD}
                  </Link>
                ) : (
                  <>
                    <Link href={ROUTES.SIGN_IN} className={buttonVariants({ variant: 'ghost' })}>
                      Sign in
                    </Link>
                    <Link
                      href={ROUTES.SIGN_UP}
                      className={cn(buttonVariants(), 'bg-brand hover:bg-brand-dark text-white')}
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden rounded-md p-2 text-zinc-600 hover:bg-zinc-100 transition-colors"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-zinc-100 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block rounded-md px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {isLoaded && (
                <>
                  <Separator className="my-3" />
                  <div className="flex gap-2 px-4">
                    {isSignedIn ? (
                      <Link
                        href={ROUTES.DASHBOARD}
                        className={cn(buttonVariants(), 'flex-1 bg-brand hover:bg-brand-dark text-white')}
                      >
                        {LANDING.CTA_DASHBOARD}
                      </Link>
                    ) : (
                      <>
                        <Link
                          href={ROUTES.SIGN_IN}
                          className={cn(buttonVariants({ variant: 'outline' }), 'flex-1')}
                        >
                          Sign in
                        </Link>
                        <Link
                          href={ROUTES.SIGN_UP}
                          className={cn(buttonVariants(), 'flex-1 bg-brand hover:bg-brand-dark text-white')}
                        >
                          Get started
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-brand-light text-brand border-0 px-4 py-1 text-sm">
            Built for Nigerian market shops
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl leading-tight">
            {LANDING.HERO_TITLE}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-500">
            {LANDING.HERO_SUBTITLE}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={primaryHref}
              className={cn(buttonVariants({ size: 'lg' }), 'bg-brand hover:bg-brand-dark text-white px-8')}
            >
              {primaryLabel}
            </Link>
            <a
              href="#features"
              className={buttonVariants({ size: 'lg', variant: 'outline' })}
            >
              {LANDING.HERO_CTA_SECONDARY}
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-zinc-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-zinc-900">{LANDING.FEATURES_TITLE}</h2>
            <p className="mt-3 text-zinc-500">{LANDING.FEATURES_SUBTITLE}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_LIST.map((feature, i) => {
              const Icon = FEATURE_ICONS[i]
              return (
                <div
                  key={feature.title}
                  className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-brand-light">
                    <Icon className="h-5 w-5 text-brand" />
                  </div>
                  <h3 className="mb-2 font-semibold text-zinc-900">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-500">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-zinc-900">{LANDING.PRICING_TITLE}</h2>
            <p className="mt-3 text-zinc-500">{LANDING.PRICING_SUBTITLE}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PRICING_LIST.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 ${
                  plan.featured
                    ? 'border-brand bg-brand text-white shadow-xl scale-[1.03]'
                    : 'border-zinc-200 bg-white'
                }`}
              >
                {plan.featured && (
                  <Badge className="mb-3 bg-white/20 text-white border-0 text-xs font-semibold">
                    Most popular
                  </Badge>
                )}
                <h3 className={`text-lg font-bold ${plan.featured ? 'text-white' : 'text-zinc-900'}`}>
                  {plan.name}
                </h3>
                <p className={`mt-1 text-3xl font-bold ${plan.featured ? 'text-white' : 'text-zinc-900'}`}>
                  {plan.price}
                </p>
                <p className={`mt-1 mb-6 text-sm ${plan.featured ? 'text-brand-light' : 'text-zinc-500'}`}>
                  {plan.description}
                </p>
                <ul className="mb-8 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check
                        className={`h-4 w-4 shrink-0 ${plan.featured ? 'text-brand-light' : 'text-brand'}`}
                      />
                      <span className={plan.featured ? 'text-white' : 'text-zinc-700'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={isSignedIn ? ROUTES.DASHBOARD : ROUTES.SIGN_UP}
                  className={cn(
                    buttonVariants(),
                    'w-full',
                    plan.featured
                      ? 'bg-white text-brand hover:bg-brand-light'
                      : 'bg-brand hover:bg-brand-dark text-white'
                  )}
                >
                  {isSignedIn ? LANDING.CTA_DASHBOARD : plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-zinc-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-zinc-900">{LANDING.FAQ_TITLE}</h2>
          <div className="space-y-4">
            {FAQ_LIST.map((item) => (
              <div
                key={item.question}
                className="rounded-lg border border-zinc-200 bg-white p-6"
              >
                <h3 className="mb-2 font-semibold text-zinc-900">{item.question}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold text-zinc-900">{LANDING.CONTACT_TITLE}</h2>
          <p className="mt-3 text-zinc-500">{LANDING.CONTACT_SUBTITLE}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`mailto:${LANDING.CONTACT_EMAIL}`}
              className="text-sm font-medium text-brand hover:text-brand-dark transition-colors"
            >
              {LANDING.CONTACT_EMAIL}
            </a>
            <span className="hidden text-zinc-300 sm:block">·</span>
            <a
              href={`https://wa.me/${LANDING.CONTACT_WHATSAPP.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand hover:text-brand-dark transition-colors"
            >
              WhatsApp: {LANDING.CONTACT_WHATSAPP}
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-200 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span className="text-sm font-bold text-brand">{APP_NAME}</span>
          <p className="text-xs text-zinc-400">{LANDING.FOOTER_TAGLINE}</p>
          <p className="text-xs text-zinc-400">{LANDING.FOOTER_RIGHTS}</p>
        </div>
      </footer>

    </div>
  )
}
