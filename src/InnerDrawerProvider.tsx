import {
  MutableRefObject,
  useLayoutEffect,
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDebounce } from 'use-debounce';

type Ref = MutableRefObject<HTMLDivElement | null>;

interface InnerDrawerProviderType {
  refs: Map<string, Ref>;
  register: (id: string, ref: Ref) => void;
}

export function InnerDrawerProvider({ children }: PropsWithChildren) {
  const { current: refs } = useRef<Map<string, Ref>>(new Map());

  const register = useCallback<InnerDrawerProviderType['register']>(
    (id, ref) => refs.set(id, ref),
    [refs],
  );

  const memoizedValue = useMemo(
    () => ({
      refs,
      register,
    }),
    [refs, register],
  );
  return (
    <InnerDrawerContext.Provider value={memoizedValue}>
      {children}
    </InnerDrawerContext.Provider>
  );
}

export const InnerDrawerContext = createContext<InnerDrawerProviderType>(
  {} as InnerDrawerProviderType,
);

export function useRegisterContainer(id: string) {
  const { register } = useContext(InnerDrawerContext);
  const newRef = useRef<HTMLDivElement>(null);

  register(id, newRef);

  return newRef;
}

export function useGetContainer(id: string) {
  const { refs } = useContext(InnerDrawerContext);
  const [, setRerenderSignal] = useState({});

  const [handleResize] = useDebounce(() => setRerenderSignal({}), 5);

  useLayoutEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return refs.get(id)?.current;
}
