#include <unity.h>
#include "Arduino.h"
#include "SensorAggregator.h"

extern void __testSetMillis(unsigned long value);

static SensorFrame makeFrame(uint16_t hrBpm,
                             float tempC,
                             float humPct,
                             bool envValid = true) {
    SensorFrame f{};
    f.pulseOx.heartRateBpm = hrBpm;
    f.pulseOx.spO2Percent  = 97.0f;
    f.pulseOx.validReading = true;

    f.env.tempCelsius   = tempC;
    f.env.humidityPct   = humPct;
    f.env.validReading  = envValid;

    f.ecg.sampleCount   = 0;
    f.ecg.leadOff       = false;
    return f;
}

void setUp(void) {
    __testSetMillis(0);
}

void tearDown(void) {}

void test_average_heart_rate_for_valid_samples(void) {
    SensorAggregator agg;
    agg.start();

    agg.addSample(makeFrame(70, 36.6f, 45.0f));
    agg.addSample(makeFrame(80, 36.7f, 46.0f));
    agg.addSample(makeFrame(90, 36.8f, 47.0f));

    SensorFrame avg = agg.computeAverageFrame(1);

    TEST_ASSERT_EQUAL_UINT16(80, avg.pulseOx.heartRateBpm);
    TEST_ASSERT_FLOAT_WITHIN(0.05f, 36.7f, avg.env.tempCelsius);
    TEST_ASSERT_FLOAT_WITHIN(0.05f, 46.0f, avg.env.humidityPct);
    TEST_ASSERT_TRUE(avg.env.validReading);
}

void test_average_filters_out_unphysiological_hr(void) {
    SensorAggregator agg;
    agg.start();

    agg.addSample(makeFrame(0,   36.5f, 45.0f));
    agg.addSample(makeFrame(300, 36.5f, 45.0f));
    agg.addSample(makeFrame(60,  36.5f, 45.0f));
    agg.addSample(makeFrame(80,  36.5f, 45.0f));

    SensorFrame avg = agg.computeAverageFrame(2);

    TEST_ASSERT_EQUAL_UINT16(70, avg.pulseOx.heartRateBpm);
}

void test_env_invalid_when_no_env_samples_present(void) {
    SensorAggregator agg;
    agg.start();

    agg.addSample(makeFrame(70, 0.0f, 0.0f, false));
    agg.addSample(makeFrame(72, 0.0f, 0.0f, false));

    SensorFrame avg = agg.computeAverageFrame(3);

    TEST_ASSERT_FALSE(avg.env.validReading);
    TEST_ASSERT_EQUAL_FLOAT(0.0f, avg.env.tempCelsius);
    TEST_ASSERT_EQUAL_FLOAT(0.0f, avg.env.humidityPct);
}

void test_is_ready_after_ten_seconds(void) {
    __testSetMillis(0);
    SensorAggregator agg;
    agg.start();

    TEST_ASSERT_FALSE(agg.isReady());

    __testSetMillis(9999);
    TEST_ASSERT_FALSE(agg.isReady());

    __testSetMillis(10000);
    TEST_ASSERT_TRUE(agg.isReady());

    __testSetMillis(15000);
    TEST_ASSERT_TRUE(agg.isReady());
}

void test_reset_clears_samples(void) {
    SensorAggregator agg;
    agg.start();
    agg.addSample(makeFrame(70, 36.6f, 45.0f));
    agg.addSample(makeFrame(72, 36.7f, 46.0f));

    agg.reset();

    SensorFrame avg = agg.computeAverageFrame(4);
    TEST_ASSERT_EQUAL_UINT16(0, avg.pulseOx.heartRateBpm);
    TEST_ASSERT_FALSE(avg.env.validReading);
}

void test_addSample_caps_at_max_samples(void) {
    SensorAggregator agg;
    agg.start();

    for (int i = 0; i < 20; ++i) {
        agg.addSample(makeFrame(70, 36.5f, 45.0f));
    }

    SensorFrame avg = agg.computeAverageFrame(5);
    TEST_ASSERT_EQUAL_UINT16(70, avg.pulseOx.heartRateBpm);
}

int main(int, char**) {
    UNITY_BEGIN();
    RUN_TEST(test_average_heart_rate_for_valid_samples);
    RUN_TEST(test_average_filters_out_unphysiological_hr);
    RUN_TEST(test_env_invalid_when_no_env_samples_present);
    RUN_TEST(test_is_ready_after_ten_seconds);
    RUN_TEST(test_reset_clears_samples);
    RUN_TEST(test_addSample_caps_at_max_samples);
    return UNITY_END();
}
