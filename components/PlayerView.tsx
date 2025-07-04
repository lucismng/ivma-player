
import React from 'react';
import { Channel, EpgData, Programme } from '../types';
import VideoPlayer from './VideoPlayer';
import EpgTimeline from './EpgTimeline';
import { ChevronLeftIcon } from './Icons';

interface PlayerViewProps {
  channel: Channel;
  epgData: EpgData;
  onBack: () => void;
}

const PlayerView: React.FC<PlayerViewProps> = ({ channel, epgData, onBack }) => {
    const channelEpg = epgData[channel.id];
    const now = new Date();
    const currentProgram = channelEpg?.find(p => now >= p.start && now < p.end);

    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    return (
        <div className="bg-brand-bg min-h-screen">
            <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col">
                    <div className="relative">
                        <VideoPlayer src={channel.url} />
                        <button 
                            onClick={onBack}
                            className="absolute top-4 left-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors z-10"
                            aria-label="Go back to channel list"
                        >
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4 md:p-6 bg-brand-surface flex-grow">
                        <div className="flex items-center gap-4 mb-4">
                            <img src={channel.logo} alt={`${channel.name} logo`} className="w-16 h-16 rounded-lg object-contain bg-white/10 p-1" />
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary">{channel.name}</h1>
                                <p className="text-brand-text-secondary">{channel.group}</p>
                            </div>
                        </div>
                        {currentProgram ? (
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-brand-primary">{currentProgram.title}</h2>
                                <p className="text-brand-text-secondary my-2">
                                    {formatTime(currentProgram.start)} - {formatTime(currentProgram.end)}
                                </p>
                                <p className="text-brand-text-secondary line-clamp-3">{currentProgram.desc}</p>
                            </div>
                        ) : (
                            <p className="text-brand-text-secondary">Current program information is not available.</p>
                        )}
                    </div>
                </div>
                <div className="w-full lg:w-1/3 xl:w-1/4 bg-brand-surface lg:bg-brand-bg lg:border-l-2 lg:border-brand-surface">
                    <EpgTimeline programs={channelEpg} />
                </div>
            </div>
        </div>
    );
};

export default PlayerView;
