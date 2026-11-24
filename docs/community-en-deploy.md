# 社区站点英文站部署手册

> 用途：将社区站点（含新增英文站 `/docs/community/en/`）构建产物发布到线上 nginx。
> 适用：本次「社区站点英文翻译」迭代（en/ 目录 + i18n 脚手架）的线上发布。
> 前置条件：本地开发与验证已完成（`yarn community:build` 构建通过、`node scripts/check-translation.js` 全站扫描符合预期）。

---

## 一、部署命令（用户手动执行）

在 `/home/yejr/gitee` 执行社区站点一键部署脚本：

```bash
bash community.sh
```

该脚本执行的操作（`community.sh` 内容）：

1. `rm -fr community/.vuepress/dist/*` —— 清空本地构建产物；
2. `rm -fr /usr/share/nginx/html/docs/community/*` —— 清空线上目录；
3. `yarn community:build` —— 重新构建（含中文站 + 英文站 `en/`）；
4. `rsync -av --delete-after community/.vuepress/dist/* /usr/share/nginx/html/docs/community` —— 同步到线上 nginx。

> ⚠️ 该命令会**直接覆盖线上站点**，执行前请确认：
> - 本地 `git status` 干净或已知改动均已提交；
> - 构建日志无 error（可先单独执行 `cd /home/yejr/gitee && yarn community:build` 预检）。

---

## 二、上线验证步骤

部署完成后，按以下顺序验证（浏览器访问）：

### 1. 英文站首页与 7 个页面可达

访问 `https://greatsql.cn/docs/community/en/`，确认：

| 页面 | URL |
| --- | --- |
| 参与贡献（首页） | `/docs/community/en/` |
| 参与贡献（独立页） | `/docs/community/en/1-contribute-to-greatsql.html` |
| 社区行为守则 | `/docs/community/en/2-community-rules.html` |
| 社区治理 | `/docs/community/en/3-community-toc.html` |
| 培训认证 | `/docs/community/en/4-greatsql-certified.html` |
| 兼容适配流程 | `/docs/community/en/5-greatsql-adaptation.html` |
| 致谢 | `/docs/community/en/6-thanks.html` |

每页检查：
- 标题为英文（H1 与英文侧边栏一致：Contribute / Community Code of Conduct / Community Governance / Training & Certification / Compatibility Adaptation / Acknowledgments）；
- 英文侧边栏 5 项导航可用（Contribute、Community Code of Conduct、Community Governance、Compatibility Adaptation、Acknowledgments）；
- 英文导航栏 4 项（Community、Gitee、Github、Report Issues）跳转正常。

### 2. 中英语言一键直切

- 在中文页（如 `/docs/community/`）右上角应显示 **English** 按钮，点击后直达同路径英文页（如 `/docs/community/en/`）；
- 在英文页右上角应显示 **简体中文** 按钮，点击后返回中文页；
- 中文页与英文页导航栏均不应出现默认的「语言 / Languages」下拉（已被脚本隐藏）；
- 语言切换后配色模式按钮（白天/黑夜/自动）与百度统计功能不受影响。

### 3. 图片与表格渲染

- **培训认证页**（`/en/4-greatsql-certified.html`）：GCA/GCP 流程图正常显示；6 张通过名单表格列对齐，人名掩码（张*）、证书编号（GCA-DBA-2024xxxx）原样显示；
- **兼容适配页**（`/en/5-greatsql-adaptation.html`）：申请流程图与 Logo Wall 正常显示；兼容认证列表表格列对齐，公司名/产品名/版本号原样显示，类别词为英文（Operating System 等）；
- **致谢页**（`/en/6-thanks.html`）：社区用户表渲染正常，公司名与应用场景（英文）并列显示；
- **社区治理页**（`/en/3-community-toc.html`）：治理结构图（community-toc.jpg）正常显示。

### 4. 页脚

7 个英文页底部均显示英文页脚：**Scan the QR code to follow our WeChat Official Account** + 微信公众号二维码图片（greatsql-wx.jpg）。

### 5. 中文站回归

- 中文站各页面（`/docs/community/`、`/docs/community/2-community-rules.html` 等）访问正常，内容无变化；
- 中文站配色模式切换（白天/黑夜/自动）与百度统计正常。

---

## 三、常见问题处理

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `/docs/community/en/` 404 | 部署未执行或 dist 未包含 en/ | 重新执行 `bash community.sh`；确认构建日志含 `success Generated static files in community/.vuepress/dist` |
| 英文页图片缺失 | dist 未同步完整 | 重新执行 `bash community.sh`（rsync 为 `--delete-after`，应完整同步）；确认线上 `/usr/share/nginx/html/docs/community/assets/img/` 含 7 张图片 |
| 语言切换按钮未出现 | 浏览器缓存旧 JS | 强制刷新（Ctrl+F5 / Cmd+Shift+R）；确认线上 `assets/js/app.*.js` 为最新构建 |
| 英文页残留中文 | 名单表格中的人名/公司名/产品名为专有名词，按策略保留 | 属正常现象，仅需核对正文与表头无中文 |
| 名单更新 | 中文站名单表格常态更新 | 仅需同步表格内新条目（人名/公司名/证书编号原样），正文无需重译；更新后重新 `bash community.sh` |

---

## 四、构建与校验（如需本地复验）

部署前可在本地预检（不触网、不影响线上）：

```bash
# 构建（输出到 community/.vuepress/dist）
cd /home/yejr/gitee && yarn community:build

# 全站残留中文扫描（4/5/6 文件仅剩按策略保留的专有名词属正常）
cd /nvme/gitee/community && node scripts/check-translation.js
```
