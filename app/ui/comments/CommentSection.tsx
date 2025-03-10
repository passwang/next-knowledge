"use client"; // 由于需要交互，必须标记为客户端组件

import { useCallback, useEffect, useState } from "react";
interface Comment {
  id: string;
  content: string;
  created_at: string;
  is_ai_reply?: boolean;
  replies?: Reply[];
}

interface Reply {
  is_ai_reply?: boolean;
  id: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => Promise<string>;
  onAddReply: (
    commentId: string,
    content: string,
    is_ai_reply?: boolean
  ) => any;
}

export function CommentSection({
  comments,
  onAddComment,
  onAddReply,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState(""); // 新评论内容
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // 当前回复的评论 ID
  const [replyContent, setReplyContent] = useState(""); // 回复内容
  const [aiReplyContent, setAiReplyContent] = useState(""); // AI回复内容
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [commentId, setCommentId] = useState("");
  const [isAiReplyComplete, setIsAiReplyComplete] = useState(false);
  const [commentsArr, setCommentsArr] = useState<Comment[]>(comments);

  // 处理添加评论
  const handleSubmitComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;
      const newCommentId = await onAddComment(newComment);
      setCommentId(newCommentId);
      setNewComment("");
      // 添加成功提示
      alert("评论提交成功！");
      setIsGeneratingReply(true);
      handleGenerateReply(newComment);
    },
    [newComment]
  );

  const handleGenerateReply = useCallback(async (content: string) => {
    const eventSource = new EventSource(
      `/api/generate-reply?content=${encodeURIComponent(content)}`
    );
    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        setIsAiReplyComplete(true);
        eventSource.close();
        return;
      }
      const data = JSON.parse(event.data);
      setAiReplyContent((prev) => prev + data.content); // 实时更新回复内容
      setIsGeneratingReply(false);
    };
    eventSource.onerror = (err) => {
      console.log("SSE connection error", err);
      eventSource.close();
      setIsAiReplyComplete(true);
      setIsGeneratingReply(false);
    };
    return () => {
      setIsAiReplyComplete(true);
      eventSource.close(); // 返回清理函数，确保组件卸载时关闭 EventSource
    };
  }, []);

  useEffect(() => {
      try {
      if (commentId && aiReplyContent && isAiReplyComplete) {
        onAddReply(commentId, aiReplyContent, true)
          .then(() => {
            console.log('AI reply added successfully');
          })
          .catch((error) => {
            console.error('Failed to add AI reply:', error);
          });
      }
    } catch (error) {
      console.error('Failed to add AI reply:', error);
    }
  }, [commentId, aiReplyContent, isAiReplyComplete]);

  // 处理添加回复
  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim()) return;
    // 先造一个假评论；
    const newComments = [...comments];
    const comment = newComments.find((v) => v.id === commentId);
    const replies = comment?.replies || [];
    replies.push({
      id: "fake-reply-id",
      content: replyContent,
      created_at: new Date().toISOString(),
    });
    setCommentsArr(newComments);
    setReplyContent("");
    setReplyingTo(null);
    try {
      await onAddReply(commentId, replyContent);
    } catch (error) {
      setCommentsArr(comments);
    }
  };

  useEffect(() => {
    setCommentsArr(comments);
  }, [comments]);

  return (
    <div className="space-y-6">
      {/* 添加评论表单 */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
          }}
          placeholder="写下你的评论..."
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          提交评论
        </button>
      </form>

      {/* 评论列表 */}
      <div className="space-y-4">
        {commentsArr.map((comment) => (
          <div key={comment.id} className="p-4 border rounded-lg">
            <p className="text-gray-700">
              {comment.content}
              <span className="text-gray-500 ml-4 text-sm">
                {comment.created_at}
              </span>
            </p>
            {commentId === comment.id ? (
              <div className="text-sm text-gray-600">
                <div className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 h-auto min-h-24 mt-4 mb-4 bg-gray-50">
                  {isGeneratingReply ? "AI回复中,请稍候..." : aiReplyContent}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
               
                <div className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 h-auto min-h-24 mt-4 mb-4 bg-gray-50">
                  {comment?.replies?.[0]?.content}
                </div>
              </div>
            )}
            {/* 回复按钮 */}
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              回复
            </button>

            {/* 回复表单 */}
            {replyingTo === comment.id && (
              <div className="mt-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="写下你的回复..."
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gradient-to-r from-blue-500 to-purple-500 rounded-lg"
                  rows={2}
                />
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  提交回复
                </button>
              </div>
            )}

            {/* 回复列表 */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-2">
                {comment.replies?.filter(v => v.is_ai_reply === false)?.map((reply) => (
                  <div key={reply.id} className="text-sm text-gray-600">
                    <p>
                      {reply.content}
                      <span className="text-gray-500 ml-4 text-xs">
                        {" "}
                        {reply.created_at}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
