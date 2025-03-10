import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const apiKey = 'sk-5a3df0a199d645108a15935e2017f785'; // 从环境变量获取 API 密钥
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    const url = new URL(request.url);
    const content = url.searchParams.get('content');
    if (!content) {
      throw new Error('Content is required');
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `请根据以下内容生成一个回复：${content}`,
          },
        ],
        max_tokens: 1024,
        model: 'deepseek-chat',
        stream: true, // 启用流式响应
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get stream reader');
    }

    const decoder = new TextDecoder();

    // 创建 SSE 响应
    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }

          // 解码并处理每一块数据
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6); // 去掉 "data: " 前缀
              try {
                if (jsonStr === '[DONE]') {
                    controller.enqueue(`data: [DONE]\n\n`);
                    controller.close();
                    break;
                 }
                const data = JSON.parse(jsonStr);
                if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                  // 将数据推送到客户端
                  controller.enqueue(`data: ${JSON.stringify({ content: data.choices[0].delta.content })}\n\n`);
                }
              } catch (error) {
                console.error('Failed to parse chunk:', error);
              }
            }
          }
        }
      },
    });
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'withCredentials': 'true'
      },
    });
  } catch (error) {
    console.error('Failed to generate reply:', error);
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 });
  }
}