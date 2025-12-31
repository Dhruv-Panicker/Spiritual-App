import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { googleSheetsService, Video } from '../services/googleSheetsService';

interface VideosContextType {
  videos: Video[];
  loading: boolean;
  addVideo: (video: Omit<Video, 'id' | 'dateAdded'>) => Promise<void>;
  refreshVideos: () => Promise<void>;
}

const VideosContext = createContext<VideosContextType | undefined>(undefined);

export function VideosProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const loadedVideos = await googleSheetsService.getVideos();
      setVideos(loadedVideos);
      console.log(`📺 Loaded ${loadedVideos.length} videos`);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load videos on mount
  useEffect(() => {
    loadVideos();
  }, []);

  const addVideo = async (newVideo: Omit<Video, 'id' | 'dateAdded'>) => {
    try {
      const addedVideo = await googleSheetsService.addVideo(newVideo);
      setVideos(prev => [addedVideo, ...prev]);
      console.log('✅ Video added successfully');
    } catch (error) {
      console.error('Error adding video:', error);
      throw error;
    }
  };

  const refreshVideos = async () => {
    await loadVideos();
  };

  return (
    <VideosContext.Provider value={{
      videos,
      loading,
      addVideo,
      refreshVideos
    }}>
      {children}
    </VideosContext.Provider>
  );
}

export function useVideos() {
  const context = useContext(VideosContext);
  if (context === undefined) {
    throw new Error('useVideos must be used within a VideosProvider');
  }
  return context;
}

export type { Video };

