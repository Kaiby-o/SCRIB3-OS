# SKILL: Dashboard Variants via Role Config

> **Domain:** UI Architecture — Role-Based Dashboard Rendering
> **Applies to:** SCRIB3-OS layer only (not DEVICE)
> **Core principle:** ONE component, ONE config map, ZERO duplication per role.

---

## The Pattern

SCRIB3-OS has a single `DashboardLayout.tsx` component that renders differently based on the authenticated user's role. The layout, navigation, modules, and labels are all driven by a centralised configuration map in `dashboardConfig.ts`.

**Never** create `TeamDashboard.tsx`, `ClientDashboard.tsx`, etc. If you find yourself writing a role-specific dashboard component, you're doing it wrong.

---

## Architecture

```
src/scrib3-os/
├── config/
│   └── dashboardConfig.ts    # Single source of truth for all role variants
├── components/
│   └── DashboardLayout.tsx   # Reads config, renders everything
├── pages/
│   └── DashboardPage.tsx     # Auth gate → role extraction → <DashboardLayout>
```

---

## dashboardConfig.ts — Structure

```typescript
import { type ReactNode } from 'react'

export type UserRole = 'admin' | 'team' | 'csuite' | 'client' | 'vendor'

export interface ModuleConfig {
  id: string
  label: string
  gridArea: string          // CSS Grid area name
  component: () => ReactNode // Lazy-loadable module component
}

export interface NavCategory {
  label: string             // Displayed in NavOverlay Layer 1 (Kaio:Black)
  subItems: string[]        // Displayed in NavOverlay Layer 2 (pink)
}

export interface DashboardConfig {
  headerLabel: string       // Top-left label or greeting
  pillNavItems: string[]    // Items shown in PillNav (top centre)
  categories: NavCategory[] // NavOverlay Layer 1 categories
  modules: ModuleConfig[]   // Bento grid module panels
  gridTemplate: string      // CSS Grid template-areas string
}

export const dashboardConfigs: Record<UserRole, DashboardConfig> = {
  team: {
    headerLabel: 'TEAM DASHBOARD',
    pillNavItems: ['Overview', 'Projects', 'Tasks', 'Files'],
    categories: [
      { label: 'TEAM', subItems: ['Directory', 'Profiles', 'Activity'] },
      { label: 'UNITS', subItems: ['Business Units', 'Departments'] },
      { label: 'CLIENTS', subItems: ['Client List', 'Onboarding'] },
      { label: 'PROJECTS', subItems: ['Active', 'Archived', 'Proposals'] },
      { label: 'CULTURE', subItems: ['Values', 'Events', 'Recognition'] },
      { label: 'TOOLS', subItems: ['Resources', 'Templates', 'Integrations'] },
    ],
    modules: [
      { id: 'active-projects', label: 'ACTIVE PROJECTS', gridArea: 'projects', component: () => null },
      { id: 'task-queue', label: 'TASK QUEUE', gridArea: 'tasks', component: () => null },
      { id: 'team-activity', label: 'TEAM ACTIVITY', gridArea: 'activity', component: () => null },
      { id: 'comms', label: 'INTERNAL COMMS', gridArea: 'comms', component: () => null },
      { id: 'recent-files', label: 'RECENT FILES', gridArea: 'files', component: () => null },
    ],
    gridTemplate: `
      "projects projects tasks"
      "activity comms comms"
      "files files files"
    `,
  },
  client: { /* ... same shape, different values */ },
  vendor: { /* ... */ },
  csuite: { /* ... */ },
  admin: { /* ... inherits team config + DEVICE access flag */ },
}
```

### Key rules for this config

1. **`gridTemplate`** defines the CSS Grid layout. Each `gridArea` in `modules` must appear in the template.
2. **`component`** returns `null` for placeholder modules. Replace with actual lazy-loaded components as they're built.
3. **Admin inherits team** but adds DEVICE access. Do this with spread: `admin: { ...dashboardConfigs.team, headerLabel: 'ADMIN DASHBOARD' }` — but define it after the `team` entry.
4. **Never hardcode role checks in JSX.** The config drives everything. If a role shouldn't see something, it's not in their config.

---

## DashboardLayout.tsx — Implementation Pattern

```typescript
export function DashboardLayout() {
  const role = useRole()  // Extract role from Supabase auth/profile
  const config = dashboardConfigs[role]

  return (
    <div className="relative min-h-screen bg-offWhite">
      {/* Top bar */}
      <header className="fixed top-0 w-full z-40 flex items-center justify-between px-[40px] h-[85px]">
        <Logo />
        <PillNav items={config.pillNavItems} />
        <HamburgerButton onClick={openOverlay} />
      </header>

      {/* Module grid */}
      <main
        className="pt-[85px] px-[40px] pb-[40px]"
        style={{
          display: 'grid',
          gridTemplateAreas: config.gridTemplate,
          gap: '16px',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridAutoRows: 'minmax(200px, auto)',
        }}
      >
        {config.modules.map((mod) => (
          <ModulePanel
            key={mod.id}
            label={mod.label}
            style={{ gridArea: mod.gridArea }}
          >
            {mod.component()}
          </ModulePanel>
        ))}
      </main>

      {/* Fixed elements */}
      <UserProfileCard className="fixed bottom-[40px] left-[40px] z-30" />
      <ClockDisplay className="fixed bottom-[120px] left-[40px] z-30" />

      {/* Nav overlay */}
      <NavOverlay categories={config.categories} />
    </div>
  )
}
```

### What this component does NOT do

- No `if (role === 'team')` blocks
- No role-specific JSX branches
- No separate files per role
- No dynamic imports based on role string

If a module needs role-specific behaviour internally (e.g., a project module showing different columns for client vs team), that logic lives inside the module component, not in the layout.

---

## Adding a New Role

1. Add the role string to the `UserRole` union type
2. Add a new entry in `dashboardConfigs` with the full config shape
3. Add the role to the Supabase `profiles.role` CHECK constraint
4. Add RLS policies for the new role (see SKILL-RLS-SUPABASE.md)
5. Done. No component changes needed.

---

## Adding a New Module

1. Create the module component in `src/scrib3-os/components/modules/`
2. Add it to the relevant role configs in `dashboardConfig.ts` (component field)
3. Add the grid area to `gridTemplate`
4. Done. No layout changes needed.

---

## Common Mistakes to Avoid

| Mistake | Correct approach |
|---------|-----------------|
| Creating `TeamDashboard.tsx` | Add config to `dashboardConfigs.team` |
| Hardcoding `if (role === 'client')` in layout | Put the difference in the config map |
| Different grid components per role | One grid, different `gridTemplate` strings |
| Importing role-specific modules in layout | Use the `component` field in config — lazy load |
| Putting nav categories in the NavOverlay component | Pass `config.categories` as a prop |
| Duplicating the header for different labels | `config.headerLabel` drives it |

---

## Tailwind Integration

The module grid uses inline `style` for `gridTemplateAreas` (Tailwind doesn't support arbitrary grid-template-areas well). Everything else uses Tailwind utility classes with custom tokens:

```
bg-offWhite       → #EAF2D7
text-black         → #000000
border-black       → #000000
rounded-panel      → 10.258px
rounded-pill       → 75.641px
font-kaio          → 'Kaio', sans-serif
font-owners        → 'Owners Wide', sans-serif
font-stardust      → 'NT Stardust', sans-serif
```

These are defined once in `tailwind.config.ts` via `tokens.ts`. Never use raw hex values in JSX or CSS.
