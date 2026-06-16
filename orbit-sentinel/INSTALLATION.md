# Orbit Sentinel — Installation & Setup Guide

## Quick Start

```powershell
.\setup.ps1        # One-click: install deps, build, start visualizer
# → http://localhost:5173
```

**Or visit the live demo** (if deployed to GitLab Pages):  
`https://gitlab-ai-hackathon.gitlab.io/transcend/39251857/`

## Prerequisites

- Windows, macOS, or Linux
- Git 2.0+
- Node.js 18+
- npm or pnpm

## One-Click Setup (.\setup.ps1)

This PowerShell script installs all dependencies, builds the project, and starts the visualizer:

```powershell
# Run from project root directory
.\setup.ps1
```

**What it does:**
1. Installs engine dependencies and builds TypeScript
2. Installs visualizer dependencies and builds React app
3. Starts the Vite development server
4. Opens visualizer at `http://localhost:5173`

## Manual Setup

### 1. Clone the Repository

```bash
git clone https://gitlab.com/gitlab-ai-hackathon/transcend/orbit-sentinel.git
cd orbit-sentinel
```

### 2. Install Engine Dependencies

```bash
cd engine
npm install
```

### 3. Build Engine

```bash
npm run build
```

### 4. Install Visualizer Dependencies

```bash
cd ../visualizer
npm install
```

### 5. Build Visualizer

```bash
npm run build
```

### 6. Start Visualizer

```bash
npm run dev
# → http://localhost:5173
```

## Environment Variables

Create a `.env` file in the root directory with your GitLab configuration:

```env
# GitLab Configuration
GITLAB_HOST=gitlab.com
ORBIT_GROUP_PATH=your-group/your-project
ORBIT_API_ENDPOINT=https://gitlab.com/api/v4/orbit
GITLAB_ACCESS_TOKEN=your-gitlab-access-token

# Optional: Override defaults
ORBIT_MAX_TRAVERSAL_DEPTH=5
ORBIT_MAX_HISTORICAL_MATCHES=10
```

## GitLab Duo Agent Platform Integration

### Install the Flow

1. Go to your GitLab project → **Settings** → **AI** → **Flows**
2. Click **New Flow**
3. Paste the contents of `flow/orbit-sentinel-flow.yaml`
4. Click **Save** and **Enable**

### Install the Duo Chat Skill

```bash
glab skills install --global orbit-sentinel
```

## Testing & Development

### Run Tests

```bash
# Test engine
cd engine
npm test

# Test visualizer
cd ../visualizer
npm test
```

### Type Checking

```bash
cd engine
npm run typecheck

cd ../visualizer
npm run typecheck
```

### Linting

```bash
cd engine
npm run lint

cd ../visualizer
npm run lint
```

## Visualizer Features

### Interactive Views

The visualizer provides 6 comprehensive analysis views:

1. **Overview** - Hero prediction, Orbit evidence, decision center
2. **Blast Radius** - Interactive dependency explorer
3. **Risk** - Risk score breakdown with probability bars
4. **Simulation** - Change impact analysis with timeline
5. **History** - Repository memory with similarity scoring
6. **Report** - Full formatted impact report

### Interactive Features

- **Auto-Play Demo**: Press **Space** or click **▶ Play Demo**
- **What-If Simulation**: Click mitigation bars to see risk reduction
- **Graph Exploration**: Click nodes for detailed information
- **URL Parameters**: `?view=blast-radius` or `?demo=true`

### Demo Mode

```bash
# Start with auto-play demo
npm run dev
# Visit: http://localhost:5173/?demo=true
```

## API Reference

### Engine API

The TypeScript engine provides comprehensive MR analysis:

```typescript
import { OrbitSentinel } from './engine';

const sentinel = new OrbitSentinel();

const report = await sentinel.analyzeChange({
  projectId: 123,
  projectPath: 'your-group/your-project',
  mrIid: 42,
  mrTitle: 'Add new feature',
  changedFiles: ['src/feature.js', 'tests/feature.test.js'],
  changeDescription: 'Implement new authentication flow',
  branch: 'feature/new-auth'
});

// Generate markdown report
const markdown = sentinel.generateMarkdownReport(report);

// Generate visualization data
const visualizationData = sentinel.generateVisualizationData(report);
```

### Orbit Query Types

The engine uses all 4 GitLab Orbit query types:

1. **Traversal**: Historical context and similar changes
2. **Aggregation**: Pipeline risk scoring and failure counts
3. **Path Finding**: Dependency chains and deployment traces
4. **Neighbors**: Blast radius computation

## Troubleshooting

### Common Issues

#### "Cannot start server on port 5173"

**Solution**: Check if another process is using port 5173
```bash
# Find and kill process using port 5173
lsof -ti:5173 | xargs kill -9
```

#### "TypeScript compilation errors"

**Solution**: Ensure you have the latest Node.js and run builds
```bash
cd engine
npm install -g typescript
npm run build
```

#### "Visualizer won't load"

**Solution**: Clear browser cache and check build output
```bash
# Clear visualizer build cache
rm -rf visualizer/node_modules visualizer/dist
```

### Getting Help

- **GitHub Issues**: Report bugs and feature requests
- **GitLab Discussions**: Community support
- **Devpost**: Hackathon-specific questions

## Project Structure

```
orbit-sentinel/
├── .gitlab-ci.yml              # GitLab Pages deployment
├── .gitlab/duo/                # GitLab Duo integration
│   ├── skill.yml              # Duo Chat skill
│   └── mcp.json               # MCP server config
├── visualizer/                  # React/D3 interactive dashboard
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Helper functions
│   └── public/                 # Static assets
├── engine/                      # TypeScript Orbit client
│   ├── src/
│   │   ├── orbit/              # Orbit API client
│   │   │   ├── client.ts       # Main Orbit client
│   │   │   └── queries.ts      # Query definitions
│   │   ├── twin/              # Digital twin construction
│   │   ├── risk/              # Risk scoring engine
│   │   ├── remediation/       # Remediation planning
│   │   └── reporter/          # Report generation
│   └── dist/                   # Built output
├── flow/                        # GitLab Duo Agent Platform
│   └── orbit-sentinel-flow.yaml
├── skills/                      # Orbit skill with recipes
│   └── orbit-sentinel/
│       └── recipes/            # 6 query recipes
├── demo/                        # Demo materials
│   ├── demo-script.md          # Video script
│   ├── screenshots-guide.md    # Screenshot guide
│   └── devpost-submission.md   # Devpost entry
├── docs/                        # Documentation
│   └── screenshots/            # Reference screenshots
├── setup.ps1                    # One-click setup script
├── SETUP.md                     # Setup instructions
├── AGENTS.md                    # Agent instructions
├── LICENSE                      # MIT license
└── README.md                    # This file
```

## Security & Compliance

### Security Features

- **Input Validation**: All MR inputs validated before processing
- **Rate Limiting**: Built-in protection against API abuse
- **Error Handling**: Comprehensive error handling without exposing sensitive data
- **Environment Variables**: All secrets stored in environment variables

### Compliance

- **MIT License**: Open source license
- **GitLab Terms**: Compliant with GitLab platform requirements
- **Data Privacy**: No personal data collection or storage

## Performance Optimization

### Caching Strategy

- **Query Results**: Cache Orbit API responses for 5 minutes
- **Digital Twin**: Cache built twins for 10 minutes
- **Visualization**: Cache rendered components

### Lazy Loading

- **Components**: Load React components on demand
- **Data**: Fetch data only when needed
- **Assets**: Load images and resources as required

## Monitoring & Analytics

### Metrics Collected

- **Query Performance**: Response times for all Orbit queries
- **Error Rates**: Track failed queries and requests
- **User Engagement**: Demo mode usage and interaction patterns
- **System Health**: Resource utilization and uptime

### Alerting

- **High Error Rates**: Alert if error rate exceeds 5%
- **Slow Queries**: Alert if query time exceeds 30 seconds
- **Resource Usage**: Alert if memory usage exceeds 80%

## Contributing

### Code Quality

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Airbnb style guide
- **Testing**: Vitest with comprehensive coverage
- **Documentation**: JSDoc comments for all public APIs

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Run full test suite
5. Update documentation
6. Submit pull request

## Migration Guide

### From Previous Versions

If upgrading from an earlier version:

1. **Configuration**: Update `.env` file with new environment variables
2. **Dependencies**: Run `npm install` in both `engine/` and `visualizer/`
3. **Build**: Run `npm run build` in both directories
4. **Configuration**: Review `engine/src/config.ts` for any changes

## Support & Resources

### Documentation

- **Setup Guide**: This file (`INSTALLATION.md`)
- **API Reference**: `engine/src/` source code
- **User Guide**: `demo/demo-script.md`
- **Troubleshooting**: This file (troubleshooting section)

### Community

- **GitHub**: Star and contribute to the project
- **GitLab**: Join discussions in the GitLab community
- **Devpost**: Share your hackathon experience

### Training

- **Video Tutorials**: Available in the `demo/` directory
- **Live Demos**: Visit the GitLab Pages deployment
- **Code Walkthroughs**: Review the `AGENTS.md` file

## Future Enhancements

### Planned Features

1. **Advanced Analytics**: Real-time impact prediction
2. **Multi-Repository**: Support for cross-project analysis
3. **Custom Queries**: User-defined Orbit query templates
4. **API Integration**: REST API for external integrations
5. **Mobile App**: Native mobile applications

### Research Areas

1. **Machine Learning**: Predictive risk modeling
2. **Graph Neural Networks**: Enhanced relationship analysis
3. **Natural Language**: Automated change analysis
4. **Time Series**: Historical trend analysis

## Conclusion

Orbit Sentinel provides a comprehensive solution for predicting merge request impact before code reaches production. With its autonomous engineering digital twin, comprehensive testing, and production-ready features, it's ready for the GitLab Transcend Hackathon and beyond.

**Ready to deploy?** Visit the GitLab Pages demo or run `.\setup.ps1` to get started!
