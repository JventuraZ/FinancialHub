import { useQuery } from '@tanstack/react-query'
import { fetchMetrics } from '../../lib/finnhub/endpoints'
import { FINNHUB_KEYS } from './queryKeys'
import { mapMetricsToDisplay } from '../../lib/utils/mappers'

export function useMetrics(symbol: string | null) {
  return useQuery({
    queryKey: FINNHUB_KEYS.metrics(symbol ?? ''),
    queryFn: () => fetchMetrics(symbol!),
    select: mapMetricsToDisplay,
    enabled: !!symbol,
  })
}
