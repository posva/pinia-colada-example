<script setup lang="ts">
import ArtworkCard from '@/components/ArtworkCard.vue'
import { getArtworkList } from '@/api/artworks'
import { useQuery } from '@pinia/colada'

const { state: artworks } = useQuery({
  staleTime: 1000 * 60 * 60, // 1 hour
  key: () => ['artwork-list', { page: 1, limit: 25 }],
  async query() {
    // TODO: Add pagination
    return getArtworkList({ page: 1, limit: 25 })
  },
})
</script>

<template>
  <main class="px-2 lg:px-6 max-w-3xl lg:max-w-6xl mx-auto">
    <h1 class="text-4xl font-serif">Recent artwork</h1>

    <hr class="mb-8" />

    <div v-if="artworks.status === 'pending'" class="loader mx-auto my-4"></div>
    <div v-else-if="artworks.status === 'error'">
      <h2>Unexpected Error</h2>
      <pre>{{ artworks.error }}</pre>
    </div>
    <div class="masonry" v-else>
      <ArtworkCard
        v-for="artwork in artworks.data.data"
        :key="artwork.id"
        :artwork="artwork"
      />
    </div>
  </main>
</template>
