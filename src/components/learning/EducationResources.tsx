import * as React from "react";
import { Button } from "@alfalab/core-components/button";
import { EducationInput as Input } from "./EducationShared";
import { Heading } from "../Typography";
import { StatusTag } from "../PagePrimitives";
import { portalDataProvider } from "../../data/portalDataProvider";
import type { RoleId } from "../../domain/navigation";
import {
  availableMaterials,
  safeResourceReturn,
  type ResourceCollection,
  type ResourceMaterial,
} from "../../domain/resources";
import {
  EduInvestorHref,
  EduIcon,
  EduLink,
  EduEmpty,
  EduBadge,
  EduHeadingKit,
  EduRemember,
  EduPageBack,
  EduResourceURL,
  EduCurrentReturn,
  EduWithReturn,
  EduRelatedMaterials,
  EducationSelect,
} from "./EducationShared";

export function EduInvestorRedirect() {
  const href = EduInvestorHref(
    new URLSearchParams(location.search).get("material"),
  );
  React.useEffect(() => {
    location.replace(href);
  }, [href]);
  return (
    <div className={"section-page edu-page"}>
      <EduPageBack />
      <section className={"section-card edu-detail-body"}>
        <h1>{"Альфа-Инвестор"}</h1>
        <EduLink external={true} href={href} view={"secondary"}>
          {"Открыть на сайте Альфа-Инвестора"}
        </EduLink>
      </section>
    </div>
  );
}

export function EduArticleContents({
  entries,
}: {
  entries: ResourceMaterial["entries"];
}) {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (items) => {
        const current = items
          .filter((item) => item.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (current)
          setActive(Number(current.target.getAttribute("data-entry")));
      },
      { rootMargin: "-8% 0px -65% 0px", threshold: 0 },
    );
    entries.forEach((_, i) => {
      const node = document.getElementById("entry-" + i);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [entries]);
  if (entries.length < 2) return null;
  return (
    <nav
      className={"section-card edu-toc edu-article-toc"}
      aria-label={"Содержание статьи"}
    >
      <h2>{"В этой статье"}</h2>
      {entries.map((entry, i) => (
        <a
          key={i}
          href={"#entry-" + i}
          className={active === i ? "is-active" : ""}
          aria-current={active === i ? "location" : undefined}
          onClick={(e) => {
            e.preventDefault();
            setActive(i);
            document.getElementById("entry-" + i)?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
              block: "start",
            });
          }}
        >
          {entry.title}
        </a>
      ))}
    </nav>
  );
}

export function EduResourcePage({
  role = "mass",
  collection = "knowledge",
}: {
  role?: RoleId;
  collection?: ResourceCollection;
}) {
  const params = new URLSearchParams(location.search);
  const id = params.get("material");
  const all = availableMaterials(portalDataProvider.getResources(), role);
  const material = all.find((m) => m.id === id && m.collection === collection);
  const collectionTitle =
    collection === "knowledge" ? "База знаний" : "Альфа-Инвестор";
  const [query, setQuery] = React.useState(params.get("q") || "");
  const [product, setProduct] = React.useState(params.get("product") || "all");
  const [topic, setTopic] = React.useState(params.get("topic") || "");
  const [back] = React.useState(() => {
    const requested = safeResourceReturn(
      params.get("return"),
      location.href,
      role,
    );
    if (requested) return requested;
    try {
      const remembered = safeResourceReturn(
        sessionStorage.getItem("gips.edu.back"),
        location.href,
        role,
      );
      if (remembered && remembered !== EduCurrentReturn()) return remembered;
    } catch {}
    return id
      ? EduResourceURL(role, collection)
      : `?role=${role}&section=learning`;
  });
  React.useEffect(() => {
    document.title = (material?.title || collectionTitle) + " · ГИПС";
  }, [id, collection, material?.title]);
  let backLabel = id ? "К материалам" : "К обучению";
  try {
    const q = new URL(back, location.href).searchParams;
    const section = q.get("section");
    backLabel =
      section === "home"
        ? "На главную"
        : section === "focus"
          ? "К продукту"
          : section === "knowledge"
            ? "К базе знаний"
            : section === "investor"
              ? "К Альфа-Инвестору"
              : q.get("view") === "invest-class" && q.get("item")
                ? "К инвест-классу"
                : section === "learning"
                  ? "К обучению"
                  : backLabel;
  } catch {}
  const updateFilters = (key: string, value: string) => {
    if (key === "q") setQuery(value);
    if (key === "product") setProduct(value);
    const url = new URL(location.href);
    url.searchParams.delete("list");
    if (value && value !== "all") url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    history.replaceState(history.state, "", url);
  };
  const reset = () => {
    setQuery("");
    setProduct("all");
    setTopic("");
    history.replaceState(history.state, "", EduResourceURL(role, collection));
  };
  if (id && !material)
    return (
      <div className={"section-page edu-page"}>
        <EduPageBack label={backLabel} href={back} />
        <section className={"section-card edu-detail-body"}>
          <h1>{"Материал недоступен"}</h1>
          <p>{"Материал не найден или недоступен для вашей роли."}</p>
          <EduLink href={EduResourceURL(role, collection)} view={"secondary"}>
            {"К доступным материалам"}
          </EduLink>
        </section>
      </div>
    );
  if (material) {
    const entries = material.entries || [];
    const related = all.filter(
      (m) =>
        m.id !== material.id &&
        (material.product
          ? m.product?.id === material.product.id
          : m.collection === collection),
    );
    const productURL = material.product
      ? `?role=${role}&section=focus&product=${encodeURIComponent(material.product.id)}&return=${encodeURIComponent(EduCurrentReturn())}`
      : "";
    const hasSummary =
      material.summary &&
      !entries.some((entry) => entry.title === material.summary);
    return (
      <div className={"section-page edu-page edu-resource-page"}>
        <EduPageBack label={backLabel} href={back} />
        <header
          className={"section-card edu-detail-heading edu-article-heading"}
        >
          <div className={"edu-inline-tags"}>
            <StatusTag tone={"violet"}>{collectionTitle}</StatusTag>
            {material.updatedAt && (
              <span className={"edu-muted"}>
                {"Обновлено "}
                {material.updatedAt}
              </span>
            )}
          </div>
          <Heading level={1} variant={"page"}>
            {material.title}
          </Heading>
          {hasSummary && <p>{material.summary}</p>}
        </header>
        <div className={"edu-detail-layout"}>
          <div className={"edu-detail-main"}>
            <article
              className={"section-card edu-detail-body edu-article-content"}
            >
              {material.image && (
                <figure className={"edu-article-image"}>
                  <img src={material.image} alt={""} />
                </figure>
              )}
              {entries.map((entry, i) => (
                <section
                  className={"edu-article-section"}
                  id={"entry-" + i}
                  data-entry={i}
                  key={i}
                >
                  <h2>{entry.title}</h2>
                  <p>{entry.text}</p>
                </section>
              ))}
              {(material.source || material.original) && (
                <footer className={"edu-article-source"}>
                  {material.source && (
                    <React.Fragment>
                      <span>{"Источник"}</span>
                      <p>{material.source}</p>
                    </React.Fragment>
                  )}
                  {material.original && (
                    <React.Fragment>
                      <p>
                        {"В портале доступно краткое содержание публикации."}
                      </p>
                      <EduLink
                        external={true}
                        href={material.original}
                        size={40}
                      >
                        {"Читать оригинал"}
                      </EduLink>
                    </React.Fragment>
                  )}
                </footer>
              )}
            </article>
            <EduRelatedMaterials
              links={related.map((m) => ({
                title: m.title,
                href: EduResourceURL(role, m.collection, m.id),
              }))}
              action={
                <EduLink href={EduResourceURL(role, collection)} size={32}>
                  {"Все материалы "}
                  <EduIcon size={14} />
                </EduLink>
              }
            />
          </div>
          <aside className={"edu-detail-aside"}>
            <EduArticleContents entries={entries} />
            {material.product && (
              <section className={"section-card edu-article-product"}>
                <EduHeadingKit>{"Продукт"}</EduHeadingKit>
                <EduBadge tone={"violet"}>
                  <EduIcon name={"book"} size={23} />
                </EduBadge>
                <h2>{material.product.title}</h2>
                <EduLink
                  href={productURL + "#" + material.product.section}
                  view={"secondary"}
                >
                  {"К продукту "}
                  <EduIcon size={16} />
                </EduLink>
                <EduLink href={productURL + "#materials"} size={40}>
                  {"Документы по продукту "}
                  <EduIcon size={15} />
                </EduLink>
              </section>
            )}
            {!material.product && (
              <section className={"section-card edu-article-product"}>
                <EduHeadingKit>{"Другие публикации"}</EduHeadingKit>
                <h2>{collectionTitle}</h2>
                <EduLink
                  href={EduResourceURL(role, collection)}
                  view={"secondary"}
                >
                  {"Все материалы "}
                  <EduIcon size={16} />
                </EduLink>
              </section>
            )}
          </aside>
        </div>
      </div>
    );
  }
  const collectionItems = all.filter(
    (m) => params.get("all") === "1" || m.collection === collection,
  );
  const products = [
    ...new Map(
      collectionItems
        .filter((m) => m.product)
        .map((m) => [m.product!.id, m.product!.title]),
    ).entries(),
  ];
  const list = collectionItems.filter(
    (m) =>
      (product === "all" || m.product?.id === product) &&
      (!topic || m.product?.section === topic) &&
      `${m.title} ${m.summary}`
        .toLocaleLowerCase("ru")
        .includes(query.trim().toLocaleLowerCase("ru")),
  );
  return (
    <div className={"section-page edu-page edu-resource-page"}>
      <EduPageBack label={backLabel} href={back} />
      <header className={"edu-page-heading"}>
        <div>
          <Heading level={1} variant={"page"}>
            {collectionTitle}
          </Heading>
          <p>
            {collection === "knowledge"
              ? "Условия продуктов, памятки и ответы на вопросы клиентов"
              : "Обзоры рынка и инвестиционных тем"}
          </p>
        </div>
      </header>
      <section
        className={"section-card edu-resource-filters"}
        aria-label={"Фильтры материалов"}
      >
        <div className={"edu-search"}>
          <EduIcon name={"search"} />
          <Input
            size={40}
            value={query}
            onChange={(e) => updateFilters("q", e.target.value)}
            placeholder={"Найти материал"}
            aria-label={"Поиск материалов"}
          />
          {query && (
            <Button
              size={32}
              view="transparent"
              aria-label={"Очистить поиск"}
              onClick={() => updateFilters("q", "")}
            >
              <EduIcon name={"close"} size={16} />
            </Button>
          )}
        </div>
        {products.length > 0 && (
          <EducationSelect
            value={product}
            onValueChange={(value) => updateFilters("product", value)}
            aria-label={"Продукт"}
          >
            <option value={"all"}>{"Все продукты"}</option>
            {products.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </EducationSelect>
        )}
        <span className={"edu-muted"} role={"status"}>
          {"Найдено: "}
          {list.length}
        </span>
        {(query || product !== "all" || topic) && (
          <Button
            size={32}
            view="transparent"
            className={"edu-text-control"}
            onClick={reset}
          >
            {"Сбросить фильтры"}
          </Button>
        )}
      </section>
      <div className={"edu-recommendation-grid edu-resource-grid"}>
        {list.map((m) => (
          <a
            key={m.id}
            href={EduWithReturn(EduResourceURL(role, m.collection, m.id))}
            className={"section-card edu-recommendation edu-resource-card"}
            onClick={EduRemember}
          >
            <div className={"edu-recommendation-top"}>
              <EduBadge tone={m.collection === "knowledge" ? "violet" : "blue"}>
                <EduIcon name={"book"} />
              </EduBadge>
              <span>
                {m.collection === "knowledge"
                  ? "База знаний"
                  : "Альфа-Инвестор"}
              </span>
            </div>
            <h2>{m.title}</h2>
            <p>{m.summary}</p>
            <div className={"edu-reason"}>
              <span>{"Открыть материал"}</span>
              <EduIcon size={16} />
            </div>
          </a>
        ))}
      </div>
      {!list.length && (
        <section className={"section-card"}>
          <EduEmpty
            title={"Материалы не найдены"}
            text={"Измените запрос или сбросьте фильтры."}
            onReset={reset}
          />
        </section>
      )}
    </div>
  );
}
