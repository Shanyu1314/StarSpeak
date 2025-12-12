# StarSpeak 部署指南

## Netlify 部署（推荐）

### 第 1 步：准备代码库

1. 初始化 Git 仓库
```bash
git init
git add .
git commit -m "Initial commit: StarSpeak v1.0.0"
```

2. 创建 GitHub 仓库
   - 访问 [GitHub](https://github.com/new)
   - 创建新仓库
   - 推送本地代码

```bash
git remote add origin https://github.com/your-username/starspeak.git
git branch -M main
git push -u origin main
```

### 第 2 步：在 Netlify 上部署

1. **访问 Netlify**
   - 前往 [Netlify](https://app.netlify.com)
   - 使用 GitHub 账户登录

2. **连接 Git 仓库**
   - 点击 "Add new site" > "Import an existing project"
   - 选择 "GitHub"
   - 授权访问你的仓库
   - 选择 `starspeak` 仓库

3. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - 点击 "Deploy site"

### 第 3 步：设置环境变量

1. **在 Netlify 项目中**
   - 进入 Site settings > Environment variables
   - 点击 "Add a variable"

2. **添加以下变量**

| 键 | 值 |
|-----|------|
| `VITE_SUPABASE_URL` | 你的 Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase Anon Key |
| `VITE_GEMINI_API_KEY` | 你的 Gemini API 密钥 |

3. **重新部署**
   - 返回 Deploys
   - 点击最新部署旁的 "Redeploy"

## 获取 API 凭证

### Supabase 设置

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目或使用现有项目
3. 进入 Project Settings > API
4. 复制以下内容：
   - Project URL → `VITE_SUPABASE_URL`
   - Anon Key → `VITE_SUPABASE_ANON_KEY`

### Google Gemini API 设置

1. 访问 [Google AI Studio](https://aistudio.google.com)
2. 点击 "Get API key"
3. 点击 "Create API key in Google Cloud"
4. 复制 API 密钥 → `VITE_GEMINI_API_KEY`

## 部署后验证

1. **访问已部署的应用**
   - Netlify 会分配一个 URL（例如：`starspeak-app.netlify.app`）

2. **测试功能**
   - 创建新账户
   - 切换语言（EN / 中文）
   - 测试查词功能
   - 测试 SOS、对话等功能

3. **验证环境变量**
   - 如果无法使用 AI 功能，检查 Netlify 环境变量设置
   - 检查浏览器控制台中的错误信息

## 自定义域名

### 添加自定义域名

1. **在 Netlify 中**
   - 进入 Site settings > Domain management
   - 点击 "Add custom domain"
   - 输入你的域名

2. **配置 DNS**
   - 按照 Netlify 的指示配置 DNS 记录
   - DNS 更新可能需要 24-48 小时生效

## 监控和维护

### 查看部署日志

1. 进入 Deploys
2. 点击要查看的部署
3. 查看 "Deploy log" 了解详细信息

### 配置通知

1. 进入 Site settings > Build & deploy
2. 配置通知偏好
3. 也可以设置部署失败时的邮件通知

### 自动部署

部署已配置为自动：
- 每当你推送到 `main` 分支时
- Netlify 会自动触发新构建
- 构建成功后自动部署

## 性能优化

### 启用预加载

Netlify 会自动为你启用：
- Gzip 压缩
- 最小化 JavaScript
- 图片优化
- CDN 分发

### 缓存设置

- 静态资源被缓存 1 年
- HTML 文件不缓存（确保获取最新版本）

## 故障排除

### 构建失败

**问题**: 部署失败
**解决方案**:
1. 检查 Netlify 构建日志
2. 确保本地构建成功 (`npm run build`)
3. 检查依赖版本是否兼容
4. 查看 Node.js 版本设置

### 环境变量未加载

**问题**: API 不工作
**解决方案**:
1. 验证环境变量在 Netlify 中已正确设置
2. 重新部署应用
3. 清除浏览器缓存
4. 检查浏览器控制台中的错误

### 部署后页面空白

**问题**: 应用无法加载
**解决方案**:
1. 检查浏览器控制台中的 JavaScript 错误
2. 确保 `.env` 变量正确设置
3. 尝试硬刷新（Ctrl+Shift+R）
4. 检查 Netlify 服务状态

## 安全最佳实践

- **不要在代码中提交 API 密钥**
- **始终使用 `.env.local` 本地开发**
- **在 Netlify 中使用环境变量**
- **定期轮换 API 密钥**
- **监控异常的 API 使用**

## 回滚到之前的版本

1. 进入 Deploys
2. 找到要回滚到的版本
3. 点击菜单 > "Publish deploy"

## 获取帮助

- **Netlify 文档**: https://docs.netlify.com
- **Supabase 文档**: https://supabase.com/docs
- **Vite 文档**: https://vitejs.dev
- **React 文档**: https://react.dev

---

**最后更新**: 2024-12-12
