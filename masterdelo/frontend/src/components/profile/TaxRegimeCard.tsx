import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Check, AlertTriangle, Calendar, Calculator, Scale } from 'lucide-react'
import type { TaxRegime } from '../../data/taxRegimes'
import { TaxCalcTab } from './TaxCalcTab'
import { TaxLawsTab } from './TaxLawsTab'

type Tab = 'calc' | 'pros' | 'reporting' | 'laws'

interface Props {
  regime: TaxRegime
  isSelected: boolean
  onSelect: (id: string) => void
}

export const TaxRegimeCard: React.FC<Props> = ({ regime, isSelected, onSelect }) => {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('calc')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'calc', label: 'Расчёт', icon: <Calculator className="h-3.5 w-3.5" /> },
    { id: 'pros', label: 'Плюсы/Минусы', icon: <Check className="h-3.5 w-3.5" /> },
    { id: 'reporting', label: 'Отчётность', icon: <Calendar className="h-3.5 w-3.5" /> },
    { id: 'laws', label: 'Законы', icon: <Scale className="h-3.5 w-3.5" /> },
  ]

  return (
    <div
      className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'border-blue-500 shadow-[0_4px_16px_rgba(59,130,246,0.15)]'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      } bg-white dark:bg-slate-800`}
    >
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${regime.badgeColor}`}>
              {regime.badge}
            </span>
            {isSelected && (
              <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Check className="h-3.5 w-3.5" />
                Выбран
              </span>
            )}
          </div>
        </div>

        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{regime.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{regime.tagline}</p>

        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Ставка</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{regime.rate}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Лимит</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{regime.limit}</p>
          </div>
        </div>

        {!expanded && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-green-600 dark:text-green-500 font-medium mb-1">+ Плюсы</p>
              <ul className="space-y-0.5">
                {regime.pros.slice(0, 2).map((p, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-tight">{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] text-red-500 font-medium mb-1">− Минусы</p>
              <ul className="space-y-0.5">
                {regime.cons.slice(0, 1).map((c, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-tight">{c}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Свернуть' : 'Подробнее'}
          </button>
          <button
            type="button"
            onClick={() => onSelect(regime.id)}
            className={`ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300'
            }`}
          >
            {isSelected ? '✓ Выбран' : 'Выбрать режим'}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-700 px-4 gap-1 pt-2 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === 'calc' && <TaxCalcTab calc={regime.taxCalc} />}

            {activeTab === 'pros' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-green-600 dark:text-green-500 mb-2">Плюсы</p>
                  <ul className="space-y-1.5">
                    {regime.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-green-500 shrink-0">✅</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-500 mb-2">Минусы</p>
                  <ul className="space-y-1.5">
                    {regime.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-red-500 shrink-0">❌</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Кому подходит</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{regime.whoFor}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Кому НЕ подходит</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{regime.whoNotFor}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reporting' && (
              <div className="space-y-3">
                <ul className="space-y-2">
                  {regime.reporting.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Calendar className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Как зарегистрироваться</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{regime.registration}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Обязательные расходы в год</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{regime.fixedExpenses}</p>
                </div>
              </div>
            )}

            {activeTab === 'laws' && <TaxLawsTab laws={regime.laws} />}

            {/* Warnings */}
            {regime.warnings.length > 0 && (
              <div className="mt-4 space-y-2">
                {regime.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">{w}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Select button in expanded view */}
            <button
              type="button"
              onClick={() => onSelect(regime.id)}
              className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
              }`}
            >
              {isSelected ? '✓ Этот режим выбран' : 'Выбрать этот режим'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
