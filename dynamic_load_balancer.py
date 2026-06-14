"""
Cost-Optimised Dynamic Load Balancing for Multi-Cloud Environments
Fixed Implementation — all metrics computed consistently across algorithms
Author: Namratha R, Christ University Bangalore
"""

import os, time, random, warnings
warnings.filterwarnings('ignore')

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as pe
from scipy import stats

# -- Publication-quality matplotlib settings ----------------------------------
plt.rcParams.update({
    'font.family': 'DejaVu Serif',
    'font.size': 11,
    'axes.titlesize': 12,
    'axes.labelsize': 11,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'legend.fontsize': 10,
    'figure.dpi': 100,
    'savefig.dpi': 300,
    'savefig.bbox': 'tight',
    'axes.spines.top': False,
    'axes.spines.right': False,
    'axes.grid': True,
    'grid.alpha': 0.3,
    'grid.linestyle': '--',
})

COLORS = {
    'CODLB':            '#1a6faf',
    'Round Robin':      '#c0392b',
    'Least Connection': '#e67e22',
    'Min-Min':          '#27ae60',
    'Greedy Cost':      '#8e44ad',
}

# -- Constants ----------------------------------------------------------------
MAX_CPU_CAP  = 1000.0   # normalisation cap (cores)
MAX_MEM_CAP  = 2000.0   # normalisation cap (GB)
MAX_DURATION = 24.0     # max task duration (hours)
SAVE_PATH    = os.path.dirname(os.path.abspath(__file__))


# ═══════════════════════════════════════════════════════════════════════════════
# DATA CLASSES
# ═══════════════════════════════════════════════════════════════════════════════

class CloudProvider:
    def __init__(self, name, cpu_cost, mem_cost, stor_cost, net_cost):
        self.name = name
        self.cpu_cost  = cpu_cost
        self.mem_cost  = mem_cost
        self.stor_cost = stor_cost
        self.net_cost  = net_cost
        self.reset()

    def reset(self):
        self.total_cpu = self.total_mem = self.total_stor = self.total_net = 0.0
        self.task_count = 0

    def calculate_cost(self, cpu, mem, stor, net, dur):
        return (cpu*self.cpu_cost + mem*self.mem_cost + stor*self.stor_cost)*dur + net*self.net_cost

    def get_load(self):
        """Normalised resource load — IDENTICAL formula used for every algorithm."""
        cpu_load = min(self.total_cpu / MAX_CPU_CAP, 1.0)
        mem_load = min(self.total_mem / MAX_MEM_CAP, 1.0)
        return (cpu_load + mem_load) / 2.0

    def add_task(self, cpu, mem, stor, net):
        self.total_cpu  += cpu;  self.total_mem  += mem
        self.total_stor += stor; self.total_net  += net
        self.task_count += 1


class Task:
    def __init__(self, tid, cpu, mem, stor, priority, duration, network):
        self.tid = tid;         self.cpu = cpu
        self.mem = mem;         self.stor = stor
        self.priority = priority
        self.duration = duration
        self.network  = network


# ═══════════════════════════════════════════════════════════════════════════════
# SCHEDULING ALGORITHMS
# ═══════════════════════════════════════════════════════════════════════════════

class CODLB:
    """
    Cost-Optimised Dynamic Load Balancer (proposed).
    Fitness F = α·Cₙ + β·Load + γ·Pₙ + δ·RTₙ   (all terms in [0,1])
    """
    def __init__(self, providers, alpha=0.4, beta=0.3, gamma=0.2, delta=0.1):
        self.providers = providers
        self.alpha = alpha; self.beta = beta
        self.gamma = gamma; self.delta = delta
        self.history = []

    def _fitness(self, task, provider):
        # -- 1. Min-max normalised cost --------------------------------------
        costs = [p.calculate_cost(task.cpu, task.mem, task.stor,
                                  task.network, task.duration)
                 for p in self.providers]
        cost  = provider.calculate_cost(task.cpu, task.mem, task.stor,
                                        task.network, task.duration)
        mn, mx = min(costs), max(costs)
        cost_n = (cost - mn) / (mx - mn) if mx != mn else 0.0

        # -- 2. Normalised load ----------------------------------------------─
        load = provider.get_load()        # already in [0,1]

        # -- 3. Normalised priority (higher prio ➜ lower score) --------------
        # 1/prio ∈ [0.2, 1.0]; normalise to [0,1]
        prio_n = (1.0/task.priority - 0.2) / 0.8

        # -- 4. Normalised response-time estimate ----------------------------─
        rt     = task.duration * (1.0 + load)        # hours
        rt_n   = rt / (MAX_DURATION * 2.0)           # ∈ [0,1]

        return self.alpha*cost_n + self.beta*load + self.gamma*prio_n + self.delta*rt_n

    def allocate(self, task):
        best = min(self.providers, key=lambda p: self._fitness(task, p))
        cost = best.calculate_cost(task.cpu, task.mem, task.stor,
                                   task.network, task.duration)
        best.add_task(task.cpu, task.mem, task.stor, task.network)
        self.history.append({'provider': best.name, 'cost': cost})
        return best


class RoundRobin:
    def __init__(self, providers):
        self.providers = providers; self.idx = 0; self.history = []

    def allocate(self, task):
        p = self.providers[self.idx]
        cost = p.calculate_cost(task.cpu, task.mem, task.stor, task.network, task.duration)
        p.add_task(task.cpu, task.mem, task.stor, task.network)
        self.history.append({'provider': p.name, 'cost': cost})
        self.idx = (self.idx + 1) % len(self.providers)
        return p


class LeastConnection:
    def __init__(self, providers):
        self.providers = providers; self.history = []

    def allocate(self, task):
        p = min(self.providers, key=lambda p: p.task_count)
        cost = p.calculate_cost(task.cpu, task.mem, task.stor, task.network, task.duration)
        p.add_task(task.cpu, task.mem, task.stor, task.network)
        self.history.append({'provider': p.name, 'cost': cost})
        return p


class MinMin:
    """Assigns each task to the provider with minimum estimated completion time."""
    def __init__(self, providers):
        self.providers = providers; self.history = []

    def allocate(self, task):
        p = min(self.providers,
                key=lambda p: task.duration * (1.0 + p.get_load()))
        cost = p.calculate_cost(task.cpu, task.mem, task.stor, task.network, task.duration)
        p.add_task(task.cpu, task.mem, task.stor, task.network)
        self.history.append({'provider': p.name, 'cost': cost})
        return p


class GreedyCost:
    """
    Pure-cost greedy baseline: always picks the cheapest provider per task.
    Used to demonstrate that the multi-objective fitness adds value over
    naive cost minimisation.
    """
    def __init__(self, providers):
        self.providers = providers; self.history = []

    def allocate(self, task):
        p = min(self.providers,
                key=lambda p: p.calculate_cost(task.cpu, task.mem, task.stor,
                                               task.network, task.duration))
        cost = p.calculate_cost(task.cpu, task.mem, task.stor, task.network, task.duration)
        p.add_task(task.cpu, task.mem, task.stor, task.network)
        self.history.append({'provider': p.name, 'cost': cost})
        return p


# ═══════════════════════════════════════════════════════════════════════════════
# WORKLOAD + PROVIDER FACTORIES
# ═══════════════════════════════════════════════════════════════════════════════

def generate_tasks(n=1000, seed=None):
    """
    Synthetic tasks whose resource demands follow distributions derived from
    the Google Cluster Trace (Reiss et al., 2011): power-law (Pareto) for
    CPU and memory, exponential for duration.
    """
    rng = np.random.default_rng(seed)
    cpu  = np.clip(rng.pareto(2, n) * 2,    0.5,  64.0)
    mem  = np.clip(rng.pareto(2, n) * 4,    1.0, 256.0)
    stor = np.clip(rng.pareto(1.5, n) * 10, 5.0, 500.0)
    dur  = np.clip(rng.exponential(2, n),   0.1,  24.0)
    net  = rng.uniform(1, 10, n)
    prio = rng.choice([1,2,3,4,5], n, p=[0.1,0.2,0.4,0.2,0.1])
    return [Task(f"t{i:04d}", cpu[i], mem[i], stor[i], int(prio[i]), dur[i], net[i])
            for i in range(n)]


def make_providers():
    """Real 2024 on-demand pricing for AWS, Azure, GCP."""
    return [
        CloudProvider("AWS",   0.0416, 0.0052, 0.023, 0.090),
        CloudProvider("Azure", 0.0450, 0.0055, 0.025, 0.087),
        CloudProvider("GCP",   0.0380, 0.0048, 0.020, 0.120),
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# EXPERIMENT RUNNER
# ═══════════════════════════════════════════════════════════════════════════════

ALG_ORDER = ['CODLB', 'Round Robin', 'Least Connection', 'Min-Min', 'Greedy Cost']

def run_experiments(n_tasks=1000, n_runs=30):
    results = {a: {'costs': [], 'times_ms': [], 'load_var': []} for a in ALG_ORDER}

    print(f"Running {n_runs} independent trials × 5 algorithms × {n_tasks} tasks ...")
    for run in range(n_runs):
        tasks = generate_tasks(n_tasks, seed=run * 37 + 7)   # reproducible

        for name in ALG_ORDER:
            providers = make_providers()
            if   name == 'CODLB':            bal = CODLB(providers)
            elif name == 'Round Robin':       bal = RoundRobin(providers)
            elif name == 'Least Connection':  bal = LeastConnection(providers)
            elif name == 'Min-Min':           bal = MinMin(providers)
            else:                             bal = GreedyCost(providers)

            t0 = time.perf_counter()
            for task in tasks:
                bal.allocate(task)
            elapsed = (time.perf_counter() - t0) * 1000  # ms

            cost = sum(h['cost'] for h in bal.history)
            # -- FIXED: identical load-variance metric for ALL algorithms --
            lv   = np.var([p.get_load() for p in providers])

            results[name]['costs'].append(cost)
            results[name]['times_ms'].append(elapsed)
            results[name]['load_var'].append(lv)

        if (run + 1) % 10 == 0:
            print(f"  ... {run+1}/{n_runs} trials done")

    return results


def weight_sensitivity(n_tasks=1000, n_runs=10):
    """Run CODLB under four different weight configurations."""
    configs = [
        (0.4, 0.3, 0.2, 0.1, 'Proposed (α=0.4)'),
        (0.6, 0.2, 0.1, 0.1, 'Cost-heavy (α=0.6)'),
        (0.2, 0.5, 0.2, 0.1, 'Load-heavy (β=0.5)'),
        (0.3, 0.3, 0.3, 0.1, 'Priority-heavy (γ=0.3)'),
    ]
    sens = {c[4]: {'costs': [], 'load_var': []} for c in configs}
    for run in range(n_runs):
        tasks = generate_tasks(n_tasks, seed=run * 13)
        for α, β, γ, δ, label in configs:
            providers = make_providers()
            bal = CODLB(providers, alpha=α, beta=β, gamma=γ, delta=δ)
            for task in tasks:
                bal.allocate(task)
            sens[label]['costs'].append(sum(h['cost'] for h in bal.history))
            sens[label]['load_var'].append(np.var([p.get_load() for p in providers]))
    return sens, [c[4] for c in configs]


# ═══════════════════════════════════════════════════════════════════════════════
# FIGURE GENERATORS
# ═══════════════════════════════════════════════════════════════════════════════

def save(fig, name):
    path = os.path.join(SAVE_PATH, name)
    fig.savefig(path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"  Saved: {name}")


# -- Figure 0: Algorithm flowchart --------------------------------------------
def gen_flowchart():
    import matplotlib.patches as mpatches
    from matplotlib.patches import FancyArrowPatch

    fig = plt.figure(figsize=(7.5, 14))
    ax  = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 28)
    ax.axis('off')
    fig.patch.set_facecolor('white')

    CX = 5.0          # centre-x for the main spine
    ARROW_COLOR  = '#1e293b'
    LOOP_COLOR   = '#6d28d9'

    # ── helpers ──────────────────────────────────────────────────────────────
    def rect(cx, cy, w, h, label, fc, ec, fs=9.2, bold=False, color='black',
             style='round,pad=0.08'):
        patch = FancyBboxPatch((cx - w/2, cy - h/2), w, h,
                               boxstyle=style, facecolor=fc, edgecolor=ec,
                               linewidth=1.6, zorder=3)
        ax.add_patch(patch)
        ax.text(cx, cy, label, ha='center', va='center', fontsize=fs,
                fontweight='bold' if bold else 'normal',
                multialignment='center', color=color, zorder=4,
                linespacing=1.5)

    def diamond(cx, cy, hw, hh, label, fc='#fef9c3', ec='#92400e', fs=9.0):
        pts = np.array([[cx, cy+hh], [cx+hw, cy],
                        [cx, cy-hh], [cx-hw, cy]])
        p = plt.Polygon(pts, closed=True, facecolor=fc, edgecolor=ec,
                        linewidth=1.6, zorder=3)
        ax.add_patch(p)
        ax.text(cx, cy, label, ha='center', va='center', fontsize=fs,
                multialignment='center', zorder=4, linespacing=1.5)

    def varrow(x, y1, y2, color=ARROW_COLOR):
        ax.annotate('', xy=(x, y2), xytext=(x, y1),
                    arrowprops=dict(arrowstyle='->', color=color, lw=1.5),
                    zorder=5)

    def harrow(x1, x2, y, color=ARROW_COLOR):
        ax.annotate('', xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle='->', color=color, lw=1.5),
                    zorder=5)

    def label(x, y, txt, color='black', fs=8.5, bold=False, ha='center'):
        ax.text(x, y, txt, ha=ha, va='center', fontsize=fs,
                color=color, fontweight='bold' if bold else 'normal', zorder=6)

    # ── row y-coordinates (top to bottom) ─────────────────────────────────
    # Each row is separated by a consistent gap.
    # Rows: START, arrive, parse, init, [loop-header], compute-cost,
    #        norm-cost, read-load, norm-prio, fitness, [diamond best?],
    #        [update-best], [diamond all?], assign, END
    Y = {}
    Y['START']       = 27.0
    Y['arrive']      = 25.4
    Y['parse']       = 23.7
    Y['init']        = 22.0
    Y['loop']        = 20.2    # "For each provider" — dashed-border loop marker
    Y['cost']        = 18.5
    Y['normcost']    = 16.7
    Y['load']        = 14.9
    Y['normprio']    = 13.1
    Y['fitness']     = 11.3
    Y['dbest']       = 9.5     # diamond: F < best?
    Y['updbest']     = 7.9     # update best_fitness, P*
    Y['dall']        = 6.3     # diamond: all evaluated?
    Y['assign']      = 4.5
    Y['update']      = 2.9
    Y['END']         = 1.3

    BW = 6.2   # box width
    BH = 1.0   # box height (single-line)
    BH2= 1.2   # box height (two-line)
    DH = 1.05  # diamond half-height
    DW = 3.2   # diamond half-width

    # ── node drawing ──────────────────────────────────────────────────────
    # START
    rect(CX, Y['START'], 2.8, BH, 'START', fc='#134e4a', ec='#0f3d38',
         fs=10.5, bold=True, color='white', style='round,pad=0.15')

    # Process boxes (blue)
    B_FC = '#dbeafe'; B_EC = '#1d4ed8'
    rect(CX, Y['arrive'],   BW, BH,  'Task T arrives at the multi-cloud scheduler gateway',
         B_FC, B_EC)
    rect(CX, Y['parse'],    BW, BH2, 'Parse task attributes\n(cpu, mem, stor, net, priority, duration)',
         B_FC, B_EC)
    rect(CX, Y['init'],     BW, BH,  'Initialise:  best_fitness = INF,   P* = None',
         B_FC, B_EC)

    # Loop header (purple tint)
    rect(CX, Y['loop'],     BW, BH,  'For each provider Pi in {AWS, Azure, GCP}',
         '#ede9fe', '#7c3aed', bold=False)

    # Computation boxes (pink tint) — loop body
    C_FC = '#fdf2f8'; C_EC = '#9d174d'
    rect(CX, Y['cost'],     BW, BH,  'Compute raw cost:  c_i = Cost(T, Pi)',
         C_FC, C_EC)
    rect(CX, Y['normcost'], BW, BH2, 'Min-max normalise cost:\nC_n = (c_i - min_c) / (max_c - min_c)',
         C_FC, C_EC)
    rect(CX, Y['load'],     BW, BH2, 'Read normalised provider load:\nL_i = (cpu_used/1000 + mem_used/2000) / 2',
         C_FC, C_EC)
    rect(CX, Y['normprio'], BW, BH2, 'Normalise priority & response time:\nP_n = (1/prio - 0.2)/0.8,   RT_n = dur*(1+L)/48',
         C_FC, C_EC)
    rect(CX, Y['fitness'],  BW, BH2, 'Compute fitness score:\nF = 0.4*C_n + 0.3*L_i + 0.2*P_n + 0.1*RT_n',
         C_FC, C_EC)

    # Decision: F < best_fitness?
    diamond(CX, Y['dbest'], DW, DH, 'F < best_fitness?')

    # Update best (green tint)
    rect(CX, Y['updbest'],  BW, BH,  'Update:  best_fitness = F,   P* = Pi',
         '#dcfce7', '#15803d')

    # Decision: all providers evaluated?
    diamond(CX, Y['dall'],  DW, DH,  'All providers\nevaluated?')

    # Final steps
    rect(CX, Y['assign'],   BW, BH,  'Allocate task to P*  (selected provider)',
         '#dcfce7', '#15803d')
    rect(CX, Y['update'],   BW, BH2, 'Update P* resource counters:\ncpu, mem, stor, net, task_count',
         '#dcfce7', '#15803d')

    # END
    rect(CX, Y['END'], 2.8, BH, 'END', fc='#134e4a', ec='#0f3d38',
         fs=10.5, bold=True, color='white', style='round,pad=0.15')

    # ── straight arrows (main spine) ──────────────────────────────────────
    pairs = [
        ('START',    'arrive',   BH/2,    BH/2),
        ('arrive',   'parse',    BH/2,    BH2/2),
        ('parse',    'init',     BH2/2,   BH/2),
        ('init',     'loop',     BH/2,    BH/2),
        ('loop',     'cost',     BH/2,    BH/2),
        ('cost',     'normcost', BH/2,    BH2/2),
        ('normcost', 'load',     BH2/2,   BH2/2),
        ('load',     'normprio', BH2/2,   BH2/2),
        ('normprio', 'fitness',  BH2/2,   BH2/2),
        ('fitness',  'dbest',    BH2/2,   DH),
    ]
    for a, b, da, db in pairs:
        varrow(CX, Y[a] - da, Y[b] + db)

    # YES from diamond-best -> update-best
    varrow(CX, Y['dbest'] - DH, Y['updbest'] + BH/2, color='#166534')
    label(CX - 0.25, (Y['dbest'] - DH + Y['updbest'] + BH/2)/2, 'Yes',
          color='#166534', bold=True, ha='right')

    # update-best -> diamond-all
    varrow(CX, Y['updbest'] - BH/2, Y['dall'] + DH)

    # NO from diamond-best -> right -> down to diamond-all level -> left to diamond-all
    RX = CX + DW + 0.5    # right rail x
    ax.annotate('', xy=(RX, Y['dbest']), xytext=(CX + DW, Y['dbest']),
                arrowprops=dict(arrowstyle='->', color='#b91c1c', lw=1.5), zorder=5)
    label(CX + DW + 0.18, Y['dbest'] + 0.28, 'No', color='#b91c1c', bold=True, ha='left')
    # vertical segment down on right rail
    ax.plot([RX, RX], [Y['dbest'], Y['dall']], color='#b91c1c', lw=1.5, zorder=5)
    # horizontal back to diamond-all right tip
    ax.annotate('', xy=(CX + DW, Y['dall']), xytext=(RX, Y['dall']),
                arrowprops=dict(arrowstyle='->', color='#b91c1c', lw=1.5), zorder=5)

    # YES from diamond-all -> assign
    varrow(CX, Y['dall'] - DH, Y['assign'] + BH/2, color='#166534')
    label(CX - 0.25, (Y['dall'] - DH + Y['assign'] + BH/2)/2, 'Yes',
          color='#166534', bold=True, ha='right')

    # assign -> update-counters -> END
    varrow(CX, Y['assign'] - BH/2, Y['update'] + BH2/2)
    varrow(CX, Y['update'] - BH2/2, Y['END'] + BH/2)

    # NO from diamond-all: left -> up to loop-header level -> loop-header
    LX = CX - DW - 0.5   # left rail x
    ax.annotate('', xy=(LX, Y['dall']), xytext=(CX - DW, Y['dall']),
                arrowprops=dict(arrowstyle='->', color=LOOP_COLOR, lw=1.5), zorder=5)
    label(CX - DW - 0.18, Y['dall'] + 0.28, 'No', color='#b91c1c', bold=True, ha='right')
    # vertical segment up on left rail
    ax.plot([LX, LX], [Y['dall'], Y['loop']], color=LOOP_COLOR, lw=1.5, zorder=5)
    # horizontal right to loop-header left edge
    ax.annotate('', xy=(CX - BW/2, Y['loop']), xytext=(LX, Y['loop']),
                arrowprops=dict(arrowstyle='->', color=LOOP_COLOR, lw=1.5), zorder=5)

    # ── legend ────────────────────────────────────────────────────────────
    legend_items = [
        mpatches.Patch(facecolor='#dbeafe', edgecolor='#1d4ed8', label='Process step'),
        mpatches.Patch(facecolor='#ede9fe', edgecolor='#7c3aed', label='Loop control'),
        mpatches.Patch(facecolor='#fdf2f8', edgecolor='#9d174d', label='Fitness computation'),
        mpatches.Patch(facecolor='#fef9c3', edgecolor='#92400e', label='Decision'),
        mpatches.Patch(facecolor='#dcfce7', edgecolor='#15803d', label='Assignment / output'),
    ]
    ax.legend(handles=legend_items, loc='lower right', fontsize=7.5,
              framealpha=0.9, edgecolor='#94a3b8',
              bbox_to_anchor=(0.99, 0.005))

    # ── title ─────────────────────────────────────────────────────────────
    ax.text(CX, 27.85, 'CODLB Algorithm — Decision Flowchart',
            ha='center', va='center', fontsize=12, fontweight='bold')

    save(fig, 'fig0_flowchart.png')


# -- Figure 1: Performance comparison (4-panel) --------------------------------
def gen_performance(results):
    fig, axes = plt.subplots(2, 2, figsize=(13, 9))
    fig.suptitle('Fig. 1 — Algorithm Performance Comparison (30 Trials, 1,000 Tasks Each)',
                 fontsize=13, fontweight='bold', y=1.01)

    algs   = ALG_ORDER
    clrs   = [COLORS[a] for a in algs]
    labels = ['CODLB\n(Proposed)', 'Round\nRobin', 'Least\nConn.', 'Min-Min', 'Greedy\nCost']

    # (a) Cost box plot
    ax = axes[0, 0]
    bp = ax.boxplot([results[a]['costs'] for a in algs], patch_artist=True,
                    medianprops=dict(color='black', linewidth=2))
    for patch, c in zip(bp['boxes'], clrs):
        patch.set_facecolor(c); patch.set_alpha(0.75)
    ax.set_xticklabels(labels)
    ax.set_ylabel('Total Allocation Cost ($)')
    ax.set_title('(a) Cost Distribution')

    # (b) Load variance
    ax = axes[0, 1]
    bp2 = ax.boxplot([results[a]['load_var'] for a in algs], patch_artist=True,
                     medianprops=dict(color='black', linewidth=2))
    for patch, c in zip(bp2['boxes'], clrs):
        patch.set_facecolor(c); patch.set_alpha(0.75)
    ax.set_xticklabels(labels)
    ax.set_ylabel('Load Variance (resource utilisation)')
    ax.set_title('(b) Load Balance (lower = better)')

    # (c) Per-trial cost trend
    ax = axes[1, 0]
    x = np.arange(1, 31)
    for a in algs:
        ax.plot(x, results[a]['costs'], color=COLORS[a], label=a, linewidth=1.2, alpha=0.85)
    ax.set_xlabel('Trial number')
    ax.set_ylabel('Total Allocation Cost ($)')
    ax.set_title('(c) Cost Trend Across 30 Trials')
    ax.legend(fontsize=8, loc='upper right')

    # (d) Mean cost bar chart with error bars
    ax = axes[1, 1]
    means = [np.mean(results[a]['costs']) for a in algs]
    stds  = [np.std(results[a]['costs'])  for a in algs]
    xpos  = np.arange(len(algs))
    bars  = ax.bar(xpos, means, color=clrs, alpha=0.78, edgecolor='black', linewidth=0.8)
    ax.errorbar(xpos, means, yerr=stds, fmt='none', color='black', capsize=4, linewidth=1.2)
    for bar, mean in zip(bars, means):
        ax.text(bar.get_x() + bar.get_width()/2, mean + max(stds)*0.05,
                f'${mean:.0f}', ha='center', va='bottom', fontsize=8.5, fontweight='bold')
    ax.set_xticks(xpos); ax.set_xticklabels(labels)
    ax.set_ylabel('Mean Total Cost ($)')
    ax.set_title('(d) Mean Cost ± Std Dev')

    plt.tight_layout()
    save(fig, 'performance_comparison.png')


# -- Figure 2: Load distribution pie + bar ------------------------------------
def gen_load_distribution(results):
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    fig.suptitle('Fig. 2 — Resource Utilisation Distribution Across Providers',
                 fontsize=13, fontweight='bold')

    # Simulate one representative run with fixed seed
    tasks     = generate_tasks(1000, seed=999)
    prov_codlb = make_providers(); bal_codlb = CODLB(prov_codlb)
    prov_rr    = make_providers(); bal_rr    = RoundRobin(prov_rr)
    prov_gc    = make_providers(); bal_gc    = GreedyCost(prov_gc)
    for t in tasks:
        bal_codlb.allocate(t); bal_rr.allocate(t); bal_gc.allocate(t)

    provider_names = [p.name for p in prov_codlb]
    loads_codlb = [p.get_load() for p in prov_codlb]
    loads_rr    = [p.get_load() for p in prov_rr]
    loads_gc    = [p.get_load() for p in prov_gc]

    # (a) Grouped bar – normalised load per provider
    ax = axes[0]
    x = np.arange(3); w = 0.25
    ax.bar(x - w,   loads_codlb, w, label='CODLB',       color=COLORS['CODLB'],       alpha=0.8, edgecolor='black', lw=0.7)
    ax.bar(x,       loads_rr,    w, label='Round Robin',  color=COLORS['Round Robin'], alpha=0.8, edgecolor='black', lw=0.7)
    ax.bar(x + w,   loads_gc,    w, label='Greedy Cost',  color=COLORS['Greedy Cost'], alpha=0.8, edgecolor='black', lw=0.7)
    ax.set_xticks(x); ax.set_xticklabels(provider_names)
    ax.set_ylabel('Normalised Resource Utilisation')
    ax.set_title('(a) Per-Provider Load — Representative Trial')
    ax.legend()
    ax.set_ylim(0, min(max(loads_gc)*1.25, 1.1))

    # (b) Pie charts of task-allocation share for CODLB
    ax = axes[1]
    cnt = {}
    for h in bal_codlb.history:
        cnt[h['provider']] = cnt.get(h['provider'], 0) + 1
    pnames = list(cnt.keys()); counts = list(cnt.values())
    pie_colors = ['#1a6faf', '#c0392b', '#27ae60'][:len(pnames)]
    wedges, texts, auto = ax.pie(counts, labels=pnames, autopct='%1.1f%%',
                                  colors=pie_colors, startangle=90,
                                  wedgeprops=dict(edgecolor='white', linewidth=1.5))
    for t in auto: t.set_fontsize(10); t.set_fontweight('bold')
    ax.set_title('(b) CODLB Task Allocation Share\n(1,000-task representative trial)')

    plt.tight_layout()
    save(fig, 'load_distribution.png')


# -- Figure 3: Cost breakdown per provider ------------------------------------─
def gen_cost_breakdown():
    tasks = generate_tasks(1000, seed=999)
    prov  = make_providers()
    bal   = CODLB(prov)
    for t in tasks:
        bal.allocate(t)

    # Per-provider cost and resource-type breakdown
    cost_by_prov = {}
    for h in bal.history:
        cost_by_prov[h['provider']] = cost_by_prov.get(h['provider'], 0) + h['cost']

    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    fig.suptitle('Fig. 3 — Cost Breakdown by Provider (CODLB, Representative Trial)',
                 fontsize=13, fontweight='bold')

    # (a) Total cost per provider
    ax = axes[0]
    pnames = list(cost_by_prov.keys()); costs = list(cost_by_prov.values())
    bars = ax.bar(pnames, costs,
                  color=['#1a6faf', '#c0392b', '#27ae60'][:len(pnames)],
                  alpha=0.8, edgecolor='black', linewidth=0.8)
    for bar, v in zip(bars, costs):
        ax.text(bar.get_x() + bar.get_width()/2, v + max(costs)*0.01,
                f'${v:.2f}', ha='center', va='bottom', fontsize=10, fontweight='bold')
    ax.set_ylabel('Total Cost ($)')
    ax.set_title('(a) Total Allocation Cost per Provider')

    # (b) Resource-type cost breakdown stacked
    ax = axes[1]
    task_map = {p.name: {'cpu':[], 'mem':[], 'stor':[], 'net':[]} for p in prov}
    for h in bal.history:
        pass  # we need per-task breakdown — recompute
    # Recompute from scratch with per-resource tracking
    prov2 = make_providers()
    cpu_c = {p.name: 0.0 for p in prov2}
    mem_c = {p.name: 0.0 for p in prov2}
    stor_c= {p.name: 0.0 for p in prov2}
    net_c = {p.name: 0.0 for p in prov2}
    bal2  = CODLB(prov2)
    for t in tasks:
        p = bal2.allocate(t)
        cpu_c[p.name]  += t.cpu  * p.cpu_cost  * t.duration
        mem_c[p.name]  += t.mem  * p.mem_cost  * t.duration
        stor_c[p.name] += t.stor * p.stor_cost * t.duration
        net_c[p.name]  += t.network * p.net_cost

    pnames2 = [p.name for p in prov2]
    x = np.arange(len(pnames2))
    ax.bar(x, [cpu_c[p]  for p in pnames2], label='CPU',     color='#1a6faf', alpha=0.85)
    ax.bar(x, [mem_c[p]  for p in pnames2], label='Memory',  color='#27ae60', alpha=0.85,
           bottom=[cpu_c[p] for p in pnames2])
    bot2 = [cpu_c[p]+mem_c[p] for p in pnames2]
    ax.bar(x, [stor_c[p] for p in pnames2], label='Storage', color='#e67e22', alpha=0.85,
           bottom=bot2)
    bot3 = [bot2[i]+stor_c[pnames2[i]] for i in range(len(pnames2))]
    ax.bar(x, [net_c[p]  for p in pnames2], label='Network', color='#c0392b', alpha=0.85,
           bottom=bot3)
    ax.set_xticks(x); ax.set_xticklabels(pnames2)
    ax.set_ylabel('Cost ($)')
    ax.set_title('(b) Cost by Resource Type per Provider')
    ax.legend(loc='upper right')

    plt.tight_layout()
    save(fig, 'cost_breakdown.png')


# -- Figure 4: Statistical significance --------------------------------------─
def gen_statistical(results):
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    fig.suptitle('Fig. 4 — Statistical Significance Analysis (Paired t-Tests vs CODLB)',
                 fontsize=13, fontweight='bold')

    codlb_costs = results['CODLB']['costs']
    comparisons = [a for a in ALG_ORDER if a != 'CODLB']

    p_vals, t_vals, savings = [], [], []
    for a in comparisons:
        t_stat, p_val = stats.ttest_rel(results[a]['costs'], codlb_costs)
        t_vals.append(abs(t_stat))
        p_vals.append(p_val)
        savings.append((np.mean(results[a]['costs']) - np.mean(codlb_costs))
                       / np.mean(results[a]['costs']) * 100)

    # (a) p-value bar chart
    ax = axes[0]
    clrs = [COLORS[a] for a in comparisons]
    bars = ax.bar(range(len(comparisons)), p_vals, color=clrs, alpha=0.78,
                  edgecolor='black', linewidth=0.8)
    ax.axhline(0.05, color='red', linestyle='--', linewidth=1.5, label='p = 0.05 threshold')
    ax.set_xticks(range(len(comparisons)))
    ax.set_xticklabels([a.replace(' ', '\n') for a in comparisons])
    ax.set_ylabel('p-value (paired t-test)')
    ax.set_title('(a) p-values: CODLB vs Each Baseline')
    ax.legend()
    for i, (bar, pv) in enumerate(zip(bars, p_vals)):
        ax.text(bar.get_x() + bar.get_width()/2,
                pv + 0.0005,
                f'p={pv:.4f}', ha='center', va='bottom', fontsize=8.5, fontweight='bold')

    # (b) Cost savings vs each baseline
    ax = axes[1]
    bars2 = ax.bar(range(len(comparisons)), savings, color=clrs, alpha=0.78,
                   edgecolor='black', linewidth=0.8)
    ax.axhline(0, color='black', linewidth=0.8)
    ax.set_xticks(range(len(comparisons)))
    ax.set_xticklabels([a.replace(' ', '\n') for a in comparisons])
    ax.set_ylabel('Cost Saving (%)\n(positive = CODLB is cheaper)')
    ax.set_title('(b) CODLB Cost Savings vs Baselines')
    for i, (bar, sv) in enumerate(zip(bars2, savings)):
        ypos = sv + 0.05 if sv >= 0 else sv - 0.2
        ax.text(bar.get_x() + bar.get_width()/2, ypos,
                f'{sv:+.2f}%', ha='center', va='bottom', fontsize=9, fontweight='bold')

    plt.tight_layout()
    save(fig, 'fig4_statistical.png')
    return p_vals, t_vals, savings, comparisons


# -- Figure 5: Weight sensitivity --------------------------------------------─
def gen_sensitivity(sens_data, config_labels):
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))
    fig.suptitle('Fig. 5 — CODLB Weight Sensitivity Analysis',
                 fontsize=13, fontweight='bold')

    sens_colors = ['#1a6faf', '#c0392b', '#27ae60', '#8e44ad']
    means_cost = [np.mean(sens_data[l]['costs'])    for l in config_labels]
    means_lv   = [np.mean(sens_data[l]['load_var']) for l in config_labels]
    std_cost   = [np.std(sens_data[l]['costs'])     for l in config_labels]
    std_lv     = [np.std(sens_data[l]['load_var'])  for l in config_labels]
    x = np.arange(len(config_labels))

    ax = axes[0]
    bars = ax.bar(x, means_cost, color=sens_colors, alpha=0.8, edgecolor='black', lw=0.8)
    ax.errorbar(x, means_cost, yerr=std_cost, fmt='none', color='black', capsize=4)
    ax.set_xticks(x)
    ax.set_xticklabels([l.replace(' (', '\n(') for l in config_labels], fontsize=8.5)
    ax.set_ylabel('Mean Total Cost ($)')
    ax.set_title('(a) Cost vs Weight Configuration')
    for bar, v in zip(bars, means_cost):
        ax.text(bar.get_x() + bar.get_width()/2, v + max(std_cost)*0.1,
                f'${v:.0f}', ha='center', va='bottom', fontsize=8.5)

    ax = axes[1]
    bars2 = ax.bar(x, means_lv, color=sens_colors, alpha=0.8, edgecolor='black', lw=0.8)
    ax.errorbar(x, means_lv, yerr=std_lv, fmt='none', color='black', capsize=4)
    ax.set_xticks(x)
    ax.set_xticklabels([l.replace(' (', '\n(') for l in config_labels], fontsize=8.5)
    ax.set_ylabel('Mean Load Variance')
    ax.set_title('(b) Load Variance vs Weight Configuration')

    plt.tight_layout()
    save(fig, 'fig5_sensitivity.png')


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    print('=' * 65)
    print('CODLB — Cost-Optimised Dynamic Load Balancer')
    print('Christ University, Bangalore | Namratha R')
    print('=' * 65)

    # -- 1. Main experiments (30 runs) ----------------------------------------
    results = run_experiments(n_tasks=1000, n_runs=30)

    # -- 2. Weight sensitivity (10 runs) --------------------------------------
    print('\nRunning weight sensitivity analysis ...')
    sens_data, config_labels = weight_sensitivity(n_tasks=1000, n_runs=10)

    # -- 3. Statistical tests ------------------------------------------------─
    print('\n-- Statistical Significance (paired t-test, CODLB vs others) --')
    for a in ALG_ORDER:
        if a == 'CODLB': continue
        t, p = stats.ttest_rel(results[a]['costs'], results['CODLB']['costs'])
        saving = (np.mean(results[a]['costs']) - np.mean(results['CODLB']['costs'])) \
                 / np.mean(results[a]['costs']) * 100
        print(f'  vs {a:<18}  t={abs(t):.3f}  p={p:.6f}  saving={saving:+.2f}%')

    # -- 4. Summary table ----------------------------------------------------─
    print('\n-- Aggregate Results ------------------------------------------')
    rows = []
    for a in ALG_ORDER:
        costs = results[a]['costs']
        lvs   = results[a]['load_var']
        tms   = results[a]['times_ms']
        rows.append({
            'Algorithm':      a,
            'Mean Cost ($)':  f'{np.mean(costs):.2f}',
            'Std Dev ($)':    f'{np.std(costs):.2f}',
            'Mean Time (ms)': f'{np.mean(tms):.2f}',
            'Load Variance':  f'{np.mean(lvs):.6f}',
        })
    df = pd.DataFrame(rows)
    print(df.to_string(index=False))
    df.to_csv(os.path.join(SAVE_PATH, 'performance_metrics.csv'), index=False)

    # -- 5. Figures ----------------------------------------------------------─
    print('\nGenerating figures ...')
    gen_flowchart()
    gen_performance(results)
    gen_load_distribution(results)
    gen_cost_breakdown()
    p_vals, t_vals, savings, comparisons = gen_statistical(results)
    gen_sensitivity(sens_data, config_labels)

    print('\n' + '=' * 65)
    print('All figures and metrics saved to:', SAVE_PATH)
    print('=' * 65)
