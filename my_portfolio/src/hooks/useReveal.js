import { useEffect, useRef, useState } from 'react';

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

//const observer = new IntersectionObserver(
  //([entry]) => {
    //if (entry.isIntersecting) {
      //setVisible(true);
      //observer.unobserve(element);
    //}
  //},
  //{ threshold: 0.15, rootMargin: '0px 0px -100px 0px' }
//);

const observer = new IntersectionObserver(
  ([entry]) => {
    setVisible(entry.isIntersecting);   // true en entrant, false en sortant
  },
  { threshold: 0.15 }
);

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

export default useReveal;
