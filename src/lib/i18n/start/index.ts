import { faq } from './faq';
import { layers } from './layers';
import { plan } from './plan';
import { safety } from './safety';

export { startPage } from './page';

export const startSubPages = {
  layers,
  safety,
  plan,
  faq,
} as const;
