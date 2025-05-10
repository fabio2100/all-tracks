import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Artistas() {
  const searchParams = useSearchParams();
  const access_token = searchParams.get("access_token");
  const [artistas, setArtistas] = useState([]);

  useEffect(() => {
    if (!access_token) return;

    const fetchAllArtists = async () => {
      let allArtists = [];
      let offset = 0;
      const limit = 50; // Máximo permitido por Spotify
      let hasMore = true;

      try {
        while (hasMore) {
          const response = await axios.get("https://api.spotify.com/v1/me/top/artists", {
            params: {
              time_range: "long_term",
              limit: limit,
              offset: offset,
            },
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
          });
console.log(response)
          if (response.data.items.length > 0) {
            allArtists = [...allArtists, ...response.data.items];
            offset += limit; // Aumentamos el offset para la siguiente petición
          } else {
            hasMore = false; // Si no hay más artistas, terminamos el ciclo
          }
        }

        setArtistas(allArtists);
      } catch (error) {
        console.error("Error en la petición:", error);
      }
    };

    fetchAllArtists();
  }, [access_token]);

  return (
    <div>
      {console.log({artistas})}
      <h1>Artistas</h1>
      <ol>
        {artistas.map((artista) => (
          <li key={artista.id}>{artista.name}</li>
        ))}
      </ol>
    </div>
  );
}