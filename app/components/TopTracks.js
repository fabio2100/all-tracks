"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import styles from "../page.module.css";
import Cookies from "js-cookie";
import { CircularProgress } from "@mui/material";

const TopTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [estadisticas, setTotalEstadisticas] = useState({
    artists: {},
  });
  const access_token = Cookies.get("spotify_access_token");
  const isDevelopment = process.env.NEXT_PUBLIC_DEVELOPMENT === "1";
  const [loadingFirstSongs, setLoadingFirstSongs] = useState(true);

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
        setLoadingFirstSongs(false);

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
      sortedByPopularity.sort((a, b) => b.popularity - a.popularity);
      const sortedByPopularityCut = sortedByPopularity.slice(0, 100);

      const maxSongsByArtist = sortedArtists[0][1];

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
        sortedByPopularityCut,
        maxSongsByArtist,
      }));
    }
  }, [tracks]);

  function convertMsToMinutesSeconds(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m${seconds}s`;
  }

  return loadingFirstSongs ? (
    <CircularProgress color="success" />
  ) : (
    <div className={styles.main}>
      <h2 style={{ marginTop: ".5em", marginBottom: "0.25em" }}>
        Estadísticas
      </h2>

      {estadisticas.totalPistasChecked !== estadisticas.totalTracks && (
        <progress
          className="progress is-success is-small"
          value={
            (estadisticas?.totalPistasChecked * 100) / estadisticas?.totalTracks
          }
          max={100}
        />
      )}

      <div className="columns">
        <div className="column">
          <table className="table">
            <tbody>
              <tr>
                <td>Total de pistas</td>
                <td>{estadisticas.totalTracks}</td>
              </tr>
              {estadisticas.totalTracks !== estadisticas.totalPistasChecked && (
                <tr>
                  <td>Total de pistas analizadas</td>
                  <td>{estadisticas.totalPistasChecked}</td>
                </tr>
              )}

              <tr>
                <td>Total de artistas</td>
                <td>{estadisticas.totalArtists}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="column">
          <table className="table">
            <tbody>
              <tr>
                <td>Canción más larga</td>
                <td>
                  <p>
                    {estadisticas.longestTrack?.name} By{" "}
                    {estadisticas.longestTrack?.artists.map(
                      (artist) => artist.name
                    )}
                  </p>
                  <p>
                    {convertMsToMinutesSeconds(estadisticas?.tiempoMasLarga)}
                  </p>
                </td>
              </tr>
              <tr>
                <td>Canción más corta</td>
                <td>
                  <p>
                    {estadisticas.shortestTrack?.name} By{" "}
                    {estadisticas.shortestTrack?.artists.map(
                      (artist) => artist.name
                    )}
                  </p>
                  <p>
                    {convertMsToMinutesSeconds(estadisticas?.tiempoMasCorta)}
                  </p>
                </td>
              </tr>
              <tr>
                <td>Canción con más artistas</td>
                <td>
                  <p>
                    {estadisticas.tracksWithMostArtists
                      ?.map((track) => track.name)
                      .join(", ")}
                  </p>
                  <p>Número de artistas: {estadisticas?.maxArtistsCount}</p>
                  <small>
                    {estadisticas.tracksWithMostArtists?.map((track) =>
                      track?.artists?.map((artist) => artist.name).join(", ")
                    )}
                  </small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="columns">
        <div className="column">
          <h1>Canciones por artista</h1>
          <table className="table is-fullwidth">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>Nª</th>
                <th style={{ width: "40%" }}>Artista</th>
                <th style={{ width: "40%" }}>Canciones</th>
                <th style={{ width: "10%" }}>Número</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(estadisticas.artists).map((item) => (
                <tr key={item[0]}>
                  <td>{Number(item[0]) + 1}</td>
                  <td>{item[1][0]}</td>
                  <td>
                    <div className={styles.divNroCanciones}>
                      <progress
                        className="progress is-success is-small"
                        value={item[1][1] ? item[1][1] : 0}
                        max={estadisticas.maxSongsByArtist}
                      />
                    </div>
                  </td>
                  <td>{item[1][1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="column">
          <h1>Canciones con más popularidad</h1>
          <table className="table is-fullwidth">
            <thead>
              <tr>
                <th>Nª</th>
                <th>Canción</th>
                <th>Popularidad</th>
              </tr>
            </thead>
            <tbody>
              {estadisticas.sortedByPopularityCut?.map((track, index) => (
                <tr key={track.id}>
                  <td>{index + 1}</td>
                  <td>
                    {track.name} By{" "}
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </td>
                  <td>
                    <progress
                      className="progress is-success is-small"
                      value={track?.popularity}
                      max={100}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="column">
          <h1>Tus pistas más escuchadas</h1>
          <table className="table is-fullwidth">
            <thead>
              <tr>
                <th>Nª</th>
                <th>Canción</th>
              </tr>
            </thead>
            <tbody>
              {tracks
                .map((track, index) => (
                  <tr key={`table2${track.id}`}>
                    <td>{index + 1}</td>
                    <td>
                      {track.name} By{" "}
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </td>
                  </tr>
                ))
                .slice(0, 100)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopTracks;
