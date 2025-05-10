import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Artistas() {
  const searchParams = useSearchParams();
  const access_token = searchParams.get("access_token");
  const [originalArtistas, setOriginalArtistas] = useState([]);
  const [sortedByFollowers, setSortedByFollowers] = useState([]);
  const [sortedByPopularity, setSortedByPopularity] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    if (!access_token) return;

    const fetchAllArtists = async () => {
      let allArtists = [];
      let offset = 0;
      const limit = 50;
      let hasMore = true;

      try {
        while (hasMore) {
          const response = await axios.get("https://api.spotify.com/v1/me/top/artists", {
            params: { time_range: "long_term", limit, offset },
            headers: { Authorization: `Bearer ${access_token}` },
          });

          if (response.data.items.length > 0) {
            allArtists = [...allArtists, ...response.data.items];
            offset += limit;
          } else {
            hasMore = false;
          }
        }

        setOriginalArtistas(allArtists); // Guardamos la lista original en el estado
        setSortedByFollowers([...allArtists].sort((a, b) => b.followers.total - a.followers.total));
        setSortedByPopularity([...allArtists].sort((a, b) => b.popularity - a.popularity));
        processGenres(allArtists);
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

  return (
    <div>
      <h1>Artistas</h1>
<div className="columns">
  <div className="column">
      <h2>Lista Original (Según Spotify)</h2>
      <ol>
        {originalArtistas.map((artista) => (
          <li key={artista.id}>{artista.name}</li>
        ))}
      </ol>
      </div>
      <div className="column">
      <h2>Ordenados por seguidores</h2>
      <ol>
        {sortedByFollowers.map((artista) => (
          <li key={artista.id}>
            {artista.name} - {artista.followers.total} seguidores
          </li>
        ))}
      </ol>
      </div>
      <div className="column">
      <h2>Ordenados por popularidad</h2>
      <ol>
        {sortedByPopularity.map((artista) => (
          <li key={artista.id}>
            {artista.name} - Popularidad: {artista.popularity}
          </li>
        ))}
      </ol>
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
    </div>
  );
}