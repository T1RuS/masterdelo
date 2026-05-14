import React from 'react'
import { Scale } from 'lucide-react'
import type { Law } from '../../data/taxRegimes'

interface Props {
  laws: Law[]
}

export const TaxLawsTab: React.FC<Props> = ({ laws }) => (
  <div className="space-y-3">
    {laws.map((law, i) => (
      <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-1">
        <div className="flex items-start gap-2">
          <Scale className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 flex-1 min-w-0">
            <a
              href={law.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline leading-tight block"
            >
              {law.name}
            </a>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{law.article}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{law.description}</p>
          </div>
        </div>
      </div>
    ))}

    <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-1">
      Информация актуальна на 2026 год. Проконсультируйтесь с бухгалтером перед выбором.
    </p>
  </div>
)
