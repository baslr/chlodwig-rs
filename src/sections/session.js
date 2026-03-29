    ZG6();
    kG6();
    CX_ = {
      fromJSON(H) {
        return {
          actor_id: E7(H.actor_id) ? globalThis.String(H.actor_id) : "",
          repository_id: E7(H.repository_id) ? globalThis.String(H.repository_id) : "",
          repository_owner_id: E7(H.repository_owner_id) ? globalThis.String(H.repository_owner_id) : "",
        };
      },
      toJSON(H) {
        let _ = {};
        if (H.actor_id !== void 0) _.actor_id = H.actor_id;
        if (H.repository_id !== void 0) _.repository_id = H.repository_id;
        if (H.repository_owner_id !== void 0) _.repository_owner_id = H.repository_owner_id;
        return _;
      },
      create(H) {
        return CX_.fromPartial(H ?? {});
      },
      fromPartial(H) {
        let _ = CY4();
        return (
          (_.actor_id = H.actor_id ?? ""),
          (_.repository_id = H.repository_id ?? ""),
          (_.repository_owner_id = H.repository_owner_id ?? ""),
          _
        );
      },
    };
    bX_ = {
      fromJSON(H) {
        return {
          platform: E7(H.platform) ? globalThis.String(H.platform) : "",
          node_version: E7(H.node_version) ? globalThis.String(H.node_version) : "",
          terminal: E7(H.terminal) ? globalThis.String(H.terminal) : "",
          package_managers: E7(H.package_managers) ? globalThis.String(H.package_managers) : "",
          runtimes: E7(H.runtimes) ? globalThis.String(H.runtimes) : "",
          is_running_with_bun: E7(H.is_running_with_bun) ? globalThis.Boolean(H.is_running_with_bun) : !1,
          is_ci: E7(H.is_ci) ? globalThis.Boolean(H.is_ci) : !1,
          is_claubbit: E7(H.is_claubbit) ? globalThis.Boolean(H.is_claubbit) : !1,
          is_github_action: E7(H.is_github_action) ? globalThis.Boolean(H.is_github_action) : !1,
          is_claude_code_action: E7(H.is_claude_code_action) ? globalThis.Boolean(H.is_claude_code_action) : !1,
          is_claude_ai_auth: E7(H.is_claude_ai_auth) ? globalThis.Boolean(H.is_claude_ai_auth) : !1,
          version: E7(H.version) ? globalThis.String(H.version) : "",
          github_event_name: E7(H.github_event_name) ? globalThis.String(H.github_event_name) : "",
          github_actions_runner_environment: E7(H.github_actions_runner_environment)
            ? globalThis.String(H.github_actions_runner_environment)
            : "",
          github_actions_runner_os: E7(H.github_actions_runner_os) ? globalThis.String(H.github_actions_runner_os) : "",
          github_action_ref: E7(H.github_action_ref) ? globalThis.String(H.github_action_ref) : "",
          wsl_version: E7(H.wsl_version) ? globalThis.String(H.wsl_version) : "",
          github_actions_metadata: E7(H.github_actions_metadata) ? CX_.fromJSON(H.github_actions_metadata) : void 0,
          arch: E7(H.arch) ? globalThis.String(H.arch) : "",
          is_claude_code_remote: E7(H.is_claude_code_remote) ? globalThis.Boolean(H.is_claude_code_remote) : !1,
          remote_environment_type: E7(H.remote_environment_type) ? globalThis.String(H.remote_environment_type) : "",
          claude_code_container_id: E7(H.claude_code_container_id) ? globalThis.String(H.claude_code_container_id) : "",
          claude_code_remote_session_id: E7(H.claude_code_remote_session_id)
            ? globalThis.String(H.claude_code_remote_session_id)
            : "",
          tags: globalThis.Array.isArray(H?.tags) ? H.tags.map((_) => globalThis.String(_)) : [],
          deployment_environment: E7(H.deployment_environment) ? globalThis.String(H.deployment_environment) : "",
          is_conductor: E7(H.is_conductor) ? globalThis.Boolean(H.is_conductor) : !1,
          version_base: E7(H.version_base) ? globalThis.String(H.version_base) : "",
          coworker_type: E7(H.coworker_type) ? globalThis.String(H.coworker_type) : "",
          build_time: E7(H.build_time) ? globalThis.String(H.build_time) : "",
          is_local_agent_mode: E7(H.is_local_agent_mode) ? globalThis.Boolean(H.is_local_agent_mode) : !1,
          linux_distro_id: E7(H.linux_distro_id) ? globalThis.String(H.linux_distro_id) : "",
          linux_distro_version: E7(H.linux_distro_version) ? globalThis.String(H.linux_distro_version) : "",
          linux_kernel: E7(H.linux_kernel) ? globalThis.String(H.linux_kernel) : "",
          vcs: E7(H.vcs) ? globalThis.String(H.vcs) : "",
          platform_raw: E7(H.platform_raw) ? globalThis.String(H.platform_raw) : "",
        };
      },
      toJSON(H) {
        let _ = {};
        if (H.platform !== void 0) _.platform = H.platform;
        if (H.node_version !== void 0) _.node_version = H.node_version;
        if (H.terminal !== void 0) _.terminal = H.terminal;
        if (H.package_managers !== void 0) _.package_managers = H.package_managers;
        if (H.runtimes !== void 0) _.runtimes = H.runtimes;
        if (H.is_running_with_bun !== void 0) _.is_running_with_bun = H.is_running_with_bun;
        if (H.is_ci !== void 0) _.is_ci = H.is_ci;
        if (H.is_claubbit !== void 0) _.is_claubbit = H.is_claubbit;
        if (H.is_github_action !== void 0) _.is_github_action = H.is_github_action;
        if (H.is_claude_code_action !== void 0) _.is_claude_code_action = H.is_claude_code_action;
        if (H.is_claude_ai_auth !== void 0) _.is_claude_ai_auth = H.is_claude_ai_auth;
        if (H.version !== void 0) _.version = H.version;
        if (H.github_event_name !== void 0) _.github_event_name = H.github_event_name;
        if (H.github_actions_runner_environment !== void 0)
          _.github_actions_runner_environment = H.github_actions_runner_environment;
        if (H.github_actions_runner_os !== void 0) _.github_actions_runner_os = H.github_actions_runner_os;
        if (H.github_action_ref !== void 0) _.github_action_ref = H.github_action_ref;
        if (H.wsl_version !== void 0) _.wsl_version = H.wsl_version;
        if (H.github_actions_metadata !== void 0) _.github_actions_metadata = CX_.toJSON(H.github_actions_metadata);
        if (H.arch !== void 0) _.arch = H.arch;
        if (H.is_claude_code_remote !== void 0) _.is_claude_code_remote = H.is_claude_code_remote;
        if (H.remote_environment_type !== void 0) _.remote_environment_type = H.remote_environment_type;
        if (H.claude_code_container_id !== void 0) _.claude_code_container_id = H.claude_code_container_id;
        if (H.claude_code_remote_session_id !== void 0)
          _.claude_code_remote_session_id = H.claude_code_remote_session_id;
        if (H.tags?.length) _.tags = H.tags;
        if (H.deployment_environment !== void 0) _.deployment_environment = H.deployment_environment;
        if (H.is_conductor !== void 0) _.is_conductor = H.is_conductor;
        if (H.version_base !== void 0) _.version_base = H.version_base;
        if (H.coworker_type !== void 0) _.coworker_type = H.coworker_type;
        if (H.build_time !== void 0) _.build_time = H.build_time;
        if (H.is_local_agent_mode !== void 0) _.is_local_agent_mode = H.is_local_agent_mode;
        if (H.linux_distro_id !== void 0) _.linux_distro_id = H.linux_distro_id;
        if (H.linux_distro_version !== void 0) _.linux_distro_version = H.linux_distro_version;
        if (H.linux_kernel !== void 0) _.linux_kernel = H.linux_kernel;
        if (H.vcs !== void 0) _.vcs = H.vcs;
        if (H.platform_raw !== void 0) _.platform_raw = H.platform_raw;
        return _;
      },
      create(H) {
        return bX_.fromPartial(H ?? {});
      },
      fromPartial(H) {
        let _ = bY4();
        return (
          (_.platform = H.platform ?? ""),
          (_.node_version = H.node_version ?? ""),
          (_.terminal = H.terminal ?? ""),
          (_.package_managers = H.package_managers ?? ""),
          (_.runtimes = H.runtimes ?? ""),
          (_.is_running_with_bun = H.is_running_with_bun ?? !1),
          (_.is_ci = H.is_ci ?? !1),
          (_.is_claubbit = H.is_claubbit ?? !1),
          (_.is_github_action = H.is_github_action ?? !1),
          (_.is_claude_code_action = H.is_claude_code_action ?? !1),
          (_.is_claude_ai_auth = H.is_claude_ai_auth ?? !1),
          (_.version = H.version ?? ""),
          (_.github_event_name = H.github_event_name ?? ""),
          (_.github_actions_runner_environment = H.github_actions_runner_environment ?? ""),
          (_.github_actions_runner_os = H.github_actions_runner_os ?? ""),
          (_.github_action_ref = H.github_action_ref ?? ""),
          (_.wsl_version = H.wsl_version ?? ""),
          (_.github_actions_metadata =
            H.github_actions_metadata !== void 0 && H.github_actions_metadata !== null
              ? CX_.fromPartial(H.github_actions_metadata)
              : void 0),
          (_.arch = H.arch ?? ""),
          (_.is_claude_code_remote = H.is_claude_code_remote ?? !1),
          (_.remote_environment_type = H.remote_environment_type ?? ""),
          (_.claude_code_container_id = H.claude_code_container_id ?? ""),
          (_.claude_code_remote_session_id = H.claude_code_remote_session_id ?? ""),
          (_.tags = H.tags?.map((q) => q) || []),
          (_.deployment_environment = H.deployment_environment ?? ""),
          (_.is_conductor = H.is_conductor ?? !1),
          (_.version_base = H.version_base ?? ""),
          (_.coworker_type = H.coworker_type ?? ""),
          (_.build_time = H.build_time ?? ""),
          (_.is_local_agent_mode = H.is_local_agent_mode ?? !1),
          (_.linux_distro_id = H.linux_distro_id ?? ""),
          (_.linux_distro_version = H.linux_distro_version ?? ""),
          (_.linux_kernel = H.linux_kernel ?? ""),
          (_.vcs = H.vcs ?? ""),
          (_.platform_raw = H.platform_raw ?? ""),
          _
        );
      },
    };
    IX_ = {
      fromJSON(H) {
        return {
          slack_team_id: E7(H.slack_team_id) ? globalThis.String(H.slack_team_id) : "",
          is_enterprise_install: E7(H.is_enterprise_install) ? globalThis.Boolean(H.is_enterprise_install) : !1,
          trigger: E7(H.trigger) ? globalThis.String(H.trigger) : "",
          creation_method: E7(H.creation_method) ? globalThis.String(H.creation_method) : "",
        };
      },
      toJSON(H) {
        let _ = {};
        if (H.slack_team_id !== void 0) _.slack_team_id = H.slack_team_id;
        if (H.is_enterprise_install !== void 0) _.is_enterprise_install = H.is_enterprise_install;
        if (H.trigger !== void 0) _.trigger = H.trigger;
        if (H.creation_method !== void 0) _.creation_method = H.creation_method;
        return _;
      },
      create(H) {
        return IX_.fromPartial(H ?? {});
      },
      fromPartial(H) {
        let _ = IY4();
        return (
          (_.slack_team_id = H.slack_team_id ?? ""),
          (_.is_enterprise_install = H.is_enterprise_install ?? !1),
          (_.trigger = H.trigger ?? ""),
          (_.creation_method = H.creation_method ?? ""),
          _
        );
      },
    };
    uX_ = {
      fromJSON(H) {
        return {
          event_name: E7(H.event_name) ? globalThis.String(H.event_name) : "",
          client_timestamp: E7(H.client_timestamp) ? wIq(H.client_timestamp) : void 0,
          model: E7(H.model) ? globalThis.String(H.model) : "",
          session_id: E7(H.session_id) ? globalThis.String(H.session_id) : "",
          user_type: E7(H.user_type) ? globalThis.String(H.user_type) : "",
          betas: E7(H.betas) ? globalThis.String(H.betas) : "",
          env: E7(H.env) ? bX_.fromJSON(H.env) : void 0,
          entrypoint: E7(H.entrypoint) ? globalThis.String(H.entrypoint) : "",
          agent_sdk_version: E7(H.agent_sdk_version) ? globalThis.String(H.agent_sdk_version) : "",
          is_interactive: E7(H.is_interactive) ? globalThis.Boolean(H.is_interactive) : !1,
          client_type: E7(H.client_type) ? globalThis.String(H.client_type) : "",
          process: E7(H.process) ? globalThis.String(H.process) : "",
          additional_metadata: E7(H.additional_metadata) ? globalThis.String(H.additional_metadata) : "",
          auth: E7(H.auth) ? Hi.fromJSON(H.auth) : void 0,
          server_timestamp: E7(H.server_timestamp) ? wIq(H.server_timestamp) : void 0,
          event_id: E7(H.event_id) ? globalThis.String(H.event_id) : "",
          device_id: E7(H.device_id) ? globalThis.String(H.device_id) : "",
          swe_bench_run_id: E7(H.swe_bench_run_id) ? globalThis.String(H.swe_bench_run_id) : "",
          swe_bench_instance_id: E7(H.swe_bench_instance_id) ? globalThis.String(H.swe_bench_instance_id) : "",
          swe_bench_task_id: E7(H.swe_bench_task_id) ? globalThis.String(H.swe_bench_task_id) : "",
          email: E7(H.email) ? globalThis.String(H.email) : "",
          agent_id: E7(H.agent_id) ? globalThis.String(H.agent_id) : "",
          parent_session_id: E7(H.parent_session_id) ? globalThis.String(H.parent_session_id) : "",
          agent_type: E7(H.agent_type) ? globalThis.String(H.agent_type) : "",
          slack: E7(H.slack) ? IX_.fromJSON(H.slack) : void 0,
          team_name: E7(H.team_name) ? globalThis.String(H.team_name) : "",
          skill_name: E7(H.skill_name) ? globalThis.String(H.skill_name) : "",
          plugin_name: E7(H.plugin_name) ? globalThis.String(H.plugin_name) : "",
          marketplace_name: E7(H.marketplace_name) ? globalThis.String(H.marketplace_name) : "",
        };
      },
      toJSON(H) {
        let _ = {};
        if (H.event_name !== void 0) _.event_name = H.event_name;
        if (H.client_timestamp !== void 0) _.client_timestamp = H.client_timestamp.toISOString();
        if (H.model !== void 0) _.model = H.model;
        if (H.session_id !== void 0) _.session_id = H.session_id;
        if (H.user_type !== void 0) _.user_type = H.user_type;
        if (H.betas !== void 0) _.betas = H.betas;
        if (H.env !== void 0) _.env = bX_.toJSON(H.env);
        if (H.entrypoint !== void 0) _.entrypoint = H.entrypoint;
        if (H.agent_sdk_version !== void 0) _.agent_sdk_version = H.agent_sdk_version;
        if (H.is_interactive !== void 0) _.is_interactive = H.is_interactive;
        if (H.client_type !== void 0) _.client_type = H.client_type;
        if (H.process !== void 0) _.process = H.process;
        if (H.additional_metadata !== void 0) _.additional_metadata = H.additional_metadata;
        if (H.auth !== void 0) _.auth = Hi.toJSON(H.auth);
        if (H.server_timestamp !== void 0) _.server_timestamp = H.server_timestamp.toISOString();
        if (H.event_id !== void 0) _.event_id = H.event_id;
        if (H.device_id !== void 0) _.device_id = H.device_id;
        if (H.swe_bench_run_id !== void 0) _.swe_bench_run_id = H.swe_bench_run_id;
        if (H.swe_bench_instance_id !== void 0) _.swe_bench_instance_id = H.swe_bench_instance_id;
        if (H.swe_bench_task_id !== void 0) _.swe_bench_task_id = H.swe_bench_task_id;
        if (H.email !== void 0) _.email = H.email;
        if (H.agent_id !== void 0) _.agent_id = H.agent_id;
        if (H.parent_session_id !== void 0) _.parent_session_id = H.parent_session_id;
        if (H.agent_type !== void 0) _.agent_type = H.agent_type;
        if (H.slack !== void 0) _.slack = IX_.toJSON(H.slack);
        if (H.team_name !== void 0) _.team_name = H.team_name;
        if (H.skill_name !== void 0) _.skill_name = H.skill_name;
        if (H.plugin_name !== void 0) _.plugin_name = H.plugin_name;
        if (H.marketplace_name !== void 0) _.marketplace_name = H.marketplace_name;
        return _;
      },
      create(H) {
        return uX_.fromPartial(H ?? {});
      },
      fromPartial(H) {
        let _ = uY4();
        return (
          (_.event_name = H.event_name ?? ""),
          (_.client_timestamp = H.client_timestamp ?? void 0),
          (_.model = H.model ?? ""),
          (_.session_id = H.session_id ?? ""),
          (_.user_type = H.user_type ?? ""),
          (_.betas = H.betas ?? ""),
          (_.env = H.env !== void 0 && H.env !== null ? bX_.fromPartial(H.env) : void 0),
          (_.entrypoint = H.entrypoint ?? ""),
          (_.agent_sdk_version = H.agent_sdk_version ?? ""),
          (_.is_interactive = H.is_interactive ?? !1),
          (_.client_type = H.client_type ?? ""),
          (_.process = H.process ?? ""),
          (_.additional_metadata = H.additional_metadata ?? ""),
          (_.auth = H.auth !== void 0 && H.auth !== null ? Hi.fromPartial(H.auth) : void 0),
          (_.server_timestamp = H.server_timestamp ?? void 0),
          (_.event_id = H.event_id ?? ""),
          (_.device_id = H.device_id ?? ""),
          (_.swe_bench_run_id = H.swe_bench_run_id ?? ""),
          (_.swe_bench_instance_id = H.swe_bench_instance_id ?? ""),
          (_.swe_bench_task_id = H.swe_bench_task_id ?? ""),
          (_.email = H.email ?? ""),
          (_.agent_id = H.agent_id ?? ""),
          (_.parent_session_id = H.parent_session_id ?? ""),
          (_.agent_type = H.agent_type ?? ""),
          (_.slack = H.slack !== void 0 && H.slack !== null ? IX_.fromPartial(H.slack) : void 0),
          (_.team_name = H.team_name ?? ""),
          (_.skill_name = H.skill_name ?? ""),
          (_.plugin_name = H.plugin_name ?? ""),
          (_.marketplace_name = H.marketplace_name ?? ""),
          _
        );
      },
    };
