import { useEffect } from "react";

function useAsyncEffect(
  effect: () => Promise<void | (() => void)>,
  deps: any[],
  options?: {
    onError?: (erroe: any) => void;
    onFinally?: () => void;
  }
) {
  useEffect(() => {
    let cleanup: void | (() => void);

    const runEffect = async () => {
      cleanup = await effect();
    };

    try {
      runEffect();
    } catch (error) {
      if (options?.onError) {
        options?.onError?.(error);
      } else {
        throw error;
      }
    } finally {
      options?.onFinally?.();
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, deps);
}

export default useAsyncEffect;
