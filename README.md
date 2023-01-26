<p align="center">
  <img src="./assets/command-icon.png" height="128">
  <h1 align="center">LingoCaster</h1>
</p>

## LingoCaster

`LingoCaster` 是一款 [Raycast](https://www.raycast.com) 上的查词翻译插件。

完美复刻 Alfred 上 [YoudaoTranslator](https://github.com/wensonsmith/YoudaoTranslator) 针对**中文用户**的丝滑体验，

比起 Raycast Easydict 插件更快，体验更符合**中文用户**操作习惯。


<img alt="Preview" src="./metadata/preview.webp" />

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
- 查询结构中的音标项上 `Enter(↩︎)` => 本地语音发音
- 对 `CamelCase` / `snake_case` / `kebab-case` 自动切分后翻译
- 长句结果自动展开详情显示
- 输入 `*` 将展示历史查询记录


## Credits

- [Alfred YoudaoTranslator](https://github.com/wensonsmith/YoudaoTranslator)
- [Raycast Easy Dictionary](https://github.com/tisfeng/Raycast-Easydict)
