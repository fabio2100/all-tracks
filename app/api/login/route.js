// pages/api/login.js

import axios from 'axios';
import { redirect } from 'next/navigation';

export async function GET(req, res) {
    let redirectPath = null
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
console.log('code', code)
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

        const { access_token, refresh_token } = response.data;
        redirectPath = `/home?access_token=${access_token}&refresh_token=${refresh_token}`;
    } catch (error) {
        console.error('Error obtaining Spotify token:', error);
        redirectPath = `/`;
    }finally{
        redirect(redirectPath);
    }
}
