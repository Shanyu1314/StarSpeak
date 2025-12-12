# StarSpeak 设计系统

## 🎨 视觉风格
- **主题基调**: 明亮、轻快、科技感
- **情绪**: 友好、现代、专业
- **风格**: 轻拟物 + 扁平化混合

## 🌈 色彩系统

### 主色调 (Primary)
```
Sky Blue: #0EA5E9 (主操作、链接)
Cyan: #06B6D4 (强调、高亮)
Emerald: #10B981 (成功、完成状态)
```

### 辅助色 (Secondary)
```
Orange: #FB923C (警告、提示)
Amber: #FCD34D (温暖点缀)
Rose: #FB7185 (错误、删除)
```

### 中性色 (Neutral)
```
Background: #F8FAFC (浅灰蓝背景)
Surface: #FFFFFF (卡片背景)
Border: #E2E8F0 (边框)
Text Primary: #0F172A (主文字)
Text Secondary: #64748B (次要文字)
Text Muted: #94A3B8 (弱化文字)
```

### 渐变背景
```
Page BG: linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 50%, #ECFDF5 100%)
Card Glow: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)
Hover Glow: linear-gradient(135deg, #10B981 0%, #06B6D4 100%)
```

## 📝 字体系统

### 字体族
```
Primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
Monospace: 'JetBrains Mono', 'Courier New', monospace
Chinese: 'Noto Sans SC', sans-serif
```

### 字号层级
```
text-xs: 12px      (标签、说明)
text-sm: 14px      (次要信息)
text-base: 16px    (正文)
text-lg: 18px      (小标题)
text-xl: 20px      (卡片标题)
text-2xl: 24px     (页面标题)
text-3xl: 30px     (大标题)
text-4xl: 36px     (超大标题)
```

### 字重
```
font-normal: 400   (正文)
font-medium: 500   (强调)
font-semibold: 600 (小标题)
font-bold: 700     (标题)
```

## 📏 间距系统 (8px Grid)

```
0.5: 4px
1: 8px
2: 16px
3: 24px
4: 32px
5: 40px
6: 48px
8: 64px
12: 96px
16: 128px
```

## 🔲 圆角系统

```
rounded-sm: 4px    (小元素)
rounded: 8px       (按钮、输入框)
rounded-lg: 12px   (卡片)
rounded-xl: 16px   (大卡片)
rounded-2xl: 24px  (特殊卡片)
rounded-3xl: 32px  (英雄区域)
rounded-full: 9999px (圆形按钮)
```

## 🎭 阴影系统

```
shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
shadow: 0 1px 3px rgba(0,0,0,0.1)
shadow-md: 0 4px 6px rgba(0,0,0,0.07)
shadow-lg: 0 10px 15px rgba(0,0,0,0.08)
shadow-xl: 0 20px 25px rgba(0,0,0,0.1)
shadow-glow: 0 0 20px rgba(14,165,233,0.3)
```

## 📱 页面结构层级

```
StarSpeak App
├── 顶部导航栏 (Navbar)
│   ├── Logo + 品牌名
│   ├── 导航链接 (查词/练习/对话/SOS)
│   └── 用户信息/登录按钮
│
├── 主内容区 (Main Content)
│   ├── 首页 (Home/Auth)
│   │   ├── 英雄区域 (Hero Section)
│   │   │   ├── 大标题
│   │   │   ├── 副标题
│   │   │   └── CTA 按钮
│   │   ├── 中心搜索框
│   │   └── 功能卡片网格
│   │
│   ├── 查词页 (Lookup)
│   │   ├── 搜索栏 (固定顶部)
│   │   │   ├── 模式切换 (AI/离线)
│   │   │   └── 搜索输入框
│   │   ├── 结果区域
│   │   │   ├── 词头卡片
│   │   │   ├── 释义卡片
│   │   │   └── 例句卡片
│   │   └── 历史列表
│   │
│   ├── 练习页 (Loop Drill)
│   │   ├── 进度条
│   │   ├── 词卡
│   │   └── 操作按钮
│   │
│   └── 对话页 (Free Talk)
│       ├── 消息列表
│       └── 输入区域
│
└── 侧边信息面板 (可选)
    ├── 离线包状态
    ├── 最近查询
    └── 同步进度
```

## 🎯 关键组件规范

### 搜索框 (Search Input)
- 高度: 56px (h-14)
- 圆角: rounded-2xl
- 背景: 白色 with shadow-md
- 聚焦: ring-2 ring-sky-400, shadow-glow
- 图标: 左侧放大镜/右侧清除按钮

### 词条卡片 (Word Card)
- 背景: 白色 with shadow-lg
- 圆角: rounded-3xl
- 内边距: p-6
- 悬停: hover:shadow-xl, translate-y-[-2px]
- 装饰: 顶部渐变色条 (h-1)

### 按钮 (Button)
- Primary: bg-sky-500, hover:bg-sky-600
- Secondary: bg-white, border, hover:bg-slate-50
- 高度: h-10 (small) / h-12 (default) / h-14 (large)
- 圆角: rounded-xl
- 过渡: transition-all duration-200

### 加载状态 (Loading)
- Skeleton: animate-pulse, bg-slate-200
- Spinner: border-4 border-sky-500 border-t-transparent

## 🎨 图标风格
- 类型: Heroicons (outline)
- 颜色: 继承父元素或使用主题色
- 尺寸: w-4 h-4 (小) / w-5 h-5 (中) / w-6 h-6 (大)
- 风格: 简洁、圆润、2px 笔触

## ✨ 动效原则

### 过渡时长
```
duration-75: 75ms    (快速反馈)
duration-150: 150ms  (默认)
duration-200: 200ms  (标准)
duration-300: 300ms  (舒缓)
duration-500: 500ms  (慢速展开)
```

### 缓动函数
```
ease-in-out: 标准过渡
ease-out: 出现动画
ease-in: 消失动画
```

### 常用动画
- **淡入**: opacity-0 → opacity-100
- **滑入**: translate-y-4 + opacity-0 → translate-y-0 + opacity-100
- **缩放**: scale-95 + opacity-0 → scale-100 + opacity-100
- **悬停提升**: hover:translate-y-[-2px] + hover:shadow-lg
