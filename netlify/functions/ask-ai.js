// Netlifyのサーバーレス関数
exports.handler = async function(event, context) {
  // フロントエンドから送られてきた質問内容を取得
  const { prompt } = JSON.parse(event.body);

  // 環境変数から安全にAPIキーを取得
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'APIキーがNetlifyに設定されていません。' })
    };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  try {
    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };

    // GoogleのAIにリクエストを送信
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
        console.error('API Error:', result);
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: 'AIからの応答取得に失敗しました。' })
        };
    }
    
    // AIから有効な回答が得られなかった場合のエラーハンドリングを追加
    if (!result.candidates || result.candidates.length === 0) {
        console.error('API returned no candidates. Response:', result);
        const blockReason = result.promptFeedback?.blockReason;
        let errorMessage = 'AIが応答を生成できませんでした。';
        if (blockReason) {
            errorMessage += ` (理由: ${blockReason})`;
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage })
        };
    }

    // 結果をフロントエンドに返す
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'バックエンドで内部エラーが発生しました。' })
    };
  }
};
