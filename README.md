# Forbidden Lands Lite

A browser-based TTRPG tool for playing Forbidden Lands-style games with comprehensive character management, dice rolling, exploration tracking, and combat helpers.

## Features

### Core Gameplay
- **Character Management**: Create and manage characters with attributes (STR/AGI/WIT/EMP), skills, talents, gear, pride, and dark secrets
- **Year Zero Dice System**: Roll d6 pools where 6 = success and 1 = bane (when pushed)
- **Push Mechanics**: Re-roll non-successes once per roll, but risk additional banes
- **Experience System**: Spend XP to level up skills with escalating costs

### Campaign Tools
- **Exploration Tracker**: Manage hex-based locations with terrain types, threat levels, weather, and party resources
- **Combat Helper**: Initiative-based turn tracking with fast/slow actions and condition management
- **Item Library**: Comprehensive equipment system with encumbrance tracking and party inventory
- **Stronghold Manager**: Build and upgrade fortress structures with construction timelines and upkeep costs
- **Session Logging**: Automatic logging of all game events with timestamps and character attribution

### User Interface
- **Dark Theme**: Immersive dark fantasy aesthetic with purple primary and amber secondary colors
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Keyboard Shortcuts**: Quick actions for common operations (R = roll, P = push, C = clear)
- **Sticky Panels**: Dice roller and session log remain accessible while browsing
- **Real-time Updates**: All changes are automatically saved to local storage

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **State Management**: Zustand for reactive state management
- **Styling**: TailwindCSS with custom design system
- **UI Components**: shadcn/ui component library
- **Data Persistence**: Browser localStorage with JSON export/import
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd forbidden-lands-lite
