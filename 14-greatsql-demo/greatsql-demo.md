# 关于 GreatSQL DEMO

GreatSQL 社区提供两个在线体验 GreatSQL 的环境，分别为：
- 单机模式下的 **GreatSQL Live SQL(Beta)**，在这个环境中可以对照 GreatSQL 用户手册执行各种 SQL 命令，[点击本链接](http://live.greatsql.cn) 开始体验。
- 包含 3 个节点的 MGR 环境，并且还可以提供通过 GreatSQL Shell 来管理 MGR 集群。

<html>
<head>
<style>
body {
justify-content: left;
align-items: left;
height: 100vh;
}

.container {
width: 100%;
max-width: 900px;
height: 100%;
max-height: 600px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
border-radius: 8px;
overflow: hidden;
background-color: #fff;
}

iframe {
width: 100%;
height: 600px;
border: none;
transition: transform 0.3s ease-in-out;
}

iframe:hover {
transform: scale(1.02);
       }

@media (max-width: 768px) {
iframe {
height: 400px;
}
}
</style>
</head>
<body>
<div class="container">
<iframe src='http://demo.greatsql.cn:7000/' title='GreatSQL MGR DEMO 环境' width='100%' height='500px'></iframe>
</div>
</body>
</html>
