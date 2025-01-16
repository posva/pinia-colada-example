import { searchArtworks, type ArtworkColor } from '@/api/artworks'
import { useRouteQuery, useRouteQueryValue } from '@/composables/router'
import { defineQuery, useQuery } from '@pinia/colada'
import { useRoute } from 'vue-router'

export const useArtworkSearchResults = defineQuery(() => {
  const route = useRoute()

  const searchText = useRouteQueryValue<string>('q')

  const filters = useRouteQuery<{
    is_public_domain?: boolean
    // color: ArtworkColor
    place_ids: string
    date_range: [start: string, end: string]
    page: number
  }>(
    {
      is_public_domain: undefined,
      // color: undefined,
      place_ids: undefined,
      date_range: undefined,
      page: 1,
    },
    {
      deleteIf(value, key) {
        // if (key === 'color') {
        //   return !value
        // }
        if (key === 'is_public_domain') {
          return value == null
        }
        if (key === 'page') {
          const v = Number(value)
          return !Number.isFinite(v) || v <= 1
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
      page: 1,
    }
  }

  const query = useQuery({
    staleTime: 1000 * 60 * 60, // 1 hour
    key: () => [
      'artwork-search',
      { q: route.query.q, ...filters.value, limit: 12 },
    ],
    async query() {
      return searchArtworks({
        q: String(route.query.q),
        page: filters.value.page,
        limit: 12,
        term: {
          //   is_public_domain: filters.value.is_public_domain,
        },
      })
    },
    placeholderData: (oldData) => oldData,
  })

  function hasNextPage() {
    const state = query.state.value
    const page = Number(filters.value.page)
    return (
      state.data &&
      Number.isFinite(page) &&
      page < state.data.pagination.total_pages
    )
  }

  function nextPage() {
    if (filters.value.page == null || !hasNextPage()) return
    filters.value.page++
  }

  function previousPage() {
    if (filters.value.page == null || filters.value.page <= 1) return
    filters.value.page--
  }

  function hasPreviousPage() {
    const state = query.state.value
    const page = Number(filters.value.page)
    return state.data && Number.isFinite(page) && page > 1
  }

  return {
    ...query,
    searchText,
    filters,
    resetFilters,
    hasNextPage,
    nextPage,
    previousPage,
    hasPreviousPage,
  }
})
