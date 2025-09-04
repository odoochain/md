# localStorage 数据备份恢复指南

这个项目为您提供了完整的 localStorage 数据备份和恢复功能。以下是详细的使用方法：

## 🎯 功能概述

localStorage 数据备份恢复功能现已集成到编辑器的**文件菜单**中，提供以下功能：

### 1. **完整数据备份**

- 位置：文件菜单 → "备份所有数据"
- 功能：一键备份所有编辑器数据，包括文章内容、用户偏好、AI配置、图床设置等
- 生成文件：`md-editor-backup-YYYY-MM-DD-HH-mm.json`

### 2. **数据恢复**

- 位置：文件菜单 → "恢复数据备份"
- 功能：从备份文件恢复所有数据
- 支持格式：`.json` 备份文件

## 📋 手动备份方法

如果需要手动备份，可以在浏览器控制台中执行以下代码：

### 方法1: 备份所有 localStorage 数据

```javascript
// 备份所有 localStorage 数据
function backupAllLocalStorage() {
  const backup = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    backup[key] = localStorage.getItem(key)
  }

  // 转换为 JSON 并下载
  const dataStr = JSON.stringify(backup, null, 2)
  const dataBlob = new Blob([dataStr], { type: `application/json` })

  const link = document.createElement(`a`)
  link.href = URL.createObjectURL(dataBlob)
  link.download = `localStorage-backup-${new Date().toISOString().split(`T`)[0]}.json`
  link.click()
}

// 执行备份
backupAllLocalStorage()
```

### 方法2: 只备份编辑器相关数据

```javascript
// 只备份 MD 编辑器相关数据
function backupMDEditorData() {
  const mdData = {}

  // 要备份的键名列表
  const mdKeys = [
    `MD__posts`,
    `MD__current_post_id`,
    `MD__theme`,
    `MD__css_content_config`,
    `isDark`,
    `isEditOnLeft`,
    `isMacCodeBlock`,
    `isCiteStatus`,
    `showAIToolbox`,
    `fonts`,
    `size`,
    `color`,
    `codeBlockTheme`,
    `legend`,
    `openai_type`,
    `openai_temperature`,
    `openai_max_token`,
    `quick_commands`
  ]

  // 收集数据
  mdKeys.forEach((key) => {
    const value = localStorage.getItem(key)
    if (value !== null) {
      mdData[key] = value
    }
  })

  // 收集所有 openai_key_ 和图床配置
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(`openai_key_`)
      || key.startsWith(`openai_model_`)
      || key.endsWith(`Config`)) {
      mdData[key] = localStorage.getItem(key)
    }
  })

  const dataStr = JSON.stringify(mdData, null, 2)
  const dataBlob = new Blob([dataStr], { type: `application/json` })

  const link = document.createElement(`a`)
  link.href = URL.createObjectURL(dataBlob)
  link.download = `md-editor-data-${new Date().toISOString().split(`T`)[0]}.json`
  link.click()
}

// 执行备份
backupMDEditorData()
```

## 🔄 恢复备份数据

### 通过界面恢复

1. 点击文件菜单 → "恢复数据备份"
2. 选择之前备份的 `.json` 文件
3. 确认恢复操作
4. 页面将自动刷新应用新数据

### 通过控制台恢复

```javascript
// 恢复 localStorage 数据
function restoreLocalStorage(backupData) {
  // 可选：清空现有数据
  // localStorage.clear();

  // 恢复备份数据
  Object.keys(backupData).forEach((key) => {
    if (backupData[key] !== null) {
      localStorage.setItem(key, backupData[key])
    }
  })

  // 刷新页面使数据生效
  alert(`数据恢复完成！页面即将刷新。`)
  location.reload()
}

// 使用方法：
// 1. 将备份文件内容复制
// 2. 在控制台执行：
// const backupData = {粘贴备份文件内容};
// restoreLocalStorage(backupData);
```

## 📊 查看存储使用情况

```javascript
// 获取存储使用统计
function getStorageStats() {
  const stats = {
    totalKeys: localStorage.length,
    mdKeys: 0,
    totalSize: 0,
    mdSize: 0,
    details: {}
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    const value = localStorage.getItem(key)
    const size = new Blob([value]).size

    stats.totalSize += size
    stats.details[key] = size

    if (key.startsWith(`MD__`) || key.includes(`openai_`)
      || [`isDark`, `fonts`, `size`, `color`].includes(key)) {
      stats.mdKeys++
      stats.mdSize += size
    }
  }

  console.log(`存储统计:`, {
    总键数: stats.totalKeys,
    编辑器键数: stats.mdKeys,
    总大小: formatBytes(stats.totalSize),
    编辑器大小: formatBytes(stats.mdSize),
    详细信息: stats.details
  })

  return stats
}

function formatBytes(bytes) {
  if (bytes === 0)
    return `0 Bytes`
  const k = 1024
  const sizes = [`Bytes`, `KB`, `MB`, `GB`]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// 查看存储统计
getStorageStats()
```

## 🚨 注意事项

1. **数据备份的重要性**
   - localStorage 数据会在清除浏览器数据时丢失
   - 建议定期备份重要内容
   - 更换设备或浏览器前务必备份

2. **恢复数据的影响**
   - 恢复操作会覆盖当前所有设置
   - 建议先备份当前数据再恢复
   - 恢复后页面会自动刷新

3. **存储限制**
   - localStorage 通常限制为 5-10MB
   - 数据过多时考虑导出为文件
   - 定期清理不必要的历史记录

4. **跨浏览器兼容性**
   - 不同浏览器的 localStorage 是独立的
   - 数据不会自动同步到其他设备
   - 需要手动备份和恢复

## 🔗 相关功能

- **文章导出**：单独导出 Markdown 文件
- **配置导入导出**：只备份编辑器配置（不含文章内容）
- **项目配置**：通过文件菜单的"导入/导出项目配置"

通过这些功能，您可以安全地管理所有编辑器数据，确保重要内容不会丢失！
