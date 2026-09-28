import * as React from "react";
import { Button } from "@alfalab/core-components/button";
import { Heading, MetricValue } from "../Typography";
import { StatusTag } from "../PagePrimitives";
import { investClassItems } from "../../data/investClass";
import { InterviewTranscript, interviewQuestions } from "./InvestClass";
import { EduPlatform, EduTasks, EduEvents } from "./EducationData";
import {
  EduIcon,
  EduURL,
  EduUsePersistentState,
  EduLink,
  EduProgress,
  EduBadge,
  EduCalendar,
  EduPageBack,
  EduNotFound,
  EduRelatedMaterials,
  safeLearningReturn,
} from "./EducationShared";

export function EduDetail() {
  const id = new URLSearchParams(location.search).get("item");
  const original = investClassItems.find((e) => e.id === id),
    event = EduEvents.find((e) => e.id === id),
    task = EduTasks.find((e) => e.id === id);
  const entity = original || event || task;
  const [registered, setRegistered] = EduUsePersistentState(
    "registration." + id,
    !!event?.defaultRegistered,
  );
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  const [back] = React.useState(() => {
    try {
      return safeLearningReturn(
        sessionStorage.getItem(
          `daily-origin:${location.pathname}${location.search}`,
        ) || EduURL(),
      );
    } catch {
      return EduURL();
    }
  });
  React.useEffect(() => {
    if (entity) document.title = entity.title + " · ГИПС";
  }, [id]);
  if (!entity) return <EduNotFound />;
  const isEvent = event && event.kind !== "interview";
  const isText = !!original?.transcript;
  const isTest = task?.kind === "assessment";
  const title = original?.title || entity.title;
  // Only the operational copy changes: the learning itself now lives in LXP.
  // Product descriptions and the expert transcript are kept from the existing portal.
  const courseSectionCopy: Record<string, Record<string, string>> = {
    "investment-arguments": {
      "Состав обучения":
        "В программе семь траекторий. Завершены четыре из семи. Продолжите обучение в Альфа People.",
    },
    "nsj-course": {
      "Материалы перед курсом":
        "На портале доступны условия «Максимума»: взносы, выплаты, страховое покрытие и ограничения. Используйте их для повторения перед продолжением курса в Альфа People.",
    },
  };
  const sections = (
    original?.sections ||
    event?.agenda ||
    task?.sections ||
    []
  ).map((s) => ({
    ...s,
    text: courseSectionCopy[id ?? ""]?.[s.title] || s.text,
  }));
  const links =
    event?.links ||
    original?.links ||
    (task?.material
      ? [
          {
            title: "НСЖ «Максимум» · условия программы",
            href:
              "?role=mass&section=knowledge&material=" +
              encodeURIComponent(task.material),
          },
          {
            title: "НСЖ · ответы на частые вопросы",
            href: "?role=mass&section=knowledge&material=nsj%3Aobjections",
          },
        ]
      : []);
  const kindLabel = isEvent
    ? event.format
    : isText
      ? "Вопросы и ответы"
      : isTest
        ? "Тестирование"
        : task?.kind === "track"
          ? "Учебная траектория"
          : "Дистанционный курс";
  let backLabel = "К обучению";
  try {
    const q = new URL(back, location.href).searchParams;
    if (q.get("section") === "home") backLabel = "На главную";
    else if (q.get("view") === "events") backLabel = "К афише";
    else if (q.get("view") === "assignments") backLabel = "К заданиям";
  } catch {}
  const validBack =
    back.startsWith("?") || back.startsWith(location.pathname + "?")
      ? back
      : EduURL();
  return (
    <div className={"section-page edu-page edu-detail-page"}>
      <EduPageBack label={backLabel} href={validBack} />
      <header className={"section-card edu-detail-heading"}>
        <div className={"edu-detail-heading-top"}>
          <div className={"edu-inline-tags"}>
            <StatusTag tone={"violet"}>{"Инвест-класс"}</StatusTag>
            <StatusTag>{kindLabel}</StatusTag>
            {isEvent && event.status === "past" && (
              <StatusTag>{"Мероприятие завершено"}</StatusTag>
            )}
            {task?.status === "completed" && (
              <StatusTag tone={"green"}>{"Пройдено"}</StatusTag>
            )}
          </div>
        </div>
        <Heading level={1} variant={"page"}>
          {title}
        </Heading>
        <p>{entity.description}</p>
        {isText && (
          <div className={"edu-detail-meta"}>
            <span>
              <EduIcon name={"calendar"} />
              {event?.date || original.date}
            </span>
            <span>
              <EduIcon name={"book"} />
              {"Текстовый разбор"}
            </span>
          </div>
        )}
        {isEvent && (
          <div className={"edu-detail-meta"}>
            <span>
              <EduIcon name={"calendar"} />
              {event.date}
            </span>
            <span>
              <EduIcon name={"clock"} />
              {event.duration}
            </span>
            <span>
              <EduIcon name={"video"} />
              {event.venue === "Онлайн" ? "Онлайн" : event.venue}
            </span>
          </div>
        )}
      </header>
      <div className={"edu-detail-layout"}>
        <div className={"edu-detail-main"}>
          {isText ? (
            <section className={"section-card edu-detail-body edu-interview"}>
              <EduTranscript text={original.transcript!} />
            </section>
          ) : (
            <section className={"section-card edu-detail-body"}>
              <h2>
                {isEvent
                  ? event.status === "upcoming"
                    ? "О встрече"
                    : "Материалы встречи"
                  : isTest
                    ? "О тестировании"
                    : "Об обучении"}
              </h2>
              <p>
                {isEvent
                  ? event.status === "upcoming"
                    ? event.description
                    : original?.availability
                  : isTest
                    ? task.status === "completed"
                      ? "Тестирование завершено. Результат подтверждён в Альфа People."
                      : "Пройдите проверку знаний в Альфа People. Материалы для подготовки собраны ниже."
                    : task
                      ? "Обучение проходит в Альфа People. Здесь сохранён ваш прогресс и собраны материалы для подготовки."
                      : original?.availability || entity.description}
              </p>
              {task && (
                <EduProgress
                  value={task.progress}
                  label={isTest ? "Выполнение тестирования" : "Пройдено"}
                  tone={task.status === "completed" ? "is-green" : ""}
                />
              )}
              <div
                className={
                  isEvent && event.status === "upcoming"
                    ? "edu-agenda"
                    : "edu-content-sections"
                }
              >
                {sections.map((s, index) => (
                  <section key={s.title} id={"edu-topic-" + index}>
                    {isEvent && event.status === "upcoming" && (
                      <span className={"edu-agenda-number"}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                    <div>
                      <h2>{s.title}</h2>
                      <p>{s.text}</p>
                    </div>
                  </section>
                ))}
              </div>
              {isEvent && event.status === "past" && (
                <div className={"edu-soft-note"}>
                  {
                    "Запись пока не опубликована. Для повторения темы используйте материалы ниже."
                  }
                </div>
              )}
            </section>
          )}
          {links.length > 0 && (
            <EduRelatedMaterials
              title={
                isEvent ? "Материалы по теме" : "Для подготовки и повторения"
              }
              links={links}
            />
          )}
          {isText && (
            <div className={"edu-soft-note"}>
              {"Материал от "}
              {event?.date || original.date}
              {
                " 2026 года. Актуальные условия продуктов проверяйте в базе знаний и документах программы."
              }
            </div>
          )}
        </div>
        <aside className={"edu-detail-aside"}>
          {isEvent && (
            <section className={"section-card edu-event-registration"}>
              <h2>
                {event.status === "past" ? "Встреча завершена" : "Ваше участие"}
              </h2>
              {event.status === "upcoming" ? (
                <React.Fragment>
                  <div className={"edu-registration-state"}>
                    <EduBadge tone={registered ? "green" : "blue"}>
                      <EduIcon name={registered ? "check" : "calendar"} />
                    </EduBadge>
                    <div>
                      <strong>
                        {registered ? "Вы записаны" : "Открыта регистрация"}
                      </strong>
                      <span>{event.date}</span>
                    </div>
                  </div>
                  {registered ? (
                    <React.Fragment>
                      <p>
                        {event.venue === "Онлайн"
                          ? "Ссылка на эфир появится здесь перед началом."
                          : "Место встречи и время сохранены в карточке мероприятия."}
                      </p>
                      <Button
                        size={40}
                        view={"primary"}
                        block={true}
                        onClick={() => {
                          EduCalendar(event);
                          setNotice(
                            "Событие подготовлено для добавления в календарь.",
                          );
                        }}
                        leftAddons={<EduIcon name={"calendar"} />}
                      >
                        {"Добавить в календарь"}
                      </Button>
                      {confirmCancel ? (
                        <div className={"edu-cancel-confirm"}>
                          <p>{"Отменить запись на встречу?"}</p>
                          <Button
                            size={32}
                            view={"secondary"}
                            onClick={() => {
                              setRegistered(false);
                              setConfirmCancel(false);
                              setNotice("Запись отменена.");
                            }}
                          >
                            {"Да, отменить"}
                          </Button>
                          <Button
                            size={32}
                            view={"text"}
                            onClick={() => setConfirmCancel(false)}
                          >
                            {"Оставить"}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size={32}
                          view="transparent"
                          className={"edu-text-control"}
                          onClick={() => setConfirmCancel(true)}
                        >
                          {"Отменить запись"}
                        </Button>
                      )}
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <p>
                        {"Запишитесь, чтобы сохранить встречу в разделе «Мои»."}
                      </p>
                      <Button
                        size={40}
                        view={"primary"}
                        block={true}
                        onClick={() => {
                          setRegistered(true);
                          setNotice("Вы записаны на мероприятие.");
                        }}
                      >
                        {"Записаться"}
                      </Button>
                      <Button
                        size={32}
                        view="transparent"
                        className={"edu-text-control"}
                        onClick={() => {
                          EduCalendar(event);
                          setNotice(
                            "Событие подготовлено для календаря. Это не регистрация на встречу.",
                          );
                        }}
                      >
                        {"Только добавить в календарь"}
                      </Button>
                    </React.Fragment>
                  )}
                  <p className={"edu-registration-note"}>
                    {"Добавление в календарь не заменяет регистрацию."}
                  </p>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <p>{event.date}</p>
                  <StatusTag>{"Материалы готовятся"}</StatusTag>
                  <p>
                    {
                      "Ссылки на опубликованные материалы появятся в этой карточке."
                    }
                  </p>
                </React.Fragment>
              )}
              <span
                className={"edu-safeLearningReturn-notice"}
                role={"status"}
                aria-live={"polite"}
              >
                {notice}
              </span>
            </section>
          )}
          {task && (
            <section className={"section-card edu-event-registration"}>
              <h2>
                {task.status === "completed" ? "Результат" : "Ваше задание"}
              </h2>
              {task.status === "completed" ? (
                <React.Fragment>
                  <div className={"edu-test-score"}>
                    <MetricValue variant={"display"}>
                      {task.score}
                      {"%"}
                    </MetricValue>
                    <StatusTag tone={"green"}>{"Тест пройден"}</StatusTag>
                  </div>
                  <p>
                    {"Проходной результат — "}
                    {task.threshold}
                    {"%. Завершено "}
                    {task.completedAt}
                    {"."}
                  </p>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <StatusTag tone={task.progress ? "violet" : "neutral"}>
                    {task.progress ? "В процессе" : "Не начато"}
                  </StatusTag>
                  <p>
                    {"Завершить до "}
                    {task.due}
                    {"."}
                  </p>
                  {isTest && (
                    <dl className={"edu-test-facts"}>
                      <div>
                        <dt>{"Вопросов"}</dt>
                        <dd>{task.questions}</dd>
                      </div>
                      <div>
                        <dt>{"Проходной результат"}</dt>
                        <dd>
                          {task.threshold}
                          {"%"}
                        </dd>
                      </div>
                      <div>
                        <dt>{"Доступно попыток"}</dt>
                        <dd>{task.attempts}</dd>
                      </div>
                    </dl>
                  )}
                </React.Fragment>
              )}
              <EduLink
                href={EduPlatform.home}
                external={true}
                view={"primary"}
                block={true}
              >
                {"Открыть в Альфа People"}
              </EduLink>
              <p className={"edu-registration-note"}>
                {"В разделе «Моё обучение» выберите «"}
                {title}
                {"»."}
              </p>
            </section>
          )}
          {original?.image && (
            <img
              className={
                "invest-class-detail-image " +
                (original.kind === "course" ? "is-course" : "")
              }
              src={original.image}
              alt={original.imageAlt || ""}
            />
          )}
          <section className={"section-card edu-facts"}>
            <h2>
              {original?.speaker
                ? "Спикер"
                : isEvent
                  ? "О мероприятии"
                  : "О материале"}
            </h2>
            {original?.speaker && (
              <React.Fragment>
                <strong>{original.speaker.name}</strong>
                <p>{original.speaker.role}</p>
              </React.Fragment>
            )}
            <dl>
              <div>
                <dt>{"Формат"}</dt>
                <dd>{kindLabel}</dd>
              </div>
              <div>
                <dt>
                  {isEvent
                    ? "Дата и время"
                    : isText
                      ? "Дата публикации"
                      : "Срок"}
                </dt>
                <dd>
                  {isEvent
                    ? event.date
                    : isText
                      ? event?.date || original.date
                      : task
                        ? "До " + task.due
                        : original?.date}
                </dd>
              </div>
              {(event?.duration || task?.duration || original?.duration) && (
                <div>
                  <dt>{"Продолжительность"}</dt>
                  <dd>
                    {event?.duration || task?.duration || original?.duration}
                  </dd>
                </div>
              )}
              {event?.host && (
                <div>
                  <dt>{"Организатор"}</dt>
                  <dd>{event.host}</dd>
                </div>
              )}
              {event?.venue && (
                <div>
                  <dt>{"Место"}</dt>
                  <dd>{event.venue}</dd>
                </div>
              )}
            </dl>
          </section>
          {isText && (
            <section className={"section-card edu-toc"}>
              <h2>{"В этом материале"}</h2>
              {interviewQuestions.map(([from, to], i) => {
                const lines =
                  original.transcript!.match(/[^\n]*\n|[^\n]+$/g) || [];
                const text = lines
                  .slice(from, to)
                  .filter((s) => !/^\d{2}:\d{2}/.test(s))
                  .join(" ")
                  .trim();
                return (
                  <a key={i} href={"#interview-question-" + i}>
                    {text}
                  </a>
                );
              })}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

export const EduTranscript = InterviewTranscript;
