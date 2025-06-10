import { searchArtworks, type ArtworkColor } from '@/api/artworks'
import { useRouteQuery, useRouteQueryValue } from '@/composables/router'
import { defineQuery, useQuery } from '@pinia/colada'
import { useRoute } from 'vue-router'

export const useArtworkSearchResults = defineQuery(() => {
  const route = useRoute()

  const searchText = useRouteQueryValue<string>('q')
  const page = useRouteQueryValue('page', 1)

  const filters = useRouteQuery<{
    is_public_domain?: boolean
    // color?: ArtworkColor
    place_ids?: string
    date_range?: [start: string, end: string]
  }>(
    {
      is_public_domain: undefined,
      // color: undefined,
      place_ids: undefined,
      date_range: undefined,
    },
    {
      deleteIf(value, key) {
        // if (key === 'color') {
        //   return !value
        // }
        if (key === 'is_public_domain') {
          return value == null
        }
        return false
      },
    }
  )

  function resetFilters() {
    filters.value = {
      // color: undefined,
      is_public_domain: undefined,
      date_range: undefined,
      place_ids: undefined,
    }
    page.value = 1
  }

  const query = useQuery({
    staleTime: 1000 * 60 * 60, // 1 hour
    key: () => [
      'artwork-search',
      {
        q: route.query.q,
        limit: 12,
        ...filters.value,
      },
    ],
    async query() {
      // TODO: build the query if any value is not undefined
      const searchQuery = undefined
      return searchArtworks({
        q: String(route.query.q),
        page: page.value,
        limit: 12,
        query: searchQuery,
        // query: {
        // term: {
        //   is_public_domain: filters.value.is_public_domain,
        // },
        // },
      })
    },
    placeholderData: (oldData) => oldData,
  })

  function hasNextPage() {
    const state = query.state.value
    const p = page.value
    return (
      state.data && Number.isFinite(p) && p < state.data.pagination.total_pages
    )
  }

  function nextPage() {
    if (page.value == null || !hasNextPage()) return
    page.value++
  }

  function previousPage() {
    if (page.value == null || page.value <= 1) return
    page.value--
  }

  function hasPreviousPage() {
    const state = query.state.value
    return state.data && Number.isFinite(page) && page.value > 1
  }

  return {
    ...query,
    searchText,
    page,
    filters,
    resetFilters,
    hasNextPage,
    nextPage,
    previousPage,
    hasPreviousPage,
  }
})
