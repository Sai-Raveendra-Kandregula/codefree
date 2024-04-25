import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useRouteError } from 'react-router-dom';

export const AppContext = React.createContext();

export const AppProvider = (props) => {
  const [state, setState] = useState({ notFound: false, routeError: null, lastReport: 0 });

  const value = useMemo(
    () => ({
      ...state,
      setNotFound: (notFound) => setState((state) => ({ ...state, notFound })),
      setRouteError: (routeError) => setState((state) => ({ ...state, routeError })),
      setLastReport: (lastReport) => setState((state) => ({ ...state, lastReport })),
    }),
    [state]
  );

  return <AppContext.Provider value={value} {...props} />;
};

export const NotFound = () => {
  const { notFound, setNotFound, routeError, setRouteError } = useContext(AppContext);

  const route_Error = useRouteError()
  
  useEffect(() => {
      if (!notFound) {
        setNotFound(true);
        setRouteError(route_Error);
    }
  }, [notFound]);

  return <></>;
};

export const useApp = () => useContext(AppContext);
