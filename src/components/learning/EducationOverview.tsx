import { LevelCard } from '../widgets/LevelCard';
import { RewardChip } from "../RewardChip";
import { ChartLineAscMIcon } from "@alfalab/icons-glyph/ChartLineAscMIcon";
import { ChevronDownMIcon } from "@alfalab/icons-glyph/ChevronDownMIcon";
import * as React from "react";
import { Button } from "@alfalab/core-components/button";
import { MetricValue } from "../Typography";
import { StatusTag } from "../PagePrimitives";
import { portalDataProvider } from "../../data/portalDataProvider";
import type { DashboardData } from "../../data/provider";
import { FlameSIcon } from "@alfalab/icons-glyph/FlameSIcon";
import { LightningMIcon } from "@alfalab/icons-glyph/LightningMIcon";
import { StepProgress } from "../widgets/WidgetPrimitives";
import {
  EduPlatform,
  EduInvestorHome,
  EduDailyCourses,
  EduAllCourses,
  EduAverage,
  EduCompletedCount,
} from "./EducationData";
import {
  EduIcon,
  EduDebt,
  EduResources,
  EduURL,
  EduLink,
  EduProgress,
  EduBadge,
  EduKitProgress,
  EduHeadingKit,
  EduRemember,
} from "./EducationShared";
import { EduEventsPanel } from "./EducationCatalogs";

export function EduDialog({
  type,
  onClose,
}: {
  type: string;
  onClose: () => void;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  React.useEffect(() => {
    const dialog = ref.current,
      previous = document.activeElement;
    if (!dialog) return;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      dialog.close();
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={"edu-dialog"}
      aria-labelledby={"edu-dialog-title"}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current!.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className={"edu-dialog__head"}>
        <h2 id={"edu-dialog-title"}>
          {type === "progress"
            ? "Как считается прогресс"
            : "Награды за обучение"}
        </h2>
        <Button
          size={32}
          view={"transparent"}
          aria-label={"Закрыть окно"}
          onClick={onClose}
        >
          <EduIcon name={"close"} />
        </Button>
      </div>
      {type === "progress" ? (
        <React.Fragment>
          <p>
            {
              "Среднее арифметическое процентов прохождения всех назначенных курсов, округлённое до целого. Тестирования учитываются отдельно."
            }
          </p>
          <div className={"edu-dialog__metric"}>
            <MetricValue variant={"display"}>
              {EduAverage}
              {"%"}
            </MetricValue>
            <span>
              {EduCompletedCount}
              {" из "}
              {EduAllCourses.length}
              {" курсов завершено"}
            </span>
          </div>
          <div className={"edu-average-list"}>
            {EduAllCourses.map((c) => (
              <div key={c.id}>
                <span>{c.title}</span>
                <strong>
                  {c.progress}
                  {"%"}
                </strong>
              </div>
            ))}
          </div>
          <p className={"edu-muted"}>
            {"Данные Альфа People на "}
            {EduPlatform.asOf}
            {". Открытие курса не меняет его прогресс."}
          </p>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p>
            {
              "Инвест-коины начисляются за подтверждённый результат, а не за переход к материалу."
            }
          </p>
          <div className={"edu-rule-list"}>
            <div>
              <EduIcon name={"check"} />
              <span>
                <strong>{"Курсы и тестирования"}</strong>
                {
                  "Нужен результат прохождения в Альфа People. Для теста — достижение проходного балла."
                }
              </span>
            </div>
            <div>
              <EduIcon name={"calendar"} />
              <span>
                <strong>{"Мероприятия"}</strong>
                {
                  "Регистрация не равна участию. Условия конкретной награды указаны в программе события."
                }
              </span>
            </div>
            <div>
              <EduIcon name={"gift"} />
              <span>
                <strong>{"Челлендж «Чистая неделя»"}</strong>
                {
                  "Завершите курс недели и закройте все просроченные обязательные материалы. Награда — 80 инвест-коинов после подтверждения."
                }
              </span>
            </div>
          </div>
          <div className={"edu-soft-note"}>
            {
              "Повторное открытие материала не создаёт новое начисление. Баланс инвест-коинов общий для всего портала."
            }
          </div>
        </React.Fragment>
      )}
      <Button size={40} view={"secondary"} onClick={onClose}>
        {"Понятно"}
      </Button>
    </dialog>
  );
}

export function EduDailyCard({ dashboard = false }) {
  const c = EduDailyCourses[0];
  if (dashboard)
    return (
      <article className={"widget edu-daily-home"} aria-label={"Daily Invest"}>
        <EduHeadingKit
          action={
            <EduLink
              href={EduPlatform.home}
              external={true}
              size={32}
            >
              {"Мое обучение"}
            </EduLink>
          }
        >
          {"Daily Invest"}
        </EduHeadingKit>
        <div className={"edu-daily-home__date"}>
          <StatusTag tone={"violet"}>
            {c.start}
            {"–"}
            {c.end}
          </StatusTag>
        </div>
        <p className={"edu-daily-home__kind"}>
          {"Ежедневное обучение по Daily Invest"}
        </p>
        <h2>{c.theme}</h2>
        <div className={"dashboard-progress-slot edu-daily-home__progress"}>
          <StepProgress
            completed={c.completedDays}
            total={c.totalDays}
            label={`Прогресс недели: ${c.completedDays} из ${c.totalDays} микролёрнингов`}
          />
          <div className={"edu-daily-home__progress-caption"}>
            <span>{"Прогресс недели"}</span>
            <strong>
              {c.completedDays}
              {" из "}
              {c.totalDays}
            </strong>
          </div>
        </div>
      </article>
    );
  return (
    <section className={"section-card edu-daily-card"} id={"edu-daily"}>
      <EduHeadingKit
        action={
          <EduLink href={EduPlatform.home} external={true} size={32}>
            {"Мое обучение"}
          </EduLink>
        }
      >
        {"Daily Invest"}
      </EduHeadingKit>
      <div className={"edu-daily-identity"}>
        <EduBadge tone={"violet"}>
          <EduIcon name={"book"} size={24} />
        </EduBadge>
        <div>
          <span className={"edu-muted"}>
            {"Курс недели · "}
            {c.period}
          </span>
          <h2>{c.topic}</h2>
        </div>
      </div>
      <div className={"edu-inline-tags"}>
        <StatusTag tone={"violet"}>{"В процессе"}</StatusTag>
        <StatusTag>{"Обязательный курс"}</StatusTag>
      </div>
      <p className={"edu-daily-desc"}>
        {
          "Короткие материалы по продукту и задания для закрепления. Продолжите с места остановки."
        }
      </p>
      <EduProgress value={c.progress} label={"Пройдено"} />
      <div className={"edu-due"}>
        <EduIcon name={"calendar"} size={16} />
        <span>
          {"Завершить до "}
          {c.due}
          {" МСК"}
        </span>
      </div>
      <div className={"edu-daily-tail"}>
        <EduLink
          href={c.url}
          external={true}
          view={"primary"}
          title={
            "Откроется «Моё обучение» в Альфа People. Выберите Daily Invest 14.09–18.09."
          }
        >
          {"Продолжить"}
        </EduLink>
      </div>
    </section>
  );
}

export function EduChallenge({ onRules }: { onRules: () => void }) {
  const c = EduDailyCourses[0];
  return (
    <section className={"section-card edu-challenge"}>
      <EduHeadingKit
        action={
          <EduLink
            href={"?role=mass&section=games"}
            size={32}
            aria-label={"Все игровые активности"}
          >
            <EduIcon size={16} />
          </EduLink>
        }
      >
        {"Учебный челлендж"}
      </EduHeadingKit>
      <div className={"edu-challenge-title"}>
        <EduBadge tone={"orange"}>
          <EduIcon name={"flame"} size={23} />
        </EduBadge>
        <div>
          <h2>{"Чистая неделя"}</h2>
          <span className={"edu-muted"}>{"14–18 сентября"}</span>
        </div>
      </div>
      <p>
        {"Завершите курс недели и закройте долги по обязательному обучению."}
      </p>
      <div className={"edu-challenge-step"}>
        <span className={"edu-step-circle is-overdue"}>
          <EduIcon name={"alert"} size={16} />
        </span>
        <div>
          <strong>{"Закрыть долг Daily Invest"}</strong>
          <small>{"31.08–04.09 · осталось 60%"}</small>
        </div>
      </div>
      <div className={"edu-challenge-step"}>
        <span className={"edu-step-circle"} />
        <div>
          <strong>{"Пройти текущий курс"}</strong>
          <small>
            {c.period}
            {" · пройдено "}
            {c.progress}
            {"%"}
          </small>
        </div>
      </div>
      <div className={"edu-challenge-reward"}>
        <RewardChip>{"+80"}</RewardChip>
        <span>{"Можно получить"}</span>
      </div>
      <Button
        size={40}
        view={"secondary"}
        block={true}
        onClick={() =>
          document
            .getElementById("edu-daily")
            ?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      >
        {"Продолжить обучение"}
      </Button>
      <Button
        size={32}
        view="transparent"
        className={"edu-text-control"}
        onClick={onRules}
      >
        <EduIcon name={"info"} size={15} />
        {"Как начисляются награды"}
      </Button>
    </section>
  );
}

export function EduRecommendations() {
  const materials = [
    {
      title: "Как построить разговор о НСЖ",
      reason: "По теме текущего Daily Invest",
      type: "Памятка",
      icon: "book",
      href: "?role=mass&section=knowledge&material=nsj%3Aconversation",
      desc: "Последовательность вопросов и аргументы для встречи.",
    },
    {
      title: "НСЖ: ответы на частые вопросы",
      reason: "Для подготовки к тестированию",
      type: "База знаний",
      icon: "check",
      href: "?role=mass&section=knowledge&material=nsj%3Aobjections",
      desc: "Разберите условия, которые чаще всего уточняют клиенты.",
    },
    {
      title: "ПДС: вопросы эксперту",
      reason: "После воркшопа по ПДС",
      type: "Разбор",
      icon: "book",
      href: EduURL("invest-class", { item: "pds-questions" }),
      desc: "Евгений Воронков — о продукте и клиентских ситуациях.",
    },
  ];
  return (
    <section
      className={"edu-recommendations"}
      aria-label={"Материалы по темам обучения"}
    >
      <div className={"edu-recommendation-grid"}>
        {materials.map((m) => (
          <a
            key={m.title}
            className={"section-card edu-recommendation"}
            href={m.href}
            onClick={EduRemember}
          >
            <div className={"edu-recommendation-top"}>
              <EduBadge tone={"blue"}>
                <EduIcon name={m.icon} />
              </EduBadge>
              <span>{m.type}</span>
            </div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
            <div className={"edu-reason"}>
              <span>{m.reason}</span>
              <EduIcon size={15} />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function EduProgressHelp() {
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  React.useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        root.current?.querySelector("button")?.focus();
      }
    };
    const focusOut = (event: FocusEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    document.addEventListener("focusin", focusOut);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("focusin", focusOut);
    };
  }, [open]);
  return (
    <div ref={root} className={"focus-changes edu-summary-help"}>
      <Button
        type={"button"}
        size={32}
        view={"transparent"}
        className={"focus-changes__control edu-summary-help-control"}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        rightAddons={
          <ChevronDownMIcon
            aria-hidden={"true"}
            width={16}
            height={16}
            className={"focus-changes__chevron" + (open ? " is-expanded" : "")}
          />
        }
      >
        {"Результат ещё не обновился?"}
      </Button>
      <div
        id={id}
        className={
          "focus-changes__content edu-summary-help-content" +
          (open ? " is-expanded" : "")
        }
        aria-hidden={!open}
      >
        <p>
          {
            "Проверьте, что курс завершён в Альфа People. Здесь показан результат на момент последнего получения данных. Сам переход к обучению не меняет прогресс."
          }
        </p>
        <EduLink
          href={EduPlatform.home}
          external={true}
          size={32}
          tabIndex={open ? 0 : -1}
        >
          {"Проверить в Альфа People"}
        </EduLink>
      </div>
    </div>
  );
}

export function EduSummary({ onProgress }: { onProgress: () => void }) {
  return (
    <section
      className={"section-card edu-summary"}
      aria-label={"Прогресс обучения"}
    >
      <div className={"edu-summary-heading"}>
        <h2 className={"edu-summary-label"}>
          {"Среднее прохождение "}
          <Button
            size={32}
            view="transparent"
            type={"button"}
            onClick={onProgress}
            aria-label={"Как считается средний процент прохождения"}
          >
            <EduIcon name={"info"} size={16} />
          </Button>
        </h2>
        <EduProgressHelp />
      </div>
      <div className={"edu-summary-metrics"}>
        <div className={"edu-summary-main"}>
          <div
            className={"edu-ring"}
            style={
              {
                "--edu-progress": EduAverage + "%",
              } as React.CSSProperties
            }
            aria-label={`Среднее прохождение ${EduAverage}%`}
          >
            <strong>
              {EduAverage}
              <small>{"%"}</small>
            </strong>
          </div>
          <div>
            <p>
              {EduCompletedCount}
              {" из "}
              {EduAllCourses.length}
              {" курсов завершено"}
            </p>
            <small>
              {"Данные на "}
              {EduPlatform.asOf}
            </small>
          </div>
        </div>
        <div className={"edu-summary-stat"}>
          <strong>
            {EduDailyCourses[0].progress}
            <span>{"%"}</span>
          </strong>
          <span>{"Daily Invest недели"}</span>
        </div>
        <a
          href={EduPlatform.overdue}
          target={"_blank"}
          rel={"noopener noreferrer"}
          className={"edu-summary-stat is-debt"}
        >
          <strong>{"1"}</strong>
          <span>
            {"Долг по обучению "}
            <EduIcon name={"chevron"} size={12} />
          </span>
        </a>
      </div>
    </section>
  );
}

export function EduPage() {
  const [dialog, setDialog] = React.useState<string | null>(null);
  const dashboard = portalDataProvider.getDashboard("mass");
  React.useEffect(() => {
    document.title = "Обучение · ГИПС";
  }, []);
  return (
    <div className={"section-page edu-page"}>
      <h1 className={"sr-only"}>{"Обучение"}</h1>
      <div className={"edu-layout"}>
        <div className={"edu-main"}>
          <EduSummary onProgress={() => setDialog("progress")} />
          <EduDebt />
          <div className={"edu-work-grid"}>
            <EduDailyCard />
            <EduEventsPanel />
          </div>
          <EduRecommendations />
        </div>
        <aside className={"edu-aside"} aria-label={"Ресурсы и игровой профиль"}>
          <LevelCard level={dashboard.level} />
          <EduResources />
          <EduChallenge onRules={() => setDialog("rewards")} />
        </aside>
      </div>
      {dialog && <EduDialog type={dialog} onClose={() => setDialog(null)} />}
    </div>
  );
}
