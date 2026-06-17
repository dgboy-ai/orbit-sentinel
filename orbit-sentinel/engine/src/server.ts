import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { sentinel } from './index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://orbit-sentinel-gitlab-ai-hackathon.vercel.app'],
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

    return res.json({
      success: true,
      report,
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

// Demo mode endpoint - returns realistic mock data
app.get('/api/demo', (req, res) => {
  if (process.env.DEMO_MODE !== 'true') {
    return res.status(404).json({ error: 'Demo mode not enabled' });
  }

  // Return the same data as the visualizer's hardcoded DATA
  return res.json({
    success: true,
    report: {
      mrIid: 10,
      mrTitle: 'test sentinel',
      digitalTwin: {
        nodes: [
          { id: 'repo:1', label: 'transcend/39251857', type: 'Project' },
          { id: 'u:1', label: '@trueboy1123', type: 'User', riskLevel: 'high' },
          { id: 'mr:10', label: 'MR !10: analyze this MR', type: 'MergeRequest', riskLevel: 'high' },
          { id: 'mr:1', label: 'MR !1: test sentinel', type: 'MergeRequest', riskLevel: 'low' },
          { id: 'mr:2', label: 'MR !2: test sentinel', type: 'MergeRequest', riskLevel: 'medium' },
          { id: 'mr:9', label: 'MR !9: test sentinel', type: 'MergeRequest', riskLevel: 'medium' },
          { id: 'pl:ecosystem', label: 'Pipeline Ecosystem (132k+)', type: 'Pipeline', riskLevel: 'medium' },
          { id: 'pl:1', label: 'Pipeline #14878452199', type: 'Pipeline', riskLevel: 'low' },
          { id: 'c:1', label: '12eaea5', type: 'Commit' },
          { id: 'c:2', label: 'b3a94728', type: 'Commit' },
          { id: 'f:1', label: 'flows/flow.yml', type: 'File', riskLevel: 'high' },
          { id: 'f:2', label: 'TEST_SENTINEL.md', type: 'File' },
          { id: 'f:3', label: '.gitlab/duo/mcp.json', type: 'File' },
          { id: 'f:4', label: '.gitlab/duo/skill.yml', type: 'File' },
          { id: 'svc:1', label: 'ci-validate-items', type: 'Service', riskLevel: 'high' },
          { id: 'svc:2', label: 'ai-catalog-sync', type: 'Service', riskLevel: 'medium' },
          { id: 'svc:3', label: 'pages-deploy', type: 'Service', riskLevel: 'low' },
          { id: 'inc:1', label: 'Incident: Abandoned branch pattern', type: 'Incident', riskLevel: 'high' },
          { id: 'inc:2', label: 'Incident: Draft MR with no pipeline', type: 'Incident', riskLevel: 'high' },
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
          projectPath: 'transcend/39251857',
          mrIid: 10,
          branch: 'test-sentinel',
          timestamp: new Date().toISOString(),
        },
      },
      simulation: {
        riskLevel: 'MEDIUM',
        riskScore: 0.55,
        failurePredictions: [
          { type: 'empty_diff', severity: 'high', probability: 0.9, timeframe: 'immediate' },
          { type: 'no_pipeline', severity: 'medium', probability: 0.8, timeframe: 'within_24h' },
          { type: 'draft_status', severity: 'low', probability: 0.7, timeframe: 'within_48h' },
        ],
        blastRadius: {
          services: [
            { id: 'svc:1', label: 'ci-validate-items', riskLevel: 'high', affectedFiles: ['flows/flow.yml'] },
            { id: 'svc:2', label: 'ai-catalog-sync', riskLevel: 'medium', affectedFiles: ['flows/flow.yml', '.gitlab/duo/skill.yml'] },
            { id: 'svc:3', label: 'pages-deploy', riskLevel: 'low', affectedFiles: [] },
          ],
          files: ['flows/flow.yml'],
        },
      },
      historicalMatches: [
        { mrIid: 1, title: 'test sentinel', branch: 'test-sentinel', similarity: 90, outcome: 'merged', riskScore: 0.1 },
        { mrIid: 2, title: 'test sentinel', branch: 'test-sentinel', similarity: 85, outcome: 'closed', riskScore: 0.3 },
        { mrIid: 9, title: 'test sentinel', branch: 'test-sentinel', similarity: 78, outcome: 'closed', riskScore: 0.4 },
      ],
      reviewerRecommendations: [
        { username: '@trueboy1123', expertise: ['AUTHORED_BY', 'MODIFIED_IN'], relevanceScore: 0.8, currentWorkload: 3 },
      ],
      rollbackPlan: {
        strategy: 'not_applicable',
        estimatedTime: 'N/A',
        affectedServices: [],
        riskLevel: 'low',
      },
      testPlan: {
        unitTests: ['test for empty diff detection'],
        integrationTests: ['test pipeline trigger on MR open'],
        e2eTests: ['test branch abandonment pattern'],
        recommendedTests: ['Add actual file changes to the MR', 'Remove draft status before requesting review', 'Ensure pipeline triggers on next push', 'Assign at least one reviewer'],
      },
      remediations: [
        { type: 'add_file_changes', impact: 'high', effort: 'medium', riskReduction: 0.25 },
        { type: 'trigger_pipeline', impact: 'high', effort: 'low', riskReduction: 0.28 },
        { type: 'assign_reviewers', impact: 'medium', effort: 'low', riskReduction: 0.3 },
        { type: 'all_mitigations', impact: 'critical', effort: 'high', riskReduction: 0.5 },
      ],
      generatedAt: new Date().toISOString(),
    },
    demoMode: true,
  });
});

app.listen(PORT, () => {
  console.log(`Orbit Sentinel Engine API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Analysis endpoint: http://localhost:${PORT}/api/analyze`);
});
