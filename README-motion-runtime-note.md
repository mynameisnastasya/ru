# WINK motion runtime verification

This branch moves the key scroll choreography out of experimental CSS view timelines and into a requestAnimationFrame-based runtime that updates CSS variables. The existing CSS view-timeline layer remains progressive enhancement only.

The runtime is disabled for `prefers-reduced-motion: reduce` and only mounts when `.wx-home` is present.
