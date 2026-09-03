/**
 * Content for the application-surface tabs and the evaluation-lens carousel.
 *
 * Every claim here is release-labelled. `PLAN.md` in the framework repository owns the
 * roadmap; nothing on this page may promise a capability that PLAN.md does not schedule, and
 * nothing may describe a planned capability in the present tense (PLAN.md §26.6, and
 * constitution principle X — no claim exceeding measurement).
 *
 * The prototype carried each tab icon as a raw SVG string rendered through
 * `dangerouslySetInnerHTML`. That is replaced by `lucide-react` components: the icons come
 * from a maintained set instead of hand-copied markup, and they inherit `currentColor` and
 * stroke width from CSS. This removes HTML injection from the data-driven content surface.
 * The only remaining `dangerouslySetInnerHTML` is the constant, CSP-hashed theme bootstrap in
 * `layout.tsx`; no content value reaches it.
 */

import { Database, Fingerprint, GalleryHorizontalEnd, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SolutionId = 'backend' | 'data' | 'identity' | 'delivery';

export interface Solution {
  roadmap: string;
  title: string;
  copy: string;
  list: string[];
}

export const SOLUTION_ICONS: Record<SolutionId, LucideIcon> = {
  backend: Workflow,
  data: Database,
  identity: Fingerprint,
  delivery: GalleryHorizontalEnd,
};

export const SOLUTIONS: Record<SolutionId, Solution> = {
  backend: {
    roadmap: 'Delivered in Phase 004 / unpublished',
    title: 'A visible route into the service.',
    copy: 'The opt-in REST and HTTP delivery adapter is implemented and tested against real routers. It owns declarative routes, middleware order, trusted-proxy identity, host validation, CORS, limits, and graceful drain. GraphQL is planned for 2.0 and does not exist.',
    list: ['Real-router test evidence', 'OpenAPI 3.2 description', 'Fail-closed request boundaries'],
  },
  data: {
    roadmap: 'Delivered in Phases 006–008 / unpublished',
    title: 'Persistence owned at the junction.',
    copy: 'Driver-neutral repository and unit-of-work ports are implemented by both direct SQLx and SeaORM adapters. The same migrations and compatibility tests run on PostgreSQL and MySQL; the facade does not expose these adapters yet.',
    list: ['SQLx and SeaORM adapters', 'PostgreSQL and MySQL evidence', 'Repository capability ports'],
  },
  identity: {
    roadmap: 'Backend delivered in Phase 009 / UI planned for 3.0',
    title: 'Identity with one accountable route.',
    copy: 'The authentication domain and HTTP adapter implement registration, verification, recovery, cookie sessions, CSRF binding, policies, audit events, and optional JWT and refresh-token flows. No generated authentication UI exists yet.',
    list: ['Argon2id credentials', 'Opaque sessions or optional tokens', 'RBAC package planned for 4.0'],
  },
  delivery: {
    roadmap: 'Planned for Renvor 3.0',
    title: 'Delivery without hiding the boundary.',
    copy: 'The design: Next.js, Yew, Dioxus, or Leptos clients with CSS, SCSS, or optional Tailwind CSS, and Tauri packaging for supported static clients. No client generator exists yet.',
    list: ['Four frontend frameworks', 'Three styling systems', 'Tauri desktop target'],
  },
};

export const LENSES = [
  {
    title: 'Routes stay visible',
    copy: 'Handlers, services, policies, ports, configuration, and errors stay ordinary Rust types with searchable ownership. The tested kernel, transactional generator, and opt-in REST adapter use this shape today. Frontend and package generation do not exist.',
  },
  {
    title: 'The junction stays owned',
    copy: 'Mature ecosystem crates sit behind narrow framework boundaries, so an application keeps a stable contract without freezing an implementation choice. The project applies that rule to itself and departs from it only through a recorded, reviewed decision.',
  },
  {
    title: 'Evidence stays readable',
    copy: 'Diagnostics, health, readiness, draining, and rollback belong to the shape of an application rather than arriving later. The workspace also tests both persistence models and the authentication domain across PostgreSQL and MySQL. Telemetry and application deployment tooling remain planned.',
  },
];
