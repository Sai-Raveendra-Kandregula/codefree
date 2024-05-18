import React, { useEffect, useState } from 'react';

const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 576) {
        setBreakpoint('xs');
      } else if (width < 768) {
        setBreakpoint('sm');
      } else if (width < 992) {
        setBreakpoint('md');
      } else if (width < 1200) {
        setBreakpoint('lg');
      } else {
        setBreakpoint('xl');
      }
    };

    updateBreakpoint();

    window.addEventListener('resize', updateBreakpoint);

    return () => {
      window.removeEventListener('resize', updateBreakpoint);
    };
  }, []);

  return breakpoint;
};

export {
    useBreakpoint
}