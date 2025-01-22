"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Lista from "./Lista";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

const TopTracks = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tracks, setTracks] = useState([]);
  const [estadisticas, setTotalEstadisticas] = useState({
    artists: {},
  });
  const access_token = searchParams.get("access_token");
  const isDevelopment = process.env.NEXT_PUBLIC_DEVELOPMENT === "1";

  useEffect(() => {
    const fetchTopTracks = async (offset = 0) => {
      if (!access_token) return;

      try {
        const response = await axios.get(
          "https://api.spotify.com/v1/me/top/tracks",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
            params: {
              time_range: "long_term",
              limit: 50,
              offset: offset,
            },
          }
        );

        // Actualiza el total de pistas si no está configurado

        if (!estadisticas.hasOwnProperty("totalTracks")) {
          estadisticas.totalTracks = response.data.total; // Asigna el valor que desees
          setTotalEstadisticas((prevEstadisticas) => ({
            ...prevEstadisticas,
            totalTracks: response.data.total,
          }));
        }

        // Agrega las pistas obtenidas a la lista existente
        setTracks((prevTracks) => [...prevTracks, ...response.data.items]);

        // Si aún no se han obtenido todas las pistas, realiza otra petición
        if (
          offset + 50 < response.data.total &&
          !(isDevelopment && offset >= 1000)
        ) {
          fetchTopTracks(offset + 50);
        }
      } catch (error) {
        console.error("Error fetching top tracks:", error);
      }
    };

    fetchTopTracks();
  }, [access_token]);

  useEffect(() => {
    if (tracks.length > 0) {
        const trackCountByArtist = tracks.reduce((acc, track) => {
            track.artists.forEach((artist) => {
                if (!acc[artist.name]) {
                    acc[artist.name] = 0;
                }
                acc[artist.name]++;
            });
            return acc;
        }, {});
        
        const longestTrack = tracks.reduce(
            (longest, track) =>
                track.duration_ms > longest.duration_ms ? track : longest,
            tracks[0]
        );
        const shortestTrack = tracks.reduce(
            (shortest, track) =>
                track.duration_ms < shortest.duration_ms ? track : shortest,
            tracks[0]
        );

        const maxPopularity = Math.max(...tracks.map(track => track.popularity));
        const minPopularity = Math.min(...tracks.map(track => track.popularity));
        
        const mostPopularTracks = tracks.filter(track => track.popularity === maxPopularity);
        const leastPopularTracks = tracks.filter(track => track.popularity === minPopularity);

        const maxArtistsCount = Math.max(...tracks.map(track => track.artists.length));
        const tracksWithMostArtists = tracks.filter(track => track.artists.length === maxArtistsCount);

        console.log("Canción más larga:", longestTrack);
        console.log("Canción más corta:", shortestTrack);
        console.log("Canciones con más popularidad:", mostPopularTracks);
        console.log("Canciones con menos popularidad:", leastPopularTracks);
        console.log("Canciones con más artistas:", tracksWithMostArtists);

        const sortedArtists = Object.entries(trackCountByArtist)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 100);

        setTotalEstadisticas((prevEstadisticas) => ({
            ...prevEstadisticas,
            artists: sortedArtists,
            totalPistasChecked: tracks.length,
            totalArtists: Object.keys(trackCountByArtist).length,
            longestTrack,
            shortestTrack,
            mostPopularTracks,
            leastPopularTracks,
            tiempoMasLarga: longestTrack.duration_ms,
            tiempoMasCorta: shortestTrack.duration_ms,
            maxPopularity,
            minPopularity,
            maxArtistsCount,
            tracksWithMostArtists
        }));
    }
}, [tracks]);



  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div>
      <div className={styles.header}>
        <h2 style={{ marginTop: ".5em", marginBottom: "0.25em" }}>
          Tus pistas escuchadas
        </h2>
        <p className={styles.logout} onClick={handleLogout}>
          Logout
        </p>
      </div>
      <h2 style={{ marginTop: ".5em", marginBottom: "0.25em" }}>
        Estadísticas
      </h2>
      <p>Total de pistas: {estadisticas.totalTracks}</p>
      <p>Total de Pistas analizadas: {estadisticas.totalPistasChecked}</p>
      <p>Total de artistas: {estadisticas.totalArtists}</p>
      <p>Canción más larga: {estadisticas.longestTrack?.name}</p>
      <p>Tiempo de la canción más larga: {estadisticas.tiempoMasLarga}</p>
      <p>Canción más corta: {estadisticas.shortestTrack?.name}</p>
      <p>Tiempo de la canción más corta: {estadisticas.tiempoMasCorta}</p>
      <p>Canciones con más popularidad: {estadisticas.mostPopularTracks?.map(track => track.name).join(', ')}</p>
      <p>Valor de popularidad de las canciones más populares: {estadisticas.maxPopularity}</p>
      <p>Canciones con menos popularidad: {estadisticas.leastPopularTracks?.map(track => track.name).join(', ')}</p>
      <p>Valor de popularidad de las canciones menos populares: {estadisticas.minPopularity}</p>
      <p>Canciones con más artistas: {estadisticas.tracksWithMostArtists?.map(track => track.name).join(', ')}</p>
      <p>Cantidad de artistas en las canciones con más artistas: {estadisticas.maxArtistsCount}</p>
      <ul>
        {Object.entries(estadisticas.artists).map(([artist, count]) => (
          <li key={artist}>
            {artist}: {count}
          </li>
        ))}
      </ul>
      <Lista items={tracks} />
    </div>
  );
};

export default TopTracks;
