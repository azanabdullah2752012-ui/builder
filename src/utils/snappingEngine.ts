import type { CanvasElement, UserGuide, SmartSnapLine, EqualSpacingIndicator, DistanceMeasurement } from '../types/editor';

export interface SnappingOptions {
  snapToObjects?: boolean;
  snapToGuides?: boolean;
  snapToCanvasCenter?: boolean;
  snapToEqualSpacing?: boolean;
  threshold?: number;
}

export interface SnappingResult {
  snappedX: number;
  snappedY: number;
  snapLines: SmartSnapLine[];
  equalSpacings: EqualSpacingIndicator[];
}

/**
 * Computes high-precision Figma-style smart snapping for an element being dragged.
 */
export function computeSmartSnapping(
  movingElement: { id: string; width: number; height: number },
  proposedX: number,
  proposedY: number,
  allElements: CanvasElement[],
  userGuides: UserGuide[] = [],
  canvasWidth: number,
  canvasHeight: number,
  options: SnappingOptions = {}
): SnappingResult {
  const {
    snapToObjects = true,
    snapToGuides = true,
    snapToCanvasCenter = true,
    snapToEqualSpacing = true,
    threshold = 5,
  } = options;

  let snappedX = proposedX;
  let snappedY = proposedY;
  const snapLines: SmartSnapLine[] = [];
  const equalSpacings: EqualSpacingIndicator[] = [];

  const siblings = allElements.filter((el) => el.id !== movingElement.id);

  // -------------------------------------------------------------
  // 1. Equal Spacing Snapping (Smart Distribution in rows/stacks)
  // -------------------------------------------------------------
  if (snapToEqualSpacing && siblings.length >= 2) {
    // Check horizontal equal spacing
    const sortedByX = [...siblings].sort((a, b) => a.x - b.x);
    for (let i = 0; i < sortedByX.length - 1; i++) {
      const leftEl = sortedByX[i];
      const rightEl = sortedByX[i + 1];

      const leftEdge = leftEl.x + leftEl.width;
      const rightEdge = rightEl.x;

      // Check if moving element is between leftEl and rightEl
      if (proposedX >= leftEdge - threshold && proposedX + movingElement.width <= rightEdge + threshold) {
        const availableSpace = rightEdge - leftEdge - movingElement.width;
        if (availableSpace > 0) {
          const targetGap = availableSpace / 2;
          const candidateX = Math.round(leftEdge + targetGap);
          if (Math.abs(proposedX - candidateX) <= threshold * 1.5) {
            snappedX = candidateX;
            equalSpacings.push({
              axis: 'x',
              gap: Math.round(targetGap),
              start: leftEdge,
              end: rightEdge,
              centerSpan: Math.round(leftEl.y + leftEl.height / 2),
              label: `${Math.round(targetGap)}px`,
            });
            break;
          }
        }
      }
    }

    // Check vertical equal spacing
    const sortedByY = [...siblings].sort((a, b) => a.y - b.y);
    for (let i = 0; i < sortedByY.length - 1; i++) {
      const topEl = sortedByY[i];
      const bottomEl = sortedByY[i + 1];

      const topEdge = topEl.y + topEl.height;
      const bottomEdge = bottomEl.y;

      if (proposedY >= topEdge - threshold && proposedY + movingElement.height <= bottomEdge + threshold) {
        const availableSpace = bottomEdge - topEdge - movingElement.height;
        if (availableSpace > 0) {
          const targetGap = availableSpace / 2;
          const candidateY = Math.round(topEdge + targetGap);
          if (Math.abs(proposedY - candidateY) <= threshold * 1.5) {
            snappedY = candidateY;
            equalSpacings.push({
              axis: 'y',
              gap: Math.round(targetGap),
              start: topEdge,
              end: bottomEdge,
              centerSpan: Math.round(topEl.x + topEl.width / 2),
              label: `${Math.round(targetGap)}px`,
            });
            break;
          }
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 2. Horizontal & Vertical Snapping (Objects, Guides, Canvas)
  // -------------------------------------------------------------
  const elLeft = snappedX;
  const elRight = snappedX + movingElement.width;
  const elCenterX = snappedX + movingElement.width / 2;

  const elTop = snappedY;
  const elBottom = snappedY + movingElement.height;
  const elCenterY = snappedY + movingElement.height / 2;

  let bestDiffX = threshold + 1;
  let snapTargetX: number | null = null;
  let snapLineLabelX: string | undefined;

  let bestDiffY = threshold + 1;
  let snapTargetY: number | null = null;
  let snapLineLabelY: string | undefined;

  // A. Canvas Center
  if (snapToCanvasCenter) {
    const canvasCenterX = Math.round(canvasWidth / 2);
    const canvasCenterY = Math.round(canvasHeight / 2);

    // Canvas Center X
    const diffCanvasX = Math.abs(elCenterX - canvasCenterX);
    if (diffCanvasX <= threshold && diffCanvasX < bestDiffX) {
      bestDiffX = diffCanvasX;
      snappedX = Math.round(canvasCenterX - movingElement.width / 2);
      snapTargetX = canvasCenterX;
      snapLineLabelX = 'Canvas Center';
    }

    // Canvas Center Y
    const diffCanvasY = Math.abs(elCenterY - canvasCenterY);
    if (diffCanvasY <= threshold && diffCanvasY < bestDiffY) {
      bestDiffY = diffCanvasY;
      snappedY = Math.round(canvasCenterY - movingElement.height / 2);
      snapTargetY = canvasCenterY;
      snapLineLabelY = 'Canvas Middle';
    }
  }

  // B. User Guides (from Rulers)
  if (snapToGuides && userGuides.length > 0) {
    for (const guide of userGuides) {
      if (guide.orientation === 'vertical') {
        // Snap left, center, right to guide
        const diffLeft = Math.abs(elLeft - guide.position);
        const diffCenter = Math.abs(elCenterX - guide.position);
        const diffRight = Math.abs(elRight - guide.position);

        if (diffLeft <= threshold && diffLeft < bestDiffX) {
          bestDiffX = diffLeft;
          snappedX = guide.position;
          snapTargetX = guide.position;
          snapLineLabelX = `Guide ${guide.position}px`;
        } else if (diffCenter <= threshold && diffCenter < bestDiffX) {
          bestDiffX = diffCenter;
          snappedX = Math.round(guide.position - movingElement.width / 2);
          snapTargetX = guide.position;
          snapLineLabelX = `Guide ${guide.position}px`;
        } else if (diffRight <= threshold && diffRight < bestDiffX) {
          bestDiffX = diffRight;
          snappedX = guide.position - movingElement.width;
          snapTargetX = guide.position;
          snapLineLabelX = `Guide ${guide.position}px`;
        }
      } else if (guide.orientation === 'horizontal') {
        const diffTop = Math.abs(elTop - guide.position);
        const diffCenter = Math.abs(elCenterY - guide.position);
        const diffBottom = Math.abs(elBottom - guide.position);

        if (diffTop <= threshold && diffTop < bestDiffY) {
          bestDiffY = diffTop;
          snappedY = guide.position;
          snapTargetY = guide.position;
          snapLineLabelY = `Guide ${guide.position}px`;
        } else if (diffCenter <= threshold && diffCenter < bestDiffY) {
          bestDiffY = diffCenter;
          snappedY = Math.round(guide.position - movingElement.height / 2);
          snapTargetY = guide.position;
          snapLineLabelY = `Guide ${guide.position}px`;
        } else if (diffBottom <= threshold && diffBottom < bestDiffY) {
          bestDiffY = diffBottom;
          snappedY = guide.position - movingElement.height;
          snapTargetY = guide.position;
          snapLineLabelY = `Guide ${guide.position}px`;
        }
      }
    }
  }

  // C. Sibling Objects
  if (snapToObjects) {
    for (const other of siblings) {
      const otherRight = other.x + other.width;
      const otherBottom = other.y + other.height;
      const otherCenterX = other.x + other.width / 2;
      const otherCenterY = other.y + other.height / 2;

      // X-Axis Snapping
      const dLeftLeft = Math.abs(elLeft - other.x);
      const dCenterCenter = Math.abs(elCenterX - otherCenterX);
      const dRightRight = Math.abs(elRight - otherRight);
      const dLeftRight = Math.abs(elLeft - otherRight);
      const dRightLeft = Math.abs(elRight - other.x);

      if (dLeftLeft <= threshold && dLeftLeft < bestDiffX) {
        bestDiffX = dLeftLeft;
        snappedX = other.x;
        snapTargetX = other.x;
        snapLineLabelX = `Align Left (${other.name || 'Object'})`;
      } else if (dCenterCenter <= threshold && dCenterCenter < bestDiffX) {
        bestDiffX = dCenterCenter;
        snappedX = Math.round(otherCenterX - movingElement.width / 2);
        snapTargetX = Math.round(otherCenterX);
        snapLineLabelX = `Align Center (${other.name || 'Object'})`;
      } else if (dRightRight <= threshold && dRightRight < bestDiffX) {
        bestDiffX = dRightRight;
        snappedX = otherRight - movingElement.width;
        snapTargetX = otherRight;
        snapLineLabelX = `Align Right (${other.name || 'Object'})`;
      } else if (dLeftRight <= threshold && dLeftRight < bestDiffX) {
        bestDiffX = dLeftRight;
        snappedX = otherRight;
        snapTargetX = otherRight;
        snapLineLabelX = `Snap Edge (${other.name || 'Object'})`;
      } else if (dRightLeft <= threshold && dRightLeft < bestDiffX) {
        bestDiffX = dRightLeft;
        snappedX = other.x - movingElement.width;
        snapTargetX = other.x;
        snapLineLabelX = `Snap Edge (${other.name || 'Object'})`;
      }

      // Y-Axis Snapping
      const dTopTop = Math.abs(elTop - other.y);
      const dCenterCenterY = Math.abs(elCenterY - otherCenterY);
      const dBottomBottom = Math.abs(elBottom - otherBottom);
      const dTopBottom = Math.abs(elTop - otherBottom);
      const dBottomTop = Math.abs(elBottom - other.y);

      if (dTopTop <= threshold && dTopTop < bestDiffY) {
        bestDiffY = dTopTop;
        snappedY = other.y;
        snapTargetY = other.y;
        snapLineLabelY = `Align Top (${other.name || 'Object'})`;
      } else if (dCenterCenterY <= threshold && dCenterCenterY < bestDiffY) {
        bestDiffY = dCenterCenterY;
        snappedY = Math.round(otherCenterY - movingElement.height / 2);
        snapTargetY = Math.round(otherCenterY);
        snapLineLabelY = `Align Middle (${other.name || 'Object'})`;
      } else if (dBottomBottom <= threshold && dBottomBottom < bestDiffY) {
        bestDiffY = dBottomBottom;
        snappedY = otherBottom - movingElement.height;
        snapTargetY = otherBottom;
        snapLineLabelY = `Align Bottom (${other.name || 'Object'})`;
      } else if (dTopBottom <= threshold && dTopBottom < bestDiffY) {
        bestDiffY = dTopBottom;
        snappedY = otherBottom;
        snapTargetY = otherBottom;
        snapLineLabelY = `Snap Edge (${other.name || 'Object'})`;
      } else if (dBottomTop <= threshold && dBottomTop < bestDiffY) {
        bestDiffY = dBottomTop;
        snappedY = other.y - movingElement.height;
        snapTargetY = other.y;
        snapLineLabelY = `Snap Edge (${other.name || 'Object'})`;
      }
    }
  }

  // Construct snap line objects
  if (snapTargetX !== null) {
    snapLines.push({
      type: 'vertical',
      position: snapTargetX,
      label: snapLineLabelX,
      color: '#ec4899', // Figma Magenta
    });
  }

  if (snapTargetY !== null) {
    snapLines.push({
      type: 'horizontal',
      position: snapTargetY,
      label: snapLineLabelY,
      color: '#ec4899', // Figma Magenta
    });
  }

  return {
    snappedX,
    snappedY,
    snapLines,
    equalSpacings,
  };
}

/**
 * Computes exact Figma-style Alt/Option distance measurements between selected element
 * and a hovered target (or canvas artboard edges).
 */
export function computeDistanceMeasurements(
  selectedElement: { id: string; x: number; y: number; width: number; height: number },
  hoveredElement: { id: string; x: number; y: number; width: number; height: number } | null,
  canvasWidth: number,
  canvasHeight: number
): DistanceMeasurement {
  const sel = {
    x: selectedElement.x,
    y: selectedElement.y,
    width: selectedElement.width,
    height: selectedElement.height,
  };

  // Case 1: Hovering over Canvas Artboard Background (Distances to Artboard Edges)
  if (!hoveredElement || hoveredElement.id === selectedElement.id) {
    const topGap = Math.max(0, Math.round(sel.y));
    const bottomGap = Math.max(0, Math.round(canvasHeight - (sel.y + sel.height)));
    const leftGap = Math.max(0, Math.round(sel.x));
    const rightGap = Math.max(0, Math.round(canvasWidth - (sel.x + sel.width)));

    return {
      targetId: undefined,
      isCanvasBounds: true,
      selectedRect: sel,
      targetRect: { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
      topGap,
      bottomGap,
      leftGap,
      rightGap,
    };
  }

  // Case 2: Hovering over Another Element
  const tgt = {
    x: hoveredElement.x,
    y: hoveredElement.y,
    width: hoveredElement.width,
    height: hoveredElement.height,
  };

  const selRight = sel.x + sel.width;
  const selBottom = sel.y + sel.height;
  const tgtRight = tgt.x + tgt.width;
  const tgtBottom = tgt.y + tgt.height;

  let leftGap: number | null = null;
  let rightGap: number | null = null;
  let topGap: number | null = null;
  let bottomGap: number | null = null;

  // Horizontal Separation
  if (sel.x >= tgtRight) {
    // Selected is strictly to the right of target
    leftGap = Math.round(sel.x - tgtRight);
  } else if (selRight <= tgt.x) {
    // Selected is strictly to the left of target
    rightGap = Math.round(tgt.x - selRight);
  } else {
    // Horizontally overlapping: measure distance between edges
    leftGap = Math.round(Math.abs(sel.x - tgt.x));
    rightGap = Math.round(Math.abs(selRight - tgtRight));
  }

  // Vertical Separation
  if (sel.y >= tgtBottom) {
    // Selected is strictly below target
    topGap = Math.round(sel.y - tgtBottom);
  } else if (selBottom <= tgt.y) {
    // Selected is strictly above target
    bottomGap = Math.round(tgt.y - selBottom);
  } else {
    // Vertically overlapping: measure distance between edges
    topGap = Math.round(Math.abs(sel.y - tgt.y));
    bottomGap = Math.round(Math.abs(selBottom - tgtBottom));
  }

  return {
    targetId: hoveredElement.id,
    isCanvasBounds: false,
    selectedRect: sel,
    targetRect: tgt,
    topGap,
    bottomGap,
    leftGap,
    rightGap,
  };
}
