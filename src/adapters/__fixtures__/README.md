# Youdao dict (jsonapi) fixtures

Real responses from the **unofficial** Youdao web dictionary endpoint, used as offline
golden fixtures for `youdao-dict` tests (no network at test time).

- Endpoint: `GET https://dict.youdao.com/jsonapi`
- Params used to capture: `q=<word>`, `le=en`, `dicts={"count":99,"dicts":[["ec","ce","web_trans"]]}`
- No auth / no signing (see `src/adapters/youdao-dict.ts`).
- Captured: 2026-05-25

| File | Query | Shape |
| --- | --- | --- |
| `youdao-dict.good.json` | `good` (英→中) | has `ec.word[0]` (usphone/ukphone/trs/wfs) + `web_trans` |
| `youdao-dict.mei.json` | `美` (中→英) | has `ce.word[0]` (phone/trs with pos/#text/#tran) + `web_trans` |

Reference implementation derived from
[Raycast-Easydict](https://github.com/tisfeng/Raycast-Easydict)
`src/dictionary/youdao/{youdao.ts,formatData.ts,types.ts}`.
