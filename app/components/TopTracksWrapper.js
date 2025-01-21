'use client';

import { Suspense } from 'react';
import TopTracks from './TopTracks';
import { CircularProgress } from '@mui/material';

const TopTracksWrapper = () => {
  return (
    <Suspense fallback={<div><CircularProgress color='success' /></div>}>
      <TopTracks />
    </Suspense>
  );
};

export default TopTracksWrapper;
