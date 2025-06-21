# 咔哒英语

🚀 一个现代化的语言学习桌面应用程序，专注于句子翻译练习，基于 Electron、React 和 TypeScript 构建。

## ✨ 功能特色

### 核心功能
- 📝 **智能句子练习** - 中英文互译练习，支持填空和完整翻译模式
- 🎯 **个性化学习** - 自定义课程内容，个人进度跟踪
- 🔊 **语音合成** - 内置TTS语音播放，支持多种语音设置
- 📊 **学习统计** - 详细的学习进度和成绩统计分析

### 用户体验
- 🎨 **Material Design 3** - 遵循现代设计规范的精美界面
- 🖼️ **小飘窗模式** - 支持置顶小窗口，学习工作两不误
- ⌨️ **键盘音效** - 可选的键盘输入音效反馈
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🌙 **主题支持** - 支持明暗主题切换

### 技术特性
- 💾 **本地存储** - 基于 IndexedDB 的离线数据存储
- 🔒 **数据安全** - 所有学习数据本地保存，隐私安全
- ⚡ **高性能** - 基于现代技术栈，流畅运行体验

## 🛠️ 技术栈

- **框架**: Electron 32.0.0 + React 19.1.0 + TypeScript 4.5.4
- **构建工具**: Vite 5.4.19 + Electron Forge 7.8.1
- **样式框架**: Tailwind CSS 4.1.8
- **数据存储**: IndexedDB (Dexie 4.0.11)
- **代码质量**: ESLint + TypeScript 严格模式

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装运行
```bash
# 克隆项目
git clone https://github.com/JianWang97/kadalingo.git kadalingo
cd kadalingo

# 安装依赖
npm install

# 启动开发环境
npm start

# 或使用开发命令
npm run dev
```

### 构建打包
```bash
# 打包应用（不安装）
npm run package

# 构建安装包
npm run make

# Web版本开发
npm run web:dev

# Web版本构建
npm run web:build
```

## 📁 项目结构

```
src/
├── main.ts              # Electron 主进程
├── preload.ts           # 预加载脚本
├── renderer.tsx         # React 渲染进程入口
├── components/          # 可重用组件
│   ├── common/          # 通用组件库
│   ├── Settings.tsx     # 设置组件
│   ├── Sidebar.tsx      # 侧边栏组件
│   └── TitleBar.tsx     # 自定义标题栏
├── contexts/            # React 上下文
├── data/               # 数据管理
│   ├── repositories/   # 数据仓储模式
│   └── types/         # 类型定义
├── hooks/             # 自定义 Hooks
├── page/              # 页面组件
├── services/          # 业务服务
└── utils/             # 工具函数
```

## 🔧 开发指南

### 代码规范
- 使用 TypeScript 进行类型安全开发
- 遵循 React Hooks 和函数组件模式
- 使用 Tailwind CSS 进行样式开发
- 保持主进程、预加载脚本和渲染进程的适当分离

### 常用命令
```bash
# 代码检查
npm run lint

# 自动修复代码风格
npm run lint:fix

# 类型检查
npm run type-check

# 清理构建文件
npm run clean
```

### 调试技巧
- **开发者工具**: `Ctrl+Shift+I` (Windows/Linux) 或 `Cmd+Opt+I` (macOS)
- **重新加载**: `Ctrl+R` (Windows/Linux) 或 `Cmd+R` (macOS)
- **强制重新加载**: `Ctrl+Shift+R` (Windows/Linux) 或 `Cmd+Shift+R` (macOS)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📋 待办事项

- [ ] 添加更多语言支持
- [ ] 实现云端同步功能
- [ ] 添加语音识别功能
- [ ] 支持自定义主题
- [ ] 移动端适配

## 🐛 问题反馈

如果您在使用过程中遇到问题，请通过以下方式反馈：
- [GitHub Issues](https://github.com/JianWang97/kadalingo/issues)
- 邮箱: w415895535@outlook.com

## 📄 许可证

本项目基于 [GPL-3.0 许可证](LICENSE) 开源。

## 👨‍💻 作者

**JianWang97**
- GitHub: [@JianWang97](https://github.com/JianWang97)
- Email: w415895535@outlook.com

---

⭐ 如果这个项目对您有帮助，请给个 Star 支持一下！
