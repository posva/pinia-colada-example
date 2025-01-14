import { getArtworkList } from '@/api/artworks'

export const useArtworkList = defineColadaLoader({
  staleTime: 1000 * 60 * 60, // 1 hour
  key: () => ['artwork-list'],
  async query() {
    // TODO: Add pagination
    return getArtworkList({ page: 1, limit: 25 })
  },
})
