<script lang="ts">
  import { moodColor } from '$lib/utils';
  import type { DailySummary } from '$lib/types';

  export let data: DailySummary[] = [];
  export let height = 160;

  const W = 600;
  const H = height;
  const padL = 28;
  const padR = 12;
  const padT = 12;
  const padB = 28;

  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  $: points = data.filter((d) => d.avg_mood !== null);

  function xPos(i: number): number {
    if (points.length <= 1) return padL + chartW / 2;
    return padL + (i / (points.length - 1)) * chartW;
  }

  function yPos(val: number): number {
    return padT + chartH - ((val - 1) / 9) * chartH;
  }

  $: polyline = points
    .map((p, i) => `${xPos(i)},${yPos(p.avg_mood ?? 0)}`)
    .join(' ');

  // Y-axis labels: 2, 4, 6, 8, 10
  const yLabels = [2, 4, 6, 8, 10];

  function shortDate(iso: string): string {
    const [,m,d] = iso.split('-');
    return `${+m}/${+d}`;
  }
</script>

{#if points.length === 0}
  <div class="empty-state" style="padding: 24px; font-size: 0.85rem;">No chart data yet</div>
{:else}
  <div class="chart-wrapper" style="height: {H}px;">
    <svg viewBox="0 0 {W} {H}" preserveAspectRatio="none" class="chart-svg">
      <!-- Y-axis grid lines -->
      {#each yLabels as y}
        {@const yp = yPos(y)}
        <line x1={padL} y1={yp} x2={W - padR} y2={yp} stroke="rgba(255,255,255,0.07)" stroke-width="1" />
        <text x={padL - 4} y={yp + 4} text-anchor="end" font-size="10" fill="#64748b">{y}</text>
      {/each}

      <!-- Area fill under the line -->
      {#if points.length > 1}
        <polyline
          points="{padL},{padT + chartH} {polyline} {xPos(points.length - 1)},{padT + chartH}"
          fill="rgba(99,102,241,0.12)"
          stroke="none"
        />
        <!-- Line -->
        <polyline
          points={polyline}
          fill="none"
          stroke="#6366f1"
          stroke-width="2.5"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      {/if}

      <!-- Points -->
      {#each points as p, i}
        {@const mood = p.avg_mood ?? 0}
        <circle
          cx={xPos(i)}
          cy={yPos(mood)}
          r="5"
          fill={moodColor(Math.round(mood))}
          stroke="var(--bg-primary)"
          stroke-width="2"
        />
        <!-- X-axis label -->
        <text
          x={xPos(i)}
          y={H - 4}
          text-anchor="middle"
          font-size="9"
          fill="#64748b"
        >{shortDate(p.date)}</text>
      {/each}
    </svg>
  </div>
{/if}

<style>
  .chart-wrapper {
    width: 100%;
    overflow: hidden;
  }

  .chart-svg {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
