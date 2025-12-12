# 国际化配置文档

## 概述

StarSpeak 应用支持多语言界面，目前支持英文（EN）和中文（ZH）两种语言。

## 文件结构

```
src/i18n/
├── translations.ts          # 翻译文本和语言类型定义
└── LanguageContext.tsx      # 国际化上下文和提供者
```

## 核心组件

### 1. translations.ts
定义所有可用的翻译文本。支持两种语言：
- `'en'` - English
- `'zh'` - 中文

结构示例：
```typescript
export const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.logout': 'Logout',
    'auth.email': 'Email',
    // ... 更多翻译
  },
  zh: {
    'nav.logout': '登出',
    'auth.email': '邮箱',
    // ... 更多翻译
  }
}
```

### 2. LanguageContext.tsx
提供国际化功能：
- `LanguageProvider` - 包装应用，管理语言状态
- `useLanguage()` - Hook，用于访问语言功能

## 使用方法

### 在组件中使用翻译

```typescript
import { useLanguage } from '../src/i18n/LanguageContext';

export const MyComponent = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('auth.login')}</h1>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('zh')}>中文</button>
    </div>
  );
};
```

### Hook 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `language` | `'en' \| 'zh'` | 当前语言 |
| `setLanguage` | `(lang: Language) => void` | 切换语言 |
| `t` | `(key: string) => string` | 获取翻译文本 |

## 添加新的翻译

1. 在 `translations.ts` 中为两种语言都添加新的键值对：

```typescript
export const translations: Record<Language, Record<string, string>> = {
  en: {
    'new.key': 'English text',
  },
  zh: {
    'new.key': '中文文本',
  }
}
```

2. 在组件中使用：

```typescript
const { t } = useLanguage();
const text = t('new.key');
```

## 语言持久化

用户选择的语言会自动保存到 `localStorage`，以 `'language'` 为键。
下次访问应用时，会加载上次选择的语言。

## 当前已支持的翻译键

### 导航栏
- `nav.lookup` - 查词/Lookup
- `nav.sos` - SOS
- `nav.drill` - 练习/Drill
- `nav.talk` - 对话/Talk
- `nav.logout` - 登出/Logout

### 认证页面
- `auth.login` - 登录/Login
- `auth.signup` - 注册/Sign Up
- `auth.email` - 邮箱/Email
- `auth.password` - 密码/Password
- `auth.error` - 认证失败/Authentication failed
- `auth.signingIn` - 登录中/Logging in
- `auth.signingUp` - 创建中/Creating account

### 通用文本
- `common.loading` - 加载中/Loading
- `common.error` - 错误/Error
- `common.success` - 成功/Success
- `common.cancel` - 取消/Cancel
- `common.save` - 保存/Save
- `common.delete` - 删除/Delete

## 默认语言

应用默认语言设置为英文（`'en'`）。用户可以在应用顶部的语言切换按钮改为中文。

## 最佳实践

1. 始终使用 `useLanguage()` Hook 获取翻译文本
2. 不要在组件中硬编码文本
3. 为新功能添加翻译时，确保添加英文和中文两个版本
4. 使用有意义的键名，例如 `feature.action` 的格式
5. 保持翻译文本的一致性
