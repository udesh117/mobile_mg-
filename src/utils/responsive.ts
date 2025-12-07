import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 14 Pro - 390x844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Scale factor based on screen width
const scale = SCREEN_WIDTH / BASE_WIDTH;
const verticalScale = SCREEN_HEIGHT / BASE_HEIGHT;

// Moderate scale - scales more conservatively
const moderateScale = (size: number, factor: number = 0.5) => {
  return size + (scale - 1) * size * factor;
};

/**
 * Scales a size based on screen width
 * @param size - The size to scale
 * @returns Scaled size
 */
export const scaleSize = (size: number): number => {
  return PixelRatio.roundToNearestPixel(size * scale);
};

/**
 * Scales a size vertically based on screen height
 * @param size - The size to scale
 * @returns Scaled size
 */
export const scaleVertical = (size: number): number => {
  return PixelRatio.roundToNearestPixel(size * verticalScale);
};

/**
 * Moderately scales a size (more conservative scaling)
 * @param size - The size to scale
 * @param factor - Scaling factor (0-1), default 0.5
 * @returns Scaled size
 */
export const moderateScaleSize = (size: number, factor: number = 0.5): number => {
  return PixelRatio.roundToNearestPixel(moderateScale(size, factor));
};

/**
 * Gets responsive font size
 * @param size - Base font size
 * @returns Scaled font size
 */
export const scaleFont = (size: number): number => {
  return moderateScaleSize(size, 0.3);
};

/**
 * Gets percentage of screen width
 * @param percentage - Percentage (0-100)
 * @returns Width in pixels
 */
export const widthPercentage = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Gets percentage of screen height
 * @param percentage - Percentage (0-100)
 * @returns Height in pixels
 */
export const heightPercentage = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

/**
 * Gets responsive padding
 * @param size - Base padding size
 * @returns Scaled padding
 */
export const scalePadding = (size: number): number => {
  return moderateScaleSize(size, 0.4);
};

/**
 * Gets responsive margin
 * @param size - Base margin size
 * @returns Scaled margin
 */
export const scaleMargin = (size: number): number => {
  return moderateScaleSize(size, 0.4);
};

/**
 * Gets responsive border radius
 * @param size - Base border radius
 * @returns Scaled border radius
 */
export const scaleBorderRadius = (size: number): number => {
  return moderateScaleSize(size, 0.3);
};

/**
 * Gets screen dimensions
 */
export const getScreenDimensions = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scale,
  verticalScale,
});

/**
 * Checks if device is tablet
 */
export const isTablet = (): boolean => {
  return (
    (Platform.OS === 'ios' && SCREEN_WIDTH >= 768) ||
    (Platform.OS === 'android' && SCREEN_WIDTH >= 600)
  );
};

/**
 * Checks if device is small screen
 */
export const isSmallScreen = (): boolean => {
  return SCREEN_WIDTH < 375;
};

/**
 * Checks if device is large screen
 */
export const isLargeScreen = (): boolean => {
  return SCREEN_WIDTH > 414;
};

