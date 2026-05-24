import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306');
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'helfy_ecommerce';

async function initializeDatabase() {
  let connection;

  try {
    console.log('🔄 Starting database initialization...\n');

    // Step 1: Connect to MySQL without selecting a database
    console.log('📡 Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
    });
    console.log('✓ Connected to MySQL server\n');

    // Step 2: Create database if it doesn't exist
    console.log(`📦 Creating database '${DB_NAME}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    console.log(`✓ Database '${DB_NAME}' ready\n`);

    // Step 3: Use the database
    await connection.query(`USE \`${DB_NAME}\``);
    console.log(`✓ Using database '${DB_NAME}'\n`);

    // Step 4: Execute schema.sql
    console.log('📋 Creating tables from schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the entire schema as one statement
    await connection.query(schemaSql);
    console.log('✓ Tables created successfully\n');

    // Step 5: Execute seed.sql
    console.log('🌱 Seeding database with sample data...');
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    
    // Execute the entire seed as one statement
    await connection.query(seedSql);
    console.log('✓ Sample data inserted successfully\n');

    // Step 6: Verify tables
    console.log('🔍 Verifying tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('✓ Tables in database:', tables);

    // Step 7: Count products
    const [productCount]: any = await connection.query(
      'SELECT COUNT(*) as count FROM products'
    );
    console.log(`✓ Products seeded: ${productCount[0].count}\n`);

    console.log('✅ Database initialization completed successfully!');
    console.log('\nYou can now run: npm run dev\n');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run initialization
initializeDatabase();
