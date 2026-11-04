import { describe, it, expect } from 'vitest';
import { db } from '../src/db/index.ts';
import { joinRequests, users, clubs } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

describe('Join Request Workflow', () => {
  it('should submit a join request', async () => {
    const id = Math.random().toString(36).substring(2, 9);
    const [user] = await db.insert(users).values({
      full_name: 'Student',
      email: `student_${id}@test.com`,
      password_hash: 'h',
      role: 'student',
    }).returning();

    const [faculty] = await db.insert(users).values({
      full_name: 'Faculty',
      email: `faculty_${id}@test.com`,
      password_hash: 'h',
      role: 'faculty_coordinator',
    }).returning();

    const [club] = await db.insert(clubs).values({
      name: `Club_${id}`,
      category: 'Technical',
      description: 'Test club description',
      faculty_coordinator_id: faculty.id,
    }).returning();

    const [req] = await db.insert(joinRequests).values({
      student_id: user.id,
      club_id: club.id,
      status: 'pending',
    }).returning();

    expect(req).toBeDefined();
    expect(req.id).toBeDefined();
    expect(req.status).toBe('pending');
    expect(req.student_id).toBe(user.id);
    expect(req.club_id).toBe(club.id);
  });

  it('should prevent duplicate pending join requests in database logic', async () => {
    const id = Math.random().toString(36).substring(2, 9);
    const [user] = await db.insert(users).values({
      full_name: 'Student 2',
      email: `student2_${id}@test.com`,
      password_hash: 'h',
      role: 'student',
    }).returning();

    const [faculty] = await db.insert(users).values({
      full_name: 'Faculty 2',
      email: `faculty2_${id}@test.com`,
      password_hash: 'h',
      role: 'faculty_coordinator',
    }).returning();

    const [club] = await db.insert(clubs).values({
      name: `Club2_${id}`,
      category: 'Arts',
      description: 'Arts club description',
      faculty_coordinator_id: faculty.id,
    }).returning();

    expect(user).toBeDefined();
    expect(club).toBeDefined();

    const existing = await db
      .select()
      .from(joinRequests)
      .where(eq(joinRequests.student_id, user.id));

    expect(existing.length).toBe(0);
  });
});
