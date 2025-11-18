import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import connectionPool  from '@/lib/db';
import { users, m_items } from './data';

//
async function seedUsers() {
  // Aktifkan ekstensi UUID jika belum
  await connectionPool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // Buat tabel users
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id_user UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role VARCHAR(20) CHECK (role IN ('admin', 'staff', 'customer')) NOT NULL DEFAULT 'staff',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return connectionPool.query(`
        INSERT INTO users (name, username, email, password, role)
        VALUES ('${user.name}','${user.username}', '${user.email}', '${hashedPassword}', '${user.role}')
        ON CONFLICT (id_user) DO NOTHING;
      `);
    }),
  );

  return insertedUsers;
}

// 
async function seedItems() {
  // Aktifkan ekstensi UUID jika belum
  await connectionPool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);


  // Buat table orders
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id_item UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      id_user UUID REFERENCES users(id_user),
      item_code VARCHAR(100) UNIQUE NOT NULL,
      item_name VARCHAR(100) NOT NULL,
      sku VARCHAR(50) UNIQUE NOT NULL,
      category VARCHAR(100),
      location VARCHAR(100),
      stock INT DEFAULT 0,
      min_stock INT DEFAULT 0,
      max_stock INT DEFAULT 0,
      update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);

  const insertedOrder = await Promise.all(
    m_items.map(async (item) => {
      return connectionPool.query(`
        INSERT INTO items (id_user, item_code, sku, item_name, category, location, stock, min_stock, max_stock) VALUES ( '${item.id_user}', '${item.item_code}', '${item.sku}', '${item.item_name}', '${item.category}', '${item.location}', '${item.stock}', '${item.min_stock}', '${item.max_stock}') ON CONFLICT (id_item) DO NOTHING; `)
    })
  )

  return insertedOrder;
}

//
async function insertedPurchaseOrders() {
  // Aktifkan ekstensi UUID jika belum
  await connectionPool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // Buat TYPE jika belum ada
  await connectionPool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'type_po') THEN
        CREATE TYPE type_po AS ENUM ('inbound', 'outbound');
      END IF;
    END$$;
  `);

  await connectionPool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_po') THEN
        CREATE TYPE status_po AS ENUM 
        ('pending', 'approved', 'shipped', 'received', 'completed', 'cancelled');
      END IF;
    END$$;
  `)

  //await connectionPool.query(`CREATE TYPE type_po AS ENUM ('inbound', 'outbound')`)
  //await connectionPool.query(`CREATE TYPE status_po AS ENUM ('pending', 'approved', 'shipped', 'received', 'completed', 'cancelled')`)

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id_po UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      id_user UUID REFERENCES users(id_user),
      po_code VARCHAR(100) UNIQUE NOT NULL,
      po_type type_po,
      date_po TIMESTAMP,
      po_status status_po,
      note TEXT,
      update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
}

//
async function shcemaPurchaseOrderItem() {
  // Aktifkan ekstensi UUID jika belum
  await connectionPool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id_po_item UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      id_po UUID REFERENCES purchase_orders(id_po),
      id_item UUID REFERENCES items(id_item),
      quantity INT DEFAULT 0 NOT NULL,
      fulfilled_quantity INT NOT NULL,
      note TEXT,
      update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
}

//
async function schemaStockMovement() {

  // Aktifkan ekstensi UUID jika belum
  await connectionPool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  //await connectionPool.query(`CREATE TYPE movement_types AS ENUM ('IN', 'OUT')`)

  // Buat TYPE jika belum ada
  await connectionPool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_types') THEN
        CREATE TYPE movement_types AS ENUM ('IN', 'OUT');
      END IF;
    END$$;
  `);

  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id_movement UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      id_item UUID REFERENCES items(id_item),
      movement_type movement_types,
      quantity INT NOT NULL,
      date_movement TIMESTAMP NOT NULL,
      update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
}

//
async function schemaInbound() {

  // Aktifkan ekstensi UUID jika belum
  await connectionPool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // Buat table orders
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS inbound (
      id_inbound UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      id_user UUID REFERENCES users(id_user),
      id_item UUID REFERENCES items(id_item),
      id_po UUID REFERENCES purchase_orders(id_po),
      date_in TIMESTAMP,
      supplier_name VARCHAR(100) NOT NULL,
      quantity INT DEFAULT 0,
      note TEXT,
      update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
}

//
async function shemaOutbound() {
  
  // Aktifkan ekstensi UUID jika belum
  await connectionPool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // Buat table outbound
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS outbound (
      id_outbound UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      id_user UUID REFERENCES users(id_user),
      id_item UUID REFERENCES items(id_item),
      id_po UUID REFERENCES purchase_orders(id_po),
      date_out TIMESTAMP,
      supplier_name VARCHAR(100) NOT NULL,
      quantity INT DEFAULT 0,
      note TEXT,
      update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`); 
}

// Endpoint GET untuk jalankan seeding
export async function GET() {
  try {
    await Promise.all([
      insertedPurchaseOrders(),
      shcemaPurchaseOrderItem(),
      schemaStockMovement(),
      schemaInbound(),
      shemaOutbound(),
    ]);
    return NextResponse.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
