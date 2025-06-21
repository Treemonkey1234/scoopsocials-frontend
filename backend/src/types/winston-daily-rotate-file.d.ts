import { Transport } from 'winston';

declare module 'winston-daily-rotate-file' {
  interface DailyRotateFileTransportOptions {
    filename: string;
    datePattern?: string;
    zippedArchive?: boolean;
    maxSize?: string;
    maxFiles?: string;
    level?: string;
    format?: any;
  }

  class DailyRotateFileTransport extends Transport {
    constructor(options: DailyRotateFileTransportOptions);
  }

  export = DailyRotateFileTransport;
} 