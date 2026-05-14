import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, FileText, Copy, Printer } from 'lucide-react'
import { offerMeta, offerSections } from '../data/offerContent'

export const OfferPage: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/landing" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">МД</span>
              </div>
            </Link>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">Публичная оферта</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Скопировано!' : 'Скопировать'}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 lg:flex lg:gap-8">
        {/* Sidebar nav — desktop */}
        <nav className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Разделы</p>
            <ul className="space-y-1">
              {offerSections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                  >
                    <span className="text-xs text-slate-400 w-4 shrink-0">{s.number}.</span>
                    <span className="leading-tight">{s.title}</span>
                    {s.highlight === 'warning' && <span className="text-amber-500 ml-auto">⚠️</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Mobile nav */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="flex items-center gap-2 w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            <FileText className="h-4 w-4" />
            Содержание
            {navOpen ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
          </button>
          {navOpen && (
            <div className="mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3">
              <ul className="space-y-1">
                {offerSections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={() => setNavOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span className="text-xs text-slate-400 w-4">{s.number}.</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Doc header */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{offerMeta.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{offerMeta.subtitle}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-400 dark:text-slate-500">
              <span>Версия: {offerMeta.version}</span>
              <span>Вступила в силу: {offerMeta.effectiveDate}</span>
              <span>Обновлена: {offerMeta.lastUpdated}</span>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {offerSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className={`rounded-2xl border p-6 scroll-mt-20 ${
                  section.highlight === 'warning'
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {section.number}. {section.title}
                  {section.highlight === 'warning' && <span className="ml-2">⚠️</span>}
                </h2>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
                {section.lawRef && (
                  <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                    📖 {section.lawRef}
                  </p>
                )}
              </section>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-slate-400 dark:text-slate-500">
            По вопросам:{' '}
            <a href={`mailto:${offerMeta.ownerEmail}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
              {offerMeta.ownerEmail}
            </a>
          </p>
        </main>
      </div>
    </div>
  )
}
