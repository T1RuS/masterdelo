import React, { useState } from 'react'
import { Scale } from 'lucide-react'
import { taxRegimes } from '../../data/taxRegimes'
import { TaxRegimeCard } from './TaxRegimeCard'
import { TaxComparisonTable } from './TaxComparisonTable'

interface Props {
  currentRegime: string | null | undefined
  onSelect: (id: string) => Promise<void>
}

export const TaxRegimeSelector: React.FC<Props> = ({ currentRegime, onSelect }) => {
  const [pending, setPending] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    if (id === currentRegime) return
    setConfirming(id)
  }

  const confirmSelect = async () => {
    if (!confirming) return
    setPending(confirming)
    setConfirming(null)
    try {
      await onSelect(confirming)
    } finally {
      setPending(null)
    }
  }

  const selectedRegime = taxRegimes.find((r) => r.id === currentRegime)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Ваш налоговый режим</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Выберите систему налогообложения — мы покажем правильные подсказки в счетах
        </p>
        {selectedRegime && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-300 font-medium">
            Текущий режим: {selectedRegime.name}
          </div>
        )}
      </div>

      {/* Comparison table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Быстрое сравнение</h3>
        <TaxComparisonTable selectedId={currentRegime} />
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {taxRegimes.map((regime) => (
          <TaxRegimeCard
            key={regime.id}
            regime={regime}
            isSelected={currentRegime === regime.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Confirm modal */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirming(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 mx-4 w-full max-w-sm animate-slide-up sm:animate-none">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
              Выбрать «{taxRegimes.find((r) => r.id === confirming)?.name}»?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Это только для вашей статистики в МастерДело — не меняет ваш реальный статус в ФНС.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mb-4">
              Выбор в МастерДело не регистрирует вас в ФНС. Для смены реального режима — обратитесь в налоговую.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={confirmSelect}
                disabled={!!pending}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {pending ? 'Сохраняем...' : 'Выбрать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Важно</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Информация актуальна на май 2026 года и носит ознакомительный характер. Налоговое законодательство России меняется.
          Перед выбором режима проконсультируйтесь с бухгалтером или на сайте ФНС:{' '}
          <a href="https://nalog.gov.ru" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
            nalog.gov.ru
          </a>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Выбор режима в МастерДело — только для отображения правильных подсказок в счетах. Он не меняет ваш реальный статус в ФНС.
        </p>
      </div>
    </div>
  )
}
