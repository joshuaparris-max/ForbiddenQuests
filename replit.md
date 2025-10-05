# Forbidden Lands Lite

## Overview

Forbidden Lands Lite is a browser-based TTRPG tool for playing Forbidden Lands-style tabletop RPG games. It provides comprehensive character management, dice rolling mechanics based on the Year Zero Engine, exploration tracking, combat helpers, and campaign management tools. The application runs entirely in the browser with local data persistence, designed to support both solo GM play and small-group sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework Stack:**
- Vite as the build tool and dev server
- React 18+ with TypeScript for type safety
- Wouter for lightweight client-side routing
- Component-driven architecture with page/component separation

**State Management:**
- Zustand for reactive global state management
- Zustand persist middleware for localStorage integration
- State organized around core domains: characters, campaigns, items, combat, exploration

**UI Component System:**
- shadcn/ui component library (Radix UI primitives)
- TailwindCSS for styling with custom design tokens
- Dark fantasy theme with purple primary (#8b5cf6) and amber secondary (#f59e0b)
- Custom CSS variables for consistent theming
- Typography: Inter for sans-serif, Cinzel for serif headers, JetBrains Mono for code

**Key Design Patterns:**
- Three-column layout: Session Log (left), Main Content (center), Dice Roller (right)
- Sticky side panels for dice roller and session log
- Responsive grid system that collapses to single column on mobile
- Keyboard shortcuts for common actions (R = roll, P = push, C = clear)

### Backend Architecture

**Server Structure:**
- Express.js server with TypeScript
- Vite middleware integration for HMR in development
- Minimal backend - primarily serves the SPA
- Route registration system in `server/routes.ts` (currently unused)

**Data Persistence Strategy:**
- Primary: Browser localStorage via Zustand persist
- JSON export/import functionality for backups
- No active database usage (Drizzle/PostgreSQL configured but not implemented)
- Storage interface defined but using in-memory implementation

**Rationale:**
The application was designed to work offline-first with no backend dependencies. The Drizzle/PostgreSQL setup exists for potential future multi-user features, but the current architecture favors simplicity and portability through localStorage.

### Core Game Mechanics

**Year Zero Dice System:**
- Roll pools of d6 dice (attribute + skill + gear)
- Success on 6, failure otherwise
- Push mechanic: re-roll non-successes once, but 1s become banes
- Dice rolling logic in `client/src/lib/dice.ts`

**Character System:**
- Four attributes: STR, AGI, WIT, EMP (1-6 scale)
- Skill system with experience costs for leveling
- Damage tracking per attribute
- Conditions, talents, pride, and dark secrets
- Gear with encumbrance tracking

**Campaign Management:**
- Multiple campaigns with party management
- Hex-based exploration with terrain types and threat levels
- Party resource tracking (food, water, arrows)
- Weather and time-of-day systems

**Combat System:**
- Initiative-based turn tracker
- Fast/slow action economy
- Combatant health and armor tracking
- Condition management per combatant

**Stronghold System:**
- Building projects with construction timelines
- Upkeep cost tracking
- Project status: planned, in-progress, completed

### Data Schema

**Type Safety:**
- Zod schemas in `shared/schema.ts` for runtime validation
- TypeScript interfaces derived from Zod schemas
- Shared types between frontend and (potential) backend

**Key Entities:**
- Character: attributes, skills, talents, conditions, inventory
- Campaign: party members, hexes, resources, combat encounters
- Item: type (weapon/armor/tool/consumable), bonus, weight
- Combat: combatants with initiative, actions, health
- StrongholdProject: name, duration, upkeep, effects

### Session Logging

**Automatic Event Tracking:**
- All game actions logged with timestamps
- Color-coded by event type (roll, combat, exploration, system)
- Character attribution for actions
- Copy/export functionality
- Clear log capability

## External Dependencies

**UI Libraries:**
- @radix-ui/* - Accessible component primitives (18+ packages)
- shadcn/ui - Pre-built component patterns
- class-variance-authority - Component variant management
- tailwindcss - Utility-first CSS framework
- lucide-react - Icon library

**State & Data:**
- zustand - Lightweight state management
- @tanstack/react-query - Server state management (configured but minimal usage)
- zod - Runtime type validation
- drizzle-orm - ORM (configured but not actively used)
- @neondatabase/serverless - PostgreSQL driver (configured but inactive)

**Development Tools:**
- vite - Build tool and dev server
- typescript - Type checking
- tsx - TypeScript execution
- esbuild - Production bundling
- @replit/* - Replit-specific development tools

**Fonts:**
- Google Fonts: Inter, Cinzel, JetBrains Mono
- Loaded via CDN in index.html

**Date Handling:**
- date-fns - Date formatting and manipulation

**Forms:**
- react-hook-form - Form state management
- @hookform/resolvers - Form validation integration

**Notable Absence:**
- No authentication system
- No real-time collaboration features
- No server-side database in active use
- All data stored client-side in localStorage