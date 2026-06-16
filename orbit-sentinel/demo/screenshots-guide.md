# Screenshots Guide for Devpost Submission

## How to capture

1. Run the visualizer:
   ```bash
   cd visualizer
   npm run dev
   ```
2. Open http://localhost:5173/?demo=true
3. Wait for each view to appear, then capture with Snipping Tool (Win+Shift+S)
4. Save to `demo/screenshots/`

## 6 screenshots needed

| # | View | What to capture | File name |
|---|------|-----------------|-----------|
| 1 | Overview | Full page — hero prediction at top, evidence panel + counterfactual + incidents + D3 graph below | `01-overview.png` |
| 2 | Blast Radius | Click "Blast Radius" tab — interactive dependency graph | `02-blast-radius.png` |
| 3 | Risk Heatmap | Click "Risk" tab — 5 colored bars with scores | `03-risk-heatmap.png` |
| 4 | Simulation | Click "Simulation" tab — counterfactual bars with risk percentages | `04-simulation.png` |
| 5 | Historical | Click "History" tab — incident cards with similarity badges | `05-historical.png` |
| 6 | Report | Click "Report" tab — full formatted impact report | `06-report.png` |

## Pro tip

Press **Space** to stop auto-play at exactly the view you want, then capture.
