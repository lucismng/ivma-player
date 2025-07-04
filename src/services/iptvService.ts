import { Channel, EpgData, Programme } from '../types';

const M3U_URL = 'https://raw.githubusercontent.com/luongtamlong/Dak-Lak-IPTV/main/daklakiptv.m3u';
const PROXY_PREFIX = 'https://api.allorigins.win/raw?url=';


const parseM3U = (m3uString: string): { channels: Channel[], epgUrl: string | null } => {
    const lines = m3uString.split('\n');
    const channels: Channel[] = [];
    let epgUrl: string | null = null;

    const epgUrlMatch = m3uString.match(/x-tvg-url="([^"]+)"/);
    if (epgUrlMatch) {
        epgUrl = epgUrlMatch[1];
    }
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF:')) {
            const infoLine = lines[i];
            const urlLine = lines[i + 1];

            if (urlLine && (urlLine.startsWith('http://') || urlLine.startsWith('https://'))) {
                const idMatch = infoLine.match(/tvg-id="([^"]*)"/);
                const nameMatch = infoLine.match(/tvg-name="([^"]*)"/);
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                const groupMatch = infoLine.match(/group-title="([^"]*)"/);
                const title = infoLine.substring(infoLine.lastIndexOf(',') + 1).trim();

                channels.push({
                    id: idMatch ? idMatch[1] : title,
                    name: nameMatch ? nameMatch[1] : title,
                    logo: logoMatch ? logoMatch[1] : 'https://picsum.photos/200/200',
                    group: groupMatch ? groupMatch[1] : 'Uncategorized',
                    url: urlLine.trim(),
                });
            }
        }
    }
    return { channels, epgUrl };
};

const parseXMLTV = (xmlString: string): EpgData => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    const programmeElements = xmlDoc.getElementsByTagName('programme');
    const epgData: EpgData = {};

    const parseTime = (timeStr: string): Date => {
        const year = parseInt(timeStr.substring(0, 4), 10);
        const month = parseInt(timeStr.substring(4, 6), 10) - 1;
        const day = parseInt(timeStr.substring(6, 8), 10);
        const hours = parseInt(timeStr.substring(8, 10), 10);
        const minutes = parseInt(timeStr.substring(10, 12), 10);
        const seconds = parseInt(timeStr.substring(12, 14), 10);
        // Note: The original implementation was parsing as UTC but creating a local Date.
        // This can lead to timezone issues. Let's stick with UTC throughout.
        return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
    };

    for (let i = 0; i < programmeElements.length; i++) {
        const programmeElement = programmeElements[i];
        const channelId = programmeElement.getAttribute('channel');
        const startStr = programmeElement.getAttribute('start');
        const endStr = programmeElement.getAttribute('stop');
        const titleEl = programmeElement.getElementsByTagName('title')[0];
        const descEl = programmeElement.getElementsByTagName('desc')[0];

        if (channelId && startStr && endStr && titleEl) {
            const programme: Programme = {
                channelId,
                title: titleEl.textContent || 'No Title',
                desc: descEl?.textContent || 'No description available.',
                start: parseTime(startStr),
                end: parseTime(endStr),
            };
            if (!epgData[channelId]) {
                epgData[channelId] = [];
            }
            epgData[channelId].push(programme);
        }
    }
    
    // Sort programs by start time for each channel
    for (const channelId in epgData) {
        epgData[channelId].sort((a, b) => a.start.getTime() - b.start.getTime());
    }

    return epgData;
};

export const fetchAndParseData = async (): Promise<{ channels: Channel[], epgData: EpgData, channelGroups: string[] }> => {
    try {
        const m3uResponse = await fetch(`${PROXY_PREFIX}${encodeURIComponent(M3U_URL)}`);
        if (!m3uResponse.ok) throw new Error(`Failed to fetch M3U: ${m3uResponse.statusText}`);
        const m3uString = await m3uResponse.text();

        const { channels, epgUrl } = parseM3U(m3uString);
        let epgData: EpgData = {};

        if (epgUrl) {
            try {
                // Some EPG URLs might be gzipped
                const fullEpgUrl = epgUrl.endsWith('.gz') 
                    ? `https://api.allorigins.win/raw?url=${encodeURIComponent(epgUrl)}`
                    : `${PROXY_PREFIX}${encodeURIComponent(epgUrl)}`;

                const epgResponse = await fetch(fullEpgUrl);
                if (epgResponse.ok) {
                    // AllOrigins handles gzip decompression, so we just need text
                    const xmlString = await epgResponse.text();
                    epgData = parseXMLTV(xmlString);
                } else {
                    console.warn(`Could not fetch EPG data from ${epgUrl}: ${epgResponse.statusText}`);
                }
            } catch (epgError) {
                console.error("Error fetching or parsing EPG data:", epgError);
            }
        }
        
        const channelGroups = ['All', ...Array.from(new Set(channels.map(c => c.group)))].sort();

        return { channels, epgData, channelGroups };
    } catch (error) {
        console.error("Failed to load IPTV data:", error);
        throw error;
    }
};