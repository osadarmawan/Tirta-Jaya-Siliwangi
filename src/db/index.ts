import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// If DATABASE_URL is not set, we'll create a dummy pool that throws errors
// to prevent crashing on startup, but fail gracefully when used.
const hasDb = !!process.env.DATABASE_URL;

export const pool = hasDb 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      // Add ssl config if needed for external DBs like Supabase/Neon
      ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
    })
  : null;

export const initDb = async () => {
  if (!pool) {
    console.warn('DATABASE_URL is not set. Skipping database initialization.');
    return;
  }

  try {
    const client = await pool.connect();
    
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Create Settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
          key VARCHAR(50) PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
          id VARCHAR(20) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          block VARCHAR(20) NOT NULL,
          category VARCHAR(50) NOT NULL,
          initial_meter INTEGER DEFAULT 0,
          phone VARCHAR(20),
          last_meter_reading INTEGER,
          last_reading_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Invoices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          customer_id VARCHAR(20) REFERENCES customers(id) ON DELETE CASCADE,
          period VARCHAR(20) NOT NULL,
          start_meter INTEGER NOT NULL,
          end_meter INTEGER NOT NULL,
          usage_m3 INTEGER NOT NULL,
          amount DECIMAL(12, 2) NOT NULL,
          status VARCHAR(20) DEFAULT 'Belum Bayar' 
              CHECK (status IN ('Lunas', 'Belum Bayar', 'Terlambat', 'Proses')),
          date DATE NOT NULL,
          photo_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          type VARCHAR(20) NOT NULL,
          title VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          is_unread BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create OTPs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS otps (
          phone VARCHAR(20) PRIMARY KEY,
          code VARCHAR(6) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_customers_block ON customers(block);');

    // Seed default settings if empty
    const settingsCount = await client.query('SELECT COUNT(*) FROM settings');
    if (parseInt(settingsCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO settings (key, value) VALUES 
        ('app_name', 'Tirta Paguyuban'),
        ('admin_fee', '5000'),
        ('late_fee', '10000'),
        ('price_per_m3', '3500'),
        ('use_flat_rate', 'false'),
        ('flat_rate_amount', '70000')
      `);
    }

    client.release();
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};
