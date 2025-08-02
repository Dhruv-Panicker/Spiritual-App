
export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeId: string;
  duration: string;
  description: string;
}

export const mockVideos: Video[] = [
  {
    id: '1',
    title: 'श्री सिधेश्वर तीर्थ ब्रह्मर्षि जी के दिव्य दर्शन',
    thumbnail: 'https://img.youtube.com/vi/TIQUPpiEvS0/hqdefault.jpg',
    youtubeId: 'TIQUPpiEvS0',
    duration: '0:59',
    description: 'श्री गुरुदेव के पावन दर्शन और आध्यात्मिक आशीर्वाद'
  },
  {
    id: '2',
    title: 'ब्रह्मर्षि जी का आध्यात्मिक संदेश',
    thumbnail: 'https://img.youtube.com/vi/5aCB-_iAf8A/hqdefault.jpg',
    youtubeId: '5aCB-_iAf8A',
    duration: '0:45',
    description: 'आत्मा की शुद्धता और परमात्मा प्राप्ति के उपाय'
  },
  {
    id: '3',
    title: 'गुरु शिष्य परंपरा का महत्व',
    thumbnail: 'https://img.youtube.com/vi/udVQ9H_O_44/hqdefault.jpg',
    youtubeId: 'udVQ9H_O_44',
    duration: '1:02',
    description: 'सच्चे गुरु की पहचान और शिष्य के कर्तव्य'
  },
  {
    id: '4',
    title: 'मोक्ष प्राप्ति का मार्ग',
    thumbnail: 'https://img.youtube.com/vi/wR3rDGkpTCM/hqdefault.jpg',
    youtubeId: 'wR3rDGkpTCM',
    duration: '0:38',
    description: 'जीवन-मुक्ति के लिए साधना और भक्ति'
  },
  {
    id: '5',
    title: 'श्री गुरुदेव की पावन वाणी',
    thumbnail: 'https://img.youtube.com/vi/TIQUPpiEvS0/hqdefault.jpg',
    youtubeId: 'TIQUPpiEvS0',
    duration: '0:52',
    description: 'आंतरिक शांति और आनंद के लिए गुरु उपदेश'
  }
];
