import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/* ============================================
   LOADING RING — edit these values
   ============================================ */
const PHOTO_SIZE = 180;        // diameter of the circular photo
const RING_GAP = 8;            // space between photo edge and the ring
const RING_THICKNESS = 4;      // how thin/thick the line is
const RING_COLOR = '#F5A623';  // color of the line
const SPIN_DURATION = 1400;    // ms per full rotation — lower = faster
const ARC_SWEEP = 300;         // degrees of visible arc (rest is invisible tail)
const SEGMENTS = 48;           // more = smoother fade
/* ============================================ */

const SVG_SIZE = PHOTO_SIZE + 2 * (RING_GAP + RING_THICKNESS);
const RADIUS = SVG_SIZE / 2 - RING_THICKNESS / 2;
const CENTER = SVG_SIZE / 2;

function polarToCartesian(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(rad),
    y: CENTER + RADIUS * Math.sin(rad),
  };
}

function arcPath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const RING_SEGMENTS = Array.from({ length: SEGMENTS }, (_, i) => {
  const segSweep = ARC_SWEEP / SEGMENTS;
  const start = i * segSweep;
  // slight overlap so segments blend into one continuous line
  const end = start + segSweep + (i < SEGMENTS - 1 ? 0.6 : 0);
  return {
    d: arcPath(start, end),
    opacity: (i + 1) / SEGMENTS, // fades from 0 at the tail to 1 at the head
    isHead: i === SEGMENTS - 1,
  };
});

export const PhotoLoadingRing: React.FC = () => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: SPIN_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={SVG_SIZE} height={SVG_SIZE}>
          {RING_SEGMENTS.map((seg, i) => (
            <Path
              key={i}
              d={seg.d}
              stroke={RING_COLOR}
              strokeOpacity={seg.opacity}
              strokeWidth={RING_THICKNESS}
              strokeLinecap={seg.isHead ? 'round' : 'butt'}
              fill="none"
            />
          ))}
        </Svg>
      </Animated.View>
      <Image
        source={require('@/assets/images/gurudev-main-image.png')}
        style={styles.photo}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
});