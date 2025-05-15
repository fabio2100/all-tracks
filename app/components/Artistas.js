import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ScatterChart } from "@mui/x-charts";
import { createTheme, ThemeProvider } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function Artistas() {
  const access_token = Cookies.get("spotify_access_token");
  const [originalArtistas, setOriginalArtistas] = useState([]);
  const [sortedByFollowers, setSortedByFollowers] = useState([]);
  const [sortedByPopularity, setSortedByPopularity] = useState([]);
  const [genres, setGenres] = useState([]);

  const seguidoresAUnidades = (cantidad) => {
    if (Math.floor(cantidad) / 1000000 > 1) {
      return `${Math.floor(cantidad / 1000000)} M`;
    }
    if (Math.floor(cantidad) / 1000 > 1) {
      return `${Math.floor(cantidad / 1000)} k`;
    }
    return cantidad;
  };

  useEffect(() => {
    if (!access_token) return;

    const fetchAllArtists = async () => {
      let allArtists = [];
      let offset = 0;
      const limit = 50;
      let hasMore = true;

      try {
        while (hasMore) {
          const response = await axios.get(
            "https://api.spotify.com/v1/me/top/artists",
            {
              params: { time_range: "long_term", limit, offset },
              headers: { Authorization: `Bearer ${access_token}` },
            }
          );

          if (response.data.items.length > 0) {
            allArtists = [...allArtists, ...response.data.items];
            offset += limit;
          } else {
            hasMore = false;
          }
          setOriginalArtistas(allArtists);
          setSortedByFollowers(
            [...allArtists].sort(
              (a, b) => b.followers.total - a.followers.total
            )
          );
          setSortedByPopularity(
            [...allArtists].sort((a, b) => b.popularity - a.popularity)
          );
          processGenres(allArtists);
        }
      } catch (error) {
        console.error("Error en la petición:", error);
      }
    };

    const processGenres = (artists) => {
      const genreCount = {};

      artists.forEach((artist) => {
        artist.genres.forEach((genre) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      });

      const sortedGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .map(([genre, count]) => ({ genre, count }));

      setGenres(sortedGenres);
    };

    fetchAllArtists();
  }, [access_token]);

  const artistCardView = (artists, tipo) =>
    artists
      .map((artista, index) => {
        const posicionOriginal =
          originalArtistas.findIndex((a) => a.id === artista.id) + 1;
        const posicionFollowers =
          sortedByFollowers.findIndex((a) => a.id === artista.id) + 1;
        const posicionPopularity =
          sortedByPopularity.findIndex((a) => a.id === artista.id) + 1;

        return (
          <div key={artista.id}>
            <div className="card">
              <div className="card-content">
                <div className="media">
                  <div className="media-left">
                    <figure className="image is-48x48">
                      <img
                        style={{ borderRadius: "10px" }}
                        src={artista.images[0]?.url}
                        alt="Artist image"
                      />
                    </figure>
                  </div>
                  <div className="media-content">
                    <p className="title is-4">{artista.name}</p>
                    <p className="subtitle is-size-6">
                      Popularidad:{" "}
                      <progress
                        className="is-small"
                        value={artista.popularity}
                        max={100}
                      />
                      <br />
                      seguidores: {seguidoresAUnidades(artista.followers.total)}
                      <br />
                      {artista.genres?.length > 0 &&
                        `géneros: ${artista.genres
                          ?.map((genre) => genre)
                          .join(", ")}`}
                      <br />
                      {tipo === "sortedByPopularity" && (
                        <span>
                          Posición en seguidores: {posicionFollowers} <br />{" "}
                          Posición en tu lista: {posicionOriginal}
                        </span>
                      )}
                      {tipo === "sortedByFollowers" && (
                        <span>
                          Posición en popularidad: {posicionPopularity}
                          <br />
                          Posición en tu lista: {posicionOriginal}
                        </span>
                      )}
                      {tipo === "originalArtistas" && (
                        <span>
                          Posición en popularidad: {posicionPopularity}
                          <br />
                          Posición en seguidores: {posicionFollowers}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="media-rigth">
                    <p>{index + 1}</p>
                    <a href={artista.external_urls?.spotify}>Play</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })
      .slice(0, 50);
  return (
    <div>
      <div className="columns">
        <div className="column">
          <h2>Tus artistas más escuchados</h2>
          {artistCardView(originalArtistas, "originalArtistas")}
        </div>
        <div className="column">
          <h2>Ordenados por seguidores</h2>
          {artistCardView(sortedByFollowers, "sortedByFollowers")}
        </div>
        <div className="column">
          <h2>Ordenados por popularidad</h2>
          {artistCardView(sortedByPopularity, "sortedByPopularity")}
        </div>
      </div>
      <h2>Géneros más escuchados</h2>
      <ol>
        {genres.map(({ genre, count }) => (
          <li key={genre}>
            {genre}: {count} veces
          </li>
        ))}
      </ol>
      <ThemeProvider theme={darkTheme}>
        <ScatterChart
          height={300}
          xAxis={[{ scaleType: "log" }]}
          series={[
            {
              data: originalArtistas.map((artist) => ({
                y: artist.popularity,
                x: artist.followers.total,
                id: artist.id,
                name: artist.name,
              })),
              valueFormatter: (point) =>
                `${point.name}: (${seguidoresAUnidades(point.x)} Fol, ${
                  point.y
                } Pop)`,
            },
          ]}
        />
      </ThemeProvider>
    </div>
  );
}
