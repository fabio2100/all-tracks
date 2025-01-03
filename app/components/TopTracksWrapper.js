'use client';

import { Suspense } from 'react';
import TopTracks from './TopTracks';

const TopTracksWrapper = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <TopTracks />
    </Suspense>
  );
};

export default TopTracksWrapper;
