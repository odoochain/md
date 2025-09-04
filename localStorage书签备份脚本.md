# localStorage 书签备份脚本

## 📌 什么是书签脚本？

书签脚本（Bookmarklet）是保存在浏览器书签中的JavaScript代码，点击即可执行。这样您就可以在任何时候快速备份localStorage数据！

## 🔖 创建备份书签

### 步骤1：复制备份脚本代码

```javascript
javascript:(function () {
  const backup = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    backup[key] = localStorage.getItem(key)
  }
  const dataStr = JSON.stringify(backup, null, 2)
  const dataBlob = new Blob([dataStr], { type: `application/json` })
  const link = document.createElement(`a`)
  link.href = URL.createObjectURL(dataBlob)
  link.download = `localStorage-backup-${new Date().toISOString().split(`T`)[0]}.json`
  link.click()
  alert(`localStorage备份完成！`)
})()
```

### 步骤2：创建书签

1. **在Chrome/Edge中**：
   - 按 `Ctrl+Shift+O` 打开书签管理器
   - 点击右上角的"⋮"菜单 → "添加新书签"
   - 名称：`🔒 备份localStorage`
   - 网址：粘贴上面的JavaScript代码
   - 保存

2. **在Firefox中**：
   - 按 `Ctrl+Shift+B` 显示书签工具栏
   - 右键工具栏 → "新建书签"
   - 名称：`🔒 备份localStorage`
   - 位置：粘贴上面的JavaScript代码
   - 保存

### 步骤3：使用备份书签

1. 打开您的Markdown编辑器网页
2. 点击刚创建的"🔒 备份localStorage"书签
3. 系统会自动下载备份文件

## 🔖 创建编辑器专用备份书签

### MD编辑器专用备份脚本

```javascript
javascript:(function () {
  const mdData = {}
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
  mdKeys.forEach((key) => {
    const value = localStorage.getItem(key)
    if (value !== null) {
      mdData[key] = value
    }
  })
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(`openai_key_`) || key.startsWith(`openai_model_`) || key.endsWith(`Config`)) {
      mdData[key] = localStorage.getItem(key)
    }
  })
  const dataStr = JSON.stringify(mdData, null, 2)
  const dataBlob = new Blob([dataStr], { type: `application/json` })
  const link = document.createElement(`a`)
  link.href = URL.createObjectURL(dataBlob)
  link.download = `md-editor-data-${new Date().toISOString().split(`T`)[0]}.json`
  link.click()
  alert(`MD编辑器数据备份完成！包含${Object.keys(mdData).length}项数据`)
})()
```

创建书签时：

- 名称：`📝 MD编辑器备份`
- 网址：粘贴上面的JavaScript代码

## 🔄 创建恢复书签

### 恢复数据书签脚本

```javascript
javascript:(function () {
  const input = document.createElement(`input`)
  input.type = `file`
  input.accept = `.json`
  input.onchange = function (e) {
    const file = e.target.files[0]
    if (!file)
      return
    const reader = new FileReader()
    reader.onload = function (event) {
      try {
        const backup = JSON.parse(event.target.result)
        const data = backup.data || backup
        if (confirm(`确定要恢复数据吗？\n包含${Object.keys(data).length}项数据\n⚠️ 将覆盖当前数据`)) {
          Object.keys(data).forEach((key) => {
            if (data[key] !== null) {
              localStorage.setItem(key, data[key])
            }
          })
          alert(`数据恢复完成！页面即将刷新。`)
          location.reload()
        }
      }
      catch (err) {
        alert(`恢复失败：${err.message}`)
      }
    }
    reader.readAsText(file)
  }
  input.click()
})()
```

创建书签时：

- 名称：`🔄 恢复localStorage`
- 网址：粘贴上面的JavaScript代码

## 📊 查看存储状态书签

### 存储统计书签脚本

```javascript
javascript:(function () {
  const stats = {
    totalKeys: localStorage.length,
    totalSize: 0,
    details: {}
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    const value = localStorage.getItem(key)
    const size = new Blob([value]).size
    stats.totalSize += size
    stats.details[key] = size
  }
  function formatBytes(bytes) {
    if (bytes === 0)
      return `0 Bytes`
    const k = 1024
    const sizes = [`Bytes`, `KB`, `MB`, `GB`]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }
  console.log(`localStorage统计:`, stats)
  alert(`localStorage使用情况:\n总键数: ${stats.totalKeys}\n总大小: ${formatBytes(stats.totalSize)}\n详细信息已输出到控制台`)
})()
```

创建书签时：

- 名称：`📊 查看localStorage`
- 网址：粘贴上面的JavaScript代码

## ✨ 使用优势

1. **一键备份**：点击书签即可快速备份
2. **跨设备同步**：书签可以通过浏览器账号同步到其他设备
3. **随时可用**：在任何网页都能使用（针对当前域名的localStorage）
4. **无需记忆**：不用记住复杂的控制台命令

## 🚨 注意事项

1. **安全性**：请确保从可信来源复制书签脚本代码
2. **域名限制**：localStorage书签只能备份当前网站的数据
3. **浏览器兼容性**：现代浏览器都支持，但部分功能可能在旧版本中受限
4. **文件下载**：确保浏览器允许文件下载

## 🎯 推荐使用方式

1. **日常备份**：使用编辑器内置的"备份所有数据"功能
2. **紧急备份**：使用"🔒 备份localStorage"书签
3. **专项备份**：使用"📝 MD编辑器备份"书签
4. **数据恢复**：使用"🔄 恢复localStorage"书签
5. **状态检查**：使用"📊 查看localStorage"书签

通过这种方式，您就能像使用书签一样方便地管理localStorage数据了！
