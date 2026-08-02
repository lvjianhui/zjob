"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * 通用异步数据 hook：组件挂载时自动执行，支持取消。
 * 返回 { data, loading, error }，先返回的先渲染。
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = []
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fnRef
      .current()
      .then((result) => {
        if (!cancelled) {
          setState({ data: result, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error: err });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  return { ...state, reload };
}
