import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  progress: number; // 0 to 1
  size: number;
  strokeWidth: number;
  color: string;
  bgColor: string;
}

export const CircularProgress: React.FC<Props> = ({
  progress,
  size,
  strokeWidth,
  color,
  bgColor,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: withTiming(circumference * (1 - progress), {
      duration: 500,
      easing: Easing.out(Easing.quad),
    }),
  }));

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      {/* Background ring */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={bgColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress ring */}
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        strokeLinecap="round"
      />
    </Svg>
  );
};
