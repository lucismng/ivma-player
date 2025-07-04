
export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}

export interface Programme {
  channelId: string;
  title: string;
  desc: string;
  start: Date;
  end: Date;
}

export type EpgData = Record<string, Programme[]>;
