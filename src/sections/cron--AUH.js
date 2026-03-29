    c0_();
    g_();
    I0H();
    Lcq();
    Av6();
    OUH();
    g3H();
    Ncq();
    (TUH = require("fs")), (Scq = u(xdq(), 1));
    (xi = new fv6()), (pu = process.env.CLAUDE_CODE_COMMIT_LOG);
    Gv6 = Scq.default({
      getRootHostContext: () => ({ isInsideText: !1 }),
      prepareForCommit: () => {
        if (pu) Wv6 = performance.now();
        return null;
      },
      preparePortalMount: () => null,
      clearContainer: () => !1,
      resetAfterCommit(H) {
        if (((Lv6 = zUH > 0 ? performance.now() - zUH : 0), (zUH = 0), pu)) {
          let $ = performance.now();
          Pv6++;
          let K = Xv6 > 0 ? $ - Xv6 : 0;
          if (K > wG_) wG_ = K;
          Xv6 = $;
          let O = Wv6 > 0 ? $ - Wv6 : 0;
          if (K > 30 || O > 20 || YG_ > 50)
            TUH.appendFileSync(
              pu,
              `${$.toFixed(1)} gap=${K.toFixed(1)}ms reconcile=${O.toFixed(1)}ms creates=${YG_}
`,
            );
          if (((YG_ = 0), $ - Vcq > 1000))
            TUH.appendFileSync(
              pu,
              `${$.toFixed(1)} commits=${Pv6}/s maxGap=${wG_.toFixed(1)}ms
`,
            ),
              (Pv6 = 0),
              (wG_ = 0),
              (Vcq = $);
        }
        let _ = pu ? performance.now() : 0;
        if (typeof H.onComputeLayout === "function") H.onComputeLayout();
        if (pu) {
          let $ = performance.now() - _;
          if ($ > 20) {
            let K = d0_();
            TUH.appendFileSync(
              pu,
              `${_.toFixed(1)} SLOW_YOGA ${$.toFixed(1)}ms visited=${K.visited} measured=${K.measured} hits=${K.cacheHits} live=${K.live}
`,
            );
          }
        }
        let q = pu ? performance.now() : 0;
        if ((H.onRender?.(), pu)) {
          let $ = performance.now() - q;
          if ($ > 10)
            TUH.appendFileSync(
              pu,
              `${q.toFixed(1)} SLOW_PAINT ${$.toFixed(1)}ms
`,
            );
        }
      },
      getChildHostContext(H, _) {
        let q = H.isInsideText,
          $ = _ === "ink-text" || _ === "ink-virtual-text" || _ === "ink-link";
        if (q === $) return H;
        return { isInsideText: $ };
      },
      shouldSetTextContent: () => !1,
      createInstance(H, _, q, $, K) {
        if ($.isInsideText && H === "ink-box") throw Error("<Box> can't be nested inside <Text> component");
        let O = H === "ink-text" && $.isInsideText ? "ink-virtual-text" : H,
          T = _UH(O);
        if (pu) YG_++;
        for (let [z, A] of Object.entries(_)) DL4(T, z, A);
        if (Rv6()) T.debugOwnerChain = jL4(K);
        return T;
      },
      createTextInstance(H, _, q) {
        if (!q.isInsideText) throw Error(`Text string "${H}" must be rendered inside <Text> component`);
        return Xcq(H);
      },
      resetTextContent() {},
      hideTextInstance(H) {
        $UH(H, "");
      },
      unhideTextInstance(H, _) {
        $UH(H, _);
      },
      getPublicInstance: (H) => H,
      hideInstance(H) {
        (H.isHidden = !0), H.yogaNode?.setDisplay(eh.None), oJ(H);
      },
      unhideInstance(H) {
        (H.isHidden = !1), H.yogaNode?.setDisplay(eh.Flex), oJ(H);
      },
      appendInitialChild: AG_,
      appendChild: AG_,
      insertBefore: $v6,
      finalizeInitialChildren(H, _, q) {
        return q.autoFocus === !0;
      },
      commitMount(H) {
        jv6(H).handleAutoFocus(H);
      },
      isPrimaryRenderer: !0,
      supportsMutation: !0,
      supportsPersistence: !1,
      supportsHydration: !1,
      scheduleTimeout: setTimeout,
      cancelTimeout: clearTimeout,
      noTimeout: -1,
      getCurrentUpdatePriority: () => xi.currentUpdatePriority,
      beforeActiveInstanceBlur() {},
      afterActiveInstanceBlur() {},
      detachDeletedInstance() {},
      getInstanceFromNode: () => null,
      prepareScopeUpdate() {},
      getInstanceFromScope: () => null,
      appendChildToContainer: AG_,
      insertInContainerBefore: $v6,
      removeChildFromContainer(H, _) {
        qUH(H, _), ycq(_), jv6(H).handleNodeRemoved(_, H);
      },
      commitUpdate(H, _, q, $) {
        let K = hcq(q, $),
          O = hcq(q.style, $.style);
        if (K)
          for (let [T, z] of Object.entries(K)) {
            if (T === "style") {
              Ov6(H, z);
              continue;
            }
            if (T === "textStyles") {
              Jcq(H, z);
              continue;
            }
            if (zv6.has(T)) {
              Ecq(H, T, z);
              continue;
            }
            Kv6(H, T, z);
          }
        if (O && H.yogaNode) Mv6(H.yogaNode, O, $.style);
      },
      commitTextUpdate(H, _, q) {
        $UH(H, q);
      },
      removeChild(H, _) {
        if ((qUH(H, _), ycq(_), _.nodeName !== "#text")) {
          let q = Dv6(H);
          q.focusManager.handleNodeRemoved(_, q);
        }
      },
      maySuspendCommit() {
        return !1;
      },
      preloadInstance() {
        return !0;
      },
      startSuspendingCommit() {},
      suspendInstance() {},
      waitForCommitToBeReady() {
        return null;
      },
      NotPendingTransition: null,
      HostTransitionContext: { $$typeof: Symbol.for("react.context"), _currentValue: null },
      setCurrentUpdatePriority(H) {
        xi.currentUpdatePriority = H;
      },
      resolveUpdatePriority() {
        return xi.resolveEventPriority();
      },
      resetFormInstance() {},
      requestPostPaintCallback() {},
      shouldAttemptEagerTransition() {
        return !1;
      },
      trackSchedulerEvent() {},
      resolveEventType() {
        return xi.currentEvent?.type ?? null;
      },
      resolveEventTimeStamp() {
        return xi.currentEvent?.timeStamp ?? -1.1;
      },
    });
    xi.discreteUpdates = Gv6.discreteUpdates.bind(Gv6);
    yg = Gv6;
