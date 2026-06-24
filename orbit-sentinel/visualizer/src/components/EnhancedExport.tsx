import type { VisualizationData } from "../types";

export function exportAsHtml(data: VisualizationData) {
  const summary = data.summary;
  const lines = [
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">`,
    `<title>Orbit Sentinel — MR Impact Report !${summary.mrIid}</title>`,
    `<style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', -apple-system, sans-serif; background: #08090d; color: #e8e8ed; padding: 40px; line-height: 1.5; }
      h1 { font-size: 24px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
      h2 { font-size: 16px; color: #60a5fa; margin: 24px 0 8px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 4px; }
      h3 { font-size: 13px; color: #a78bfa; margin: 16px 0 6px; }
      .meta { color: rgba(255,255,255,0.45); font-size: 11px; margin-bottom: 24px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
      .card { background: rgba(var(--bg-card-rgb),0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px 16px; }
      .card h4 { font-size: 12px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
      .card .value { font-size: 20px; font-weight: 700; color: #e8e8ed; }
      ul { padding-left: 18px; font-size: 12px; color: rgba(255,255,255,0.6); }
      li { margin: 4px 0; }
      .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 8px 0; }
      th, td { padding: 6px 10px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
      th { color: rgba(255,255,255,0.45); text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
      .footer { margin-top: 32px; font-size: 10px; color: rgba(255,255,255,0.25); text-align: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; }
    </style></head><body>`,
    `<h1>🛰️ Orbit Sentinel — MR Impact Report</h1>`,
    `<div class="meta">
      <strong>Project:</strong> ${summary.project} ·
      <strong>MR:</strong> !${summary.mrIid} ·
      <strong>Branch:</strong> ${summary.branch} ·
      <strong>Risk Score:</strong> ${summary.riskScore} ·
      <strong>Level:</strong> <span class="tag" style="background: ${data.hero.riskLevel === 'HIGH' || data.hero.riskLevel === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : data.hero.riskLevel === 'MEDIUM' ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)'}; color: ${data.hero.riskLevel === 'HIGH' || data.hero.riskLevel === 'CRITICAL' ? '#ef4444' : data.hero.riskLevel === 'MEDIUM' ? '#eab308' : '#22c55e'}">${data.hero.riskLevel}</span> ·
      Generated: ${summary.timestamp}
    </div>`,
    // Hero verdict
    `<div class="card" style="margin-bottom: 16px;">
      <h4>Predicted Outcome</h4>
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 6px;">${data.hero.predictedOutcome}</div>
      <h4 style="margin-top: 8px;">Recommended Action</h4>
      <div style="font-size: 12px; color: rgba(255,255,255,0.6);">${data.hero.recommendedAction}</div>
    </div>`,
    // Confidence factors
    `<h2>Confidence Factors</h2>`,
    `<div class="grid">${data.hero.confidenceFactors.map(f => `
      <div class="card">
        <h4>${f.label}</h4>
        <div style="font-size: 13px; color: ${f.status === 'success' ? '#22c55e' : f.status === 'warning' ? '#eab308' : '#ef4444'}; font-weight: 600;">${f.value}</div>
      </div>`).join('')}</div>`,
    // Risk breakdown
    `<h2>Risk Breakdown</h2>
    <table><tr><th>Category</th><th>Score</th><th>Max</th></tr>${data.riskData.breakdown.map(b => `
      <tr><td>${b.category}</td><td style="font-weight: 600; color: ${b.value / b.maxValue > 0.7 ? '#ef4444' : b.value / b.maxValue > 0.4 ? '#eab308' : '#22c55e'}">${b.value}</td><td>${b.maxValue}</td></tr>`).join('')}</table>`,
    // Decision Center
    `<h2>Decision Center</h2>`,
    `<div class="card" style="margin-bottom: 12px;">
      <h4>Strategy</h4>
      <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">${data.decisionCenter.deploymentStrategy}</div>
      <h4>Required Actions</h4>
      <ul>${data.decisionCenter.requiredTests.map(t => `<li>${t}</li>`).join('')}</ul>
      <div style="margin-top: 8px;">
        <h4>Risk Reduction</h4>
        <div style="font-size: 15px; font-weight: 700;">
          <span style="color: #ef4444;">${(data.decisionCenter.riskReduction.current * 100).toFixed(0)}%</span>
          <span style="color: rgba(255,255,255,0.25); margin: 0 8px;">→</span>
          <span style="color: #22c55e;">${(data.decisionCenter.riskReduction.afterRecommendation * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>`,
    // Rollback
    `<div class="card" style="margin-bottom: 12px;">
      <h4>Rollback Strategy</h4>
      <div style="font-size: 12px; color: rgba(255,255,255,0.6);">${data.decisionCenter.rollbackStrategy}</div>
    </div>`,
    // Timeline
    `<h2>Predicted Timeline</h2>
    <table><tr><th>Day</th><th>Event</th><th>Description</th></tr>${data.futureTimeline.map(f => `
      <tr><td>D+${f.day}</td><td>${f.icon} ${f.label}</td><td style="color: rgba(255,255,255,0.5);">${f.description}</td></tr>`).join('')}</table>`,
    // Counterfactuals
    `<h2>What-If Scenarios</h2>
    <table><tr><th>Scenario</th><th>Risk After</th></tr>${data.counterfactuals.map(c => `
      <tr><td>${c.label}</td><td style="font-weight: 600;">${(c.riskAfter * 100).toFixed(0)}%</td></tr>`).join('')}</table>`,
    // Evidence
    `<h2>Orbit Evidence</h2>${data.evidence.map(e => `
    <div class="card" style="margin-bottom: 8px;">
      <h4>${e.queryName} <span style="color: rgba(255,255,255,0.25); font-weight: 400;">${e.queryType}</span></h4>
      <pre style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px; white-space: pre-wrap; font-family: 'JetBrains Mono', monospace;">${e.result}</pre>
    </div>`).join('')}`,
    // Incidents
    `<h2>Historical Incidents</h2>${data.incidents.map(i => `
    <div class="card" style="margin-bottom: 8px;">
      <h4>!${i.mrIid} ${i.title} <span class="tag" style="background: rgba(239,68,68,0.12); color: #ef4444;">${i.similarity}% match</span></h4>
      <div style="font-size: 10px; color: rgba(255,255,255,0.45); margin: 4px 0;"><strong>Root cause:</strong> ${i.rootCause}</div>
      <div style="font-size: 10px; color: rgba(255,255,255,0.45);"><strong>Fix:</strong> ${i.mitigation}</div>
      <div style="font-size: 10px; margin-top: 4px;"><strong>Recommendation:</strong> ${i.recommendedAction}</div>
    </div>`).join('')}`,
    // Digital twin stats
    `<h2>Digital Twin Stats</h2>
    <div class="grid">
      <div class="card"><h4>Nodes</h4><div class="value">${summary.totalNodes}</div></div>
      <div class="card"><h4>Relationships</h4><div class="value">${summary.totalEdges}</div></div>
      <div class="card"><h4>Risk Score</h4><div class="value" style="color: ${data.hero.riskLevel === 'HIGH' || data.hero.riskLevel === 'CRITICAL' ? '#ef4444' : data.hero.riskLevel === 'MEDIUM' ? '#eab308' : '#22c55e'}">${summary.riskScore}</div></div>
      <div class="card"><h4>Confidence</h4><div class="value">${data.hero.confidence}</div></div>
    </div>`,
    `<div class="footer">Generated by Orbit Sentinel — Engineering Decision Intelligence for the GitLab Transcend Hackathon. MIT License.</div>`,
    `</body></html>`,
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orbit-sentinel-report-${summary.mrIid}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
