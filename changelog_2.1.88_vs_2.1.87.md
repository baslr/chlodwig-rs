# Änderungen in Claude Code 2.1.88 vs 2.1.87

## Neue Features

- **CA-Zertifikate:** Support für `CURL_CA_BUNDLE`, `NODE_EXTRA_CA_CERTS`, `SSL_CERT_FILE`, `REQUESTS_CA_BUNDLE`
- **Permissions:** `PermissionDenied`, `permission_retry` — robustere Fehlerbehandlung
- **Vim-Mode:** Neue Scroll-Befehle (`fullPageUp/Down`, `halfPageUp/Down`, `lineUp/Down`)
- **Terminal-Sidebar:** `showStatusInTerminalTab`, `tabStatus`, `statusColor`
- **PR-Automation:** `autofix-pr`, `background-pr`, `cherry-pick`
- **Memory Survey:** Neues Feature fürs CLAUDE.md-System
- **Ultraplan:** `__ULTRAPLAN_TELEPORT_LOCAL__`, `ultraplan-choice`
- **Token-Management:** `max_output_tokens_escalate` — dynamisches Output-Limit
- **Tmux:** `selection-copy`, `tmux-buffer`, `tmux-mouse-hint`
- **Error Handling:** Neuer `exitWithError`-Helper

## 15 neue Telemetrie-Events

`tengu_remote_agent`, `tengu_terminal_sidebar`, `tengu_amber_stoat`, `tengu_amber_json_tools`, `tengu_dunwich_bell`, `tengu_otk_slot_v1`, `tengu_memory_survey_event`, `tengu_api_529_background_dropped`, `tengu_auto_mem_tool_denied`, `tengu_config_tool_changed`, `tengu_duplicate_tool_use_id`, `tengu_edit_string_lengths`, `tengu_max_tokens_escalate`, `tengu_tool_input_json_parse_fail`, `tengu_ultraplan_awaiting_input`

## 6 Experiments entfernt

`tengu_borax_j4w`, `tengu_defer_all_bn4`, `tengu_defer_caveat_m9k`, `tengu_quiet_hollow`, `tengu_system_prompt_global_cache`, `tengu_tst_hint_m7r`

---

*Quelle: Source-Map-Analyse cli.js.map (2.1.88) vs. extrahierte Binary (2.1.87)*
