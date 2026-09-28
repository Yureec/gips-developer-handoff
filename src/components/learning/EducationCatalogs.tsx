import * as React from "react";
import { Button } from "@alfalab/core-components/button";
import { EducationInput as Input } from "./EducationShared";
import { Heading } from "../Typography";
import { StatusTag } from "../PagePrimitives";
import { investClassItems, investClassKinds } from "../../data/investClass";
import {
  EduPlatform,
  EduDailyCourses,
  EduTasks,
  EducationEvent,
  EduEvents,
} from "./EducationData";
import {
  EduIcon,
  EduURL,
  EduLink,
  EduProgress,
  EduEmpty,
  EduBadge,
  EduHeadingKit,
  EduRemember,
  EduRegState,
  EduPageBack,
  EduNotFound,
  EducationSelect,
  EducationTabs,
} from "./EducationShared";
import { EduDebt, EduResources } from "./EducationShared";

export function EduTaskRow({
  task: t,
  full = false,
}: {
  task: (typeof EduTasks)[number];
  full?: boolean;
}) {
  const completed = t.status === "completed";
  const label =
    t.kind === "assessment"
      ? "Тестирование"
      : t.kind === "track"
        ? "Траектория"
        : "Курс";
  return (
    <a
      className={"edu-task-row " + (full ? "is-full" : "")}
      href={EduURL("invest-class", { item: t.id })}
      onClick={EduRemember}
    >
      <span className={"edu-task-icon " + (completed ? "is-complete" : "")}>
        <EduIcon
          name={
            completed ? "check" : t.kind === "assessment" ? "check" : "book"
          }
          size={19}
        />
      </span>
      <div className={"edu-task-text"}>
        <div className={"edu-task-meta"}>
          {label}
          {" · "}
          {t.duration}
          {full && t.required ? " · Обязательное" : ""}
        </div>
        <h3>{t.title}</h3>
        <div className={"edu-task-meta"}>
          <span className={completed ? "edu-green" : ""}>
            {completed
              ? `Пройдено ${t.completedAt} · результат ${t.score}%`
              : `До ${t.due}`}
          </span>
          {!completed && t.progress > 0 && (
            <span className={"edu-task-percent"}>
              {t.progress}
              {"% пройдено"}
            </span>
          )}
          {!completed && t.progress === 0 && <span>{"Не начато"}</span>}
        </div>
      </div>
      <EduIcon name={"chevron"} size={16} />
    </a>
  );
}

export function EduEventRow({
  event: e,
  registered,
}: {
  event: EducationEvent;
  registered: boolean;
}) {
  return (
    <article className={"edu-event-row"}>
      <div className={"edu-date-tile"}>
        <strong>{e.day}</strong>
        <span>{e.month}</span>
      </div>
      <div className={"edu-event-body"}>
        <div className={"edu-event-meta"}>
          <StatusTag tone={e.kind === "webinar" ? "violet" : "neutral"}>
            {e.format}
          </StatusTag>
          {e.time && (
            <span>
              {e.time}
              {" МСК · "}
              {e.duration}
            </span>
          )}
          {e.textAvailable && <span>{"Текстовый разбор"}</span>}
        </div>
        <h3>
          <a
            href={EduURL("invest-class", { item: e.id })}
            onClick={EduRemember}
          >
            {e.title}
          </a>
        </h3>
        <p>{e.description}</p>
        <div className={"edu-event-foot"}>
          <EduIcon
            name={e.venue === "Онлайн" ? "video" : "calendar"}
            size={14}
          />
          <span>{e.venue || "Материалы встречи"}</span>
        </div>
      </div>
      <div className={"edu-event-action"}>
        {e.textAvailable ? (
          <StatusTag tone={"green"}>{"Доступен разбор"}</StatusTag>
        ) : e.status === "upcoming" ? (
          registered ? (
            <StatusTag tone={"green"}>{"Вы записаны"}</StatusTag>
          ) : (
            <StatusTag>{"Открыта запись"}</StatusTag>
          )
        ) : (
          <StatusTag>{"Прошедшее"}</StatusTag>
        )}
        <EduLink
          href={EduURL("invest-class", { item: e.id })}
          size={40}
          view={"secondary"}
        >
          {e.textAvailable ? "Читать разбор" : "Подробнее"}
        </EduLink>
      </div>
    </article>
  );
}

export function EduCompactEvent({
  event: e,
  registered,
}: {
  event: EducationEvent;
  registered: boolean;
}) {
  const upcoming = e.status === "upcoming";
  return (
    <a
      className={"edu-compact-event"}
      href={EduURL("invest-class", { item: e.id })}
      onClick={EduRemember}
    >
      <span className={"edu-date-tile"}>
        <strong>{e.day}</strong>
        <span>{e.month}</span>
      </span>
      <span className={"edu-compact-event-body"}>
        <span className={"edu-compact-event-meta"}>
          {e.format}
          {e.time ? ` · ${e.time} МСК` : ""}
        </span>
        <strong>{e.title}</strong>
        <span className={"edu-compact-event-foot"}>
          {e.duration && <span>{e.duration}</span>}
          <span className={upcoming && registered ? "edu-green" : ""}>
            {e.textAvailable
              ? "Читать разбор"
              : upcoming
                ? registered
                  ? "Вы записаны"
                  : "Открыта запись"
                : "Материалы встречи"}
          </span>
        </span>
      </span>
      <EduIcon name={"chevron"} size={16} />
    </a>
  );
}

export function EduEventsPanel({ full = false }) {
  const searchParams = new URLSearchParams(location.search);
  const [tab, setTab] = React.useState(
    full ? searchParams.get("status") || "upcoming" : "upcoming",
  );
  const [format, setFormat] = React.useState(
    full ? searchParams.get("format") || "all" : "all",
  );
  const [query, setQuery] = React.useState(
    full ? searchParams.get("q") || "" : "",
  );
  const [registered, setRegistered] = React.useState(EduRegState);
  React.useEffect(() => {
    const update = () => setRegistered(EduRegState());
    window.addEventListener("focus", update);
    return () => window.removeEventListener("focus", update);
  }, []);
  // Availability is independent of the event date. Published Q&A remains in both lists.
  const list = EduEvents.filter((e) => {
    const inTab =
      tab === "mine"
        ? !e.textAvailable && registered[e.id] && e.status === "upcoming"
        : tab === "upcoming"
          ? e.status === "upcoming"
          : e.status === "past" || e.textAvailable || e.recording === true;
    return (
      inTab &&
      (format === "all" || e.kind === format) &&
      `${e.title} ${e.description} ${e.topic}`
        .toLocaleLowerCase("ru")
        .includes(query.trim().toLocaleLowerCase("ru"))
    );
  }).sort((a, b) => {
    const difference =
      new Date(a.start || a.dateISO || "").getTime() -
      new Date(b.start || b.dateISO || "").getTime();
    return tab === "past" ? -difference : difference;
  });
  const change = (key: string, value: string) => {
    if (key === "status") setTab(value);
    if (key === "format") setFormat(value);
    if (key === "q") setQuery(value);
    if (full) {
      const url = new URL(location.href);
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
      history.replaceState(history.state, "", url);
    }
  };
  const reset = () => {
    setFormat("all");
    setQuery("");
    setTab("upcoming");
    if (full) history.replaceState(history.state, "", EduURL("events"));
  };
  const tabs = [
    ["upcoming", "Ближайшие"],
    ["past", full ? "Материалы и записи" : "Материалы"],
    ["mine", "Мои"],
  ];
  return (
    <section
      className={
        "section-card edu-events-panel " +
        (full ? "is-full" : "edu-events-card")
      }
      id={full ? undefined : "edu-events"}
      aria-label={"Мероприятия и вебинары"}
    >
      {!full && (
        <EduHeadingKit
          action={
            <EduLink href={EduURL("events")} size={32}>
              {"Вся афиша "}
              <EduIcon size={14} />
            </EduLink>
          }
        >
          {"Мероприятия и вебинары"}
        </EduHeadingKit>
      )}
      <div className={"edu-events-toolbar"}>
        <EducationTabs
          options={tabs}
          value={tab}
          onChange={(value) => change("status", value)}
          label="Список мероприятий"
        />
        {full && (
          <EducationSelect
            value={format}
            onValueChange={(value) => change("format", value)}
            aria-label={"Формат мероприятия"}
          >
            <option value={"all"}>{"Все форматы"}</option>
            <option value={"webinar"}>{"Вебинары"}</option>
            <option value={"workshop"}>{"Практикумы"}</option>
            <option value={"interview"}>{"Вопросы и ответы"}</option>
          </EducationSelect>
        )}
      </div>
      {full && (
        <div className={"edu-search"}>
          <EduIcon name={"search"} />
          <Input
            size={40}
            value={query}
            onChange={(e) => change("q", e.target.value)}
            placeholder={"Название, тема или продукт"}
            aria-label={"Поиск мероприятий"}
          />
          {query && (
            <Button
              size={32}
              view="transparent"
              onClick={() => change("q", "")}
              aria-label={"Очистить поиск"}
            >
              <EduIcon name={"close"} size={16} />
            </Button>
          )}
        </div>
      )}
      <div className={"edu-events-results"} aria-live={"polite"}>
        {list.length ? (
          list.map((e) =>
            full ? (
              <EduEventRow key={e.id} event={e} registered={registered[e.id]} />
            ) : (
              <EduCompactEvent
                key={e.id}
                event={e}
                registered={registered[e.id]}
              />
            ),
          )
        ) : (
          <EduEmpty
            title={
              tab === "mine" && !query && format === "all"
                ? "Пока нет записей на мероприятия"
                : "По этим условиям мероприятий нет"
            }
            text={
              tab === "mine"
                ? "Выберите встречу в разделе «Ближайшие»."
                : "Попробуйте другой формат или измените запрос."
            }
            onReset={reset}
          />
        )}
      </div>
    </section>
  );
}

export function EduDailyArchive() {
  const p = new URLSearchParams(location.search);
  const [filter, setFilter] = React.useState(p.get("status") || "all");
  const [query, setQuery] = React.useState(p.get("q") || "");
  const filtered = EduDailyCourses.filter(
    (c) =>
      (filter === "all" ||
        (filter === "current"
          ? c.status === "current"
          : c.status === filter)) &&
      `${c.start} ${c.end} ${c.theme} ${c.topic}`
        .toLocaleLowerCase("ru")
        .includes(query.toLocaleLowerCase("ru")),
  );
  const change = (value: string) => {
    setFilter(value);
    history.replaceState(
      history.state,
      "",
      EduURL("daily", { status: value, q: query }),
    );
  };
  return (
    <div className={"section-page edu-page"}>
      <EduPageBack />
      <header className={"edu-page-heading"}>
        <div>
          <Heading level={1} variant={"page"}>
            {"Daily Invest"}
          </Heading>
          <p>
            {"Назначенные выпуски, прогресс и долги по еженедельному обучению"}
          </p>
        </div>
        <EduLink href={EduPlatform.home} external={true} view={"secondary"}>
          {"Моё обучение"}
        </EduLink>
      </header>
      <EduDebt />
      <section className={"section-card edu-archive"}>
        <div className={"edu-list-toolbar"}>
          <EducationTabs
            options={[
              ["all", "Все выпуски"],
              ["current", "Текущий"],
              ["overdue", "Долги · 1"],
              ["completed", "Пройдено · 4"],
            ]}
            value={filter}
            onChange={change}
            label="Статус курса"
          />
          <div className={"edu-search"}>
            <EduIcon name={"search"} size={18} />
            <Input
              size={40}
              value={query}
              onChange={(_, { value }) => {
                setQuery(value);
                history.replaceState(
                  history.state,
                  "",
                  EduURL("daily", { status: filter, q: value }),
                );
              }}
              placeholder={"Тема или дата"}
              aria-label={"Поиск Daily Invest"}
            />
          </div>
        </div>
        <div className={"edu-di-list"} aria-live={"polite"}>
          {filtered.map((c) => (
            <article key={c.id} className={"edu-di-row"}>
              <div>
                <div className={"edu-inline-tags"}>
                  <StatusTag
                    tone={
                      c.status === "overdue"
                        ? "red"
                        : c.status === "completed"
                          ? "green"
                          : "violet"
                    }
                  >
                    {c.status === "overdue"
                      ? "Долг"
                      : c.status === "completed"
                        ? "Пройдено"
                        : "Курс недели"}
                  </StatusTag>
                  <span className={"edu-muted"}>{c.theme}</span>
                </div>
                <h2>
                  <a href={EduURL("daily-course", { item: c.id })}>
                    {"Daily Invest · "}
                    {c.start}
                    {"–"}
                    {c.end}
                    {".2026"}
                  </a>
                </h2>
                <p>
                  {c.status === "overdue"
                    ? `Срок истёк ${c.due} МСК`
                    : `Срок: ${c.due} МСК`}
                </p>
              </div>
              <EduProgress
                value={c.progress}
                label={"Пройдено"}
                tone={c.status === "completed" ? "is-green" : ""}
              />
              <EduLink
                href={
                  c.status === "overdue"
                    ? c.url
                    : EduURL("daily-course", { item: c.id })
                }
                external={c.status === "overdue"}
                view={c.status === "overdue" ? "primary" : "secondary"}
              >
                {c.status === "overdue"
                  ? "Закрыть долг"
                  : c.progress === 100
                    ? "Результат"
                    : "Подробнее"}
              </EduLink>
            </article>
          ))}
          {!filtered.length && (
            <EduEmpty
              onReset={() => {
                change("all");
                setQuery("");
                history.replaceState(history.state, "", EduURL("daily"));
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export function EduAssignments() {
  const p = new URLSearchParams(location.search);
  const [status, setStatus] = React.useState(p.get("status") || "active");
  const [kind, setKind] = React.useState(p.get("kind") || "all");
  const [query, setQuery] = React.useState(p.get("q") || "");
  const change = (key: string, value: string) => {
    if (key === "status") setStatus(value);
    if (key === "kind") setKind(value);
    if (key === "q") setQuery(value);
    const url = new URL(location.href);
    value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
    history.replaceState(history.state, "", url);
  };
  const list = EduTasks.filter(
    (t) =>
      (status === "all" ||
        (status === "completed"
          ? t.status === "completed"
          : t.status !== "completed")) &&
      (kind === "all" || t.kind === kind) &&
      t.title.toLocaleLowerCase("ru").includes(query.toLocaleLowerCase("ru")),
  );
  return (
    <div className={"section-page edu-page"}>
      <EduPageBack />
      <header className={"edu-page-heading"}>
        <div>
          <Heading level={1} variant={"page"}>
            {"Задания и тестирования"}
          </Heading>
          <p>
            {"Назначенные курсы, проверки знаний и подтверждённые результаты"}
          </p>
        </div>
        <EduLink href={EduURL("daily")}>
          {"Daily Invest "}
          <EduIcon />
        </EduLink>
      </header>
      <section className={"section-card edu-archive"}>
        <div className={"edu-list-toolbar"}>
          <EducationTabs
            options={[
              ["active", "Назначено · 3"],
              ["completed", "Пройдено · 1"],
              ["all", "Все"],
            ]}
            value={status}
            onChange={(value) => change("status", value)}
            label="Статус заданий"
          />
          <EducationSelect
            aria-label={"Тип задания"}
            value={kind}
            onValueChange={(value) => change("kind", value)}
          >
            <option value={"all"}>{"Все типы"}</option>
            <option value={"assessment"}>{"Тестирования"}</option>
            <option value={"course"}>{"Курсы"}</option>
            <option value={"track"}>{"Траектории"}</option>
          </EducationSelect>
        </div>
        <div className={"edu-search"}>
          <EduIcon name={"search"} />
          <Input
            size={40}
            aria-label={"Поиск заданий"}
            placeholder={"Найти задание"}
            value={query}
            onChange={(_, { value }) => change("q", value)}
          />
        </div>
        <div className={"edu-assignment-results"} aria-live={"polite"}>
          {list.map((t) => (
            <EduTaskRow key={t.id} task={t} full={true} />
          ))}
          {!list.length && (
            <EduEmpty
              onReset={() => {
                setStatus("all");
                setKind("all");
                setQuery("");
                history.replaceState(
                  history.state,
                  "",
                  EduURL("assignments", { status: "all" }),
                );
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export function EduEventsPage() {
  return (
    <div className={"section-page edu-page"}>
      <EduPageBack />
      <header className={"edu-page-heading"}>
        <div>
          <Heading level={1} variant={"page"}>
            {"Мероприятия и вебинары"}
          </Heading>
          <p>
            {"Встречи с экспертами, практикумы и материалы прошедших событий"}
          </p>
        </div>
      </header>
      <EduEventsPanel full={true} />
    </div>
  );
}

export function EduDailyDetail() {
  const c = EduDailyCourses.find(
    (c) => c.id === new URLSearchParams(location.search).get("item"),
  );
  if (!c) return <EduNotFound />;
  return (
    <div className={"section-page edu-page"}>
      <EduPageBack label={"К выпускам Daily Invest"} href={EduURL("daily")} />
      <header className={"section-card edu-detail-heading"}>
        <div className={"edu-inline-tags"}>
          <StatusTag tone={"violet"}>{"Daily Invest"}</StatusTag>
          <StatusTag>{c.theme}</StatusTag>
          <StatusTag
            tone={
              c.status === "overdue"
                ? "red"
                : c.status === "completed"
                  ? "green"
                  : "neutral"
            }
          >
            {c.status === "overdue"
              ? "Долг"
              : c.status === "completed"
                ? "Пройдено"
                : "В процессе"}
          </StatusTag>
        </div>
        <Heading level={1} variant={"page"}>
          {"Daily Invest · "}
          {c.start}
          {"–"}
          {c.end}
          {".2026"}
        </Heading>
        <p>{c.topic}</p>
      </header>
      <div className={"edu-detail-layout"}>
        <section className={"section-card edu-detail-body"}>
          <h2>
            {c.status === "overdue"
              ? "Закройте незавершённое обучение"
              : "Обучение в Альфа People"}
          </h2>
          <p>
            {
              "Материалы курса и задания проходят на учебной платформе. На портале доступны ваш прогресс и переход к обучению."
            }
          </p>
          <EduProgress
            value={c.progress}
            label={"Пройдено по данным Альфа People"}
          />
          <div
            className={
              "edu-soft-note " + (c.status === "overdue" ? "is-warning" : "")
            }
          >
            {c.status === "overdue"
              ? `Срок истёк ${c.due} МСК.`
              : c.status === "completed"
                ? "Курс завершён. Результат сохранён в вашем общем прогрессе."
                : `Завершите обучение до ${c.due} МСК.`}
          </div>
          {c.id === "di-3108" && (
            <React.Fragment>
              <h2>{"Следующий незавершённый материал"}</h2>
              <div className={"edu-next-material"}>
                <EduBadge tone={"violet"}>
                  <EduIcon name={"book"} />
                </EduBadge>
                <div>
                  <h3>{"Актуальные коэффициенты: сентябрь 2026"}</h3>
                  <p>{"Статья и проверочный вопрос · около 5 минут"}</p>
                </div>
              </div>
              <p>
                {
                  "Разбор коэффициентов мотивации и пример расчёта суммы, которая зачтётся в план по инвестициям."
                }
              </p>
            </React.Fragment>
          )}
          <EduLink external={true} href={c.url} view={"primary"}>
            {c.status === "overdue"
              ? "Пройти материал"
              : c.status === "completed"
                ? "Открыть в Альфа People"
                : "Продолжить в Альфа People"}
          </EduLink>
          {c.url === EduPlatform.home && (
            <p className={"edu-muted"}>
              {"В разделе «Моё обучение» выберите Daily Invest "}
              {c.start}
              {"–"}
              {c.end}
              {".2026."}
            </p>
          )}
        </section>
        <aside className={"edu-detail-aside"}>
          <section className={"section-card edu-facts"}>
            <h2>{"О курсе"}</h2>
            <dl>
              <div>
                <dt>{"Период"}</dt>
                <dd>
                  {c.period}
                  {" 2026"}
                </dd>
              </div>
              <div>
                <dt>{"Тема недели"}</dt>
                <dd>{c.theme}</dd>
              </div>
              <div>
                <dt>{"Обязательность"}</dt>
                <dd>{"Обязательный курс"}</dd>
              </div>
              <div>
                <dt>{"Результат обновлён"}</dt>
                <dd>{EduPlatform.asOf}</dd>
              </div>
              <div>
                <dt>{"Платформа"}</dt>
                <dd>{"Альфа People"}</dd>
              </div>
            </dl>
          </section>
          <EduResources />
        </aside>
      </div>
    </div>
  );
}

export function EduCatalog() {
  const all = [
    ...investClassItems,
    ...EduEvents.filter((e) => !investClassItems.some((c) => c.id === e.id)),
    ...EduTasks.filter(
      (e) =>
        !investClassItems.some((c) => c.id === e.id) &&
        !EduEvents.some((c) => c.id === e.id),
    ),
  ];
  return (
    <div className={"section-page edu-page"}>
      <EduPageBack />
      <header className={"edu-page-heading"}>
        <div>
          <Heading level={1} variant={"page"}>
            {"Инвест-класс"}
          </Heading>
          <p>{"Учебные траектории, мероприятия и материалы экспертов"}</p>
        </div>
      </header>
      <section
        className={"edu-recommendation-grid"}
        aria-label={"Материалы Инвест-класса"}
      >
        {all.map((e) => (
          <a
            key={e.id}
            className={"section-card edu-recommendation"}
            href={EduURL("invest-class", { item: e.id })}
            onClick={EduRemember}
          >
            <StatusTag>
              {("format" in e ? e.format : undefined) ||
                investClassKinds[e.kind as keyof typeof investClassKinds]}
            </StatusTag>
            <h3>{e.title}</h3>
            <p>{e.description}</p>
            <div className={"edu-reason"}>
              <span>{"Подробнее"}</span>
              <EduIcon />
            </div>
          </a>
        ))}
      </section>
    </div>
  );
}
