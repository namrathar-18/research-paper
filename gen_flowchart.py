import os, numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch

SAVE_PATH = r'D:\Projects\research-paper'

def save(fig, name):
    path = os.path.join(SAVE_PATH, name)
    fig.savefig(path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print('Saved:', name)

fig = plt.figure(figsize=(7.5, 14))
ax  = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, 10)
ax.set_ylim(0, 28)
ax.axis('off')
fig.patch.set_facecolor('white')

CX = 5.0
ARROW_COLOR = '#1e293b'
LOOP_COLOR  = '#6d28d9'

def rect(cx, cy, w, h, lbl, fc, ec, fs=9.2, bold=False, color='black',
         style='round,pad=0.08'):
    patch = FancyBboxPatch((cx - w/2, cy - h/2), w, h,
                           boxstyle=style, facecolor=fc, edgecolor=ec,
                           linewidth=1.6, zorder=3)
    ax.add_patch(patch)
    ax.text(cx, cy, lbl, ha='center', va='center', fontsize=fs,
            fontweight='bold' if bold else 'normal',
            multialignment='center', color=color, zorder=4, linespacing=1.5)

def diamond(cx, cy, hw, hh, lbl, fc='#fef9c3', ec='#92400e', fs=9.0):
    pts = np.array([[cx, cy+hh], [cx+hw, cy], [cx, cy-hh], [cx-hw, cy]])
    p = plt.Polygon(pts, closed=True, facecolor=fc, edgecolor=ec,
                    linewidth=1.6, zorder=3)
    ax.add_patch(p)
    ax.text(cx, cy, lbl, ha='center', va='center', fontsize=fs,
            multialignment='center', zorder=4, linespacing=1.5)

def varrow(x, y1, y2, color=ARROW_COLOR):
    ax.annotate('', xy=(x, y2), xytext=(x, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=1.5), zorder=5)

def lbl(x, y, txt, color='black', fs=8.5, bold=False, ha='center'):
    ax.text(x, y, txt, ha=ha, va='center', fontsize=fs,
            color=color, fontweight='bold' if bold else 'normal', zorder=6)

Y = {
    'START':    27.0,
    'arrive':   25.4,
    'parse':    23.7,
    'init':     22.0,
    'loop':     20.2,
    'cost':     18.5,
    'normcost': 16.7,
    'load':     14.9,
    'normprio': 13.1,
    'fitness':  11.3,
    'dbest':     9.5,
    'updbest':   7.9,
    'dall':      6.3,
    'assign':    4.5,
    'update':    2.9,
    'END':       1.3,
}

BW=6.2; BH=1.0; BH2=1.2; DH=1.05; DW=3.2

# ---- nodes ------------------------------------------------------------------
rect(CX, Y['START'],    2.8, BH,  'START',
     fc='#134e4a', ec='#0f3d38', fs=10.5, bold=True, color='white',
     style='round,pad=0.15')

B_FC='#dbeafe'; B_EC='#1d4ed8'
rect(CX, Y['arrive'],   BW,  BH,  'Task T arrives at the multi-cloud scheduler gateway', B_FC, B_EC)
rect(CX, Y['parse'],    BW,  BH2, 'Parse task attributes\n(cpu, mem, stor, net, priority, duration)', B_FC, B_EC)
rect(CX, Y['init'],     BW,  BH,  'Initialise:  best_fitness = INF,   P* = None', B_FC, B_EC)
rect(CX, Y['loop'],     BW,  BH,  'For each provider Pi in {AWS, Azure, GCP}',
     '#ede9fe', '#7c3aed')

C_FC='#fdf2f8'; C_EC='#9d174d'
rect(CX, Y['cost'],     BW,  BH,  'Compute raw cost:  c_i = Cost(T, Pi)', C_FC, C_EC)
rect(CX, Y['normcost'], BW,  BH2, 'Min-max normalise cost:\nC_n = (c_i - min_c) / (max_c - min_c)', C_FC, C_EC)
rect(CX, Y['load'],     BW,  BH2, 'Read normalised provider load:\nL_i = (cpu_used/1000 + mem_used/2000) / 2', C_FC, C_EC)
rect(CX, Y['normprio'], BW,  BH2, 'Normalise priority & response time:\nP_n = (1/prio-0.2)/0.8,   RT_n = dur*(1+L)/48', C_FC, C_EC)
rect(CX, Y['fitness'],  BW,  BH2, 'Compute fitness score:\nF = 0.4*C_n + 0.3*L_i + 0.2*P_n + 0.1*RT_n', C_FC, C_EC)

diamond(CX, Y['dbest'],  DW, DH, 'F < best_fitness?')
rect(CX, Y['updbest'],  BW,  BH,  'Update:  best_fitness = F,   P* = Pi', '#dcfce7', '#15803d')
diamond(CX, Y['dall'],   DW, DH, 'All providers\nevaluated?')

rect(CX, Y['assign'],   BW,  BH,  'Allocate task to P*  (selected provider)',   '#dcfce7', '#15803d')
rect(CX, Y['update'],   BW,  BH2, 'Update P* resource counters:\ncpu, mem, stor, net, task_count', '#dcfce7', '#15803d')
rect(CX, Y['END'],      2.8, BH,  'END',
     fc='#134e4a', ec='#0f3d38', fs=10.5, bold=True, color='white',
     style='round,pad=0.15')

# ---- main spine arrows -------------------------------------------------------
pairs = [
    ('START',    BH/2,   'arrive',   BH/2),
    ('arrive',   BH/2,   'parse',    BH2/2),
    ('parse',    BH2/2,  'init',     BH/2),
    ('init',     BH/2,   'loop',     BH/2),
    ('loop',     BH/2,   'cost',     BH/2),
    ('cost',     BH/2,   'normcost', BH2/2),
    ('normcost', BH2/2,  'load',     BH2/2),
    ('load',     BH2/2,  'normprio', BH2/2),
    ('normprio', BH2/2,  'fitness',  BH2/2),
    ('fitness',  BH2/2,  'dbest',    DH),
]
for a, da, b, db in pairs:
    varrow(CX, Y[a]-da, Y[b]+db)

# YES: dbest -> updbest
varrow(CX, Y['dbest']-DH, Y['updbest']+BH/2, color='#166534')
lbl(CX-0.28, (Y['dbest']-DH + Y['updbest']+BH/2)/2, 'Yes',
    color='#166534', bold=True, ha='right')

# updbest -> dall
varrow(CX, Y['updbest']-BH/2, Y['dall']+DH)

# NO from dbest: right rail to dall right tip
RX = CX + DW + 0.5
ax.annotate('', xy=(RX, Y['dbest']), xytext=(CX+DW, Y['dbest']),
            arrowprops=dict(arrowstyle='->', color='#b91c1c', lw=1.5), zorder=5)
lbl(CX+DW+0.2, Y['dbest']+0.3, 'No', color='#b91c1c', bold=True, ha='left')
ax.plot([RX, RX], [Y['dbest'], Y['dall']], color='#b91c1c', lw=1.5, zorder=5)
ax.annotate('', xy=(CX+DW, Y['dall']), xytext=(RX, Y['dall']),
            arrowprops=dict(arrowstyle='->', color='#b91c1c', lw=1.5), zorder=5)

# YES: dall -> assign
varrow(CX, Y['dall']-DH, Y['assign']+BH/2, color='#166534')
lbl(CX-0.28, (Y['dall']-DH + Y['assign']+BH/2)/2, 'Yes',
    color='#166534', bold=True, ha='right')

# assign -> update -> END
varrow(CX, Y['assign']-BH/2, Y['update']+BH2/2)
varrow(CX, Y['update']-BH2/2, Y['END']+BH/2)

# NO from dall: left rail back up to loop
LX = CX - DW - 0.5
ax.annotate('', xy=(LX, Y['dall']), xytext=(CX-DW, Y['dall']),
            arrowprops=dict(arrowstyle='->', color=LOOP_COLOR, lw=1.5), zorder=5)
lbl(CX-DW-0.2, Y['dall']+0.3, 'No', color='#b91c1c', bold=True, ha='right')
ax.plot([LX, LX], [Y['dall'], Y['loop']], color=LOOP_COLOR, lw=1.5, zorder=5)
ax.annotate('', xy=(CX-BW/2, Y['loop']), xytext=(LX, Y['loop']),
            arrowprops=dict(arrowstyle='->', color=LOOP_COLOR, lw=1.5), zorder=5)

# ---- legend -----------------------------------------------------------------
legend_items = [
    mpatches.Patch(facecolor='#dbeafe', edgecolor='#1d4ed8', label='Process step'),
    mpatches.Patch(facecolor='#ede9fe', edgecolor='#7c3aed', label='Loop control'),
    mpatches.Patch(facecolor='#fdf2f8', edgecolor='#9d174d', label='Fitness computation'),
    mpatches.Patch(facecolor='#fef9c3', edgecolor='#92400e', label='Decision'),
    mpatches.Patch(facecolor='#dcfce7', edgecolor='#15803d', label='Assignment / output'),
]
ax.legend(handles=legend_items, loc='lower right', fontsize=7.5,
          framealpha=0.9, edgecolor='#94a3b8', bbox_to_anchor=(0.99, 0.005))

ax.text(CX, 27.85, 'CODLB Algorithm — Decision Flowchart',
        ha='center', va='center', fontsize=12, fontweight='bold')

save(fig, 'fig0_flowchart.png')
