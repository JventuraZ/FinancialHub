import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { useCandles } from '../../hooks/finnhub/useCandles'
import type { ChartType, Timeframe } from '../../types/domain'
import { ENV } from '../../config/env'
import { TimeframeSelector } from './TimeframeSelector'
import { ChartTypeSwitcher } from './ChartTypeSwitcher'
import { StockLineChart } from './StockLineChart'
import { CandlestickChart } from './CandlestickChart'
import { Spinner } from '../ui/Spinner'
import { ErrorMessage } from '../ui/ErrorMessage'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

interface Props {
  symbol: string
}

export function ChartContainer({ symbol }: Props) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1M')
  const [chartType, setChartType] = useState<ChartType>('line')
  const { data, isLoading, isError } = useCandles(symbol, timeframe)

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ChartTypeSwitcher value={chartType} onChange={setChartType} />
          {ENV.USE_MOCK_CANDLES && (
            <Badge variant="blue" className="gap-1">
              <FlaskConical size={12} />
              Dados simulados
            </Badge>
          )}
        </div>
        <TimeframeSelector value={timeframe} onChange={setTimeframe} />
      </div>
      <div className="h-72 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}
        {isError && <ErrorMessage message="Failed to load chart data." />}
        {data && !isLoading && (
          chartType === 'line'
            ? <StockLineChart data={data} />
            : <CandlestickChart data={data} />
        )}
      </div>
    </Card>
  )
}
