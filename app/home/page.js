"use client";
import { useEffect, useState } from "react";
import styles from "../page.module.css";
import { useRouter } from "next/navigation";
import Artistas from "../components/Artistas";
import Cookies from "js-cookie";
import axios from "axios";
import TopTracks from "../components/TopTracks";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("artistas");

  useEffect(() => {
    const checkTokens = async () => {
      const srtCookie = Cookies.get("spotify_refresh_token");
      if (!srtCookie) {
        Cookies.remove("spotify_access_token");
        router.push("/");
        return;
      }

      if (!Cookies.get("spotify_access_token")) {
        try {
          const response = await axios.post("/api/refreshToken", {
            refresh_token: srtCookie,
          });

          if (response.data.access_token) {
            Cookies.set("spotify_access_token", response.data.access_token, {
              expires: 1 / 24, // Expira en 1 hora
            });

            Cookies.set("spotify_refresh_token", srtCookie, { expires: 7 }); 
          } else {
            Cookies.remove("spotify_refresh_token");
            router.push("/");
          }
        } catch (error) {
          console.error("Error obteniendo nuevo access_token:", error);
          Cookies.remove("spotify_refresh_token");
          router.push("/");
        }
      }
    };

    checkTokens();
  }, []); 

  const handleLogout = () => {
    Cookies.remove("spotify_access_token");
    Cookies.remove("spotify_refresh_token");
    router.push("/");
  };

  return (
    <>
      <div className={styles.header}>
        <h2 style={{ marginTop: ".5em", marginBottom: "0.25em" }}>
          Tus pistas escuchadas
        </h2>
        <p className={styles.logout} onClick={handleLogout}>
          Logout
        </p>
      </div>
      <div className={styles.divHome}>
        {/* Contenedor de pestañas estilo Bulma */}
        <div className="tabs is-fullwidth ">
          <ul>
            <li className={activeTab === "canciones" ? "is-active" : ""}>
              <a onClick={() => setActiveTab("canciones")}>Canciones</a>
            </li>
            <li className={activeTab === "artistas" ? "is-active" : ""}>
              <a onClick={() => setActiveTab("artistas")}>Artistas</a>
            </li>
          </ul>
        </div>

        {/* Contenido dinámico basado en la pestaña seleccionada */}
        <div className="content">
          <div style={activeTab === "canciones" ? { display: "block" } : { display: "none " }}>
            <TopTracks />
          </div>
          <div style={activeTab === "artistas" ? { display: "block" } : { display: "none" }}>
              <Artistas />         
          </div>
        </div>
      </div>
    </>
  );
}