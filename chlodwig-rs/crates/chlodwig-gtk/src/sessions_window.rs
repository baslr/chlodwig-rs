//! Sessions browser window — lists all saved sessions with expandable
//! message previews and a Resume button.

use gtk4::prelude::*;
use gtk4::{
    ApplicationWindow, Box as GtkBox, Button, Label, Orientation, PolicyType,
    ScrolledWindow, Separator, TextView, WrapMode,
};
use std::cell::{Cell, RefCell};
use std::rc::Rc;

/// Shared registry: which inner ScrolledWindow (if any) currently has the
/// cursor hovering over it. The outer scroll controller consults this to
/// decide whether to forward scroll events to the inner adjustment (and stop)
/// or let the outer scroll handle them.
type ActiveInner = Rc<RefCell<Option<ScrolledWindow>>>;

pub fn show_sessions_window(
    parent: &ApplicationWindow,
    current_session_file: Option<String>,
    on_resume: Box<dyn Fn(std::path::PathBuf) + 'static>,
) {
    let dialog = gtk4::Window::builder()
        .title("Sessions")
        .transient_for(parent)
        .default_width(700)
        .default_height(600)
        .build();

    let on_resume = Rc::new(on_resume);
    let dialog_rc = Rc::new(dialog);

    let main_box = GtkBox::new(Orientation::Vertical, 0);
    main_box.set_margin_start(16);
    main_box.set_margin_end(16);
    main_box.set_margin_top(16);
    main_box.set_margin_bottom(16);

    let active_inner: ActiveInner = Rc::new(RefCell::new(None));

    let sessions = match chlodwig_core::list_sessions() {
        Ok(s) => s,
        Err(e) => {
            let label = Label::new(Some(&format!("Error loading sessions: {e}")));
            label.add_css_class("error");
            main_box.append(&label);
            let scroll = ScrolledWindow::builder()
                .vexpand(true)
                .hexpand(true)
                .child(&main_box)
                .build();
            dialog_rc.set_child(Some(&scroll));
            dialog_rc.present();
            return;
        }
    };

    if sessions.is_empty() {
        let label = Label::new(Some("No saved sessions found."));
        label.set_opacity(0.6);
        label.set_margin_top(32);
        main_box.append(&label);
    } else {
        let title = Label::new(Some(&format!("{} session(s)", sessions.len())));
        title.set_xalign(0.0);
        title.add_css_class("title-3");
        title.set_margin_bottom(12);
        main_box.append(&title);

        for info in sessions.iter().rev() {
            let is_current = current_session_file.as_deref() == Some(&info.filename);
            let row = build_session_row(
                info,
                on_resume.clone(),
                dialog_rc.clone(),
                is_current,
                active_inner.clone(),
            );
            main_box.append(&row);
            main_box.append(&Separator::new(Orientation::Horizontal));
        }
    }

    let outer_scroll = ScrolledWindow::builder()
        .vexpand(true)
        .hexpand(true)
        .hscrollbar_policy(PolicyType::Never)
        .vscrollbar_policy(PolicyType::Automatic)
        .child(&main_box)
        .build();

    // CAPTURE-PHASE controller on the outer scroll: runs BEFORE the outer's
    // internal scroll handler. If the cursor is inside an inner messages
    // scroll area, we manually forward the delta to that inner's vadjustment
    // and return Stop — the outer never sees the event. Otherwise we return
    // Proceed so the outer scrolls normally.
    {
        let ctrl = gtk4::EventControllerScroll::new(
            gtk4::EventControllerScrollFlags::VERTICAL,
        );
        ctrl.set_propagation_phase(gtk4::PropagationPhase::Capture);
        let active = active_inner.clone();
        ctrl.connect_scroll(move |_c, _dx, dy| {
            if let Some(inner) = active.borrow().as_ref() {
                let adj = inner.vadjustment();
                let step = 5.0;
                let new_val = (adj.value() + dy * step)
                    .clamp(adj.lower(), adj.upper() - adj.page_size());
                adj.set_value(new_val);
                gtk4::glib::Propagation::Stop
            } else {
                gtk4::glib::Propagation::Proceed
            }
        });
        outer_scroll.add_controller(ctrl);
    }

    dialog_rc.set_child(Some(&outer_scroll));
    dialog_rc.present();
}

fn build_session_row(
    info: &chlodwig_core::SessionInfo,
    on_resume: Rc<dyn Fn(std::path::PathBuf) + 'static>,
    dialog: Rc<gtk4::Window>,
    is_current: bool,
    active_inner: ActiveInner,
) -> GtkBox {
    let row = GtkBox::new(Orientation::Vertical, 4);
    row.set_margin_top(8);
    row.set_margin_bottom(8);

    let header = GtkBox::new(Orientation::Horizontal, 8);
    header.set_hexpand(true);

    let display_name = info.filename.trim_end_matches(".json");
    let header_text = match &info.name {
        Some(name) => format!(
            "{} \u{30FB} {} \u{30FB} {} ({} messages)",
            name, display_name, info.model, info.message_count,
        ),
        None => format!(
            "{} — {} ({} messages)",
            display_name, info.model, info.message_count,
        ),
    };
    let header_label = Label::new(Some(&header_text));
    header_label.set_xalign(0.0);
    header_label.set_hexpand(true);
    header_label.set_wrap(true);

    if is_current {
        let current_label = Label::new(Some("● Current"));
        current_label.add_css_class("success");
        current_label.set_opacity(0.8);
        header.append(&current_label);
    } else {
        let resume_btn = Button::with_label("Resume");
        resume_btn.add_css_class("suggested-action");
        let path = info.path.clone();
        let dialog_for_resume = dialog.clone();
        resume_btn.connect_clicked(move |_| {
            on_resume(path.clone());
            dialog_for_resume.close();
        });
        header.append(&resume_btn);
    }

    let expand_btn = Button::with_label("▶ Show");
    expand_btn.add_css_class("flat");

    header.append(&header_label);
    header.append(&expand_btn);
    row.append(&header);

    let text_buffer = gtk4::TextBuffer::new(None::<&gtk4::TextTagTable>);

    let tag_table = text_buffer.tag_table();
    let role_user = gtk4::TextTag::builder()
        .name("role_user")
        .weight(700)
        .foreground("#61afef")
        .build();
    tag_table.add(&role_user);
    let role_assistant = gtk4::TextTag::builder()
        .name("role_assistant")
        .weight(700)
        .foreground("#98c379")
        .build();
    tag_table.add(&role_assistant);

    let text_view = TextView::builder()
        .buffer(&text_buffer)
        .editable(false)
        .cursor_visible(false)
        .wrap_mode(WrapMode::WordChar)
        .top_margin(8)
        .bottom_margin(16)
        .left_margin(12)
        .right_margin(12)
        .build();

    let messages_scroll = ScrolledWindow::builder()
        .hexpand(true)
        .vexpand(false)
        .hscrollbar_policy(PolicyType::Never)
        .vscrollbar_policy(PolicyType::Automatic)
        .child(&text_view)
        .build();
    messages_scroll.set_height_request(400);
    messages_scroll.set_visible(false);

    // Track cursor enter/leave so the outer capture-phase controller knows
    // which inner scroll to forward events to.
    {
        let motion = gtk4::EventControllerMotion::new();
        let active_enter = active_inner.clone();
        let inner_for_enter = messages_scroll.clone();
        motion.connect_enter(move |_c, _x, _y| {
            *active_enter.borrow_mut() = Some(inner_for_enter.clone());
        });
        let active_leave = active_inner.clone();
        let inner_for_leave = messages_scroll.clone();
        motion.connect_leave(move |_c| {
            // Only clear if we're still the active one (safety against
            // overlapping enter/leave events between siblings).
            let mut a = active_leave.borrow_mut();
            if a.as_ref().map(|w| w == &inner_for_leave).unwrap_or(false) {
                *a = None;
            }
        });
        messages_scroll.add_controller(motion);
    }

    // Also suppress the inner's own internal scroll controller so it doesn't
    // double-scroll when we drive the adjustment manually from the outer's
    // capture-phase handler. A Capture-phase controller on the inner that
    // Stops every scroll event blocks the inner ScrolledWindow's default
    // handler (which runs in Bubble phase on the widget itself).
    {
        let ctrl = gtk4::EventControllerScroll::new(
            gtk4::EventControllerScrollFlags::VERTICAL,
        );
        ctrl.set_propagation_phase(gtk4::PropagationPhase::Capture);
        ctrl.connect_scroll(|_c, _dx, _dy| gtk4::glib::Propagation::Stop);
        messages_scroll.add_controller(ctrl);
    }

    row.append(&messages_scroll);

    let loaded = Rc::new(Cell::new(false));
    let session_path = info.path.clone();

    expand_btn.connect_clicked(move |btn| {
        let is_visible = messages_scroll.is_visible();
        if is_visible {
            messages_scroll.set_visible(false);
            btn.set_label("▶ Show");
        } else {
            if !loaded.get() {
                match chlodwig_core::load_session_from(&session_path) {
                    Ok(snapshot) => {
                        let previews = chlodwig_core::session_preview_messages(
                            &snapshot.messages,
                            2000,
                        );
                        if previews.is_empty() {
                            let mut iter = text_buffer.end_iter();
                            text_buffer.insert(&mut iter, "(empty session)");
                        } else {
                            for (i, (role, text)) in previews.iter().enumerate() {
                                let mut iter = text_buffer.end_iter();
                                if i > 0 {
                                    text_buffer.insert(&mut iter, "\n\n");
                                }
                                let role_start = text_buffer.end_iter().offset();
                                let mut iter = text_buffer.end_iter();
                                text_buffer.insert(&mut iter, role);
                                let role_end = text_buffer.end_iter().offset();
                                let tag_name = if *role == "You" {
                                    "role_user"
                                } else {
                                    "role_assistant"
                                };
                                text_buffer.apply_tag_by_name(
                                    tag_name,
                                    &text_buffer.iter_at_offset(role_start),
                                    &text_buffer.iter_at_offset(role_end),
                                );

                                let mut iter = text_buffer.end_iter();
                                text_buffer.insert(&mut iter, "\n");
                                let mut iter = text_buffer.end_iter();
                                text_buffer.insert(&mut iter, text);
                            }
                        }
                        loaded.set(true);
                    }
                    Err(e) => {
                        let mut iter = text_buffer.end_iter();
                        text_buffer.insert(&mut iter, &format!("Error: {e}"));
                        loaded.set(true);
                    }
                }
            }
            messages_scroll.set_visible(true);
            btn.set_label("▼ Hide");
        }
    });

    row
}
