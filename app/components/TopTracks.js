"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import styles from "../page.module.css";
import Cookies from "js-cookie";
import { CircularProgress } from "@mui/material";
import { FaPlay } from "react-icons/fa";

const TopTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
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
          setEstadisticas((prevEstadisticas) => ({
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
        const imgAlbum = track.album?.images[0]?.url;
        track.artists.forEach((artist) => {
          if (!acc[artist.id]) {
            acc[artist.id] = {
              id: artist.id,
              name: artist.name,
              count: 0,
              urlImg: imgAlbum,
              urlArtist: artist.external_urls.spotify,
            };
          }
          acc[artist.id].count++;
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

      const sortedArtists = Object.values(trackCountByArtist).sort(
        (a, b) => b.count - a.count
      );
      let sortedByPopularity = [];
      sortedByPopularity = [...tracks];
      sortedByPopularity.sort((a, b) => b.popularity - a.popularity);
      const sortedByPopularityCut = sortedByPopularity.slice(0, 100);
      const maxSongsByArtist = 100;

      setEstadisticas((prevEstadisticas) => ({
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

  const convertMsToMinutesSeconds = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m${seconds}s`;
  };

  const TrackCardView = ({ tracks }) => {
    if (!tracks || tracks.length === 0) {
      return null; // No renderiza nada si tracks está vacío o undefined
    }

    return (
      <div>
        {tracks.slice(0, 50).map((track, index) => (
          <div className="card" key={track.id}>
            <div className="card-content">
              <div className="media">
                <div className="media-left">
                  <figure className="image is-48x48">
                    <img
                      style={{ borderRadius: "10px" }}
                      src={track.album?.images[0]?.url}
                      alt="Artist image"
                    />
                  </figure>
                </div>
                <div className="media-content">
                  <p className="title is-4">{track.name}</p>
                  <p className="subtitle is-6">
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </p>
                </div>
                <div className="media-right">
                  <p>
                    <strong className="has-text-success">{index + 1}</strong>
                  </p>
                  <a
                    href={track.external_urls?.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaPlay className="has-text-success" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ArtistList = ({ artistas }) => {
    if (
      !artistas ||
      artistas.length === 0 ||
      typeof artistas.length === "undefined"
    ) {
      return null; // No muestra nada si no hay datos
    }

    return (
      <div>
        {artistas.slice(0,50).map((artist, index) => (
          <div key={artist.id} className="card">
            <div className="card-content">
              <div className="media">
                <div className="media-left">
                  <figure className="image is-48x48">
                    <img
                      style={{ borderRadius: "10px" }}
                      src={artist.urlImg}
                      alt="Artist image"
                    />
                  </figure>
                </div>
                <div className="media-content">
                  <p className="title is-4">{artist.name}</p>
                  <p className="subtitle is-6">Canciones: {artist.count}</p>
                </div>
                <div className="media-right">
                  <p>
                    <strong className="has-text-success">{index + 1}</strong>
                  </p>
                  <a
                    href={artist.urlArtist}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaPlay className="has-text-success" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return loadingFirstSongs ? (
    <CircularProgress color="success" />
  ) : (
    <>
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
          <ArtistList artistas={estadisticas?.artists} />
        </div>
        <div className="column">
          <h1>Canciones con más popularidad</h1>
          <TrackCardView tracks={estadisticas?.sortedByPopularityCut} />
        </div>
        <div className="column">
          <h1>Tus pistas más escuchadas</h1>
          <TrackCardView tracks={tracks} />
        </div>
      </div>
    </>
  );
};

export default TopTracks;
