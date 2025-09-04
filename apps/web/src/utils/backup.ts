import { downloadFile } from '@md/shared/utils'

/**
 * 备份 localStorage 数据的工具函数
 */

// 需要备份的键名列表
const BACKUP_KEYS = [
  // 核心数据
  `MD__posts`,
  `MD__current_post_id`,
  `MD__theme`,
  `MD__css_content_config`,
  `MD__is_open_right_slider`,
  `MD__is_open_post_slider`,
  `MD__use_indent`,
  `MD__use_justify`,
  `MD__sort_mode`,
  `MD__copyMode`,
  `MD__mp-profile`,

  // 用户偏好设置
  `isDark`,
  `isEditOnLeft`,
  `isMacCodeBlock`,
  `isCiteStatus`,
  `showAIToolbox`,
  `isCountStatus`,
  `fonts`,
  `size`,
  `color`,
  `codeBlockTheme`,
  `legend`,
  `previewWidth`,
  `isMobile`,

  // AI 配置
  `openai_type`,
  `openai_temperature`,
  `openai_max_token`,
  `quick_commands`,

  // 图床配置
  `githubConfig`,
  `aliOSSConfig`,
  `qiniuConfig`,
  `tencentConfig`,
  `upyunConfig`,
  `s3Config`,
  `mpConfig`,
  `telegramConfig`,
  `cloudinaryConfig`,
  `imgHost`,

  // 其他配置
  `__editor_content`,
  `__css_content`,
]

/**
 * 备份所有编辑器数据
 */
export function backupEditorData(): void {
  const backupData: Record<string, string | null> = {}
  const timestamp = new Date().toISOString().replace(/[:.]/g, `-`).slice(0, -5)

  // 收集需要备份的数据
  BACKUP_KEYS.forEach((key) => {
    const value = localStorage.getItem(key)
    if (value !== null) {
      backupData[key] = value
    }
  })

  // 收集所有 openai_key_ 和 openai_model_ 开头的键
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(`openai_key_`) || key.startsWith(`openai_model_`) || key.startsWith(`mpToken:`)) {
      backupData[key] = localStorage.getItem(key)
    }
  })

  // 添加备份元信息
  const backupInfo = {
    version: `1.0.0`,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    dataCount: Object.keys(backupData).length,
  }

  const finalBackup = {
    meta: backupInfo,
    data: backupData,
  }

  // 生成文件名
  const filename = `md-editor-backup-${timestamp}.json`

  // 下载备份文件
  const dataStr = JSON.stringify(finalBackup, null, 2)
  downloadFile(dataStr, filename, `application/json;charset=utf-8`)

  console.log(`✅ 备份完成，包含 ${Object.keys(backupData).length} 项数据`)
}

/**
 * 恢复编辑器数据
 * @param file 备份文件
 * @param options 恢复选项
 * @param options.clearExisting 是否清空现有数据
 * @param options.selectiveRestore 选择性恢复的键名数组
 * @param options.skipConfirm 是否跳过确认对话框
 * @param options.onConfirm 确认回调函数
 */
export function restoreEditorData(
  file: File,
  options: {
    clearExisting?: boolean
    selectiveRestore?: string[]
    skipConfirm?: boolean
    onConfirm?: (message: string) => Promise<boolean>
  } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const result = e.target?.result as string
        const backup = JSON.parse(result)

        // 验证备份文件格式
        if (!backup.data || typeof backup.data !== `object`) {
          throw new Error(`备份文件格式无效`)
        }

        const { data, meta } = backup

        // 显示备份信息
        if (meta) {
          console.log(`📋 备份文件信息:`, {
            版本: meta.version,
            创建时间: meta.timestamp,
            数据项数: meta.dataCount,
            原始URL: meta.url,
          })
        }

        // 确认恢复操作
        if (!options.skipConfirm) {
          const confirmMsg = `确定要恢复数据吗？\n\n备份包含 ${Object.keys(data).length} 项数据\n${options.clearExisting ? `⚠️ 这将清空当前所有数据` : `📝 将覆盖相同键名的数据`}`

          if (options.onConfirm) {
            const confirmed = await options.onConfirm(confirmMsg)
            if (!confirmed) {
              reject(new Error(`用户取消恢复操作`))
              return
            }
          }
          else {
            // 如果没有提供确认回调，则直接继续执行（不推荐）
            console.warn(`⚠️ 没有提供确认回调，直接执行恢复操作`)
          }
        }

        // 清空现有数据（可选）
        if (options.clearExisting) {
          BACKUP_KEYS.forEach(key => localStorage.removeItem(key))

          // 清空 openai_ 相关键
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(`openai_`) || key.startsWith(`mpToken:`)) {
              localStorage.removeItem(key)
            }
          })
        }

        // 恢复数据
        const keysToRestore = options.selectiveRestore || Object.keys(data)
        let restoredCount = 0

        keysToRestore.forEach((key) => {
          if (data[key] !== null && data[key] !== undefined) {
            localStorage.setItem(key, data[key])
            restoredCount++
          }
        })

        console.log(`✅ 数据恢复完成，恢复了 ${restoredCount} 项数据`)

        // 刷新页面使数据生效
        if (!options.skipConfirm && options.onConfirm) {
          const shouldReload = await options.onConfirm(`数据恢复完成！需要刷新页面使数据生效，是否立即刷新？`)
          if (shouldReload) {
            window.location.reload()
          }
        }

        resolve()
      }
      catch (error) {
        console.error(`❌ 恢复数据失败:`, error)
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error(`读取文件失败`))
    }

    reader.readAsText(file)
  })
}

/**
 * 导出指定文章数据
 * @param postIds 文章 ID 数组，为空则导出所有文章
 */
export function exportPosts(postIds?: string[]): void {
  const postsData = localStorage.getItem(`MD__posts`)
  if (!postsData) {
    throw new Error(`没有找到文章数据`)
  }

  const posts = JSON.parse(postsData)
  const filteredPosts = postIds ? posts.filter((post: any) => postIds.includes(post.id)) : posts

  if (filteredPosts.length === 0) {
    throw new Error(`没有找到匹配的文章`)
  }

  const exportData = {
    meta: {
      version: `1.0.0`,
      timestamp: new Date().toISOString(),
      exportType: `posts`,
      count: filteredPosts.length,
    },
    posts: filteredPosts,
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, `-`).slice(0, -5)
  const filename = `md-posts-export-${timestamp}.json`

  const dataStr = JSON.stringify(exportData, null, 2)
  downloadFile(dataStr, filename, `application/json;charset=utf-8`)

  console.log(`✅ 文章导出完成，共导出 ${filteredPosts.length} 篇文章`)
}

/**
 * 导入文章数据
 * @param file 文章数据文件
 * @param mode 导入模式：'merge'(合并) | 'replace'(替换)
 * @param onConfirm 确认回调函数
 */
export function importPosts(
  file: File,
  mode: `merge` | `replace` = `merge`,
  onConfirm?: (message: string) => Promise<boolean>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const result = e.target?.result as string
        const importData = JSON.parse(result)

        if (!importData.posts || !Array.isArray(importData.posts)) {
          throw new Error(`导入文件格式无效`)
        }

        const currentPostsData = localStorage.getItem(`MD__posts`)
        let currentPosts = currentPostsData ? JSON.parse(currentPostsData) : []

        if (mode === `replace`) {
          currentPosts = importData.posts
        }
        else {
          // 合并模式：检查重复文章
          importData.posts.forEach((newPost: any) => {
            const existingIndex = currentPosts.findIndex((post: any) => post.id === newPost.id)
            if (existingIndex >= 0) {
              // 如果 ID 重复，更新现有文章
              currentPosts[existingIndex] = newPost
            }
            else {
              // 如果 ID 不重复，添加新文章
              currentPosts.push(newPost)
            }
          })
        }

        localStorage.setItem(`MD__posts`, JSON.stringify(currentPosts))

        console.log(`✅ 文章导入完成，共${mode === `replace` ? `替换` : `合并`}了 ${importData.posts.length} 篇文章`)

        if (onConfirm) {
          const shouldReload = await onConfirm(`文章导入完成！需要刷新页面使数据生效，是否立即刷新？`)
          if (shouldReload) {
            window.location.reload()
          }
        }

        resolve()
      }
      catch (error) {
        console.error(`❌ 导入文章失败:`, error)
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error(`读取文件失败`))
    }

    reader.readAsText(file)
  })
}

/**
 * 获取存储使用情况统计
 */
export function getStorageStats() {
  const stats = {
    totalKeys: localStorage.length,
    mdKeys: 0,
    totalSize: 0,
    mdSize: 0,
    details: {} as Record<string, number>,
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!
    const value = localStorage.getItem(key)!
    const size = new Blob([value]).size

    stats.totalSize += size
    stats.details[key] = size

    if (key.startsWith(`MD__`) || key.includes(`openai_`) || BACKUP_KEYS.includes(key)) {
      stats.mdKeys++
      stats.mdSize += size
    }
  }

  return {
    ...stats,
    totalSizeFormatted: formatBytes(stats.totalSize),
    mdSizeFormatted: formatBytes(stats.mdSize),
  }
}

/**
 * 格式化字节数
 */
function formatBytes(bytes: number): string {
  if (bytes === 0)
    return `0 Bytes`

  const k = 1024
  const sizes = [`Bytes`, `KB`, `MB`, `GB`]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
