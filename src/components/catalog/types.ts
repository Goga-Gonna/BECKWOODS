export type ProductDTO = {
  id: string;
  slug: string;
  name: string;
  description: string;
  details?: string;
  priceCents: number;
  currency: string;
  stock: number;
  images: string[];
  tags: string[];
  featured?: boolean;
  category?: { slug: string; name: string };
};
