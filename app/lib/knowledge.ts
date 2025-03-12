'use server';
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


const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export async function fetchTopic() {
  try {
    // await sql`DEALLOCATE ALL`; // 清理查询缓存
    const data = await sql`SELECT
    MIN(cate_name) AS cate_name,
    cate,
    COUNT(*) AS topic_count,
     jsonb_agg(
      jsonb_build_object(
        'id', id,
        'topic_name', name,
        'content', content
      )
    ) AS topics
     FROM topics
     GROUP BY cate
     `
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch topic data.');
  }
}

export async function searchTopics(query: string) {
  try {
    const data = await sql`SELECT
    MIN(cate_name) AS cate_name,
    cate,
    COUNT(*) AS topic_count,
     jsonb_agg(
      jsonb_build_object(
        'id', id,
        'topic_name', name,
        'content', content
      )
    ) AS topics
     FROM topics
     WHERE name LIKE ${'%' + query + '%'} OR content LIKE ${'%' + query + '%'}
     GROUP BY cate
     `
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to search topics.');
  }
}

export async function fetchTopicById(topic_id: string) {

  try {
    const data = await sql`SELECT
    name as title,
    content
    FROM topics
     WHERE id = ${topic_id};
     `
    return data[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch topic data.');
  }
}
