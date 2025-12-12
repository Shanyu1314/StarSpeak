# StarSpeak ⭐

一款 AI 驱动的英语学习应用，让你的英语学习形成完整闭环。

## ✨ 核心亮点

### 🔄 学习闭环设计
- **查词 → 收藏 → 复盘 → 情景演练** - 查过的单词自动进入词汇库，随时复盘练习
- **AI 情景对话** - 在真实场景中运用所学词汇，告别死记硬背
- **循环练习** - 基于间隔重复算法，科学巩固记忆

### 🆘 SOS 紧急求助
遇到不会说的英语？输入中文，AI 立即给出地道表达，附带简短解释。

### 💬 自由对话
与 AI 进行多轮英语对话，像和真人聊天一样自然，不纠错、重交流。

### 🌍 双语界面
一键切换中英文界面，适合不同英语水平的用户。

---

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env.local
```

编辑 `.env.local`：
```
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
VITE_GEMINI_API_KEY=你的Gemini API密钥
```

### 3. 启动开发服务器
```bash
npm run dev
```

---

## 📦 部署到 Netlify

### Build Settings
| 配置项 | 值 |
|--------|-----|
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |

### Environment Variables
在 Netlify 后台添加以下环境变量：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

---

## 🗄️ 数据库配置

项目使用 Supabase 作为后端，数据库迁移文件位于 `supabase/migrations/`。

### 主要数据表
- `user_profiles` - 用户资料
- `words_unified` - 统一词汇表
- `user_vocabulary` - 用户词汇库（收藏的单词）

### 安全策略
- 所有表启用 RLS（行级安全）
- 用户只能访问自己的数据
- API 密钥通过环境变量管理，不提交到代码库

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS |
| 路由 | React Router 7 |
| 数据库 | Supabase (PostgreSQL) |
| AI | Google Gemini API |
| 部署 | Netlify + Netlify Functions |

---

## 📱 功能模块

| 模块 | 功能 | 说明 |
|------|------|------|
| 🔍 查词 | AI 智能查词 | 支持中英互查，自动添加到词汇库 |
| 🆘 SOS | 紧急求助 | 输入中文，获取地道英文表达 |
| 🏋️ 练习 | 循环复盘 | 基于收藏的单词进行情景演练 |
| 💬 对话 | 自由聊天 | 与 AI 进行多轮英语对话 |

---

## 📄 License

MIT

---

**Made with ❤️ for English learners**
