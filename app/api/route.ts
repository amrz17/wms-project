// import connectionPool  from '@/lib/db';
// import { NextResponse } from 'next/server';

// export async function getTotalProducts() {
//   try {
//     const result = await connectionPool.query(`
//       SELECT COUNT(*) from items;
//     `);
//     return result.rows; // <-- ambil hasil data dari .rows
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     throw error;
//   }
// }

// // Endpoint GET untuk jalankan seeding
// export async function GET() {
//   try {
//     getTotalProducts();
//     return NextResponse.json({ message: 'Database seeded successfully!' });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
//   }
// }

import connectionPool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function getTotalProducts() {
  try {
    const result = await connectionPool.query(`
      SELECT COUNT(*) FROM items;
    `);
    return result.rows; // PostgreSQL → hasil query ada di .rows
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getTotalStocks() {
  try {
    const result = await connectionPool.query(`
      SELECT SUM(stock) FROM items;
    `);
    return result.rows; // PostgreSQL → hasil query ada di .rows
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Endpoint GET untuk ambil total produk
export async function GET() {
  try {
    const result = await getTotalProducts(); // ⬅️ tambahkan await
    return NextResponse.json({
      totalProducts: result[0].count, // PostgreSQL mengembalikan string 'count'
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch total products' },
      { status: 500 }
    );
  }
}

