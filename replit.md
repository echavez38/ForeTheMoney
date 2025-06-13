# Fore the Money - Golf Scoring & Betting App

## Overview
Mobile-optimized web application for golf scoring and betting calculations specifically designed for Club Campestre de Puebla. Features local PIN-based authentication, real-time betting calculations (Skins, Oyeses, Foursomes), handicap-adjusted scoring, and offline functionality with Spanish dark UI.

## Project Architecture
- **Frontend**: React with TypeScript, Wouter routing, TailwindCSS
- **Backend**: Express.js with PostgreSQL database
- **Database**: Drizzle ORM with Neon PostgreSQL
- **UI Framework**: shadcn/ui components with custom golf theme
- **State Management**: React Query for server state, local storage for offline functionality

## Golf Course Data
**Club Campestre de Puebla** - Only available golf course in the application
- 18 holes with official par, stroke index, and distance data
- Six tee options with proper gender segregation:
  - **Hombres** (mayor a menor dificultad): Negras, Azules, Blancas, Doradas, Plateadas
  - **Mujeres**: Blancas, Rojas
- Distances in meters for each tee position
- Authentic data from club's official scorecard

## Recent Changes
**June 13, 2025**
- Updated Club Campestre de Puebla hole data with authentic yardages and layout
- Removed all other golf course options - only Club Campestre de Puebla available
- Added comprehensive tee selection system with visual indicators
- Implemented distance display based on selected tees
- Pre-selected Club Campestre de Puebla as default course choice
- **CORRECTED**: Fixed tee system to proper Club Campestre configuration:
  - Hombres: Negras (máxima), Azules, Blancas, Doradas, Plateadas (mínima)
  - Mujeres: Blancas (máxima), Rojas (mínima)
  - Updated all visual indicators with correct colors
- **FINAL UPDATE**: Applied official Club Campestre de Puebla data from CSV:
  - All 18 holes with exact par, stroke index, and distances
  - Six tee positions (Negras, Azules, Blancas, Doradas, Plateadas, Rojas) with precise yardages
  - Data directly from club's official records
- **ENHANCED TEE SYSTEM**: Separated Blancas into gender-specific options:
  - Blancas (H) for men with specific handicap calculations
  - Blancas (M) for women with different handicap adjustments
  - Updated visual indicators with pink border for women's Blancas
- **GAME FORMATS**: Added Stroke Play vs Match Play options:
  - Stroke Play: Traditional total score counting
  - Match Play: Hole-by-hole competition format
- **SEGMENT BETTING**: Implemented betting by course segments:
  - Front Nine (holes 1-9) betting
  - Back Nine (holes 10-18) betting  
  - Total 18-hole betting
  - Each segment can be enabled/disabled independently
- **DUAL FORMAT SYSTEM**: Enhanced game format selection:
  - Stroke Play and Match Play can be selected simultaneously
  - Independent calculations for each format when both enabled
  - Separate results display for each format in results page
  - Database schema updated to support dual formats

## User Preferences
- Spanish language interface
- Dark theme with professional golf app aesthetic
- Focus on Club Campestre de Puebla exclusively
- Authentic golf course data required (no mock/placeholder data)

## Key Features
- PIN-based user authentication
- Round creation with 2-6 players
- Real-time scorecard with betting calculations
- Handicap-adjusted net scoring
- Tee selection affects distance and handicap calculations
- Offline functionality with local storage