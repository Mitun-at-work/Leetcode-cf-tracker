# 🎯 LeetCode + CodeForces Tracker

A simple, local-storage-based web application to track your coding problem-solving progress across LeetCode and CodeForces platforms.

![Project Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%2B%20TypeScript%20%2B%20Vite-blue)
![Storage](https://img.shields.io/badge/Storage-LocalStorage-orange)

## ✨ Features

### 🎯 Core Functionality

- **Add Problems**: Manually track problems you've solved
- **Platform Support**: Both LeetCode and CodeForces
- **Smart Detection**: Auto-detect platform and problem details from URLs
- **Review System**: Mark problems for future review with spaced repetition
- **Search & Filter**: Find problems by title, platform, difficulty, or notes

### 📊 Analytics & Insights

- **Progress Dashboard**: Overview of your solving activity
- **Streak Tracking**: Daily solving streaks with GitHub-style heatmap
- **Platform Statistics**: LeetCode vs CodeForces breakdown
- **Difficulty Analysis**: Easy/Medium/Hard distribution
- **Time-based Stats**: Weekly and monthly progress
- **Progress Insights**: Smart recommendations and patterns

### � Code Execution

- **C++ Code Runner**: Compile and execute C++ code directly in the browser
- **Safe Execution**: Isolated environment with timeout protection
- **Real-time Output**: See compilation and execution results instantly

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker (optional, for full-stack deployment)

### Installation

1. **Clone or download the project**

   ```bash
   # If using git
   git clone <repository-url>
   cd leetcode-cf-tracker

   # Or extract if downloaded as ZIP
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Start tracking your problems!

### Running with Code Execution (Full Stack)

For the complete experience with C++ code execution:

```bash
# Start all services with Docker Compose
docker-compose up --build

# Or run services individually:
# Terminal 1: C++ executor service
cd cpp-executor && docker-compose up --build

# Terminal 2: Backend API
cd server && npm run dev

# Terminal 3: Frontend
npm run dev
```

The C++ execution service will be available at `http://localhost:8081`, and the full API at `http://localhost:3001`.

### Building for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**
2. **Visit [vercel.com](https://vercel.com) and sign up**
3. **Import your GitHub repository**
4. **Deploy with one click!**

Or use Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```

### Deploy to Netlify

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Drag and drop the `dist` folder to [netlify.com/drop](https://app.netlify.com/drop)**

Or connect your GitHub repo at [netlify.com](https://netlify.com)

### Deploy to GitHub Pages

1. **Install gh-pages**

   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**

   ```json
   {
     "homepage": "https://yourusername.github.io/leetcode-cf-tracker",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

### Custom Domain Setup

For any platform, you can add a custom domain:

- **Vercel**: Project Settings → Domains
- **Netlify**: Site Settings → Domain Management
- **GitHub Pages**: Repository Settings → Pages

## 📱 Usage Guide

### Adding Your First Problem

1. **Click "Add Problem" or go to Problems tab**
2. **Select Platform**: Choose LeetCode or CodeForces
3. **Paste URL** (optional): Auto-fills details
4. **Fill Details**:
   - Problem title
   - Difficulty (Easy/Medium/Hard for LC, rating for CF)
   - Date solved
   - Notes (solution approach, topics, etc.)
5. **Mark for Review** (optional)
6. **Click "Add Problem"**

### Managing Problems

- **Search**: Use the search bar to find specific problems
- **Filter**: Filter by platform, difficulty, or review status
- **Sort**: Sort by date, title, or difficulty
- **Star for Review**: Click the star icon to mark/unmark for review
- **Delete**: Click the trash icon to remove a problem

### Understanding Analytics

- **Total Problems**: All problems you've solved
- **Current Streak**: Consecutive days you've solved problems
- **Heatmap**: GitHub-style contribution graph showing daily activity
- **This Week/Month**: Recent activity
- **Platform Distribution**: Your LeetCode vs CodeForces activity
- **Insights**: Smart observations about your progress

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage
- **Date Handling**: date-fns

## 📁 Project Structure

```
leetcode-cf-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main overview with heatmap
│   │   ├── ProblemForm.tsx  # Problem addition form
│   │   ├── ProblemList.tsx  # Problem listing with filters
│   │   ├── Analytics.tsx    # Progress analytics
│   │   └── ui/             # Reusable UI components
│   ├── utils/              # Utility functions
│   │   ├── storage.ts      # LocalStorage management
│   │   └── analytics.ts    # Data analysis functions
│   ├── types/              # TypeScript definitions
│   └── lib/               # Helper libraries
├── public/                # Static assets
└── dist/                 # Build output (generated)
```

## 🔒 Privacy & Data

- **100% Local**: All data stored in your browser's localStorage
- **No Tracking**: No analytics, cookies, or user tracking
- **No Accounts**: No sign-up or login required
- **Offline First**: Works without internet after first load
- **Export/Import**: Full control over your data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

- **Issues**: Report bugs or request features on GitHub
- **Discussions**: Join community discussions
- **Documentation**: Check the wiki for detailed guides

---

**Happy Coding! 🚀**
