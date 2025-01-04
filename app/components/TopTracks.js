'use client';


import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Lista from './Lista';

const TopTracks = () => {
  const searchParams = useSearchParams();
  const [tracks, setTracks] = useState([]);
  const [totalTracks, setTotalTracks] = useState(false);
  const access_token = searchParams.get('access_token');
  const isDevelopment = process.env.NEXT_PUBLIC_DEVELOPMENT === '1';

  useEffect(() => {
    const fetchTopTracks = async (offset = 0) => {
      if (!access_token) return;

      try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
          headers: {
            Authorization: `Bearer ${access_token}`
          },
          params: {
            time_range: 'long_term',
            limit: 50,
            offset: offset
          }
        });

        // Actualiza el total de pistas si no está configurado
        if (!totalTracks) {
          setTotalTracks(response.data.total);
        }

        // Agrega las pistas obtenidas a la lista existente
        setTracks(prevTracks => [...prevTracks, ...response.data.items]);

        // Si aún no se han obtenido todas las pistas, realiza otra petición
        if ((offset + 50 < response.data.total) && !(isDevelopment && offset >= 100)) {
          fetchTopTracks(offset + 50);
      }
      
      } catch (error) {
        console.error('Error fetching top tracks:', error);
      }
    };

    fetchTopTracks();
  }, [access_token]);

  return (
    <div>
      <h1 style={{marginTop:".5em",marginBottom:"0.25em"}}>Tus pistas escuchadas</h1>
      <Lista items={tracks}/>
    </div>
  );
};

export default TopTracks;
