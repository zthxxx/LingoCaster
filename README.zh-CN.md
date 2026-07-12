<p align="center">
  <img src="./assets/command-icon.png" height="128">
  <h1 align="center">LingoCaster</h1>
</p>

[English](./README.md) | 简体中文

## LingoCaster

`LingoCaster` 是一款 [Raycast](https://www.raycast.com) 上的查词翻译插件。

完美复刻 Alfred 上 [YoudaoTranslator](https://github.com/wensonsmith/YoudaoTranslator) 针对**中文用户**的丝滑体验，

比起 Raycast Easydict 插件更快，体验更符合**中文用户**操作习惯。


<img alt="Preview" src="./media/preview.webp" />

### 快捷键
- `Command(⌘)` + `Space(␣)` _(可自定义)_ => 唤起翻译查询输入框
- `double Alt(⌥)` _(可自定义)_ => 翻译选中内容或剪贴板内容
- 查询结果 `Enter(↩︎)` => 复制翻译结果，并关闭 Raycast
- 查询结果 `Command(⌘)` + `Enter(↩︎)` => 本地语音发音
- 查询结果 `Shift(⇧)` + `Enter(↩︎)` => 跳转到有道翻译网页
- `Esc` => 一键完全关闭 Raycast

### Trick
- 对 中文/英文 查询中，发音均自动读取英语目标，
  即 `中->英` 的翻译英文结果，`英->中` 中的英文输入
- 查询结果中的音标项上 `Enter(↩︎)` => 本地语音发音
- 对 `CamelCase` / `snake_case` / `kebab-case` 自动切分后翻译
- 长句结果自动展开详情显示
- 输入 `*` 将展示历史查询记录


## 配置密钥

LingoCaster 使用你自己的密钥调用有道文本翻译 API，需要一个（免费的）有道智云应用：

1. 前往 [有道智云](https://ai.youdao.com) 注册并进入控制台
2. 创建应用，并开通 **文本翻译（自然语言翻译）** 服务
3. 复制该应用的 `应用ID` 与 `应用秘钥`
4. 首次运行命令时，Raycast 会弹出插件偏好设置（Preferences），按下表填入：

| 偏好项 | 说明 |
| --- | --- |
| Translator Platform App | 翻译平台，默认 `Youdao` |
| App Auth Key | 有道智云应用的 `应用ID` |
| App Secret Key | 有道智云应用的 `应用秘钥` |


## Development 开发安装

以开发模式将插件安装到本地 Raycast，支持热重载，适合二次开发或在插件上架前抢先体验。

### 前置依赖

- macOS 上已安装 [Raycast](https://www.raycast.com)，并登录 Raycast 账号（首次运行开发模式会引导登录 / 开启 Developer Mode）
- [Node.js](https://nodejs.org) ≥ 20

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/zthxxx/LingoCaster.git
cd LingoCaster

# 2. 安装依赖
npm install

# 3. 启动开发模式（内部执行 `ray develop`）
npm run dev
```

`npm run dev` 会构建插件并导入到 Raycast，保持终端运行即为热重载状态，改动源码会自动刷新。此时唤起 Raycast 即可看到 `Translate` 与 `Translate Selection` 两个命令。按 `Ctrl + C` 结束开发模式。

### 其他脚本

```bash
npm run build      # 构建产物到 dist
npm run lint       # ray lint（eslint + prettier + manifest 校验）
npm run test       # 运行单元测试
npm run typecheck  # tsc --noEmit
```

> 运行 `npm run test` 中的有道翻译联网集成测试时，密钥从本地 `.env.test` 文件读取
> （而非 Raycast 偏好设置），缺失时该用例自动跳过；
> `.env.test` 已被 git 忽略，内容为 `APP_PLATFORM` / `APP_KEY` / `APP_SECRET` 三个变量


## Credits

- [Alfred YoudaoTranslator](https://github.com/wensonsmith/YoudaoTranslator)
- [Raycast Easy Dictionary](https://github.com/tisfeng/Raycast-Easydict)
