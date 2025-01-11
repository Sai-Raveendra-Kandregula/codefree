import { useMatches } from "react-router-dom";

export const useRouteData = (routeId : string) => {
    const matches = useMatches();
    const data = matches.find((match) => match.id === routeId)?.data;

    return data as object;
};