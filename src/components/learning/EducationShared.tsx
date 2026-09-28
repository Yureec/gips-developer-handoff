import { ChartLineAscMIcon } from '@alfalab/icons-glyph/ChartLineAscMIcon';
import {
  Segment,
  SegmentedControl,
} from "@alfalab/core-components/segmented-control";
import * as React from "react";
import { Button, type ButtonProps } from "@alfalab/core-components/button";
import { AlfaSelect } from "../AlfaSelect";
import { Input, type InputProps } from "@alfalab/core-components/input";
import { Heading } from "../Typography";
import { WidgetIconBadge } from "../widgets/WidgetPrimitives";
import { WidgetHeader } from "../widgets/WidgetHeader";
import { AccessibleProgressBar } from "../AccessibleProgressBar";
import { portalDataProvider } from "../../data/portalDataProvider";
import type { RoleId } from "../../domain/navigation";
import {
  safeResourceReturn,
  type ResourceCollection,
} from "../../domain/resources";
import "./education.css";
import { CalendarMIcon } from "@alfalab/icons-glyph/CalendarMIcon";
import { ClockMIcon } from "@alfalab/icons-glyph/ClockMIcon";
import { PfmBookMIcon } from "@alfalab/icons-glyph/PfmBookMIcon";
import { InformationCircleMIcon } from "@alfalab/icons-glyph/InformationCircleMIcon";
import { ArrowRightMIcon } from "@alfalab/icons-glyph/ArrowRightMIcon";
import { ArrowLeftMIcon } from "@alfalab/icons-glyph/ArrowLeftMIcon";
import { FlameSIcon } from "@alfalab/icons-glyph/FlameSIcon";
import { CheckmarkMIcon } from "@alfalab/icons-glyph/CheckmarkMIcon";
import {
  EduPlatform,
  EduDailyCourses,
  EduInvestorHome,
  EduInvestorArticleIDs,
  EducationEvent,
  EduEvents,
} from "./EducationData";

export function EduInvestorHref(material: string | null | undefined) {
  const index = EduInvestorArticleIDs.indexOf(material ?? "");
  return (
    portalDataProvider.getDashboard("mass").investorNews[index]?.href ||
    EduInvestorHome
  );
}

export function EduResolveLink(href: string) {
  try {
    const url = new URL(href, location.href);
    if (
      url.origin === location.origin &&
      url.pathname === location.pathname &&
      url.searchParams.get("section") === "investor"
    ) {
      return EduInvestorHref(url.searchParams.get("material"));
    }
  } catch {}
  return href;
}

export function EduIcon({ name = "arrow", size = 18 }) {
  const icons: Record<
    string,
    React.ComponentType<React.SVGProps<SVGSVGElement>>
  > = {
    calendar: CalendarMIcon,
    clock: ClockMIcon,
    book: PfmBookMIcon,
    info: InformationCircleMIcon,
    arrow: ArrowRightMIcon,
    back: ArrowLeftMIcon,
    flame: FlameSIcon,
    check: CheckmarkMIcon,
  };
  const Icon = icons[name];
  if (Icon) return <Icon aria-hidden={"true"} width={size} height={size} />;
  const paths: Record<string, string> = {
    external: "M7 5h12v12M19 5 5 19",
    close: "m6 6 12 12M6 18 18 6",
    chevron: "m9 5 7 7-7 7",
    search: "M15.5 15.5 21 21M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
    video: "M3 6h12v12H3V6Zm12 4 6-3v10l-6-3",
    alert: "M12 7v6m0 3v.5M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20",
    gift: "M3 9h18v4H3V9Zm2 4v8h14v-8M12 9v12M12 9C2 9 6 0 10 5l2 4Zm0 0c10 0 6-9 2-4l-2 4Z",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox={"0 0 24 24"}
      fill={"none"}
      stroke={"currentColor"}
      strokeWidth={"1.65"}
      strokeLinecap={"round"}
      strokeLinejoin={"round"}
      aria-hidden={"true"}
    >
      <path d={paths[name] || paths.external} />
    </svg>
  );
}

export function EduURL(view = "", params = {}) {
  const query = new URLSearchParams({ role: "mass", section: "learning" });
  if (view) query.set("view", view);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") query.set(k, String(v));
  });
  return "?" + query;
}

export function EduRead(key: string, fallback: boolean): boolean {
  try {
    let value = localStorage.getItem("gips.edu.v1." + key);
    const parsed: unknown = value === null ? fallback : JSON.parse(value);
    return typeof parsed === "boolean" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function EduWrite(key: string, value: boolean) {
  try {
    localStorage.setItem("gips.edu.v1." + key, JSON.stringify(value));
  } catch {}
}

export function EduUsePersistentState(
  key: string,
  initial: boolean,
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [value, setValue] = React.useState(() => EduRead(key, initial));
  const change: React.Dispatch<React.SetStateAction<boolean>> = (next) =>
    setValue((previous) => {
      const result = typeof next === "function" ? next(previous) : next;
      EduWrite(key, result);
      return result;
    });
  return [value, change];
}

export function EduLink({
  href,
  children,
  view = "text",
  size = 40,
  className = "",
  external = false,
  ...props
}: React.PropsWithChildren<{
  href: string;
  external?: boolean;
  block?: boolean;
  view?: ButtonProps["view"];
  size?: ButtonProps["size"];
  className?: string;
  title?: string;
  tabIndex?: number;
}>) {
  href = EduResolveLink(href);
  external = external || /^https?:/.test(href);
  if (external)
    return (
      <Button
        {...props}
        className={"edu-button " + className}
        href={href}
        target={"_blank"}
        rel={"noopener noreferrer"}
        size={size}
        view={view}
        rightAddons={<EduIcon name={"external"} size={15} />}
      >
        {children}
      </Button>
    );
  return (
    <EduInternalButton
      {...props}
      className={"edu-button " + className}
      size={size}
      view={view}
      href={href}
    >
      {children}
    </EduInternalButton>
  );
}

export function EduProgress({
  value,
  label,
  tone = "",
  compact = false,
}: {
  value: number;
  label: string;
  tone?: string;
  compact?: boolean;
}) {
  return (
    <div className={"edu-progress " + (compact ? "is-compact " : "") + tone}>
      <div className="edu-progress__caption">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <AccessibleProgressBar label={label} value={value} size={4} view="link" />
    </div>
  );
}

export function EduHeading({
  children,
  action,
  id,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className={"edu-section-heading"}>
      <Heading level={2} variant={"section"} id={id}>
        {children}
      </Heading>
      {action}
    </div>
  );
}

export function EduEmpty({
  title = "Ничего не найдено",
  text = "Измените условия поиска.",
  onReset,
}: {
  title?: string;
  text?: string;
  onReset?: () => void;
}) {
  return (
    <div className={"edu-empty"}>
      <EduBadge tone={"blue"}>
        <EduIcon name={"search"} />
      </EduBadge>
      <h3>{title}</h3>
      <p>{text}</p>
      {onReset && (
        <Button size={40} view={"secondary"} onClick={onReset}>
          {"Сбросить фильтры"}
        </Button>
      )}
    </div>
  );
}

export const EduBadge = WidgetIconBadge,
  EduKitProgress = AccessibleProgressBar,
  EduHeadingKit = WidgetHeader,
  EduInternalButton = LearningLink;

export function EduRemember(event?: React.MouseEvent<HTMLElement>) {
  if (
    event &&
    (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
  )
    return;
  try {
    const current = location.pathname + location.search;
    sessionStorage.setItem("gips.edu.back", current);
    sessionStorage.setItem(
      `resources-scroll:${location.search}`,
      String(window.scrollY),
    );
    sessionStorage.setItem("gips.edu.scroll", String(window.scrollY));
    const href = event?.currentTarget?.getAttribute("href");
    if (href) {
      const target = new URL(href, location.href);
      if (
        target.origin === location.origin &&
        target.pathname === location.pathname
      ) {
        sessionStorage.setItem(
          "daily-origin:" + target.pathname + target.search,
          current,
        );
      }
    }
  } catch {}
}

export function EduRegState() {
  return Object.fromEntries(
    EduEvents.map((e) => [
      e.id,
      EduRead("registration." + e.id, !!e.defaultRegistered),
    ]),
  );
}

export function EduCalendar(e: EducationEvent) {
  if (!e.start || !e.end) return;
  const esc = (v: string | undefined) =>
    String(v || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  const utc = (v: string) =>
    new Date(v)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GIPS//Learning//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}-2026@gips.local`,
    `DTSTAMP:${utc(EduPlatform.date)}`,
    `DTSTART:${utc(e.start)}`,
    `DTEND:${utc(e.end)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.description + " Время указано по Москве. " + (e.venue === "Онлайн" ? "Ссылка на подключение появится в карточке мероприятия." : ""))}`,
    `LOCATION:${esc(e.venue)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  // RFC 5545: fold content lines to at most 75 UTF-8 octets, never splitting a code point.
  const fold = (line: string) => {
    let out = "",
      part = "",
      bytes = 0;
    for (const c of line) {
      const len = new TextEncoder().encode(c).length;
      if (bytes + len > 75) {
        out += part + "\r\n";
        part = " ";
        bytes = 1;
      }
      part += c;
      bytes += len;
    }
    return out + part;
  };
  const blob = new Blob([lines.map(fold).join("\r\n") + "\r\n"], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invest-class-${e.id}.ics`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export function EduPageBack({ label = "К обучению", href = EduURL() }) {
  return (
    <EduLink href={href} size={40} className={"edu-back"}>
      <EduIcon name={"back"} size={17} />
      {label}
    </EduLink>
  );
}

export function EduNotFound() {
  return (
    <div className={"section-page edu-page"}>
      <EduPageBack />
      <section className={"section-card"}>
        <h1>{"Материал не найден"}</h1>
        <p>{"Выберите курс, задание или мероприятие в разделе обучения."}</p>
      </section>
    </div>
  );
}

export function EduResourceURL(
  role: RoleId,
  collection: ResourceCollection,
  material?: string,
  params: Record<string, string> = {},
) {
  if (collection === "investor") return EduInvestorHref(material);
  const q = new URLSearchParams({ role, section: collection });
  if (material) q.set("material", material);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      q.set(key, String(value));
  });
  return "?" + q;
}

export function EduCurrentReturn() {
  const q = new URLSearchParams(location.search);
  q.delete("return");
  return "?" + q;
}

export function EduWithReturn(href: string) {
  try {
    const url = new URL(href, location.href);
    if (
      url.origin === location.origin &&
      url.pathname === location.pathname &&
      !url.searchParams.has("return")
    ) {
      url.searchParams.set("return", EduCurrentReturn());
      return url.search + url.hash;
    }
  } catch {}
  return href;
}

export function EduRelatedMaterials({
  title = "Материалы по теме",
  links,
  action = null,
}: {
  title?: string;
  links: {
    title: string;
    href: string;
    label?: string;
  }[];
  action?: React.ReactNode;
}) {
  if (!links?.length) return null;
  return (
    <section className={"section-card edu-related-materials"}>
      <div className={"edu-related-heading"}>
        <h2>{title}</h2>
        {action}
      </div>
      <div className={"edu-related-list"}>
        {links.map((link) => {
          const href = EduResolveLink(link.href);
          let external = /^https?:/.test(href),
            section = "";
          try {
            section =
              new URL(link.href, location.href).searchParams.get("section") ||
              "";
          } catch {}
          const label =
            link.label ||
            (section === "knowledge"
              ? "База знаний"
              : section === "investor"
                ? "Альфа-Инвестор"
                : section === "focus"
                  ? "Фокусные продукты"
                  : section === "learning"
                    ? "Обучение"
                    : "Материал");
          return (
            <a
              key={link.href}
              className={"edu-related-item"}
              href={EduWithReturn(href)}
              onClick={external ? undefined : EduRemember}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <EduBadge tone={section === "learning" ? "violet" : "blue"}>
                <EduIcon name={"book"} size={20} />
              </EduBadge>
              <span>
                <strong>{link.title}</strong>
                <small>{label}</small>
              </span>
              <EduIcon name={external ? "external" : "chevron"} size={17} />
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function safeLearningReturn(value: string) {
  return safeResourceReturn(value, location.href, "mass") || EduURL();
}

export function LearningLink(props: ButtonProps) {
  return <Button {...props} onClick={EduRemember} />;
}

export function EducationSelect({
  children,
  value,
  onValueChange,
  ...props
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  onValueChange: (value: string) => void;
}) {
  const options = React.Children.toArray(children).flatMap((child) =>
    React.isValidElement<{
      value: string;
      children: React.ReactNode;
    }>(child)
      ? [{ key: String(child.props.value), content: child.props.children }]
      : [],
  );
  return (
    <AlfaSelect
      accessibleName={props["aria-label"] || "Выберите значение"}
      {...{ className: props.className, "aria-label": props["aria-label"] }}
      size={40}
      options={options}
      selected={String(value)}
      onChange={({ selected }) => {
        if (selected) onValueChange(selected.key);
      }}
    />
  );
}

export function EducationTabs({
  options,
  value,
  onChange,
  label,
}: {
  options: string[][];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <SegmentedControl
      className="edu-core-tabs"
      size={32}
      selectedId={value}
      onChange={(id) => onChange(String(id))}
      aria-label={label}
    >
      {options.map(([id, title]) => (
        <Segment key={id} id={id} title={title} />
      ))}
    </SegmentedControl>
  );
}

export function EducationInput({ "aria-label": label, ...props }: InputProps) {
  const id = React.useId();
  return (
    <div className="edu-input">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <Input {...props} id={id} block />
    </div>
  );
}

export function EduDebt({ compact = false }) {
  const course = EduDailyCourses.find((c) => c.status === "overdue");
  if (!course) return null;
  return (
    <div className={"edu-debt " + (compact ? "is-compact" : "")} role={"note"}>
      <span className={"edu-debt__icon"}>
        <EduIcon name={"alert"} size={21} />
      </span>
      <div>
        <strong>
          {compact
            ? "Есть долг за 31.08–04.09"
            : "Остался долг по Daily Invest"}
        </strong>
        {!compact && (
          <p>{"31 августа — 4 сентября · срок истёк 7 сентября."}</p>
        )}
      </div>
      <EduLink
        external={true}
        href={course.url}
        view={compact ? "text" : "secondary"}
        size={compact ? 32 : 40}
      >
        {compact ? "Пройти" : "Закрыть долг"}
      </EduLink>
    </div>
  );
}

export function EduResources() {
  return (
    <section className={"section-card edu-resources"}>
      <EduHeadingKit>{"Всегда под рукой"}</EduHeadingKit>
      <a
        className={"edu-resource-link"}
        href={EduInvestorHome}
        target={"_blank"}
        rel={"noopener noreferrer"}
      >
        <EduBadge tone={"blue"}>
          <ChartLineAscMIcon />
        </EduBadge>
        <span>
          <strong>{"Альфа-Инвестор"}</strong>
          <small>{"Аналитика и обзоры рынка"}</small>
        </span>
        <EduIcon name={"external"} size={16} />
      </a>
      <a
        className={"edu-resource-link"}
        href={"?role=mass&section=knowledge"}
        onClick={EduRemember}
      >
        <EduBadge tone={"violet"}>
          <EduIcon name={"book"} />
        </EduBadge>
        <span>
          <strong>{"База знаний"}</strong>
          <small>{"Условия, памятки, ответы"}</small>
        </span>
        <EduIcon name={"chevron"} size={16} />
      </a>
      <a
        className={"edu-resource-link"}
        href={EduURL("assignments", { kind: "assessment" })}
        onClick={EduRemember}
      >
        <EduBadge tone={"neutral"}>
          <EduIcon name={"check"} />
        </EduBadge>
        <span>
          <strong>{"Тестирования"}</strong>
          <small>{"Назначения и результаты"}</small>
        </span>
        <EduIcon name={"chevron"} size={16} />
      </a>
      <a
        className={"edu-resource-link"}
        href={EduPlatform.home}
        target={"_blank"}
        rel={"noopener noreferrer"}
      >
        <EduBadge tone={"neutral"}>
          <EduIcon name={"book"} />
        </EduBadge>
        <span>
          <strong>{"Моё обучение"}</strong>
          <small>{"Все курсы в Альфа People"}</small>
        </span>
        <EduIcon name={"external"} size={16} />
      </a>
    </section>
  );
}

