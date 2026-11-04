import { describe, it, expect } from 'vitest';
import { db } from '../src/db/index.ts';
import { users } from '../src/db/schema.ts';
import bcrypt from 'bcrypt';

describe('Authentication', () => {
  it('should register a user', async () => {
    const timestamp = Date.now();
    const email = `testauth_${timestamp}@campus.edu`;
    const password_hash = await bcrypt.hash('password123', 10);
    const [user] = await db.insert(users).values({
      full_name: 'Test User',
      email,
      password_hash,
      role: 'student',
    }).returning();

    expect(user.id).toBeDefined();
    expect(user.email).toBe(email);
  });
});
