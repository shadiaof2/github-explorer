<template>
  <div class="chart-container">
    <h3 class="section-title">📊 语言占比</h3>
    <div ref="chartRef" class="chart" style="width: 100%; height: 300px;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { Repository } from '@/types'

const props = defineProps<{
  repos: Repository[]
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: any = null

const renderChart = () => {
  if (!chartRef.value || !props.repos.length) return
  
  // 统计语言
  const langMap: Record<string, number> = {}
  props.repos.forEach(repo => {
    const lang = repo.language || 'Unknown'
    langMap[lang] = (langMap[lang] || 0) + 1
  })
  
  // 过滤掉 Unknown
  const data = Object.entries(langMap)
    .filter(([name]) => name !== 'Unknown')
    .map(([name, value]) => ({ name, value }))
  
  if (data.length === 0) {
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
    chartRef.value.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted)">暂无语言数据</div>'
    return
  }
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption({
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {d}%' 
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: 'var(--text-primary)' }
    },
    series: [{
      type: 'pie',
      radius: '55%',
      center: ['50%', '50%'],
      data: data,
      label: {
        show: true,
        formatter: '{b}: {d}%',
        color: 'var(--text-secondary)'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  })
}

watch(() => props.repos, () => {
  setTimeout(() => renderChart(), 100)
}, { deep: true })

onMounted(() => {
  setTimeout(() => renderChart(), 200)
  window.addEventListener('resize', () => chartInstance?.resize())
})
</script>

<style scoped>
.chart-container {
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.chart {
  width: 100%;
  height: 300px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}
</style>