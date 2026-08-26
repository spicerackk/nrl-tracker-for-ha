"""Config flow for NRL Scores integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN, CONF_TEAM, CONF_TEAM_ID, TEAMS

_LOGGER = logging.getLogger(__name__)

class NRLConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for NRL Scores."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        if user_input is not None:
            team_name = user_input[CONF_TEAM]
            team_info = TEAMS[team_name]
            team_id = team_info["id"]
            comp_id = team_info["comp"]
            
            await self.async_set_unique_id(str(team_id))
            self._abort_if_unique_id_configured()
            
            return self.async_create_entry(
                title=team_name,
                data={
                    CONF_TEAM: team_name,
                    CONF_TEAM_ID: team_id,
                    "comp_id": comp_id,
                },
            )

        teams = list(TEAMS.keys())
        data_schema = vol.Schema(
            {
                vol.Required(CONF_TEAM): vol.In(teams),
            }
        )

        return self.async_show_form(
            step_id="user", data_schema=data_schema
        )
