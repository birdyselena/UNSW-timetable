# UNSW Course Timetable Planner

一个功能丰富的 UNSW 课程时间表规划工具，集成了智能推荐、冲突解决、用户认证等高级功能。

## 🚀 核心功能

### � 智能课程管理

- **智能搜索**: 支持课程代码、名称、描述的全文搜索
- **课程推荐**: 基于已选课程的 AI 智能推荐系统
- **课程对比**: 多维度课程对比分析工具
- **课程详情**: 详细的课程信息模态框

### �️ 高级时间表功能

- **拖拽操作**: 直观的拖拽界面，轻松安排课程
- **智能冲突检测**: 实时检测时间冲突并提供解决方案
- **冲突解决器**: 智能推荐冲突解决方案
- **持续时间支持**: 支持 1-3 小时不等的课程时长
- **时间表统计**: 详细的学习统计和分析

### 👤 用户系统

- **用户注册/登录**: 完整的用户认证系统
- **时间表管理**: 保存、加载、分享个人时间表
- **公共时间表**: 浏览和复制他人的公开时间表
- **数据导出**: 支持导出为日历文件(ICS)和 JSON 格式

### 🔔 通知系统

- **实时通知**: 智能通知系统，及时提醒重要信息
- **冲突警告**: 时间冲突的即时提醒
- **操作反馈**: 用户操作的实时反馈

### 🎨 界面与体验

- **暗黑模式**: 支持明暗主题切换
- **响应式设计**: 完美适配桌面和移动设备
- **现代化 UI**: 美观的渐变设计和流畅动画
- **无障碍设计**: 支持键盘导航和屏幕阅读器

## 🛠️ 技术架构

### 前端技术栈

- **React 18**: 现代化前端框架
- **Context API**: 全局状态管理
- **Axios**: HTTP 客户端
- **Socket.io**: 实时通信
- **CSS3**: 自定义样式和动画

### 后端技术栈

- **Node.js**: JavaScript 运行环境
- **Express.js**: Web 应用框架
- **Socket.io**: 实时通信服务
- **MongoDB**: 数据库(可选)
- **JWT**: 用户认证
- **bcryptjs**: 密码加密

### 安全特性

- **率限制**: API 请求频率限制
- **数据验证**: 输入数据验证和清理
- **安全头**: Helmet.js 安全中间件
- **密码加密**: bcrypt 密码哈希

## 📦 项目结构

```
timeTable/
├── frontend/
│   ├── src/
│   │   ├── components/          # React组件
│   │   │   ├── UNSWTimetable.js    # 主时间表组件
│   │   │   ├── CourseSearch.js     # 智能搜索组件
│   │   │   ├── CourseRecommendations.js # 推荐系统
│   │   │   ├── TimetableManager.js # 时间表管理
│   │   │   ├── TimetableStats.js   # 统计分析
│   │   │   ├── ConflictResolver.js # 冲突解决
│   │   │   ├── CourseComparison.js # 课程对比
│   │   │   ├── CourseDetails.js    # 课程详情
│   │   │   ├── NotificationSystem.js # 通知系统
│   │   │   └── Auth.js             # 用户认证
│   │   ├── contexts/           # React Context
│   │   │   └── AuthContext.js     # 认证上下文
│   │   └── data/              # 数据文件
│   │       └── sampleCourses.js   # 示例课程数据
│   └── public/
└── backend/
    ├── server.js              # Express服务器
    ├── data/
    │   └── courses.json       # 课程数据
    └── package.json
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 打开

### 构建生产版本

```bash
npm run build
```

## 使用指南

### 1. 搜索课程

在顶部搜索框中输入关键词：

- 课程代码：如 "COMP1511", "MATH1081"
- 课程名称：如 "Programming", "Calculus"
- 课程类型：如 "Lecture", "Tutorial", "Lab"

### 2. 选择课程

- 在搜索结果中点击课程来添加到选中列表
- 已选中的课程会显示在时间表上方
- 点击 "×" 按钮可以移除课程

### 3. 安排时间表

- 从左侧课程列表拖拽课程到时间表格子中
- 不同类型的课程（讲座、辅导、实验）需要分别安排
- 系统会自动检测时间冲突并标红显示

### 4. 管理冲突

- 冲突的时间段会以红色高亮显示
- 拖拽到冲突位置时系统会阻止操作
- 点击已安排的课程可以删除重新安排

## 项目结构

```
src/
├── components/
│   ├── UNSWTimeable.js      # 主时间表组件
│   ├── UNSWTimetable.css    # 时间表样式
│   ├── CourseSearch.js      # 搜索组件
│   └── CourseSearch.css     # 搜索样式
├── data/
│   └── sampleCourses.js     # 示例课程数据
├── App.js                   # 主应用组件
├── App.css                  # 主应用样式
├── index.js                 # 应用入口
└── index.css                # 全局样式
```

## 示例课程

项目包含 15 门 UNSW 计算机科学相关课程：

- **基础课程**: COMP1511, COMP1521, COMP1531
- **数学课程**: MATH1081, MATH1131
- **进阶课程**: COMP2511, COMP2521, COMP3311, COMP3331
- **项目课程**: COMP3900, COMP4920
- **研究生课程**: COMP6441, COMP9417, COMP9444, COMP9517

每门课程包含不同类型的课程安排（讲座、辅导、实验）。

## 自定义数据

要添加新课程或修改现有课程，编辑 `src/data/sampleCourses.js` 文件：

```javascript
{
  id: 'course-id',
  code: 'COURSE1234',
  name: 'Course Name',
  description: 'Course description for search',
  color: '#FF6B6B',
  sessions: [
    { id: 'session-id', type: 'Lecture', duration: 2 },
    { id: 'session-id-2', type: 'Tutorial', duration: 1 }
  ]
}
```

## 🎯 项目状态

**当前状态**: ✅ 完全功能可用

### 运行状态

- **前端**: 运行于 http://localhost:3002
- **后端**: 运行于 http://localhost:3001
- **所有主要功能**: 已实现并测试完成
- **生产环境**: 已准备就绪

### 已实现功能

- ✅ 课程搜索与选择
- ✅ 拖拽时间表创建
- ✅ 实时冲突检测
- ✅ 用户认证系统
- ✅ 时间表保存/加载/分享
- ✅ 课程推荐系统
- ✅ 课程详情模态框
- ✅ 课程对比工具
- ✅ 冲突解决器
- ✅ 通知系统
- ✅ 暗黑模式
- ✅ 响应式设计
- ✅ 导出功能(ICS/JSON)
- ✅ 统计分析
- ✅ 实时通信

### 启动说明

```bash
# 启动后端服务器 (端口 3001)
cd backend
node server.js

# 启动前端应用 (端口 3002)
cd ..
$env:PORT=3002; npm start
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！
