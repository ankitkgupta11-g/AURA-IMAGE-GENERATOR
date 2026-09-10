import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Generation } from '../types';
import { INITIAL_GENERATIONS } from '../constants/mockArt';

const DATA_DIR = path.join(process.cwd(), '.data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'generations.json');
const LOCAL_USERS_FILE = path.join(DATA_DIR, 'users.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure local directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  role: string;
  creationsCount: number;
  favoritesCount: number;
  createdAt: string;
}

/**
 * Node native cryptographic password hashing & verification
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const key = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(key, 'hex'));
  } catch {
    return false;
  }
}

const DEFAULT_USERS: DbUser[] = [
  {
    id: 'user-ankit',
    name: 'Ankit Gupta',
    email: 'ankit.gupta@aura.studio',
    passwordHash: hashPassword('aura123456'),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'Creative Director',
    creationsCount: 18,
    favoritesCount: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    email: 'elena.rostova@aura.studio',
    passwordHash: hashPassword('aura123456'),
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    role: 'Spatial Artist',
    creationsCount: 24,
    favoritesCount: 11,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-marcus',
    name: 'Marcus Chen',
    email: 'marcus.chen@aura.studio',
    passwordHash: hashPassword('aura123456'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'Visual Architect',
    creationsCount: 31,
    favoritesCount: 14,
    createdAt: new Date().toISOString(),
  },
];

let neonClient: ReturnType<typeof neon> | null = null;
let isNeonReady = false;

function getCleanDatabaseUrl(): string | null {
  const raw = process.env.DATABASE_URL;
  if (!raw) return null;
  let cleaned = raw.trim();
  // Strip wrapping quotes if user pasted with quotes
  if (
    (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
    (cleaned.startsWith('"') && cleaned.endsWith('"'))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  // Check for common placeholders or disabled flags
  if (
    !cleaned ||
    cleaned === 'false' ||
    cleaned === 'local' ||
    cleaned.includes('ep-xyz') ||
    cleaned.includes('your_database') ||
    cleaned.includes('placeholder')
  ) {
    return null;
  }
  if (!cleaned.startsWith('postgres')) {
    return null;
  }
  return cleaned;
}

/**
 * Initialize Neon Client lazily when DATABASE_URL is provided
 */
export function getNeonSql() {
  const dbUrl = getCleanDatabaseUrl();
  if (!dbUrl) {
    return null;
  }
  if (!neonClient) {
    try {
      neonClient = neon(dbUrl);
    } catch (err) {
      console.warn('Failed to construct Neon client:', err);
      return null;
    }
  }
  return neonClient;
}

/**
 * Initialize Neon tables and seed default artworks if empty
 */
export async function initDatabase(): Promise<boolean> {
  const sql = getNeonSql();
  if (!sql) {
    console.log('[Database] DATABASE_URL not detected. Operating in high-speed local persistence mode.');
    return false;
  }

  try {
    console.log('[Database] Connecting to Neon PostgreSQL...');

    // 1. Create generations table
    await sql`
      CREATE TABLE IF NOT EXISTS generations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_avatar TEXT,
        prompt TEXT NOT NULL,
        enhanced_prompt TEXT,
        negative_prompt TEXT,
        image_url TEXT NOT NULL,
        thumbnail_url TEXT,
        style TEXT NOT NULL,
        aspect_ratio TEXT NOT NULL,
        quality TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'completed',
        provider TEXT NOT NULL DEFAULT 'Google Gemini Flash Image',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        is_favorite BOOLEAN DEFAULT FALSE,
        is_public BOOLEAN DEFAULT TRUE,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        source_type TEXT DEFAULT 'text-to-image'
      );
    `;

    // 2. Create favorites table
    await sql`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id TEXT NOT NULL,
        generation_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, generation_id)
      );
    `;

    // 3. Create prompt history table
    await sql`
      CREATE TABLE IF NOT EXISTS prompt_history (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        prompt TEXT NOT NULL,
        enhanced_prompt TEXT,
        style TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 4. Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT,
        role TEXT DEFAULT 'Digital Creator',
        creations_count INTEGER DEFAULT 0,
        favorites_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 5. Seed users table if empty
    const userCountResult = await sql`SELECT COUNT(*)::int as count FROM users;`;
    const userCount = userCountResult[0]?.count || 0;
    if (userCount === 0) {
      console.log('[Database] Seeding Neon with default studio creators...');
      for (const u of DEFAULT_USERS) {
        await sql`
          INSERT INTO users (
            id, name, email, password_hash, avatar, role, creations_count, favorites_count, created_at
          ) VALUES (
            ${u.id}, ${u.name}, ${u.email}, ${u.passwordHash}, ${u.avatar}, ${u.role},
            ${u.creationsCount}, ${u.favoritesCount}, ${u.createdAt}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // 6. Check if generations table is empty, seed with initial mock art
    const countResult = await sql`SELECT COUNT(*)::int as count FROM generations;`;
    const count = countResult[0]?.count || 0;

    if (count === 0) {
      console.log('[Database] Seeding Neon with initial curated exhibition...');
      for (const item of INITIAL_GENERATIONS) {
        await sql`
          INSERT INTO generations (
            id, user_id, user_name, user_avatar, prompt, enhanced_prompt,
            image_url, style, aspect_ratio, quality, status, provider,
            created_at, is_favorite, is_public, likes, views, source_type
          ) VALUES (
            ${item.id}, ${item.userId}, ${item.userName}, ${item.userAvatar || null},
            ${item.prompt}, ${item.enhancedPrompt || null}, ${item.imageUrl},
            ${item.style}, ${item.aspectRatio}, ${item.quality}, ${item.status},
            ${item.provider}, ${item.createdAt}, ${item.isFavorite}, ${item.isPublic},
            ${item.likes}, ${item.views}, ${item.sourceType}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    isNeonReady = true;
    console.log('[Database] Neon PostgreSQL initialized successfully.');
    return true;
  } catch (error: any) {
    const errString = String(error?.message || error || '');
    const isConnRefused = errString.includes('ECONNREFUSED') || errString.includes('fetch failed');
    if (isConnRefused) {
      console.warn('[Database] Notice: Neon PostgreSQL endpoint is unreachable from this network (ECONNREFUSED / fetch failed).');
      console.log('[Database] Running seamlessly in local file storage mode (.data/generations.json). All artworks and edits will be saved locally.');
    } else {
      console.warn('[Database] Neon connection notice:', error?.message || error);
      console.log('[Database] Falling back to local file storage mode (.data/generations.json).');
    }
    isNeonReady = false;
    return false;
  }
}

/**
 * Helper to map snake_case SQL row to Generation object
 */
function mapRowToGeneration(row: any): Generation {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userAvatar: row.user_avatar || undefined,
    prompt: row.prompt,
    enhancedPrompt: row.enhanced_prompt || undefined,
    negativePrompt: row.negative_prompt || undefined,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url || undefined,
    style: row.style,
    aspectRatio: row.aspect_ratio,
    quality: row.quality,
    status: row.status,
    provider: row.provider,
    createdAt: typeof row.created_at === 'object' && row.created_at ? row.created_at.toISOString() : String(row.created_at),
    isFavorite: Boolean(row.is_favorite),
    isPublic: Boolean(row.is_public),
    likes: Number(row.likes) || 0,
    views: Number(row.views) || 0,
    sourceType: row.source_type || 'text-to-image',
  };
}

// ==========================================
// LOCAL FILE BACKUP STORAGE HELPERS
// ==========================================
export function getLocalGenerations(): Generation[] {
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const data = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local db file:', e);
  }
  return INITIAL_GENERATIONS;
}

export function saveLocalGenerations(data: Generation[]) {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving local db file:', e);
  }
}

export function getLocalUsers(): DbUser[] {
  try {
    if (fs.existsSync(LOCAL_USERS_FILE)) {
      const data = fs.readFileSync(LOCAL_USERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local users file:', e);
  }
  saveLocalUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

export function saveLocalUsers(data: DbUser[]) {
  try {
    fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving local users file:', e);
  }
}

// ==========================================
// USER REPOSITORY METHODS
// ==========================================

function mapRowToUser(row: any): DbUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: row.role || 'Digital Creator',
    creationsCount: Number(row.creations_count) || 0,
    favoritesCount: Number(row.favorites_count) || 0,
    createdAt: typeof row.created_at === 'object' && row.created_at ? row.created_at.toISOString() : String(row.created_at),
  };
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const normEmail = email.trim().toLowerCase();
  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      const rows: any[] = (await sql`SELECT * FROM users WHERE LOWER(email) = ${normEmail} LIMIT 1;`) as any;
      if (rows && rows.length > 0) {
        return mapRowToUser(rows[0]);
      }
    } catch (err) {
      console.warn('[Database] Neon user email lookup failed, checking local:', err);
    }
  }
  const localUsers = getLocalUsers();
  return localUsers.find(u => u.email.toLowerCase() === normEmail) || null;
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      const rows: any[] = (await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1;`) as any;
      if (rows && rows.length > 0) {
        return mapRowToUser(rows[0]);
      }
    } catch (err) {
      console.warn('[Database] Neon user ID lookup failed, checking local:', err);
    }
  }
  const localUsers = getLocalUsers();
  return localUsers.find(u => u.id === id) || null;
}

export async function createUser(userData: {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role?: string;
}): Promise<DbUser> {
  const passwordHash = hashPassword(userData.password);
  const newUser: DbUser = {
    id: userData.id,
    name: userData.name.trim(),
    email: userData.email.trim().toLowerCase(),
    passwordHash,
    avatar: userData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
    role: userData.role || 'Digital Creator',
    creationsCount: 0,
    favoritesCount: 0,
    createdAt: new Date().toISOString(),
  };

  // 1. Save to local storage cache
  const localUsers = getLocalUsers();
  const filtered = localUsers.filter(u => u.id !== newUser.id && u.email.toLowerCase() !== newUser.email.toLowerCase());
  saveLocalUsers([newUser, ...filtered]);

  // 2. Persist to Neon if available
  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      await sql`
        INSERT INTO users (
          id, name, email, password_hash, avatar, role, creations_count, favorites_count, created_at
        ) VALUES (
          ${newUser.id}, ${newUser.name}, ${newUser.email}, ${newUser.passwordHash},
          ${newUser.avatar}, ${newUser.role}, ${newUser.creationsCount}, ${newUser.favoritesCount},
          ${newUser.createdAt}
        ) ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          avatar = EXCLUDED.avatar,
          role = EXCLUDED.role;
      `;
      console.log(`[Database] Persisted new user ${newUser.email} to Neon.`);
    } catch (err) {
      console.warn('[Database] Failed to write user to Neon, cached locally:', err);
    }
  }

  return newUser;
}

export async function getAllUsers(): Promise<DbUser[]> {
  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      const rows: any[] = (await sql`SELECT * FROM users ORDER BY created_at ASC;`) as any;
      if (rows && rows.length > 0) {
        return rows.map(mapRowToUser);
      }
    } catch (err) {
      console.warn('[Database] Neon get all users error:', err);
    }
  }
  return getLocalUsers();
}

export async function verifyUserCredentials(email: string, password: string): Promise<DbUser | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) return null;
  return user;
}

export async function deleteUser(userId: string): Promise<boolean> {
  // 1. Delete from local cache
  const localUsers = getLocalUsers();
  const updated = localUsers.filter(u => u.id !== userId);
  saveLocalUsers(updated);

  // 2. Delete from Neon PostgreSQL if available
  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      await sql`DELETE FROM users WHERE id = ${userId};`;
      console.log(`[Database] Deleted user ${userId} from Neon.`);
    } catch (err) {
      console.warn('[Database] Failed to delete user from Neon:', err);
    }
  }

  return true;
}

export async function updateUser(
  id: string,
  updates: Partial<Pick<DbUser, 'name' | 'avatar' | 'role' | 'creationsCount' | 'favoritesCount'>>
): Promise<DbUser | null> {
  const localUsers = getLocalUsers();
  let updatedUser: DbUser | null = null;
  const nextUsers = localUsers.map(u => {
    if (u.id === id) {
      updatedUser = {
        ...u,
        ...updates,
      };
      return updatedUser;
    }
    return u;
  });

  if (updatedUser) {
    saveLocalUsers(nextUsers);
  }

  const sql = getNeonSql();
  if (sql && isNeonReady && updatedUser) {
    try {
      const u = updatedUser as DbUser;
      await sql`
        UPDATE users
        SET name = ${u.name},
            avatar = ${u.avatar},
            role = ${u.role},
            creations_count = ${u.creationsCount},
            favorites_count = ${u.favoritesCount}
        WHERE id = ${id};
      `;
    } catch (err) {
      console.warn('[Database] Failed to update user in Neon:', err);
    }
  }

  return updatedUser;
}

// ==========================================
// REPOSITORY METHODS (NEON WITH LOCAL FALLBACK)
// ==========================================

export async function getAllGenerations(filterUser?: string): Promise<Generation[]> {
  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      let rows;
      if (filterUser) {
        rows = await sql`
          SELECT * FROM generations 
          WHERE user_id = ${filterUser}
          ORDER BY created_at DESC;
        `;
      } else {
        rows = await sql`
          SELECT * FROM generations 
          ORDER BY created_at DESC;
        `;
      }
      return rows.map(mapRowToGeneration);
    } catch (err) {
      console.warn('[Database] Neon query failed, reading local cache:', err);
    }
  }

  // Fallback to local
  const local = getLocalGenerations();
  if (filterUser) {
    return local.filter(g => g.userId === filterUser);
  }
  return local;
}

export async function getGenerationById(id: string): Promise<Generation | null> {
  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      const rows: any[] = (await sql`SELECT * FROM generations WHERE id = ${id} LIMIT 1;`) as any;
      if (rows && rows.length > 0) {
        return mapRowToGeneration(rows[0]);
      }
    } catch (err) {
      console.warn('[Database] Neon lookup failed, checking local:', err);
    }
  }

  const local = getLocalGenerations();
  return local.find(g => g.id === id) || null;
}

export async function insertGeneration(gen: Generation): Promise<void> {
  // Always update local cache first
  const current = getLocalGenerations();
  const updated = [gen, ...current.filter(g => g.id !== gen.id)];
  saveLocalGenerations(updated);

  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      await sql`
        INSERT INTO generations (
          id, user_id, user_name, user_avatar, prompt, enhanced_prompt,
          negative_prompt, image_url, thumbnail_url, style, aspect_ratio,
          quality, status, provider, created_at, is_favorite, is_public,
          likes, views, source_type
        ) VALUES (
          ${gen.id}, ${gen.userId}, ${gen.userName}, ${gen.userAvatar || null},
          ${gen.prompt}, ${gen.enhancedPrompt || null}, ${gen.negativePrompt || null},
          ${gen.imageUrl}, ${gen.thumbnailUrl || null}, ${gen.style},
          ${gen.aspectRatio}, ${gen.quality}, ${gen.status}, ${gen.provider},
          ${gen.createdAt}, ${gen.isFavorite}, ${gen.isPublic},
          ${gen.likes || 0}, ${gen.views || 0}, ${gen.sourceType || 'text-to-image'}
        );
      `;
      console.log(`[Database] Persisted generation ${gen.id} to Neon.`);
    } catch (err) {
      console.error('[Database] Failed to insert generation into Neon:', err);
    }
  }
}

export async function updateFavorite(id: string, isFavorite: boolean, userId: string): Promise<boolean> {
  // Update local
  const current = getLocalGenerations();
  let found = false;
  const next = current.map(g => {
    if (g.id === id) {
      found = true;
      return { ...g, isFavorite };
    }
    return g;
  });
  if (found) saveLocalGenerations(next);

  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      await sql`
        UPDATE generations 
        SET is_favorite = ${isFavorite} 
        WHERE id = ${id};
      `;

      if (isFavorite) {
        await sql`
          INSERT INTO favorites (user_id, generation_id)
          VALUES (${userId}, ${id})
          ON CONFLICT (user_id, generation_id) DO NOTHING;
        `;
      } else {
        await sql`
          DELETE FROM favorites
          WHERE user_id = ${userId} AND generation_id = ${id};
        `;
      }
      return true;
    } catch (err) {
      console.error('[Database] Neon update favorite error:', err);
    }
  }
  return found;
}

export async function updatePublishStatus(id: string, isPublic: boolean): Promise<boolean> {
  const current = getLocalGenerations();
  let found = false;
  const next = current.map(g => {
    if (g.id === id) {
      found = true;
      return { ...g, isPublic };
    }
    return g;
  });
  if (found) saveLocalGenerations(next);

  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      await sql`
        UPDATE generations 
        SET is_public = ${isPublic} 
        WHERE id = ${id};
      `;
      return true;
    } catch (err) {
      console.error('[Database] Neon update publish error:', err);
    }
  }
  return found;
}

export async function addLike(id: string): Promise<number> {
  let newLikes = 1;
  const current = getLocalGenerations();
  const next = current.map(g => {
    if (g.id === id) {
      newLikes = (g.likes || 0) + 1;
      return { ...g, likes: newLikes };
    }
    return g;
  });
  saveLocalGenerations(next);

  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      const res: any[] = (await sql`
        UPDATE generations 
        SET likes = likes + 1 
        WHERE id = ${id}
        RETURNING likes;
      `) as any;
      if (res && res.length > 0) {
        newLikes = res[0].likes;
      }
    } catch (err) {
      console.error('[Database] Neon add like error:', err);
    }
  }
  return newLikes;
}

export async function removeGeneration(id: string): Promise<boolean> {
  const current = getLocalGenerations();
  const next = current.filter(g => g.id !== id);
  saveLocalGenerations(next);

  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      await sql`DELETE FROM generations WHERE id = ${id};`;
      await sql`DELETE FROM favorites WHERE generation_id = ${id};`;
      return true;
    } catch (err) {
      console.error('[Database] Neon delete error:', err);
    }
  }
  return true;
}

export async function logPromptHistory(userId: string, prompt: string, enhancedPrompt?: string, style?: string): Promise<void> {
  const sql = getNeonSql();
  if (sql && isNeonReady) {
    try {
      await sql`
        INSERT INTO prompt_history (user_id, prompt, enhanced_prompt, style)
        VALUES (${userId}, ${prompt}, ${enhancedPrompt || null}, ${style || null});
      `;
    } catch (err) {
      console.warn('[Database] Prompt history log notice:', err);
    }
  }
}

export function getDatabaseStatus() {
  const hasKey = !!process.env.DATABASE_URL;
  return {
    provider: hasKey ? 'Neon PostgreSQL' : 'Local JSON Persistence',
    isConfigured: hasKey,
    isConnected: isNeonReady,
    storageType: 'local (in-memory & filesystem)',
  };
}
