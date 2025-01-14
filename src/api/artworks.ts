import { useSessionStorage } from '@vueuse/core'
import { mande } from 'mande'
import { reactive } from 'vue'

const artworks = mande('https://api.artic.edu/api/v1/artworks')

artworks.options.headers['AIC-User-Agent'] =
  'Eduardo (pinia-colada-example@esm.dev)'

// This is ok because we are an SPA
export const successRate = useSessionStorage<number>('aic-success-rate', 1)
export const delay = useSessionStorage<number>('aic-delay', 0)
export const existingDelays = reactive(new Map<symbol, Date>())

async function simulateNetworkIssues() {
  const key = Symbol()
  existingDelays.set(key, new Date())
  await new Promise((resolve) => setTimeout(resolve, delay.value))
  existingDelays.delete(key)
  const success = Math.random() <= successRate.value
  if (!success) {
    throw new Error('Network error')
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface Config {
  iiif_url: string
  website_url: string
}

export interface LicenseInfo {
  license_text: string
  license_links: string[]
  version: string
}

export interface APIResponse<Data> {
  data: Data
  info: LicenseInfo
  config: Config
}

export interface Pagination {
  total: number
  limit: number
  offset: number
  total_pages: number
  current_page: number
  next_url: string
}

export interface APIResponsePaginated<Data> extends APIResponse<Data> {
  pagination: Pagination
}

export interface ArtworkThumbnail {
  lqip: string
  width: number
  height: number
  alt_text: string
}

export interface ArtworkColor {
  h: number
  l: number
  s: number
  percentage: number
  population: number
}

// list of fields to fetch from the API
const FIELDS =
  'id,title,artist_display,artist_titles,thumbnail,image_id,date_display,description,place_of_origin,dimensions,short_description,color,term_titles'

export interface ArtworkCardInfo {
  id: number
  title: string
  image_id: string | null
  image_url?: string | null
  thumbnail: ArtworkThumbnail | null
  date_display: string
  artist_display: string
  artist_titles: string[]
  place_of_origin: string
  description: string
  short_description: string | null
  dimensions: string
  color: ArtworkColor | null
  term_titles: string[]
}

export interface ArtworkSearchThumbnail {
  alt_text: string
  width: number
  lqip: string
  height: number
}

const SEARCH_FIELDS = FIELDS

/**
 * Get a list of artworks.
 * @param param0 - The pagination parameters
 */
export async function getArtworkList({
  page = 1,
  limit = 25,
}: PaginationParams = {}) {
  await simulateNetworkIssues()
  const response = await artworks.get<APIResponsePaginated<ArtworkCardInfo[]>>(
    '/',
    {
      query: {
        page,
        limit,
        fields: FIELDS,
      },
    }
  )
  return {
    ...response,
    data: response.data.map((artwork) => ({
      ...artwork,
      image_url:
        artwork.image_id &&
        generateImageURL(
          response.config.iiif_url,
          artwork.image_id,
          artwork.thumbnail?.width
        ),
    })),
  }
}

const ARTWORK_DETAILS_FIELDS = `${FIELDS},copyright_notice,artist_ids,medium_display,inscriptions,credit_line,main_reference_number,publication_history,provenance_text,exhibition_history,style_ids,is_public_domain`

export interface ArtworkDetails extends ArtworkCardInfo {
  copyright_notice: string | null
  artist_ids: number[]
  medium_display: string
  inscriptions: string | null
  credit_line: string | null
  main_reference_number: string
  publication_history: string | null
  provenance_text: string | null
  exhibition_history: string | null
  style_ids: string[]
  is_public_domain: boolean
}

export async function getArtwork(id: number | string) {
  await simulateNetworkIssues()
  const { data: artwork, config } = await artworks.get<
    APIResponse<ArtworkDetails>
  >(id, {
    query: { fields: ARTWORK_DETAILS_FIELDS },
  })
  return {
    ...artwork,
    image_url:
      artwork.image_id &&
      generateImageURL(
        config.iiif_url,
        artwork.image_id,
        artwork.thumbnail?.width
      ),
    publication_history: artwork.publication_history?.split('\n\n') ?? [],
    exhibition_history: artwork.exhibition_history?.split('\n\n') ?? [],
  }
}

export async function getArtworkImagesURL(artworksId: number[]) {
  await simulateNetworkIssues()
  const response = await artworks.get<
    APIResponse<Pick<ArtworkCardInfo, 'image_id' | 'id'>[]>
  >('/', {
    query: {
      ids: artworksId.join(','),
      fields: 'id,image_id',
    },
  })
  return response.data.map((artwork) => ({
    ...artwork,
    image_url: artwork.image_id
      ? generateImageURL(response.config.iiif_url, artwork.image_id, 400)
      : null,
  }))
}

export interface SearchParams extends PaginationParams {
  /**
   * Search based search
   */
  q?: string
  /**
   * Query based search (Elasicsearch query)
   */
  query?: unknown
}

export async function searchArtworks(query: SearchParams = {}) {
  await simulateNetworkIssues()
  // NOTE: the API seems to work without a query
  // if (typeof query !== 'string' || !query) return Promise.resolve({ data: [] })
  const response = await artworks.post<APIResponsePaginated<ArtworkCardInfo[]>>(
    '/search',
    {
      page: 1,
      limit: 10,
      fields: SEARCH_FIELDS,
      ...query,
    }
  )
  return {
    ...response,
    data: response.data.map((artwork) => ({
      ...artwork,
      image_url:
        artwork.image_id &&
        generateImageURL(response.config.iiif_url, artwork.image_id),
    })),
  }
}

function generateImageURL(iiifUrl: string, imageId: string, maxSize = 843) {
  return `${iiifUrl}/${imageId}/full/${sizeCloserTo(maxSize)},/0/default.jpg`
}

/**
 * Returns the closest size among [200, 400, 600, 843] to the given size. The size must be greater or equal than the returned size.
 * @param size - The size to compare
 */
function sizeCloserTo(size: number): number {
  if (size > 843) return 843
  if (size > 600) return 600
  if (size > 400) return 400
  return 200
}
