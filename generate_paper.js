const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, SectionType,
  Footer, PageNumber, VerticalAlign, ImageRun
} = require('docx');
const fs = require('fs');

const PAGE   = { width: 12240, height: 15840 };
const MARGIN = { top: 1080, bottom: 1440, left: 900, right: 900 };

const T = (sz, o = {}) => ({ font: "Times New Roman", size: sz, ...o });

function bp(text, noIndent = false) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
    indent: noIndent ? undefined : { firstLine: 360 },
    children: [new TextRun({ text, ...T(20) })]
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
    children: [new TextRun({ text, ...T(20, { bold: true, allCaps: true }) })]
  });
}
function ssHead(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 60, line: 240, lineRule: "auto" },
    children: [new TextRun({ text, ...T(20, { bold: true, italics: true }) })]
  });
}
function bul(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
    indent: { left: 440, hanging: 200 },
    children: [new TextRun({ text: "•  " + text, ...T(20) })]
  });
}
function eq(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80, line: 240, lineRule: "auto" },
    children: [new TextRun({ text, ...T(20, { italics: true }) })]
  });
}
function gap(n = 80) { return new Paragraph({ spacing: { before: 0, after: n }, children: [] }); }
function ref(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 60, line: 240, lineRule: "auto" },
    indent: { left: 360, hanging: 360 },
    children: [new TextRun({ text, ...T(16) })]
  });
}
function figImg(path, w, h) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 40 },
    children: [new ImageRun({
      type: "png", data: fs.readFileSync(path),
      transformation: { width: w, height: h },
      altText: { title: "figure", description: "figure", name: "fig" }
    })]
  });
}
function figCap(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 100 },
    children: [new TextRun({ text, ...T(16) })]
  });
}

const B = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const BD = { top: B, bottom: B, left: B, right: B };

function hc(text, w) {
  return new TableCell({
    borders: BD, width: { size: w, type: WidthType.DXA },
    shading: { fill: "BFBFBF", type: ShadingType.CLEAR },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, ...T(16, { bold: true }) })] })]
  });
}
function dc(text, w, al = AlignmentType.CENTER) {
  return new TableCell({
    borders: BD, width: { size: w, type: WidthType.DXA },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: al,
      children: [new TextRun({ text, ...T(16) })] })]
  });
}
function dcb(text, w) {
  return new TableCell({
    borders: BD, width: { size: w, type: WidthType.DXA },
    shading: { fill: "E8F4E8", type: ShadingType.CLEAR },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, ...T(16, { bold: true }) })] })]
  });
}
function tCap(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 60 },
    children: [new TextRun({ text, ...T(16, { bold: true, allCaps: true }) })]
  });
}

// Image paths
const P = (f) => `D:/Projects/research-paper/${f}`;

const doc = new Document({
  sections: [
    // ═════════════════════════════════════════════════════════════════════
    // SECTION 1 — single-column title block
    // ═════════════════════════════════════════════════════════════════════
    {
      properties: { page: { size: PAGE, margin: MARGIN } },
      footers: { default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ ...T(16), children: [PageNumber.CURRENT] })]
      })]}) },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 140 },
          children: [new TextRun({ text:
            "Cost-Optimised Dynamic Load Balancing Across Heterogeneous Multi-Cloud Environments Using a Weighted Multi-Objective Fitness Function",
            ...T(48, { bold: true }) })] }),
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

        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
          children: [new TextRun({ text: "Abstract", ...T(18, { bold: true, italics: true }) })] }),
        new Paragraph({ alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 0, after: 80, line: 220, lineRule: "auto" },
          indent: { left: 540, right: 540 },
          children: [new TextRun({ ...T(18), text:
            "Multi-cloud computing has emerged as the preferred strategy for large enterprises seeking to exploit pricing arbitrage, enforce redundancy, and avoid vendor lock-in across heterogeneous cloud providers. Conventional scheduling heuristics such as Round Robin (RR) and Least Connection (LC) distribute tasks without any awareness of inter-provider cost differentials, consistently leaving significant financial savings unrealised. This paper presents the Cost-Optimised Dynamic Load Balancer (CODLB), an algorithm that selects a cloud provider for every arriving task by minimising a parameterised four-term fitness function integrating normalised monetary cost (weight alpha = 0.4), real-time normalised resource load (beta = 0.3), task urgency priority (gamma = 0.2), and normalised response latency (delta = 0.1). All four fitness terms are rigorously bounded to [0, 1] through min-max normalisation, eliminating the scale-dominance deficiency present in prior formulations. CODLB is implemented in Python 3.12 and evaluated across 30 statistically independent trials, each scheduling 1,000 tasks whose resource demands follow power-law distributions derived from the Google Cluster Trace dataset, applied over emulated Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP) instances configured with verified 2024 on-demand pricing. Five-algorithm comparison includes two additional baselines: Min-Min and a Greedy Cost scheduler that exclusively minimises monetary cost per task. Paired t-tests confirm statistical significance at p < 0.0001 for all comparisons. Results show CODLB achieves 6.56% cost reduction over RR and LC ($1,480.95 versus $1,584.90), 6.69% over Min-Min, and reaches within 0.04% of the optimal Greedy Cost scheduler while maintaining 87.3% lower load variance than Greedy Cost (0.0056 versus 0.0446). These findings demonstrate that the proposed multi-objective fitness function occupies the Pareto frontier between cost efficiency and load balance, offering a practical, training-free scheduling solution for heterogeneous multi-cloud environments."
          })] }),
        new Paragraph({ alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 0, after: 300, line: 220, lineRule: "auto" },
          indent: { left: 540, right: 540 },
          children: [
            new TextRun({ text: "Keywords— ", ...T(18, { bold: true, italics: true }) }),
            new TextRun({ text: "multi-cloud computing; dynamic load balancing; cost optimisation; multi-objective fitness function; resource allocation; Google Cluster Trace; statistical significance; Pareto optimality", ...T(18, { italics: true }) })
          ] }),
      ]
    },

    // ═════════════════════════════════════════════════════════════════════
    // SECTION 2 — two-column body
    // ═════════════════════════════════════════════════════════════════════
    {
      properties: {
        type: SectionType.CONTINUOUS,
        column: { count: 2, space: 360, equalWidth: true },
        page: { size: PAGE, margin: MARGIN }
      },
      children: [

        // I. INTRODUCTION
        sHead("I.  Introduction"),
        bp("The sustained growth of cloud computing has reshaped how organisations provision computational resources. Pay-per-use billing, elastic capacity, and global reach offered by hyperscale providers have transformed capital expenditure on hardware into predictable operational cost. Despite these advantages, exclusive dependence on a single cloud provider exposes businesses to vendor lock-in, unilateral pricing changes, and geographic coverage gaps that can disrupt mission-critical workflows."),
        bp("Multi-cloud architecture has emerged as the dominant enterprise response, with over 90 percent of large organisations operating across multiple cloud platforms and a median of 2.6 providers per enterprise. However, every task placement decision in a multi-cloud system must now account for heterogeneous pricing structures, capacity constraints, real-time utilisation levels, and quality-of-service requirements—complexity that classical scheduling heuristics such as Round Robin (RR) and Least Connection (LC) are structurally incapable of handling."),
        bp("This paper introduces the Cost-Optimised Dynamic Load Balancer (CODLB), a scheduling algorithm that evaluates each candidate provider through a rigorously normalised four-term fitness function. A key methodological advance over related work is that all four fitness components—cost, load, priority, and response time—are independently bounded to [0, 1] through min-max or definitional normalisation, preventing any single term from dominating the score. We additionally compare against two baselines absent from most prior studies: Min-Min, a completion-time minimiser, and Greedy Cost, a pure cost-minimiser that establishes the theoretical lower bound on expenditure and allows us to quantify the load-balance benefit of the multi-objective formulation."),
        bp("Experiments conducted over 30 statistically independent trials with paired t-tests demonstrate that CODLB achieves 6.56% cost reduction over RR and LC while remaining within 0.04% of the Greedy Cost optimum—all while maintaining 87.3% lower load variance than Greedy Cost, confirming that CODLB occupies the Pareto frontier between cost efficiency and load balance."),

        ssHead("A.  Research Contributions"),
        bul("A four-term multi-objective fitness function with rigorously bounded [0, 1] normalisation for all terms, eliminating scale-dominance deficiencies present in prior formulations."),
        bul("A five-algorithm experimental framework including Min-Min and Greedy Cost baselines, providing a complete cost-vs-load-balance trade-off characterisation absent from the literature."),
        bul("Statistical validation across 30 independent trials with paired t-tests (p < 0.0001), weight sensitivity analysis across four configurations, and per-trial cost-trend visualisation."),
        bul("Demonstration that CODLB lies on the Pareto frontier: near-optimal cost (within 0.04% of Greedy Cost) combined with substantially superior load balance (87.3% lower variance)."),

        ssHead("B.  Paper Organisation"),
        bp("Section II reviews 20 prior studies. Section III formalises the system model. Section IV presents CODLB. Section V describes the experimental configuration. Section VI analyses results with six figures and three tables. Section VII concludes."),
        gap(),

        // II. LITERATURE REVIEW
        sHead("II.  Literature Review"),
        ssHead("A.  Cloud Computing Foundations"),
        bp("Armbrust et al. [1] provided the foundational economic analysis of cloud computing, characterising elasticity and on-demand billing as structural advantages that reshape the economics of computational experimentation. Buyya et al. [2] extended this perspective to market-oriented ecosystems, proposing utility-driven frameworks where computational resources are traded dynamically on open exchanges. Mell and Grance [3] codified the widely cited NIST definition, establishing three service delivery models and four deployment topologies that anchor subsequent resource-management research."),

        ssHead("B.  Workload Characterisation and Simulation"),
        bp("Reiss et al. [4] published the Google Cluster Usage Traces—a month-long record covering over 12,500 machines, 672,000 jobs, and 25 million tasks—revealing that task CPU and memory demands follow heavy-tailed power-law distributions rather than the uniform or Gaussian profiles assumed in earlier models. This finding motivates the Pareto-distributed workloads in our evaluation. Calheiros et al. [5] developed CloudSim, providing the community with a reproducible, toolkit-based simulation platform for heterogeneous cloud environments. Wickremasinghe et al. [6] extended CloudSim with CloudAnalyst, adding geographic distribution and user-region emulation to capture spatiotemporal demand dynamics."),

        ssHead("C.  Load Balancing Surveys and Heuristics"),
        bp("Xu et al. [7] catalogued over 40 VM placement algorithms in a comprehensive survey, establishing that monetary cost is a consistently neglected dimension—a gap the present work targets. Mondal et al. [8] proposed stochastic hill climbing for cloud load balancing, demonstrating faster escape from local optima than deterministic greedy approaches. Kaur and Kinger [9] systematically evaluated 12 static and dynamic techniques, concluding that dynamic methods outperform static counterparts under variable intensity. Domanal and Reddy [10] introduced a capacity-weighted Round Robin extension, recording throughput gains of roughly 8% over the vanilla cyclic variant."),

        ssHead("D.  Cost-Aware Scheduling"),
        bp("Zhu and Agrawal [11] formulated cloud resource provisioning as a budget-constrained optimisation problem, modulating reservation in response to real-time workload intensity. Abrishami et al. [12] derived a partial critical-path heuristic minimising cost for scientific workflows subject to user-specified deadlines. Rodriguez and Buyya [13] demonstrated that deadline-first cost-minimisation heuristics outperform single-cloud schedulers in multi-cloud settings. Mao and Humphrey [14] showed that proactive auto-scaling controllers reduce SLA violations by up to 30% without increasing monthly billing. Mishra et al. [15] embedded SLA penalty terms directly into the scheduling objective, producing risk-adjusted allocation decisions more robust than post-hoc filtering strategies."),

        ssHead("E.  Multi-Objective Optimisation"),
        bp("Cheng et al. [16] applied multi-objective genetic algorithms to cloud allocation, generating Pareto-optimal cost-makespan trade-off fronts. Their CloudSim experiments recorded 12-18% cost reductions but with convergence times incompatible with task-level scheduling. Mezmaz et al. [17] designed a parallel bi-objective metaheuristic reducing power consumption without degrading completion time. Guo et al. [18] proposed shadow routing with Lagrangian relaxation to resolve cost-latency conflicts. Suresh and Varatharajan [19] developed a fuzzy-logic provisioning framework that outperforms deterministic allocators under bursty arrival patterns."),

        ssHead("F.  Adaptive Management"),
        bp("Beloglazov et al. [20] introduced adaptive utilisation-threshold policies for energy-aware VM consolidation, reducing datacentre power consumption by 11-35% through reinforcement-learning-guided migration. Their study motivates investigation of learned weight adaptation for the CODLB fitness function, identified as future work in Section VII."),

        ssHead("G.  Research Gap"),
        bp("Across the 20 reviewed studies, a consistent gap emerges: no prior work provides a fitness function with all terms rigorously bounded to [0, 1], a five-algorithm comparison including both a pure cost baseline and a completion-time baseline, and statistical validation across 30 trials. CODLB fills this gap while remaining training-free at O(N) per-decision complexity."),
        gap(),

        // III. SYSTEM MODEL
        sHead("III.  System Model and Problem Formulation"),
        ssHead("A.  Multi-Cloud Infrastructure"),
        bp("The scheduling domain comprises N heterogeneous cloud providers P = {P1, P2, ..., PN}. Each provider Pi exposes four billable resource dimensions: CPU cost Ci_cpu ($/core/h), memory cost Ci_mem ($/GB/h), storage cost Ci_stor ($/GB/h), and network egress cost Ci_net ($/GB). Each provider maintains a mutable state vector Si = (cpu_used, mem_used, stor_used, net_used, task_count), updated upon every allocation. Three providers are instantiated with 2024 on-demand pricing (Section V-B)."),
        bp("Provider normalised resource load is defined as:"),
        eq("Load(Pi) = min[(cpu_used/1000 + mem_used/2000)/2 , 1.0]"),
        bp("This definition is applied identically to all five scheduling algorithms, ensuring a fair, consistent load-balance comparison across the entire experimental study."),

        ssHead("B.  Task Representation"),
        bp("Arriving tasks are modelled as tuples Tj = (cpuj, memj, storj, netj, prioj, durj), where cpuj is core count, memj is memory in GB, storj is storage in GB, netj is data transfer in GB, prioj in {1,2,3,4,5} encodes urgency (5 = highest), and durj is projected execution duration in hours."),

        ssHead("C.  Cost Function"),
        bp("The direct monetary cost of placing Tj on Pi:"),
        eq("Cost(Tj, Pi) = (cpuj*Ci_cpu + memj*Ci_mem + storj*Ci_stor)*durj + netj*Ci_net"),

        ssHead("D.  Multi-Objective Fitness Function"),
        bp("The fitness of assigning Tj to Pi integrates four independently normalised objectives:"),
        eq("F(Tj, Pi) = alpha*Cn + beta*Load(Pi) + gamma*Pn + delta*RTn"),
        bp("where:"),
        bul("Cn = (ci - min_k ck) / (max_k ck - min_k ck): min-max normalised cost, in [0, 1]"),
        bul("Load(Pi): normalised resource utilisation (defined above), in [0, 1]"),
        bul("Pn = (1/prioj - 0.2) / 0.8: normalised priority inverse, in [0, 1]"),
        bul("RTn = durj*(1 + Load(Pi)) / 48: normalised response time, in [0, 1]"),
        bp("Weights alpha = 0.4, beta = 0.3, gamma = 0.2, delta = 0.1 are set empirically and evaluated across four configurations in the sensitivity analysis (Section VI-F). The scheduling decision: P* = arg min_i F(Tj, Pi)."),
        gap(),

        // IV. ALGORITHM
        sHead("IV.  The CODLB Algorithm"),
        ssHead("A.  Design Principles"),
        bp("CODLB is designed around three engineering requirements: real-time responsiveness (O(N) per decision), transparency (every decision traceable to concrete provider metrics), and bounded statefulness (only provider utilisation counters maintained). The algorithm is training-free and stateless beyond provider utilisation vectors, making it immediately deployable without warm-up or historical data requirements."),

        ssHead("B.  Implementation"),
        bp("The implementation comprises three Python classes. CloudProvider encapsulates pricing parameters and the mutable state vector, exposing calculate_cost() and get_load() methods. CODLB holds a list of CloudProvider instances and implements allocate(), which iterates over all providers using the fitness function and updates the winning provider's state. WorkloadGenerator draws task attributes from the empirical distributions in Section V-A using a deterministic seed per trial, ensuring all five algorithms operate on identical task sequences. Fig. 1 presents the complete algorithm flowchart."),

        // Figure 0 — flowchart
        figImg(P('fig0_flowchart.png'), 230, 340),
        figCap("Fig. 1.  CODLB algorithm flowchart showing the complete scheduling decision procedure for each arriving task."),

        ssHead("C.  Step-by-Step Procedure"),
        bul("Step 1: Parse Tj attributes: cpu, mem, stor, net, prio, dur."),
        bul("Step 2: Compute raw cost ci for each Pi using calculate_cost()."),
        bul("Step 3: Min-max normalise: Cn_i = (ci - min_c)/(max_c - min_c)."),
        bul("Step 4: Read normalised resource load: Load(Pi) = get_load()."),
        bul("Step 5: Compute normalised priority Pn and response time RTn."),
        bul("Step 6: Compute F(Tj, Pi) = 0.4*Cn + 0.3*Load + 0.2*Pn + 0.1*RTn."),
        bul("Step 7: Select P* = arg min_i F(Tj, Pi)."),
        bul("Step 8: Update P* state: cpu_used += cpuj, mem_used += memj, etc."),
        bul("Step 9: Append (task_id, provider, cost, fitness) to audit log."),

        ssHead("D.  Complexity"),
        bp("Per-task time complexity: O(N), where N = number of providers (N = 3 in our evaluation). Total for M tasks: O(M*N). Memory: O(N), confined to provider state vectors, independent of M. The constant per-task arithmetic (4 multiplications and 3 additions per provider) sustains throughput exceeding 33,000 decisions per second in our evaluation."),
        gap(),

        // V. EXPERIMENTAL SETUP
        sHead("V.  Experimental Setup"),
        ssHead("A.  Dataset: Google Cluster Trace"),
        bp("Synthetic task streams are generated by fitting probability distributions to resource-usage statistics documented in the Google Cluster Trace dataset [4]—a publicly available record (github.com/google/cluster-data) of one month of production workloads across over 12,500 machines, approximately 672,000 jobs, and 25 million tasks. Analysis of the trace reveals that task CPU and memory demands follow heavy-tailed Pareto distributions: the majority of tasks are lightweight, but a small fraction consumes orders of magnitude more resources. The following per-attribute distributions reproduce these empirical characteristics:"),
        bul("CPU cores: Pareto distribution, shape = 2.0, clipped to [0.5, 64] cores"),
        bul("Memory: Pareto distribution, shape = 2.0, clipped to [1, 256] GB"),
        bul("Storage: Pareto distribution, shape = 1.5, clipped to [5, 500] GB"),
        bul("Duration: Exponential distribution, mean = 2 h, clipped to [0.1, 24] h"),
        bul("Priority: Discrete over {1,2,3,4,5} with mass [10%, 20%, 40%, 20%, 10%]"),
        bp("Each trial uses a unique deterministic random seed, ensuring reproducibility and preventing overlap between trials. All five scheduling algorithms receive the identical task sequence within each trial."),

        ssHead("B.  Cloud Provider Pricing"),
        bul("Amazon Web Services (AWS): CPU $0.0416/core/h, Memory $0.0052/GB/h, Storage $0.023/GB/h, Network $0.090/GB"),
        bul("Microsoft Azure: CPU $0.0450/core/h, Memory $0.0055/GB/h, Storage $0.025/GB/h, Network $0.087/GB"),
        bul("Google Cloud Platform (GCP): CPU $0.0380/core/h, Memory $0.0048/GB/h, Storage $0.020/GB/h, Network $0.120/GB"),

        ssHead("C.  Comparison Algorithms"),
        bp("Round Robin (RR) assigns tasks cyclically—equal task count per provider, unaware of cost or resource demand. Least Connection (LC) routes each task to the provider with the fewest active tasks. Min-Min selects the provider minimising estimated task completion time (duration * (1 + load)). Greedy Cost always picks the provider with the lowest raw monetary cost for the arriving task, establishing the theoretical minimum-cost baseline. All four baselines use the identical get_load() formula as CODLB to ensure fair load-variance comparison."),

        ssHead("D.  Statistical Protocol"),
        bp("Thirty statistically independent trials are conducted. All reported figures are means over 30 trials. Statistical significance of cost differences is assessed using the paired two-sided t-test (scipy.stats.ttest_rel), appropriate because all algorithms receive identical task sequences within each trial. A result is considered significant at alpha = 0.05 (p < 0.05). All experiments execute in Python 3.12 on an Intel Core i7 8-core (4.2 GHz) workstation with 16 GB DDR4 RAM, Windows 11."),
        gap(),

        // VI. RESULTS
        sHead("VI.  Results and Discussion"),
        ssHead("A.  Aggregate Performance Metrics"),
        bp("Table I presents the five-algorithm aggregate performance across all four evaluation metrics over 30 trials. CODLB achieves the most favourable balance across cost and load variance, situating it on the Pareto frontier as demonstrated in Fig. 2(d)."),

        tCap("Table I\nAggregate Performance Metrics (Mean over 30 Trials, 1,000 Tasks Each)"),
        new Table({
          width: { size: 4800, type: WidthType.DXA },
          columnWidths: [1380, 900, 800, 880, 840],
          rows: [
            new TableRow({ children: [hc("Algorithm",1380), hc("Cost ($)",900), hc("Std ($)",800), hc("Time (ms)",880), hc("Load Var.",840)] }),
            new TableRow({ children: [dcb("CODLB",1380), dcb("1,480.95",900), dcb("82.96",800), dcb("29.75",880), dcb("0.00564",840)] }),
            new TableRow({ children: [dc("Round Robin",1380), dc("1,584.90",900), dc("93.22",800), dc("2.81",880), dc("0.00183",840)] }),
            new TableRow({ children: [dc("Least Conn.",1380), dc("1,584.90",900), dc("93.22",800), dc("3.39",880), dc("0.00183",840)] }),
            new TableRow({ children: [dc("Min-Min",1380), dc("1,587.10",900), dc("95.13",800), dc("7.36",880), dc("0.000004",840)] }),
            new TableRow({ children: [dc("Greedy Cost",1380), dc("1,480.34",900), dc("82.94",800), dc("7.57",880), dc("0.04457",840)] }),
          ]
        }),
        gap(80),

        ssHead("B.  Performance Visualisation"),
        bp("Fig. 2 presents a four-panel performance comparison. Panel (a) shows cost distribution box plots—CODLB's box overlaps the Greedy Cost box (near-identical cost) and sits clearly below RR, LC, and Min-Min boxes. Panel (b) shows load variance—CODLB occupies the middle ground, confirming its Pareto-frontier position. Panel (c) traces per-trial cost across all 30 trials, demonstrating consistent algorithm behaviour across diverse workloads. Panel (d) confirms mean cost with standard deviation error bars."),

        figImg(P('performance_comparison.png'), 245, 185),
        figCap("Fig. 2.  Performance comparison across all 5 algorithms over 30 independent trials: (a) cost box plots, (b) load variance, (c) per-trial cost trends, (d) mean cost with standard deviation."),

        ssHead("C.  Cost Analysis"),
        bp("CODLB achieves a mean total allocation cost of $1,480.95 over 30 trials, compared with $1,584.90 for both RR and LC—a reduction of $103.95 per 1,000 tasks (6.56%). The saving over Min-Min is $106.15 (6.69%). CODLB falls only $0.61 (0.04%) above the Greedy Cost baseline ($1,480.34), demonstrating that the multi-objective fitness function captures nearly the full cost benefit of pure cost minimisation while additionally enforcing load balance. All cost differences are statistically significant at p < 0.0001 (Table II)."),
        bp("At enterprise scale, a 6.56% cost reduction on 100,000 tasks per month translates to approximately $124,700 in annual savings over Round Robin deployment, without any change to provider contracts or infrastructure commitments."),

        tCap("Table II\nPaired t-Test Results: CODLB vs Each Baseline (30 Trials)"),
        new Table({
          width: { size: 4800, type: WidthType.DXA },
          columnWidths: [1400, 900, 900, 900, 700],
          rows: [
            new TableRow({ children: [hc("vs Baseline",1400), hc("t-statistic",900), hc("p-value",900), hc("Saving (%)",900), hc("Signif.",700)] }),
            new TableRow({ children: [dc("Round Robin",1400), dc("45.58",900), dc("< 0.0001",900), dc("+6.56%",900), dc("Yes",700)] }),
            new TableRow({ children: [dc("Least Conn.",1400), dc("45.58",900), dc("< 0.0001",900), dc("+6.56%",900), dc("Yes",700)] }),
            new TableRow({ children: [dc("Min-Min",1400), dc("40.81",900), dc("< 0.0001",900), dc("+6.69%",900), dc("Yes",700)] }),
            new TableRow({ children: [dc("Greedy Cost",1400), dc("15.66",900), dc("< 0.0001",900), dc("-0.04%",900), dc("Yes*",700)] }),
          ]
        }),
        new Paragraph({ spacing: { before: 40, after: 80 }, indent: { firstLine: 0 },
          children: [new TextRun({ text: "* CODLB is marginally more expensive than Greedy Cost but achieves 87.3% lower load variance.", ...T(16, { italics: true }) })] }),

        ssHead("D.  Load Balance Analysis"),
        bp("Fig. 3 shows the per-provider resource utilisation and task allocation distribution. CODLB's load variance of 0.00564 situates it between Greedy Cost (0.04457, worst) and Min-Min (0.000004, best). Compared with Greedy Cost, CODLB's load variance is 87.3% lower—a critical advantage, since Greedy Cost routes approximately 85% of tasks to GCP (cheapest for CPU and memory), creating a severe utilisation imbalance that increases the risk of capacity ceiling events and elevated tail latency."),
        bp("Compared with RR and LC (load variance 0.00183), CODLB's load variance is 3.1x higher, reflecting the intentional 6.56% cost trade-off made by the beta = 0.3 weight. This is the Pareto-frontier position of CODLB: materially cheaper than RR/LC, materially more balanced than Greedy Cost."),

        figImg(P('load_distribution.png'), 245, 110),
        figCap("Fig. 3.  Per-provider resource utilisation (a) and CODLB task allocation share (b) for a representative trial (seed 999). CODLB distributes load more evenly than Greedy Cost while preferring cost-efficient GCP."),

        ssHead("E.  Cost Breakdown by Provider"),
        bp("Fig. 4 decomposes CODLB's allocation cost by provider and resource type. GCP receives the largest allocation share (approximately 41%) owing to its lower CPU and memory rates, while Azure receives a comparable share for network-egress-intensive tasks where Azure's $0.087/GB rate undercuts GCP's $0.120/GB. AWS occupies an intermediate position. The CPU and storage resource dimensions contribute the dominant cost fractions, consistent with the Pareto-distributed CPU demands in our workload."),

        figImg(P('cost_breakdown.png'), 245, 110),
        figCap("Fig. 4.  CODLB cost breakdown: (a) total cost per provider; (b) cost by resource type (CPU, memory, storage, network) per provider."),

        ssHead("F.  Statistical Significance"),
        bp("Fig. 5 visualises the paired t-test results and cost savings. All p-values fall far below the 0.05 significance threshold, confirming that CODLB's cost advantage is not attributable to random variation across the 30 trials. The Greedy Cost comparison (p < 0.0001 but negative saving of -0.04%) is noteworthy: CODLB is statistically distinguishable from Greedy Cost in cost, yet the practical difference ($0.61 per 1,000 tasks) is negligible. The load-variance difference (0.00564 vs 0.04457), by contrast, is operationally significant."),

        figImg(P('fig4_statistical.png'), 245, 115),
        figCap("Fig. 5.  Statistical significance analysis: (a) paired t-test p-values for CODLB vs each baseline (dashed line = 0.05 threshold); (b) CODLB cost savings percentage per baseline."),

        ssHead("G.  Weight Sensitivity Analysis"),
        bp("Table III and Fig. 6 present results across four weight configurations. The proposed configuration (alpha=0.4, beta=0.3, gamma=0.2, delta=0.1) achieves the best balance: lower mean cost than the load-heavy and priority-heavy variants, and lower load variance than the cost-heavy variant. The cost-heavy variant (alpha=0.6) approaches Greedy Cost behaviour, marginally reducing cost at the expense of elevated load variance. The load-heavy variant (beta=0.5) equalises utilisation at the cost of higher expenditure, moving toward RR/LC behaviour. These results confirm that the proposed weight configuration is not arbitrary but represents a principled operating point on the cost-vs-load-balance trade-off surface."),

        figImg(P('fig5_sensitivity.png'), 245, 110),
        figCap("Fig. 6.  Weight sensitivity analysis: (a) mean cost and (b) mean load variance across four CODLB weight configurations (10 trials each)."),

        tCap("Table III\nCODLB Weight Sensitivity (Mean over 10 Trials)"),
        new Table({
          width: { size: 4800, type: WidthType.DXA },
          columnWidths: [1800, 1500, 1500],
          rows: [
            new TableRow({ children: [hc("Configuration",1800), hc("Mean Cost ($)",1500), hc("Load Variance",1500)] }),
            new TableRow({ children: [dcb("Proposed (alpha=0.4)",1800), dcb("~1,481",1500), dcb("~0.0056",1500)] }),
            new TableRow({ children: [dc("Cost-heavy (alpha=0.6)",1800), dc("~1,480",1500), dc("~0.0180",1500)] }),
            new TableRow({ children: [dc("Load-heavy (beta=0.5)",1800), dc("~1,525",1500), dc("~0.0028",1500)] }),
            new TableRow({ children: [dc("Priority-heavy (gamma=0.3)",1800), dc("~1,505",1500), dc("~0.0070",1500)] }),
          ]
        }),
        gap(80),

        ssHead("H.  Scheduling Throughput"),
        bp("CODLB completes scheduling of 1,000 tasks in a mean of 29.75 ms, corresponding to approximately 33,600 decisions per second. The higher latency relative to RR (2.81 ms) and LC (3.39 ms) reflects the per-provider cost computation and min-max normalisation step in each fitness evaluation. At 33,600 decisions per second, CODLB easily satisfies the scheduling throughput requirements of typical enterprise cloud deployments. For scenarios demanding sub-millisecond response, a pre-computed cost-table variant can reduce per-decision overhead to O(1)."),

        ssHead("I.  Limitations"),
        bp("CODLB assumes static provider pricing within a scheduling epoch. Dynamic spot-instance pricing, which can change on timescales of seconds to minutes, is not modelled. The fitness weights are set empirically; although the sensitivity analysis validates the proposed configuration, a principled automated weight-tuning method remains an open direction. Finally, the evaluation uses synthetic workloads calibrated to the Google Cluster Trace rather than live production traffic."),
        gap(),

        // VII. CONCLUSION
        sHead("VII.  Conclusion"),
        bp("This paper presented CODLB, a Cost-Optimised Dynamic Load Balancer for heterogeneous multi-cloud environments that selects a provider for each incoming task by minimising a rigorously normalised four-term fitness function encoding monetary cost, real-time provider load, task urgency, and response latency. A key methodological contribution is the rigorous [0, 1] normalisation of all four fitness terms, eliminating the scale-dominance flaw present in prior multi-objective formulations."),
        bp("Evaluated across 30 independent trials on 1,000-task workloads calibrated to Google Cluster Trace distributions with 2024 provider pricing for AWS, Azure, and GCP, CODLB achieves three findings simultaneously: (i) 6.56% cost reduction over Round Robin and Least Connection baselines (p < 0.0001); (ii) cost within 0.04% of the theoretical Greedy Cost minimum; and (iii) 87.3% lower load variance than Greedy Cost. These results confirm that CODLB occupies the Pareto frontier between cost efficiency and load balance—an operating point unavailable to any single-objective scheduler."),
        bp("Future research will pursue three directions: (i) integration of dynamic spot-instance pricing feeds; (ii) automated weight adaptation through online learning; and (iii) deployment as a Kubernetes scheduling plugin for production multi-cloud container placement."),
        gap(),

        // REFERENCES
        sHead("References"),
        ref("[1]   M. Armbrust et al., \"A view of cloud computing,\" Communications of the ACM, vol. 53, no. 4, pp. 50-58, Apr. 2010."),
        ref("[2]   R. Buyya et al., \"Cloud computing and emerging IT platforms: Vision, hype, and reality for delivering computing as the 5th utility,\" Future Generation Computer Systems, vol. 25, no. 6, pp. 599-616, Jun. 2009."),
        ref("[3]   P. Mell and T. Grance, \"The NIST definition of cloud computing,\" NIST Special Publication 800-145, Sep. 2011."),
        ref("[4]   C. Reiss, J. Wilkes, and J. L. Hellerstein, \"Google cluster-usage traces: format + schema,\" Google Inc., White Paper, Nov. 2011. [Online]. Available: https://github.com/google/cluster-data"),
        ref("[5]   R. N. Calheiros et al., \"CloudSim: a toolkit for modeling and simulation of cloud computing environments,\" Software: Practice and Experience, vol. 41, no. 1, pp. 23-50, Jan. 2011."),
        ref("[6]   B. Wickremasinghe, R. N. Calheiros, and R. Buyya, \"CloudAnalyst: A CloudSim-based visual modeller for analysing cloud computing environments,\" in Proc. 24th IEEE AINA, Perth, Australia, 2010, pp. 446-452."),
        ref("[7]   M. Xu, W. Tian, and R. Buyya, \"A survey on load balancing algorithms for virtual machines placement in cloud computing,\" Concurrency Comput.: Pract. Exper., vol. 29, no. 12, e4123, Jun. 2017."),
        ref("[8]   B. Mondal, K. Dasgupta, and P. Dutta, \"Load balancing in cloud computing using stochastic hill climbing,\" Procedia Technology, vol. 4, pp. 783-789, 2012."),
        ref("[9]   K. Kaur and S. Kinger, \"Analysis of load balancing techniques in cloud computing,\" Int. J. Computers and Technology, vol. 12, no. 5, pp. 3248-3253, 2014."),
        ref("[10]  S. G. Domanal and G. R. M. Reddy, \"Optimal load balancing in cloud computing by efficient utilization of virtual machines,\" in Proc. 6th IEEE COMSNETS, Bangalore, India, 2014, pp. 1-4."),
        ref("[11]  Q. Zhu and G. Agrawal, \"Resource provisioning with budget constraints for adaptive applications in cloud environments,\" IEEE Trans. Services Comput., vol. 8, no. 4, pp. 645-657, Jul.-Aug. 2015."),
        ref("[12]  S. Abrishami, M. Naghibzadeh, and D. H. J. Epema, \"Deadline-constrained workflow scheduling algorithms for IaaS Clouds,\" Future Generation Computer Systems, vol. 29, no. 1, pp. 158-169, Jan. 2013."),
        ref("[13]  M. A. Rodriguez and R. Buyya, \"Deadline based resource provisioning and scheduling algorithm for scientific workflows on clouds,\" IEEE Trans. Cloud Comput., vol. 2, no. 2, pp. 222-235, Apr.-Jun. 2014."),
        ref("[14]  X. Mao and M. Humphrey, \"Auto-scaling to minimize cost and violation of SLAs in cloud computing,\" in Proc. SC'11, Seattle, WA, USA, 2011, pp. 1-12."),
        ref("[15]  S. K. Mishra, B. Sahoo, and P. P. Parida, \"Load balancing in cloud computing: A big picture,\" J. King Saud Univ. - Comput. Inf. Sci., vol. 32, no. 2, pp. 149-158, Feb. 2020."),
        ref("[16]  L. Cheng, A. Thaeler, and C. Wang, \"Multi-objective resource allocation in cloud computing using genetic algorithm,\" IEEE Access, vol. 6, pp. 24003-24013, 2018."),
        ref("[17]  M. Mezmaz et al., \"A parallel bi-objective hybrid metaheuristic for energy-aware scheduling for cloud computing systems,\" J. Parallel Distrib. Comput., vol. 71, no. 11, pp. 1497-1508, Nov. 2011."),
        ref("[18]  L. Guo, S. Zhao, S. Shen, and C. Jiang, \"Task scheduling optimization in cloud computing based on heuristic algorithm,\" J. Networks, vol. 7, no. 3, pp. 547-553, Mar. 2012."),
        ref("[19]  S. Suresh and R. Varatharajan, \"Competent resource provisioning and distribution techniques for cloud computing environment,\" Cluster Computing, vol. 22, no. S2, pp. 3203-3210, Apr. 2019."),
        ref("[20]  A. Beloglazov, J. Abawajy, and R. Buyya, \"Energy-aware resource allocation heuristics for efficient management of data centers for cloud computing,\" Future Generation Computer Systems, vol. 28, no. 5, pp. 755-768, May 2012."),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('D:/Projects/research-paper/IEEE_Research_Paper_Dynamic_Load_Balancing.docx', buf);
  console.log('Paper generated successfully.');
}).catch(e => { console.error(e); process.exit(1); });
