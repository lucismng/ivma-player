
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Channel, EpgData } from './types';
import { fetchAndParseData } from './services/iptvService';
import ChannelCard from './components/ChannelCard';
import PlayerView from './components/PlayerView';
import { SearchIcon, TvIcon } from './components/Icons';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [epgData, setEpgData] = useState<EpgData>({});
  const [channelGroups, setChannelGroups] = useState<string[]>([]);
  
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { channels, epgData, channelGroups } = await fetchAndParseData();
        setAllChannels(channels);
        setEpgData(epgData);
        setChannelGroups(channelGroups);
      } catch (err) {
        setError('Failed to load channel data. Please check the M3U source or your network connection.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredChannels = useMemo(() => {
    return allChannels
      .filter(channel => selectedGroup === 'All' || channel.group === selectedGroup)
      .filter(channel => channel.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allChannels, selectedGroup, searchQuery]);

  const handleSelectChannel = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedChannel(null);
  }, []);
  
  if (selectedChannel) {
    return <PlayerView channel={selectedChannel} epgData={epgData} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-primary">
      <header className="sticky top-0 z-20 bg-brand-bg/80 backdrop-blur-lg border-b border-brand-surface/50">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <TvIcon className="w-8 h-8 text-brand-primary" />
            <h1>iVMA Player</h1>
          </div>
          <div className="relative w-full md:w-auto">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 lg:w-96 bg-brand-surface border border-brand-surface/50 rounded-full py-2 pl-10 pr-4 text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
            />
          </div>
        </div>
        <nav className="container mx-auto px-4 pb-3">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {channelGroups.map(group => (
                    <button
                        key={group}
                        onClick={() => setSelectedGroup(group)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors duration-200 ${
                            selectedGroup === group 
                                ? 'bg-brand-primary text-white' 
                                : 'bg-brand-surface text-brand-text-secondary hover:bg-brand-surface/50 hover:text-brand-text-primary'
                        }`}
                    >
                        {group}
                    </button>
                ))}
            </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
            {Array.from({ length: 18 }).map((_, index) => (
              <div key={index} className="bg-brand-surface rounded-lg animate-pulse">
                <div className="aspect-video bg-brand-surface/50"></div>
                <div className="p-4">
                  <div className="h-4 bg-brand-surface/50 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <h2 className="text-2xl font-bold text-red-500">An Error Occurred</h2>
            <p className="text-brand-text-secondary mt-2">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
            {filteredChannels.map(channel => (
              <ChannelCard 
                key={`${channel.id}-${channel.url}`} 
                channel={channel}
                onClick={() => handleSelectChannel(channel)}
              />
            ))}
          </div>
        )}
        {!isLoading && !error && filteredChannels.length === 0 && (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold">No Channels Found</h2>
                <p className="text-brand-text-secondary mt-2">Try adjusting your search or category selection.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
