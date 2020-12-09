
export function randomUUID(length=6) {
    return Math.random().toString(36).slice(-length);
}
