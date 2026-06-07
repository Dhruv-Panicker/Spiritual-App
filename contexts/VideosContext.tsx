import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { googleSheetsService, Video, LiveStatus } from '../services/googleSheetsService';

interface VideosContextType {
  videos: Video[];
  loading: boolean;
  liveStatus: LiveStatus;
  addVideo: (video: Omit<Video, 'id' | 'dateAdded'>) => Promise<void>;
  refreshVideos: () => Promise<void>;
}

const EMPTY_LIVE: LiveStatus = { isLive: false, liveVideoId: null, channelUrl: '', liveTitle: null };

const VideosContext = createContext<VideosContextType | undefined>(undefined);

export function VideosProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>(EMPTY_LIVE);
  const [loading, setLoading] = useState(true);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const [loadedVideos, loadedLive] = await Promise.all([
        googleSheetsService.getVideos(),
        googleSheetsService.getLiveStatus(),
      ]);
      setVideos(loadedVideos);
      setLiveStatus(loadedLive);
      console.log(`Loaded ${loadedVideos.length} videos, live=${loadedLive.isLive}`);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const addVideo = async (newVideo: Omit<Video, 'id' | 'dateAdded'>) => {
    try {
      const addedVideo = await googleSheetsService.addVideo(newVideo);
      setVideos(prev => [addedVideo, ...prev]);
      console.log('Video added successfully');
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
      liveStatus,
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
