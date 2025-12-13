
import { useLocation, useNavigate } from "react-router-dom";
// import "./Detail.css";   // 필요하면 추후 스타일 입히기

const Detail = () => {
  //const { id } = useParams();               // /book/:id 에서 id 가져오기 (필요할 수 있으니, 일단 넣어둠)
  const location = useLocation();
  const navigate = useNavigate();
  const book = location.state?.book;

  // 새로고침하면 state 가 사라질 수 있으니, 그럴 경우 대비한 처리
  if (!book) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>책 정보를 불러올 수 없습니다.</p>
        <button onClick={() => navigate(-1)}>뒤로가기</button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← 뒤로가기
      </button>

      <div className="detail-content">
        <img
          src={
            book.volumeInfo.imageLinks?.thumbnail ||
            "https://via.placeholder.com/128x192?text=No+Image"
          }
          alt={book.volumeInfo.title}
          className="detail-cover"
        />
        <div className="detail-info">
          <h1 className="detail-title">{book.volumeInfo.title}</h1>
          {book.volumeInfo.authors && (
            <p className="detail-author">저자: {book.volumeInfo.authors.join(", ")}</p>
          )}
          {book.volumeInfo.publishedDate && (
            <p className="detail-published">출판일: {book.volumeInfo.publishedDate}</p>
          )}
          {book.volumeInfo.publisher && (
            <p className="detail-publisher">출판사: {book.volumeInfo.publisher}</p>
          )}
          {book.volumeInfo.description && (
            <p className="detail-description">{book.volumeInfo.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detail;
