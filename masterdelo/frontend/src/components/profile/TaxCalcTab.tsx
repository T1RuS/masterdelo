import React from 'react'
import type { TaxCalc } from '../../data/taxRegimes'

interface Props {
  calc: TaxCalc
}

export const TaxCalcTab: React.FC<Props> = ({ calc }) => (
  <div className="space-y-3">
    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
      <span className="font-medium text-slate-700 dark:text-slate-300">Пример: </span>
      {calc.scenario}
    </div>

    <div className="space-y-1.5">
      {calc.steps.map((step, i) => (
        <div key={i} className="flex items-start gap-2 text-sm">
          <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs flex items-center justify-center font-semibold">
            {i + 1}
          </span>
          <div className="flex-1 flex justify-between gap-2 flex-wrap">
            <span className="text-slate-600 dark:text-slate-400">{step.label}</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 shrink-0">{step.value}</span>
          </div>
        </div>
      ))}
    </div>

    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-1">
      <div className="flex justify-between text-sm font-semibold">
        <span className="text-slate-700 dark:text-slate-300">Итого налогов:</span>
        <span className="text-red-600 dark:text-red-400">{calc.totalTax}</span>
      </div>
      <div className="flex justify-between text-sm font-semibold">
        <span className="text-slate-700 dark:text-slate-300">Чистыми на руки:</span>
        <span className="text-green-600 dark:text-green-400">{calc.netIncome}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">Реальная нагрузка:</span>
        <span className="font-medium text-slate-700 dark:text-slate-300">{calc.effectiveRate}</span>
      </div>
    </div>

    {calc.note && (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
        {calc.note}
      </div>
    )}
  </div>
)
