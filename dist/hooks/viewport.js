import {useState, useEffect} from "../pkg/react.js";
export function useWidthObserver(ref, offset = 0) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const updateWidth = () => {
      if (ref.current) {
        const newWidth = ref.current.getBoundingClientRect().width - offset;
        if (newWidth !== width) {
          setWidth(newWidth);
        }
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  });
  return width;
}
export function useHeightObserver(ref, offset = 0) {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const updateHeight = () => {
      if (ref.current) {
        const newHeight = ref.current.getBoundingClientRect().height - offset;
        if (newHeight !== height) {
          setHeight(newHeight);
        }
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  });
  return height;
}
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({});
  useEffect(() => {
    const updateSize = () => {
      if (windowSize.width !== window.innerWidth || windowSize.height !== window.innerHeight) {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
    };
  });
  return windowSize;
}
export function useIsSmallScreen() {
  const {width} = useWindowSize();
  return width < 768;
}
export function useIsMediumUpScreen() {
  const {width} = useWindowSize();
  return width >= 768;
}
