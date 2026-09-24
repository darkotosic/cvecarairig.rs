'use client';
import { useMemo, useState } from 'react';
import type { Product } from '@/lib/types';
import { Price } from './Price';
import { CallToOrderButton } from './CallToOrderButton';
export function ProductPurchaseBox({ product }: { product: Product; phone?: string | null }) {
 const variants=useMemo(()=>product.variants??[],[product.variants]); const [id,setId]=useState(''); const selected=variants.find(v=>v.id===id); const price=selected?.priceRsd ?? product.priceRsd;
 return <div className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm"><p className="text-2xl font-bold text-slate-950"><Price value={price}/></p>{variants.length>0&&<label className="block font-medium">Varijanta<select value={id} onChange={e=>setId(e.target.value)} className="mt-2 w-full border border-slate-300 px-3 py-3"><option value="">Izaberite varijantu</option>{variants.map(v=><option key={v.id} value={v.id}>{v.label} — {v.priceRsd.toLocaleString('sr-RS')} RSD</option>)}</select></label>}<p>Dostupnost i tačan sastav aranžmana potvrđujemo telefonom.</p><p>SKU: {product.sku}</p><CallToOrderButton productName={product.name}/><p className="text-xs text-slate-500">Pozovite nas da zajedno potvrdimo sastav, izradu i dostavu.</p></div>;
}
