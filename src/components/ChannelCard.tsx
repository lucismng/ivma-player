import React from 'react';
import { Channel } from '../types';

interface ChannelCardProps {
  channel: Channel;
  onClick: () => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick }) => {
  return (
    <div 
        className="group bg-brand-surface rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-primary/20 transition-all duration-300 cursor-pointer"
        onClick={onClick}
    >
      <div className="aspect-video bg-black flex items-center justify-center p-2">
        <img 
          src={channel.logo} 
          alt={`${channel.name} logo`} 
          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://picsum.photos/200/200';
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-brand-text-primary truncate" title={channel.name}>
          {channel.name}
        </h3>
      </div>
    </div>
  );
};

export default ChannelCard;