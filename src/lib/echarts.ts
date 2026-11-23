import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

/**
 * Modular ECharts registration.
 *
 * Importing the `echarts` barrel would ship every chart type (~1 MB). Registering
 * exactly what the template renders keeps the chart chunk scoped; adding a chart
 * type means adding one line here plus its component import.
 */
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
])

export { echarts }

export type ChartOption = echarts.EChartsCoreOption
