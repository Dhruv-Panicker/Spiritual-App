import { MessageCircle, Play, Calendar, User, Settings } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { hapticFeedback } from '@/utils/haptics';

interface BottomTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomTabs = ({ activeTab, onTabChange }: BottomTabsProps) => {
  const { user } = useAuth();

  const tabs = [
    { id: 'quotes', label: 'Quotes', icon: MessageCircle },
    { id: 'videos', label: 'Videos', icon: Play },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'gurudev', label: 'Gurudev', icon: User },
    ...(user?.isAdmin ? [{ id: 'admin', label: 'Admin', icon: Settings }] : [])
  ];

  return (
    <nav className="tab-nav">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                hapticFeedback.light();
                onTabChange(tab.id);
              }}
              className={`tab-item ${isActive ? 'active' : ''}`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-current' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};