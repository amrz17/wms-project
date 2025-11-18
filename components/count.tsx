// // app/components/ProductCountCard.jsx
// import { CardTitle } from "@/components/ui/card";
// import { getTotalProducts } from "../app/api/route"; // pastikan path ini sesuai

// // Komponen server-side (tidak perlu 'use client')
// export default async function ProductCountCard() {
//   const products = await getTotalProducts(); // fungsi async ambil dari DB
//   const totalProducts = products.length;

//   return (
//     <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
//       {totalProducts}
//     </CardTitle>
//   );
// }

import { CardTitle } from "@/components/ui/card";
import { getTotalProducts, getTotalStocks } from "@/app/api/route"; // pastikan path benar (lihat catatan di bawah)

// Komponen server-side (tidak perlu 'use client')
export async function ProductCountCard() {
  const result = await getTotalProducts(); // hasil dari query
  const totalProducts = result[0]?.count || 0; // ambil nilai count dari objek hasil query

  return (
    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
      {totalProducts}
    </CardTitle>
  );
}

export async function StockCountCard() {
  const result = await getTotalStocks(); // hasil dari query
  const totalProducts = result[0]?.sum || 0; // ambil nilai count dari objek hasil query

  return (
    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
      {totalProducts}
    </CardTitle>
  );
    
}
