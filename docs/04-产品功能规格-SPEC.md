# 公共产品功能 SPEC

> v3.0｜2026-11-17｜字段描述业务信息，不规定表结构、接口路径或代码框架。

## 1. 共同约束

每项业务对象都有稳定 ID、所属品牌/工作区（适用时）、创建人、时间、版本及状态。引用关联必须核对同一授权范围，不能仅凭调用方传入的 ID 信任归属。时间保存真实绝对时刻，品牌日统计按冻结的时区解释；M0 默认 Asia/Shanghai。

观察原文、冻结计划、已批准内容和报告快照只追加版本。纠正分析不会覆盖原文，内容变更不会沿用旧批准。历史外部数据删除后的“源证据不可得”是可用性附注，不修改已导出报告的原字节。

演示必须有独立空间/标志，所有列表、图表、导出均可见；真实统计只接受 is_demo=false 且满足条件的证据。原型截图上的数字永远不作为初始生产数据。

## 2. 对象、字段与关系

下表字段是最少产品语义；必填项允许在草稿时缺失，但执行相应动作前必须齐备。除明确可空字段外，完成态应有相应信息；unknown 是已记录“未知”，不是随意省略。

| 对象 | 最少信息 | 关系与约束 |
| --- | --- | --- |
| Brand / EntityVersion | 名称、业务说明、别名/同名排除、目标地区/语言、官网可空、自有页面归属、版本 | 一品牌多实体版本；样本和报告引用固定版本 |
| SourceMaterial | 来源类型、URL/文件说明、取得时间、片段定位、权利/公开范围 | 私有原件不因关联事实而变公开 |
| FactVersion | 主张、来源片段、有效期或长期标记、公开范围、确认人/时间、状态 | 一个主张修订多版；已批准版撤销影响依赖内容 |
| IntentCluster | 受众、需求/场景、购买阶段、业务重要度、主页面可待补、承接动作可待补 | 每题一个主要簇；其他关联只作标签不重复计题 |
| QueryVersion / QuerySetVersion | 文本、类型、来源、语言/地区、实体诱导标记、版本、固定题清单 | 类型 discovery/scenario/constraint/comparison/brand_fact/exploration |
| ChannelVersion | 观察对象、来源模式、采集方式、产品/端点标识、模型版本或 unknown、能力/验证记录 | API 与消费者产品不同 ID；同平台不同模式可为不同版本 |
| SamplingProtocol | 会话规则、联网要求、重复/时段、目标/实际地区要求、时区、可判断阈值、分析规则 | 采样前冻结；禁止注入品牌事实、定向信源或品牌偏好系统提示 |
| Run / PlanVersion | 题集、渠道/协议、计划时间与重复数、操作确认、预算上限、状态 | 快速单次或 M1 持续计划；用户修改范围产生新计划 |
| Slot / Attempt | 问题版本×渠道版本×计划时刻×repeat_index；尝试时间/结果/费用状态 | 一个槽位多次尝试；仅一个 accepted_observation_id；重试不增 P |
| Observation | slot_id、来源模式、采集方式、原问题/回答、原文指纹、时间、采样条件、完整性、截图可选、采集者 | 消费者完整证据须截图或可复查存证；缺项草稿不得进入 V |
| Citation | observation_id、原 URL/规范化 URL、原生来源类型、位置/标识、完整性、页面状态、归属判定 | citation_origin 为 provider_native/consumer_visible/search_candidate/analyst_found/custom_pipeline |
| AnalysisVersion | observation_id、实体/规则版本、提及/推荐/官网引用三态、证据片段、复核人和原因 | true/false/unknown；缺来源不能由生成模型补造 citation |
| Finding / ActionTask | 缺口、证据、假设、问题簇、目标页、步骤、优先理由、完成标准、状态、复测方法 | 建议合并键为品牌+问题簇+页+缺口；任务状态与效果分开 |
| BriefVersion / ContentPlan | 目标、受众、缺口、核心结论、事实版本、适用边界、主页面、承接动作、模板版本 | 确认 Brief 才能进入生成；一批最多 5 份 |
| ContentVersion / Variant | 正文/标题/图片及版本、主张到事实映射、目标渠道、内容指纹、标识 profile | 变体拥有自己的批准；不能用一个主稿批准全部平台内容 |
| Approval | 对象/版本/指纹、批准类型、actor、时间、政策版本 | 事实批准与内容批准不同；M1 可启用作者不得自审 |
| DeliveryPackage | 内容/事实/批准版本、文件清单、指纹、生成时间、目标渠道、标识处理结果 | 导出成果不代表已发布；正式/审阅稿清楚区分 |
| Publication / Check | 内容批准版、渠道账号/URL、用户申报时间、核验方法/人/时间/状态、证据、effective_at | 草稿/受限不写生效；手工核验与公开访问核验分开 |
| Retest / Comparison | 任务/发布批次、前后窗口、匹配条件、共同题、排除清单、指标结果和结论 | 无发布仍可诊断复跑，但不计闭环；变化不声称因果 |
| ReportSnapshot | 纳入/排除观察、题/计划/渠道/协议/指标/分析版本、逐题统计、发布证据和限制 | HTML/JSON 同一快照；修订新建 successor，不覆盖 |
| UsageEntry | 操作/槽位/尝试、预计上界、实际用量、费用状态、客户额度、确认记录 | 客户额度与供应商成本分开；unknown 费用不能写零 |
| M1/M2 Grant / BusinessEvent | 授权范围/期限/撤销；事件键、来源证据、有效性与同步覆盖 | 后续增量仍遵守同品牌范围和固定口径 |

### 2.1 来源与采集条件

- source_mode：model_api、consumer_ui、custom_pipeline；搜索结果是 SearchEvidence，不是第四种可混算回答。演示是 is_demo=true 的独立集合。
- capture_method：official_api、manual、assisted；manual 不自动等于低质量，仍按证据完整度和采样协议检查。
- search_required：计划是否要求联网；search_triggered：true/false/unknown；source_mode 和联网状态不能互相替代。
- target_region 与 observed_region 分开。新会话、历史上下文、产品模式、可得模型版本分别记录；版本未知时使用能力验证版本和观察条件，报告标限制。
- 观测不得添加用户品牌知识、定向限定只搜品牌官网、候选顺序诱导或夸大品牌能力的提示。诊断实验若需要这些条件必须另建 exploration/custom_pipeline，不进入自然发现主指标。

### 2.2 引用及实体判定

重复引用在同一回答按规范化 URL 去重，仅删除已明确跟踪参数，保留可能改变内容的参数、路径和片段定位；存原 URL 以备复核。重定向后的实际归属需有检查证据。共享域名以具体账号/页面归属判断，不能把全站计自有。

“推荐”是回答明确把正确实体作为满足需求的选项；附带否定、历史举例、比较中的落败者不自动推荐。三项标签分别判定；确认推荐时实体指向须明确，逻辑上应有提及。若推荐=true 而提及=false 则转 needs_review，不默默修正一项。未知不进入否定计数。

## 3. 业务操作合同

### 3.1 值类型与必填规则

ID 为非空、不透明字符串；版本标识不可重用；时间为带时区的 ISO 8601 时刻。计数为非负整数，比率为 0–1 的数值或 null（N/A），百分点差为数值或 null。tri-state 判定在交换数据中用布尔 true/false 或字符串 "unknown"，不能用空字符串或 0 代替未知。缺少字段表示未提供，unknown 表示已明确不可判断，二者不可混淆。

金额必须同时带 currency 与 amount，精确到约定最小单位；未知金额为 null 并配 reconciliation_required。引用集合 complete 时 citations 必须为数组（可为空），unsupported 时可为 null；partial 必须保留已取得记录和缺失原因。原文没有引用不能由 URL 抓取结果反向补成原生引用。

M0 的品牌必填名称/业务/目标地区/语言；题目冻结必填题型/原文/来源/地区/语言；完整观察必填问题与通道版本、原文、采集时间/方式、实际条件和完整性；消费者观察另需采集人和存证。事实确认、Brief 确认、内容批准和公开核验各自要求其表格字段齐备。模型版本、实际地区等不可得值明确 unknown，不因此臆造数据。

### 3.2 命令和结果

这是与传输方式无关的命令/结果定义，新项目可自行映射接口。写动作必须有 operation_id 和 expected_version（更新时），重复同输入返回原结果；同键不同输入返回冲突。冲突时让用户刷新差异，不能覆盖别人的版本。

| 命令 | 输入与前置 | 输出/业务失败 |
| --- | --- | --- |
| CreateBrand | 身份、名称/说明/地区；权益允许 | Brand ID / INVALID_INPUT、LIMIT_REACHED |
| ConfirmFact | FactVersion、来源、公开范围、确认权限 | Approval / SOURCE_MISSING、FACT_CONFLICT |
| FreezeQuerySet | 确认题目和题型、范围 | QuerySetVersion / TOO_FEW_NONBRAND、DUPLICATE_QUERY |
| PreviewRun | 题集/渠道/协议/重复数 | 槽位数、费用上界、可用性；不收费、不执行 |
| StartRun | 上述预览版本、预算确认、能力有效 | Run ID、queued / CAPABILITY_UNAVAILABLE、BUDGET_EXCEEDED、PREVIEW_STALE |
| Pause/Resume/Cancel | 当前运行版本与权限 | 新状态；不删除已发生费用和结果 |
| SubmitManualEvidence | 原文/条件/引用状态/存证 | Observation 或草稿 ID / EVIDENCE_INCOMPLETE（可补） |
| ReviseAnalysis | 证据、原分析版、修订标签/原因 | 新 AnalysisVersion / VERSION_CONFLICT |
| AcceptFinding | 证据与任务完整字段 | ActionTask / DUPLICATE_MERGED |
| ConfirmBrief/GenerateBatch | 事实可用、目标/边界齐备、1–5 Brief | 批次与逐稿状态 / FACT_INVALID、BRIEF_INCOMPLETE |
| ApproveContent/Export | 精确内容指纹、批准权限/有效事实、标识 | 批准/包 ID / APPROVAL_REQUIRED、FACT_INVALID、LABELING_UNVERIFIED |
| RecordPublication/Verify | 内容批准版、账号/URL、核验材料 | 发布记录/核验状态；不将受限当公开成功 |
| RequestRetest | 前次范围、变化记录、预算确认 | 新 Run/Comparison / SCOPE_CHANGED（可探索，不隐瞒差异） |
| FreezeReport | 固定样本/版本/排除、窗口到期信息 | 不可变快照 / WINDOW_NOT_DUE、INSUFFICIENT_EVIDENCE |

所有错误提供面向用户的 message、retryable、下一步和是否可能已产生外部费用；不得输出密钥或跨品牌存在性。能力失效、超限和权限错误不能自动换通道/账号绕过。

## 4. 独立状态轴

| 状态轴 | 重要边界 |
| --- | --- |
| 运行执行 | succeeded 只表示执行完成，不保证回答提及品牌；partial 保留失败量 |
| 回答质量 | 无原文、未合格、未知标签、明确否定分开；满足完整性才进 V |
| 任务执行 | implemented 是修改完成；retest_pending 是等复测；closed 不意味着提升 |
| 内容审批 | 生成、审核中、批准、失效；改变任何公开产物使批准失效 |
| 发布核验 | prepared/submitted/draft_only/pending_check/verified_public/verified_manual/mismatch/access_limited/removed |
| 复测结论 | improved/unchanged/declined/inconclusive；不等同因果证明 |
| 外部费用 | estimated/reserved/settled/reconciliation_required/released；未知不写 0 |

运行暂停/取消后已受理单元可能晚返回，保存为该槽位的结果并标 late_after_cancel。被取消运行的 P 不缩减；报告说明实际执行与未执行数。是否纳入对比按事前计划决定，不能依据结果好坏挑选。正式报告取消/缺失仍计覆盖不足。

## 5. 版本失效与内容维护

事实变更先生成新版本；旧事实未撤销且仍有效时，旧内容可继续使用直到到期。确认新事实取代旧版时明确是否立即撤销旧版，并呈现依赖列表。仅新增材料不自动撤销所有历史稿件。

当事实撤销/到期、内容字节或图片/目标渠道/标识规则发生改变时，未执行交付重新校验并阻断。已经在线的内容建立维护事项，不能声称系统已撤下。已导出的包不可远程召回；界面标失效并通知有权限的操作者。

M0 允许单人复核；verified_manual 不冒充自动匿名访问成功。M1 双人核验/审批启用后，第二人的身份、证据和时间必须独立记录；历史单人交付留存其原等级。

## 6. 数据管理与不可信材料

公开网页、文档、模型回答都是输入数据，不能改变权限、预算或执行工具。网页检查只读公开目标，不能访问内部地址、携带用户第三方凭证或执行输入脚本；导出 HTML 也不得执行任意脚本。这里规定可观察的安全行为，不指定实现库。

M0 不自动按“发布后几天”删除稿件。活跃品牌的事实/内容/报告及其必要证据默认持续保留，容量有限时先提醒并阻止新上传，不静默清历史。创建品牌时展示保留策略；政策变化提前展示影响，不改旧合同。

用户可申请/确认导出和删除：先展示品牌、附件、历史报告依赖、在途动作和仍需保留的账务/审计元信息；确认后立即禁止新动作及普通访问，默认 30 天可恢复后按已披露策略清除内容。支持按合法有效请求调整期限，不能借“证据不可变”永久拒绝应处理的删除。保留的最小元信息不含客户正文。历史报告引用被删除数据时显示不可复核提示。

## 7. 最小输出包

正式交付包至少含 content.md、content.html、manifest.json、public-sources.json、publish-checklist.md，图片可选。manifest 保存 schema_version、brand_id、content_version_id、approval_id、content_fingerprint、fact_version_ids、target_channel、labeling_profile_version、created_at、文件清单与指纹。

报告至少含 report.html、report.json；JSON 保存逐题分子/分母与完整快照引用。源文件与报告输出为用户可下载真实文件，未获得分享授权不可自动上传公共地址。具体文件标识规则按输出形态验证；未通过的格式只能作为审阅稿，不能标正式发布包。

## 8. 与分级 SPEC 的关系

各级 SPEC 补充功能范围，不能删掉以上语义。后续想修改指标、状态、范围或默认阈值，先创建新合同版本和迁移说明，再更新需求、任务、验收与样例。无需为普通 UI 实现决策追溯修改产品 Intent。
