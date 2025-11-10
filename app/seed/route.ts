import bcrypt from 'bcrypt';
// import postgres from 'postgres';
import { NextResponse } from 'next/server';
import connectionPool  from "@/lib/db"

// Data dummy untuk di-seed
const users = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Amer',
    email: 'amer@example.com',
    password: 'password123',
  },
];

// Koneksi ke database
// const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedUsers() {
  // Aktifkan ekstensi UUID jika belum
  await connectionPool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // Buat tabel users
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return connectionPool.query(`
        INSERT INTO users (id, name, email, password)
        VALUES ('${user.id}', '${user.name}', '${user.email}', '${hashedPassword}')
        ON CONFLICT (id) DO NOTHING;
      `);
    }),
  );

  return insertedUsers;
}

// Endpoint GET untuk jalankan seeding
export async function GET() {
  try {
    await seedUsers();
    return NextResponse.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
