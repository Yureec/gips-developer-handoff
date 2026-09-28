import type { FocusCatalogData } from './focusCatalog';
import type { RoleId } from '../domain/navigation';

export interface DashboardData {
  employee: {
    name: string;
    role: string;
    office: string;
    league: string;
    image: string;
  };
  contests: Array<{
    id?: string;
    eyebrow: string;
    period: string;
    title: string;
    description: string;
    image: string;
    rank?: string;
    reward?: string;
  }>;
  focusProducts: Array<{
    key: ProductKey;
    title: string;
    logo: string;
    runRate: string;
    runRateTone: 'positive' | 'negative';
    description: string;
    actual: string;
    target: string;
    reward: string;
  }>;
  kpi: { progress: number; completion: string; plan: string; actual: string; weeklyDelta: string; reward: string };
  coefficients: Array<{ label: string; value: string }>;
  level: { level: string; title: string; progress: number; xp: string; coins: string; streak: string };
  ratings: Array<{ label: string; detail: string; position: string }>;
  achievements: AchievementData[];
  challenges: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    completed: number;
    total: number;
    status: string;
    reward?: string;
    action: string;
    actionTarget: 'games' | 'learning';
    tone: 'orange' | 'blue' | 'violet' | 'green';
  }>;
  investNewsChannels: Array<{
    id: string;
    platform: string;
    messenger: 'max' | 'achat' | 'telegram';
    title: string;
    kind: string;
    href: string;
  }>;
  market: {
    asOf: string;
    keyRate: string;
    nextMeeting: string;
    inflation: string;
    inflationTarget: string;
    quotes: Array<{ id: string; label: string; value: string }>;
  };
  investorNews: Array<{
    category: string;
    title: string;
    description: string;
    href: string;
    image: string;
    imageAlt: string;
  }>;
}

export interface AchievementData {
  id: string;
  title: string;
  tone: SurfaceTone;
  locked?: boolean;
  image?: string;
  href?: string;
}

export type ProductKey = 'nsj' | 'oms' | 'pds';

export type OnlyProductKey =
  | 'opif'
  | 'ul'
  | 'realestate'
  | 'selectel'
  | 'kalshi'
  | 'scfa-potential'
  | 'scfa-shield'
  | 'leaders';

export type OnlyTone = 'neutral' | 'success' | 'alert' | 'dark' | 'violet';

export interface OnlyDashboardData {
  employee: DashboardData['employee'];
  period: string;
  heroTags: string[];
  heroStats: Array<{ label: string; value: string; detail?: string }>;
  contests: Array<{
    period: string;
    title: string;
    description: string;
    image: string;
    rank: string;
  }>;
  observationMetrics: Array<{
    id: string;
    label: string;
    progress: number;
    plan: string;
    scope: string;
    fact: string;
    noteIcon: string;
    noteTitle: string;
    note: string;
    tone: 'green' | 'amber' | 'violet' | 'blue';
  }>;
  goals: Array<{
    label: string;
    value: string;
    description: string;
    progress: number;
    trend: string;
    remainder: string;
    tone?: 'success' | 'alert';
  }>;
  drivers: Array<{
    title: string;
    tone: 'dark' | 'light';
    rank: string;
    factLabel: string;
    fact: string;
    planLabel: string;
    plan: string;
    progress: number;
    remainder: string;
    items: Array<{
      rank: string;
      product: OnlyProductKey;
      title: string;
      description: string;
      coefficient: string;
    }>;
  }>;
  deals: Array<{
    rank: string;
    manager: string;
    division: string;
    product: string;
    volume: string;
    income: string;
    date: string;
    current?: boolean;
    productKey?: OnlyProductKey;
  }>;
  nominations: Array<{
    icon: string;
    title: string;
    place: string;
    hint: string;
    leader?: boolean;
    href?: string;
  }>;
  importantNews: Array<{ title: string; description: string; badge: string; tone: SurfaceTone }>;
  resources: Array<{
    mark: string;
    title: string;
    description: string;
    badge: string;
    action: 'message' | 'news';
    message?: string;
  }>;
  communities: Array<{ mark: string; title: string; message: string }>;
  analytics: Array<{ title: string; description: string; href: string; image: string }>;
}

export interface OnlyProductData {
  key: OnlyProductKey;
  kicker: string;
  title: string;
  description: string;
  heroTone: 'light' | 'dark';
  backTarget: 'home' | 'news';
  stats: Array<{ label: string; value: string; detail?: string }>;
  blocks: Array<{
    title: string;
    span: 5 | 6 | 7 | 12;
    subtitle?: string;
    marker?: string;
    items?: Array<{ mark: string; title: string; description?: string }>;
    paragraphs?: string[];
  }>;
  salesScript?: string[];
  actions?: Array<{ label: string; message: string; primary?: boolean }>;
}

export type ProductFilter = 'all' | 'focus' | 'insurance' | 'investments';

export interface ProductCatalogItem {
  id: string;
  key?: ProductKey;
  title: string;
  description: string;
  category: Exclude<ProductFilter, 'all'> | 'service';
  categoryLabel: string;
  focus: boolean;
  mark: string;
  logo?: string;
  runRate?: string;
  runRateTone?: 'positive' | 'negative';
  reward?: string;
  meta?: [string, string];
  actionMessage?: string;
}

export interface ProductCatalogData {
  title: string;
  description: string;
  products: ProductCatalogItem[];
}

export interface FocusProductData {
  key: ProductKey;
  title: string;
  description: string;
  logo: string;
  reward: string;
  fact: string;
  plan: string;
  runRate: string;
  runRateTone: 'positive' | 'negative';
  position: string;
  positioning: string;
  positioningText: string;
  audience: string;
  arguments: Array<{ title: string; description: string }>;
}

export type SurfaceTone = 'blue' | 'gold' | 'green' | 'neutral' | 'red' | 'violet';

export type MarketplaceFilter = 'all' | 'merch' | 'stocks' | 'orders';

export interface MarketplaceItem {
  id: string;
  type: 'merch' | 'stocks';
  title: string;
  description: string;
  badge: string;
  price: number;
  image?: string;
  brand?: string;
  logoText?: string;
}

export interface MarketplaceData {
  balance: number;
  items: MarketplaceItem[];
}

export interface ScenarioData {
  icon: string;
  badges: string[];
  title: string;
  subtitle: string;
  steps: Array<[string, string]>;
  note: string;
  actions: Array<[string, string]>;
  extra: Array<[string, string]>;
}

export interface PublicProfileData {
  avatar: string;
  avatarColor: string;
  name: string;
  level: string;
  league: string;
  meta: string;
  month: string;
  xp: string;
  streak: string;
  repeat: string;
  strengths: Array<[string, string]>;
  achievements: Array<[string, string, string]>;
}

export interface LearningData {
  title: string;
  description: string;
  tags: string[];
  metrics: {
    nextLevel: { value: string; unit: string; progress: number };
    earned: { value: string; unit: string };
    weekly: { value: string; detail: string };
  };
  rule: string;
  modules: Array<{
    id: string;
    title: string;
    description: string;
    tone: SurfaceTone;
    progress?: number;
    meta?: string;
  }>;
  materials: Array<{ id: string; title: string; description: string; tone: SurfaceTone }>;
}

export interface GamesData {
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string; detail?: string; tone: SurfaceTone; action?: 'marketplace' }>;
  leagues: Array<{
    title: string;
    range: string;
    description?: string;
    current?: boolean;
    progress?: number;
    progressLabel?: string;
  }>;
  challenges: Array<{
    id: string;
    title: string;
    description: string;
    reward: string;
    completed: number;
    total: number;
    progressLabel: string;
    action: string;
    actionTarget: 'details' | 'learning';
    tone: SurfaceTone;
  }>;
  opportunities: Array<{ id: string; title: string; description: string; tone: SurfaceTone; action?: 'marketplace' }>;
  achievements: AchievementData[];
  ranking: Array<{
    rank: string;
    initials: string;
    name: string;
    detail?: string;
    value: string;
    tone: SurfaceTone;
    current?: boolean;
    profileId?: string;
  }>;
  recent: Array<{ title: string; reward: string }>;
}

export interface ProfileData {
  name: string;
  roleLine: string;
  image: string;
  level: string;
  league: string;
  streak: string;
  coins: string;
  xp: string;
  achievementsCount: string;
  nextLevel: {
    label: string;
    remaining: string;
    completed: number;
    total: number;
    hint: string;
    progress?: number;
  };
  investmentProgress: Array<{ label: string; value: string; detail?: string; progress?: number }>;
  gameStatus: Array<{ label: string; value: string; detail: string; tone: SurfaceTone; action?: 'marketplace' }>;
  achievements: AchievementData[];
  accruals: Array<{ id: string; title: string; meta: string; reward: string; tone: SurfaceTone }>;
  nextGoal: { title: string; description: string };
}

export interface ManagerEmployee {
  id: string;
  initials: string;
  color: string;
  name: string;
  role: string;
  office: string;
  plan: number;
  runrate: string;
  runScore: number;
  productivity: number;
  lastSaleDays: number;
  contestRank: number | null;
  salary: number;
  bonus: number;
  bonusPrev: number;
  learning: number;
  courses: string;
  lastCourse: string;
  focus: string;
  nextStep: string;
  periods: string[][];
  signals: string[];
}

export interface ManagerData {
  employee: DashboardData['employee'];
  employees: ManagerEmployee[];
}

export interface ConsultantData {
  employee: DashboardData['employee'];
}

export interface PartnerData {
  employee: DashboardData['employee'];
}

export interface InvestmentSpaceDataProvider {
  getResources(): import('../domain/resources').ResourceMaterial[];
  getDashboard(role: RoleId): DashboardData;
  getOnlyDashboard(): OnlyDashboardData;
  getOnlyProduct(key: OnlyProductKey): OnlyProductData;
  getProducts(role: RoleId): ProductCatalogData;
  getFocusCatalog(role: RoleId): FocusCatalogData;
  getFocusProduct(role: RoleId, key: ProductKey): FocusProductData;
  getLearning(role: RoleId): LearningData;
  getGames(role: RoleId): GamesData;
  getProfile(role: RoleId): ProfileData;
  getMarketplace(role: RoleId): MarketplaceData;
  getScenario(key: string): ScenarioData | null;
  getPublicProfile(key: string): PublicProfileData | null;
  getManager(): ManagerData;
  getConsultant(): ConsultantData;
  getPartner(): PartnerData;
}
