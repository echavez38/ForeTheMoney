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
**Multiple Golf Course Support** - Two authentic golf courses available:

### Club Campestre de Puebla
- 18 holes with official par, stroke index, and distance data
- Six tee options with proper gender segregation:
  - **Hombres** (mayor a menor dificultad): Negras, Azules, Blancas, Doradas, Plateadas
  - **Mujeres**: Blancas, Rojas
- Distances in meters for each tee position
- Authentic data from club's official scorecard

### La Vista Country Club
- 18 holes with official par, stroke index, and distance data from CSV
- Four tee options: Azules, Blancas, Doradas, Rojas
- All distances in meters from authentic course records
- Proper handicap indexing for each hole

## Recent Changes
**June 15, 2025**
- **COMPREHENSIVE FEATURE EXPANSION**: Major upgrade transforming the app into a complete golf management platform:

  **🏆 ACHIEVEMENTS & BADGES SYSTEM**: 
  - Complete achievement tracking across 4 categories (Scoring, Consistency, Social, Milestones)
  - 20+ unlockable achievements with bronze/silver/gold/platinum difficulty levels
  - Point-based scoring system with progress tracking
  - Social sharing capabilities for achievements
  - Visual badge system with category-specific icons and colors

  **📊 ADVANCED ANALYTICS DASHBOARD**:
  - Multi-tab analytics with Progress, Holes, Performance, and Trends views
  - Interactive charts for score evolution, handicap tracking, and performance distribution
  - Hole-by-hole analysis with difficulty ratings and birdie rates
  - Monthly statistics with earnings and rounds tracking
  - Filtering by time periods and golf courses
  - Moving averages and trend analysis

  **👥 SOCIAL GOLF FEATURES**:
  - Friend system with mutual connections and online status
  - Dynamic leaderboards by handicap, winnings, rounds, and improvement
  - Activity feed with round sharing, likes, and comments
  - Social invitations via email and shareable codes
  - Multi-platform sharing (Facebook, Twitter, WhatsApp)
  - Real-time activity updates and notifications

  **🔔 PUSH NOTIFICATION SYSTEM**:
  - Comprehensive notification preferences with 8 different types
  - Service Worker integration for background notifications
  - Quiet hours configuration and sound settings
  - Priority-based notifications (high/medium/low)
  - Real-time notification management interface

  **🧭 COURSE TOOLS & CONDITIONS**:
  - Advanced distance calculator with weather adjustments
  - Real-time weather data integration (temperature, wind, humidity)
  - Club recommendation system based on conditions
  - Hole-specific notes with club and weather tracking
  - Elevation and wind speed adjustments for distance calculations

  **⚙️ COMPREHENSIVE SETTINGS**:
  - Complete user profile management with GHIN integration
  - Authentication method switching (PIN/password)
  - Game preferences with default tees and betting amounts
  - Privacy controls and data export options
  - Account deletion with confirmation workflow

**June 14, 2025**
- **GHIN HANDICAP INTEGRATION**: Official USGA handicap verification system implemented
- **SUBSCRIPTION SYSTEM**: Comprehensive freemium business model with Basic Golf (free) vs Pro Golfer ($4.99/month)
- **EMAIL WELCOME SYSTEM**: Automatic welcome emails with professional templates

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
  - **Custom Stroke Play bet amounts**: Individual values for each segment ($10 front, $10 back, $20 total by default)
  - **Custom Match Play bet amounts**: Individual values for each segment ($15 front, $15 back, $30 total by default)
  - Configuration interface shows only enabled segments
  - Backward compatibility for existing rounds
  - **Currency change**: All monetary displays now use $ instead of €
- **DUAL FORMAT SYSTEM**: Enhanced game format selection:
  - Stroke Play and Match Play can be selected simultaneously
  - Independent calculations for each format when both enabled
  - Separate results display for each format in results page
  - Database schema updated to support dual formats
- **PROFESSIONAL GOLF SCORECARD**: Added authentic golf scorecard view:
  - Two-section layout (OUT/IN) matching real golf scorecards
  - Displays yardages and handicaps per player's selected tee
  - Shows gross/net scores with proper golf formatting
  - Accessible via card icon button during gameplay
  - Complete summary with money balances and performance statistics
  - **Match Play & Stroke Play sections**: Hoyo-por-hoyo status tracking when formats are selected
  - Color-coded indicators for each hole showing current standing vs competition
- **PAR CORRECTIONS**: Updated Club Campestre de Puebla hole pars:
  - Hoyo 6: Par 4 (was Par 5), Hoyo 8: Par 3 (was Par 4)
  - Hoyo 9: Par 5 (was Par 3), Hoyo 12: Par 5 (was Par 3)
  - Hoyo 13: Par 3 (was Par 5), Hoyo 15: Par 5 (was Par 3)
  - Hoyo 17: Par 3 (was Par 5)
- **REAL-TIME SCORING INDICATORS**: Enhanced scorecard with live status tracking:
  - Stroke Play indicators show position relative to par (E, +1, -2, etc.)
  - Match Play indicators show hole-by-hole wins/losses (AS, 1 UP, 2 DN, etc.)
  - Correct Match Play logic: each hole awards +1, -1, or 0 points only
  - Individual player status displayed under each name
  - Tournament status panel with live rankings for both formats
  - Color-coded indicators (green=good, red=behind, blue=even)
- **THEGRINT-STYLE TRANSFORMATION**: Major UI/UX overhaul inspired by TheGrint app:
  - Advanced analytics dashboard with performance metrics and trends
  - Achievement system with unlockable badges and progress tracking
  - Modern gradient cards with improved data visualization
  - Professional performance overview section with key statistics
  - Detailed analytics page with handicap analysis and financial performance
  - Enhanced recent rounds display with score-to-par indicators
  - Modern bottom navigation with floating action button design
  - Win rate calculations and earning analysis features
  - Best/worst round tracking with detailed performance insights
- **COMPREHENSIVE ROUND DEBRIEFING**: Complete post-round analysis and summary:
  - Dedicated debriefing page with tabbed interface (Overview, Betting, Scores)
  - Winner announcement with performance celebration
  - Detailed leaderboard with final standings and earnings
  - Segment-by-segment betting results (Front Nine, Back Nine, Total)
  - Individual player scorecards with hole-by-hole breakdown
  - Betting configuration summary and final money distribution
  - Seamless transition from scorecard completion to debriefing
  - Modern card-based layout with TheGrint-style visual design
- **CORRECTED BETTING CALCULATIONS**: Fixed money distribution system:
  - Proper handicap-based net score calculations using hole stroke index
  - Accurate segment betting for Front Nine, Back Nine, and Total rounds
  - Winner receives total pot minus their contribution, losers lose their bet
  - Correct tie handling with proportional money splitting among winners
  - Separate calculations for Stroke Play and Match Play formats
  - Fixed JavaScript errors preventing round completion workflow
- **ABANDON ROUND FEATURE**: Added functionality to exit rounds in progress:
  - Red X button in scorecard header for easy access
  - Confirmation toast message when abandoning a round
  - Clears current round from storage and returns to dashboard
  - Prevents loss of progress for completed holes
- **OYESES (CLOSEST TO PIN) BETTING**: Implemented par 3 betting system:
  - Special section appears only on par 3 holes when Oyeses betting is enabled
  - Players can select who won "closest to pin" for each par 3
  - Visual interface with yellow gradient and target icons
  - Winner receives money from all players (unitPerHole × player count)
  - Integration with overall betting calculations and debriefing results
  - Persistent storage of Oyeses winners per hole in round data
- **LA VISTA COUNTRY CLUB ADDED**: Second golf course now available:
  - Complete 18-hole course data imported from authentic CSV file
  - Four tee options: Azules, Blancas, Doradas, Rojas
  - Official par, handicap, and distance data for all holes
  - Course selection interface in round creation with dynamic tee options
  - Automatic course-specific data loading in scorecards and gameplay
  - Full integration with all betting systems and golf scorecard views

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