"""Config flow for NRL Scores integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN, CONF_TEAM, CONF_TEAM_ID, COMPETITIONS, TEAMS

_LOGGER = logging.getLogger(__name__)

class NRLConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for NRL Scores."""

    VERSION = 1

    def __init__(self):
        """Initialize flow."""
        self.comp_id = None
        self.comp_name = None

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        if user_input is not None:
            self.comp_name = user_input["competition"]
            # Find comp_id
            for c_id, c_name in COMPETITIONS.items():
                if c_name == self.comp_name:
                    self.comp_id = c_id
                    break
            return await self.async_step_team()

        comps = list(COMPETITIONS.values())
        data_schema = vol.Schema(
            {
                vol.Required("competition"): vol.In(comps),
            }
        )

        return self.async_show_form(
            step_id="user", data_schema=data_schema
        )

    async def async_step_team(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the team selection step."""
        if user_input is not None:
            team_name = user_input[CONF_TEAM]
            team_id = TEAMS[str(self.comp_id)][team_name]
            
            # Use a unique id combining team_id and comp_id so the same team can be tracked in different comps
            unique_id = f"{team_id}_{self.comp_id}"
            await self.async_set_unique_id(unique_id)
            self._abort_if_unique_id_configured()
            
            return self.async_create_entry(
                title=team_name,
                data={
                    CONF_TEAM: team_name,
                    CONF_TEAM_ID: team_id,
                    "comp_id": int(self.comp_id),
                },
            )

        teams_for_comp = list(TEAMS[str(self.comp_id)].keys())
        data_schema = vol.Schema(
            {
                vol.Required(CONF_TEAM): vol.In(teams_for_comp),
            }
        )

        return self.async_show_form(
            step_id="team", data_schema=data_schema
        )
