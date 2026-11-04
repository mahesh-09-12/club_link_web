import { describe, it, expect } from 'vitest';
import { db } from '../src/db/index.ts';
import { clubs, users } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

describe('Club CRUD', () => {
  it('should create a club', async () => {
    const timestamp = Date.now();
    const [faculty] = await db.insert(users).values({
      full_name: 'Faculty User',
      email: `faculty_crud_${timestamp}@test.com`,
      password_hash: 'hash',
      role: 'faculty_coordinator',
    }).returning();

    const [club] = await db.insert(clubs).values({
      name: `New Test Club ${timestamp}`,
      category: 'Technical',
      description: 'Test Description',
      faculty_coordinator_id: faculty.id,
      status: 'active',
    }).returning();

    expect(club.id).toBeDefined();
    expect(club.name).toContain('New Test Club');
  });

  it('should list clubs', async () => {
    const allClubs = await db.select().from(clubs);
    expect(Array.isArray(allClubs)).toBe(true);
  });
});
