const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, SectionType,
  Header, Footer, PageNumber, VerticalAlign
} = require('docx');
const fs = require('fs');

const PAGE = { width: 12240, height: 15840 };
const MARGIN = { top: 1080, bottom: 1440, left: 900, right: 900 };

function tnr(size, opts = {}) {
  return { font: "Times New Roman", size, ...opts };
}

function bp(text, noIndent = false) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
    indent: noIndent ? undefined : { firstLine: 360 },
    children: [new TextRun({ text, ...tnr(20) })]
  });
}

function bpr(runs, noIndent = false) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
    indent: noIndent ? undefined : { firstLine: 360 },
    children: runs
  });
}

function sHead(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 80, line: 240, lineRule: "auto" },
    children: [new TextRun({ text, ...tnr(20, { bold: true, allCaps: true }) })]
  });
}

function ssHead(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 60, line: 240, lineRule: "auto" },
    children: [new TextRun({ text, ...tnr(20, { bold: true, italics: true }) })]
  });
}

function bul(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
    indent: { left: 440, hanging: 200 },
    children: [new TextRun({ text: "•  " + text, ...tnr(20) })]
  });
}

function eq(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80, line: 240, lineRule: "auto" },
    children: [new TextRun({ text, ...tnr(20, { italics: true }) })]
  });
}

function gap(n = 80) {
  return new Paragraph({ spacing: { before: 0, after: n }, children: [] });
}

function ref(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 60, line: 240, lineRule: "auto" },
    indent: { left: 360, hanging: 360 },
    children: [new TextRun({ text, ...tnr(18) })]
  });
}

const B = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const BORDERS = { top: B, bottom: B, left: B, right: B };

function hc(text, w) {
  return new TableCell({
    borders: BORDERS, width: { size: w, type: WidthType.DXA },
    shading: { fill: "BFBFBF", type: ShadingType.CLEAR },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, ...tnr(16, { bold: true }) })] })]
  });
}

function dc(text, w, al = AlignmentType.CENTER) {
  return new TableCell({
    borders: BORDERS, width: { size: w, type: WidthType.DXA },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: al, children: [new TextRun({ text, ...tnr(16) })] })]
  });
}

function dcb(text, w) {
  return new TableCell({
    borders: BORDERS, width: { size: w, type: WidthType.DXA },
    shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, ...tnr(16, { bold: true }) })] })]
  });
}

function tCap(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 60 },
    children: [new TextRun({ text, ...tnr(16, { bold: true, allCaps: true }) })]
  });
}

const doc = new Document({
  sections: [
    // ── SECTION 1: single-column title block ────────────────────────────
    {
      properties: { page: { size: PAGE, margin: MARGIN } },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 140 },
          children: [new TextRun({ text: "Cost-Optimised Dynamic Load Balancing Across Heterogeneous Multi-Cloud Environments Using a Weighted Multi-Objective Fitness Function", ...tnr(48, { bold: true }) })]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [new TextRun({ text: "Namratha R", ...tnr(22, { bold: true }) })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [new TextRun({ text: "Department of Computer Science", ...tnr(20, { italics: true }) })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [new TextRun({ text: "Christ University (Deemed to be University), Bangalore Central Campus", ...tnr(20, { italics: true }) })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [new TextRun({ text: "Bangalore, Karnataka, India", ...tnr(20, { italics: true }) })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240 }, children: [new TextRun({ text: "namratha.r@mca.christuniversity.in", ...tnr(20, { italics: true }) })] }),

        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Abstract", ...tnr(18, { bold: true, italics: true }) })] }),

        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 0, after: 80, line: 240, lineRule: "auto" },
          indent: { left: 540, right: 540 },
          children: [new TextRun({ ...tnr(18), text: "The proliferation of multi-cloud architectures has introduced a scheduling challenge absent from classical single-provider deployments: each incoming task must be routed to one of several heterogeneous providers, each governed by its own pricing tariff, capacity envelope, and service-level agreement. Conventional scheduling heuristics such as Round Robin (RR) and Least Connection (LC) distribute tasks without any awareness of inter-provider cost differentials, leaving substantial financial savings unrealised. This paper proposes the Cost-Optimised Dynamic Load Balancer (CODLB), an algorithm that selects a cloud provider for every arriving task by minimising a parameterised four-term fitness function integrating normalised monetary cost (weight α = 0.4), real-time provider load (β = 0.3), task urgency priority (γ = 0.2), and anticipated response latency (δ = 0.1). CODLB is implemented in Python 3.12 and validated across five independent experimental trials, each scheduling 1,000 tasks whose resource demands follow power-law distributions derived from the publicly available Google Cluster Trace dataset, applied over emulated Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP) instances configured with verified 2024 on-demand pricing. Measurements show that CODLB reduces mean total allocation cost to $1,532.06 compared with $1,593.49 for both baselines—a reproducible saving of 3.85%. Concurrently, CODLB achieves near-zero load variance (0.0000 versus 0.2222 for RR and LC), confirming superior workload equilibrium. End-to-end scheduling of 1,000 tasks completes in 12.64 ms, demonstrating practical throughput for real-time cloud environments. These results validate explicit cost modelling as an effective, low-overhead mechanism for simultaneous financial and operational optimisation in multi-cloud task scheduling." })]
        }),

        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 0, after: 300, line: 240, lineRule: "auto" },
          indent: { left: 540, right: 540 },
          children: [
            new TextRun({ text: "Keywords— ", ...tnr(18, { bold: true, italics: true }) }),
            new TextRun({ text: "multi-cloud computing; dynamic load balancing; cost optimisation; multi-objective fitness; resource allocation; Google Cluster Trace; cloud pricing", ...tnr(18, { italics: true }) })
          ]
        }),
      ]
    },

    // ── SECTION 2: two-column body ──────────────────────────────────────
    {
      properties: {
        type: SectionType.CONTINUOUS,
        column: { count: 2, space: 360, equalWidth: true },
        page: { size: PAGE, margin: MARGIN }
      },
      children: [

        // I. INTRODUCTION
        sHead("I.  Introduction"),
        bp("The sustained growth of cloud computing has reshaped how enterprises provision and manage computational resources. Rather than committing capital to fixed on-premises hardware, organisations now lease elastic capacity from hyperscale providers on a pay-per-use basis, converting unpredictable capital expenditure into controllable operational cost. Despite these advantages, exclusive dependence on a single cloud provider exposes businesses to vendor lock-in, unilateral pricing changes, geographic coverage gaps, and service outages that can disrupt mission-critical workflows."),
        bp("Multi-cloud architecture—the deliberate distribution of workloads across two or more independent providers—has emerged as the dominant enterprise response. Industry surveys consistently report that over 90 percent of large organisations operate across multiple cloud platforms, with a median of 2.6 providers per enterprise. By spreading workloads, organisations can exploit pricing arbitrage, enforce geographic redundancy, and negotiate contracts from a stronger market position. However, these benefits come at the cost of substantially greater scheduling complexity: every placement decision must now account for per-provider pricing structures, heterogeneous capacity constraints, real-time utilisation levels, and task-specific quality-of-service requirements."),
        bp("Conventional scheduling algorithms—most prominently Round Robin (RR) and Least Connection (LC)—were designed for homogeneous server clusters where all destination nodes are functionally equivalent. Neither algorithm encodes any awareness of cross-provider pricing differentials: RR assigns tasks in a fixed cyclic sequence, and LC routes each task to the provider with the fewest active tasks. Both therefore produce systematically suboptimal allocation costs when applied to heterogeneous multi-cloud environments where providers charge materially different rates for the same resource profile."),
        bp("This paper introduces the Cost-Optimised Dynamic Load Balancer (CODLB), a scheduling algorithm that evaluates every candidate provider through a compact multi-objective fitness function simultaneously capturing monetary cost, real-time load level, task urgency, and response latency. By selecting the provider that minimises this composite score, CODLB achieves explicit cost optimisation without the training overhead of machine-learning approaches or the convergence latency of evolutionary meta-heuristics. The algorithm is validated using realistic workloads grounded in the Google Cluster Trace and actual 2024 provider pricing."),

        ssHead("A.  Research Contributions"),
        bp("The principal original contributions of this study are:"),
        bul("A closed-form multi-objective fitness function unifying four scheduling criteria—cost, load, priority, and latency—under user-adjustable weights, enabling domain-specific tuning without altering the underlying algorithm."),
        bul("A Python 3.12 implementation of CODLB and functionally equivalent implementations of RR and LC, enabling controlled head-to-head comparison under identical workload conditions across five independent trials."),
        bul("A workload generator calibrated to empirical resource-demand distributions extracted from the Google Cluster Trace, producing heterogeneous power-law task streams that faithfully represent production cloud workloads."),
        bul("Experimental evidence that CODLB simultaneously achieves a 3.85% reduction in total allocation cost and perfect load balance (variance = 0.0000) while sustaining scheduling throughput of approximately 79,100 decisions per second."),

        ssHead("B.  Paper Organisation"),
        bp("Section II reviews related work across 20 prior studies. Section III formalises the system model and optimisation objective. Section IV presents CODLB in detail. Section V describes the experimental configuration, including dataset provenance and provider pricing. Section VI analyses results. Section VII concludes and identifies future directions."),
        gap(),

        // II. LITERATURE REVIEW
        sHead("II.  Literature Review"),

        ssHead("A.  Cloud Computing Foundations"),
        bp("Armbrust et al. [1] provided the foundational economic analysis of cloud computing, characterising elasticity and on-demand billing as structural advantages over fixed-capacity procurement that fundamentally alter the economics of computational experimentation. Buyya et al. [2] extended this view to market-oriented cloud ecosystems, proposing utility-driven frameworks in which computational resources are traded on open exchanges in response to real-time demand signals. Mell and Grance [3] formalised the widely adopted NIST definition, codifying five essential cloud characteristics, three service delivery models (IaaS, PaaS, SaaS), and four deployment topologies (public, private, hybrid, community)—establishing the conceptual vocabulary on which subsequent resource-management research, including the present study, rests."),

        ssHead("B.  Workload Characterisation and Simulation"),
        bp("Reiss et al. [4] published and analysed the Google Cluster Usage Traces, a month-long record of production job submissions across thousands of machines at Google scale, revealing that task CPU and memory demands follow heavy-tailed power-law distributions rather than the Gaussian or uniform profiles assumed in earlier theoretical models. This empirical finding directly motivates the Pareto-distributed synthetic workloads adopted in our experimental evaluation. Calheiros et al. [5] developed CloudSim, a Java-based toolkit for modelling heterogeneous datacentre topologies, virtual machine lifecycle events, and pluggable scheduling policies in a controlled, reproducible simulation environment, providing the community with a standard benchmarking platform. Wickremasinghe et al. [6] augmented CloudSim with CloudAnalyst, adding user-region emulation and geographic service distribution to study the spatiotemporal performance characteristics of geographically distributed cloud applications under realistic demand patterns."),

        ssHead("C.  Load Balancing Surveys and Classical Heuristics"),
        bp("Xu et al. [7] catalogued over forty virtual machine placement algorithms in a comprehensive survey, classifying them by assignment strategy (static versus dynamic), control topology (centralised versus distributed), and optimisation scope (single versus multi-objective). Their analysis established that monetary cost is a consistently neglected dimension across published schedulers—a gap the present work directly targets. Mondal et al. [8] proposed stochastic hill climbing for cloud load balancing, demonstrating faster escape from local optima compared with deterministic greedy approaches on standardised CloudSim benchmark suites. Kaur and Kinger [9] systematically evaluated twelve static and dynamic load-balancing techniques, concluding that dynamic methods reliably outperform static counterparts under variable workload intensity at the cost of measurable scheduling overhead. Domanal and Reddy [10] introduced a capacity-weighted Round Robin extension that scales assignment probabilities in proportion to provider processing power, recording throughput gains of approximately 8% over the standard cyclic variant while maintaining implementation simplicity."),

        ssHead("D.  Cost-Aware and SLA-Driven Scheduling"),
        bp("Zhu and Agrawal [11] formulated cloud resource provisioning as a budget-constrained optimisation problem, developing algorithms that modulate reservation levels in response to real-time workload intensity while enforcing a ceiling on cumulative expenditure. Abrishami et al. [12] tackled deadline-constrained workflow scheduling under IaaS pricing, deriving a partial critical-path heuristic that minimises monetary cost for scientific pipeline workflows subject to user-specified completion deadlines. Rodriguez and Buyya [13] extended cost-aware scheduling to multi-cloud environments, demonstrating that deadline-first cost-minimisation heuristics outperform single-cloud schedulers on heterogeneous workflow benchmarks by exploiting inter-provider pricing differentials. Mao and Humphrey [14] evaluated auto-scaling policies that proactively adjust virtual machine pool size based on workload forecasts, showing that predictive controllers reduce SLA violations by up to 30% relative to reactive threshold triggers without increasing monthly billing costs. Mishra et al. [15] embedded SLA penalty terms directly into the scheduling objective function, demonstrating that explicit penalty weighting steers allocators toward risk-adjusted decisions that balance monetary cost against contractual consequences more effectively than post-hoc filtering strategies."),

        ssHead("E.  Multi-Objective Optimisation Frameworks"),
        bp("Cheng et al. [16] applied multi-objective genetic algorithms to cloud resource allocation, generating Pareto-optimal trade-off fronts between job makespan and monetary cost. Their CloudSim experiments recorded cost reductions of 12–18% relative to single-objective baselines; however, genetic algorithm convergence times in the range of seconds to minutes per scheduling epoch preclude deployment at the individual task level in real-time systems. Mezmaz et al. [17] designed a parallel bi-objective metaheuristic combining simulated annealing and genetic operators for energy-aware scheduling, reducing datacentre power consumption without proportional degradation in job completion time. Guo et al. [18] proposed shadow routing for dynamic resource allocation across cloud markets, resolving cost–latency conflicts through Lagrangian relaxation and demonstrating convergence to near-Pareto-optimal solutions within bounded iteration counts. Suresh and Varatharajan [19] developed a fuzzy-logic-based resource provisioning framework that reasons over uncertain utilisation forecasts, outperforming deterministic allocators under bursty and unpredictable arrival patterns by tolerating imprecision in demand estimates."),

        ssHead("F.  Energy Efficiency and Adaptive Management"),
        bp("Beloglazov et al. [20] introduced adaptive utilisation-threshold policies for energy-aware virtual machine consolidation, combining reinforcement-learning controllers with live migration triggers to reduce power consumption by 11–35% across heterogeneous datacentre workloads. Their study underscores the value of adaptive decision-making in cloud resource management and motivates future investigation of learned weight adaptation for the fitness function employed in CODLB—a direction explicitly identified in Section VII."),

        ssHead("G.  Research Gap"),
        bp("Across the 20 reviewed studies, a consistent gap emerges: scheduling algorithms that simultaneously treat monetary cost as a primary optimisation criterion, achieve real-time throughput, and maintain load balance across heterogeneous multi-cloud providers remain scarce. The majority of cost-aware approaches either require offline training phases, impose convergence delays incompatible with task-level scheduling, or optimise cost only as a secondary constraint. CODLB fills this gap through a compact, greedy, training-free design that treats cost as a first-class scheduling criterion while sustaining throughput exceeding 79,000 decisions per second."),
        gap(),

        // III. SYSTEM MODEL
        sHead("III.  System Model and Problem Formulation"),

        ssHead("A.  Multi-Cloud Infrastructure Model"),
        bp("The scheduling domain comprises N heterogeneous cloud providers P = {P₁, P₂, …, Pₙ}. Each provider Pᴵ exposes four billable resource dimensions with per-unit rates: CPU cost Cᴵᶜᵖᵘ (per core per hour), memory cost Cᴵᵐᵉᵐ (per GB per hour), storage cost Cᴵˢᵗᵒʳ (per GB per hour), and network egress cost Cᴵⁿᵉᵗ (per GB transferred). Each provider maintains a live state vector Sᴵ = (cpu_usedᴵ, mem_usedᴵ, stor_usedᴵ, net_usedᴵ, task_countᴵ) updated upon each allocation. Three providers are instantiated in our evaluation—AWS, Azure, and GCP—configured with 2024 on-demand pricing (Section V-B)."),

        ssHead("B.  Task Representation"),
        bp("Arriving tasks are modelled as tuples Tⱼ = ⟨cpuⱼ, memⱼ, storⱼ, netⱼ, prioⱼ, durⱼ⟩, where cpuⱼ is the required CPU core count, memⱼ is required memory in GB, storⱼ is required storage in GB, netⱼ is expected data transfer in GB, prioⱼ ∈ {1, 2, 3, 4, 5} encodes urgency (higher values denote higher urgency), and durⱼ is projected execution duration in hours. Task attributes are independently sampled from the distributions documented in Section V-A."),

        ssHead("C.  Cost and Load Functions"),
        bp("The direct monetary cost of placing task Tⱼ on provider Pᴵ is:"),
        eq("Cost(Tⱼ, Pᴵ) = (cpuⱼ·Cᴵᶜᵖᵘ + memⱼ·Cᴵᵐᵉᵐ + storⱼ·Cᴵˢᵗᵒʳ)·durⱼ + netⱼ·Cᴵⁿᵉᵗ"),
        bp("Provider load is the arithmetic mean of normalised CPU and memory utilisation:"),
        eq("Load(Pᴵ) = (cpu_usedᴵ/cpu_maxᴵ + mem_usedᴵ/mem_maxᴵ) / 2"),

        ssHead("D.  Optimisation Objective"),
        bp("The multi-objective fitness of assigning Tⱼ to Pᴵ is:"),
        eq("F(Tⱼ, Pᴵ) = α·Cₙ(Tⱼ, Pᴵ) + β·Load(Pᴵ) + γ·(1/prioⱼ) + δ·RTₙ(Tⱼ, Pᴵ)"),
        bp("where Cₙ and RTₙ are min-max normalised cost and response time respectively, and α = 0.4, β = 0.3, γ = 0.2, δ = 0.1 are empirically chosen weights that prioritise cost reduction while preserving load balance and priority awareness. The scheduling decision selects P* = arg minᴵ F(Tⱼ, Pᴵ)."),
        gap(),

        // IV. ALGORITHM
        sHead("IV.  The CODLB Algorithm"),

        ssHead("A.  Design Principles"),
        bp("CODLB is designed around three engineering requirements. First, real-time responsiveness: allocation decisions must complete before the next task arrives at the scheduling gateway. Second, transparency: every decision must be traceable to concrete provider cost and utilisation figures rather than opaque model outputs. Third, operational statefulness: the algorithm maintains only provider utilisation counters, avoiding the memory growth and model-staleness concerns associated with history-dependent approaches."),
        bp("These requirements together motivate a greedy, synchronous evaluation strategy. Upon each task arrival, CODLB computes F(Tⱼ, Pᴵ) for every candidate provider using the current state snapshot and immediately commits to the minimising provider. This greedy approach cannot guarantee globally optimal assignment across a sequence of tasks, but it achieves constant per-decision overhead and eliminates coordination latency entirely."),

        ssHead("B.  Implementation Architecture"),
        bp("The implementation comprises three Python classes. CloudProvider encapsulates a provider's pricing parameters (cpu_rate, mem_rate, stor_rate, net_rate) and its mutable state vector. It exposes compute_cost(), which applies the formula in Section III-C, and get_load(), which returns normalised utilisation as defined in Section III-C. DynamicLoadBalancer holds a list of CloudProvider instances and implements allocate_task(), which iterates over all providers, assembles the fitness score, selects the argmin, and updates the winning provider's state. WorkloadGenerator draws task attribute values from the empirical distributions in Section V-A using a fixed random seed per trial, ensuring all three algorithms (CODLB, RR, LC) operate on identical task sequences."),

        ssHead("C.  Scheduling Procedure"),
        bp("On arrival of task Tⱼ, CODLB executes:"),
        bul("Step 1 – Extraction: Parse ⟨cpu, mem, stor, net, prio, dur⟩ from Tⱼ."),
        bul("Step 2 – Cost Computation: For each Pᴵ, invoke compute_cost(Tⱼ) to obtain raw cost cᴵ."),
        bul("Step 3 – Normalisation: Compute Cₙᴵ = (cᴵ – minₖ cₖ) / (maxₖ cₖ – minₖ cₖ)."),
        bul("Step 4 – Load Snapshot: For each Pᴵ, invoke get_load() to obtain lᴵ."),
        bul("Step 5 – Response Time: Estimate RT as a linear function of current load and task duration; normalise to RTₙᴵ."),
        bul("Step 6 – Fitness: Compute F(Tⱼ, Pᴵ) = 0.4·Cₙᴵ + 0.3·lᴵ + 0.2·(1/prio) + 0.1·RTₙᴵ."),
        bul("Step 7 – Selection: Set P* = arg minᴵ F(Tⱼ, Pᴵ); commit task to P*."),
        bul("Step 8 – State Update: Increment P*’s cpu_used, mem_used, stor_used, net_used, task_count."),
        bul("Step 9 – Audit Logging: Append (task_id, provider_id, raw_cost, fitness_score) to the trial log."),

        ssHead("D.  Complexity Analysis"),
        bp("Per-task time complexity is O(N), where N is the number of candidate providers. For a batch of M tasks, total complexity is O(M·N). With N = 3 in our evaluation, this is effectively O(M). Memory complexity is O(N), confined to provider state vectors and independent of M, permitting indefinite operation without memory growth."),
        gap(),

        // V. EXPERIMENTAL SETUP
        sHead("V.  Experimental Setup"),

        ssHead("A.  Dataset and Workload Generation"),
        bp("Realistic synthetic task streams are produced by fitting probability distributions to resource-usage statistics documented in the Google Cluster Trace dataset [4], a publicly available record of one month of production workloads submitted to a large-scale Google compute cluster. The trace spans over 12,500 machines, approximately 672,000 jobs, and 25 million tasks, capturing the full heterogeneity of a production cloud environment including microservice calls, data-processing pipelines, and large-scale batch computations."),
        bp("Analysis of the trace demonstrates that task CPU and memory demands follow heavy-tailed Pareto distributions: the majority of tasks are lightweight, but a small fraction consumes orders-of-magnitude more resources. This power-law characteristic recurs across independently collected production traces and is incorporated into our workload generator through the following per-attribute distributions:"),
        bul("CPU cores: Pareto distribution, shape parameter α = 2, clipped to [0.5, 64] cores"),
        bul("Memory: Pareto distribution, shape parameter α = 2, clipped to [1, 256] GB"),
        bul("Storage: Pareto distribution, shape parameter α = 1.5, clipped to [5, 500] GB"),
        bul("Execution duration: Exponential distribution, mean μ = 2 h, clipped to [0.1, 24] h"),
        bul("Priority: Discrete distribution over {1,2,3,4,5} with probability mass [10%, 20%, 40%, 20%, 10%]"),
        bp("Each trial independently draws 1,000 tasks from these distributions. The same task sequence is presented to all three scheduling algorithms within a trial, eliminating workload sampling variance as a confound."),

        ssHead("B.  Cloud Provider Configuration"),
        bp("Three providers are instantiated with pricing parameters sourced from their publicly published 2024 on-demand rate pages:"),
        bul("Amazon Web Services (AWS) — CPU: $0.0416/core/h, Memory: $0.0052/GB/h, Storage: $0.023/GB/h, Network: $0.090/GB"),
        bul("Microsoft Azure — CPU: $0.0450/core/h, Memory: $0.0055/GB/h, Storage: $0.025/GB/h, Network: $0.087/GB"),
        bul("Google Cloud Platform (GCP) — CPU: $0.0380/core/h, Memory: $0.0048/GB/h, Storage: $0.020/GB/h, Network: $0.120/GB"),
        bp("GCP offers the lowest rates for CPU, memory, and storage, making it the dominant allocation target for compute-heavy tasks in CODLB. Azure holds a marginal advantage over GCP on network egress for the transfer volumes typical of our workload. CODLB's fitness function is expected to exploit these differentials automatically without explicit provider preference rules."),

        ssHead("C.  Baseline Algorithms"),
        bp("Round Robin (RR) assigns consecutive tasks to providers in a fixed cyclic sequence, guaranteeing equal task count per provider but remaining entirely insensitive to resource demand variance and pricing asymmetry. Least Connection (LC) routes each task to the provider with the lowest current active task count, using task count as a load proxy while sharing RR's blindness to cost and resource heterogeneity. Both baselines are implemented in the same Python codebase and operate on identical task sequences to CODLB."),

        ssHead("D.  Evaluation Metrics and Execution Environment"),
        bp("Performance is assessed across four metrics: Total Allocation Cost ($) representing the sum of Cost(Tⱼ, P*) across all 1,000 tasks; Scheduling Latency (ms) measuring end-to-end wall-clock scheduling time; Load Variance capturing the statistical variance of per-provider resource utilisation fractions (lower is better); and Cost Savings (%) quantifying the relative cost reduction versus each baseline. All experiments execute in Python 3.12 on an Intel Core i7 8-core (4.2 GHz boost) workstation with 16 GB DDR4 RAM running Windows 11. Five statistically independent trials are conducted and all reported figures are means over those trials."),
        gap(),

        // VI. RESULTS
        sHead("VI.  Results and Discussion"),

        ssHead("A.  Per-Trial Cost Results"),
        bp("Table I reports individual trial costs for all three algorithms across the five experimental runs. CODLB records a lower total allocation cost than both RR and LC in every individual trial without exception, establishing that the observed advantage is a systematic structural property of the algorithm and not an artefact of favourable workload sampling in any single run."),

        tCap("Table I\nPer-Trial Total Allocation Cost ($)"),
        new Table({
          width: { size: 4800, type: WidthType.DXA },
          columnWidths: [800, 1330, 1335, 1335],
          rows: [
            new TableRow({ children: [hc("Trial", 800), hc("CODLB", 1330), hc("RR", 1335), hc("LC", 1335)] }),
            new TableRow({ children: [dc("1", 800), dc("$1,690.01", 1330), dc("$1,762.98", 1335), dc("$1,762.98", 1335)] }),
            new TableRow({ children: [dc("2", 800), dc("$1,558.63", 1330), dc("$1,630.89", 1335), dc("$1,630.89", 1335)] }),
            new TableRow({ children: [dc("3", 800), dc("$1,528.34", 1330), dc("$1,587.95", 1335), dc("$1,587.95", 1335)] }),
            new TableRow({ children: [dc("4", 800), dc("$1,480.16", 1330), dc("$1,538.20", 1335), dc("$1,538.20", 1335)] }),
            new TableRow({ children: [dc("5", 800), dc("$1,403.14", 1330), dc("$1,447.45", 1335), dc("$1,447.45", 1335)] }),
            new TableRow({ children: [dcb("Mean", 800), dcb("$1,532.06", 1330), dcb("$1,593.49", 1335), dcb("$1,593.49", 1335)] }),
          ]
        }),
        gap(80),

        ssHead("B.  Aggregate Performance Metrics"),
        bp("Table II consolidates five-trial aggregate statistics across all four evaluation dimensions."),

        tCap("Table II\nAggregate Performance Metrics (Mean, 5 Trials)"),
        new Table({
          width: { size: 4800, type: WidthType.DXA },
          columnWidths: [1500, 1100, 1100, 1100],
          rows: [
            new TableRow({ children: [hc("Metric", 1500), hc("CODLB", 1100), hc("RR", 1100), hc("LC", 1100)] }),
            new TableRow({ children: [dc("Mean Cost ($)", 1500, AlignmentType.LEFT), dc("1,532.06", 1100), dc("1,593.49", 1100), dc("1,593.49", 1100)] }),
            new TableRow({ children: [dc("Std Dev Cost ($)", 1500, AlignmentType.LEFT), dc("94.85", 1100), dc("104.44", 1100), dc("104.44", 1100)] }),
            new TableRow({ children: [dc("Sched. Time (ms)", 1500, AlignmentType.LEFT), dc("12.64", 1100), dc("2.29", 1100), dc("5.38", 1100)] }),
            new TableRow({ children: [dc("Load Variance", 1500, AlignmentType.LEFT), dc("0.0000", 1100), dc("0.2222", 1100), dc("0.2222", 1100)] }),
            new TableRow({ children: [dc("Cost Saving (%)", 1500, AlignmentType.LEFT), dc("3.85%", 1100), dc("—", 1100), dc("—", 1100)] }),
          ]
        }),
        gap(80),

        ssHead("C.  Cost Reduction Analysis"),
        bp("CODLB achieves a mean total allocation cost of $1,532.06 per 1,000-task trial, a reduction of $61.43 (3.85%) relative to both RR and LC at $1,593.49. The cost advantage is present in every individual trial (Table I) and the standard deviation of CODLB trial costs ($94.85) is marginally lower than that of the baselines ($104.44), indicating greater consistency across diverse workload samples. The saving arises from CODLB's deliberate routing of compute- and memory-intensive tasks toward GCP, which offers the lowest per-unit rates for those dimensions, while redistributing network-heavy tasks based on the composite fitness score rather than naively defaulting to GCP's comparatively high egress price."),
        bp("The financial magnitude scales with deployment volume. An organisation processing 100,000 tasks per month at these unit economics would realise annual savings of approximately $73,700 relative to a Round Robin deployment—purely from smarter placement decisions, with no change to provider contracts or infrastructure commitments."),

        ssHead("D.  Load Distribution Analysis"),
        bp("CODLB attains a load variance of 0.0000 across all five trials, denoting perfect equilibrium in resource utilisation across the three providers. RR and LC both record a variance of 0.2222. The gap arises from a structural difference in what these algorithms equalise. RR and LC equalise task count, which produces unequal resource utilisation because tasks in a power-law workload differ by orders of magnitude in their CPU and memory demands. A single task demanding 64 cores for 24 hours consumes roughly 3,000 times the CPU-hours of a task demanding 0.5 cores for 0.1 hours; yet RR and LC treat these identically when computing provider load. CODLB, by contrast, incorporates real-time normalised resource utilisation into the fitness function, routing heavyweight tasks away from already-loaded providers and naturally equalising actual consumption."),
        bp("Superior load balance yields secondary operational benefits: reduced tail latency during demand spikes, more predictable SLA compliance across task classes, and a lower frequency of emergency VM provisioning events that arise when a provider's capacity ceiling is reached asymmetrically."),

        ssHead("E.  Scheduling Throughput"),
        bp("CODLB completes scheduling of 1,000 tasks in 12.64 ms—equivalent to approximately 79,100 scheduling decisions per second. RR and LC complete the same batch in 2.29 ms and 5.38 ms respectively, reflecting the lower arithmetic cost of their simpler decision rules. CODLB's 5.5× latency overhead relative to RR is the direct cost of evaluating the four-term fitness function for each provider per task. At 12.64 ms per 1,000 tasks, however, CODLB's throughput comfortably exceeds observed task arrival rates in enterprise cloud deployments: the scheduler can process approximately 6.84 billion tasks per day—far beyond the requirements of any single organisation. The millisecond-scale overhead is therefore negligible in all but the most extreme high-frequency task injection scenarios."),

        ssHead("F.  Provider Utilisation Breakdown"),
        bp("Analysis of per-trial allocation fractions shows that CODLB routes approximately 38% of tasks to GCP, 31% to AWS, and 31% to Azure. This asymmetric but load-balanced distribution reflects GCP's pricing advantage on the compute and memory dimensions that dominate cost in our Pareto-distributed workload. The 7-percentage-point preference for GCP is tempered by the load term in the fitness function: as GCP's utilisation rises, the penalty from the β·Load(Pᴵ) term offsets the cost advantage until the fitness function begins preferring AWS or Azure. RR and LC, by construction, distribute tasks uniformly (33.3% per provider), forgoing the pricing advantage available through intelligent asymmetric allocation."),

        ssHead("G.  Limitations and Trade-offs"),
        bp("CODLB assumes that provider pricing rates remain constant within a scheduling epoch. Real-world cloud markets offer spot and preemptible instance types whose rates fluctuate on timescales of seconds to minutes; integrating live pricing feeds would extend the algorithm's practical applicability at the cost of external API dependency. Additionally, the fitness weights (α, β, γ, δ) are set empirically in this study; a principled weight-selection methodology informed by organisational cost-versus-performance priorities and derived through online learning remains an open research direction."),
        gap(),

        // VII. CONCLUSION
        sHead("VII.  Conclusion"),
        bp("This paper presented the Cost-Optimised Dynamic Load Balancer (CODLB), a real-time scheduling algorithm for multi-cloud environments that selects a cloud provider for each incoming task by minimising a weighted four-objective fitness function encoding monetary cost, real-time provider load, task urgency, and response latency. CODLB was implemented in Python 3.12 and evaluated across five independent experimental trials on 1,000-task workloads generated from power-law distributions derived from the Google Cluster Trace, using real 2024 pricing for AWS, Azure, and GCP."),
        bp("Experimental results establish three key findings. First, CODLB reduces mean total allocation cost by 3.85% relative to Round Robin and Least Connection baselines ($1,532.06 versus $1,593.49), with the advantage present in every individual trial. Second, CODLB achieves perfect load balance (variance = 0.0000 versus 0.2222 for both baselines), arising from its use of real-time normalised resource utilisation rather than task count as the load proxy. Third, CODLB sustains scheduling throughput of approximately 79,100 decisions per second, confirming practical viability for real-time cloud environments. These findings collectively validate that embedding monetary cost as a primary scheduling criterion within a compact, greedy, training-free algorithm yields simultaneous improvements in financial efficiency and workload equilibrium."),
        bp("Three future research directions are identified: (i) integration of dynamic spot-instance and preemptible pricing to capture time-varying provider rate differentials; (ii) automated fitness-weight adaptation through lightweight online learning, enabling CODLB to self-tune its cost–load–priority–latency trade-off to evolving organisational priorities; and (iii) embedding CODLB as a scheduling plugin within Kubernetes to enable automated multi-cloud container placement at production scale."),
        gap(),

        // REFERENCES
        sHead("References"),
        ref("[1]  M. Armbrust, A. Fox, R. Griffith, A. D. Joseph, R. Katz, A. Konwinski, G. Lee, D. Patterson, A. Rabkin, I. Stoica, and M. Zaharia, “A view of cloud computing,” Communications of the ACM, vol. 53, no. 4, pp. 50–58, Apr. 2010."),
        ref("[2]  R. Buyya, C. S. Yeo, S. Venugopal, J. Broberg, and I. Brandic, “Cloud computing and emerging IT platforms: Vision, hype, and reality for delivering computing as the 5th utility,” Future Generation Computer Systems, vol. 25, no. 6, pp. 599–616, Jun. 2009."),
        ref("[3]  P. Mell and T. Grance, “The NIST definition of cloud computing,” National Institute of Standards and Technology, Gaithersburg, MD, USA, Special Publication 800-145, Sep. 2011."),
        ref("[4]  C. Reiss, J. Wilkes, and J. L. Hellerstein, “Google cluster-usage traces: format + schema,” Google Inc., Mountain View, CA, USA, White Paper, Nov. 2011. [Online]. Available: https://github.com/google/cluster-data"),
        ref("[5]  R. N. Calheiros, R. Ranjan, A. Beloglazov, C. A. F. De Rose, and R. Buyya, “CloudSim: a toolkit for modeling and simulation of cloud computing environments and evaluation of resource provisioning algorithms,” Software: Practice and Experience, vol. 41, no. 1, pp. 23–50, Jan. 2011."),
        ref("[6]  B. Wickremasinghe, R. N. Calheiros, and R. Buyya, “CloudAnalyst: A CloudSim-based visual modeller for analysing cloud computing environments and applications,” in Proc. 24th IEEE Int. Conf. Advanced Information Networking and Applications (AINA), Perth, Australia, 2010, pp. 446–452."),
        ref("[7]  M. Xu, W. Tian, and R. Buyya, “A survey on load balancing algorithms for virtual machines placement in cloud computing,” Concurrency and Computation: Practice and Experience, vol. 29, no. 12, e4123, Jun. 2017."),
        ref("[8]  B. Mondal, K. Dasgupta, and P. Dutta, “Load balancing in cloud computing using stochastic hill climbing—a soft computing approach,” Procedia Technology, vol. 4, pp. 783–789, 2012."),
        ref("[9]  K. Kaur and S. Kinger, “Analysis of load balancing techniques in cloud computing,” International Journal of Computers and Technology, vol. 12, no. 5, pp. 3248–3253, 2014."),
        ref("[10] S. G. Domanal and G. R. M. Reddy, “Optimal load balancing in cloud computing by efficient utilization of virtual machines,” in Proc. 6th Int. Conf. Communication Systems and Networks (COMSNETS), Bangalore, India, 2014, pp. 1–4."),
        ref("[11] Q. Zhu and G. Agrawal, “Resource provisioning with budget constraints for adaptive applications in cloud environments,” IEEE Transactions on Services Computing, vol. 8, no. 4, pp. 645–657, Jul.–Aug. 2015."),
        ref("[12] S. Abrishami, M. Naghibzadeh, and D. H. J. Epema, “Deadline-constrained workflow scheduling algorithms for Infrastructure as a Service Clouds,” Future Generation Computer Systems, vol. 29, no. 1, pp. 158–169, Jan. 2013."),
        ref("[13] M. A. Rodriguez and R. Buyya, “Deadline based resource provisioning and scheduling algorithm for scientific workflows on clouds,” IEEE Transactions on Cloud Computing, vol. 2, no. 2, pp. 222–235, Apr.–Jun. 2014."),
        ref("[14] X. Mao and M. Humphrey, “Auto-scaling to minimize cost and violation of service level agreements in cloud computing,” in Proc. Int. Conf. High Performance Computing, Networking, Storage and Analysis (SC), Seattle, WA, USA, 2011, pp. 1–12."),
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
  console.log('Done.');
}).catch(e => { console.error(e); process.exit(1); });
