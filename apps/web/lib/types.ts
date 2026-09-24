export type ProductVariant = { id: string; label: string; priceRsd?: number | null };
export type Category = { id: string; slug: string; name: string; description: string; sortOrder: number; active: boolean };
export type Product = {
  id: string; sku: string; slug: string; name: string; categoryId: string;
  shortDescription: string; description: string; priceRsd: number | null; compareAtPriceRsd?: number | null;
  image: string; images?: string[]; featured: boolean; active: boolean; sortOrder: number;
  occasion?: string; arrangementType?: string; colorPalette?: string; material?: string;
  careInstructions?: string; variants?: ProductVariant[]; seoTitle: string; seoDescription: string;
};
export type Store = {
  brand: string; email: string; phone: string; serviceArea: string; sameDayRule: string;
  paymentMethods: string; businessHours: string; deliveryNote: string; returnPolicyShort: string;
  whatsappUrl: string | null; logo: string | null;
};
