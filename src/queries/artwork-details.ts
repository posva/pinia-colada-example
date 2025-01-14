import { getArtwork, searchArtworks } from '@/api/artworks'
import { defineQuery, useQuery } from '@pinia/colada'
import { useRoute } from 'vue-router'

export const useArtworkDetails = defineQuery(() => {
  const to = useRoute('/artworks/[artworkId]')
  return useQuery({
    staleTime: 1000 * 60 * 60, // 1 hour
    key: () => ['artwork-details', to.params.artworkId],
    async query() {
      return getArtwork(to.params.artworkId)
    },
  })
})

export const useArtworkRelatedArtworks = defineQuery(() => {
  const to = useRoute('/artworks/[artworkId]')
  const details = useArtworkDetails()

  return useQuery({
    staleTime: 1000 * 60 * 60, // 1 hour
    key: () => ['artwork-related-artworks', to.params.artworkId],
    async query() {
      const artwork = await details.refresh(true)
      const relatedArtworks = await searchArtworks({
        query: {
          term: {
            // TODO: might be undefined
            style_id: artwork.data!.style_ids[0],
            // TODO: exclude itself
          },
        },
        limit: 13,
      })
      return {
        ...relatedArtworks,
        // remove ourself from the related artworks
        data: relatedArtworks.data.filter((a) => a.id !== artwork.data!.id),
      }
    },
  })
})
