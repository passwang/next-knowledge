import postgres from 'postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
  Topic
} from './definitions';
import { formatCurrency } from './utils';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require'});

export async function createCommentsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      topic_id INT NOT NULL,
      parent_comment_id INT,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      is_ai_reply BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (topic_id) REFERENCES topics(id),
      FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
    );
  `;
}

export async function fetchCommentsByTopicId(topic_id: string, page?: number) {
  try {
    const limit = 10; // 每页显示的评论数量
    const offset = page && (page - 1) * limit || 0; // 计算偏移量
    const data = await sql`SELECT
    id,
    content,
    to_char(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD HH24:MI:SS') as created_at,
    parent_comment_id,
    is_ai_reply
    FROM comments
     WHERE topic_id = ${topic_id}
     ORDER BY created_at DESC
     `;
    const commentsMap = new Map();
    const result: any[] = [];

    // 将所有评论和回复存储到 Map 中
    data.forEach((comment) => {
      commentsMap.set(comment.id, { ...comment, replies: [] });
    });
    data.forEach((comment) => {
      if (comment.parent_comment_id !== null) {
        const parentComment = commentsMap.get(comment.parent_comment_id);
        if (parentComment) {
          parentComment.replies.push(commentsMap.get(comment.id));
        }
      } else {
        // 如果是顶级评论，直接添加到结果中
        result.push(commentsMap.get(comment.id));
      }
    });
    // 对每个顶级评论的 replies 进行排序，将 AI 回复置顶
    result.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a: any, b: any) => {
          if (a.is_ai_reply && !b.is_ai_reply) return -1; // a 是 AI 回复，置顶
          if (!a.is_ai_reply && b.is_ai_reply) return 1;  // b 是 AI 回复，置顶
          return 0; // 保持原有顺序
        });
      }
    });
    if (page) {
      return result.slice(offset, offset + limit);
    } else {
      return result;
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch topic data.');
  }
}

export async function addComment(topic_id: string, content: string) {
  try {
    // 验证 topic_id 是否存在，确保外键约束
    const topicExists = await sql`SELECT id FROM topics WHERE id = ${topic_id}`;
    if (topicExists.length === 0) {
      throw new Error('Invalid topic_id: Topic does not exist');
    }
    const data = await sql`
    INSERT INTO comments (topic_id, content, created_at)
    VALUES (${topic_id}, ${content}, NOW())
    RETURNING id;
    `;
    return data[0].id;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to add comment.');
  }
}

export async function addReply(comment_id: string, content: string, is_ai_reply: boolean = false) {
  try {
    // 验证 comment_id 是否存在，并获取其 topic_id
    const commentExists = await sql`SELECT topic_id FROM comments WHERE id = ${comment_id}`
    if (commentExists.length === 0) {
      throw new Error('Invalid comment_id: Comment does not exist');
    }

    const topic_id = commentExists[0].topic_id;

    // 插入回复，包含 topic_id 和 is_ai_reply
    const data = await sql`
      INSERT INTO comments (topic_id, parent_comment_id, content, created_at, is_ai_reply)
      VALUES (${topic_id}, ${comment_id}, ${content}, NOW(), ${is_ai_reply})
    `;
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to add reply.');
  }
}
