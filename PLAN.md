# Next-Grade Redesign + Future Collaboration Platform Plan

## Summary
Rebuild the product as a premium, futuristic collaborative document workspace, not a generic storage app. Deliver it as a phased rollout on the existing Next.js + Spring Boot stack: first establish a new visual system and animated application shell, then migrate the full product surface, then extend the platform from file storage into a team collaboration system.

Design direction is locked to:
- Futuristic motion-led SaaS
- Full product redesign
- Rebrand-level visual system refresh
- Curated subset of external UI libraries
- Team collaboration as the long-term product north star
- Phased rollout over the existing app

## Key Changes
### 1. Design System Foundation
- Replace the current neutral shadcn baseline with a bespoke design language: sharper typography, richer surfaces, stronger depth, polished gradients, glass/mesh accents, and restrained enterprise contrast.
- Keep `shadcn/ui` as the structural base for accessibility and composability.
- Curate external inspirations/primitives instead of mixing everything:
  - `React Bits` for expressive animated micro-surfaces and interaction patterns
  - `Motion Primitives` for reusable Framer Motion wrappers and transition choreography
  - `Aceternity UI` and `Magic Patterns` for hero/background/presentation motifs only
  - `SyntaxUI` and `Skeleton` for layout/content block ideas where they fit the system
  - `Ant Design Button`, `MUI`, and `Konsta UI` are reference-only unless a specific missing interaction justifies them
- Create shared tokens for color, radius, shadows, spacing, blur, motion timing, and depth; all new UI must consume tokens rather than per-page styling.
- Replace `Inter` with a more intentional pairing:
  - Primary: modern grotesk/sans with stronger product character
  - Secondary: mono or narrow accent face for metadata, shortcuts, and system labels
- Define motion rules once: page transitions, staggered reveals, hover elevation, route-state transitions, dialog choreography, loading skeletons, and reduced-motion fallbacks.

### 2. Public-Facing Experience
- Rebuild the landing page as a product narrative for a serious collaborative platform:
  - cinematic hero
  - animated product preview/mock workspace
  - proof sections for search, collaboration, versioning, and governance
  - enterprise trust/integration band
  - role-based use cases
  - stronger CTA flow into auth/demo
- Redesign login/register/OAuth callback states to feel like part of the same premium system, with high-end auth layouts instead of default forms.
- Refresh metadata/OG imagery direction to match the new product identity.

### 3. Authenticated App Shell
- Rebuild the dashboard shell first because it unlocks phased migration:
  - new sidebar, top nav, command palette surface, notifications, user menu, storage meter, onboarding flow
  - responsive desktop/tablet/mobile behavior with intentional motion and layout transitions
  - unified empty/loading/error/skeleton states
- Turn the current dashboard into a true workspace:
  - overview as “mission control”
  - recent activity, collaboration feed, quick actions, smart search, pinned workspaces
- Standardize screen composition for all existing routes under the dashboard group so feature pages inherit the same visual grammar.

### 4. Document Workspace Redesign
- Rebuild document/folder browsing as the main product experience:
  - richer file cards and list rows
  - split-pane browsing
  - preview-first interactions
  - multi-select and bulk action ergonomics
  - better drag/drop affordances
  - stronger move/share/version dialogs
- Upgrade the information architecture from “files in folders” to “documents in collaborative spaces”:
  - introduce workspace/project/team context in navigation and page hierarchy
  - keep folder support, but stop making it the only organizing model
- Redesign shared/public-link views to feel first-class, not edge cases.
- Preserve existing backend-backed capabilities where available: upload, rename, move, copy, favorites, tags, versions, sharing, trash, comments, notifications, dashboard stats.

### 5. Future System Upgrade: From Storage to Collaboration Platform
Phase the product roadmap beyond storage into a future-ready collaboration system.

Planned product additions:
- Workspaces and teams:
  - team/workspace switcher
  - member roles
  - shared spaces
  - scoped navigation and storage
- Collaboration layer:
  - document threads, inline comments, mentions, assignments, approvals, activity timelines, live presence/read state
- Knowledge layer:
  - universal search across files, comments, tags, people, and shared spaces
  - saved views, smart collections, recents, pinned resources
- Workflow layer:
  - review states, due dates, reminders, request-for-approval, inbox/notifications triage
- Governance layer:
  - audit trail, admin controls, retention policy UI, access reviews, share analytics
- Intelligence-ready foundation:
  - reserve UI/API seams for AI summaries, extraction, classification, and semantic search, but do not make AI the core v1 identity

Implementation-level additions to public interfaces/types:
- Frontend route model evolves from flat dashboard sections to workspace-aware routes
- Frontend types expand to include `Workspace`, `Member`, `Role`, `ActivityThread`, `Task/Approval`, and richer notification payloads
- Backend API expansion after redesign foundation:
  - workspace/team CRUD
  - membership and permission endpoints
  - collaboration thread/comment endpoints
  - activity aggregation endpoints
  - saved-view/search endpoints
- Existing document APIs remain backward compatible during redesign rollout; the first redesign phase should avoid breaking backend contracts.

### 6. Delivery Sequence
1. Design tokens, typography, motion primitives, and global shell patterns
2. Landing/auth redesign
3. Dashboard shell migration
4. Core document browsing and preview workflows
5. Sharing, comments, notifications, settings, admin, public share surfaces
6. Workspace/team architecture and collaboration APIs
7. Governance/intelligence enhancements

## Test Plan
- Visual/system checks:
  - every major route has consistent tokens, spacing, states, and reduced-motion support
  - desktop, tablet, and mobile layouts are intentional, not merely responsive
- UX flow checks:
  - landing to auth conversion flow
  - login/register/OAuth success and error states
  - dashboard navigation, command palette, upload, preview, share, move, trash, and onboarding
- Regression checks:
  - current backend document, folder, share, version, notification, and auth flows still function under the new UI
- Accessibility checks:
  - keyboard navigation, focus visibility, contrast, motion fallback, dialog semantics
- Collaboration expansion checks:
  - workspace switching
  - role-based visibility
  - thread/comment lifecycle
  - notification/read-state behavior
- Performance checks:
  - route transitions stay smooth
  - animation budget is controlled
  - heavy surfaces degrade gracefully on low-power/mobile devices

## Assumptions And Defaults
- Existing backend capability is more advanced than the current visual presentation, so redesign should reuse APIs before inventing new ones.
- `shadcn/ui` remains the accessibility and composition backbone; external libraries are curated inspirations/primitives, not a wholesale multi-library mashup.
- The first implementation phase is frontend-heavy and should avoid unnecessary backend rewrites.
- Brand name stays `DocOrganiser` for now, but the visual identity is treated as new.
- The repo already contains many feature components and dashboard routes, so the preferred strategy is migrate-and-upgrade, not delete-and-replace.
