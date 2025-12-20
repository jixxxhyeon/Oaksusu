// /api/getBookRecommendations.js

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    // 메시지 검증
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '유효하지 않은 요청입니다.' });
    }

    // 환경 변수 확인
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY가 설정되지 않았습니다.');
      return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
    }

    // OpenAI API 호출
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `당신은 도서 추천 전문가입니다. 사용자의 요청에 따라 적절한 책을 추천해주세요. 
응답은 반드시 다음 JSON 형식으로 해주세요:
{
  "message": "추천 설명",
  "bookTitles": ["책 제목1", "책 제목2", "책 제목3"]
}

최대 5권까지 추천하고, 한국어 책을 우선으로 추천해주세요.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API 오류:', errorText);
      return res.status(500).json({ 
        error: 'AI 응답 생성에 실패했습니다.',
        details: errorText.substring(0, 200)
      });
    }

    const openaiData = await openaiResponse.json();
    const aiMessage = openaiData.choices[0].message.content;

    console.log('OpenAI 응답:', aiMessage);

    // JSON 파싱 시도
    let parsedResponse;
    try {
      // JSON 코드 블록 제거
      const cleanedMessage = aiMessage.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedMessage);
    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError);
      // JSON 파싱 실패 시 텍스트 응답만 반환
      return res.status(200).json({
        message: aiMessage,
        books: []
      });
    }

    const bookTitles = parsedResponse.bookTitles || [];
    
    if (bookTitles.length === 0) {
      return res.status(200).json({
        message: parsedResponse.message || aiMessage,
        books: []
      });
    }

    // Google Books API로 책 정보 가져오기
    const bookPromises = bookTitles.map(async (title) => {
      try {
        const searchQuery = encodeURIComponent(title);
        const googleBooksUrl = GOOGLE_BOOKS_API_KEY 
          ? `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=1`
          : `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=1`;
        
        const response = await fetch(googleBooksUrl);
        
        if (!response.ok) {
          console.error(`Google Books API 오류 (${title}):`, response.status);
          return null;
        }

        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          const book = data.items[0];
          return {
            id: book.id,
            title: book.volumeInfo.title,
            authors: book.volumeInfo.authors || ['저자 미상'],
            coverUrl: book.volumeInfo.imageLinks?.thumbnail || 
                     book.volumeInfo.imageLinks?.smallThumbnail ||
                     'https://via.placeholder.com/140x180?text=No+Image'
          };
        }
        return null;
      } catch (error) {
        console.error(`책 정보 가져오기 실패 (${title}):`, error);
        return null;
      }
    });

    const books = (await Promise.all(bookPromises)).filter(book => book !== null);

    return res.status(200).json({
      message: parsedResponse.message || '이런 책들을 추천드립니다!',
      books: books
    });

  } catch (error) {
    console.error('API 함수 오류:', error);
    return res.status(500).json({ 
      error: '서버 오류가 발생했습니다.',
      details: error.message 
    });
  }
}