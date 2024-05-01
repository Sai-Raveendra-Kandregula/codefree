import React, { useContext, useEffect, useState, useMemo } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import ErrorPage from './ErrorPage';

export const AppContext = React.createContext();

export const AppProvider = (props) => {
  const [state, setState] = useState({ notFound: false, lastReport: 0 });

  const value = useMemo(
    () => ({
      ...state,
      setNotFound: (notFound) => setState((state) => ({ ...state, notFound })),
      setLastReport: (lastReport) => setState((state) => ({ ...state, lastReport })),
    }),
    [state]
  );

  return <AppContext.Provider value={value} {...props} />;
};

export const NotFound = () => {
  const { notFound, setNotFound } = useContext(AppContext);

  const route_Error = useRouteError()
  
  useEffect(() => {
      if (!notFound) {
        setNotFound(true);
    }
  }, [notFound]);

  return <ErrorPage errorNumber={isRouteErrorResponse(route_Error) ? route_Error.status : (route_Error) ? route_Error : 404 } />;
};

export const useApp = () => useContext(AppContext);
