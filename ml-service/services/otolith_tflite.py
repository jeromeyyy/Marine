"""TensorFlow-free otolith classifier for slim runtimes (e.g. 512MB free tiers).

Serves the same 37-class MobileNetV2 artifact as services/otolith_classifier.py
but through tflite-runtime instead of full TensorFlow. Softmax mode only:
the embedding-kNN fallback needs TF/Keras MobileNetV2 and is NOT available
in slim mode.

Model validation status (repo audit, 14-15 Nov 2026): the artifact achieves
1/37 top-1 agreement on the packaged reference images (uniform-random level),
mean confidence 0.149. Responses must carry this unvalidated status; callers
must not present predictions as verified identification.
"""
from __future__ import annotations

import io
import json
import threading
from pathlib import Path

import numpy as np
from PIL import Image


class OtolithTFLiteClassifier:
    def __init__(
        self,
        model_path: Path,
        labels_path: Path,
        image_size: tuple[int, int] = (224, 224),
    ) -> None:
        self.model_path = Path(model_path)
        self.labels_path = Path(labels_path)
        self.image_size = image_size
        self.labels: list[str] = []
        self.loaded = False
        self.mode = "unavailable"
        self._interpreter = None
        self._input = None
        self._output = None
        self._lock = threading.Lock()  # tflite Interpreter is not thread-safe

        if self.model_path.exists() and self.labels_path.exists():
            from tflite_runtime.interpreter import Interpreter

            self._interpreter = Interpreter(model_path=str(self.model_path))
            self._interpreter.allocate_tensors()
            self._input = self._interpreter.get_input_details()[0]
            self._output = self._interpreter.get_output_details()[0]
            self.labels = json.loads(self.labels_path.read_text(encoding="utf-8"))
            self.loaded = True
            self.mode = "softmax_tflite"

    def _preprocess(self, image_bytes: bytes) -> np.ndarray:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize(self.image_size)
        arr = np.asarray(image, dtype=np.float32)
        # mobilenet_v2.preprocess_input equivalent: scale to [-1, 1]
        arr = arr / 127.5 - 1.0
        return np.expand_dims(arr, axis=0).astype(self._input["dtype"])

    def predict(self, image_bytes: bytes) -> dict:
        if not self.loaded or self._interpreter is None:
            raise RuntimeError("Otolith TFLite model artifacts are not available")
        batch = self._preprocess(image_bytes)
        with self._lock:
            self._interpreter.set_tensor(self._input["index"], batch)
            self._interpreter.invoke()
            probs = self._interpreter.get_tensor(self._output["index"])[0]
        index = int(np.argmax(probs))
        top = sorted(
            (
                {"species": self.labels[i], "confidence": float(probs[i])}
                for i in range(len(self.labels))
            ),
            key=lambda d: d["confidence"],
            reverse=True,
        )[:5]
        return {
            "species": self.labels[index],
            "confidence": float(probs[index]),
            "top_k": top,
            "mode": self.mode,
            "validation": (
                "unvalidated: 1/37 top-1 agreement on packaged reference set "
                "(uniform-random level); not a verified identification"
            ),
        }
