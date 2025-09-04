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

const importMarkdownContent = useImportMarkdownContent()

// 数据恢复功能
let pendingRestoreFile: File | null = null

function triggerDataRestore() {
  // 创建隐藏的文件输入框
  const input = document.createElement(`input`)
  input.type = `file`
  input.accept = `.json`
  input.style.display = `none`

  input.onchange = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      pendingRestoreFile = file
      restoreConfirmDialogVisible.value = true
    }
    document.body.removeChild(input)
  }

  document.body.appendChild(input)
  input.click()
}

function handleRestoreConfirm() {
  if (pendingRestoreFile) {
    store.restoreAllData(pendingRestoreFile)
    pendingRestoreFile = null
  }
  restoreConfirmDialogVisible.value = false
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
          确定要恢复数据吗？这将覆盖当前所有设置和数据。
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="restoreConfirmDialogVisible = false">
          取消
        </AlertDialogCancel>
        <AlertDialogAction @click="handleRestoreConfirm">
          确认恢复
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
