# Orbit Sentinel — Demo Video Script

**Total duration**: ~2:54

---

00:00 Welcome to Orbit Sentinel, my submission for the Showcase track.

00:03 Every merge request or simply MR hides unknown risk, leading to hours of manual dependency tracing and repeated failures.

00:09 Orbit Sentinel solves this by building a digital twin using all four query types, mapping blast radius, dependency chains, history, and pipeline risks automatically.

00:16 This was the setup page, and let's start with the overview page.

00:20 On the overview page, we can see the several info currently in demo mode like MR Analyzer recommended action orbit evidence, Also the digital twin graph, which is currently in demo mode.

00:30 Let's come back to the MR analyzer.

00:32 This can analyze your MR in real time.

00:34 Let's run the analyze live button.

00:37 Behind the scenes of Vercel frontend requests our render engine.

00:40 To query the GitLab Orbit API using all four query types.

00:43 If Orbit is offline, it falls back to the grep based parsing.

00:46 As you can see, the analysis is done, the data in all app and all the pages is changed from demo data to real data.

00:54 For example, the recommended action orbit evidence and the number of nodes and other numbers in the digital twin graph is come from.

01:00 Real time analysis.

01:01 Let's go to the next page.

01:03 In our prediction tracker, we track actual post-merge outcome over a 7 day survival window to continuously calibrate the model, showing input like prediction scorecard, prediction versus actual trend graph.

01:12 And at the bottom there is closed loop ROI Calculator where dynamically calculates the exact hours and incidence cost saved.

01:19 And at the bottom there is prediction confusion matrix with dynamically maps every verified MR showing exactly how the model learned with every outcome.

01:26 Now let's go to the next page.

01:29 In this live graph which uses BFS traversal algorithm, we can visualize a blast radius of MR By adjusting the depth slider in the left sidebar, we can increase the search depth of MR and also we can directly interact with the nodes to get meaningful information.

01:43 Also, there is provider.

01:44 There we provide an impact summary which provides meaningful information like service affected files change and etc.

01:49 This was the graphics and let's move to the next page.

01:52 This Risk investigation page which explained why this MR is safe or not to deploy while traditional CI only tells you if the code compiled but Orbit Sentinel validates our dependency graph and pipeline history and provide a safe to deploy verdict Also why Orbit approved this MR and recommended actions.

02:09 This forecast page predicts MR's future pipeline timeline, outcome prediction, What if scenarios, Forecast confidence and also engineering futures if nothing changes and if recommended actions are followed.

02:23 Also orbit delta.

02:25 This History Page checks our Repository memory using Traversal queries.

02:28 It compares current changes against past merges and incidents, showing what the model has learned, Counterfactual learning and orbit memory verdict.

02:37 Finally, the report page compiles all findings of MR into a structure summary with rollback strategies and metadata.

02:44 Orbit UI supports light mode also and its fully mobile responsive.

02:49 So at the end, finally, with Orbit Sentinel, we don't just predict code, we predict consequences.

02:54 Thank you.
