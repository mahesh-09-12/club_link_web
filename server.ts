import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { users, clubs, joinRequests, events, announcements } from './src/db/schema.ts';
import { eq, and } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'clublink-secret-jwt-key-2026';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    full_name: string;
    role: string;
  };
}

// Authentication Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  console.log(`[AUTH] Header: ${authHeader}`);
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('[AUTH] Token missing');
    return res.status(401).json({ detail: 'Access token missing or invalid' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ detail: 'Token expired or invalid' });
    }
    req.user = user as AuthRequest['user'];
    next();
  });
};

const authorizeRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ detail: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// Seed initial data if tables are empty
async function seedDatabase() {
  try {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      console.log('Seeding initial database records...');
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Create seed users
      const [student] = await db.insert(users).values({
        full_name: 'Alex Johnson',
        email: 'student@campus.edu',
        password_hash: hashedPassword,
        role: 'student',
      }).returning();

      const [coordinator] = await db.insert(users).values({
        full_name: 'Sarah Miller',
        email: 'coordinator@campus.edu',
        password_hash: hashedPassword,
        role: 'club_coordinator',
      }).returning();

      const [faculty] = await db.insert(users).values({
        full_name: 'Dr. Robert Vance',
        email: 'faculty@campus.edu',
        password_hash: hashedPassword,
        role: 'faculty_coordinator',
      }).returning();

      // Create seed clubs
      const [club1] = await db.insert(clubs).values({
        name: 'ACM Student Chapter',
        category: 'Technical',
        description: 'Advancing computing as a science & profession. Join for hackathons, coding workshops, and tech talks.',
        tagline: 'Computing for social good and innovation.',
        faculty_coordinator_id: faculty.id,
        status: 'active',
      }).returning();

      const [club2] = await db.insert(clubs).values({
        name: 'Robotics & Automation Club',
        category: 'Engineering',
        description: 'Build custom microcontrollers, design autonomous drones, and compete in national robotics competitions.',
        tagline: 'Building the future, one actuator at a time.',
        faculty_coordinator_id: faculty.id,
        status: 'active',
      }).returning();

      await db.insert(clubs).values({
        name: 'Creative Writing Society',
        category: 'Arts & Culture',
        description: 'A community for poets, novelists, and storytellers to share feedback and express creativity.',
        tagline: 'Where words come alive.',
        faculty_coordinator_id: faculty.id,
        status: 'active',
      });

      // Create seed join request
      await db.insert(joinRequests).values({
        student_id: student.id,
        club_id: club1.id,
        status: 'pending',
      });

      console.log('Database seeding completed successfully.');
    }
  } catch (err) {
    console.error('Database seeding failed:', err);
  }
}

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});
function registerRoutes() {
  // --- Auth API Routes ---
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { full_name, email, password, role } = req.body;
      if (!full_name || !email || !password || !role) {
        return res.status(400).json({ detail: 'All fields (full_name, email, password, role) are required.' });
      }

      // Check if user already exists
      const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (existing.length > 0) {
        return res.status(400).json({ detail: 'A user with this email address already exists.' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const [newUser] = await db.insert(users).values({
        full_name,
        email: email.toLowerCase(),
        password_hash,
        role: role.toLowerCase(),
      }).returning();

      const tokenPayload = {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        access_token: token,
        token_type: 'bearer',
        user: {
          id: newUser.id,
          full_name: newUser.full_name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ detail: err.message || 'Internal server error during registration.' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ detail: 'Email and password are required.' });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (!user) {
        console.log(`Login attempt failed: User not found for email: ${email}`);
        return res.status(401).json({ detail: 'Invalid email address or password.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        console.log(`Login attempt failed: Invalid password for email: ${email}`);
        return res.status(401).json({ detail: 'Invalid email address or password.' });
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        access_token: token,
        token_type: 'bearer',
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ detail: err.message || 'Internal server error during login.' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ detail: 'Unauthorized' });
      }
      const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
      if (!user) {
        return res.status(404).json({ detail: 'User not found' });
      }

      res.json({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      });
    } catch (err: any) {
      console.error('Me error:', err);
      res.status(500).json({ detail: err.message || 'Failed to fetch user details.' });
    }
  });

  app.post('/api/auth/logout', authenticateToken, (req: AuthRequest, res: Response) => {
    res.json({ message: 'Logged out successfully' });
  });

  // --- Clubs API Routes ---
  app.get('/api/clubs', async (req: Request, res: Response) => {
    try {
      const allClubs = await db.select().from(clubs).where(eq(clubs.status, 'active'));
      const approvedRequests = await db.select().from(joinRequests).where(eq(joinRequests.status, 'approved'));
      const countMap = new Map<number, number>();
      approvedRequests.forEach((r) => {
        countMap.set(r.club_id, (countMap.get(r.club_id) || 0) + 1);
      });
      const clubsWithCounts = allClubs.map((c) => ({
        ...c,
        membersCount: countMap.get(c.id) || 0,
      }));
      res.json(clubsWithCounts);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to fetch clubs' });
    }
  });

  app.get('/api/clubs/my', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { role, id } = req.user!;
      let myClubs;
      if (role === 'faculty_coordinator') {
        myClubs = await db.select().from(clubs).where(eq(clubs.faculty_coordinator_id, id));
      } else if (role === 'club_coordinator') {
        myClubs = await db.select().from(clubs).where(eq(clubs.club_coordinator_id, id));
      } else {
        return res.status(403).json({ detail: 'Forbidden' });
      }

      const approvedRequests = await db.select().from(joinRequests).where(eq(joinRequests.status, 'approved'));
      const countMap = new Map<number, number>();
      approvedRequests.forEach((r) => {
        countMap.set(r.club_id, (countMap.get(r.club_id) || 0) + 1);
      });
      const clubsWithCounts = myClubs.map((c) => ({
        ...c,
        membersCount: countMap.get(c.id) || 0,
      }));
      res.json(clubsWithCounts);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to fetch my clubs' });
    }
  });

  app.post('/api/clubs', authenticateToken, authorizeRole(['faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const { name, category, description, tagline } = req.body;
      const [newClub] = await db.insert(clubs).values({
        name,
        category,
        description,
        tagline,
        faculty_coordinator_id: req.user!.id,
        status: 'active',
      }).returning();
      res.status(201).json(newClub);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to create club' });
    }
  });

  app.get('/api/clubs/:id/members', authenticateToken, authorizeRole(['club_coordinator', 'faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const clubId = Number(req.params.id);
      const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId));
      if (!club || (club.faculty_coordinator_id !== req.user!.id && club.club_coordinator_id !== req.user!.id)) {
        return res.status(403).json({ detail: 'Forbidden: You are not authorized to view members for this club' });
      }

      const members = await db.select()
        .from(joinRequests)
        .where(and(eq(joinRequests.club_id, clubId), eq(joinRequests.status, 'approved')));
      
      res.json(members);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to fetch members' });
    }
  });

  app.put('/api/clubs/:id', authenticateToken, authorizeRole(['faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const clubId = Number(req.params.id);
      const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId));
      if (!club) return res.status(404).json({ detail: 'Club not found' });
      if (club.faculty_coordinator_id !== req.user!.id) return res.status(403).json({ detail: 'Forbidden' });

      const [updated] = await db.update(clubs).set(req.body).where(eq(clubs.id, clubId)).returning();
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to update club' });
    }
  });

  app.patch('/api/clubs/:id/coordinator', authenticateToken, authorizeRole(['faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const clubId = Number(req.params.id);
      const { coordinator_id } = req.body;
      
      const [updated] = await db.update(clubs)
        .set({ club_coordinator_id: coordinator_id })
        .where(eq(clubs.id, clubId))
        .returning();
      
      if (!updated) return res.status(404).json({ detail: 'Club not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to update coordinator' });
    }
  });

  app.delete('/api/clubs/:id', authenticateToken, authorizeRole(['faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const clubId = Number(req.params.id);
      const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId));
      if (!club) return res.status(404).json({ detail: 'Club not found' });
      if (club.faculty_coordinator_id !== req.user!.id) return res.status(403).json({ detail: 'Forbidden' });

      await db.delete(clubs).where(eq(clubs.id, clubId));
      res.json({ message: 'Club deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to delete club' });
    }
  });

  app.get('/api/clubs/:id', async (req: Request, res: Response) => {
    try {
      const clubId = Number(req.params.id);
      const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId));
      if (!club) {
        return res.status(404).json({ detail: 'Club not found' });
      }
      const approved = await db.select().from(joinRequests).where(and(eq(joinRequests.club_id, clubId), eq(joinRequests.status, 'approved')));
      res.json({
        ...club,
        membersCount: approved.length,
      });
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to fetch club' });
    }
  });

  // --- Join Requests API Routes ---
  app.get('/api/join-requests', authenticateToken, authorizeRole(['student']), async (req: AuthRequest, res: Response) => {
    try {
      const requests = await db.select().from(joinRequests).where(eq(joinRequests.student_id, req.user!.id));
      res.json(requests);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to fetch join requests' });
    }
  });

  app.get('/api/clubs/:clubId/join-requests', authenticateToken, authorizeRole(['club_coordinator', 'faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const clubId = Number(req.params.clubId);
      console.log(`Fetching join requests for clubId: ${clubId}. User: ${req.user?.id}, Role: ${req.user?.role}`);
      
      const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId));
      if (!club) {
          console.log(`Club not found: ${clubId}`);
          return res.status(404).json({ detail: 'Club not found' });
      }
      
      if (club.faculty_coordinator_id !== req.user!.id && club.club_coordinator_id !== req.user!.id) {
          console.log(`Forbidden: User ${req.user!.id} is not the coordinator for club ${clubId}`);
          return res.status(403).json({ detail: 'Forbidden: You are not authorized to view these requests.' });
      }
      
      const reqs = await db.select().from(joinRequests).where(eq(joinRequests.club_id, clubId));
      res.json(reqs);
    } catch (err: any) {
      console.error('Error in join-requests route:', err);
      res.status(500).json({ detail: err.message || 'Failed to fetch club join requests' });
    }
  });

  app.post('/api/join-requests', authenticateToken, authorizeRole(['student']), async (req: AuthRequest, res: Response) => {
    try {
      const { club_id } = req.body;
      const student_id = req.user!.id;

      if (!club_id) {
        return res.status(400).json({ detail: 'club_id is required.' });
      }

      // Check existing pending request
      const existing = await db.select().from(joinRequests)
        .where(and(eq(joinRequests.student_id, student_id), eq(joinRequests.club_id, Number(club_id)), eq(joinRequests.status, 'pending')));
        
      if (existing.length > 0) {
        return res.status(400).json({ detail: 'A pending join request for this club already exists.' });
      }

      const [newReq] = await db.insert(joinRequests).values({
        student_id,
        club_id: Number(club_id),
        status: 'pending',
      }).returning();

      res.status(201).json(newReq);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to create join request' });
    }
  });

  app.patch('/api/join-requests/:id/status', authenticateToken, authorizeRole(['club_coordinator', 'faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const requestId = Number(req.params.id);
      const { status } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ detail: 'Invalid status. Must be approved or rejected.' });
      }

      // Check ownership
      const [jr] = await db.select().from(joinRequests).where(eq(joinRequests.id, requestId));
      if (!jr) return res.status(404).json({ detail: 'Join request not found' });
      
      const [club] = await db.select().from(clubs).where(eq(clubs.id, jr.club_id));
      if (!club || club.faculty_coordinator_id !== req.user!.id) {
        return res.status(403).json({ detail: 'Forbidden' });
      }

      const [updated] = await db.update(joinRequests)
        .set({ status })
        .where(eq(joinRequests.id, requestId))
        .returning();

      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to update join request' });
    }
  });

  // --- Coordinators Endpoint ---
  app.get('/api/coordinators', authenticateToken, authorizeRole(['faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const list = await db.select({
        id: users.id,
        full_name: users.full_name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      }).from(users).where(eq(users.role, 'club_coordinator'));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to fetch coordinators' });
    }
  });

  // --- Events API Routes ---
  app.get('/api/events', async (req: Request, res: Response) => {
    try {
      const allEvents = await db.select().from(events);
      res.json(allEvents);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to fetch events' });
    }
  });

  app.post('/api/events', authenticateToken, authorizeRole(['club_coordinator', 'faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const { club_id, title, date, time, location, description } = req.body;
      const [club] = await db.select().from(clubs).where(eq(clubs.id, club_id));
      if (!club || (club.faculty_coordinator_id !== req.user!.id && club.club_coordinator_id !== req.user!.id)) {
        return res.status(403).json({ detail: 'Forbidden: You are not authorized to create events for this club.' });
      }

      const [newEvent] = await db.insert(events).values({
        club_id: Number(club_id),
        title,
        date,
        time,
        location,
        description,
      }).returning();
      res.status(201).json(newEvent);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to create event' });
    }
  });

  app.put('/api/events/:id', authenticateToken, authorizeRole(['club_coordinator', 'faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      const [ev] = await db.select().from(events).where(eq(events.id, eventId));
      if (!ev) return res.status(404).json({ detail: 'Event not found' });
      
      const [club] = await db.select().from(clubs).where(eq(clubs.id, ev.club_id));
      if (!club || (club.faculty_coordinator_id !== req.user!.id && club.club_coordinator_id !== req.user!.id)) {
        return res.status(403).json({ detail: 'Forbidden' });
      }

      const [updated] = await db.update(events).set(req.body).where(eq(events.id, eventId)).returning();
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to update event' });
    }
  });

  app.delete('/api/events/:id', authenticateToken, authorizeRole(['club_coordinator', 'faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      const [ev] = await db.select().from(events).where(eq(events.id, eventId));
      if (!ev) return res.status(404).json({ detail: 'Event not found' });
      
      const [club] = await db.select().from(clubs).where(eq(clubs.id, ev.club_id));
      if (!club || (club.faculty_coordinator_id !== req.user!.id && club.club_coordinator_id !== req.user!.id)) {
        return res.status(403).json({ detail: 'Forbidden' });
      }

      await db.delete(events).where(eq(events.id, eventId));
      res.json({ message: 'Event deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to delete event' });
    }
  });

  // --- Announcements API Routes ---
  app.get('/api/announcements', async (req: Request, res: Response) => {
    try {
      const allAnnouncements = await db.select().from(announcements);
      res.json(allAnnouncements);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to fetch announcements' });
    }
  });

  app.post('/api/announcements', authenticateToken, authorizeRole(['club_coordinator', 'faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const { club_id, title, content } = req.body;
      const [club] = await db.select().from(clubs).where(eq(clubs.id, club_id));
      if (!club || (club.faculty_coordinator_id !== req.user!.id && club.club_coordinator_id !== req.user!.id)) {
        return res.status(403).json({ detail: 'Forbidden: You are not authorized to post announcements for this club.' });
      }

      const [newAnnouncement] = await db.insert(announcements).values({
        club_id: Number(club_id),
        title,
        content,
      }).returning();
      res.status(201).json(newAnnouncement);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to publish announcement' });
    }
  });

  app.put('/api/announcements/:id', authenticateToken, authorizeRole(['club_coordinator', 'faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const annId = Number(req.params.id);
      const [ann] = await db.select().from(announcements).where(eq(announcements.id, annId));
      if (!ann) return res.status(404).json({ detail: 'Announcement not found' });
      
      const [club] = await db.select().from(clubs).where(eq(clubs.id, ann.club_id));
      if (!club || (club.faculty_coordinator_id !== req.user!.id && club.club_coordinator_id !== req.user!.id)) {
        return res.status(403).json({ detail: 'Forbidden' });
      }

      const [updated] = await db.update(announcements).set(req.body).where(eq(announcements.id, annId)).returning();
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to update announcement' });
    }
  });

  app.delete('/api/announcements/:id', authenticateToken, authorizeRole(['club_coordinator', 'faculty_coordinator']), async (req: AuthRequest, res: Response) => {
    try {
      const annId = Number(req.params.id);
      const [ann] = await db.select().from(announcements).where(eq(announcements.id, annId));
      if (!ann) return res.status(404).json({ detail: 'Announcement not found' });
      
      const [club] = await db.select().from(clubs).where(eq(clubs.id, ann.club_id));
      if (!club || (club.faculty_coordinator_id !== req.user!.id && club.club_coordinator_id !== req.user!.id)) {
        return res.status(403).json({ detail: 'Forbidden' });
      }

      await db.delete(announcements).where(eq(announcements.id, annId));
      res.json({ message: 'Announcement deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ detail: err.message || 'Failed to delete announcement' });
    }
  });
}

registerRoutes();
export { app };

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
  }
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}
