# StarSpeak - 快速开始指南

## 5 分钟快速部署

### 前置条件
- Node.js 18+
- GitHub 账户
- Netlify 账户
- Supabase 账户
- Google Gemini API 密钥

### 步骤 1：获取 API 凭证（2 分钟）

**Supabase:**
1. 访问 https://app.supabase.com
2. 创建新项目
3. 复制 Project URL 和 Anon Key

**Gemini API:**
1. 访问 https://aistudio.google.com
2. 点击 "Get API key"
3. 复制密钥

### 步骤 2：本地测试（2 分钟）

```bash
# 安装依赖
npm install

# 创建本地环境配置
cp .env.example .env.local

# 编辑 .env.local，添加你的凭证
# VITE_SUPABASE_URL=your-url
# VITE_SUPABASE_ANON_KEY=your-key
# VITE_GEMINI_API_KEY=your-api-key

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 并测试应用

### 步骤 3：部署到 Netlify（1 分钟）

```bash
# 构建项目
npm run build

# 提交到 Git
git init
git add .
git commit -m "StarSpeak v1.0.0"
git remote add origin https://github.com/your-username/starspeak.git
git push -u origin main
```

然后：
1. 访问 https://app.netlify.com
2. 点击 "Add new site" > "Import an existing project"
3. 选择你的 GitHub 仓库
4. 设置环境变量（复制 .env.local 中的值）
5. 点击 "Deploy site"

完成！🎉

## 功能一览

| 功能 | 说明 | 快捷键 |
|------|------|--------|
| 查词 | 支持 AI 和离线模式 | 底部导航 |
| SOS | 快速获取英文表达 | 底部导航 |
| 练习 | 循环记忆法练习 | 底部导航 |
| 对话 | 与 AI 自由交谈 | 底部导航 |
| 语言 | 一键切换 EN/中文 | 顶部右侧 |

## 常见问题

**Q: 我应该在哪里设置 API 密钥？**
A: 本地开发使用 `.env.local`，生产部署使用 Netlify 环境变量

**Q: 可以离线使用吗？**
A: 词典查询可离线。AI 功能和对话需要网络连接

**Q: 支持什么浏览器？**
A: 所有现代浏览器（Chrome、Firefox、Safari、Edge）

**Q: 如何添加新的翻译？**
A: 编辑 `src/i18n/translations.ts` 并在英文和中文中添加新键值对

## 项目文件说明

| 文件 | 用途 |
|------|------|
| README.md | 项目概述 |
| USER_GUIDE.md | 用户使用指南 |
| DEPLOYMENT.md | 详细部署步骤 |
| I18N_CONFIG.md | 国际化配置 |
| SETUP_SUMMARY.md | 项目完成情况总结 |
| netlify.toml | Netlify 配置 |
| .env.example | 环境变量模板 |

## 支持的语言

- 🇬🇧 English
- 🇨🇳 中文

## 获取帮助

- 📖 查看 README.md 获取详细信息
- 📋 查看 USER_GUIDE.md 了解功能使用
- 🚀 查看 DEPLOYMENT.md 获取部署帮助
- ⚙️ 查看 I18N_CONFIG.md 了解国际化

## 下一步

1. ✅ 配置 API 凭证
2. ✅ 本地运行测试
3. ✅ 部署到 Netlify
4. ✅ 添加自定义域名（可选）
5. ✅ 邀请用户使用

---

**祝你使用愉快！** 🚀

更新时间: 2024-12-12
