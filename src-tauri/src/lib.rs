//! HomeBuddy native shell.
//!
//! A menu bar (tray) only app: there is no dock icon and no standard window.
//! Clicking the tray toggles a borderless, transparent popover positioned just
//! under the menu bar. The frontend updates the tray title via the
//! `set_tray_title` command as the countdown ticks, and the tray icon runs a
//! RunCat-style animation whose speed the frontend sets via `set_run_speed`.

use std::sync::{Arc, Mutex};
use std::time::Duration;

use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};
use tauri_plugin_positioner::{Position, WindowExt};

const TRAY_ID: &str = "home-buddy-tray";
const POPOVER_LABEL: &str = "popover";

/// The run-cycle frames for the animated menu bar icon (template PNGs).
const RUNNER_FRAMES: [&[u8]; 6] = [
    include_bytes!("../icons/runner/frame0.png"),
    include_bytes!("../icons/runner/frame1.png"),
    include_bytes!("../icons/runner/frame2.png"),
    include_bytes!("../icons/runner/frame3.png"),
    include_bytes!("../icons/runner/frame4.png"),
    include_bytes!("../icons/runner/frame5.png"),
];

/// Shared animation speed in frames-per-second; 0 pauses on the first frame.
struct RunSpeed(Arc<Mutex<f64>>);

/// Update the menu bar title shown next to the tray icon, e.g. "🐰 2h13m".
#[tauri::command]
fn set_tray_title(app: tauri::AppHandle, title: String) {
    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        let _ = tray.set_title(Some(title));
    }
}

/// Set the menu bar icon animation speed (frames-per-second). The frontend
/// raises this as clock-out nears and during overtime, and drops it to 0 when
/// the buddy is idle (before work / already home).
#[tauri::command]
fn set_run_speed(state: tauri::State<'_, RunSpeed>, fps: f64) {
    if let Ok(mut speed) = state.0.lock() {
        *speed = fps.max(0.0);
    }
}

/// Open a URL in the user's default browser. Used for the "출근일시 확인하기"
/// link to the user's own attendance page (stored locally, never bundled).
#[tauri::command]
fn open_external(url: String) -> Result<(), String> {
    let u = url.trim();
    if !(u.starts_with("http://") || u.starts_with("https://")) {
        return Err("http(s) URL만 열 수 있어요".into());
    }
    std::process::Command::new("open")
        .arg(u)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_positioner::init())
        .invoke_handler(tauri::generate_handler![
            set_tray_title,
            set_run_speed,
            open_external
        ])
        .setup(|app| {
            // Menu bar accessory: no dock icon, no app menu.
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let quit = MenuItem::with_id(app, "quit", "HomeBuddy 종료", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit])?;

            TrayIconBuilder::with_id(TRAY_ID)
                .icon(app.default_window_icon().unwrap().clone())
                .icon_as_template(true)
                .title("🐰")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| {
                    if event.id.as_ref() == "quit" {
                        app.exit(0);
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    // Let the positioner cache the tray rect for every event so
                    // TrayBottomCenter has fresh coordinates when we click.
                    tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);

                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        toggle_popover(tray.app_handle());
                    }
                })
                .build(app)?;

            // Hide the popover when it loses focus, like a native menu.
            if let Some(win) = app.get_webview_window(POPOVER_LABEL) {
                let win_clone = win.clone();
                win.on_window_event(move |event| {
                    if let WindowEvent::Focused(false) = event {
                        let _ = win_clone.hide();
                    }
                });
            }

            // Animate the menu bar icon (RunCat-style). Speed is driven by the
            // frontend via `set_run_speed`.
            let speed = Arc::new(Mutex::new(5.0_f64));
            app.manage(RunSpeed(speed.clone()));
            start_runner_animation(app.handle().clone(), speed);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running HomeBuddy");
}

/// Show the popover centered under the tray icon, or hide it if already
/// visible. Positioning is delegated to `tauri-plugin-positioner`, which uses
/// the cached tray rect and the correct monitor + scale factor — so it lands
/// under the clicked tray icon even across displays with different scaling.
fn toggle_popover(app: &tauri::AppHandle) {
    let Some(win) = app.get_webview_window(POPOVER_LABEL) else {
        return;
    };

    if win.is_visible().unwrap_or(false) {
        let _ = win.hide();
        return;
    }

    // Show first so the window adopts the target monitor's scale factor, then
    // move it under the tray and focus it.
    let _ = win.show();
    let _ = win.move_window(Position::TrayBottomCenter);
    let _ = win.set_focus();
}

/// Spawn a background thread that cycles the tray icon through the run-cycle
/// frames at the current speed. Icon updates are dispatched to the main thread
/// (required for macOS UI) and only sent when the frame actually changes.
fn start_runner_animation(app: tauri::AppHandle, speed: Arc<Mutex<f64>>) {
    let frames: Vec<Image<'static>> = RUNNER_FRAMES
        .iter()
        .filter_map(|bytes| Image::from_bytes(bytes).ok())
        .collect();
    if frames.is_empty() {
        return;
    }

    std::thread::spawn(move || {
        let mut tick = 0usize;
        let mut last_index = usize::MAX;

        loop {
            let fps = speed.lock().map(|s| *s).unwrap_or(0.0);
            let index = if fps > 0.0 { tick % frames.len() } else { 0 };

            if index != last_index {
                last_index = index;
                let frame = frames[index].clone();
                let handle = app.clone();
                let _ = app.run_on_main_thread(move || {
                    if let Some(tray) = handle.tray_by_id(TRAY_ID) {
                        let _ = tray.set_icon(Some(frame));
                        let _ = tray.set_icon_as_template(true);
                    }
                });
            }

            if fps > 0.0 {
                tick = tick.wrapping_add(1);
                let ms = (1000.0 / fps).clamp(60.0, 1000.0) as u64;
                std::thread::sleep(Duration::from_millis(ms));
            } else {
                std::thread::sleep(Duration::from_millis(250));
            }
        }
    });
}
