<script setup lang="ts">
import { DatabaseIcon, Download, FileCode, FileCog, FileText, Upload } from 'lucide-vue-next'
import { useStore } from '@/stores'

const store = useStore()

const {
  isDark,
  isEditOnLeft,
} = storeToRefs(store)

const {
  exportEditorContent2HTML,
  exportEditorContent2PureHTML,
  exportEditorContent2MD,
  downloadAsCardImage,
  exportEditorContent2PDF,
} = store

const editorStateDialogVisible = ref(false)
const restoreConfirmDialogVisible = ref(false)
const reloadConfirmDialogVisible = ref(false)
const restoreConfirmMessage = ref(``)
const reloadConfirmMessage = ref(``)
let currentRestoreResolve: ((value: boolean) => void) | null = null
let currentReloadResolve: ((value: boolean) => void) | null = null

const importMarkdownContent = useImportMarkdownContent()

// 数据恢复功能
function triggerDataRestore() {
  // 创建隐藏的文件输入框
  const input = document.createElement(`input`)
  input.type = `file`
  input.accept = `.json`
  input.style.display = `none`

  input.onchange = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      handleFileRestore(file)
    }
    document.body.removeChild(input)
  }

  document.body.appendChild(input)
  input.click()
}

// 创建确认回调函数
function createConfirmCallback() {
  return (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (message.includes(`刷新页面`)) {
        reloadConfirmMessage.value = message
        currentReloadResolve = resolve
        reloadConfirmDialogVisible.value = true
      }
      else {
        restoreConfirmMessage.value = message
        currentRestoreResolve = resolve
        restoreConfirmDialogVisible.value = true
      }
    })
  }
}

async function handleFileRestore(file: File) {
  try {
    await store.restoreAllData(file, {
      onConfirm: createConfirmCallback(),
    })
  }
  catch (error: any) {
    console.error(`恢复失败:`, error)
  }
}

function handleRestoreConfirm() {
  if (currentRestoreResolve) {
    currentRestoreResolve(true)
    currentRestoreResolve = null
  }
  restoreConfirmDialogVisible.value = false
}

function handleRestoreCancel() {
  if (currentRestoreResolve) {
    currentRestoreResolve(false)
    currentRestoreResolve = null
  }
  restoreConfirmDialogVisible.value = false
}

function handleReloadConfirm() {
  if (currentReloadResolve) {
    currentReloadResolve(true)
    currentReloadResolve = null
  }
  reloadConfirmDialogVisible.value = false
}

function handleReloadCancel() {
  if (currentReloadResolve) {
    currentReloadResolve(false)
    currentReloadResolve = null
  }
  reloadConfirmDialogVisible.value = false
}
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      文件
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="importMarkdownContent()">
        <Upload class="mr-2 size-4" />
        导入 .md
      </MenubarItem>
      <MenubarItem @click="exportEditorContent2MD()">
        <Download class="mr-2 size-4" />
        导出 .md
      </MenubarItem>
      <MenubarItem @click="exportEditorContent2HTML()">
        <FileCode class="mr-2 size-4" />
        导出 .html
      </MenubarItem>
      <MenubarItem @click="exportEditorContent2PureHTML()">
        <FileCode class="mr-2 size-4" />
        导出 .html（无样式）
      </MenubarItem>
      <MenubarItem @click="exportEditorContent2PDF()">
        <FileText class="mr-2 size-4" />
        导出 .pdf
      </MenubarItem>
      <MenubarItem @click="downloadAsCardImage()">
        <Download class="mr-2 size-4" />
        导出 .png
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="editorStateDialogVisible = true">
        <FileCog class="mr-2 size-4" />
        导入/导出项目配置
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="store.backupAllData()">
        <DatabaseIcon class="mr-2 size-4" />
        备份所有数据
      </MenubarItem>
      <MenubarItem @click="triggerDataRestore()">
        <Upload class="mr-2 size-4" />
        恢复数据备份
      </MenubarItem>
      <MenubarSeparator />
      <MenubarCheckboxItem v-model:checked="isDark">
        深色模式
      </MenubarCheckboxItem>
      <MenubarSeparator />
      <MenubarCheckboxItem v-model:checked="isEditOnLeft">
        左侧编辑
      </MenubarCheckboxItem>
    </MenubarContent>
  </MenubarMenu>

  <!-- 各弹窗挂载 -->
  <EditorStateDialog :visible="editorStateDialogVisible" @close="editorStateDialogVisible = false" />

  <!-- 数据恢复确认对话框 -->
  <AlertDialog v-model:open="restoreConfirmDialogVisible">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>确认恢复数据</AlertDialogTitle>
        <AlertDialogDescription>
          {{ restoreConfirmMessage }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="handleRestoreCancel">
          取消
        </AlertDialogCancel>
        <AlertDialogAction @click="handleRestoreConfirm">
          确认恢复
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <!-- 刷新页面确认对话框 -->
  <AlertDialog v-model:open="reloadConfirmDialogVisible">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>确认刷新页面</AlertDialogTitle>
        <AlertDialogDescription>
          {{ reloadConfirmMessage }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="handleReloadCancel">
          取消
        </AlertDialogCancel>
        <AlertDialogAction @click="handleReloadConfirm">
          立即刷新
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
