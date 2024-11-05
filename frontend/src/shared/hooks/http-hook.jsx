import { useState, useCallback, useRef, useEffect } from 'react';

// Custom React Hooks 'useHttpClient'
export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(
    // Default method: 'GET, body: null
    async (url, method = 'GET', body = null, headers = {}) => {
      setIsLoading(true);
      
      const httpAbortCtrl = new AbortController();
      
      // Avoid HTTP requests to be sent too quick before the component is even rendered
      activeHttpRequests.current.push(httpAbortCtrl);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal
        });

        const responseData = await response.json();
        console.log(`\nfrontend/src/shared/hooks/http-hook.jsx\nresponseData:\n`, responseData, `\n`);

        // Removing the currently activeHttpRequest controller from [] for this specific request
        activeHttpRequests.current = activeHttpRequests.current.filter(
          reqCtrl => reqCtrl !== httpAbortCtrl
        );

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        console.error(`\nError sendRequest:\n`, err, `\n`);
        setError(err.message);
        setIsLoading(false);
        throw err;
      }
    },
    [] // Avoid re-rendering of a callback by using useCallback & [] listener
  );

  const clearError = () => {
    setError(null);
  };

  // To clean up logic when component 'activeHttpRequests' that uses this useEffect() unmounts
  // Only run once when the component mounts
  useEffect(() => {
    return () => { // this 'return' serves as a Clean up function before next time useEffect() runs again

      // eslint-disable-next-line react-hooks/exhaustive-deps
      // activeHttpRequests.current also is [] of AbortControllers
      activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
