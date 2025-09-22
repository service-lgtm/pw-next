

/** 转换时间戳 */
export const formatTimestampToString = (
    timestamp: number | string,
    isSeconds: boolean = false
): string => {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    const date = new Date(isSeconds ? ts * 1000 : ts);

    if (isNaN(date.getTime())) {
        throw new Error('Invalid timestamp');
    }

    const pad = (num: number) => String(num).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
