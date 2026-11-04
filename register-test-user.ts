import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import bcrypt from 'bcrypt';

async function registerTestUser() {
  console.log("Registering test user...");
  const hashedPassword = await bcrypt.hash('password123', 10);
  try {
    await db.insert(users).values({
      full_name: 'Test Student',
      email: 'student@campus.edu',
      password_hash: hashedPassword,
      role: 'student',
    });
    console.log("Test user registered successfully.");
  } catch (err) {
    console.error("Error registering test user (user might already exist):", err);
  }
}

registerTestUser();
