import React from 'react'
import { comparisonRows, taxRegimes } from '../../data/taxRegimes'

interface Props {
  selectedId?: string | null
}

const SHORT_NAMES: Record<string, string> = {
  npd: 'Самозанятый',
  usn6: 'УСН 6%',
  usn15: 'УСН 15%',
  psn: 'Патент',
  osno: 'ОСНО',
}

export const TaxComparisonTable: React.FC<Props> = ({ selectedId }) => {
  const cols = taxRegimes.map((r) => ({ id: r.id, name: SHORT_NAMES[r.id] || r.name }))

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[500px] text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 pr-3 font-medium text-slate-500 dark:text-slate-400 w-28"></th>
            {cols.map((col) => (
              <th
                key={col.id}
                className={`py-2 px-2 text-center font-semibold text-xs rounded-t ${
                  selectedId === col.id
                    ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {col.name}
                {selectedId === col.id && (
                  <span className="block text-[10px] text-blue-500 font-normal">выбран</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map((row, i) => (
            <tr
              key={row.label}
              className={i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : ''}
            >
              <td className="py-1.5 pr-3 text-slate-500 dark:text-slate-400 font-medium text-xs whitespace-nowrap">
                {row.label}
              </td>
              {cols.map((col) => (
                <td
                  key={col.id}
                  className={`py-1.5 px-2 text-center text-xs ${
                    selectedId === col.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 font-medium text-blue-800 dark:text-blue-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {row[col.id as keyof typeof row]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
