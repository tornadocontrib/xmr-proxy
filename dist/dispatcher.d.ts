import { Dispatcher } from 'undici';
export type DispatcherFunc = (retry?: number) => Dispatcher;
export declare function getDispatcherFunc(torPort?: number, proxyUrl?: string): DispatcherFunc | undefined;
