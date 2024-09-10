import prisma from "@/prisma/index";

export default async ({lt, gt}: { lt?: number, gt?: number }) => {
    if (lt !== undefined && gt !== undefined) throw new Error('不能同时有lt和gt')
    const Topic = (await prisma.topic.findMany({
        ...lt !== undefined ? {where: {id: {lt}}} : gt !== undefined && {where: {id: {gt}}},
        orderBy: {
            id: gt !== undefined ? 'asc' : 'desc'
        },
        take: 10,
        select: {
            id: true,
            createdAt: true,
            message: true
        }
    }))
    if (gt !== undefined) Topic.reverse()
    return {
        announcement:
            `# 欢迎来到联七论坛

- [国内网址](https://lianqi.icu)
- [永久网址（国内上不了）](https://lw7.vercel.app)
- [开源仓库](https://github.com/bishojoism/lw7)

这是一个实现了端到端加密的匿名论坛（只有评论和回复是加密的，主题没有加密，请勿发布违法内容）

内容支持MDX格式，可以用\`<RefTopic>\`标签引用主题、用\`<RefComment>\`标签引用评论（children填id）`,
        list: Topic.map(({id, createdAt, message}) => ({
            id,
            create: createdAt.valueOf(),
            message
        }))
    }
}