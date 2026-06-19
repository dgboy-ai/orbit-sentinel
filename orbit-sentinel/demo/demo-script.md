# Orbit Sentinel — Demo Video Script

## Overview

**Duration**: 3 minutes
**Target**: GitLab Transcend Hackathon judges
**Goal**: Demonstrate Orbit Sentinel's complete workflow from MR mention to analysis report

## Script Structure

```
[0:00-0:30] Opening & Problem Statement
[0:30-1:30] Live Demo: MR Analysis Workflow
[1:30-2:30] Interactive Features Showcase
[2:30-3:00] Impact & Call to Action
```

## Detailed Script

### [0:00-0:30] Opening & Problem Statement (30 seconds)

**Visual**: GitLab UI with open MR

**Narrator**: "Every merge request asks the same critical questions:

- Who else will this break?
- Has this failed before?
- Who should review this?
- What's the rollback plan?

Most teams answer these manually, if at all. Orbit Sentinel answers them automatically — by building a digital twin of your software system using GitLab Orbit."

**Visual**: Split screen showing:
- Left: Traditional manual analysis (slow, error-prone)
- Right: Orbit Sentinel automated analysis (fast, evidence-based)

**Callout**: "AI predicts code. Orbit Sentinel predicts consequences."

### [0:30-1:30] Live Demo: MR Analysis Workflow (1 minute)

**Visual**: GitLab interface with @mention

**Narrator**: "When a developer mentions @ai-orbit-sentinel on an MR, the flow activates."

**Action**: Developer types `@ai-orbit-sentinel analyze this MR`

**Visual**: GitLab Duo Agent Platform interface

**Narrator**: "The GitLab Duo Agent Platform executes an 8-step workflow using all 4 Orbit query types:

1. **Schema Discovery** - Discover available ontology
2. **Blast Radius** - NEIGHBORS query to find everything connected
3. **Dependency Chain** - PATH_FINDING query for deployment traces
4. **Historical Match** - TRAVERSAL query for similar changes
5. **Pipeline Risk** - AGGREGATION query for failure counts
6. **Analysis & Prediction** - Synthesize all evidence
7. **Post Report** - Create comprehensive analysis note on MR
8. **Complete** - Analysis ready for review"

**Visual**: Animated flow showing each step

**Narrator**: "Every conclusion cites specific Orbit query evidence. No black box."

### [1:30-2:30] Interactive Features Showcase (1 minute)

**Visual**: React visualizer dashboard

**Narrator**: "The interactive dashboard shows 8 comprehensive analysis views — including the new Predictions Tracker for post-merge verification:

**Overview View**:
- Hero prediction with risk score
- Orbit evidence panel showing all 4 query types
- Decision center with recommendations
- Counterfactual simulation
- Historical incidents
- Interactive digital twin graph

**Blast Radius View**:
- Click nodes to explore dependencies
- Real-time filtering and search
- Depth control for graph traversal

**Risk View**:
- 5-dimension risk breakdown
- Probability bars for each factor
- Interactive risk gauge

**What-If Simulation**:
- Click mitigation bars to see risk reduction
- Real-time animation of risk changes
- Multiple scenario comparison

**Historical Context**:
- Past incidents with similarity scores
- Timeline of similar MRs
- Root cause analysis

**Impact Report**:
- Complete formatted analysis
- Reviewer recommendations
- Rollback strategies
- Test plans
- Remediation steps

**Predictions Tracker**:
  - Accuracy scoreboard with animated stat counters
  - DualSparkline showing predicted vs actual risk trend
  - Filterable/sortable MR ledger with outcome badges
  - Post-merge verification input (failed/shipped)
  - 7-day survival window for high-risk predictions
  - **Vulnerability-Adjusted Predictions**: per-file severity breakdown with predicted vs actual vulns and confirmation toggles

**New power features**:
- **Security Findings in Blast Radius**: each service node shows vulnerability badges (severity-colored) with count — spot risky dependencies at a glance
- **Pipeline Failure Correlation in Risk View**: coefficient bar, failure probability heatmap, and historical reliability insight tied to AGGREGATION data
- **Export/Share Report**: click the 📤 button in Impact Report toolbar to copy Markdown or download JSON
- **Keyboard Shortcuts**: press **1–8** to jump between views, **D** toggle demo, **E** toggle editor — tooltip overlay at screen bottom
- **Theme Toggle**: click 🌙/☀️ in top nav to switch dark/light — persists in localStorage"

**Visual**: Space bar toggles auto-play demo

**Narrator**: "Press Space to start/stop the auto-play demo, or visit `?demo=true` for auto-load."

### [2:30-3:00] Impact & Call to Action (30 seconds)

**Visual**: Summary dashboard with key metrics

**Narrator**: "Orbit Sentinel transforms GitLab Orbit's knowledge graph into actionable insights for merge request analysis, providing:

✅ Evidence-based predictions before code reaches production
✅ Automated reviewer recommendations
✅ Historical context and pattern recognition
✅ Rollback strategies and remediation steps
✅ Complete audit trail with specific query citations

**Visual**: GitLab Duo skill installation

**Narrator**: "Install the GitLab Duo Chat skill with `glab skills install --global orbit-sentinel`. Build the GitLab Duo Agent Flow with `flow/orbit-sentinel-flow.yaml`. Live demo at orbit-sentinel.vercel.app.

**Visual**: Project statistics

**Narrator**: "Real results:

- Successfully tested in GitLab Duo Chat
- Ran live Orbit queries against actual project (transcend/39251857)
- Discovered 18 node types, ~45 relationship types
- Processed 23 nodes, 43 relationships across 9 node types
- Generated evidence-based conclusions with specific query citations

**Call to Action**: "Make AI smarter by giving it real context. Join the GitLab Transcend Hackathon and build the future of AI-native software development."

## Production Notes

### Video Production

**Requirements**:
- 3-minute maximum runtime
- Professional narration
- High-quality screen recording
- No copyrighted music or third-party trademarks

**Equipment**:
- Computer with GitLab project access
- Screen recording software
- Professional microphone
- Video editing software

**Technical Setup**:
1. Ensure GitLab Orbit MCP server is running
2. Have test MR ready for live demo
3. Prepare visualizer dashboard
4. Test all interactive features

### Submission Checklist

**Before recording**:
- [ ] GitLab Duo Agent Flow installed and working
- [ ] GitLab Duo Chat skill installed
- [x] Visualizer deployed to Vercel (orbit-sentinel.vercel.app)
- [ ] Demo script rehearsed
- [ ] Equipment tested

**During recording**:
- [ ] Clear narration of each step
- [ ] Show all interactive features
- [ ] Demonstrate key insights
- [ ] Include call to action

**After recording**:
- [ ] Edit to remove mistakes
- [ ] Add subtitles for accessibility
- [ ] Ensure professional quality
- [ ] Upload to YouTube/Vimeo
- [ ] Make video publicly accessible

## Alternative: Static Demo

If video recording isn't possible, create a comprehensive static demo:

1. **Screenshot Gallery**: 10+ high-quality screenshots
2. **GIF Animations**: Key interactive features
3. **Code Examples**: Installation and usage instructions
4. **Architecture Diagram**: Component relationships
5. **API Documentation**: Complete reference

## Success Metrics

### Technical Metrics

- **Response Time**: < 5 seconds for complete analysis
- **Accuracy**: 95%+ confidence in predictions
- **Coverage**: All 4 Orbit query types used
- **Reliability**: 99.9% uptime for production deployment

### User Experience Metrics

- **Ease of Installation**: < 5 minutes setup
- **Usability**: Intuitive interface with minimal learning curve
- **Documentation**: Comprehensive guides and examples
- **Support**: Active community and rapid response

### Business Impact Metrics

- **Time Savings**: 80% reduction in MR analysis time
- **Risk Reduction**: 60% decrease in production incidents
- **Productivity**: Faster review cycles and better code quality
- **Compliance**: Full audit trail and evidence-based decisions

## Conclusion

Orbit Sentinel represents the future of AI-native software development. By leveraging GitLab Orbit's knowledge graph, it provides developers with actionable insights before code reaches production. The combination of autonomous analysis, comprehensive visualization, and evidence-based recommendations makes it an essential tool for modern development teams.

**Ready to deploy?** Visit the live demo at orbit-sentinel.vercel.app or run `.\setup.ps1` to get started!
