<script lang="ts" setup>
import type { ArtworkCardInfo } from '@/api/artworks'
import { computed } from 'vue'

const props = defineProps<{
  artwork: ArtworkCardInfo
}>()

const aspectRatio = computed(() => {
  return `${props.artwork.thumbnail?.width ?? 1} / ${props.artwork.thumbnail?.height ?? 1}`
})
</script>

<template>
  <RouterLink
    :id="`${artwork.title}_${artwork.id}`"
    :key="artwork.id"
    :to="{
      name: '/artworks/[artworkId]',
      params: { artworkId: artwork.id },
    }"
  >
    <figure :title="artwork.title">
      <div v-if="artwork.thumbnail" class="img-loader">
        <img
          v-if="artwork.image_url"
          class="full-res"
          :src="artwork.image_url"
        />
        <img
          class="img-frozen"
          :src="artwork.thumbnail.lqip"
          :alt="artwork.thumbnail.alt_text"
        />
      </div>

      <figcaption>
        <span class="font-serif">
          {{ artwork.title }}, {{ artwork.date_display }}
        </span>
        <template v-if="artwork.artist_titles.length > 0">
          <br />
          <span>{{ artwork.artist_titles.join(', ') }}</span>
        </template>
      </figcaption>
    </figure>
  </RouterLink>
</template>

<style scoped>
.img-loader {
  position: relative;
  overflow: hidden;
  width: auto;
}

.img-loader .full-res {
  position: absolute;
}

.img-loader img {
  display: block;
  top: 0;
  left: 0;
  width: 100%;
}

.full-res {
  position: relative;
  float: left;
  display: block;
}

.full-res::after {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 1000px;
  height: 1000px;
  content: '';
  background: #efefef;
}

.img-frozen {
  width: 100%;
  aspect-ratio: v-bind(aspectRatio);
}

.img-loader > .full-res {
  animation: 0.2s ease-in 0.4s 1 forwards fade;
  opacity: 0;
}

@keyframes fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
