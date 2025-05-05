import { Typography } from "@mui/material";
import styles from "./ShowSimpleData.module.css";


export default function ShowSimpleData({title,value,secondary}){
    return (
        <div className={styles.main}>
            <h2>{value}</h2>
            <p>{secondary}</p>
            <p>{title}</p>
        </div>
    )
}