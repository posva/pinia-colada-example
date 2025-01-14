<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useRouteQueryValue } from './composables/router'

const searchText = useRouteQueryValue<string>('q')
const router = useRouter()
async function goToSearch() {
  await router.push({
    name: '/search',
    query: {
      q: searchText.value,
    },
  })
}
</script>

<template>
  <header>
    <div class="navbar bg-base-100">
      <div class="flex-1">
        <RouterLink to="/" class="font-serif text-xl font-light btn btn-ghost"
          >Art Gallery</RouterLink
        >
      </div>
      <div class="flex-none gap-2">
        <form class="form-control" @submit.prevent="goToSearch()">
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
        </form>
        <ul class="px-1 menu menu-horizontal">
          <li>
            <details>
              <summary>Art & Artists</summary>
              <ul class="p-2 rounded-t-none bg-base-100">
                <li><RouterLink to="#TODO:">Artworks</RouterLink></li>
                <li><RouterLink to="#TODO:">Artists</RouterLink></li>
              </ul>
            </details>
          </li>
          <li><RouterLink to="/about">About</RouterLink></li>
        </ul>
      </div>
    </div>
  </header>

  <RouterView />
</template>
