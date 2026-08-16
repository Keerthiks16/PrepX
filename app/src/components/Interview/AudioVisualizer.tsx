import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../Common/theme';

type Props = {
  isListening: boolean;
  isSpeaking: boolean;
};

const BARS_COUNT = 15;

const AudioVisualizer = ({ isListening, isSpeaking }: Props) => {
  const animatedValues = useRef(
    Array.from({ length: BARS_COUNT }, () => new Animated.Value(4))
  ).current;

  useEffect(() => {
    let animations: Animated.CompositeAnimation[] = [];

    const startAnimations = () => {
      animations.forEach(anim => anim.stop());
      animations = [];

      animatedValues.forEach((val, i) => {
        let anim: Animated.CompositeAnimation;

        if (isListening) {
          // Rapid random bouncing for microphone input
          const randomDuration = 250 + Math.random() * 250;
          anim = Animated.loop(
            Animated.sequence([
              Animated.timing(val, {
                toValue: 15 + Math.random() * 35,
                duration: randomDuration,
                useNativeDriver: false,
              }),
              Animated.timing(val, {
                toValue: 4,
                duration: randomDuration,
                useNativeDriver: false,
              })
            ])
          );
        } else if (isSpeaking) {
          // Smooth sine wave pulse moving across bars
          const delay = i * 80;
          anim = Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(val, {
                toValue: 45,
                duration: 400,
                useNativeDriver: false,
              }),
              Animated.timing(val, {
                toValue: 4,
                duration: 450,
                useNativeDriver: false,
              })
            ])
          );
        } else {
          // Idle state - flat subtle breathing line
          anim = Animated.loop(
            Animated.sequence([
              Animated.timing(val, {
                toValue: 8,
                duration: 1000,
                useNativeDriver: false,
              }),
              Animated.timing(val, {
                toValue: 4,
                duration: 1000,
                useNativeDriver: false,
              })
            ])
          );
        }

        animations.push(anim);
        anim.start();
      });
    };

    startAnimations();

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [isListening, isSpeaking, animatedValues]);

  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        {animatedValues.map((val, i) => {
          // Alternate colors for a gorgeous gradient effect
          const isAccent = i % 2 === 0;
          const barColor = isSpeaking 
            ? (isAccent ? COLORS.accentLight : '#3498db') 
            : isListening 
            ? (isAccent ? COLORS.error : COLORS.accent) 
            : COLORS.textMuted;

          return (
            <Animated.View
              key={i}
              style={[
                styles.bar,
                {
                  height: val,
                  backgroundColor: barColor,
                }
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: '100%',
  },
  bar: {
    width: 5,
    borderRadius: 3,
    minHeight: 4,
  },
});

export default AudioVisualizer;
