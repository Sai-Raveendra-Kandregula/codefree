import React, { useCallback, version } from 'react'
import { SERVER_BASE_URL } from '../App';

export type APIVersion = "v1"

function removePrefix(str : string, prefix : string) {
    if (str.startsWith(prefix)) {
      return str.slice(prefix.length);
    }
    return str;
  }

export function getAPIURL (url : string, version : APIVersion = "v1"){
    return `${SERVER_BASE_URL}/-/${version}/${removePrefix(url, "/")}`
}

function useAPI(version: APIVersion = "v1") {
    return {
        getAPIURL : useCallback((url : string) => {
            return `${SERVER_BASE_URL}/-/${version}/${removePrefix(url, "/")}`
        }, [version])
    }
}

export default useAPI