# Code-review fixes (/code-review high) ✅ 已完成

Fixes for the verified findings from the multi-angle review of the Youdao dict feature.
Refuted (no fix): shared-adapter race (masked by switchMap), `ec` string-`i` (unreachable),
extractEnglish multi-sense (not exhibited), network-tests-fire (by design per README).

**验收**：`pnpm test` 52/52 通过 · `pnpm typecheck` 通过 · `pnpm lint` 通过。

## Fixes

### youdao-parse.ts + adapter.ts
- [x] **S1** `parseTranslation`: guard `translation?.[0]` (empty array / empty string → no row)
- [x] **S3** `parseWeb`: filter out entries whose `value` is empty before mapping
- [x] **V8** `parseBasic`: phonetic row pronounces a deterministic head word (`ctx.isChinese ? explains[0] ?? ctx.word : ctx.word`), not the loop-leftover
- [x] **V11** added optional `isError` to `Result`; `parseError` marks rows `isError: true`
- [x] updated `youdao-parse.test.ts`

### youdao.ts
- [x] **V1** `Youdao.parse`: emit translation only (dict now owns basic/web) → no duplication if openapi recovers

### youdao-dict.ts
- [x] **V2** derive `isChinese` from the response (`ce`→true / `ec`→false) in `parse`; dropped the `detectLanguage`-based `this.isChinese`
- [x] **V6+V5** `mapToBasicWeb`: `.filter(key && value.length)` BEFORE `.slice(MAX_WEB_RESULTS)`
- [x] updated `youdao-dict.test.ts`

### translator.ts
- [x] **V7** dict skip gate uses raw `query.trim().length`, not the space-cased word
- [x] **V11** `updateHistoryItem` skips `result.isError`
- [x] updated `translator.test.ts`

### history.ts
- [x] **V10** guarded `JSON.parse` (init + getList) → fallback to empty, never throws on corrupt cache
- [x] updated `history.test.ts`

### actions.tsx
- [x] **S4** `getDetailMarkdown`: `item.title.trim()` (no unit test — file imports @raycast/api)

### Won't fix
- [x] **S6** Japanese dict gap — out of scope (extension is zh↔en focused; Japanese needs jc/jd sub-dicts + parsing). Documented.

## Verify
- [x] `pnpm test` 52/52 · `pnpm typecheck` · `pnpm lint`
