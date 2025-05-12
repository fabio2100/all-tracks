// pages/api/login.js

import axios from 'axios';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function GET(req, res) {
    const cookieStore = await cookies();
    let redirectPath = null
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    if (!code) {
        redirectPath = `/`;
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', null, {
            params: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
                client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        redirectPath = `/home`;
        cookieStore.set("spotify_access_token",response.data.access_token,{maxAge: 3600})
        cookieStore.set("spotify_refresh_token",response.data.refresh_token,{maxAge:604800})
    } catch (error) {
        console.error('Error obtaining Spotify token:', error);
        redirectPath = `/`;
    }finally{
        redirect(redirectPath);
    }
}
