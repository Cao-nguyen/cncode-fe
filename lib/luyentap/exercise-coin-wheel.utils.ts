export const EXERCISE_COIN_WHEEL_SEGMENTS = [
    { value: 0, label: 'May mắn\nlần sau', color: '#94a3b8' },
    { value: 5, label: '5 xu', color: '#60a5fa' },
    { value: 10, label: '10 xu', color: '#38bdf8' },
    { value: 15, label: '15 xu', color: '#22d3ee' },
    { value: 20, label: '20 xu', color: '#2dd4bf' },
    { value: 25, label: '25 xu', color: '#34d399' },
    { value: 30, label: '30 xu', color: '#a3e635' },
    { value: 35, label: '35 xu', color: '#facc15' },
    { value: 40, label: '40 xu', color: '#fb923c' },
    { value: 45, label: '45 xu', color: '#f97316' },
    { value: 50, label: '50 xu', color: '#ef4444' },
] as const;

export const EXERCISE_COIN_WHEEL_VALUES = EXERCISE_COIN_WHEEL_SEGMENTS.map((segment) => segment.value);

export function getWheelSegmentAngle(segmentCount: number = EXERCISE_COIN_WHEEL_SEGMENTS.length) {
    return 360 / segmentCount;
}

/** Góc tâm mảng tính từ 12h, theo chiều kim đồng hồ (khớp conic-gradient). */
export function getSegmentCenterAngleFromTop(index: number, segmentCount: number = EXERCISE_COIN_WHEEL_SEGMENTS.length) {
    return index * getWheelSegmentAngle(segmentCount);
}

/** CSS rotate cho nhãn: 0° conic (12h) ↔ -90° CSS. */
export function getSegmentLabelRotate(index: number, segmentCount: number = EXERCISE_COIN_WHEEL_SEGMENTS.length) {
    return getSegmentCenterAngleFromTop(index, segmentCount) - 90;
}

export function findWheelSegmentIndex(amount: number) {
    const index = EXERCISE_COIN_WHEEL_SEGMENTS.findIndex((item) => item.value === amount);
    return index >= 0 ? index : 0;
}

export function pickRandomWheelCoinAmount() {
    const index = Math.floor(Math.random() * EXERCISE_COIN_WHEEL_VALUES.length);
    return EXERCISE_COIN_WHEEL_VALUES[index];
}

export function computeWheelSpinRotation(
    currentRotation: number,
    targetIndex: number,
    segmentCount: number = EXERCISE_COIN_WHEEL_SEGMENTS.length,
) {
    const centerAngle = getSegmentCenterAngleFromTop(targetIndex, segmentCount);
    const extraSpins = 6 * 360;
    const targetMod = ((360 - centerAngle) % 360 + 360) % 360;
    const currentMod = ((currentRotation % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta <= 0) delta += 360;
    return currentRotation + extraSpins + delta;
}

export function formatCoinSpinResult(amount: number) {
    if (amount <= 0) return 'Chúc bạn may mắn lần sau';
    return `+${amount} xu`;
}
