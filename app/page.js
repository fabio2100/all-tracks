// app/page.js
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from "./page.module.css";


export default function Start() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('spotifyToken');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
        const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;
        const scope = 'user-top-read';
        const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = authUrl;
    };

    return (
        <div className={styles.page}>
            {isLoggedIn ? (
                <p>Logueado con Spotify</p>
            ) : (
                <button onClick={handleLogin}>Login con Spotify</button>
            )}
        </div>
    );
}
