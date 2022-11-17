import { useCallback, useEffect, useState } from "react";

export function useAsync(func, dep = []) {
  const { execute, ...state } = useAsyncInternal(func, dep, true);
  useEffect(() => {
    execute();
  }, [execute]);
  return state;
}
export function useAsyncFn(func, dep = []) {
  return useAsyncInternal(func, dep, false);
}

function useAsyncInternal(func, dep, initalLoading = false) {
  const [loading, setLoading] = useState(initalLoading);
  const [error, setError] = useState();
  const [value, setValue] = useState();

  const execute = useCallback((...params) => {
    setLoading(true);
    return func(...params)
      .then((data) => {
        setValue(data);
        setError(undefined);
        return data;
      })
      .catch((err) => {
        setValue(undefined);
        setError(err);
        return Promise.reject(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, dep);

  return { loading, value, error, execute };
}
