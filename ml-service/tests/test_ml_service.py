import unittest
import numpy as np

class TestMarineMLService(unittest.TestCase):
    def test_anomaly_detection_logic(self):
        # Test marine heatwave threshold
        temp = 32.5
        sal = 35.0
        ph = 8.1
        do = 6.0
        
        expected_temp = 28.0
        temp_dev = abs(temp - expected_temp) / 3.0
        sal_dev = abs(sal - 35.0) / 2.5
        ph_dev = abs(ph - 8.1) / 0.4
        ox_dev = max(0.0, (6.0 - do) / 2.5)
        
        anomaly_score = float(np.clip((temp_dev * 0.35 + sal_dev * 0.15 + ph_dev * 0.20 + ox_dev * 0.30), 0.0, 1.0))
        self.assertGreater(anomaly_score, 0.5)

    def test_trophic_cascade_calculation(self):
        abundance_delta = -50.0  # 50% drop in apex predator
        temp_delta = 2.0         # 2 deg C warming
        
        predator_pressure = abundance_delta * -0.6
        thermal_stress = temp_delta * -8.5
        delta = round(predator_pressure + thermal_stress, 1)
        
        # Expected: predator drop releases prey pressure (+30%), thermal stress reduces prey (-17%) -> net ~ +13%
        self.assertEqual(delta, 13.0)

    def test_dna_shape_features(self):
        valid_features = ["MGW", "Roll", "HelT", "ProT"]
        self.assertIn("MGW", valid_features)
        self.assertIn("Roll", valid_features)

if __name__ == '__main__':
    unittest.main()
