# GreatSQL Live MGR(Beta)

GreatSQL Live MGR 是包含 3 个节点的 MGR 在线测试体验环境，并且还可以提供通过 GreatSQL Shell 来管理 MGR 集群。

::: danger 注意事项

1. 完整阅读使用说明，即可开始在线体验。

2. 为了让更多社区用户可以体验干净、完整的 MGR 测试环境，这个测试环境会定时检测，发现环境被破坏时会自动重新初始化。

3. 资源所限，所有用户共用同一个测试环境，所有操作也就是同时发生的，会相互影响（例如 A 用户正在切换主节点，而 B 用户可能正在关闭该节点；或者 A 用户刚写入一条数据就被 B 用户给删除了）。

4. 测试用户拥有较高级别权限，除了创建管理权限账户、无法关闭数据库实例外，其他操作基本上都不受限制，包括关闭 MGR 服务进程、删库、删表等操作。

5. 只支持单主模式，不支持修改为多主模式。

6. 不支持将主节点切换到仲裁节点上。

7. 目前支持最多 20 人同时在线测试。
:::

<style>
iframe {
width: 100%;
border: none;
transition: transform 0.3s ease-in-out;
}
</style>
<div class="container">
<iframe src='https://demo.greatsql.cn/' title='GreatSQL Live MGR' width='100%' height='900px' border=none></iframe>
</div>
