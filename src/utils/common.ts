

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


/** 格式化数字 */
export function formatResource(value: number, decimalPlaces: number = 0): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(decimalPlaces || 1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(decimalPlaces || 1)}K`
    return value.toFixed(decimalPlaces)
}
