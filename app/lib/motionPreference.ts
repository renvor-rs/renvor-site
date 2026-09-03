export const MOTION_ATTRIBUTE = 'data-motion';

export type MotionPreference = 'running' | 'paused';

export function currentMotionPreference(): MotionPreference {
  return document.documentElement.getAttribute(MOTION_ATTRIBUTE) === 'paused'
    ? 'paused'
    : 'running';
}

export function continuousMotionIsPaused(): boolean {
  return currentMotionPreference() === 'paused';
}
