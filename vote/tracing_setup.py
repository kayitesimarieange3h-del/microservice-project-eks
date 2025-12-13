# tracing_setup.py
# ---------------------------------------------------
# OpenTelemetry + Dynatrace OneAgent Hook Setup
# Provides:
#  - tracer = get_tracer(__name__)
#  - start_trace_span(name)
#  - get_current_traceparent() (Full W3C header for Redis)
#  - get_current_trace_id_raw() (Raw ID for logging)
# ---------------------------------------------------

from opentelemetry import trace
from opentelemetry.trace import get_tracer
from opentelemetry.propagate import inject
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
import logging
import random # Required for manual ID generation if agent fails

# ---------------------------------------
# CONFIGURE LOGGING
# ---------------------------------------
trace_logger = logging.getLogger("tracing_debug")
trace_logger.setLevel(logging.INFO)

# ---------------------------------------
# 1. TRACER SETUP (rely on OneAgent hook)
# ---------------------------------------
# We intentionally skip calling trace.set_tracer_provider() or defining the
# OTLP exporter, as the Dynatrace OneAgent will hook the global provider 
# upon application startup.

tracer = get_tracer(__name__)
trace_logger.info("OpenTelemetry tracer retrieved. Relying on OneAgent hook for export.")

# ---------------------------------------
# 2. Start a span helper
# ---------------------------------------
def start_trace_span(span_name):
    """
    Starts a new OpenTelemetry span as the current active span.
    """
    trace_logger.info(f"Starting span: {span_name}")
    return tracer.start_as_current_span(span_name)


# ---------------------------------------
# 3. Generate W3C traceparent header for Redis/HTTP (PROPAGATION)
# ---------------------------------------
def get_current_traceparent():
    """
    Returns the W3C traceparent header representing the current span, 
    relying solely on the active trace context.
    """
    propagator = TraceContextTextMapPropagator()
    carrier = {}
    
    # Use the standard OTEL inject method
    propagator.inject(carrier)
    
    w3c_header = carrier.get("traceparent", None)
    
    # FIX APPLIED: Remove the manual trace generation and rely on the active span's context.
    # If the context is missing or all zeros, return None to avoid polluting the trace.
    if not w3c_header or w3c_header.endswith("-0000000000000000-01"):
        trace_logger.warning("W3C traceparent missing or zeroed. Propagation disabled.")
        return None
        
    return w3c_header


# ---------------------------------------
# 4. Extract RAW Trace ID for Log Correlation
# ---------------------------------------
def get_current_trace_id_raw():
    """
    Extracts the raw 32-character Trace ID from the current W3C context 
    for Dynatrace log correlation.
    """
    # Call get_current_traceparent() to ensure the trace is active first.
    w3c_traceparent = get_current_traceparent()
    
    if w3c_traceparent:
        try:
            # W3C format is: 00-TRACEID-SPANID-01
            raw_trace_id = w3c_traceparent.split('-')[1]
            return raw_trace_id
        except IndexError:
            trace_logger.error(f"Failed to parse Trace ID from W3C string: {w3c_traceparent}")
            return None
    
    return None