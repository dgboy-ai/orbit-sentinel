# Orbit Sentinel — Screenshot Guide

## Overview

This guide provides detailed instructions for capturing high-quality screenshots and demo materials for the GitLab Transcend Hackathon submission.

## Equipment Needed

### Hardware
- Computer with GitLab project access
- External monitor (recommended for better screen capture)
- Professional microphone (for audio recording)

### Software
- Windows: Snip & Sketch, OBS Studio, or similar
- macOS: Grab, QuickTime Player, or similar
- Linux: Shutter, SimpleScreenRecorder, or similar

## Screenshot Capture Best Practices

### 1. Visualizer Dashboard

**What to Capture**:
- Full dashboard view with all 6 analysis tabs visible
- Active demo mode with Space bar interaction
- Interactive graph exploration
- Risk gauge and what-if simulation

**Technical Specifications**:
- Resolution: 1920x1080 or higher
- Format: PNG (for quality) or JPG (for size)
- File size: < 5MB per image
- Naming: `visualizer-overview.png`, `visualizer-blast-radius.png`

**Steps**:
1. Navigate to `http://localhost:5173/?demo=true`
2. Wait for auto-play demo to start
3. Capture key moments:
   - Initial dashboard load
   - Risk view with probability bars
   - What-if simulation interaction
   - Graph node exploration
   - Report generation

### 2. GitLab Duo Integration

**What to Capture**:
- Skill installation confirmation
- Flow configuration in GitLab UI
- MR trigger with @mention
- Agent execution logs

**Technical Specifications**:
- Include browser URL bar for context
- Capture error messages if any
- Show success confirmations

### 3. Engine Output

**What to Capture**:
- TypeScript compilation success
- Test results (Vitest)
- Linting results (ESLint)
- Build artifacts

**Technical Specifications**:
- Command line output
- Error messages (if any)
- Success confirmations

## Demo Video Production

### Script Preparation

**Key Points to Cover**:
1. Problem statement (30 seconds)
2. Live demo of MR analysis (60 seconds)
3. Interactive features showcase (60 seconds)
4. Impact and call to action (30 seconds)

**Visual Elements**:
- Split-screen comparisons
- Highlighted interactive elements
- Progress indicators
- Success confirmations

### Recording Tips

**Audio**:
- Use professional microphone
- Speak clearly and at consistent pace
- Record background music (royalty-free)

**Video**:
- Frame rate: 30 FPS
- Resolution: 1920x1080
- Length: 3 minutes maximum
- No copyrighted music or trademarks

### Editing

**Essential Edits**:
- Remove mistakes and stuttering
- Add text overlays for clarity
- Include captions for accessibility
- Add background music (optional)

**Quality Checks**:
- Check for jump cuts
- Ensure consistent lighting
- Verify audio quality
- Test on different devices

## Documentation Materials

### README.md Updates

**Required Sections**:
1. Project overview and problem statement
2. Installation and setup instructions
3. Usage examples and API reference
4. Technical architecture diagram
5. Contribution guidelines
6. Troubleshooting section

**Best Practices**:
- Use markdown formatting for readability
- Include code blocks with syntax highlighting
- Add screenshots with alt text
- Provide clear examples

### AGENTS.md

**Required Sections**:
1. Agent identity and purpose
2. Core principles and workflow
3. Tool usage instructions
4. Output format requirements
5. Prohibited behaviors
6. Available tools and capabilities

### SETUP.md

**Required Sections**:
1. Quick start guide
2. Detailed setup instructions
3. Environment configuration
4. Troubleshooting guide
5. Common issues and solutions

## Devpost Submission Materials

### Project Description

**Essential Elements**:
1. Problem statement and solution
2. Technical architecture
3. Key features and benefits
4. Development process and challenges
5. Future enhancements

**Formatting Tips**:
- Use clear headings and subheadings
- Include bullet points for key features
- Add screenshots and diagrams
- Provide code snippets where relevant

### Project Gallery

**Required Assets**:
1. Project logo/icon
2. Screenshots (minimum 3)
3. Demo video thumbnail
4. Architecture diagram
5. Technology stack logo

**Image Guidelines**:
- All images must be high resolution
- Include alt text for accessibility
- Use consistent branding
- Optimize file sizes

### Technical Documentation

**Required Documents**:
1. Installation guide
2. API reference
3. Configuration guide
4. Troubleshooting manual
5. Contribution guidelines

**Content Requirements**:
- Complete and accurate
- Well-formatted and readable
- Includes examples and code
- Updated with latest changes

## Quality Assurance Checklist

### Before Submission

**Technical QA**:
- [ ] All tests passing (Vitest)
- [ ] TypeScript compilation successful
- [ ] ESLint checks passing
- [ ] Build artifacts created
- [ ] Demo materials complete

**Documentation QA**:
- [ ] README.md comprehensive
- [ ] Screenshots clear and relevant
- [ ] Video quality acceptable
- [ ] All links working
- [ ] No broken references

**Visual QA**:
- [ ] Screenshots high resolution
- [ ] Consistent branding
- [ ] No text readability issues
- [ ] Color contrast adequate
- [ ] All interactive elements visible

### During Submission

**Devpost Requirements**:
- [ ] Project description complete
- [ ] Gallery images uploaded
- [ ] Demo video uploaded
- [ ] Technical documentation attached
- [ ] All links functional

**Legal Requirements**:
- [ ] License file included
- [ ] Attribution notices present
- [ ] No copyrighted material
- [ ] Original content only

## Common Issues and Solutions

### Screenshot Quality Issues

**Problem**: Blurry or low-resolution images
**Solution**: 
- Increase screen resolution
- Use higher DPI settings
- Capture at native resolution

**Problem**: Missing UI elements
**Solution**:
- Capture after animations complete
- Use full-screen mode
- Include browser UI elements

### Video Production Issues

**Problem**: Poor audio quality
**Solution**:
- Use noise-canceling microphone
- Record in quiet environment
- Test audio before recording

**Problem**: Inconsistent lighting
**Solution**:
- Use consistent lighting setup
- Record in same location
- Use diff users to ensure consistency

### Documentation Issues

**Problem**: Outdated information
**Solution**:
- Update documentation regularly
- Include version numbers
- Provide update timestamps

**Problem**: Incomplete examples
**Solution**:
- Test all examples
- Include error cases
- Provide troubleshooting guides

## Final Review

### Pre-Submission Checklist

**Technical Review**:
- [ ] All code passes linting
- [ ] All tests passing
- [ ] TypeScript strict mode enabled
- [ ] Build artifacts complete
- [ ] Dependencies updated

**Documentation Review**:
- [ ] README.md comprehensive
- [ ] Screenshots clear and relevant
- [ ] Video quality acceptable
- [ ] All links working
- [ ] No broken references

**Submission Review**:
- [ ] Devpost requirements met
- [ ] All files uploaded
- [ ] Legal compliance verified
- [ ] Contact information correct
- [ ] Project title and description accurate

### Post-Submission

**Follow-up Actions**:
- Monitor feedback and comments
- Respond to judge questions
- Update materials based on feedback
- Share progress on social media
- Network with other participants

**Documentation Updates**:
- Document lessons learned
- Update troubleshooting guides
- Add new features based on feedback
- Improve existing documentation

This comprehensive guide ensures you capture high-quality materials and submit a professional, complete hackathon project. Focus on quality, clarity, and completeness throughout the process.
