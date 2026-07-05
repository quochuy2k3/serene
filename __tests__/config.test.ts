import {
  resolveOverlayConfig,
  MOTION_CUES_CONFIG,
  FLOW_TUNING_DEFAULTS,
} from "@/constants/config";

describe("resolveOverlayConfig", () => {
  it("maps medium/medium/medium defaults to concrete values", () => {
    expect(
      resolveOverlayConfig({
        dotSize: "medium",
        dotDensity: "medium",
        sensitivity: "medium",
        dotOpacity: 0.6,
        motionStyle: "regular",
      })
    ).toEqual({
      dotSizeDp: 12,
      sensitivity: 1.0,
      dotCount: 8,
      opacity: 0.6,
      style: "regular",
      flow: FLOW_TUNING_DEFAULTS,
    });
  });

  it("maps small/low/low with min opacity", () => {
    expect(
      resolveOverlayConfig({
        dotSize: "small",
        dotDensity: "low",
        sensitivity: "low",
        dotOpacity: 0.2,
        motionStyle: "regular",
      })
    ).toEqual({
      dotSizeDp: 8,
      sensitivity: 0.5,
      dotCount: 4,
      opacity: 0.2,
      style: "regular",
      flow: FLOW_TUNING_DEFAULTS,
    });
  });

  it("maps large/high/high with max opacity", () => {
    expect(
      resolveOverlayConfig({
        dotSize: "large",
        dotDensity: "high",
        sensitivity: "high",
        dotOpacity: 1.0,
        motionStyle: "dynamic",
      })
    ).toEqual({
      dotSizeDp: 16,
      sensitivity: 1.5,
      dotCount: 12,
      opacity: 1.0,
      style: "dynamic",
      flow: FLOW_TUNING_DEFAULTS,
    });
  });

  it("passes the motion style through unchanged", () => {
    expect(
      resolveOverlayConfig({
        dotSize: "medium",
        dotDensity: "medium",
        sensitivity: "medium",
        dotOpacity: 0.6,
        motionStyle: "dynamic",
      }).style
    ).toBe("dynamic");
  });

  it("clamps opacity into the configured range", () => {
    const low = resolveOverlayConfig({
      dotSize: "medium",
      dotDensity: "medium",
      sensitivity: "medium",
      dotOpacity: 0.05,
      motionStyle: "regular",
    });
    const high = resolveOverlayConfig({
      dotSize: "medium",
      dotDensity: "medium",
      sensitivity: "medium",
      dotOpacity: 5,
      motionStyle: "regular",
    });
    expect(low.opacity).toBe(MOTION_CUES_CONFIG.opacityRange.min);
    expect(high.opacity).toBe(MOTION_CUES_CONFIG.opacityRange.max);
  });
});
