import React from 'react';
import { useLocation } from 'wouter';
import { Home, BarChart3, History, Plus, Settings } from 'lucide-react';

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navigationItems = [
    {
      icon: Home,
      label: 'Inicio',
      path: '/dashboard',
      active: location === '/dashboard'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/analytics',
      active: location === '/analytics'
    },
    {
      icon: Plus,
      label: 'Nueva',
      path: '/create-round',
      active: location === '/create-round',
      primary: true
    },
    {
      icon: History,
      label: 'Resultados',
      path: '/results',
      active: location === '/results'
    },
    {
      icon: Settings,
      label: 'Config',
      path: '/settings',
      active: location === '/settings'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-gray-800 px-4 py-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          
          if (item.primary) {
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className="w-14 h-14 bg-gradient-to-r from-golf-blue to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -translate-y-2"
              >
                <Icon className="h-6 w-6 text-white" />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all duration-200 ${
                item.active 
                  ? 'text-golf-blue bg-golf-blue bg-opacity-10' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}