# StarSpeak - 个人英语学习系统

## 项目概述

StarSpeak 是一个现代化的个人英语学习系统，集合了离线查词、AI 智能查询、自由对话和循环练习等功能。应用支持完全的中英文国际化，提供沉浸式的学习体验。

## 核心特性

- **智能查词** - 支持 AI 智能查询和离线词典两种模式
- **SOS 功能** - 快速获取英语问题的解答
- **自由对话** - 与 AI 进行真实的英文对话
- **循环练习** - 个性化的间隔重复法练习
- **完全国际化** - 一键切换英文/中文界面
- **离线支持** - 词典数据可离线访问
- **用户认证** - 基于 Supabase 的安全认证系统

## 技术栈

### 前端
- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **React Router** - 路由管理
- **Tailwind CSS** - 样式框架

### 后端 & 数据库
- **Supabase** - 数据库和认证
- **PostgreSQL** - 数据存储
- **Google Gemini API** - AI 功能

### 国际化
- **React Context** - i18n 状态管理
- **英文/中文** - 完整的多语言支持

## 项目结构

```
starspeak/
├── src/
│   ├── i18n/                 # 国际化
│   │   ├── LanguageContext.tsx
│   │   └── translations.ts
│   ├── hooks/                # React Hooks
│   │   └── useAuth.ts
│   ├── services/             # 业务逻辑
│   │   └── supabase.ts
│   └── types/                # TypeScript 类型
│       └── database.ts
├── pages/                    # 页面组件
│   ├── AuthPage.tsx
│   ├── LookupPage.tsx
│   ├── SOSPage.tsx
│   ├── FreeTalkPage.tsx
│   └── LoopDrillPage.tsx
├── components/               # 通用组件
│   ├── auth/
│   └── ui/
├── services/                 # 服务层
│   ├── storage.ts
│   ├── dictionary.ts
│   ├── gemini.ts
│   └── unified-dictionary.ts
└── App.tsx                   # 主应用
```

## 快速开始

### 前置要求
- Node.js 18+
- npm 或 yarn
- Supabase 账户
- Google Gemini API 密钥

### 安装步骤

1. **安装依赖**
```bash
npm install
```

2. **配置环境变量**

复制 `.env.example` 创建 `.env.local`：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 添加你的配置：
```
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini API
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 获取配置值

#### Supabase
1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目
3. 在 Project Settings > API 中找到 URL 和 Anon Key

#### Gemini API
1. 访问 [Google AI Studio](https://aistudio.google.com)
2. 创建 API 密钥
3. 复制密钥到 `.env.local`

## 开发

### 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

### 生产构建
```bash
npm run build
```

构建输出在 `dist/` 目录

## 部署

### Netlify 部署

1. **推送到 Git**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **连接到 Netlify**
   - 访问 [Netlify](https://netlify.com)
   - 点击 "New site from Git"
   - 选择你的仓库
   - 配置构建设置：
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **设置环境变量**
   - 在 Netlify 项目设置中进入 Environment
   - 添加以下环境变量：
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GEMINI_API_KEY`

## 国际化 (i18n)

### 语言切换

用户可以在应用顶部右侧点击 **EN** 或 **中文** 按钮快速切换语言。语言偏好会自动保存到浏览器。

### 添加新翻译

1. 编辑 `src/i18n/translations.ts`
2. 在 `en` 和 `zh` 对象中同时添加翻译

```typescript
export const translations = {
  en: {
    'feature.label': 'Label in English',
  },
  zh: {
    'feature.label': '中文标签',
  }
}
```

3. 在组件中使用：
```typescript
import { useLanguage } from '../src/i18n/LanguageContext';

const { t } = useLanguage();
const text = t('feature.label');
```

## 功能详解

### 1. 查词 (Lookup)
- **AI 模式** - 使用 Gemini 获取最新的定义
- **离线模式** - 使用本地数据库查询
- 支持收藏和添加到练习库

### 2. SOS 功能
- 用语音或文本描述英语问题
- AI 提供英文表达和解释
- 自动播放标准发音

### 3. 自由对话 (Free Talk)
- 多轮对话支持
- AI 自然语言交互
- 对话历史记录

### 4. 循环练习 (Drill)
- 基于间隔重复算法
- 语音输入和实时反馈
- 个性化学习统计

## 许可证

MIT License

## 更新日志

### v1.0.0 (2024-12-12)
- 初始发布
- 完整的中英文界面支持
- 所有核心功能实现
- Netlify 部署支持

---

**最后更新**: 2024-12-12
