'use client'
import { useState } from "react";
import TopTracksWrapper from "../components/TopTracksWrapper";
import styles from "../page.module.css";
import { useRouter } from "next/navigation";
import Artistas from "../components/Artistas";

export default function Home() {
  const [activeTab, setActiveTab] = useState("canciones");
  const router = useRouter();
  
  const handleLogout = () => {
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
        {console.log(activeTab)}
        <div style={activeTab === "canciones" ? {display:'block'} : {display:'none '}} ><TopTracksWrapper /></div>
      <div style={activeTab==='artistas'?{display:'block'}:{display:'none'}}><Artistas /></div>
      </div>
    </div>
    </>
  );
}