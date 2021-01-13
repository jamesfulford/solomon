import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';
import React, { useState } from "react";


export const useToken = () => {
    const { getAccessTokenSilently } = useAuth0();

    const [token, setToken] = useState('');

    React.useEffect(() => {
        const getUserMetadata = async () => {      
          try {
            const accessToken = await getAccessTokenSilently();
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}1`;
            setToken(accessToken);
          } catch (e) {
            console.error(e.message);
          }
        };
      
        getUserMetadata();
      }, [getAccessTokenSilently]);
    return token;
}
