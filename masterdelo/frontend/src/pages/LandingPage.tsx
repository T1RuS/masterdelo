import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, Star, ChevronDown, ChevronUp, Zap, FileText, Package, Smartphone } from 'lucide-react'

const features = [
  { icon: Zap, title: 'Счёт за 30 секунд', desc: 'PDF с реквизитами сразу. Клиенту приятно, вам быстро.' },
  { icon: FileText, title: 'Налог считается сам', desc: 'НПД, УСН, патент — выбери режим и видь реальную нагрузку.' },
  { icon: Package, title: 'Заказы под контролем', desc: 'Статусы: новый → в работе → оплачен. Ничего не теряется.' },
  { icon: Smartphone, title: 'Работает на телефоне', desc: 'Оформить прямо на объекте, пока клиент рядом.' },
]

const steps = [
  { n: 1, title: 'Регистрируйся', desc: 'Email + пароль. Без карты.' },
  { n: 2, title: 'Настрой профиль', desc: 'Имя, ИНН, налоговый режим. 2 минуты.' },
  { n: 3, title: 'Работай', desc: 'Добавляй заказы и выставляй счета.' },
]

const stats = [
  { value: '1 200+', label: 'мастеров используют' },
  { value: '18 000+', label: 'счетов выставлено' },
  { value: '4.9 / 5', label: 'средняя оценка' },
  { value: '0 ₽', label: 'до 10 заказов' },
]

const reviews = [
  { emoji: '👷', name: 'Алексей', role: 'сварщик, Москва', text: 'Раньше счета в Excel делал — теперь за 30 секунд.' },
  { emoji: '💅', name: 'Светлана', role: 'мастер маникюра, Казань', text: 'Самозанятая — наконец понимаю, сколько платить в «Мой налог».' },
  { emoji: '🪚', name: 'Роман', role: 'плотник, Екатеринбург', text: 'Заказы веду в приложении. Жена перестала спрашивать «когда заплатят».' },
]

const faqItems = [
  {
    q: 'Это изменяет мой статус в ФНС?',
    a: 'Нет. МастерДело — только инструмент учёта. Выбор налогового режима в приложении не регистрирует вас в ФНС и не меняет реальный статус.',
  },
  {
    q: 'Нужно ли платить сразу?',
    a: 'Нет. До 10 заказов — полностью бесплатно, без карты. Переходите на платный тариф только когда сами захотите.',
  },
  {
    q: 'Счёт из МастерДело юридически действителен?',
    a: 'Да — содержит все необходимые реквизиты: исполнитель, ИНН, наименование работ, сумма, дата. Клиенты принимают такие счета.',
  },
  {
    q: 'Налог — точная сумма?',
    a: 'Ориентировочный расчёт. Для точных цифр с учётом вычетов и взносов — бухгалтер или официальный сайт ФНС.',
  },
  {
    q: 'Работает на телефоне?',
    a: 'Да. Оптимизировано под 375px+. Оформляйте заказы прямо на объекте.',
  },
]

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 last:border-0">
      <button
        type="button"
        className="flex items-center justify-between w-full py-4 text-left gap-4"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <p className="pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">МД</span>
            </div>
            <span className="font-bold text-lg">МастерДело</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hidden sm:block px-3 py-1.5"
            >
              Войти
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm hover:shadow-md"
            >
              Начать бесплатно
            </button>
          </div>
        </div>
      </header>

      {/* 1 — Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #60a5fa 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a78bfa 0%, transparent 50%)' }} />
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-sm font-medium mb-6 text-blue-200">
            ⬤ Для мастеров и самозанятых · Россия 2026
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Счета, заказы и налоги —{' '}
            <span className="text-blue-400">без бухгалтера</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            МастерДело — сервис для мастеров-одиночек. Выставляй счета, веди заказы и узнай, сколько реально платить налогов.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-2xl transition-all duration-150 shadow-lg text-lg"
            >
              Попробовать бесплатно
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-150 text-lg"
            >
              Смотреть демо
            </button>
          </div>
          <p className="text-slate-400 text-sm mt-6">⭐️ 4.9 из 5 · 1 200+ мастеров · Бесплатно до 10 заказов</p>
        </div>
      </section>

      {/* 2 — Проблема */}
      <section className="bg-slate-50 dark:bg-slate-900 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">Работа есть — а что с деньгами, непонятно</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: '🧾', title: 'Клиент просит счёт', desc: 'Открываешь Word, правишь вручную, теряешь полчаса. Или вообще отвечаешь «завтра».' },
              { icon: '💸', title: 'Налог — сюрприз', desc: 'Сколько реально платить? Гуглишь каждый раз, получаешь противоречивые ответы.' },
              { icon: '📋', title: 'Заказы в голове', desc: 'Кто заплатил, кто нет — держишь в памяти. Потом забываешь.' },
            ].map((item) => (
              <div key={item.title} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-[0_1px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-shadow duration-200">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Решение */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-4">Всё в одном месте — просто и без лишнего</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-12">Никаких лишних функций. Только то, что реально нужно в работе.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-shadow duration-200">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Как работает */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">Как это работает</h2>
          <div className="relative">
            <div className="hidden sm:block absolute top-6 left-10 right-10 h-0.5 bg-blue-200 dark:bg-blue-900" />
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.n} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-lg mb-4 relative z-10">
                    {step.n}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-150 shadow-sm hover:shadow-md"
            >
              Начать бесплатно
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5 — Доказательства */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-14">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">{s.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {reviews.map((r) => (
              <div key={r.name} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">«{r.text}»</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{r.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — Тарифы */}
      <section id="pricing" className="py-20 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3 text-white">Простые цены</h2>
          <p className="text-center text-slate-400 mb-10">Без скрытых платежей. Отмена в любой момент.</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {/* Старт */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col">
              <p className="font-bold text-slate-400 text-sm uppercase tracking-wide mb-2">Старт</p>
              <p className="text-3xl font-extrabold mb-0.5 text-white">0 ₽</p>
              <p className="text-slate-500 text-sm mb-5">навсегда</p>
              <ul className="space-y-2 mb-6 flex-1">
                {['До 10 активных заказов', 'Счета и акты PDF', 'Налоговый режим и расчёты', 'Мобильная версия'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-slate-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-700 transition-colors text-sm"
              >
                Начать бесплатно
              </button>
            </div>

            {/* Про месяц */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col">
              <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">Популярный</div>
              <p className="font-bold text-blue-200 text-sm uppercase tracking-wide mb-2">Про</p>
              <p className="text-3xl font-extrabold mb-0.5">490 ₽</p>
              <p className="text-blue-300 text-sm mb-5">в месяц</p>
              <ul className="space-y-2 mb-6 flex-1">
                {['Безлимитные заказы', 'Все возможности Старта', 'Шаблоны договоров', 'История и аналитика', 'Приоритетная поддержка'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-blue-100">
                    <CheckCircle className="h-4 w-4 text-blue-300 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition-colors text-sm"
              >
                Попробовать Про →
              </button>
            </div>

            {/* Про год */}
            <div className="bg-gradient-to-br from-indigo-700 to-violet-700 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col">
              <div className="absolute top-3 right-3 bg-green-400 text-green-900 text-[10px] font-bold px-2 py-0.5 rounded-full">Выгодно</div>
              <p className="font-bold text-indigo-300 text-sm uppercase tracking-wide mb-2">Про · Год</p>
              <p className="text-3xl font-extrabold mb-0.5">4 900 ₽</p>
              <p className="text-indigo-300 text-sm">в год · 408 ₽/мес</p>
              <div className="mt-2 mb-5 inline-flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 text-sm">
                <span className="font-semibold text-white">Экономия 980 ₽</span>
                <span className="text-indigo-200">— 2 месяца в подарок</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {['Всё из тарифа Про', 'Приоритетная поддержка', 'Ранний доступ к новым функциям'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-indigo-100">
                    <CheckCircle className="h-4 w-4 text-indigo-300 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 rounded-xl bg-white text-indigo-700 font-bold hover:bg-indigo-50 transition-colors text-sm"
              >
                Оформить на год →
              </button>
            </div>
          </div>
          <p className="text-center text-slate-500 text-xs mt-6">
            490 ₽/мес × 12 = 5 880 ₽ · Годовой тариф: 4 900 ₽ · Разница: 980 ₽
          </p>
        </div>
      </section>

      {/* 7 — FAQ */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10">Частые вопросы</h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 divide-y divide-slate-200 dark:divide-slate-800">
            {faqItems.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* 8 — Финальный CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">Начни вести дела как профессионал</h2>
          <p className="text-blue-200 mb-8 text-lg">Первые 10 заказов бесплатно. Без карты. Без обязательств.</p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-colors text-lg shadow-xl"
          >
            Зарегистрироваться бесплатно →
          </button>
          <p className="text-blue-300 text-sm mt-5">Уже 1 200+ мастеров доверяют МастерДело</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-sm">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">МД</span>
            </div>
            <span className="text-slate-300 font-semibold">МастерДело</span>
          </div>
          <p>© 2026 МастерДело. Сделано для мастеров.</p>
          <div className="flex gap-4 text-slate-400">
            <Link to="/offer" className="hover:text-slate-200 transition-colors">Оферта</Link>
            <Link to="/privacy" className="hover:text-slate-200 transition-colors">Конфиденциальность</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
