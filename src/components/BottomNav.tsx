import React from 'react';
import { User, Heart, BarChart3, Image, Users, Settings } from 'lucide-react';
import { ThemeConfig } from '../utils/theme';

export type TabType = 'me' | 'us' | 'charts' | 'memories' | 'partner' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  themeConfig: ThemeConfig;
  memoriesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  themeConfig,
  memoriesCount,
}) => {
  const tabs = [
    { id: 'me' as TabType, label: 'Me', icon: User },
    { id: 'us' as TabType, label: 'Us', icon: Heart },
    { id: 'charts' as TabType, label: 'Charts', icon: BarChart3 },
    { id: 'memories' as TabType, label: 'Memories', icon: Image, badge: memoriesCount },
    { id: 'partner' as TabType, label: 'Partner', icon: Users },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav 
      aria-label="Primary mobile navigation"
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 theme-card backdrop-blur-xl border-t theme-border px-2 py-1 shadow-2xl transition-colors duration-300"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-2.5 min-w-[50px] transition-all cursor-pointer ${
                isActive ? 'font-bold' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {/* Active top/underline accent line */}
              {isActive && (
                <div
                  className="absolute -top-1 w-8 h-1 rounded-full shadow-sm"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}
                  style={{ color: isActive ? themeConfig.primaryColor : undefined }}
                />

                {tab.badge !== undefined && tab.badge > 0 && tab.id === 'memories' && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 tracking-tight ${
                  isActive ? 'theme-text font-bold' : 'theme-text-muted'
                }`}
                style={{ color: isActive ? themeConfig.primaryColor : undefined }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
