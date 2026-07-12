# 有道 dict 词典能力接入 ✅ 已完成

**目标**：在调用有道 translate API 的同时并行调用 dict（`dict.youdao.com/jsonapi`，无签名）API，有结果则追加显示，恢复 `metadata/lingo-caster-1.png` 的细粒度词典效果。

**约束**：
- `@raycast/api` 仅 Raycast 运行时可用，单测无法 import → 链路上所有文件需依赖注入解耦
- HTTP 沿用 `got`，不引入 axios
- 复用现有渲染（`parseBasic`/`parseWeb`/`parsePhonetic`）；dict 响应映射回 `basic`/`web` 形状
- 测试优先属性测试（fast-check），辅以真实 fixture 金标准
- 发音沿用本地 `say`

**验收**：`pnpm test` 40/40 通过、`pnpm typecheck` 通过、`pnpm lint` 通过、测试链路无 `@raycast/api` import、`got` 实网命中 jsonapi 验证通过。

## 任务清单

### 0. 准备
- [x] 抓取真实 jsonapi fixture（`good` / `美`）存入 `src/adapters/__fixtures__/`
- [x] 安装 `fast-check`（devDep）
- [x] 确认 `resolveJsonModule: true`（基础 tsconfig 已有）
- [x] 添加 fixture provenance 说明 `src/adapters/__fixtures__/README.md`

### 1. dict 响应类型
- [x] 新建 `src/adapters/youdao-dict-types.ts`（附 provenance 注释）

### 2. 抽取共享解析纯函数（split parse for test）
- [x] 写 `src/adapters/youdao-parse.test.ts`（属性测试 + 金标准，16 例）
- [x] 新建 `src/adapters/youdao-parse.ts`：从 `youdao.ts` 抽取为纯函数，行为不变
- [x] 重构 `src/adapters/youdao.ts`：`parse` 调用纯函数；url/签名不动

### 3. dict 适配器
- [x] 写 `src/adapters/youdao-dict.test.ts`（12 例，含 fuzz 永不抛）
- [x] 新建 `src/adapters/youdao-dict.ts`：`YoudaoDict` + `mapToBasicWeb` + web 行封顶 `MAX_WEB_RESULTS=4`

### 4. 适配器接口与注册表
- [x] `src/adapters/adapter.ts`：`Adapter` 接口瘦身为 `{ url, parse }`
- [x] `src/adapters/index.ts`：注册表改为 `{ translate, dict? }`

### 5. Translator 并行编排 + 注入 request
- [x] 扩展 `src/workflow/translator.test.ts`（注入 request 合并/降级/长句跳过/错误，4 例 + 联网用例）
- [x] 改造 `src/workflow/translator.ts`：`Promise.all` 并行合并；注入 `request`（默认 got）；长句跳过 dict

### 6. history 依赖注入解耦
- [x] 写 `src/workflow/history.test.ts`（内存 KVStorage + LRU 属性测试，6 例）
- [x] 改造 `src/workflow/history.ts`：`KVStorage` 接口 + `MemoryStorage` + 构造注入；移除模块级 `new Cache()` 与 `@raycast/api`

### 7. 组合根接线
- [x] 新建 `src/workflow/raycast-cache.ts`：`createHistoryManager()`（唯一持有 `@raycast/api` `Cache`）
- [x] `src/workflow/index.ts`：导出 `createHistoryManager`/`KVStorage`/`MemoryStorage`
- [x] `src/translate.tsx` / `src/translate-selection.tsx`：改用 `createHistoryManager()`

### 8. 验证
- [x] `pnpm test` 全绿（40/40）
- [x] `pnpm typecheck` 通过
- [x] `pnpm lint` 通过
- [x] 测试链路无 `@raycast/api` import（grep 校验）
- [x] `got` 实网命中 jsonapi 验证（usphone/explains/web 与 fixture 一致）

## 待人工验证（需 Raycast / 密钥）
- [x] `pnpm dev` 在 Raycast 内查词（如 `word`/`good`/`美`），目视确认词典分条恢复
- [x] 在 `.env.local` 填入 `APP_KEY`/`APP_SECRET` 后 `pnpm test`，跑通联网集成用例
