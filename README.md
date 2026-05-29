# 群像叙事 · AI 小说工坊

一个 AI 驱动的多角色互动小说生成应用，支持后端代理与本地故事存档。

## 功能
- 角色管理（新增、查看、删除、设定、颜色）
- 旁白与角色双轨推进（旁白、自动选角、指定角色）
- AI 生成对话与场景叙述，支持导演指令
- **保存 / 加载 / 删除** 本地故事存档
- 导出故事为 `.txt` 文件
- API Key 保存在服务端 `.env`，不暴露给浏览器

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置 API Key
```bash
cp .env.example .env
# 编辑 .env，填入你的 Anthropic API Key
```

### 3. 启动服务
```bash
npm start
# 访问 http://localhost:3000
```

> **要求**：Node.js >= 18（内置 fetch）

## 文件说明
| 文件 | 说明 |
|------|------|
| `server.js` | Express 后端，代理 Anthropic API，提供故事 CRUD 接口 |
| `public/小说.html` | 前端主页面（通过后端服务运行）|
| `.env.example` | 环境变量模板，复制为 `.env` 后填入 Key |
| `data/stories/` | 本地故事存档目录（自动创建，已 gitignore）|
| `小说.html` | 原始单文件版本，可直接在浏览器打开（需手动输入 Key）|

## API 接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/chat` | 代理 Anthropic Claude API |
| GET | `/api/stories` | 获取存档列表 |
| POST | `/api/stories` | 保存当前故事 |
| GET | `/api/stories/:id` | 加载指定存档 |
| DELETE | `/api/stories/:id` | 删除指定存档 |

## 使用说明
1. 左侧点击 **+** 添加角色：姓名、身份、背景、颜色
2. 中间输入框填入指令，选择旁白 / 自动 / 指定角色模式发送
3. 点击 **✦ 自动推进一回合** 让所有角色依次响应
4. 点击 **保存故事** 将当前进度存入本地文件
5. 点击 **加载存档** 可恢复之前的故事（含角色、对话、情节摘要）
6. 点击 **导出故事** 下载 `.txt` 格式全文
