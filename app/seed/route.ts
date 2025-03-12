import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { invoices, customers, revenue, users, topics } from '../lib/placeholder-data';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;
  

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}


async function seedTopics() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
  CREATE TABLE IF NOT EXISTS topics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cate VARCHAR(255) NOT NULL,
    cate_name VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    topic_id UUID DEFAULT uuid_generate_v4() NOT NULL
  );
`;
const insertedTopic = await Promise.all(
  topics.map(
    (t) => sql`
      INSERT INTO topics (name, cate, content, cate_name)
      VALUES (${t.name}, ${t.cate}, ${t.content}, ${t.cate_name})
      ON CONFLICT (id) DO NOTHING;
    `,
  ),
);
  return insertedTopic;
}

export async function GET() {
  try {
    const result = await sql.begin((sql) => [
      seedUsers(),
      seedTopics()
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
