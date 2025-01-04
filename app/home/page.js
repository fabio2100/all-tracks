import TopTracksWrapper from "../components/TopTracksWrapper";
import styles from "../page.module.css"
export default function home() {
  return (
    <div className={styles.divHome}>
      <TopTracksWrapper/>
    </div>
  );
}