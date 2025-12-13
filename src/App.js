import {Routes, Route } from "react-router-dom";
import LoginPage from '../src/LoginPage/Login'
import MainPage from '../src/MainPage/Main'; 
import './App.css';

function App() {
  return (
    <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
        </Routes>
    </div>
  );
}

export default App;