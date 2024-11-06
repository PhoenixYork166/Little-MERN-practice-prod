import { useState, useEffect, useCallback } from 'react';
let logoutTimer; // behind the scenes data, declared outside React <App />

export const useAuth = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ token, setToken ] = useState(false);
  const [ tokenExpirationDate, setTokenExpirationDate ] = useState(null);
  const [ userId, setUserId ] = useState(false);

  const login = useCallback((uid, token, expirationDate) => {
    setToken(token);
    setUserId(uid);

    // Declare Initial (shadowed) tokenExpirationDate before setState
    const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 60 * 60 * 1000); 

    // setState to make available when invoked in useEffect()
    setTokenExpirationDate(tokenExpirationDate); 

    /* Storing 'userData' in localStorage as {userId: uid, token: token } */
    localStorage.setItem('userData', 
      JSON.stringify({
        userId: uid, 
        token: token, 
        expiration: tokenExpirationDate.toISOString() 
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    localStorage.removeItem('userData');
    setUserId(null);
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) { // token exists && tokenExpirationDate !== null
      
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime(); // Number in milli-seconds
      logoutTimer = setTimeout(logout, remainingTime);
    } else { // if (!token)
      clearTimeout(logoutTimer); // clear timer (ms) whenever 'token' changes
    }

  }, [token, logout, tokenExpirationDate]); /* Invoked to re-render whenever 'token'||'logout'||'tokenExpirationDate' changes */

  /* check localStorage for 'userData' on React app starts 
  useEffect(() => {}) runs after React return () cycle */
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) {
      login(storedData.userId, storedData.token, new Date(storedData.expiration));
    }
  }, [login]);

  return { token, login, logout, userId };
}