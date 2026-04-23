# ESP32 Ripple Counting Module – Strict Specification

## 1. Objective
Implement a deterministic, testable C++ module for ripple counting on ESP32 using ADC current sensing (DRV8215 IPROPI). The module must estimate:
- Ripple count
- Angular position
- Mechanical speed

No analog comparator is available; all processing must be digital.

---

## 2. Functional Requirements

### 2.1 Inputs
- ADC samples (uint16_t)
- Fixed sampling rate (Hz)

### 2.2 Outputs
- Ripple count (uint32_t)
- Position (radians, float)
- Speed (RPS, float)

---

## 3. Interface Definition

```cpp
class RippleCounter {
public:
    struct Config {
        float sampleRate;
        float lpAlpha;
        float hpAlpha;
        float threshold;
        float hysteresis;
        uint32_t ripplesPerRev;
        uint32_t minPeriodSamples;
    };

    explicit RippleCounter(const Config& cfg);

    void reset();

    void update(uint16_t adcSample);

    uint32_t getRippleCount() const;
    float getPositionRad() const;
    float getSpeedRPS() const;
};
```

---

## 4. Processing Requirements

### 4.1 DC Removal
IIR low-pass:
dc[n] = (1-a)*dc[n-1] + a*x[n]

### 4.2 High-pass Filter
hp[n] = a*(hp[n-1] + x[n] - x[n-1])

### 4.3 Adaptive Threshold
th[n] = 0.99 * th[n-1] + 0.01 * |signal|

### 4.4 Edge Detection (Schmitt Trigger)
- Rising edge when signal > threshold
- Falling edge when signal < threshold*(1-hysteresis)

### 4.5 Minimum Period Constraint
Reject ripple if:
samples_since_last < minPeriodSamples

---

## 5. Non-Functional Requirements

- Deterministic execution per sample (no dynamic allocation)
- O(1) processing per update()
- No floating overflow or NaN allowed
- Must operate at ≥20 kHz sample rate on ESP32

---

## 6. Test Cases

### 6.1 Synthetic Sine Wave
Input:
- sine wave + DC offset

Expected:
- Correct ripple count within ±1%

---

### 6.2 Noisy Signal
Input:
- sine + gaussian noise

Expected:
- No false ripple detections beyond 5%

---

### 6.3 Constant Signal (No Ripple)
Input:
- constant DC

Expected:
- ripple count = 0

---

### 6.4 Frequency Sweep
Input:
- increasing sine frequency

Expected:
- speed estimate tracks within ±5%

---

### 6.5 Minimum Period Enforcement
Input:
- artificially injected double peaks

Expected:
- second peak rejected

---

## 7. Acceptance Criteria

The implementation is ACCEPTED if:

1. Ripple counting error < ±2% under clean signal
2. Ripple counting error < ±5% under noisy signal
3. No false counts on DC input
4. Speed estimation error < ±5%
5. CPU usage allows ≥20 kHz update rate on ESP32
6. No memory allocation after initialization
7. No undefined behavior (NaN, overflow)

---

## 8. Calibration Procedure

1. Measure ripple amplitude → set threshold
2. Measure ripple frequency → tune filters
3. Rotate motor 1 rev → measure ripplesPerRev

---

## 9. Optional Enhancements

- Replace HPF with biquad band-pass
- Zero-crossing detection instead of peak
- PWM-synchronized sampling
- ADC DMA (I2S mode)

---

## 10. Deliverables

- ripple_counter.h
- ripple_counter.cpp
- unit tests (host runnable)
- example ESP32 integration

