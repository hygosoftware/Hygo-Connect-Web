import React, { useState, useEffect } from 'react';
import { Typography, Icon } from './';

interface DailyTipProps {
  onPress?: () => void;
  className?: string;
}

const DailyTips: React.FC<DailyTipProps> = ({ onPress, className = '' }) => {
  const [currentTip, setCurrentTip] = useState<string>('');
  const [tipCategory, setTipCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Array of health tips
  const healthTips = [
    {
      tip: 'Drink at least 8 glasses of water daily to stay hydrated.',
      category: 'Hydration'
    },
    {
      tip: 'Take a 5-minute break every hour when working at a computer.',
      category: 'Ergonomics'
    },
    {
      tip: 'Include colorful vegetables in your meals for a variety of nutrients.',
      category: 'Nutrition'
    },
    {
      tip: 'Practice deep breathing for 5 minutes to reduce stress.',
      category: 'Mental Health'
    },
    {
      tip: 'Aim for 7-9 hours of quality sleep each night.',
      category: 'Sleep'
    },
    {
      tip: 'Take the stairs instead of the elevator when possible.',
      category: 'Physical Activity'
    },
    {
      tip: 'Wash your hands for at least 20 seconds to prevent infections.',
      category: 'Hygiene'
    },
    {
      tip: 'Limit screen time before bed to improve sleep quality.',
      category: 'Sleep Hygiene'
    },
    {
      tip: 'Practice mindfulness meditation to improve focus and reduce anxiety.',
      category: 'Mental Wellness'
    },
    {
      tip: 'Stretch your body for 5-10 minutes after waking up.',
      category: 'Flexibility'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);

    // Get today's date to determine which tip to show
    const today = new Date();
    const dayOfMonth = today.getDate();

    // Use the day of month to select a tip (cycling through the array)
    const tipIndex = (dayOfMonth % healthTips.length);

    // Simulate API call delay
    const timer = setTimeout(() => {
      setCurrentTip(healthTips[tipIndex].tip);
      setTipCategory(healthTips[tipIndex].category);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Get appropriate icon and color based on category
  const getCategoryInfo = () => {
    switch (tipCategory) {
      case 'Hydration':
        return { icon: 'water', color: 'text-blue-500' };
      case 'Nutrition':
        return { icon: 'apple', color: 'text-red-500' };
      case 'Mental Health':
      case 'Mental Wellness':
        return { icon: 'brain', color: 'text-purple-500' };
      case 'Sleep':
      case 'Sleep Hygiene':
        return { icon: 'sleep', color: 'text-indigo-500' };
      case 'Physical Activity':
      case 'Flexibility':
        return { icon: 'activity', color: 'text-green-500' };
      case 'Hygiene':
        return { icon: 'hygiene', color: 'text-teal-500' };
      case 'Ergonomics':
        return { icon: 'chair', color: 'text-amber-500' };
      default:
        return { icon: 'heart', color: 'text-red-500' };
    }
  };

  const categoryInfo = getCategoryInfo();

  return (
    <div className={`mx-4 my-3 ${className}`}>
      <button
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 w-full text-left"
        onClick={onPress}
      >
      {isLoading ? (
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
          <Typography variant="body2" className="text-gray-500">
            Loading today's health tip...
          </Typography>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center flex-1 min-w-0">
              <Icon name="lightbulb" size="small" color="#eab308" className="mr-2 flex-shrink-0" />
              <Typography variant="h6" className="font-semibold text-gray-800 truncate">
                Today's Health Tip
              </Typography>
            </div>
            <div className="flex items-center flex-shrink-0 ml-2">
              <Icon name={categoryInfo.icon as any} size="small" color={categoryInfo.color.replace('text-', '#')} className="flex-shrink-0" />
              <Typography variant="caption" className="ml-1 text-gray-500 whitespace-nowrap">
                {tipCategory}
              </Typography>
            </div>
          </div>
          <Typography variant="body1" className="text-gray-700 leading-relaxed break-words">
            {currentTip}
          </Typography>
        </div>
      )}
      </button>
    </div>
  );
};

export default DailyTips;
