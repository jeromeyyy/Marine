"""Combined slim ML service entry point.

Serves ONE FastAPI surface on one port (free-tier friendly):
- core ML endpoints from main.py (/predict/otolith, /predict/random-forest,
  /predict/regression, /predict/lstm, /anomaly, /trophic-cascade,
  /computer-vision/detect, /models, /health)
- eDNA shape endpoints from edna_shape.py (/shape/* and the pipeline-compat
  /predict used by the frontend's PYTHON_SERVICE_URL routes)

Core routes are registered first; everything else falls through to the eDNA
shape app with its original path. The combined app is itself FastAPI, so the
core routes run under a normal FastAPI middleware stack.
"""
from fastapi import FastAPI
from starlette.routing import Mount

from main import app as core_app
from edna_shape import app as shape_app

app = FastAPI(title="Marine ML Service (combined slim)")
app.router.routes.extend(core_app.routes)
app.router.routes.append(Mount("/", app=shape_app))
