/**
 * Physical-size calibration helpers for the optional Amsler self-monitoring activity.
 *
 * A standard card is used as a physical reference. The helper only determines
 * whether the intended grid can fit the current viewport; it does not validate
 * a device's physical pixel density or clinical suitability.
 */
export const CREDIT_CARD_WIDTH_MM = 85.6;
export const GRID_PHYSICAL_MM = 100;
export const MIN_CALIBRATION_VIEWPORT_PX = 600;
export const VIEWPORT_MARGIN_PX = 32;
export const MAX_CALIBRATION_SLIDER_PX = 500;
export const MIN_CALIBRATION_SLIDER_PX = 150;

export function calculateGridSizePx(sliderWidthPx) {
  if (!Number.isFinite(sliderWidthPx) || sliderWidthPx <= 0) return 0;
  return (sliderWidthPx / CREDIT_CARD_WIDTH_MM) * GRID_PHYSICAL_MM;
}

export function getMaxCalibrationSliderWidth(viewportWidthPx) {
  if (!Number.isFinite(viewportWidthPx) || viewportWidthPx <= 0) {
    return MIN_CALIBRATION_SLIDER_PX;
  }
  const availableGridWidth = Math.max(0, viewportWidthPx - VIEWPORT_MARGIN_PX);
  const cardReferenceWidth = Math.floor(
    (availableGridWidth * CREDIT_CARD_WIDTH_MM) / GRID_PHYSICAL_MM
  );
  return Math.min(
    MAX_CALIBRATION_SLIDER_PX,
    Math.max(MIN_CALIBRATION_SLIDER_PX, cardReferenceWidth)
  );
}

export function canCalibrateAmsler(viewportWidthPx, sliderWidthPx) {
  if (!Number.isFinite(viewportWidthPx) || !Number.isFinite(sliderWidthPx)) return false;
  if (viewportWidthPx < MIN_CALIBRATION_VIEWPORT_PX) return false;
  return calculateGridSizePx(sliderWidthPx) <= viewportWidthPx - VIEWPORT_MARGIN_PX;
}

export function doesCalibratedGridFit(viewportWidthPx, gridWidthPx) {
  if (!Number.isFinite(viewportWidthPx) || !Number.isFinite(gridWidthPx)) return false;
  return viewportWidthPx >= gridWidthPx + VIEWPORT_MARGIN_PX;
}
