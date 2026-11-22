export const topics = ['Agents', 'Evaluation', 'AI assistants', 'Model capabilities', 'Developer tooling', 'Production reliability'] as const;
export type Topic = typeof topics[number];
export const decisions = ['Test now', 'Keep watching', 'Skip'] as const;
export type Decision = typeof decisions[number];
export const evidenceLevels = ['Strong', 'Moderate', 'Early', 'Practice report'] as const;
export type Evidence = typeof evidenceLevels[number];
export type Research = {
  id: string; title: string; date: string; updated?: string; source: string; sourceName: string;
  kind: string; summary: string; evidence: Evidence; evidenceNotes: string; implications: string;
  relevance: string; significance: string; decision: Decision; reason: string; topics: Topic[];
  effort: string; hypothesis: string; implementation: string; metrics: string; saved: boolean;
  discovery?: { task: string; approach: string; before: string; after: string; benefit: string; caveats: string; foundAt: string; reviewed: boolean };
  reviewedAt?: string;
};
export type Experiment = {
  id: string; researchId: string; title: string; hypothesis: string; implementation: string;
  metrics: string; results: string; followup: string; status: 'Planned' | 'Running' | 'Completed';
  effort: string; created: string;
};
export const workflowTasks = ['Testing & QA', 'Debugging', 'Code review', 'Refactoring', 'Documentation', 'Delivery & DevOps', 'AI app engineering'] as const;
export type DiscoverySettings = { focus: string; tasks: string[]; maxItems: number; lookbackDays: number; enabled: boolean };
export type DiscoveryRun = { id: string; completedAt: string; examined: number; added: number; duplicates: number; summary: string; sources: { title: string; url: string }[] };
export type DiscoveryState = { settings: DiscoverySettings; runs: DiscoveryRun[]; schedule?: { label: string; enabled: boolean; automationId?: string } };
export type Workspace = { research: Research[]; experiments: Experiment[]; revision?: string; discovery?: DiscoveryState };
export const defaultDiscovery: DiscoveryState = { settings: { focus: 'Find practical ways to use AI to reduce repetitive development work in TypeScript and Node.js. Prioritize automated QA with Playwright, debugging, code review, safe refactoring, documentation maintenance, and reliable delivery. Prefer a concrete process over a new model announcement.', tasks: [...workflowTasks], maxItems: 3, lookbackDays: 14, enabled: true }, runs: [] };
export const seedResearch: Research[] = [
  {
    id:'agentlens', title:'AgentLens: when a passing agent is just getting lucky', date:'2026-05-13', updated:'2026-11-17',
    source:'https://arxiv.org/abs/2605.12925v5',sourceName:'Sahoo et al. · arXiv',kind:'Preprint · substantive revision',
    summary:'Process-level assessment distinguishes a reliable solution from blind retries and missing verification, even when both pass the final tests.',
    evidence:'Moderate',evidenceNotes:'The authors analyze 2,614 trajectories on 60 SWE-bench tasks. The reported 10.7% lucky-pass rate concerns passing traces in a selected subset; it is not a general failure rate. Open artifacts help inspection; independent replication is not established here.',
    implications:'Add trace review to final-state checks before trusting an agent-generated test or patch.',
    relevance:'Directly useful for a Node.js QA agent that writes Playwright tests: record the path to success, not only a green run.',
    significance:'Changes what a successful agent run means. The substantial November revision merits review beyond a leaderboard update.',
    decision:'Test now',reason:'A small trace-grading experiment can expose false confidence in an existing QA workflow.',topics:['Agents','Evaluation','Developer tooling','Production reliability'],
    effort:'2–3 hours',hypothesis:'Adding a trace rubric to final test checks will identify fragile passes that outcome-only grading misses.',
    implementation:'Use a Node.js runner to log task, tool call, verification and retry events as JSONL. Replay 20 fixed QA tasks. Grade final state with Vitest or Playwright; blindly review traces for unverified changes and blind retries.',
    metrics:'Run each fixture 3 times. Report outcome pass rate, flagged passing traces, reviewer agreement, cost per task and p95 latency. Inspect every flagged pass before changing the release gate.',saved:true,
  },
  {
    id:'budget',title:'Choose agents by evidence and cost, not leaderboard rank',date:'2026-11-16',
    source:'https://arxiv.org/abs/2611.21515v1',sourceName:'Srinivasan & Menzies · arXiv',kind:'Preprint',
    summary:'A budget-aware analysis shows that many apparent accuracy advantages are unresolved, while inconsistent cost accounting can distort agent selection.',
    evidence:'Moderate',evidenceNotes:'Analysis of 58,197 run–task records across seven benchmarks. The strongest allocation result assumes advance task-cost knowledge; local workloads and provider pricing may differ. Preprint, not independently replicated here.',
    implications:'Compare full model-and-harness configurations on matched tasks and record actual spend.',
    relevance:'Useful when choosing a model for a web assistant or a background Node.js agent with a fixed monthly budget.',
    significance:'Reframes agent selection as an engineering decision under uncertainty rather than a score race.',
    decision:'Test now',reason:'A capped local comparison is inexpensive and can directly inform model routing.',topics:['Agents','Evaluation','Developer tooling'],
    effort:'2 hours',hypothesis:'A lower-cost agent configuration will stay within an acceptable quality margin on the app’s actual tasks.',
    implementation:'Create a provider-neutral TypeScript adapter. Run two configurations against the same 20 held-out fixtures, with 3 repeats. Log tokens, retries, billed cost and latency; eliminate only after reviewing matched results.',
    metrics:'Set a total budget cap before running. Compare task-level pass counts, uncertainty, cost per successful task and p95 latency. Define the acceptable quality margin in advance.',saved:false,
  },
  {
    id:'simulators',title:'Can your simulated users detect broken work?',date:'2026-11-18',
    source:'https://arxiv.org/abs/2611.24892v1',sourceName:'Zhou et al. · arXiv',kind:'Preprint',
    summary:'Common simulator metrics can overlook altered goals and acceptance of broken work. The authors test evaluators by deliberately injecting those failures.',
    evidence:'Early',evidenceNotes:'Six simulators were studied using 351 real multi-turn sessions. The proposed suite detected the ten tested perturbations, but that set does not cover all user behavior. New preprint; independent replication is pending.',
    implications:'Validate the simulated user and its grader before scaling assistant evaluations.',
    relevance:'Relevant to evaluating chat assistants that refine web apps or carry out multi-step requests.',
    significance:'Challenges the assumption that a plausible simulated conversation gives a trustworthy product evaluation.',
    decision:'Keep watching',reason:'Useful evaluation idea; first establish a small real-user reference set.',topics:['Evaluation','AI assistants','Production reliability'],
    effort:'Half a day',hypothesis:'A perturbation suite will reveal simulator failures hidden by aggregate conversation scores.',
    implementation:'Keep a small consented set of anonymized sessions. Add fixtures with changed goals, omitted constraints and premature success. Check whether the grader penalizes each intervention.',
    metrics:'Measure detection by failure type and compare a blind human review. Keep the reference sessions held out from prompt tuning.',saved:true,
  },
  {
    id:'adaptation',title:'Agent memory or weight updates? Compare the actual gain',date:'2026-11-15',
    source:'https://arxiv.org/abs/2611.19700v1',sourceName:'Mirtaheri et al. · arXiv',kind:'Preprint',
    summary:'A controlled comparison of context retention and weight adaptation finds strong gains from retained experience, with additional benefits and trade-offs from reinforcement learning.',
    evidence:'Early',evidenceNotes:'Four environments, 109 tasks and one Qwen3.5-9B base model, evaluated over five task orders. Results do not establish the same benefits for hosted frontier APIs or a TypeScript application.',
    implications:'Try explicit, scoped memory before investing in a training pipeline; retain current-task verification.',
    relevance:'Promising for assistants repeatedly operating on the same repository or app. Weight training adds infrastructure beyond a normal Node.js service.',
    significance:'Separates the contribution of context and training under a shared protocol.',
    decision:'Keep watching',reason:'The context-only portion is accessible, but transfer to this stack needs a separate controlled test.',topics:['Agents','AI assistants','Model capabilities'],
    effort:'Half a day',hypothesis:'A short repository memory will reduce repeated lookups without increasing skipped verification.',
    implementation:'Compare a stateless assistant with one using a versioned, repository-scoped memory file. Freeze the model and tools; evaluate before incorporating each task’s feedback.',
    metrics:'Track paired success, stale-memory errors, verification coverage, tokens and latency on unseen tasks.',saved:false,
  },
  {
    id:'evolution',title:'Better aggregate scores can hide new agent regressions',date:'2026-11-05',
    source:'https://arxiv.org/abs/2611.07624v1',sourceName:'Wang et al. · arXiv',kind:'Preprint',
    summary:'Evolved agent harnesses can solve new tasks while losing previously solved ones. Aggregate improvement alone does not show whether useful behavior was preserved.',
    evidence:'Moderate',evidenceNotes:'Four evolution methods with repeated evaluations and interventions. All sixteen evolved agents lost some covered tasks. This is evidence in the tested setups, not proof that every harness change regresses.',
    implications:'Track gained and lost tasks separately when changing prompts, tools or orchestration.',
    relevance:'Applies to release gates for a TypeScript assistant as its prompts and tool definitions evolve.',
    significance:'Adds preservation of existing behavior to the definition of progress.',
    decision:'Keep watching',reason:'Adopt task-level regression reporting now; defer an autonomous evolution pipeline.',topics:['Agents','Model capabilities','Production reliability'],
    effort:'2 hours',hypothesis:'Task-level before/after reports will expose regressions masked by an improved average score.',
    implementation:'Store fixture IDs and outcomes for each prompt version. Diff gained, lost and unchanged tasks in a Node.js release report.',
    metrics:'Measure gained versus lost tasks over repeated runs; require review of every lost critical task.',saved:false,
  },
  {
    id:'oracle',title:'Test the evaluator: a broken oracle can reward failure',date:'2026-10-12',updated:'2026-10-21',
    source:'https://arxiv.org/abs/2610.16067v2',sourceName:'Chen · arXiv',kind:'Preprint',
    summary:'An evaluation audit finds state corruption that inflates benchmark success. Known-answer controls and state invariants catch defects invisible in score tables.',
    evidence:'Moderate',evidenceNotes:'Fault injection and offline replay support the reported oracle defect. The auditing method did not transfer to a second independent benchmark; its applicability has explicit limits.',
    implications:'Separate expected state from observed state and test graders with known good and known bad outcomes.',
    relevance:'Especially relevant to Playwright and database-backed QA where setup or cleanup can change what the grader sees.',
    significance:'Shows why an apparently objective pass rate can be wrong at the measurement layer.',
    decision:'Test now',reason:'Known-answer grader checks are a practical addition before trusting bulk agent tests.',topics:['Evaluation','Production reliability','Developer tooling'],
    effort:'90 minutes',hypothesis:'Known-answer controls will catch evaluator state leaks before they inflate agent success.',
    implementation:'Add good, bad and empty outcomes to a Vitest grader suite. Snapshot the database before and after grading. Generate expected state in an isolated transaction or separate database.',
    metrics:'Require all negative controls to fail, positive controls to pass and state hashes to remain unchanged after grading.',saved:false,
  },
  {
    id:'evals',title:'Build agent evals around outcomes, traces and repeated trials',date:'2026-01-09',
    source:'https://www.anthropic.com/research/demystifying-evals-for-ai-agents',sourceName:'Anthropic Engineering',kind:'Engineering · foundation',
    summary:'A practical framework separates task outcomes, transcripts and graders, and uses repeated trials to understand stochastic agent behavior.',
    evidence:'Practice report',evidenceNotes:'First-party engineering guidance from internal and customer experience. Useful methodology, not a controlled independent comparison or a universal performance guarantee.',
    implications:'Start with real failure cases, deterministic outcome checks and a small regression suite.',
    relevance:'A foundation for a Node.js QA harness that runs Playwright tests and keeps human approval for subjective cases.',
    significance:'An older foundational reference retained because it supports the current experiment workflow.',
    decision:'Test now',reason:'Use as the baseline harness for the newer research experiments.',topics:['Agents','Evaluation','AI assistants','Developer tooling'],
    effort:'Half a day',hypothesis:'Repeated trials and outcome-based grading will make prompt regressions easier to detect.',
    implementation:'Create a typed fixture format with input, expected state and grader. Run independent trials with fresh state and persist JSONL traces.',
    metrics:'Record task-level repeatability, pass rate, cost and false positives. Review a blind sample of graded runs.',saved:true,
  },
  {
    id:'context',title:'Treat agent context as a limited engineering resource',date:'2025-09-29',
    source:'https://www.anthropic.com/research/effective-context-engineering-for-ai-agents',sourceName:'Anthropic Engineering',kind:'Engineering · foundation',
    summary:'Context engineering emphasizes selecting useful instructions, tools, history and retrieved information within an agent’s finite attention budget.',
    evidence:'Practice report',evidenceNotes:'First-party conceptual and engineering guidance, not a reproducible head-to-head benchmark. Treat application benefits as hypotheses to test.',
    implications:'Version context policies and compare scoped retrieval with sending the entire history.',
    relevance:'Useful background for long-running Node.js assistants and repository-aware web applications.',
    significance:'Kept as background for memory and context comparisons; not a new research claim.',
    decision:'Skip',reason:'Reference only. Avoid a duplicate experiment while the focused memory hypothesis is still untested.',topics:['Agents','AI assistants','Production reliability'],
    effort:'2 hours',hypothesis:'Scoped retrieval will reduce token use without materially reducing task success.',
    implementation:'Compare fixed-budget relevant retrieval with full history on identical fixtures. Freeze the model, tools and task order.',
    metrics:'Track success, missing-context failures, tokens and p95 latency; set the acceptable quality margin before running.',saved:false,
  },
];
export const seedExperiments: Experiment[] = ['agentlens','budget','oracle'].map((id,index)=>{
 const r=seedResearch.find(r=>r.id===id)!;
 return {id:'plan-'+id,researchId:id,title:['Spot fragile passes in a QA agent','Compare two agent configurations on a budget','Audit the grader before trusting its scores'][index],hypothesis:r.hypothesis,implementation:r.implementation,metrics:r.metrics,results:'',followup:'',status:'Planned',effort:r.effort,created:'2026-11-21'};
});
export const initialWorkspace: Workspace={research:seedResearch,experiments:seedExperiments};
export const formatDate=(d:string)=>new Date(d+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
export const comparisons = [
 {id:'evaluation',name:'Evaluate agent quality',question:'What does a passing run actually tell us?',sources:['agentlens','evals','oracle'],columns:[
  {title:'Outcome-only grading',subtitle:'A useful baseline',effort:'Low',benefit:'Fast, deterministic checks against the final app or database state.',tradeoff:'Can miss blind retries, skipped verification and a defective grader.',stack:'Vitest / Playwright assertions + isolated fixture state',test:'Replay identical fixtures, include known-bad outputs, record repeatability.',evidence:'Engineering foundation; concrete baseline to validate locally.'},
  {title:'Outcome + process review',subtitle:'A more informative gate',effort:'Medium',benefit:'Adds evidence about how the result was reached and where effort was wasted.',tradeoff:'Extra logging and review; a process score is not proof of correctness.',stack:'Node.js JSONL trace logger + outcome assertions + trace rubric',test:'Blindly review passing traces; compare flagged passes, cost and reviewer agreement.',evidence:'AgentLens preprint; findings bounded to the studied tasks.'}
 ]},
 {id:'context',name:'Manage agent context',question:'How should an assistant reuse what it has learned?',sources:['adaptation','context'],columns:[
  {title:'Full conversation history',subtitle:'The simple baseline',effort:'Low',benefit:'Preserves prior details without a separate retrieval system.',tradeoff:'Rising token cost, irrelevant context and stale assumptions.',stack:'Messages array with a fixed token cap',test:'Track success, token use, context overflow and stale-information errors.',evidence:'Baseline; no universal quality advantage claimed.'},
  {title:'Scoped, versioned memory',subtitle:'The focused hypothesis',effort:'Medium',benefit:'Retains relevant repository knowledge while bounding context.',tradeoff:'Retrieval can omit critical details; memory needs invalidation and verification.',stack:'Typed memory records + repository version + retrieval budget',test:'Use unseen paired tasks and count skipped verification as well as success.',evidence:'Recent adaptation preprint + engineering guidance; API transfer unproven.'}
 ]},
 {id:'selection',name:'Choose an agent',question:'What is the best configuration for your workload and budget?',sources:['budget','evolution'],columns:[
  {title:'Select by public rank',subtitle:'A starting shortlist',effort:'Low',benefit:'Quick discovery of candidate model-and-agent combinations.',tradeoff:'Task mismatch, unresolved score differences and incomparable costs.',stack:'Record the exact model, harness and benchmark version',test:'Check whether benchmark tasks resemble your app before relying on scores.',evidence:'Public ranks describe specific setups; they do not prove local superiority.'},
  {title:'Capped, paired local evaluation',subtitle:'A decision you can inspect',effort:'Medium',benefit:'Measures quality and actual costs on your own representative tasks.',tradeoff:'Consumes evaluation budget; small samples leave uncertainty.',stack:'Provider adapter + held-out fixtures + token and latency logger',test:'Same tasks and repeat counts; define a budget and quality margin first.',evidence:'Budget-selection preprint supports uncertainty-aware comparison.'}
 ]}
];
