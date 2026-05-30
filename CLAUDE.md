# AI 群像叙事小说工坊

AI 驱动的多角色互动小说生成 Web 应用。后端代理 Anthropic Claude API，前端管理角色与故事存档。

## 技术栈

- **后端**：Node.js >= 18 + Express
- **前端**：原生 HTML/CSS/JS（无框架）
- **存储**：本地 JSON 文件（`data/stories/`）
- **AI**：Anthropic Claude API（`claude-3-5-sonnet` 系列）

## 目录结构

```
├── server.js          # Express 后端：代理 API、故事 CRUD
├── public/
│   └── 小说.html      # 前端主页（必须通过后端服务访问）
├── standalone/
│   ├── 小说.html      # 单文件独立版（可直接浏览器打开，需手动输入 API Key）
│   └── 小说解析.html  # 故事解析分析页面
├── data/stories/      # 本地存档目录（自动创建，已 gitignore）
├── .env.example       # 环境变量模板
└── .claude/
    └── settings.json  # Claude Code 项目级权限配置
```

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置 API Key
cp .env.example .env
# 编辑 .env，填入 ANTHROPIC_API_KEY

# 3. 启动服务
npm start
# 访问 http://localhost:3000
```

## API 接口

| 方法   | 路径               | 说明                      |
|--------|--------------------|---------------------------|
| POST   | `/api/chat`        | 代理转发 Anthropic API    |
| GET    | `/api/stories`     | 获取存档列表              |
| POST   | `/api/stories`     | 保存当前故事              |
| GET    | `/api/stories/:id` | 加载指定存档              |
| DELETE | `/api/stories/:id` | 删除指定存档              |

## 注意事项

- `public/小说.html` 依赖后端服务运行，不能直接双击打开
- `standalone/小说.html` 是独立版，可直接在浏览器打开，但需手动在页面输入 API Key
- `data/stories/` 目录已加入 `.gitignore`，存档不会提交到仓库
- 端口默认 3000，可在 `.env` 中通过 `PORT` 修改

## 自定义 Skills

本项目使用 jierry-D 的自定义 Skills，配置仓库：
[claude-code-setup](https://github.com/jierry-D/claude-code-setup)（private，custom-skills 分支）
