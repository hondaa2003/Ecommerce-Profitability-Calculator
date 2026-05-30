// LocalStorage-based auth system that works without Supabase backend.
// Used as a fallback when Supabase is unreachable or for demo mode.

const USERS_KEY = "local_users";
const SESSION_KEY = "local_session";

interface LocalUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

interface LocalSession {
  userId: string;
  name: string;
  email: string;
  token: string;
}

function getUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: LocalUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function uid(): string {
  return "user-" + Math.random().toString(36).slice(2, 10);
}

export const localAuth = {
  signUp(name: string, email: string, password: string): { user: LocalUser; session: LocalSession } {
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      throw new Error("An account with this email already exists.");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
    const user: LocalUser = {
      id: uid(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);

    const session: LocalSession = {
      userId: user.id,
      name: user.name,
      email: user.email,
      token: "local-" + uid() + "-" + uid(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { user, session };
  },

  signIn(email: string, password: string): LocalSession {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error("No account found with this email.");
    }
    if (user.password !== password) {
      throw new Error("Incorrect password.");
    }
    const session: LocalSession = {
      userId: user.id,
      name: user.name,
      email: user.email,
      token: "local-" + uid() + "-" + uid(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  getSession(): LocalSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getUser(): { id: string; name: string; email: string } | null {
    const session = this.getSession();
    if (!session) return null;
    return { id: session.userId, name: session.name, email: session.email };
  },

  signOut(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  // Also check demo mode
  isDemoMode(): boolean {
    return localStorage.getItem("demo_mode") === "true";
  },
};