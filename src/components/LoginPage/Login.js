import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from '../../firebase'; // 2번 단계에서 만든 파일을 import 합니다.
import { FcGoogle } from 'react-icons/fc'; // Google 아이콘 import
import './Login.css'; // CSS 파일 import

function Login() {
  const [user, setUser] = useState(null);

  // 컴포넌트가 마운트될 때 로그인 상태를 감지합니다.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // 컴포넌트가 언마운트될 때 구독을 해제합니다.
    return () => unsubscribe();
  }, []);

  // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // 로그인 성공 시 사용자 정보는 onAuthStateChanged 리스너를 통해 자동으로 업데이트됩니다.
      console.log('로그인 성공:', result.user);
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  return (
    <div>
      {user ? (
        // 로그인된 경우
        <div>
          <h2>환영합니다, {user.displayName}님!</h2>
          <img src={user.photoURL} alt="User profile" style={{ borderRadius: '50%', width: '50px', height: '50px' }} />
          <p>이메일: {user.email}</p>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        // 로그인되지 않은 경우
        <div>
            
          <button onClick={handleGoogleLogin} className="google-login-button">
            <FcGoogle className="google-icon" />
            <span>Google로 로그인</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Login;
