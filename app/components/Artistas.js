import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ScatterChart } from "@mui/x-charts";
import { CircularProgress, createTheme, ThemeProvider } from "@mui/material";
import styles from "../page.module.css";
import { FaPlay } from "react-icons/fa";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { MdExpandMore } from "react-icons/md";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function Artistas() {
  const access_token = Cookies.get("spotify_access_token");
  const [estadisticas, setEstadisticas] = useState({
    originalArtistas: [],
    sortedByFollowers: [],
    sortedByPopularity: [],
    genres: [],
    totalArtists: 0,
    totalArtistsChecked: 0,
  });
  const [loadingFirstArtists, setLoadingFirstArtists] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
          setLoadingFirstArtists(false);
          if (response.data.items.length > 0) {
            allArtists = [...allArtists, ...response.data.items];
            offset += limit;
          } else {
            hasMore = false;
          }
          const listOriginal = allArtists;
          const listFollowers = [...allArtists].sort(
            (a, b) => b.followers.total - a.followers.total
          );
          const listPopularity = [...allArtists].sort(
            (a, b) => b.popularity - a.popularity
          );
          setEstadisticas({
            ...estadisticas,
            originalArtistas: listOriginal,
            sortedByFollowers: listFollowers,
            sortedByPopularity: listPopularity,
            genres: processGenres(allArtists),
            totalArtists: response.data.total,
            totalArtistsChecked: listOriginal.length,
          });
        }
      } catch (error) {
        console.error("Error en la petición:", error);
      }
    };

    const processGenres = (artists) => {
      const genreData = {};

      artists.forEach((artist) => {
        artist.genres.forEach((genre) => {
          if (!genreData[genre]) {
            genreData[genre] = { count: 0, artists: [] };
          }
          genreData[genre].count += 1;
          genreData[genre].artists.push(artist.name);
        });
      });

      const sortedGenres = Object.entries(genreData)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([genre, data]) => ({
          genre,
          count: data.count,
          artists: data.artists,
        }));

      return sortedGenres;
    };
    fetchAllArtists();
  }, [access_token]);

  const artistCardView = (artists, tipo) =>
    filterArtists(artists, searchTerm)
      .map((artista, index) => {
        const posicionOriginal =
          estadisticas.originalArtistas.findIndex((a) => a.id === artista.id) +
          1;
        const posicionFollowers =
          estadisticas.sortedByFollowers.findIndex((a) => a.id === artista.id) +
          1;
        const posicionPopularity =
          estadisticas.sortedByPopularity.findIndex(
            (a) => a.id === artista.id
          ) + 1;

        return (
          <div className="card" key={artista.id}>
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

                  {process.env.NEXT_PUBLIC_CAROUSEL_CONTAINER === "1" ? (
                    <div className="subtitle is-size-6">
                      <InfoRotativa
                        artista={artista}
                        tipo={tipo}
                        posicionFollowers={posicionFollowers}
                        posicionPopularity={posicionPopularity}
                        posicionOriginal={posicionOriginal}
                      />
                    </div>
                  ) : (
                    <p className="subtitle is-size-6">
                      Popularidad: {artista.popularity}
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
                  )}
                </div>
                <div className="media-rigth">
                  <p>
                    <strong className="has-text-success">
                      {tipo === "originalArtistas" && posicionOriginal}
                      {tipo === "sortedByFollowers" && posicionFollowers}
                      {tipo === "sortedByPopularity" && posicionPopularity}
                    </strong>
                  </p>
                  <a href={artista.external_urls?.spotify} target="_blank">
                    <FaPlay className="has-text-success" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })
      .slice(0, 50);

  const InfoRotativa = ({
    artista,
    tipo,
    posicionFollowers,
    posicionPopularity,
    posicionOriginal,
  }) => {
    const elementos = [
      <>Popularidad: {artista.popularity}</>,
      <>Seguidores: {seguidoresAUnidades(artista.followers.total)}</>,
      <>Géneros: {artista.genres?.length > 0 && artista.genres.join(", ")}</>,
      ...(tipo === "sortedByPopularity"
        ? [
            <>Posición en seguidores: {posicionFollowers}</>,
            <>Posición en tu lista: {posicionOriginal}</>,
          ]
        : []),
      ...(tipo === "sortedByFollowers"
        ? [
            <>Posición en popularidad: {posicionPopularity}</>,
            <>Posición en tu lista: {posicionOriginal}</>,
          ]
        : []),
      ...(tipo === "originalArtistas"
        ? [
            <>Posición en popularidad: {posicionPopularity}</>,
            <>Posición en seguidores: {posicionFollowers}</>,
          ]
        : []),
    ];

    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(false);

    useEffect(() => {
      const interval = setInterval(() => {
        setFade(true); // Activar la animación de salida

        setTimeout(() => {
          setIndex((prevIndex) => (prevIndex + 1) % elementos.length);
          setFade(false); // Activar la animación de entrada
        }, 500); // Tiempo de la animación de salida
      }, process.env.NEXT_PUBLIC_TIEMPO_TRANSICION_CAROUSEL || 5000);

      return () => clearInterval(interval);
    }, [elementos.length]);

    return (
      <div
        className={`${styles.fadeContainer} ${
          fade ? styles.fadeOut : styles.fadeIn
        }`}
      >
        {elementos[index]}
      </div>
    );
  };

  const filterArtists = (artists, searchTerm) => {
    return artists.filter(
      (artista) =>
        artista.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artista.genres.some((genre) =>
          genre.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  };

  const GenreAccordion = ({ genres }) => {
    return (
      <ThemeProvider theme={darkTheme}>
        <div>
          {genres.map(({ genre, count, artists }) => (
            <Accordion key={genre}>
              <AccordionSummary expandIcon={<MdExpandMore />}>
                <p>
                  <strong>{genre}</strong> ({count})
                </p>
              </AccordionSummary>
              <AccordionDetails>
                <small>{artists.map((artist) => artist).join(", ")}</small>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </ThemeProvider>
    );
  };

  return loadingFirstArtists ? (
    <CircularProgress color="success" />
  ) : (
    <div>
      {estadisticas.totalArtistsChecked !== estadisticas.totalArtists && (
        <progress
          className="progress is-success is-small"
          value={
            (estadisticas?.totalArtistsChecked * 100) /
            estadisticas?.totalArtists
          }
          max={100}
        />
      )}
      <div className="control mb-5">
        <input
          className="input is-focused is-success"
          type="text"
          placeholder="Buscar nombre o género..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="mb-5">
        <table className="table">
          <tbody>
            <tr>
              <td>Total de artistas</td>
              <td>{estadisticas.totalArtists}</td>
            </tr>
            {estadisticas.totalArtists !== estadisticas.totalArtistsChecked && (
              <tr>
                <td>Total de artistas analizados</td>
                <td>{estadisticas.totalArtistsChecked}</td>
              </tr>
            )}
            <tr>
              <td>Total de géneros escuchados</td>
              <td>{estadisticas.genres.length}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="columns">
        <div className="column">
          <h2>Tus artistas más escuchados</h2>
          {artistCardView(estadisticas.originalArtistas, "originalArtistas")}
        </div>
        <div className="column">
          <h2>Ordenados por seguidores</h2>
          {artistCardView(estadisticas.sortedByFollowers, "sortedByFollowers")}
        </div>
        <div className="column">
          <h2>Ordenados por popularidad</h2>
          {artistCardView(
            estadisticas.sortedByPopularity,
            "sortedByPopularity"
          )}
        </div>
      </div>
      <h2>Géneros más escuchados</h2>

      <GenreAccordion genres={estadisticas.genres} />

      <h2>Gráfico Seguidores - Popularidad</h2>
      <ThemeProvider theme={darkTheme}>
        <ScatterChart
          height={300}
          xAxis={[{ scaleType: "log", label: "Followers" }]}
          yAxis={[{ label: "Popularity" }]}
          series={[
            {
              data: estadisticas.originalArtistas.map((artist) => ({
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
