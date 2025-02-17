import { createTransitionStyle } from '@tonic-ui/utils';
import { useColorMode } from '../color-mode';

const baseStyle = ({
  variantColor,
  height,
  switchMaxWidth,
  switchMaxHeight,
  colorMode,
}) => {
  const focusAndCheckedColor = {
    dark: `${variantColor}:60`,
    light: `${variantColor}:40`,
  }[colorMode];
  const checkedAndHoverColor = {
    dark: `${variantColor}:50`,
    light: `${variantColor}:30`,
  }[colorMode];
  const trackBorderColor = {
    dark: 'black',
    light: 'white',
  }[colorMode];

  return {
    width: switchMaxWidth,
    height: switchMaxHeight,
    _child: {
      opacity: 1,
    },
    _hover: {
      '[data-switch] [data-switch-track]': {
        fill: 'gray:50',
      },
    },
    _focus: {
      '[data-switch] [data-switch-track-halo]': {
        fill: focusAndCheckedColor,
      },
      '[data-switch] [data-switch-track-border]': {
        fill: trackBorderColor,
      }
    },
    _checked: {
      '[data-switch] [data-switch-track]': {
        fill: focusAndCheckedColor,
      },
      '[data-switch] [data-switch-thumb]': {
        transform: `translateX(${height}px)`,
      },
    },
    _checkedAndHover: {
      '[data-switch] [data-switch-track]': {
        fill: checkedAndHoverColor,
      },
    },
    _disabled: {
      opacity: 0.28,
    }
  };
};

const switchSVGStyle = ({
  switchMaxWidth,
  switchMaxHeight,
}) => {
  return {
    width: '100%',
    height: '100%',
    viewBox: `0 0 ${switchMaxWidth} ${switchMaxHeight}`,
  };
};

const switchTrackHaloStyle = ({
  switchMaxWidth,
  switchMaxHeight,
}) => {
  return {
    width: switchMaxWidth,
    height: switchMaxHeight,
    rx: `${switchMaxHeight / 2}`,
    fill: 'none',
    strokeWidth: 0,
  };
};

const switchTrackBorderStyle = ({
  switchMaxWidth,
  switchMaxHeight,
}) => {
  return {
    width: switchMaxWidth - 4, // The halo of one side track is 2, so the sum of both sides is 4
    height: switchMaxHeight - 4,
    rx: `${(switchMaxHeight - 4) / 2}`,
    fill: 'none',
    strokeWidth: 0,
  };
};

const switchTrackStyle = ({
  width,
  height,
  colorMode,
}) => {
  const fillColor = {
    dark: 'gray:60',
    light: 'gray:30',
  }[colorMode];

  return {
    width,
    height,
    rx: `${height / 2}`,
    fill: fillColor,
    pointerEvents: 'all',
  };
};

const switchThumbStyle = ({
  radius,
  switchMaxHeight,
}) => {
  return {
    cx: `${switchMaxHeight / 2}`,
    cy: `${switchMaxHeight / 2}`,
    r: radius,
    fill: 'white:emphasis',
    transform: 'translateX(0)',
    transition: createTransitionStyle(['transform'], { duration: 250 }),
    transformBox: 'fill-box',
  };
};

const useSwitchStyle = props => {
  const [colorMode] = useColorMode();
  const defaultSize = 'md';
  const switchSize = {
    sm: {
      width: 32,
      height: 16,
      radius: 6,
    },
    md: {
      width: 48,
      height: 24,
      radius: 9,
    },
    lg: {
      width: 64,
      height: 32,
      radius: 12,
    },
  };
  const size = switchSize[props.size] ?? switchSize[defaultSize];
  const { width, height, radius } = size;
  const switchMaxWidth = width + 6; //The border and halo width of the one side switching track is 1 and 2, so the sum of both sides is 6
  const switchMaxHeight = height + 6; // Same as width
  const _props = { ...props, colorMode, width, height, radius, switchMaxWidth, switchMaxHeight };

  return {
    baseStyle: baseStyle(_props),
    switchSVGStyle: switchSVGStyle(_props),
    switchTrackHaloStyle: switchTrackHaloStyle(_props),
    switchTrackBorderStyle: switchTrackBorderStyle(_props),
    switchTrackStyle: switchTrackStyle(_props),
    switchThumbStyle: switchThumbStyle(_props),
  };
};

export {
  useSwitchStyle,
};
