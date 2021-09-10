export const LOG_EVENT = 'logged';

export interface LogRecord {
	level: string;
	message: string;
	data: any;
}