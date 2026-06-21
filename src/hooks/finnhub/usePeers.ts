import { useQuery } from '@tanstack/react-query'
import { fetchPeers } from '../../lib/finnhub/endpoints'
import { FINNHUB_KEYS } from './queryKeys'

export function usePeers(symbol: string | null) {
  return useQuery({
    queryKey: FINNHUB_KEYS.peers(symbol ?? ''),
    queryFn: () => fetchPeers(symbol!),
    enabled: !!symbol,
  })
}
