"""The NRL Scores integration."""
from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .coordinator import NRLDataUpdateCoordinator

PLATFORMS: list[Platform] = [Platform.SENSOR]

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up NRL Scores from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    coordinator = NRLDataUpdateCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = coordinator

    import os
    frontend_path = os.path.join(os.path.dirname(__file__), "frontend")
    
    from homeassistant.components.http import StaticPathConfig
    
    # Register frontend directory for the custom card
    await hass.http.async_register_static_paths([
        StaticPathConfig("/nrl_scores_frontend", frontend_path, cache_headers=False)
    ])

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
