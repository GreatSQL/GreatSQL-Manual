# GreatSQL Live Demo

GreatSQL Live Demo is an online MGR testing experience environment with 3 nodes, which also provides the ability to manage the MGR cluster through GreatSQL Shell.

::: danger Notes

1. Read the usage instructions in full and you can start the online experience.

2. To allow more community users to experience a clean and complete MGR testing environment, this testing environment is checked periodically and will be automatically re-initialized when it is found to be damaged.

3. Due to limited resources, all users share the same testing environment, and all operations happen simultaneously and affect each other (for example, while user A is switching the primary node, user B may be shutting down that node; or data just written by user A may be deleted by user B).

4. Test users have relatively high privileges. Except for creating accounts with administrative privileges and shutting down database instances, operations are basically unrestricted, including stopping the MGR service process, dropping databases, dropping tables, etc.

5. Only single-primary mode is supported; it is not supported to change to multi-primary mode.

6. It is not supported to switch the primary node to the arbitrator node.

7. Currently, up to 20 users can test online at the same time.
:::

<style>
iframe {
width: 100%;
border: none;
transition: transform 0.3s ease-in-out;
}
</style>
<div class="container">
<iframe src='https://demo.greatsql.cn/' title='GreatSQL Live Demo' width='100%' height='900px' border=none></iframe>
</div>
