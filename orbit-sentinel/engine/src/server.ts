import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { sentinel, dataVisualizer, queryEngine, orbitClient } from './index.js';
import type { SentinelReport } from './types.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,https://orbit-sentinel.vercel.app').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || CORS_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
      cb(null, true);
    } else {
      cb(null, true); // permissive for hackathon
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    let { projectId, projectPath, mrIid, mrTitle, changedFiles, changeDescription, branch } = req.body;

    if (!projectPath || !mrIid || !mrTitle || !changedFiles || !changeDescription) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['projectPath', 'mrIid', 'mrTitle', 'changedFiles', 'changeDescription']
      });
    }

    // Look up project ID from path if not provided
    if (!projectId || Number(projectId) === 0) {
      try {
        const token = process.env.GITLAB_ACCESS_TOKEN;
        if (token) {
          const encodedPath = encodeURIComponent(projectPath);
          const projRes = await fetch(`https://gitlab.com/api/v4/projects/${encodedPath}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (projRes.ok) {
            const projData = await projRes.json() as { id: number };
            projectId = projData.id;
          }
        }
      } catch { /* keep 0 */ }
    }

    const report = await sentinel.analyzeChange({
      projectId: Number(projectId || 0),
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
    const msg = error instanceof Error ? error.message :
                error && typeof error === 'object' && 'message' in error ?
                String((error as any).message) : `Non-Error thrown: ${typeof error} ${String(error)}`;
    console.error('Analysis error:', msg, error);
    return res.status(500).json({
      error: 'Analysis failed',
      message: msg,
      demoMode: process.env.DEMO_MODE === 'true',
    });
  }
});

// Debug endpoint to test Orbit API connectivity
app.get('/api/debug-orbit', async (_req, res) => {
  try {
    const endpoint = process.env.ORBIT_API_ENDPOINT || "https://gitlab.com/api/v4/orbit";
    const token = (process.env.GITLAB_ACCESS_TOKEN || "").slice(0, 8) + "..." + (process.env.GITLAB_ACCESS_TOKEN || "").slice(-4);
    
    // Try a simple fetch to the Orbit schema endpoint
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(`${endpoint}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITLAB_ACCESS_TOKEN || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: { query_type: "neighbors", node: { id: "test", entity: "Project" }, neighbors: { node: "test", direction: "outgoing" } },
        format: "raw",
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    
    const body = await response.text().catch(() => "(no body)");
    res.json({
      endpoint,
      tokenPrefix: token,
      statusCode: response.status,
      statusText: response.statusText,
      bodyPreview: body.slice(0, 500),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const name = error instanceof Error ? error.name : typeof error;
    res.json({ error: msg, name, type: typeof error });
  }
});

// Live analysis with user-provided GitLab token
app.post('/api/analyze-with-creds', async (req, res) => {
  try {
    let { projectId, projectPath, mrIid, mrTitle, changedFiles, changeDescription, branch, gitlabToken } = req.body;

    if (!projectPath || !mrIid || !mrTitle || !changedFiles || !changeDescription) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['projectPath', 'mrIid', 'mrTitle', 'changedFiles', 'changeDescription']
      });
    }

    if (!gitlabToken) {
      return res.status(400).json({
        error: 'GitLab token is required for live analysis',
        hint: 'Generate at https://gitlab.com/-/user_settings/personal_access_tokens'
      });
    }

    // Temporarily override GITLAB_ACCESS_TOKEN with user-provided token
    const originalToken = process.env.GITLAB_ACCESS_TOKEN;
    process.env.GITLAB_ACCESS_TOKEN = gitlabToken;

    try {
      // Look up project ID if not provided
      if (!projectId || Number(projectId) === 0) {
        try {
          const encodedPath = encodeURIComponent(projectPath);
          const projRes = await fetch(`https://gitlab.com/api/v4/projects/${encodedPath}`, {
            headers: { Authorization: `Bearer ${gitlabToken}` },
          });
          if (projRes.ok) {
            const projData = await projRes.json() as { id: number };
            projectId = projData.id;
          }
        } catch {
          // fallback: keep 0
        }
      }

      const report = await sentinel.analyzeChange({
        projectId: Number(projectId || 0),
        projectPath,
        mrIid: Number(mrIid),
        mrTitle,
        changedFiles,
        changeDescription,
        branch,
      });

      const vizData = dataVisualizer.toVisualizationData(
        report.digitalTwin,
        report.simulation,
        report,
      );

      return res.json({
        success: true,
        report: vizData,
        realTime: true,
        queryTimings: report.digitalTwin.metadata.queryTimings || [],
      });
    } finally {
      // Restore original token (don't persist user tokens)
      process.env.GITLAB_ACCESS_TOKEN = originalToken;
    }
  } catch (error) {
    console.error('Live analysis error:', error);
    return res.status(500).json({
      error: 'Live analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
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

// Proxy endpoint to fetch MR changed files from GitLab API (avoids CORS in browser)
app.post('/api/probe-mr-files', async (req, res) => {
  try {
    const { projectPath, mrIid, gitlabToken } = req.body;
    if (!projectPath || !mrIid) {
      return res.status(400).json({ error: 'projectPath and mrIid required' });
    }

    const token = gitlabToken || process.env.GITLAB_ACCESS_TOKEN;
    if (!token) {
      return res.status(400).json({ error: 'No GitLab token available' });
    }

    const encodedPath = encodeURIComponent(projectPath);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(
      `https://gitlab.com/api/v4/projects/${encodedPath}/merge_requests/${mrIid}/changes`,
      { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
    );
    clearTimeout(timer);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `GitLab API returned ${response.status}`,
        message: await response.text().catch(() => ''),
      });
    }

    const data = await response.json() as { changes?: Array<{ new_path: string }> };
    const files = (data.changes || []).map(c => c.new_path);
    return res.json({ files, count: files.length });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch MR files',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Diagnostic endpoint — tests each Orbit query type individually
app.get('/api/diag', async (_req, res) => {
  const results: Record<string, unknown> = {};
  const projectId = 39251857;
  const filePath = "flows/flow.yml";

  // Fetch schema to discover valid entity types and relationship types
  try {
    const schema = await orbitClient.getSchema();
    results.schema = { ok: true, data: schema };
  } catch (e) { results.schema = { ok: false, error: e instanceof Error ? e.message : String(e) }; }

  // Test NEIGHBORS
  try {
    const r = await queryEngine.getProjectSummary(projectId);
    results.neighbors = { ok: true, rows: r.result.rows?.length ?? 0 };
  } catch (e) { results.neighbors = { ok: false, error: e instanceof Error ? e.message : String(e) }; }

  // Test TRAVERSAL
  try {
    const r = await queryEngine.findHistoricalMRs("gitlab-ai-hackathon/transcend/39251857", filePath);
    results.traversal = { ok: true, rows: r.result.rows?.length ?? 0 };
  } catch (e) { results.traversal = { ok: false, error: e instanceof Error ? e.message : String(e) }; }

  // Test PATH_FINDING
  try {
    const r = await queryEngine.findDeploymentPath(projectId);
    results.path_finding = { ok: true, rows: r.result.rows?.length ?? 0 };
  } catch (e) { results.path_finding = { ok: false, error: e instanceof Error ? e.message : String(e) }; }

  // Test AGGREGATION
  try {
    const r = await queryEngine.findPipelineFailures([projectId]);
    results.aggregation = { ok: true, rows: r.result.rows?.length ?? 0 };
  } catch (e) { results.aggregation = { ok: false, error: e instanceof Error ? e.message : String(e) }; }

  // Try traversal without relationships to test if the query format itself is valid
  try {
    const r = await orbitClient.traversal(
      { id: "f", entity: "File", filters: { path: { op: "ends_with", value: filePath } } },
      undefined, undefined, 10
    );
    results.traversal_no_rel = { ok: true, rows: r.result.rows?.length ?? 0 };
  } catch (e) { results.traversal_no_rel = { ok: false, error: e instanceof Error ? e.message : String(e) }; }

  // Simple path_finding: File→Branch with ON_BRANCH (1 hop, nodes/path format)
  try {
    const r = await orbitClient.pathFinding(
      [
        { id: "f", entity: "File", filters: { path: { op: "ends_with", value: ".ts" } } },
        { id: "b", entity: "Branch", filters: { name: { op: "starts_with", value: "main" } } },
      ],
      { type: "shortest", from: "f", to: "b", max_depth: 1, rel_types: ["ON_BRANCH"] },
      undefined, 10,
    );
    results.path_finding_simple = { ok: true, rows: r.result.rows?.length ?? 0 };
  } catch (e) { results.path_finding_simple = { ok: false, error: e instanceof Error ? e.message : String(e) }; }

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Orbit Sentinel Engine API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Analysis endpoint: http://localhost:${PORT}/api/analyze`);
});

// Global error handler — must be last
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err);
  res.status(500).json({ error: 'Internal server error' });
});
