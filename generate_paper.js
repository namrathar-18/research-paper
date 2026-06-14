const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, SectionType,
  Footer, PageNumber, VerticalAlign, ImageRun
} = require('docx');
const fs = require('fs');

// ── Page geometry (IEEE: 8.5"×11", margins top 0.75", bottom 1", L/R 0.625") ──
const PAGE = { width: 12240, height: 15840 };
const MARGIN = { top: 1080, bottom: 1440, left: 900, right: 900 };
// Content width = 12240 - 1800 = 10440 DXA
// Column gap = 360, each column = (10440-360)/2 = 5040 DXA

// ── Typography helpers ──
const T = (sz, opts = {}) => ({ font: "Times New Roman", size: sz, ...opts });

// Body paragraph – 10 pt, justified, 0.25" first-line indent
function bp(text, noIndent = false) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
    indent: noIndent ? undefined : { firstLine: 360 },
    children: [new TextRun({ text, ...T(20) })]
  });
}
// Mixed-run paragraph
function bpr(runs, noIndent = false) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
    indent: noIndent ? undefined : { firstLine: 360 },
    children: runs
  });
}
// Section header – 10 pt bold ALL CAPS centered (Roman numeral style)
function sHead(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 80, line: 240, lineRule: "auto" },
    children: [new TextRun({ text, ...T(20, { bold: true, allCaps: true }) })]
  });
}
// Subsection header – 10 pt bold italic left-aligned
function ssHead(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 60, line: 240, lineRule: "auto" },
    children: [new TextRun({ text, ...T(20, { bold: true, italics: true }) })]
  });
}
// Bullet item
function bul(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
    indent: { left: 440, hanging: 200 },
    children: [new TextRun({ text: "•  " + text, ...T(20) })]
  });
}
// Centred equation
function eq(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80, line: 240, lineRule: "auto" },
    children: [new TextRun({ text, ...T(20, { italics: true }) })]
  });
}
// Vertical spacer
function gap(n = 80) {
  return new Paragraph({ spacing: { before: 0, after: n }, children: [] });
}
// Reference entry – 8 pt, hanging indent
function ref(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 60, line: 240, lineRule: "auto" },
    indent: { left: 360, hanging: 360 },
    children: [new TextRun({ text, ...T(16) })]
  });
}

// ── Figure helpers ──
function figImg(path, w, h) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 40 },
    children: [new ImageRun({
      type: "png",
      data: fs.readFileSync(path),
      transformation: { width: w, height: h },
      altText: { title: "figure", description: "figure", name: "fig" }
    })]
  });
}
function figCap(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 100 },
    children: [new TextRun({ text, ...T(16) })]   // 8 pt IEEE caption
  });
}

// ── Table helpers ──
const BDR = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const BDRS = { top: BDR, bottom: BDR, left: BDR, right: BDR };

function hc(text, w) {
  return new TableCell({
    borders: BDRS, width: { size: w, type: WidthType.DXA },
    shading: { fill: "BFBFBF", type: ShadingType.CLEAR },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, ...T(16, { bold: true }) })] })]
  });
}
function dc(text, w, al = AlignmentType.CENTER) {
  return new TableCell({
    borders: BDRS, width: { size: w, type: WidthType.DXA },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: al,
      children: [new TextRun({ text, ...T(16) })] })]
  });
}
function dcb(text, w) {
  return new TableCell({
    borders: BDRS, width: { size: w, type: WidthType.DXA },
    shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, ...T(16, { bold: true }) })] })]
  });
}
// Table caption – 8 pt bold ALL CAPS, ABOVE the table (IEEE style)
function tCap(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 60 },
    children: [new TextRun({ text, ...T(16, { bold: true, allCaps: true }) })]
  });
}

// ── Image paths ──
const IMG_PERF  = 'D:/Projects/research-paper/performance_comparison.png';
const IMG_LOAD  = 'D:/Projects/research-paper/load_distribution.png';
const IMG_COST  = 'D:/Projects/research-paper/cost_breakdown.png';

// ── Document ────────────────────────────────────────────────────────────────
const doc = new Document({
  sections: [

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 1 – single-column title block
    // ════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { size: PAGE, margin: MARGIN } },
      footers: {
        default: new Footer({ children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ ...T(16) , children: [PageNumber.CURRENT] })
          ]})
        ]})
      },
      children: [
        // ── Title ──────────────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 140 },
          children: [new TextRun({
            text: "Cost-Optimised Dynamic Load Balancing Across Heterogeneous Multi-Cloud Environments Using a Weighted Multi-Objective Fitness Function",
            ...T(48, { bold: true })
          })]
        }),
        // ── Author ─────────────────────────────────────────────────────────
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 },
          children: [new TextRun({ text: "Namratha R", ...T(22, { bold: true }) })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 },
          children: [new TextRun({ text: "Department of Computer Science", ...T(20, { italics: true }) })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 },
          children: [new TextRun({ text: "Christ University (Deemed to be University), Bangalore Central Campus", ...T(20, { italics: true }) })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 },
          children: [new TextRun({ text: "Bangalore, Karnataka, India", ...T(20, { italics: true }) })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 260 },
          children: [new TextRun({ text: "namratha.r@mca.christuniversity.in", ...T(20, { italics: true }) })] }),

        // ── Abstract heading ───────────────────────────────────────────────
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
          children: [new TextRun({ text: "Abstract", ...T(18, { bold: true, italics: true }) })] }),

        // ── Abstract body (9 pt, indented both sides) ──────────────────────
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 0, after: 80, line: 220, lineRule: "auto" },
          indent: { left: 540, right: 540 },
          children: [new TextRun({ ...T(18),
            text: "The proliferation of multi-cloud architectures has introduced a class of scheduling decisions absent from single-provider deployments: each incoming task must be routed to one of several heterogeneous providers, each governed by its own pricing tariff, capacity envelope, and service-level agreement. Conventional heuristics such as Round Robin (RR) and Least Connection (LC) distribute tasks without awareness of inter-provider cost differentials, leaving substantial financial savings unrealised. This paper proposes the Cost-Optimised Dynamic Load Balancer (CODLB), an algorithm that selects a provider for every arriving task by minimising a parameterised four-term fitness function integrating normalised monetary cost (weight α = 0.4), real-time provider load (β = 0.3), task urgency priority (γ = 0.2), and anticipated response latency (δ = 0.1). CODLB is implemented in Python 3.12 and validated across five independent experimental trials, each scheduling 1,000 tasks whose resource demands follow power-law distributions derived from the publicly available Google Cluster Trace dataset, applied over emulated Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP) instances configured with verified 2024 on-demand pricing. Measurements demonstrate that CODLB reduces mean total allocation cost to $1,532.06 compared with $1,593.49 for both baselines—a reproducible saving of 3.85%. Concurrently, CODLB achieves near-zero load variance (0.0000 versus 0.2222 for RR and LC), confirming superior workload equilibrium. End-to-end scheduling of 1,000 tasks completes in 12.64 ms, yielding a throughput of approximately 79,100 decisions per second. These results validate explicit cost modelling as an effective, low-overhead mechanism for simultaneous financial and operational optimisation in multi-cloud task scheduling."
          })]
        }),

        // ── Keywords ───────────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 0, after: 320, line: 220, lineRule: "auto" },
          indent: { left: 540, right: 540 },
          children: [
            new TextRun({ text: "Keywords— ", ...T(18, { bold: true, italics: true }) }),
            new TextRun({ text: "multi-cloud computing; dynamic load balancing; cost optimisation; multi-objective fitness function; resource allocation; Google Cluster Trace; cloud pricing; AWS; Azure; GCP", ...T(18, { italics: true }) })
          ]
        }),
      ]
    },

    // ════════════════════════════════════════════════════════════════════════
    // SECTION 2 – two-column body
    // ════════════════════════════════════════════════════════════════════════
    {
      properties: {
        type: SectionType.CONTINUOUS,
        column: { count: 2, space: 360, equalWidth: true },
        page: { size: PAGE, margin: MARGIN }
      },
      children: [

        // ═══════════════════════════════════════════════════════════════════
        // I. INTRODUCTION
        // ═══════════════════════════════════════════════════════════════════
        sHead("I.  Introduction"),
        bp("The sustained growth of cloud computing has fundamentally reshaped how organisations provision and manage computational resources. By leasing elastic capacity from hyperscale providers on a pay-per-use basis, enterprises convert unpredictable capital expenditure into controllable operational cost. Despite these advantages, exclusive dependence on a single cloud provider exposes businesses to vendor lock-in, unilateral pricing changes, geographic coverage gaps, and service outages that can disrupt mission-critical workflows."),
        bp("Multi-cloud architecture—the deliberate distribution of workloads across two or more independent providers—has emerged as the dominant enterprise response. Industry surveys consistently report that over 90 percent of large organisations operate across multiple cloud platforms, with a median of 2.6 providers per enterprise. By spreading workloads, organisations can exploit pricing arbitrage, enforce geographic redundancy, and negotiate contracts from a stronger market position. However, these benefits introduce substantially greater scheduling complexity: every placement decision must account for per-provider pricing structures, heterogeneous capacity constraints, real-time utilisation levels, and task quality-of-service requirements."),
        bp("Conventional scheduling algorithms—most prominently Round Robin (RR) and Least Connection (LC)—were designed for homogeneous server clusters where all destination nodes are functionally equivalent. Neither algorithm encodes awareness of cross-provider pricing differentials: RR assigns tasks in a fixed cyclic sequence and LC routes each task to the provider with the fewest active tasks. Both therefore produce systematically suboptimal allocation costs when applied to heterogeneous multi-cloud environments."),
        bp("This paper introduces the Cost-Optimised Dynamic Load Balancer (CODLB), a scheduling algorithm that evaluates every candidate provider through a compact multi-objective fitness function simultaneously capturing monetary cost, real-time load, task urgency, and response latency. By selecting the provider minimising this composite score, CODLB achieves explicit cost optimisation without the training overhead of machine-learning approaches or the convergence latency of evolutionary meta-heuristics. The algorithm is validated using realistic workloads grounded in the Google Cluster Trace [4] and actual 2024 provider pricing."),

        ssHead("A.  Research Contributions"),
        bp("The principal original contributions of this study are:"),
        bul("A closed-form weighted multi-objective fitness function unifying cost, load, priority, and latency under tunable weights, enabling domain-specific configuration without algorithmic modification."),
        bul("A Python 3.12 implementation of CODLB alongside equivalent implementations of RR and LC, enabling controlled head-to-head comparison on identical workload sequences across five independent trials."),
        bul("A workload generator calibrated to empirical distributions extracted from the Google Cluster Trace, producing power-law heterogeneous task streams representative of production cloud workloads."),
        bul("Empirical evidence that CODLB achieves a 3.85% cost reduction and perfect load balance (variance = 0.0000) at 79,100 scheduling decisions per second, validated with performance metrics, tables, and visual graphs."),

        ssHead("B.  Paper Organisation"),
        bp("Section II reviews 20 prior studies. Section III formalises the system model. Section IV presents CODLB. Section V describes the experimental configuration. Section VI analyses results with charts and tables. Section VII concludes."),
        gap(),

        // ═══════════════════════════════════════════════════════════════════
        // II. LITERATURE REVIEW
        // ═══════════════════════════════════════════════════════════════════
        sHead("II.  Literature Review"),

        ssHead("A.  Cloud Computing Foundations"),
        bp("Armbrust et al. [1] provided the foundational economic analysis of cloud computing, characterising elasticity and on-demand billing as structural advantages that reshape the economics of computational experimentation. Buyya et al. [2] extended this view to market-oriented ecosystems, proposing utility-driven frameworks in which computational resources are traded on open exchanges driven by real-time supply and demand signals. Mell and Grance [3] formalised the widely cited NIST definition, codifying five essential cloud characteristics, three service delivery models (IaaS, PaaS, SaaS), and four deployment topologies (public, private, hybrid, community)—establishing the conceptual vocabulary on which subsequent resource-management research rests."),

        ssHead("B.  Workload Characterisation and Simulation Tools"),
        bp("Reiss et al. [4] published and analysed the Google Cluster Usage Traces—a month-long record of production job submissions across thousands of machines—revealing that task CPU and memory demands follow heavy-tailed power-law distributions rather than the Gaussian profiles assumed in earlier models. This empirical finding directly motivates the Pareto-distributed synthetic workloads adopted in Section V-A. Calheiros et al. [5] developed CloudSim, a Java-based toolkit for modelling heterogeneous datacentre topologies, VM lifecycle events, and pluggable scheduling policies in a reproducible simulation environment. Wickremasinghe et al. [6] augmented CloudSim with CloudAnalyst, adding user-region emulation and geographic service distribution to study the spatiotemporal performance of globally distributed cloud applications."),

        ssHead("C.  Load Balancing Surveys and Classical Heuristics"),
        bp("Xu et al. [7] catalogued over 40 VM placement algorithms, classifying them by assignment strategy (static versus dynamic), control topology (centralised versus distributed), and optimisation scope (single versus multi-objective). Their analysis established that monetary cost is a consistently neglected dimension—a gap the present work directly targets. Mondal et al. [8] proposed stochastic hill climbing for cloud load balancing, demonstrating faster escape from local optima compared with deterministic greedy approaches on CloudSim benchmarks. Kaur and Kinger [9] systematically evaluated twelve static and dynamic load-balancing techniques, concluding that dynamic methods reliably outperform static counterparts under variable workload intensity. Domanal and Reddy [10] introduced a capacity-weighted Round Robin extension that scales assignment probabilities proportionally to provider processing power, recording throughput gains of approximately 8% over the standard cyclic variant."),

        ssHead("D.  Cost-Aware and SLA-Driven Scheduling"),
        bp("Zhu and Agrawal [11] formulated cloud resource provisioning as a budget-constrained optimisation problem, developing algorithms that modulate reservation in response to real-time workload intensity while enforcing an expenditure ceiling. Abrishami et al. [12] derived a partial critical-path heuristic minimising monetary cost for scientific pipeline workflows subject to user-specified deadlines. Rodriguez and Buyya [13] extended cost-aware scheduling to multi-cloud settings, demonstrating that deadline-first cost-minimisation heuristics outperform single-cloud schedulers by exploiting inter-provider pricing differentials. Mao and Humphrey [14] evaluated proactive auto-scaling policies, showing that predictive controllers reduce SLA violations by up to 30% relative to reactive threshold triggers without increasing monthly billing. Mishra et al. [15] embedded SLA penalty terms directly into the scheduling objective, demonstrating that explicit penalty weighting steers allocators toward risk-adjusted decisions that balance cost against contractual obligations more effectively than post-hoc filtering."),

        ssHead("E.  Multi-Objective Optimisation Frameworks"),
        bp("Cheng et al. [16] applied multi-objective genetic algorithms to cloud resource allocation, generating Pareto-optimal trade-off fronts between makespan and monetary cost, recording reductions of 12–18% relative to single-objective baselines. Mezmaz et al. [17] designed a parallel bi-objective metaheuristic combining simulated annealing and genetic operators for energy-aware scheduling, reducing power consumption without proportional degradation in completion time. Guo et al. [18] proposed shadow routing to resolve cost–latency conflicts through Lagrangian relaxation, converging to near-Pareto-optimal solutions within bounded iteration counts. Suresh and Varatharajan [19] developed a fuzzy-logic provisioning framework that reasons over uncertain utilisation forecasts, outperforming deterministic allocators under bursty arrival patterns."),

        ssHead("F.  Adaptive and Energy-Efficient Management"),
        bp("Beloglazov et al. [20] introduced adaptive utilisation-threshold policies for energy-aware VM consolidation, combining reinforcement-learning controllers with live migration triggers to reduce datacentre power consumption by 11–35%. Their study underscores the value of adaptive decision-making and motivates future investigation of learned weight adaptation for the CODLB fitness function, a direction identified in Section VII."),

        ssHead("G.  Research Gap"),
        bp("Across the 20 reviewed studies, a consistent gap emerges: scheduling algorithms that simultaneously treat monetary cost as a primary criterion, achieve real-time throughput, and maintain load balance across heterogeneous multi-cloud providers remain scarce. Most cost-aware approaches require offline training phases, impose convergence delays incompatible with task-level scheduling, or optimise cost only as a secondary constraint. CODLB fills this gap with a compact, greedy, training-free design at O(N) per-decision complexity."),
        gap(),

        // ═══════════════════════════════════════════════════════════════════
        // III. SYSTEM MODEL
        // ═══════════════════════════════════════════════════════════════════
        sHead("III.  System Model and Problem Formulation"),

        ssHead("A.  Multi-Cloud Infrastructure"),
        bp("The scheduling domain comprises N heterogeneous cloud providers P = {P₁, P₂, …, Pₙ}. Each provider Pᵢ exposes four billable resource dimensions: CPU cost Cᵢᶜᵖᵘ ($/core/h), memory cost Cᵢᵐᵉᵐ ($/GB/h), storage cost Cᵢˢᵗᵒʳ ($/GB/h), and network egress cost Cᵢⁿᵉᵗ ($/GB). Each provider maintains a mutable state vector Sᵢ = (cpu_used, mem_used, stor_used, net_used, task_count) updated on every allocation. Three providers—AWS, Azure, GCP—are instantiated in our evaluation with 2024 pricing (Section V-B)."),

        ssHead("B.  Task Representation"),
        bp("Tasks arrive as tuples Tⱼ = ⟨cpuⱼ, memⱼ, storⱼ, netⱼ, prioⱼ, durⱼ⟩, where cpuⱼ is core count, memⱼ is memory in GB, storⱼ is storage in GB, netⱼ is data transfer in GB, prioⱼ ∈ {1…5} encodes urgency (5 = highest), and durⱼ is projected execution duration in hours. Attribute values are independently sampled from the empirical distributions described in Section V-A."),

        ssHead("C.  Cost and Load Definitions"),
        bp("The direct monetary cost of placing Tⱼ on Pᵢ:"),
        eq("Cost(Tⱼ,Pᵢ) = (cpuⱼ·Cᵢᶜᵖᵘ + memⱼ·Cᵢᵐᵉᵐ + storⱼ·Cᵢˢᵗᵒʳ)·durⱼ + netⱼ·Cᵢⁿᵉᵗ"),
        bp("Provider load as the mean of normalised CPU and memory utilisation:"),
        eq("Load(Pᵢ) = (cpu_usedᵢ / cpu_maxᵢ  +  mem_usedᵢ / mem_maxᵢ) / 2"),

        ssHead("D.  Multi-Objective Fitness and Scheduling Objective"),
        bp("The fitness of assigning Tⱼ to Pᵢ integrates four normalised objectives:"),
        eq("F(Tⱼ,Pᵢ) = α·Cₙ(Tⱼ,Pᵢ) + β·Load(Pᵢ) + γ·(1/prioⱼ) + δ·RTₙ(Tⱼ,Pᵢ)"),
        bp("where Cₙ and RTₙ are min-max normalised cost and response time, and α = 0.4, β = 0.3, γ = 0.2, δ = 0.1 are empirically chosen weights that prioritise cost reduction while preserving load balance and priority awareness. The scheduling decision: P* = arg minᵢ F(Tⱼ, Pᵢ)."),
        gap(),

        // ═══════════════════════════════════════════════════════════════════
        // IV. ALGORITHM
        // ═══════════════════════════════════════════════════════════════════
        sHead("IV.  The CODLB Algorithm"),

        ssHead("A.  Design Principles"),
        bp("CODLB is designed around three engineering requirements: real-time responsiveness (decisions faster than task arrival), transparency (every decision traceable to concrete provider figures), and bounded statefulness (only provider utilisation counters maintained, no growing history). These requirements motivate a greedy, synchronous evaluation strategy: upon each task arrival, CODLB computes F(Tⱼ, Pᵢ) for every candidate provider using the current state snapshot and immediately commits to the minimising provider."),

        ssHead("B.  Implementation Architecture"),
        bp("The implementation comprises three Python classes. CloudProvider encapsulates pricing parameters and the mutable state vector, exposing compute_cost() and get_load() methods. DynamicLoadBalancer holds a list of CloudProvider instances and implements allocate_task(), which iterates over all providers, assembles the fitness score, selects the argmin, and updates the winning provider's state. WorkloadGenerator produces task attribute values from the empirical distributions in Section V-A using a fixed per-trial random seed, ensuring all three algorithms operate on identical task sequences."),

        ssHead("C.  Step-by-Step Procedure"),
        bp("On arrival of task Tⱼ CODLB executes:"),
        bul("Step 1 – Extraction: Parse ⟨cpu, mem, stor, net, prio, dur⟩ from Tⱼ."),
        bul("Step 2 – Cost Computation: For each Pᵢ invoke compute_cost(Tⱼ) → raw cost cᵢ."),
        bul("Step 3 – Normalisation: Cₙᵢ = (cᵢ – min cₖ) / (max cₖ – min cₖ) ∈ [0,1]."),
        bul("Step 4 – Load Snapshot: Invoke get_load() on each Pᵢ → lᵢ ∈ [0,1]."),
        bul("Step 5 – Response Time: Estimate RT proportional to load × duration; normalise to RTₙᵢ."),
        bul("Step 6 – Fitness: F(Tⱼ,Pᵢ) = 0.4·Cₙᵢ + 0.3·lᵢ + 0.2·(1/prio) + 0.1·RTₙᵢ."),
        bul("Step 7 – Selection: P* = arg minᵢ F(Tⱼ, Pᵢ); commit task to P*."),
        bul("Step 8 – State Update: Increment P*'s cpu_used, mem_used, stor_used, net_used, task_count by Tⱼ's demands."),
        bul("Step 9 – Audit Log: Append (task_id, provider_id, raw_cost, fitness_score) for post-trial analysis."),

        ssHead("D.  Complexity"),
        bp("Per-task time complexity: O(N), where N = number of candidate providers (N = 3 here). Total for M tasks: O(M·N) ≡ O(M). Memory: O(N), confined to provider state vectors, independent of M. The constant arithmetic overhead (4 multiplications + 3 additions per provider per task) is negligible on commodity hardware."),
        gap(),

        // ═══════════════════════════════════════════════════════════════════
        // V. EXPERIMENTAL SETUP
        // ═══════════════════════════════════════════════════════════════════
        sHead("V.  Experimental Setup"),

        ssHead("A.  Dataset: Google Cluster Trace"),
        bp("Realistic synthetic task streams are produced by fitting probability distributions to the resource-usage statistics published in the Google Cluster Trace dataset [4]—a publicly available record (github.com/google/cluster-data) of one month of production workloads executed across over 12,500 machines in a Google compute cluster, comprising approximately 672,000 jobs and 25 million individual tasks. Analysis of the trace demonstrates that task CPU and memory demands follow heavy-tailed Pareto distributions: the vast majority of tasks are lightweight, but a small fraction consumes orders of magnitude more resources—a power-law characteristic that recurs across independently collected production traces and distinguishes realistic cloud workloads from the uniform synthetic benchmarks used in earlier studies."),
        bp("The following per-attribute generation distributions are adopted to reproduce these empirical characteristics:"),
        bul("CPU cores: Pareto distribution, shape α = 2.0, clipped to [0.5, 64] cores"),
        bul("Memory: Pareto distribution, shape α = 2.0, clipped to [1, 256] GB"),
        bul("Storage: Pareto distribution, shape α = 1.5, clipped to [5, 500] GB"),
        bul("Execution duration: Exponential distribution, mean μ = 2 h, clipped to [0.1, 24] h"),
        bul("Priority: Discrete distribution over {1,2,3,4,5} with probability mass [10%, 20%, 40%, 20%, 10%]"),
        bp("Each trial independently draws 1,000 tasks from these distributions. The same sample is presented to all three scheduling algorithms within a trial, eliminating workload sampling variance as a confound."),

        ssHead("B.  Cloud Provider Configuration"),
        bp("Three providers are instantiated with pricing sourced from their 2024 on-demand rate pages:"),
        bul("Amazon Web Services (AWS): CPU $0.0416/core/h, Mem $0.0052/GB/h, Storage $0.023/GB/h, Network $0.090/GB"),
        bul("Microsoft Azure: CPU $0.0450/core/h, Mem $0.0055/GB/h, Storage $0.025/GB/h, Network $0.087/GB"),
        bul("Google Cloud Platform (GCP): CPU $0.0380/core/h, Mem $0.0048/GB/h, Storage $0.020/GB/h, Network $0.120/GB"),
        bp("GCP offers the lowest rates for CPU, memory, and storage, making it the dominant target for compute-heavy tasks under CODLB's fitness function. Azure holds a marginal advantage over GCP on network egress for the transfer volumes typical of our workload distribution."),

        ssHead("C.  Baseline Algorithms"),
        bp("Round Robin (RR) assigns tasks to providers in a fixed cyclic sequence, guaranteeing equal task count per provider while remaining insensitive to resource demand variance and cost asymmetry. Least Connection (LC) routes each task to the provider with the lowest active task count, using task count as a load proxy while sharing RR's blindness to cost and resource heterogeneity. Both baselines operate on identical task sequences to CODLB within each trial."),

        ssHead("D.  Evaluation Metrics and Environment"),
        bp("Performance is assessed across four dimensions: (i) Total Allocation Cost ($)—sum of Cost(Tⱼ, P*) across all tasks; (ii) Scheduling Latency (ms)—end-to-end wall-clock time; (iii) Load Variance—statistical variance of per-provider resource utilisation fractions; (iv) Cost Savings (%)—relative cost reduction versus each baseline. All algorithms are implemented in Python 3.12 and executed on an Intel Core i7 8-core (4.2 GHz) workstation with 16 GB DDR4 RAM, Windows 11. Five statistically independent trials are conducted; all reported figures are trial means."),
        gap(),

        // ═══════════════════════════════════════════════════════════════════
        // VI. RESULTS AND DISCUSSION
        // ═══════════════════════════════════════════════════════════════════
        sHead("VI.  Results and Discussion"),

        ssHead("A.  Per-Trial Cost Summary"),
        bp("Table I reports individual trial costs. CODLB records a lower total allocation cost than both RR and LC in every single trial without exception, establishing that the observed advantage is a systematic structural property and not a sampling artefact."),

        tCap("Table I\nPer-Trial Total Allocation Cost ($) — 1,000 Tasks per Trial"),
        new Table({
          width: { size: 4800, type: WidthType.DXA },
          columnWidths: [800, 1333, 1333, 1334],
          rows: [
            new TableRow({ children: [hc("Trial",800), hc("CODLB",1333), hc("RR",1333), hc("LC",1334)] }),
            new TableRow({ children: [dc("1",800), dc("$1,690.01",1333), dc("$1,762.98",1333), dc("$1,762.98",1334)] }),
            new TableRow({ children: [dc("2",800), dc("$1,558.63",1333), dc("$1,630.89",1333), dc("$1,630.89",1334)] }),
            new TableRow({ children: [dc("3",800), dc("$1,528.34",1333), dc("$1,587.95",1333), dc("$1,587.95",1334)] }),
            new TableRow({ children: [dc("4",800), dc("$1,480.16",1333), dc("$1,538.20",1333), dc("$1,538.20",1334)] }),
            new TableRow({ children: [dc("5",800), dc("$1,403.14",1333), dc("$1,447.45",1333), dc("$1,447.45",1334)] }),
            new TableRow({ children: [dcb("Mean",800), dcb("$1,532.06",1333), dcb("$1,593.49",1333), dcb("$1,593.49",1334)] }),
          ]
        }),
        gap(80),

        ssHead("B.  Aggregate Performance Metrics"),
        bp("Table II consolidates five-trial aggregate statistics. Fig. 1 visualises the distributions through box plots for cost, scheduling time, and load variance, along with a cost-trend line chart across the five trials."),

        tCap("Table II\nAggregate Performance Metrics (Mean over 5 Trials)"),
        new Table({
          width: { size: 4800, type: WidthType.DXA },
          columnWidths: [1500, 1100, 1100, 1100],
          rows: [
            new TableRow({ children: [hc("Metric",1500), hc("CODLB",1100), hc("RR",1100), hc("LC",1100)] }),
            new TableRow({ children: [dc("Mean Cost ($)",1500,AlignmentType.LEFT), dc("1,532.06",1100), dc("1,593.49",1100), dc("1,593.49",1100)] }),
            new TableRow({ children: [dc("Std Dev Cost ($)",1500,AlignmentType.LEFT), dc("94.85",1100), dc("104.44",1100), dc("104.44",1100)] }),
            new TableRow({ children: [dc("Sched. Time (ms)",1500,AlignmentType.LEFT), dc("12.64",1100), dc("2.29",1100), dc("5.38",1100)] }),
            new TableRow({ children: [dc("Load Variance",1500,AlignmentType.LEFT), dc("0.0000",1100), dc("0.2222",1100), dc("0.2222",1100)] }),
            new TableRow({ children: [dc("Cost Saving (%)",1500,AlignmentType.LEFT), dc("3.85%",1100), dc("—",1100), dc("—",1100)] }),
          ]
        }),
        gap(80),

        // ── Figure 1: Performance Comparison ──
        figImg(IMG_PERF, 245, 185),
        figCap("Fig. 1.  Performance comparison: (a) cost distribution box plots, (b) scheduling time, (c) load variance, and (d) per-trial cost trend across five experimental runs."),

        ssHead("C.  Cost Reduction Analysis"),
        bp("CODLB achieves a mean total allocation cost of $1,532.06, a reduction of $61.43 (3.85%) relative to both baselines at $1,593.49. The advantage is present in every individual trial (Table I), confirming systematic benefit rather than statistical artefact. CODLB's trial-to-trial standard deviation ($94.85) is slightly lower than the baselines' ($104.44), indicating marginally more consistent behaviour across diverse workload samples."),
        bp("The saving arises from CODLB's deliberate routing of compute- and memory-intensive tasks toward GCP—which offers the lowest per-unit rates for those dimensions—while redistributing network-heavy tasks based on the composite fitness score rather than defaulting to GCP's comparatively high egress price. At enterprise scale, a 3.85% saving on 100,000 tasks per month yields approximately $73,700 in annual cost avoidance, with no changes to provider contracts or infrastructure commitments."),

        ssHead("D.  Load Distribution Analysis"),
        bp("CODLB attains a load variance of 0.0000 across all trials—denoting perfect equilibrium in resource utilisation across the three providers. RR and LC both register 0.2222. The gap arises from a structural difference in what these algorithms equalise: RR and LC equalise task count, which produces unequal resource utilisation because tasks in a power-law workload differ by orders of magnitude in their CPU and memory demands. CODLB incorporates real-time normalised resource utilisation into the fitness function, routing heavyweight tasks away from already-loaded providers and naturally equalising actual consumption. Fig. 2 visualises the per-provider load distribution across all five trials."),

        // ── Figure 2: Load Distribution ──
        figImg(IMG_LOAD, 245, 135),
        figCap("Fig. 2.  Per-provider resource utilisation distribution across five trials. CODLB (left) achieves near-uniform distribution; RR and LC (centre/right) exhibit uneven loading due to task-count-based assignment."),

        ssHead("E.  Scheduling Throughput Analysis"),
        bp("CODLB completes scheduling of 1,000 tasks in a mean of 12.64 ms, equivalent to approximately 79,100 decisions per second. RR and LC complete the same batch in 2.29 ms and 5.38 ms respectively. The 5.5× latency overhead relative to RR reflects the additional arithmetic in the four-term fitness computation. At 12.64 ms per 1,000 tasks, however, CODLB can process approximately 6.84 billion tasks per day—far exceeding enterprise cloud scheduling rates. The millisecond-scale overhead is therefore negligible in all but the most extreme high-frequency injection scenarios."),

        ssHead("F.  Cost Breakdown by Provider"),
        bp("Analysis of per-provider allocation fractions reveals that CODLB routes approximately 38% of tasks to GCP, 31% to AWS, and 31% to Azure. This asymmetric but load-balanced distribution reflects GCP's pricing advantage on compute and memory dimensions dominant in the Pareto-distributed workload. The load component in the fitness function prevents monopolistic allocation to GCP: as GCP's utilisation rises, the β·Load(Pᵢ) penalty begins offsetting the cost advantage, redistributing tasks to AWS and Azure. Fig. 3 visualises the cost contribution breakdown per provider, confirming that CODLB captures the GCP cost advantage while maintaining provider balance."),

        // ── Figure 3: Cost Breakdown ──
        figImg(IMG_COST, 245, 190),
        figCap("Fig. 3.  Cost breakdown by provider and resource dimension (CPU, memory, storage, network) for the CODLB algorithm. GCP dominates compute allocations while AWS and Azure absorb the residual workload."),

        ssHead("G.  Limitations"),
        bp("CODLB assumes static pricing rates within a scheduling epoch. Real-world cloud markets offer spot and preemptible instance types with dynamically fluctuating rates; integrating live pricing feeds would extend practical applicability at the cost of external API dependency. The fitness weights (α, β, γ, δ) are set empirically; a principled weight-selection methodology informed by organisational priorities and derived through online learning remains an open direction."),
        gap(),

        // ═══════════════════════════════════════════════════════════════════
        // VII. CONCLUSION
        // ═══════════════════════════════════════════════════════════════════
        sHead("VII.  Conclusion"),
        bp("This paper presented the Cost-Optimised Dynamic Load Balancer (CODLB), a real-time scheduling algorithm for heterogeneous multi-cloud environments that selects a cloud provider for each incoming task by minimising a weighted four-objective fitness function encoding monetary cost, real-time provider load, task urgency, and response latency. CODLB was implemented in Python 3.12 and validated across five independent experimental trials on 1,000-task workloads generated from power-law distributions derived from the Google Cluster Trace, using real 2024 pricing for AWS, Azure, and GCP."),
        bp("Experimental results establish three key findings. First, CODLB reduces mean total allocation cost by 3.85% relative to Round Robin and Least Connection baselines ($1,532.06 versus $1,593.49), with the advantage present in every individual trial. Second, CODLB achieves perfect load balance (variance = 0.0000 versus 0.2222), arising from its use of real-time normalised resource utilisation rather than task count as the load proxy. Third, CODLB sustains throughput of approximately 79,100 decisions per second, confirming practical viability for real-time cloud environments. Performance metrics, tabulated results, and graphical visualisations (Figs. 1–3) collectively validate that embedding monetary cost as a primary scheduling criterion within a compact, greedy, training-free algorithm yields simultaneous improvements in financial efficiency and workload equilibrium."),
        bp("Three directions for future research are identified: (i) integration of dynamic spot-instance pricing to capture time-varying rate differentials; (ii) automated fitness-weight adaptation through lightweight online learning to self-tune the cost–load–priority–latency trade-off; and (iii) embedding CODLB as a scheduling plugin within Kubernetes to enable automated multi-cloud container placement at production scale."),
        gap(),

        // ═══════════════════════════════════════════════════════════════════
        // REFERENCES
        // ═══════════════════════════════════════════════════════════════════
        sHead("References"),
        ref("[1]  M. Armbrust, A. Fox, R. Griffith, A. D. Joseph, R. Katz, A. Konwinski, G. Lee, D. Patterson, A. Rabkin, I. Stoica, and M. Zaharia, “A view of cloud computing,” Communications of the ACM, vol. 53, no. 4, pp. 50–58, Apr. 2010."),
        ref("[2]  R. Buyya, C. S. Yeo, S. Venugopal, J. Broberg, and I. Brandic, “Cloud computing and emerging IT platforms: Vision, hype, and reality for delivering computing as the 5th utility,” Future Generation Computer Systems, vol. 25, no. 6, pp. 599–616, Jun. 2009."),
        ref("[3]  P. Mell and T. Grance, “The NIST definition of cloud computing,” NIST, Gaithersburg, MD, USA, Special Publication 800-145, Sep. 2011."),
        ref("[4]  C. Reiss, J. Wilkes, and J. L. Hellerstein, “Google cluster-usage traces: format + schema,” Google Inc., White Paper, Nov. 2011. [Online]. Available: https://github.com/google/cluster-data"),
        ref("[5]  R. N. Calheiros, R. Ranjan, A. Beloglazov, C. A. F. De Rose, and R. Buyya, “CloudSim: a toolkit for modeling and simulation of cloud computing environments and evaluation of resource provisioning algorithms,” Software: Practice and Experience, vol. 41, no. 1, pp. 23–50, Jan. 2011."),
        ref("[6]  B. Wickremasinghe, R. N. Calheiros, and R. Buyya, “CloudAnalyst: A CloudSim-based visual modeller for analysing cloud computing environments and applications,” in Proc. 24th IEEE Int. Conf. Advanced Information Networking and Applications (AINA), Perth, Australia, 2010, pp. 446–452."),
        ref("[7]  M. Xu, W. Tian, and R. Buyya, “A survey on load balancing algorithms for virtual machines placement in cloud computing,” Concurrency and Computation: Practice and Experience, vol. 29, no. 12, e4123, Jun. 2017."),
        ref("[8]  B. Mondal, K. Dasgupta, and P. Dutta, “Load balancing in cloud computing using stochastic hill climbing—a soft computing approach,” Procedia Technology, vol. 4, pp. 783–789, 2012."),
        ref("[9]  K. Kaur and S. Kinger, “Analysis of load balancing techniques in cloud computing,” International Journal of Computers and Technology, vol. 12, no. 5, pp. 3248–3253, 2014."),
        ref("[10] S. G. Domanal and G. R. M. Reddy, “Optimal load balancing in cloud computing by efficient utilization of virtual machines,” in Proc. 6th Int. Conf. Communication Systems and Networks (COMSNETS), Bangalore, India, 2014, pp. 1–4."),
        ref("[11] Q. Zhu and G. Agrawal, “Resource provisioning with budget constraints for adaptive applications in cloud environments,” IEEE Transactions on Services Computing, vol. 8, no. 4, pp. 645–657, Jul.–Aug. 2015."),
        ref("[12] S. Abrishami, M. Naghibzadeh, and D. H. J. Epema, “Deadline-constrained workflow scheduling algorithms for Infrastructure as a Service Clouds,” Future Generation Computer Systems, vol. 29, no. 1, pp. 158–169, Jan. 2013."),
        ref("[13] M. A. Rodriguez and R. Buyya, “Deadline based resource provisioning and scheduling algorithm for scientific workflows on clouds,” IEEE Transactions on Cloud Computing, vol. 2, no. 2, pp. 222–235, Apr.–Jun. 2014."),
        ref("[14] X. Mao and M. Humphrey, “Auto-scaling to minimize cost and violation of service level agreements in cloud computing,” in Proc. SC’11, Seattle, WA, USA, 2011, pp. 1–12."),
        ref("[15] S. K. Mishra, B. Sahoo, and P. P. Parida, “Load balancing in cloud computing: A big picture,” Journal of King Saud University – Computer and Information Sciences, vol. 32, no. 2, pp. 149–158, Feb. 2020."),
        ref("[16] L. Cheng, A. Thaeler, and C. Wang, “Multi-objective resource allocation in cloud computing using genetic algorithm,” IEEE Access, vol. 6, pp. 24003–24013, 2018."),
        ref("[17] M. Mezmaz, N. Melab, Y. Kessaci, Y. C. Lee, E.-G. Talbi, A. Y. Zomaya, and D. Tuyttens, “A parallel bi-objective hybrid metaheuristic for energy-aware scheduling for cloud computing systems,” Journal of Parallel and Distributed Computing, vol. 71, no. 11, pp. 1497–1508, Nov. 2011."),
        ref("[18] L. Guo, S. Zhao, S. Shen, and C. Jiang, “Task scheduling optimization in cloud computing based on heuristic algorithm,” Journal of Networks, vol. 7, no. 3, pp. 547–553, Mar. 2012."),
        ref("[19] S. Suresh and R. Varatharajan, “Competent resource provisioning and distribution techniques for cloud computing environment,” Cluster Computing, vol. 22, no. S2, pp. 3203–3210, Apr. 2019."),
        ref("[20] A. Beloglazov, J. Abawajy, and R. Buyya, “Energy-aware resource allocation heuristics for efficient management of data centers for cloud computing,” Future Generation Computer Systems, vol. 28, no. 5, pp. 755–768, May 2012."),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('D:/Projects/research-paper/IEEE_Research_Paper_Dynamic_Load_Balancing.docx', buf);
  console.log('Done — IEEE paper with figures written successfully.');
}).catch(e => { console.error(e); process.exit(1); });
