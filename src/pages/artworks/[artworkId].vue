<script lang="ts" setup>
import {
  useArtworkDetails,
  useArtworkRelatedArtworks,
} from '@/queries/artwork-details'
import ArtworkCard from '@/components/ArtworkCard.vue'

const { state: artwork } = useArtworkDetails()
const { state: relatedArtwork, isLoading: isLoadingRelatedArtworks } =
  useArtworkRelatedArtworks()
</script>

<template>
  <h1 class="sr-only">{{ artwork.data?.title }}</h1>
  <header
    v-if="artwork.data?.image_url"
    class="px-6 pb-10 space-y-2 bg-gray-100"
  >
    <!-- TODO: responsive size -->
    <div
      class="h-[calc(100vh-180px)] max-h-[860px] min-h-[720px] flex justify-center pt-12 pb-14"
    >
      <div
        class="w-full h-full max-w-[843px] max-h-[843px] m-auto flex justify-center"
      >
        <img
          :key="artwork.data.image_url"
          :src="artwork.data.image_url"
          :alt="artwork.data.thumbnail?.alt_text"
          class="object-contain"
        />
      </div>
    </div>

    <div class="flex justify-between px-16 space-x-2 text-gray-500">
      <span v-if="artwork.data.is_public_domain"
        >CC0 Public Domain Designation</span
      >
      <span v-else-if="artwork.data.copyright_notice">{{
        artwork.data.copyright_notice
      }}</span>
      <div class="flex-grow"></div>
      <div>
        <button class="bg-slate-800/35">Expand</button>
      </div>
    </div>
  </header>

  <div>
    <div class="flex flex-col pt-6 mx-auto prose">
      <span class="mt-6 font-serif text-4xl" aria-hidden="true">{{
        artwork.data?.title
      }}</span>

      <h2 class="sr-only">Date:</h2>
      <p>{{ artwork.data?.date_display }}</p>

      <h2 class="sr-only">Artist:</h2>
      <p>{{ artwork.data?.artist_display }}</p>

      <h2 class="sr-only">About this artwork:</h2>
      <div v-html="artwork.data?.description"></div>
    </div>

    <dl class="grid mx-auto my-6 max-w-prose">
      <dt>
        <h2>Artist</h2>
      </dt>
      <dd>
        <template v-if="artwork.data?.artist_titles.length">
          <!-- TODO: handle multiple artists -->
          <a :href="`#${artwork.data.artist_ids[0]}`">{{
            artwork.data.artist_titles[0]
          }}</a>
        </template>
        <span v-else>Unknown</span>
      </dd>

      <dt>
        <h2>Title</h2>
      </dt>
      <dd>
        <span>{{ artwork.data?.title }}</span>
      </dd>

      <dt>
        <h2>Place</h2>
      </dt>
      <dd>
        <span>{{ artwork.data?.place_of_origin }}</span>
      </dd>

      <dt>
        <h2>Date</h2>
      </dt>
      <dd>
        <span>{{ artwork.data?.date_display }}</span>
      </dd>

      <dt>
        <h2>Medium</h2>
      </dt>
      <dd>
        <span>{{ artwork.data?.medium_display }}</span>
      </dd>

      <template v-if="artwork.data?.inscriptions">
        <dt>
          <h2>Inscriptions</h2>
        </dt>
        <dd>
          <span>{{ artwork.data.inscriptions }}</span>
        </dd>
      </template>

      <template v-if="artwork.data?.dimensions">
        <dt>
          <h2>Dimensions</h2>
        </dt>
        <dd>
          <span>{{ artwork.data.dimensions }}</span>
        </dd>
      </template>

      <template v-if="artwork.data?.credit_line">
        <dt>
          <h2>Credit Line</h2>
        </dt>
        <dd>
          <span>{{ artwork.data.credit_line }}</span>
        </dd>
      </template>

      <template v-if="artwork.data?.main_reference_number">
        <dt>
          <h2>Reference Number</h2>
        </dt>
        <dd>
          <span>{{ artwork.data.main_reference_number }}</span>
        </dd>
      </template>

      <template v-if="artwork.data?.copyright_notice">
        <dt>
          <h2>Copyright</h2>
        </dt>
        <dd>
          <span>{{ artwork.data.copyright_notice }}</span>
        </dd>
      </template>
    </dl>
  </div>

  <h2 class="sr-only">Extended information about this artwork</h2>

  <div class="mx-auto prose">
    <div
      class="collapse collapse-plus"
      v-if="artwork.data?.publication_history.length"
    >
      <input type="checkbox" />
      <h3 class="px-0 m-0 uppercase collapse-title">Publication History</h3>
      <ul class="collapse-content">
        <li
          v-for="entry in artwork.data.publication_history"
          v-html="entry"
        ></li>
      </ul>
    </div>

    <div
      class="collapse collapse-plus"
      v-if="artwork.data?.exhibition_history.length"
    >
      <input type="checkbox" />
      <h3 class="px-0 m-0 uppercase collapse-title">Exhibition History</h3>
      <ul class="collapse-content">
        <li
          v-for="entry in artwork.data.exhibition_history"
          v-html="entry"
        ></li>
      </ul>
    </div>

    <div class="collapse collapse-plus" v-if="artwork.data?.provenance_text">
      <input type="checkbox" />
      <h3 class="px-0 m-0 uppercase collapse-title">Provenance</h3>
      <p class="collapse-content">
        {{ artwork.data.provenance_text }}
      </p>
    </div>
  </div>

  <div class="mx-auto prose max-w-screen-2xl">
    <h2 class="uppercase">Explore Further</h2>

    <h3 class="sr-only">Related artworks</h3>

    <div>
      <div class="flex justify-center" v-if="isLoadingRelatedArtworks">
        <div class="m-12 loading loading-spinner loading-lg"></div>
      </div>

      <div class="masonry" v-else-if="relatedArtwork.data">
        <ArtworkCard
          v-for="artwork in relatedArtwork.data.data"
          :key="artwork.id"
          :artwork="artwork"
        />
      </div>
      <div v-else>
        <p>No Related artwork found.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
dl.grid {
  grid-template-columns: max-content auto;
}

dl h2 {
  @apply font-bold;
}
dl dt {
  @apply pr-6;
}
</style>
