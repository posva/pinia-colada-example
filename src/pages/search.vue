<script setup lang="ts">
import { type ArtworkColor } from '@/api/artworks'
import { useRouteQuery } from '@/composables/router'
import { useArtworkSearchResults } from '@/queries/artwork-search'
import ArtworkCard from '@/components/ArtworkCard.vue'

const {
  state: searchResults,
  asyncStatus,
  filters,
  searchText,
  page,
  resetFilters,
  nextPage,
  hasNextPage,
  previousPage,
  hasPreviousPage,
} = useArtworkSearchResults()
</script>

<template>
  <div class="px-2 lg:px-6 max-w-3xl lg:max-w-6xl mx-auto">
    <section class="">
      <h1 class="font-serif text-4xl">Search</h1>

      <hr class="mb-8" />

      <!-- <pre>{{ filters }}</pre> -->
      <!---->
      <!-- <label class="w-full max-w-xs form-control"> -->
      <!--   <div class="label"> -->
      <!--     <span class="label-text">Legal:</span> -->
      <!--   </div> -->
      <!--   <select -->
      <!--     class="w-full max-w-xs select select-bordered" -->
      <!--     v-model="filters.is_public_domain" -->
      <!--   > -->
      <!--     <option :value="undefined">Any</option> -->
      <!--     <option :value="true">Public Domain</option> -->
      <!--     <option :value="false">Copyrighted</option> -->
      <!--   </select> -->
      <!-- </label> -->
      <!---->

      <div class="flex justify-center">
        <div class="flex flex-col gap-y-2">
          <form
            class="form-control"
            @submit.prevent
            @reset.prevent="resetFilters()"
          >
            <div class="join">
              <input
                type="text"
                placeholder="Search Artworks"
                v-model="searchText"
                class="w-24 input input-bordered join-item md:w-auto"
              />
              <button
                type="submit"
                class="border-l-0 btn join-item btn-square input-bordered"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  class="w-4 h-4 opacity-70"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <!-- <button type="submit">Apply Filters</button> -->
            <!-- <button type="reset">Reset filters</button> -->
          </form>

          <div class="join mb-6 flex justify-center">
            <button
              :disabled="!hasPreviousPage()"
              class="join-item btn"
              @click="previousPage"
            >
              «
            </button>
            <button class="join-item btn">
              Page {{ page }} /
              {{ searchResults.data?.pagination.total_pages }}
            </button>
            <button
              :disabled="!hasNextPage()"
              class="join-item btn"
              @click="nextPage"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </section>

    <main>
      <div v-if="searchResults.status === 'pending'" class="loader"></div>
      <div v-else-if="searchResults.status === 'error'">
        <h2>Unexpected Error</h2>
        <pre>{{ searchResults.error }}</pre>
      </div>
      <div class="masonry" v-else>
        <ArtworkCard
          v-for="artwork in searchResults.data.data"
          :key="artwork.id"
          :artwork="artwork"
        />
      </div>
    </main>
  </div>
</template>
