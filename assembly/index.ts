export function adjust(length: i32, rAdjustment: f32, gAdjustment: f32, bAdjustment: f32, aAdjustment: f32): void {
    for (let i = 0; i < length; i += 4) {
        const r = load<u8>(i);
        let newR = <u8>(r * rAdjustment);
        newR = (newR > 255) ? 255 : ((newR < 0) ? 0 : newR);
        store<u8>(i, newR);

        const g = load<u8>(i + 1);
        let newG = <u8>(g * gAdjustment);
        newG = (newG > 255) ? 255 : ((newG < 0) ? 0 : newG);
        store<u8>(i + 1, newG);

        const b = load<u8>(i + 2);
        let newB = <u8>(b * bAdjustment);
        newB = (newB > 255) ? 255 : ((newB < 0) ? 0 : newB);
        store<u8>(i + 2, newB);

        const a = load<u8>(i + 3);
        let newA = <u8>(a * (1 - aAdjustment));
        newA = (newA > 255) ? 255 : ((newA < 0) ? 0 : newA);
        store<u8>(i + 3, newA);
    }
}


export function sephia(length: i32): void {
    for (let i = 0; i < length; i += 4) {
        const r = load<u8>(i);
        const g = load<u8>(i + 1);
        const b = load<u8>(i + 2);

        const y = <u8>((r * 0.3) + (g * 0.59) + (b * 0.11));
        
        store<u8>(i, y);
        store<u8>(i + 1, y);
        store<u8>(i + 2, y);
    }
}


export function grayScale(length: i32): void {
    for (let i = 0; i < length; i += 4) {
        const r = load<u8>(i);
        const g = load<u8>(i + 1);
        const b = load<u8>(i + 2);
        const a = load<u8>(i + 3);

        store<u8>(i, r);
        store<u8>(i + 1, r);
        store<u8>(i + 2, r);
        store<u8>(i + 3, a);
    }
}


export function invert(length: i32): void {
    for (let i = 0; i < length; i += 4) {
        const r = load<u8>(i);
        const g = load<u8>(i + 1);
        const b = load<u8>(i + 2);

        store<u8>(i, 255 - r);
        store<u8>(i + 1, 255 - g);
        store<u8>(i + 2, 255 - b);
    }
}


export function noise(length: i32): void {
    for (let i = 0; i < length; i += 4) {
        const r = load<u8>(i);
        const g = load<u8>(i + 1);
        const b = load<u8>(i + 2);

        const random = <u8>((Math.random() * 100 % 70) - 35);

        store<u8>(i, r + random);
        store<u8>(i + 1, g + random);
        store<u8>(i + 2, b + random);
    }
}