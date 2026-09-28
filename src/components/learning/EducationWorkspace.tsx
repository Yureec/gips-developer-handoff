import { investClassItems } from "../../data/investClass";
import { LearningRoutes } from "./AssignmentDetails";
import * as React from "react";
import { EduDailyCourses, EduTasks, EduEvents, EduPlatform } from "./EducationData";
import {
  EduAssignments,
  EduEventsPage,
  EduCatalog,
} from "./EducationCatalogs";
import { EduDetail } from "./EducationDetail";
import { EduLink } from "./EducationShared";

export const EduLegacyRouter = LearningRoutes;

function EduDailyRedirect() {
  React.useEffect(() => {
    location.replace(EduPlatform.home);
  }, []);
  return (
    <div className={"section-page edu-page"}>
      <section className={"section-card edu-detail-body"}>
        <h1>{"Daily Invest"}</h1>
        <EduLink href={EduPlatform.home} external={true} view={"secondary"}>
          {"Открыть в Альфа People"}
        </EduLink>
      </section>
    </div>
  );
}

export function EduRouter() {
  const query = new URLSearchParams(location.search),
    view = query.get("view");
  if (view === "daily" || view === "daily-course") return <EduDailyRedirect />;
  if (view === "assignments") return <EduAssignments />;
  if (view === "events") return <EduEventsPage />;
  if (view === "invest-class")
    return query.get("item") ? <EduDetail /> : <EduCatalog />;
  return <EduLegacyRouter />;
}

export function EduDocumentTitle() {
  const query = new URLSearchParams(location.search),
    view = query.get("view");
  if (view === "daily") return "Daily Invest";
  if (view === "events") return "Мероприятия и вебинары";
  if (view === "assignments") return "Задания и тестирования";
  if (view === "daily-course") {
    const c = EduDailyCourses.find((c) => c.id === query.get("item"));
    return c ? `Daily Invest · ${c.start}–${c.end}.2026` : "Материал не найден";
  }
  if (view === "invest-class") {
    if (!query.get("item")) return "Инвест-класс";
    return (
      [...investClassItems, ...EduEvents, ...EduTasks].find(
        (e) => e.id === query.get("item"),
      )?.title || "Материал не найден"
    );
  }
  return "Обучение";
}

export {
  EduPage as EducationPage,
  EduDailyCard as EducationDailyCard,
} from "./EducationOverview";
export {
  EduResourcePage as EducationResourcesPage,
  EduInvestorRedirect as InvestorRedirect,
} from "./EducationResources";
export { EduRouter as EducationRouter };
