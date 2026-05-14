import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, Users, BarChart2, CalendarDays,
  FileText, CheckCircle, ArrowRight, Zap, Star, Sun, Moon,
} from 'lucide-react'
import { useThemeStore } from '../store/themeStore'

const features = [
  {
    icon: ClipboardList,
    title: 'Учёт заказов',
    desc: 'Все заказы в одном месте. Статусы, суммы, дедлайны — ничего не потеряете.',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: Users,
    title: 'База клиентов',
    desc: 'История заказов каждого клиента. Звоните прямо из приложения одним касанием.',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: BarChart2,
    title: 'Финансы',
    desc: 'Видите сколько заработали, что в работе и кто ещё не доплатил.',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    icon: CalendarDays,
    title: 'Календарь работ',
    desc: 'Видите свою загрузку на месяц. Удобно планировать новые заказы.',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: FileText,
    title: 'Счета и акты PDF',
    desc: 'Профессиональные документы одной кнопкой. Клиентам импонирует.',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: Zap,
    title: 'Быстрый старт',
    desc: 'Регистрация за 30 секунд. Первый заказ добавите за 1 минуту.',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
]

const benefits = [
  'Не теряете заказы и клиентов',
  'Знаете где ваши деньги и что должны вам',
  'Выглядите профессионально перед клиентом',
  'Работает на телефоне и компьютере',
  'Никаких таблиц и бумажек',
]

const freeFeatures    = ['До 10 заказов', '1 пользователь', 'Все основные функции', 'Без PDF-документов']
const monthlyFeatures = ['Безлимитные заказы', 'PDF счета и акты', 'Поделиться с клиентом', 'Поддержка']
const yearlyFeatures  = ['Всё из Про', 'Приоритетная поддержка', 'Выгоднее на 31%', 'Обновления включены']

const reviews = [
  { name: 'Андрей К.', role: 'Сварщик', text: 'Раньше вёл заказы в тетради. Теперь всё в телефоне. Долги клиентов не теряются — это главное.' },
  { name: 'Ольга М.', role: 'ИП, отделочные работы', text: 'Отправляю клиентам PDF счета — они в шоке что это так профессионально. Доверие растёт.' },
  { name: 'Дмитрий В.', role: 'Мастер по мебели', text: 'Календарь помог понять что я беру слишком много заказов. Стал зарабатывать больше.' },
]

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { dark, toggle } = useThemeStore()

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">МД</span>
            </div>
            <span className="font-bold text-lg">МастерДело</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Переключить тему"
            >
              {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hidden sm:block px-3 py-1.5"
            >
              Войти
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Начать бесплатно
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }}
        />
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm font-medium mb-6">
            <Zap className="h-3.5 w-3.5" />
            CRM для мастеров и небольших мастерских
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Все заказы под контролем.<br />
            <span className="text-indigo-200">Ничего не теряется.</span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Ведите заказы, клиентов и финансы в одном месте.
            Выставляйте счета в PDF. Видите загрузку в календаре.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-colors text-lg shadow-xl shadow-indigo-900/30 flex items-center gap-2 justify-center"
            >
              Попробовать бесплатно
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white/15 backdrop-blur text-white font-semibold rounded-2xl hover:bg-white/25 transition-colors text-lg border border-white/30"
            >
              Уже есть аккаунт
            </button>
          </div>
          <p className="text-indigo-300 text-sm mt-5">Регистрация бесплатна. Кредитная карта не нужна.</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Всё что нужно мастеру</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Никаких лишних функций. Только то, что реально нужно в работе.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg dark:hover:shadow-slate-900 transition-shadow"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.iconBg}`}>
                <f.icon className={`h-5 w-5 ${f.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold mb-4">
                Перестаньте терять заказы и деньги
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                Мастера теряют до 20% прибыли из-за неучтённых задолженностей и забытых заказов.
                МастерДело решает эту проблему.
              </p>
              <ul className="space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 text-sm">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white">
              <h3 className="text-base font-bold mb-4 text-indigo-100">Типичный день с МастерДело</h3>
              <div className="space-y-3">
                {[
                  ['☀️', 'Открываете — видите 3 заказа на сегодня'],
                  ['📞', 'Позвонил клиент — одним касанием создали заказ'],
                  ['🔧', 'Завершили работу — сменили статус «Готово»'],
                  ['📄', 'Клиент просит документ — отправили PDF за 5 сек'],
                  ['💰', 'Вечер — проверили сколько заработали за месяц'],
                ].map(([emoji, text]) => (
                  <div key={text} className="flex items-start gap-3 text-sm">
                    <span className="text-base shrink-0">{emoji}</span>
                    <span className="text-indigo-100">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-extrabold text-center mb-10">Что говорят мастера</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div key={r.name} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">«{r.text}»</p>
              <div>
                <p className="font-semibold text-sm">{r.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold mb-3">Простые цены</h2>
            <p className="text-slate-500 dark:text-slate-400">Без скрытых платежей и ежемесячных подписок.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {/* Free */}
            <div className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <p className="font-bold text-slate-400 text-sm uppercase tracking-wide mb-2">Бесплатно</p>
              <p className="text-3xl font-extrabold mb-1">0 ₽</p>
              <p className="text-slate-400 text-sm mb-5">навсегда</p>
              <ul className="space-y-2 mb-6">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 rounded-xl border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors text-sm"
              >
                Начать бесплатно
              </button>
            </div>
            {/* Monthly */}
            <div className="p-6 rounded-2xl border-2 border-indigo-600 bg-indigo-600 text-white relative overflow-hidden">
              <p className="font-bold text-indigo-200 text-sm uppercase tracking-wide mb-2">Про</p>
              <p className="text-3xl font-extrabold mb-0.5">500 ₽</p>
              <p className="text-indigo-300 text-sm mb-5">в месяц</p>
              <ul className="space-y-2 mb-6">
                {monthlyFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-indigo-100">
                    <CheckCircle className="h-4 w-4 text-indigo-300 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 rounded-xl bg-white text-indigo-700 font-bold hover:bg-indigo-50 transition-colors text-sm"
              >
                Подключить за 500 ₽
              </button>
            </div>
            {/* Yearly */}
            <div className="p-6 rounded-2xl border-2 border-violet-600 bg-gradient-to-br from-violet-600 to-indigo-700 text-white relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ВЫГОДНО
              </div>
              <p className="font-bold text-violet-200 text-sm uppercase tracking-wide mb-2">Про Год</p>
              <p className="text-3xl font-extrabold mb-0.5">5 000 ₽</p>
              <p className="text-violet-300 text-sm mb-1">в год</p>
              <p className="text-xs text-violet-300 mb-5">≈ 417 ₽/мес — экономия 31%</p>
              <ul className="space-y-2 mb-6">
                {yearlyFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-violet-100">
                    <CheckCircle className="h-4 w-4 text-violet-300 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 rounded-xl bg-white text-violet-700 font-bold hover:bg-violet-50 transition-colors text-sm"
              >
                Подключить за 5 000 ₽
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Начните прямо сейчас</h2>
          <p className="text-indigo-200 mb-8 text-lg">Регистрация за 30 секунд. Кредитная карта не нужна.</p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-colors text-lg shadow-xl"
          >
            Попробовать бесплатно →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">МД</span>
            </div>
            <span className="text-slate-300 font-semibold">МастерДело</span>
          </div>
          <p>© 2026 МастерДело. Сделано для мастеров.</p>
        </div>
      </footer>
    </div>
  )
}
