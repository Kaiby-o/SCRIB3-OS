# SKILL: Supabase Row Level Security for SCRIB3-OS

> **Domain:** Auth & Data Access — Role-Based RLS Policies
> **Applies to:** SCRIB3-OS Supabase project
> **Roles:** `admin`, `team`, `csuite`, `client`, `vendor`

---

## Role Hierarchy

```
admin   → full read/write on everything
csuite  → full read on all internal data, write on own profile
team    → full read on internal data, write on own tasks/profile
client  → read/write only on assigned projects and own profile
vendor  → read/write only on assigned tasks and own profile
```

---

## Schema Assumptions

### `profiles` table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'team'
    CHECK (role IN ('admin', 'team', 'csuite', 'client', 'vendor')),
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `projects` table

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `project_members` table (join table — who has access to which project)

```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member', 'client', 'vendor')),
  UNIQUE (project_id, user_id)
);
```

### `tasks` table

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'todo',
  priority INTEGER DEFAULT 3,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Helper Function — Get Current User's Role

```sql
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

This is used in every policy below. `SECURITY DEFINER` ensures it runs with elevated privileges to read the profiles table.

---

## RLS Policies

### Enable RLS on all tables

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

---

### `profiles` — Policies

```sql
-- Everyone can read their own profile
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Internal roles (admin, team, csuite) can read all profiles
CREATE POLICY "Internal roles read all profiles"
  ON profiles FOR SELECT
  USING (public.get_user_role() IN ('admin', 'team', 'csuite'));

-- Everyone can update their own profile
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin can update any profile (e.g., change roles)
CREATE POLICY "Admin updates any profile"
  ON profiles FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- Only admin can insert profiles (seed script runs as service_role)
CREATE POLICY "Admin inserts profiles"
  ON profiles FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');
```

---

### `projects` — Policies

```sql
-- Admin and csuite see all projects
CREATE POLICY "Admin/csuite read all projects"
  ON projects FOR SELECT
  USING (public.get_user_role() IN ('admin', 'csuite'));

-- Team members see all projects
CREATE POLICY "Team reads all projects"
  ON projects FOR SELECT
  USING (public.get_user_role() = 'team');

-- Clients and vendors see only their assigned projects
CREATE POLICY "External roles read assigned projects"
  ON projects FOR SELECT
  USING (
    public.get_user_role() IN ('client', 'vendor')
    AND id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

-- Only admin can create/update/delete projects
CREATE POLICY "Admin manages projects"
  ON projects FOR ALL
  USING (public.get_user_role() = 'admin');
```

---

### `project_members` — Policies

```sql
-- Internal roles see all memberships
CREATE POLICY "Internal roles read memberships"
  ON project_members FOR SELECT
  USING (public.get_user_role() IN ('admin', 'team', 'csuite'));

-- External roles see only their own memberships
CREATE POLICY "External roles read own memberships"
  ON project_members FOR SELECT
  USING (user_id = auth.uid());

-- Only admin manages memberships
CREATE POLICY "Admin manages memberships"
  ON project_members FOR ALL
  USING (public.get_user_role() = 'admin');
```

---

### `tasks` — Policies

```sql
-- Admin sees all tasks
CREATE POLICY "Admin reads all tasks"
  ON tasks FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Team and csuite see all tasks
CREATE POLICY "Internal roles read all tasks"
  ON tasks FOR SELECT
  USING (public.get_user_role() IN ('team', 'csuite'));

-- Clients see tasks in their projects
CREATE POLICY "Clients read project tasks"
  ON tasks FOR SELECT
  USING (
    public.get_user_role() = 'client'
    AND project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

-- Vendors see only tasks assigned to them
CREATE POLICY "Vendors read assigned tasks"
  ON tasks FOR SELECT
  USING (
    public.get_user_role() = 'vendor'
    AND assigned_to = auth.uid()
  );

-- Team members can update tasks assigned to them
CREATE POLICY "Team updates assigned tasks"
  ON tasks FOR UPDATE
  USING (
    public.get_user_role() IN ('admin', 'team')
    AND assigned_to = auth.uid()
  );

-- Admin can manage all tasks
CREATE POLICY "Admin manages all tasks"
  ON tasks FOR ALL
  USING (public.get_user_role() = 'admin');
```

---

## Applying Policies — Checklist

When adding a new table to the SCRIB3-OS schema:

1. **Enable RLS:** `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`
2. **Default deny:** RLS is deny-by-default when enabled. No policy = no access.
3. **Write the `get_user_role()` check** into every policy that's role-dependent.
4. **Test each role:** Log in as each seeded user and verify they see only what they should.
5. **Service role bypass:** The seed script and admin operations use the Supabase `service_role` key, which bypasses RLS. Never expose this key to the client.

---

## Common Patterns

### "User sees only their own data"

```sql
CREATE POLICY "user_own_data"
  ON <table> FOR SELECT
  USING (<user_column> = auth.uid());
```

### "Internal roles see everything"

```sql
CREATE POLICY "internal_read_all"
  ON <table> FOR SELECT
  USING (public.get_user_role() IN ('admin', 'team', 'csuite'));
```

### "Scoped by project assignment"

```sql
CREATE POLICY "scoped_by_project"
  ON <table> FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );
```

---

## Security Notes

- **Never trust client-side role checks alone.** RLS is the enforcement layer. Client-side role checks (hiding UI elements) are UX convenience only.
- **The `get_user_role()` function is `SECURITY DEFINER`** — it reads `profiles` even if the calling user doesn't have SELECT on that table. This is intentional and safe.
- **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) is used in `scripts/seed-users.ts` only. It bypasses RLS. Never include it in client-side code or expose it in the browser.
- **JWT claims:** Supabase embeds `auth.uid()` in the JWT. The role comes from the `profiles` table, not the JWT. This means role changes take effect on the next query, not the next login. If you need instant role propagation, use Supabase custom claims (future optimisation).

---

## Testing RLS

After applying policies, test with the Supabase SQL editor or via the app:

```sql
-- Impersonate a user (SQL editor only)
SET request.jwt.claims = '{"sub": "<user-uuid>"}';
SELECT * FROM projects;  -- Should return only what that user's role allows
```

Or log in as each seeded user in the app and verify:
- Admin sees everything
- Team sees all internal data
- Client sees only assigned projects
- Vendor sees only assigned tasks
