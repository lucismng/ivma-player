
import React from 'react';
import { Programme } from '../types';

interface EpgTimelineProps {
  programs: Programme[] | undefined;
}

const EpgTimeline: React.FC<EpgTimelineProps> = ({ programs }) => {
    if (!programs || programs.length === 0) {
        return (
            <div className="p-4 text-center text-brand-text-secondary">
                No Electronic Program Guide (EPG) data available for this channel.
            </div>
        );
    }
    
    const now = new Date();

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <div className="p-4 md:p-6 space-y-4">
            <h3 className="text-xl font-bold text-brand-text-primary mb-4">Schedule</h3>
            <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4">
                {programs.map((prog, index) => {
                    const isCurrent = now >= prog.start && now < prog.end;
                    const isPast = now >= prog.end;

                    return (
                        <div key={index} className={`flex gap-4 p-4 rounded-lg transition-all duration-200 ${
                            isCurrent ? 'bg-brand-primary/20 border-l-4 border-brand-primary' : 
                            isPast ? 'opacity-50' : 'bg-brand-surface'
                        }`}>
                            <div className="flex-shrink-0 w-20 text-right">
                                <p className={`font-semibold ${isCurrent ? 'text-brand-primary' : 'text-brand-text-primary'}`}>
                                    {formatTime(prog.start)}
                                </p>
                                <p className="text-sm text-brand-text-secondary">{formatTime(prog.end)}</p>
                            </div>
                            <div className="flex-grow">
                                <h4 className={`font-semibold ${isCurrent ? 'text-brand-text-primary' : 'text-brand-text-secondary'}`}>
                                    {prog.title}
                                </h4>
                                <p className="text-sm text-brand-text-secondary mt-1 line-clamp-2">{prog.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EpgTimeline;
