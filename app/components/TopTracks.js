"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Lista from "./Lista";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import { LinearProgress } from "@mui/material";
import ShowSimpleData from "./ShowSimpleData";

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

      const maxPopularity = Math.max(
        ...tracks.map((track) => track.popularity)
      );
      const minPopularity = Math.min(
        ...tracks.map((track) => track.popularity)
      );

      const mostPopularTracks = tracks.filter(
        (track) => track.popularity === maxPopularity
      );
      const leastPopularTracks = tracks.filter(
        (track) => track.popularity === minPopularity
      );

      const maxArtistsCount = Math.max(
        ...tracks.map((track) => track.artists.length)
      );
      const tracksWithMostArtists = tracks.filter(
        (track) => track.artists.length === maxArtistsCount
      );


      const sortedArtists = Object.entries(trackCountByArtist)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100);

        let sortedByPopularity = [];
        sortedByPopularity = [...tracks];
      sortedByPopularity.sort((a,b)=>b.popularity-a.popularity)
      const sortedByPopularityCut = sortedByPopularity.slice(0,100);

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
        tracksWithMostArtists,
        sortedByPopularityCut
      }));
      
    }
  }, [tracks]);

  const handleLogout = () => {
    router.push("/");
  };

  function convertMsToMinutesSeconds(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m${seconds}s`;
  }

  return (
    <div className={styles.main}>
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

      {estadisticas.totalPistasChecked !== estadisticas.totalTracks && (
        <progress
        className="progress is-success is-small"  
        value={
            (estadisticas.totalPistasChecked * 100) / estadisticas.totalTracks
          }
          max={100}
        />
      )}

      <table className="table">
        <tbody>
          <tr>
            <td>Total de pistas</td>
            <td>{estadisticas.totalTracks}</td>
          </tr>
          {estadisticas.totalTracks !== estadisticas.totalPistasChecked &&
              <tr>
              <td>Total de pistas analizadas</td>
              <td>{estadisticas.totalPistasChecked}</td>
          </tr>
          }
                 
          <tr>
            <td>Total de artistas</td>
            <td>{estadisticas.totalArtists}</td>
          </tr>
          <tr>
            <td>Canción más larga</td>
            <td><p>{estadisticas.longestTrack?.name}</p>
               <p>{convertMsToMinutesSeconds(estadisticas.tiempoMasLarga)}</p></td>
          </tr>
          <tr>
            <td>Canción más corta</td>
            <td><p>{estadisticas.shortestTrack?.name}</p>
            <p>{convertMsToMinutesSeconds(estadisticas.tiempoMasCorta)}</p></td>
          </tr>
          <tr>
            <td>Canción con más artistas</td>
            <td><p>{estadisticas.tracksWithMostArtists
          ?.map((track) => track.name)
          .join(", ")}</p><p>Número de artistas: {estadisticas.maxArtistsCount}</p></td>
          </tr>
          
        </tbody>
      </table>

      <table className="table">
        <thead>
          <tr>
            <th>Nª</th>
            <th>Artista</th>
            <th>Número de canciones</th>
          </tr>
        </thead>
        <tbody>
        {Object.entries(estadisticas.artists).map((item) => (
          <tr>
            <td>{Number(item[0])+1}</td>
            <td>{item[1][0]}</td>
            <td>{item[1][1]}</td>
          </tr>
        ))}
        </tbody>
      </table>


    
    <ol>
        {Object.entries(estadisticas.artists).map(([artist, count]) => (
          <li key={artist}>
            {`${artist}:  ${count}`}
          </li>
        ))}
      </ol>
      <ol type="1">
        {estadisticas.sortedByPopularityCut?.map((track)=>(
          <li  key={track.id} style={{width:track.popularity+"%"}} className={styles.popularityItem}>
            <p>{track.name} , {track.artists.map(artist=>artist.name)} </p>
            <p> {track.popularity}
            </p></li>))}
      </ol>
      <Lista items={tracks} />     
    </div>
  );
};

export default TopTracks;
