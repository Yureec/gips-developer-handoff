import { EducationPage, EducationRouter, EducationResourcesPage, InvestorRedirect, EduDocumentTitle } from './components/learning/EducationWorkspace';
import { contests } from './data/contests';
import { investClassItems } from './data/investClass';
import { LearningProvider } from './components/learning/LearningProvider';
import { MetricsPage } from './pages/MetricsPage';
import { safeResourceReturn } from './domain/resources';
import { FocusCatalogPage } from './pages/FocusCatalogPage';
import type { FocusProductId } from './data/focusCatalog';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AppHeader } from './components/AppHeader';
import { portalDataProvider } from './data/portalDataProvider';
import { type ManagerEmployee, type MarketplaceFilter, type MarketplaceItem, type OnlyProductKey } from './data/provider';
import { isRoleId, isSectionId, roles, type RoleId, type SectionId } from './domain/navigation';
import { ContestPage } from './pages/ContestPage';
import { FocusPage } from './pages/FocusPage';
import { GamesPage } from './pages/GamesPage';
import { HomePage } from './pages/HomePage';
import { OnlyHomePage } from './pages/OnlyHomePage';
import { OnlyProductPage } from './pages/OnlyProductPage';
import { ConsultantHomePage } from './pages/ConsultantHomePage';
import { ManagerEmployeePage } from './pages/ManagerEmployeePage';
import { ManagerPage } from './pages/ManagerPage';
import { PartnerHomePage } from './pages/PartnerHomePage';
import { PartnerLogPage } from './pages/PartnerLogPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProfilePage } from './pages/ProfilePage';
import { RoleSectionPage } from './pages/RoleSectionPage';
import { SectionPlaceholder } from './pages/SectionPlaceholder';
import { MarketplaceOrderPage, MarketplacePage, MarketplaceSuccessPage } from './pages/MarketplacePages';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { ScenarioPage } from './pages/ScenarioPage';

function getInitialRole(): RoleId {
  const role = new URLSearchParams(window.location.search).get('role');
  return isRoleId(role) ? role : 'mass';
}

function getInitialSection(): SectionId {
  const params = new URLSearchParams(window.location.search);
  const section = params.get('section') ?? window.location.hash.replace('#', '');
  return isSectionId(section) ? section : 'home';
}

function getInitialProduct(): FocusProductId | null {
  const product = new URLSearchParams(window.location.search).get('product');
  return ['nsj', 'oms', 'pds', 'nsj-plus', 'autofollow'].includes(product ?? '') ? product as FocusProductId : null;
}

const onlyProductKeys: OnlyProductKey[] = [
  'opif',
  'ul',
  'realestate',
  'selectel',
  'kalshi',
  'scfa-potential',
  'scfa-shield',
  'leaders',
];

function getInitialOnlyProduct(): OnlyProductKey {
  const product = new URLSearchParams(window.location.search).get('product');
  return onlyProductKeys.includes(product as OnlyProductKey) ? product as OnlyProductKey : 'opif';
}

const marketplaceFilters: MarketplaceFilter[] = ['all', 'merch', 'stocks', 'orders'];

function getInitialMarketplaceFilter(): MarketplaceFilter {
  const filter = new URLSearchParams(window.location.search).get('filter');
  return marketplaceFilters.includes(filter as MarketplaceFilter) ? filter as MarketplaceFilter : 'all';
}

interface RouteOptions {
  product?: FocusProductId | OnlyProductKey;
  employee?: string;
  scenario?: string;
  reward?: string;
  person?: string;
  filter?: MarketplaceFilter;
  order?: string;
}

function PortalApp() {
  const [role, setRole] = useState<RoleId>(getInitialRole);
  const [activeSection, setActiveSection] = useState<SectionId>(getInitialSection);
  const [activeProduct, setActiveProduct] = useState<FocusProductId | null>(getInitialProduct);
  const [activeOnlyProduct, setActiveOnlyProduct] = useState<OnlyProductKey>(getInitialOnlyProduct);
  const initialParams = new URLSearchParams(window.location.search);
  const [activeScenario, setActiveScenario] = useState(initialParams.get('scenario') ?? 'generic');
  const [activeMarketItemId, setActiveMarketItemId] = useState(initialParams.get('reward') ?? 'cap');
  const [activePublicProfile, setActivePublicProfile] = useState(initialParams.get('person') ?? 'dmitry');
  const [marketplaceFilter, setMarketplaceFilter] = useState<MarketplaceFilter>(getInitialMarketplaceFilter);
  const [orderId, setOrderId] = useState(initialParams.get('order') ?? 'ORD-2840');
  const managerData = useMemo(() => portalDataProvider.getManager(), []);
  const consultantData = useMemo(() => portalDataProvider.getConsultant(), []);
  const partnerData = useMemo(() => portalDataProvider.getPartner(), []);
  const initialEmployeeId = new URLSearchParams(window.location.search).get('employee') ?? 'anna';
  const [activeEmployee, setActiveEmployee] = useState<ManagerEmployee>(() => managerData.employees.find((item) => item.id === initialEmployeeId) ?? managerData.employees[0]);
  const [search, setSearch] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const [routeRevision, setRouteRevision] = useState(0);
  const locationKey = `${routeRevision}:${role}:${activeSection}:${activeProduct}:${activeOnlyProduct}:${activeScenario}:${activeMarketItemId}:${activePublicProfile}:${marketplaceFilter}:${orderId}`;
  const previousLocationKeyRef = useRef(locationKey);

  const dashboard = useMemo(() => portalDataProvider.getDashboard(role), [role]);
  const products = useMemo(() => portalDataProvider.getProducts(role), [role]);
  const focusCatalog = useMemo(() => portalDataProvider.getFocusCatalog(role), [role]);
  const focusProduct = focusCatalog.products.find(product => product.id === activeProduct);
  const onlyDashboard = useMemo(() => portalDataProvider.getOnlyDashboard(), []);
  const onlyProduct = useMemo(() => portalDataProvider.getOnlyProduct(activeOnlyProduct), [activeOnlyProduct]);
  const learning = useMemo(() => portalDataProvider.getLearning(role), [role]);
  const games = useMemo(() => portalDataProvider.getGames(role), [role]);
  const profile = useMemo(() => portalDataProvider.getProfile(role), [role]);
  const marketplace = useMemo(() => portalDataProvider.getMarketplace(role), [role]);
  const scenario = useMemo(() => portalDataProvider.getScenario(activeScenario), [activeScenario]);
  const publicProfile = useMemo(() => portalDataProvider.getPublicProfile(activePublicProfile), [activePublicProfile]);
  const activeMarketItem = marketplace.items.find((item) => item.id === activeMarketItemId) ?? marketplace.items[0];
  const currentRole = roles.find((item) => item.id === role);

  useEffect(() => {
    const syncFromLocation = () => {
      setRouteRevision(value => value + 1);
      setRole(getInitialRole());
      setActiveSection(getInitialSection());
      setActiveProduct(getInitialProduct());
      setActiveOnlyProduct(getInitialOnlyProduct());
      const params = new URLSearchParams(window.location.search);
      setActiveScenario(params.get('scenario') ?? 'generic');
      setActiveMarketItemId(params.get('reward') ?? 'cap');
      setActivePublicProfile(params.get('person') ?? 'dmitry');
      setMarketplaceFilter(getInitialMarketplaceFilter());
      setOrderId(params.get('order') ?? 'ORD-2840');
      const employeeId = new URLSearchParams(window.location.search).get('employee') ?? 'anna';
      setActiveEmployee(managerData.employees.find((item) => item.id === employeeId) ?? managerData.employees[0]);
    };

    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, [managerData]);

  useEffect(() => {
    let savedScroll = window.history.state?.dailyScroll ?? 0;
    try { savedScroll = Number(sessionStorage.getItem(`resources-scroll:${location.search}`) ?? savedScroll); } catch { /* optional storage */ }
    // A contest detail always opens with the portal header visible.
    if (activeSection === 'contest' && new URLSearchParams(location.search).has('contest')) savedScroll = 0;
    window.scrollTo({ top: Number.isFinite(savedScroll) ? savedScroll : 0, behavior: 'instant' });
    const resource = ['knowledge', 'investor'].includes(activeSection) ? portalDataProvider.getResources().find(m => m.id === new URLSearchParams(location.search).get('material') && m.collection === activeSection && m.roles.includes(role) && m.publication === 'available') : undefined;
    const sectionTitle = activeSection === 'knowledge' || activeSection === 'investor' ? resource?.title ?? (activeSection === 'knowledge' ? 'База знаний' : 'Альфа-Инвестор')
      : activeSection === 'metrics' ? 'Показатели и расчёты'
      : activeSection === 'contest' ? contests.find(c => c.id === new URLSearchParams(location.search).get('contest'))?.title ?? 'Конкурсы'
      : activeSection === 'scenario'
      ? scenario?.title ?? 'Сценарий недоступен'
      : activeSection === 'marketplace'
        ? 'Маркетплейс наград'
        : activeSection === 'marketplace-order'
          ? activeMarketItem.title
          : activeSection === 'marketplace-success'
            ? 'Результат оформления награды'
            : activeSection === 'public-profile'
              ? publicProfile?.name ?? 'Профиль недоступен'
              : activeSection === 'focus'
      ? role === 'only' ? onlyProduct.title : (focusProduct?.title ?? 'Фокусные продукты')
      : activeSection === 'learning'
        ? EduDocumentTitle()
        : activeSection === 'games'
          ? games.title
          : activeSection === 'profile'
            ? profile.name
            : currentRole?.homeTitle ?? 'ГИПС';
    document.title = `${sectionTitle} · ГИПС`;
    const routeChanged = previousLocationKeyRef.current !== locationKey;
    previousLocationKeyRef.current = locationKey;
    if (routeChanged) mainRef.current?.focus({ preventScroll: true });
  }, [activeMarketItem.title, activeProduct, activeSection, currentRole?.homeTitle, (focusProduct?.title ?? 'Фокусные продукты'), games.title, learning.title, locationKey, onlyProduct.title, profile.name, publicProfile?.name, role, scenario?.title]);

  useEffect(() => {
    const save = () => { try { sessionStorage.setItem(`resources-scroll:${location.search}`, String(window.scrollY)); } catch { /* optional storage */ } };
    window.addEventListener('pagehide', save);
    return () => window.removeEventListener('pagehide', save);
  }, []);

  const updateLocation = useCallback((nextRole: RoleId, nextSection: SectionId, options: RouteOptions = {}) => {
    const url = new URL(window.location.href);
    url.searchParams.set('role', nextRole);
    url.searchParams.set('section', nextSection);
    ['product', 'employee', 'scenario', 'reward', 'person', 'filter', 'order', 'view', 'assignment', 'item', 'version', 'group', 'status', 'attempt', 'result', 'q', 'page', 'kind', 'required', 'material', 'metric', 'return', 'list', 'all', 'topic', 'contest', 'event', 'format', 'period', 'rankq'].forEach((key) => url.searchParams.delete(key));
    Object.entries(options).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    url.hash = '';
    window.history.pushState(null, '', url);
    setRouteRevision(value => value + 1);
  }, []);

  const onRoleChange = (nextRole: RoleId) => {
    setRole(nextRole);
    setActiveSection('home');
    updateLocation(nextRole, 'home');
    try { sessionStorage.removeItem(`resources-scroll:${window.location.search}`); } catch { /* optional storage */ }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const onSectionChange = (section: SectionId) => {
    // Menu navigation starts at the portal header; detail return keeps saved context.
    setActiveSection(section);
    if (section === 'focus' && role === 'mass') setActiveProduct(null);
    updateLocation(role, section, section === 'focus' && role === 'only' ? { product: activeOnlyProduct } : undefined);
    try { sessionStorage.removeItem(`resources-scroll:${window.location.search}`); } catch { /* optional storage */ }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const onFocusProduct = (product: FocusProductId) => {
    setActiveProduct(product);
    setActiveSection('focus');
    updateLocation(role, 'focus', { product });
  };

  const onOnlyProduct = (product: OnlyProductKey) => {
    setActiveOnlyProduct(product);
    setActiveSection('focus');
    updateLocation('only', 'focus', { product });
  };

  const onManagerEmployee = (employee: ManagerEmployee) => {
    setActiveEmployee(employee);
    setActiveSection('employee-profile');
    updateLocation('manager', 'employee-profile', { employee: employee.id });
  };

  const openScenario = (key: string) => {
    setActiveScenario(key);
    setActiveSection('scenario');
    updateLocation(role, 'scenario', { scenario: key });
  };

  const openMarketplaceItem = (item: MarketplaceItem) => {
    setActiveMarketItemId(item.id);
    setActiveSection('marketplace-order');
    updateLocation(role, 'marketplace-order', { reward: item.id, filter: marketplaceFilter });
  };

  const openPublicProfile = (person: string) => {
    setActivePublicProfile(person);
    setActiveSection('public-profile');
    updateLocation(role, 'public-profile', { person });
  };

  const confirmMarketplaceOrder = () => {
    const enough = activeMarketItem.price <= marketplace.balance;
    const nextOrderId = `${enough ? 'ORD' : 'GOAL'}-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderId(nextOrderId);
    setActiveSection('marketplace-success');
    updateLocation(role, 'marketplace-success', { reward: activeMarketItem.id, filter: marketplaceFilter, order: nextOrderId });
  };

  const handleScenarioAction = (target: string) => {
    if (target.startsWith('scenario:')) {
      openScenario(target.slice('scenario:'.length));
      return;
    }
    if (target === 'manager') {
      setRole('manager');
      setActiveSection('home');
      updateLocation('manager', 'home');
      return;
    }
    const nextSection = target === 'learn' ? 'learning' : target;
    if (isSectionId(nextSection)) {
      setRole('mass');
      setActiveSection(nextSection);
      updateLocation('mass', nextSection);
    }
  };

  const renderSection = () => {
    if (activeSection === 'metrics') return <MetricsPage role={role} />;
    if (activeSection === 'investor') return <InvestorRedirect />;
    if (activeSection === 'knowledge') return <EducationResourcesPage key={`${role}:${activeSection}`} role={role} collection={activeSection} />;
    if (activeSection === 'learning' && new URLSearchParams(window.location.search).has('view')) {
      return role === 'mass' ? <EducationRouter key={location.search} /> : <p>Нет доступа к назначениям</p>;
    }
    if (activeSection === 'scenario') {
      if (!scenario) return <section className="section-page"><h1>Сценарий недоступен</h1><p>Проверьте адрес или выберите другой сценарий.</p><a href={`?role=${role}&section=home`}>На главную</a></section>;
      return <ScenarioPage data={scenario} onAction={handleScenarioAction} />;
    }

    if (activeSection === 'marketplace') {
      return (
        <MarketplacePage
          data={marketplace}
          filter={marketplaceFilter}
          onFilterChange={(filter) => {
            setMarketplaceFilter(filter);
            updateLocation(role, 'marketplace', { filter });
          }}
          onOpenItem={openMarketplaceItem}
        />
      );
    }

    if (activeSection === 'marketplace-order') {
      return <MarketplaceOrderPage data={marketplace} item={activeMarketItem} onBack={() => { setActiveSection('marketplace'); updateLocation(role, 'marketplace', { filter: marketplaceFilter }); }} onConfirm={confirmMarketplaceOrder} />;
    }

    if (activeSection === 'marketplace-success') {
      return <MarketplaceSuccessPage data={marketplace} item={activeMarketItem} orderId={orderId} onBack={() => { setActiveSection('marketplace'); updateLocation(role, 'marketplace', { filter: marketplaceFilter }); }} onOpenProfile={() => onSectionChange('profile')} />;
    }

    if (activeSection === 'public-profile') {
      if (!publicProfile) return <section className="section-page"><h1>Профиль недоступен</h1><p>Проверьте адрес или выберите другого участника.</p><a href={`?role=${role}&section=home`}>На главную</a></section>;
      return <PublicProfilePage data={publicProfile} onBack={() => onSectionChange('games')} onOpenLearning={() => onSectionChange('learning')} />;
    }

    if (role === 'manager' && activeSection === 'home') {
      return <ManagerPage data={managerData} onOpenEmployee={onManagerEmployee} onOpenPartnerLog={() => onSectionChange('partner-log')} onOpenScenario={openScenario} />;
    }

    if (role === 'manager' && activeSection === 'employee-profile') {
      return <ManagerEmployeePage employee={activeEmployee} onBack={() => onSectionChange('home')} onOpenScenario={openScenario} />;
    }

    if (role === 'manager' && activeSection === 'partner-log') {
      return <PartnerLogPage data={managerData} onBack={() => onSectionChange('home')} />;
    }

    if (role === 'consultant' && activeSection === 'home') {
      return <ConsultantHomePage data={consultantData} contests={dashboard.contests} onNavigate={onSectionChange} />;
    }

    if (role === 'partner' && activeSection === 'home') {
      return <PartnerHomePage data={partnerData} />;
    }

    if ((role === 'consultant' || role === 'partner') && (activeSection === 'learning' || activeSection === 'reporting' || activeSection === 'motivation' || activeSection === 'news')) {
      return <RoleSectionPage role={role} section={activeSection} />;
    }

    if (role === 'only' && activeSection === 'home') {
      return <OnlyHomePage data={onlyDashboard} onNavigate={onSectionChange} onOpenProduct={onOnlyProduct} />;
    }

    if (role === 'only' && activeSection === 'focus') {
      return (
        <OnlyProductPage
          data={onlyProduct}
          onBack={(target) => onSectionChange(target === 'news' ? 'news' : 'home')}
        />
      );
    }

    if (role === 'mass' && activeSection === 'home') {
      return <HomePage data={dashboard} onNavigate={onSectionChange} onFocusProduct={onFocusProduct} />;
    }

    if (role === 'mass' && activeSection === 'products') {
      return <ProductsPage data={products} onOpenProduct={onFocusProduct} />;
    }

    if (role === 'mass' && activeSection === 'focus') {
      return focusProduct
        ? <FocusPage key={focusProduct.id} data={focusProduct} period={focusCatalog.period} onBack={() => {
          const back = safeResourceReturn(new URLSearchParams(location.search).get('return'), location.href, role);
          if (back) location.href = back; else onSectionChange('focus');
        }} />
        : <FocusCatalogPage data={focusCatalog} onOpenProduct={onFocusProduct} />;
    }

    if (role === 'mass' && activeSection === 'contest') {
      return <ContestPage />;
    }

    if (role === 'mass' && activeSection === 'learning') {
      return <EducationPage />;
    }

    if (role === 'mass' && activeSection === 'games') {
      return <GamesPage data={games} onNavigate={onSectionChange} onOpenPublicProfile={openPublicProfile} onOpenScenario={openScenario} />;
    }

    if (role === 'mass' && activeSection === 'profile') {
      return <ProfilePage data={profile} onNavigate={onSectionChange} />;
    }

    return <SectionPlaceholder role={role} section={activeSection} />;
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>
      <div className="content-shell">
        <AppHeader
          activeSection={activeSection}
          employee={dashboard.employee}
          role={role}
          search={search}
          onRoleChange={onRoleChange}
          onSearchChange={setSearch}
          onSectionChange={onSectionChange}
        />

        <main id="main-content" ref={mainRef} tabIndex={-1}>
          <p className="sr-only" role="status">
            Текущая роль: {currentRole?.label}. Текущий раздел: {activeSection}.
          </p>
          {renderSection()}
        </main>

        <footer className="app-footer">
          <span>ГИПС</span>
          <span>Инвестиционное пространство</span>
        </footer>
      </div>
    </div>
  );
}

export function App() { return <LearningProvider><PortalApp /></LearningProvider>; }
