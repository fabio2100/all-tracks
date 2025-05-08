'use client'
import { useState } from "react";
import TopTracksWrapper from "../components/TopTracksWrapper";
import styles from "../page.module.css";

export default function Home() {
  const [activeTab, setActiveTab] = useState("canciones");

  return (
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
        {activeTab === "canciones" ? <TopTracksWrapper /> : <p>Artistas</p>}
      </div>
    </div>
  );
}