-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keyVerify" BYTEA NOT NULL,
    "keyWrap" BYTEA NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "topicId" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keyVefify" BYTEA NOT NULL,
    "keyWrapped" BYTEA NOT NULL,
    "messageData" BYTEA NOT NULL,
    "messageVector" BYTEA NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reply" (
    "commentId" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentator" BOOLEAN NOT NULL,
    "messageData" BYTEA NOT NULL,
    "messageVector" BYTEA NOT NULL,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_keyVerify_key" ON "Topic"("keyVerify");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_keyWrap_key" ON "Topic"("keyWrap");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_keyVefify_key" ON "Comment"("keyVefify");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_keyWrapped_key" ON "Comment"("keyWrapped");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_messageVector_key" ON "Comment"("messageVector");

-- CreateIndex
CREATE UNIQUE INDEX "Reply_messageVector_key" ON "Reply"("messageVector");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
