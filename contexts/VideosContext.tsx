import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { googleSheetsService } from '../services/googleSheetsService';

export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  dateAdded: string;
}

interface VideosContextType {
  videos: Video[];
  loading: boolean;
  addVideo: (video: Omit<Video, 'id' | 'dateAdded'>) => Promise<void>;
  removeVideo: (id: string) => Promise<void>;
  updateVideo: (id: string, video: Partial<Video>) => Promise<void>;
}

const VideosContext = createContext<VideosContextType | undefined>(undefined);

export function VideosProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        await googleSheetsService.initializeWithSampleData();
        const loadedVideos = await googleSheetsService.getVideos();
        setVideos(loadedVideos);
        console.log(`📺 Loaded ${loadedVideos.length} videos from local storage`);
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  const addVideo = async (newVideo: Omit<Video, 'id' | 'dateAdded'>) => {
    try {
      const addedVideo = await googleSheetsService.addVideo(newVideo);
      if (addedVideo) {
        setVideos(prev => [addedVideo, ...prev]);
      }
    } catch (error) {
      console.error('Error adding video:', error);
    }
  };

  const removeVideo = async (id: string) => {
    try {
      const success = await googleSheetsService.removeVideo(id);
      if (success) {
        setVideos(prev => prev.filter(v => v.id !== id));
      }
    } catch (error) {
      console.error('Error removing video:', error);
    }
  };

  const updateVideo = async (id: string, updatedVideo: Partial<Video>) => {
    try {
      const updated = await googleSheetsService.updateVideo(id, updatedVideo);
      if (updated) {
        setVideos(prev => prev.map(v => v.id === id ? updated : v));
      }
    } catch (error) {
      console.error('Error updating video:', error);
    }
  };

  return (
    <VideosContext.Provider value={{
      videos,
      loading,
      addVideo,
      removeVideo,
      updateVideo
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