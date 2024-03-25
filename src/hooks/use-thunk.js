import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";

export function useThunk(thunk) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const runThunk = useCallback(
    (arg) => {
      setIsLoading(true);
      // dispatch 的本質是 promise (async)，所以要用 promise 語法處理
      dispatch(thunk(arg))
        .unwrap()
        // fail
        .catch((err) => setError(err))
        // 無論如何（success or fail），都執行
        .finally(() => setIsLoading(false));
    },
    [dispatch, thunk]
  );

  return [runThunk, isLoading, error];
}
