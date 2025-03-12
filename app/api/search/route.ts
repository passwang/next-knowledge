import { NextResponse } from 'next/server';
import { searchTopics, fetchTopic } from '@/app/lib/knowledge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  let results = [];
  if (query) {
   
    results = await searchTopics(query || '');
  } else {
  
    results = await fetchTopic();
  }
  return NextResponse.json(results);
}