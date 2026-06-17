import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { sentinel, dataVisualizer } from './index.js';
import type { SentinelReport } from './types.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://orbit-sentinel.vercel.app'],
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { projectId, projectPath, mrIid, mrTitle, changedFiles, changeDescription, branch } = req.body;

    if (!projectId || !projectPath || !mrIid || !mrTitle || !changedFiles || !changeDescription) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['projectId', 'projectPath', 'mrIid', 'mrTitle', 'changedFiles', 'changeDescription']
      });
    }

    const report = await sentinel.analyzeChange({
      projectId: Number(projectId),
      projectPath,
      mrIid: Number(mrIid),
      mrTitle,
      changedFiles,
      changeDescription,
      branch,
    });

    // Transform SentinelReport → VisualizationData for the frontend
    const vizData = dataVisualizer.toVisualizationData(
      report.digitalTwin,
      report.simulation,
      report,
    );

    return res.json({
      success: true,
      report: vizData,
      demoMode: process.env.DEMO_MODE === 'true',
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      demoMode: process.env.DEMO_MODE === 'true',
    });
  }
});

// Demo mode endpoint - returns realistic mock data transformed for visualizer
// Always available so the visualizer can always fetch demo data from a real endpoint
app.get('/api/demo', (req, res) => {
  // Build a realistic DigitalTwin + ChangeSimulation from fixed data
  const demoReport: SentinelReport = {
    mrIid: 10,
    mrTitle: 'test sentinel',
    digitalTwin: {
      nodes: [
        { id: 'repo:1', label: 'transcend/39251857', type: 'Project', properties: {} },
        { id: 'u:1', label: '@trueboy1123', type: 'User', properties: {}, riskScore: 0.8 },
        { id: 'mr:10', label: 'MR !10: analyze this MR', type: 'MergeRequest', properties: {}, riskScore: 0.75 },
        { id: 'mr:1', label: 'MR !1: test sentinel', type: 'MergeRequest', properties: {}, riskScore: 0.15 },
        { id: 'mr:2', label: 'MR !2: test sentinel', type: 'MergeRequest', properties: {}, riskScore: 0.4 },
        { id: 'mr:9', label: 'MR !9: test sentinel', type: 'MergeRequest', properties: {}, riskScore: 0.45 },
        { id: 'pl:ecosystem', label: 'Pipeline Ecosystem (132k+)', type: 'Pipeline', properties: {}, riskScore: 0.5 },
        { id: 'pl:1', label: 'Pipeline #14878452199', type: 'Pipeline', properties: {}, riskScore: 0.1 },
        { id: 'c:1', label: '12eaea5', type: 'Commit', properties: {} },
        { id: 'c:2', label: 'b3a94728', type: 'Commit', properties: {} },
        { id: 'f:1', label: 'flows/flow.yml', type: 'File', properties: {}, riskScore: 0.8 },
        { id: 'f:2', label: 'TEST_SENTINEL.md', type: 'File', properties: {} },
        { id: 'f:3', label: '.gitlab/duo/mcp.json', type: 'File', properties: {} },
        { id: 'f:4', label: '.gitlab/duo/skill.yml', type: 'File', properties: {} },
        { id: 'svc:1', label: 'ci-validate-items', type: 'Service', properties: {}, riskScore: 0.75 },
        { id: 'svc:2', label: 'ai-catalog-sync', type: 'Service', properties: {}, riskScore: 0.5 },
        { id: 'svc:3', label: 'pages-deploy', type: 'Service', properties: {}, riskScore: 0.15 },
        { id: 'inc:1', label: 'Incident: Abandoned branch pattern', type: 'Incident', properties: {}, riskScore: 0.85 },
        { id: 'inc:2', label: 'Incident: Draft MR with no pipeline', type: 'Incident', properties: {}, riskScore: 0.8 },
      ],
      edges: [
        { source: 'repo:1', target: 'mr:10', type: 'HAS_MERGE_REQUEST' },
        { source: 'repo:1', target: 'mr:1', type: 'HAS_MERGE_REQUEST' },
        { source: 'repo:1', target: 'mr:2', type: 'HAS_MERGE_REQUEST' },
        { source: 'repo:1', target: 'mr:9', type: 'HAS_MERGE_REQUEST' },
        { source: 'repo:1', target: 'f:1', type: 'HAS_FILE' },
        { source: 'repo:1', target: 'f:2', type: 'HAS_FILE' },
        { source: 'repo:1', target: 'f:3', type: 'HAS_FILE' },
        { source: 'repo:1', target: 'f:4', type: 'HAS_FILE' },
        { source: 'mr:1', target: 'u:1', type: 'AUTHORED_BY' },
        { source: 'mr:2', target: 'u:1', type: 'AUTHORED_BY' },
        { source: 'mr:9', target: 'u:1', type: 'AUTHORED_BY' },
        { source: 'mr:10', target: 'u:1', type: 'AUTHORED_BY' },
        { source: 'mr:1', target: 'pl:1', type: 'HAS_HEAD_PIPELINE' },
        { source: 'mr:10', target: 'c:1', type: 'HAS_COMMIT' },
        { source: 'mr:1', target: 'c:2', type: 'HAS_COMMIT' },
        { source: 'mr:1', target: 'f:1', type: 'MODIFIES' },
        { source: 'mr:2', target: 'f:1', type: 'MODIFIES' },
        { source: 'mr:9', target: 'f:1', type: 'MODIFIES' },
        { source: 'f:1', target: 'svc:1', type: 'DEPENDS_ON' },
        { source: 'f:1', target: 'svc:2', type: 'DEPENDS_ON' },
        { source: 'f:3', target: 'svc:2', type: 'DEPENDS_ON' },
        { source: 'f:4', target: 'svc:2', type: 'DEPENDS_ON' },
        { source: 'mr:1', target: 'pl:1', type: 'TRIGGERED_PIPELINE' },
        { source: 'pl:ecosystem', target: 'svc:1', type: 'AFFECTED' },
        { source: 'inc:1', target: 'mr:9', type: 'CAUSED_INCIDENT' },
        { source: 'inc:2', target: 'mr:10', type: 'CAUSED_INCIDENT' },
      ],
      metadata: {
        projectPath: 'gitlab-ai-hackathon/transcend/39251857',
        mrIid: 10,
        branch: 'test-sentinel',
        timestamp: new Date().toISOString(),
      },
    },
    simulation: {
      changeDescription: 'test sentinel MR',
      changeScope: ['flows/flow.yml'],
      blastRadius: {
        files: [{ id: 'f:1', label: 'flows/flow.yml', type: 'File', properties: {}, riskScore: 0.8 }],
        services: [
          { id: 'svc:1', label: 'ci-validate-items', type: 'Service', properties: {}, riskScore: 0.75 },
          { id: 'svc:2', label: 'ai-catalog-sync', type: 'Service', properties: {}, riskScore: 0.5 },
        ],
        deployments: [],
        pipelines: [],
      },
      failurePredictions: [
        { mode: 'empty_diff', probability: 0.9, severity: 'high', affectedComponent: 'MR', description: 'No file changes detected' },
        { mode: 'no_pipeline', probability: 0.8, severity: 'medium', affectedComponent: 'CI', description: 'No pipeline triggered' },
        { mode: 'draft_status', probability: 0.7, severity: 'low', affectedComponent: 'MR', description: 'MR is in draft/WIP state' },
      ],
      riskScore: 0.55,
      riskLevel: 'medium',
    },
    historicalMatches: [
      { mrIid: 9, mrTitle: 'test sentinel (closed)', similarity: 90, outcome: 'closed', timestamp: '2026-06-15T00:00:00.000Z' },
      { mrIid: 5, mrTitle: 'test sentinel (closed)', similarity: 85, outcome: 'closed', timestamp: '2026-06-10T00:00:00.000Z' },
      { mrIid: 2, mrTitle: 'test sentinel (closed)', similarity: 78, outcome: 'closed', timestamp: '2026-06-05T00:00:00.000Z' },
    ],
    reviewerRecommendations: [],
    rollbackPlan: { strategy: 'revert', steps: ['Close MR', 'Delete branch'], estimatedTime: '5 min', riskLevel: 'low' },
    testPlan: {
      unitTests: [],
      integrationTests: [],
      e2eTests: [],
      suggestedFramework: '',
      coverageTargets: [],
      recommendedTests: ['Add actual file changes to the MR', 'Remove draft status before requesting review', 'Ensure pipeline triggers on next push', 'Assign at least one reviewer'],
    },
    remediations: [
      { type: 'fix_mr', description: 'Add File Changes', impact: 'high' },
      { type: 'fix_mr', description: 'Trigger Pipeline', impact: 'high' },
      { type: 'config_change', description: 'Assign Reviewers', impact: 'medium' },
      { type: 'fix_mr', description: 'All Mitigations', impact: 'critical' },
    ],
    generatedAt: new Date().toISOString(),
  };

  const vizData = dataVisualizer.toVisualizationData(
    demoReport.digitalTwin,
    demoReport.simulation,
    demoReport,
  );

  return res.json({
    success: true,
    report: vizData,
    demoMode: true,
  });
});

app.listen(PORT, () => {
  console.log(`Orbit Sentinel Engine API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Analysis endpoint: http://localhost:${PORT}/api/analyze`);
});
