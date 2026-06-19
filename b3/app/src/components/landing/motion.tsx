import { motion as fmMotion, type HTMLMotionProps, type SVGMotionProps } from "framer-motion";
import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

const LandingMotionHydratedContext = createContext(false);

/** Gate enter / in-view animations until after hydration so SSR markup stays visible. */
export function LandingMotionRoot({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return (
    <LandingMotionHydratedContext.Provider value={hydrated}>
      {children}
    </LandingMotionHydratedContext.Provider>
  );
}

function useLandingMotionHydrated() {
  return useContext(LandingMotionHydratedContext);
}

function wrapMotionComponent(Tag: keyof typeof fmMotion) {
  const MotionComponent = fmMotion[Tag] as ComponentType<HTMLMotionProps<"div">>;
  const Wrapped = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
    function LandingMotionComponent({ initial, animate, whileInView, ...props }, ref) {
      const hydrated = useLandingMotionHydrated();
      return createElement(MotionComponent, {
        ...props,
        ref,
        initial: hydrated ? initial : false,
        animate: hydrated ? animate : undefined,
        whileInView: hydrated ? whileInView : undefined,
      });
    },
  );
  Wrapped.displayName = `LandingMotion.${String(Tag)}`;
  return Wrapped;
}

const motionCache = new Map<string, ReturnType<typeof wrapMotionComponent>>();

export const motion = new Proxy({} as typeof fmMotion, {
  get(_target, tag: string | symbol) {
    if (typeof tag !== "string") return undefined;
    if (!motionCache.has(tag)) {
      motionCache.set(tag, wrapMotionComponent(tag as keyof typeof fmMotion));
    }
    return motionCache.get(tag);
  },
});

export { AnimatePresence } from "framer-motion";
export type { HTMLMotionProps, SVGMotionProps };
