export type DeviceType = 'mobile' | 'desktop' | 'laptop' | 'unknown';

export function getDeviceType(device?: string): DeviceType {
    if (!device) return 'laptop';
    const d = device.toLowerCase();
    if (d.includes('mobile') || d.includes('android') || d.includes('ios') || d.includes('iphone') || d.includes('ipad')) {
        return 'mobile';
    }
    if (d.includes('desktop') || d.includes('windows') || d.includes('mac') || d.includes('linux')) {
        return 'desktop';
    }
    return 'laptop';
}
