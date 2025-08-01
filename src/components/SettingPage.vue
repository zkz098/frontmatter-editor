<script setup lang="ts">
import type { Update } from '@tauri-apps/plugin-updater'
import { ask } from '@tauri-apps/plugin-dialog'
import { relaunch } from '@tauri-apps/plugin-process'
import { check } from '@tauri-apps/plugin-updater'
import { ref } from 'vue'
import { useLanguage } from '../composables/useLanguage'
import { useFilesStore } from '../stores/useFilesStore'

const { t, currentLanguage, availableLanguages, changeLanguage } = useLanguage()
const filesStore = useFilesStore()

function resetFolder() {
  filesStore.ready.fileTree = false
  filesStore.filetree = []
  filesStore.files = {}
  filesStore.currentAccessPath = ''
  filesStore.basePath = ''
  filesStore.ready.fileList = false
  filesStore.ready.fileTree = false
  filesStore.ready.fileContent = false
  filesStore.ready.selectedFile = false
  filesStore.ready.xlsxExporting = false
}

const needUpdate = ref(false)
const updateRes = ref<Update | null>()
const updating = ref(false)
const downloaded = ref(0)
const contentLength = ref(0)

async function checkUpdate() {
  const res = await check()
  needUpdate.value = Boolean(res)
  if (res) {
    updateRes.value = res
  }
}

async function downloadAndInstallUpdate() {
  if (!needUpdate.value || !updateRes.value) {
    return
  }

  updating.value = true

  await updateRes.value.downloadAndInstall((event) => {
    switch (event.event) {
      case 'Started':
        contentLength.value = event.data.contentLength ?? 0
        break
      case 'Progress':
        downloaded.value += event.data.chunkLength ?? 0
        break
      case 'Finished':
        break
    }
  })

  const needRelaunch = await ask(t('settings.update.updateComplete'), { title: t('settings.update.updateCompleteTitle'), kind: 'info' })

  if (needRelaunch) {
    await relaunch()
  }
}
</script>

<template>
  <div class="flex flex-col items-start justify-start gap-6 p-4">
    <h1 class="text-2xl">
      {{ t('settings.title') }}
    </h1>

    <!-- 语言设置 -->
    <div class="max-w-md w-full">
      <h2 class="mb-3 text-lg">
        {{ t('settings.language') }}
      </h2>
      <div class="flex gap-2">
        <button
          v-for="lang in availableLanguages"
          :key="lang.code"
          class="border rounded px-4 py-2 transition-colors"
          :class="[
            currentLanguage === lang.code
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
          ]"
          @click="changeLanguage(lang.code)"
        >
          {{ lang.name }}
        </button>
      </div>
    </div>

    <!-- 重置按钮 -->
    <div class="max-w-md w-full">
      <h2 class="mb-3 text-lg">
        {{ t('files.title') }}
      </h2>
      <button
        class="rounded bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-800"
        @click="resetFolder"
      >
        {{ t('settings.reset') }}
      </button>
    </div>
    <hr class="my-1 w-full border-t-1 border-t-gray-400 border-none border-t-solid">
    <div class="flex flex-col items-start justify-start gap-2">
      <button
        class="rounded bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-800"
        @click="checkUpdate"
      >
        {{ t('settings.update.checkUpdate') }}
      </button>
      <button class="cursor-not-allowed rounded bg-gray-700 px-4 py-2 text-white transition-colors disabled:bg-gray-300 hover:bg-gray-800 disabled:hover:bg-gray-300" :disabled="!needUpdate" @click="downloadAndInstallUpdate">
        {{ t('settings.update.downloadAndInstall') }}
      </button>
    </div>

    <div v-if="needUpdate && updateRes" class="flex flex-col items-start justify-start gap-2">
      <span>{{ t('settings.update.newVersionFound') }}: {{ updateRes.version }}</span>
      <span class="ml-2">{{ t('settings.update.updateContent') }}:</span>
      <span>
        {{ updateRes.body }}
      </span>
    </div>

    <div v-if="updating" class="flex flex-row items-start justify-start gap-2">
      <span>{{ t('settings.update.downloading') }}：</span>
      <span>{{ downloaded / 1024 / 1024 }} / {{ contentLength / 1024 / 1024 }} MB</span>
    </div>
  </div>
</template>
