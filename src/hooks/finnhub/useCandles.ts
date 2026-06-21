import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCandles } from '../../lib/finnhub/endpoints'
import { FINNHUB_KEYS } from './queryKeys'
import { timeframeToRange } from '../../lib/utils/date'
import { mapCandles } from '../../lib/utils/mappers'
import type { Timeframe } from '../../types/domain'

export function useCandles(symbol: string | null, timeframe: Timeframe) {
  const { from, to, resolution } = useMemo(() => timeframeToRange(timeframe), [timeframe])
  return useQuery({
    queryKey: FINNHUB_KEYS.candles(symbol ?? '', resolution, from, to),
    queryFn: () => fetchCandles(symbol!, resolution, from, to),
    select: (data) => mapCandles(data, resolution),
    enabled: !!symbol,
  })
}
