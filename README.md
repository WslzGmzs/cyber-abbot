# 赛博住持 - AI禅宗语录生成器

## 产品简介

赛博住持是一个具有颠覆性、病毒式传播潜力的AI娱乐工具。通过一个"不正经"的AI高僧角色，将用户的日常琐事或出格行为，一键转化为充满高级感、哲学味和荒诞幽默的"禅宗语录"。

## 核心功能

- 🙏 **AI禅师开示**: 输入任何内容，获得充满哲学味的荒诞解读
- 🎨 **古风图片生成**: 自动生成书法风格的竖版分享图片
- 📱 **移动端优化**: 完美适配手机浏览器使用
- 🚀 **一键分享**: 生成精美图片，方便社交媒体传播

## 技术栈

- **后端**: Node.js + Express
- **前端**: HTML5 + CSS3 + JavaScript
- **图片生成**: Canvas API
- **AI集成**: 支持OpenAI等大语言模型

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env` 文件并配置你的AI API密钥（可选，目前使用模拟数据）

### 3. 启动服务
```bash
# 生产环境
npm start

# 开发环境（支持热重载）
npm run dev
```

### 4. 访问应用
打开浏览器访问 `http://localhost:3000`

## 项目结构

```
cypher-master/
├── server.js          # 后端服务器
├── package.json       # 项目依赖
├── .env              # 环境变量配置
├── README.md         # 项目说明
└── public/           # 前端静态文件
    ├── index.html    # 主页面
    ├── style.css     # 样式文件
    └── script.js     # 前端逻辑
```

## API接口

### POST /api/generate
生成禅宗语录

**请求体:**
```json
{
  "userInput": "用户输入的内容"
}
```

**响应:**
```json
{
  "success": true,
  "content": "生成的禅宗语录",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/generate-image
生成分享图片

**请求体:**
```json
{
  "content": "要生成图片的文字内容"
}
```

**响应:** PNG图片数据

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License