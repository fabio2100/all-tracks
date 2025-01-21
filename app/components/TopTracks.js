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
    //if((tracks.length === estadisticas.totalTracks) ){
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
console.log('------------------------------------')
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
      // Canción con más y menos popularidad
      const mostPopularTrack = tracks.reduce(
        (mostPopular, track) =>
          track.popularity > mostPopular.popularity ? track : mostPopular,
        tracks[0]
      );
      const leastPopularTrack = tracks.reduce(
        (leastPopular, track) =>
          track.popularity < leastPopular.popularity ? track : leastPopular,
        tracks[0]
      );
      // Canción con más artistas
      const trackWithMostArtists = tracks.reduce(
        (mostArtists, track) =>
          track.artists.length > mostArtists.artists.length
            ? track
            : mostArtists,
        tracks[0]
      );
      console.log("Canción más larga:", longestTrack);
      console.log("Canción más corta:", shortestTrack);
      console.log("Canción con más popularidad:", mostPopularTrack);
      console.log("Canción con menos popularidad:", leastPopularTrack);
      console.log("Canción con más artistas:", trackWithMostArtists);

      const sortedArtists = Object.entries(trackCountByArtist)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100);

      setTotalEstadisticas((prevEstadisticas) => ({
        ...prevEstadisticas,
        artists: sortedArtists,
        totalPistasChecked: tracks.length,
        totalArtists: Object.keys(trackCountByArtist).length,
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
