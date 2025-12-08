import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import LoginPage from "../src/LoginPage/Login";
import MainPage from "../src/MainPage/Main";
import DetailPage from "../src/DetailPage/Detail";
import "./App.css";

function App() {
  // 검색어 상태를 App 컴포넌트로 끌어올려서 관리하도록 변경
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <MainPage
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              setSearchResults={setSearchResults}
            />
          }
        />
        <Route path="/book/:id" element={<DetailPage />} />
      </Routes>
    </div>
  );
}

export default App;

