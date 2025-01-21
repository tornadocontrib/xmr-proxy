import winston from 'winston';
import colors from '@colors/colors/safe';

export function getLogger(label?: string, minLevel?: string) {
    return winston.createLogger({
        format: winston.format.combine(
            winston.format.label({ label }),
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            // Include timestamp on level
            winston.format((info) => {
                info.level = `[${info.level}]`;
                while (info.level.length < 8) {
                    info.level += ' ';
                }
                info.level = `${info.timestamp} ${info.level}`.toUpperCase();
                return info;
            })(),
            winston.format.colorize(),
            winston.format.printf(
                (info) =>
                    `${info.level} ${info.label ? `${info.label} ` : ''}${colors.grey((info.message as string) || '')}`,
            ),
        ),
        // Define level filter from config
        transports: [new winston.transports.Console({ level: minLevel || 'debug' })],
    });
}
