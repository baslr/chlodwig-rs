    Z9();
    u7();
    y6();
    N_();
    H7();
    lK();
    Tl();
    K3H();
    GY();
    (LBq = require("crypto")),
      (DG4 = new Set([
        "chrome_bridge_connection_succeeded",
        "chrome_bridge_connection_failed",
        "chrome_bridge_disconnected",
        "chrome_bridge_tool_call_completed",
        "chrome_bridge_tool_call_error",
        "chrome_bridge_tool_call_started",
        "chrome_bridge_tool_call_timeout",
        "tengu_api_error",
        "tengu_api_success",
        "tengu_brief_mode_enabled",
        "tengu_brief_mode_toggled",
        "tengu_brief_send",
        "tengu_cancel",
        "tengu_compact_failed",
        "tengu_exit",
        "tengu_flicker",
        "tengu_init",
        "tengu_model_fallback_triggered",
        "tengu_oauth_error",
        "tengu_oauth_success",
        "tengu_oauth_token_refresh_failure",
        "tengu_oauth_token_refresh_success",
        "tengu_oauth_token_refresh_lock_acquiring",
        "tengu_oauth_token_refresh_lock_acquired",
        "tengu_oauth_token_refresh_starting",
        "tengu_oauth_token_refresh_completed",
        "tengu_oauth_token_refresh_lock_releasing",
        "tengu_oauth_token_refresh_lock_released",
        "tengu_query_error",
        "tengu_session_file_read",
        "tengu_started",
        "tengu_tool_use_error",
        "tengu_tool_use_granted_in_prompt_permanent",
        "tengu_tool_use_granted_in_prompt_temporary",
        "tengu_tool_use_rejected_in_prompt",
        "tengu_tool_use_success",
        "tengu_uncaught_exception",
        "tengu_unhandled_rejection",
        "tengu_voice_recording_started",
        "tengu_voice_toggled",
        "tengu_team_mem_sync_pull",
        "tengu_team_mem_sync_push",
        "tengu_team_mem_sync_started",
        "tengu_team_mem_entries_capped",
      ])),
      (jG4 = [
        "arch",
        "clientType",
        "errorType",
        "http_status_range",
        "http_status",
        "kairosActive",
        "model",
        "platform",
        "provider",
        "skillMode",
        "subscriptionType",
        "toolName",
        "userBucket",
        "userType",
        "version",
        "versionBase",
      ]);
    EFH = [];
    JG4 = $6(async () => {
      if (eHH()) return (W0_ = !1), !1;
      try {
        return (W0_ = !0), !0;
      } catch (H) {
        return AH(H), (W0_ = !1), !1;
      }
    });
    XG4 = $6(() => {
      let H = zS(),
        _ = LBq.createHash("sha256").update(H).digest("hex");
      return parseInt(_.slice(0, 8), 16) % PG4;
    });
