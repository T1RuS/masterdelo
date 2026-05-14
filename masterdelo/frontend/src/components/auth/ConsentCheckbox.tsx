import React from 'react'
import { Link } from 'react-router-dom'

interface Props {
  consentOffer: boolean
  consentPd: boolean
  onChangeOffer: (v: boolean) => void
  onChangePd: (v: boolean) => void
}

export const ConsentCheckbox: React.FC<Props> = ({
  consentOffer, consentPd, onChangeOffer, onChangePd,
}) => (
  <div className="space-y-3">
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={consentOffer}
        onChange={(e) => onChangeOffer(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
      />
      <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Я принимаю условия{' '}
        <Link to="/offer" target="_blank" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
          Публичной оферты
        </Link>{' '}
        и соглашаюсь с{' '}
        <Link to="/privacy" target="_blank" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
          Политикой обработки персональных данных
        </Link>
        . Мне 18 лет или более.
      </span>
    </label>

    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={consentPd}
        onChange={(e) => onChangePd(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
      />
      <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Я даю согласие на обработку персональных данных в целях, указанных в{' '}
        <Link to="/privacy" target="_blank" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
          Политике конфиденциальности
        </Link>
        , включая получение уведомлений о работе Сервиса.
      </span>
    </label>
  </div>
)
