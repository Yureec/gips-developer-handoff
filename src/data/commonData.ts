import marketBagImage from '../assets/market-bag.webp';
import marketBottleImage from '../assets/market-bottle.webp';
import marketCapImage from '../assets/market-cap.webp';
import marketCupImage from '../assets/market-cup.webp';
import marketNotebookImage from '../assets/market-notebook.webp';
import marketShirtImage from '../assets/market-shirt.webp';
import marketSocksImage from '../assets/market-socks.webp';
import marketWelcomeImage from '../assets/market-welcome.webp';
import commonContent from './commonContent.json';
import type { MarketplaceData, MarketplaceItem, PublicProfileData, ScenarioData } from './provider';

const marketImages: Record<string, string> = {
  bag: marketBagImage,
  bottle: marketBottleImage,
  cap: marketCapImage,
  cup: marketCupImage,
  notebook: marketNotebookImage,
  shirt: marketShirtImage,
  socks: marketSocksImage,
  welcome: marketWelcomeImage,
};

const marketplaceItems: MarketplaceItem[] = commonContent.marketplace.map((item) => ({
  id: item.id,
  type: item.type as MarketplaceItem['type'],
  title: item.title,
  description: item.desc,
  badge: item.badge,
  price: item.price,
  image: marketImages[item.id],
  brand: 'brand' in item ? item.brand : undefined,
  logoText: 'logoText' in item ? item.logoText : undefined,
}));

const scenarios = commonContent.scenarios as unknown as Record<string, ScenarioData>;
const publicProfiles = commonContent.publicProfiles as unknown as Record<string, PublicProfileData>;

export function getMarketplaceData(balance: number): MarketplaceData {
  return { balance, items: marketplaceItems };
}

export function getScenarioData(key: string): ScenarioData | null {
  return Object.hasOwn(scenarios, key) ? scenarios[key] : null;
}

export function getPublicProfileData(key: string): PublicProfileData | null {
  return Object.hasOwn(publicProfiles, key) ? publicProfiles[key] : null;
}
