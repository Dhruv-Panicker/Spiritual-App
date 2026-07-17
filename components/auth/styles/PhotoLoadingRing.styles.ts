import { StyleSheet } from 'react-native';

/* ============================================
   LOADING RING — edit these values
   ============================================ */
export const PHOTO_SIZE = 180;        // diameter of the circular photo
export const RING_GAP = 8;            // space between photo edge and the ring
export const RING_THICKNESS = 4;      // how thin/thick the line is
export const RING_COLOR = '#F5A623';  // color of the line
export const SPIN_DURATION = 1400;    // ms per full rotation — lower = faster
export const ARC_SWEEP = 300;         // degrees of visible arc (rest is invisible tail)
export const SEGMENTS = 48;           // more = smoother fade
/* ============================================ */

export const SVG_SIZE = PHOTO_SIZE + 2 * (RING_GAP + RING_THICKNESS);

export const styles = StyleSheet.create({
  wrap: {
    width: SVG_SIZE,
    height: SVG_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    position: 'absolute',
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2, // circular crop — hides the white square background
  },
  // Compose into any full-screen overlay to center the ring
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});