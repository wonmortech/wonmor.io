// Which product media exist in public/products/ at build time (screenshots and rendered posters).
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'public', 'products');
const has = (f: string) => existsSync(join(dir, f));

export interface ProductMedia { desktop?: string; mobile?: string; poster?: string }

export function productMedia(key: string): ProductMedia {
  return {
    desktop: has(`${key}-desktop.webp`) ? `/products/${key}-desktop.webp` : undefined,
    mobile: has(`${key}-mobile.webp`) ? `/products/${key}-mobile.webp` : undefined,
    poster: has(`${key}-poster.webp`) ? `/products/${key}-poster.webp` : undefined,
  };
}

/** Products shown as a generated 3D scene instead of a screenshot (no public UI to show). */
export const sceneVariant: Record<string, string> = { 'faktura-twin': 'twin', attendo: 'face' };
