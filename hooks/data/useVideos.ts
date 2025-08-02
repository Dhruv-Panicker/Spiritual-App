
import { useMemo } from 'react';
import { mockVideos, type Video } from '@/mocks/data/videos';

export const useVideos = () => {
  const videos = useMemo(() => mockVideos, []);

  return {
    videos,
  };
};
