
import { lusitana } from '@/app/ui/fonts';
import { fetchTopicById } from '@/app/lib/knowledge';
import { fetchCommentsByTopicId, addComment, addReply } from '@/app/lib/comments'; // 假设有相关函数用于获取和添加评论
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { CommentSection } from '@/app/ui/comments/CommentSection'; // 假设有一个 CommentSection 组件用于展示评论
export default async function Page({ params }: { params: { id: string, cate: string } }) {
  const {cate, id } = await params;
  const topic = await fetchTopicById(id); // 获取文章内容
  if (!topic) {
    notFound();
  }
  const comments = await fetchCommentsByTopicId(id, 1); // 获取文章评论
  // 处理添加评论
  const handleAddComment = async (content: string) => {
    'use server';
    const commendId = await addComment(id, content);
    console.log('newCommentId', commendId);
    revalidatePath(`/dashboard/${cate}/${id}`);
    return commendId;
  };

  // 处理添加回复
  const handleAddReply = async (commentId: string, content: string, is_ai_reply = false) => {
    'use server';
    await addReply(commentId, content, is_ai_reply);
    revalidatePath(`/dashboard/${cate}/${id}`);
  };
  // 加载更多
  const loadMoreComments = async (page: number) => {
    'use server';
    const comment = await fetchCommentsByTopicId(id, page);
    return comment;
  };


  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        {topic.title} {/* 文章标题 */}
      </h1>

      <div className="mb-8">
        <div dangerouslySetInnerHTML={{ __html: topic.content }} /> {/* 文章内容 */}
      </div>
      <div className="mt-8 mb-8">
      <Suspense fallback={<p>Loading comments...</p>}>
        <CommentSection
          comments={comments}
          onAddCommentAction={handleAddComment}
          onAddReplyAction={handleAddReply}
          loadMoreCommentsAction={loadMoreComments}
        />
      </Suspense>
      </div>
    </main>
  );
}