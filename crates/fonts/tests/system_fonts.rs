//! A new session finds the installed system fonts by family name (#22). One test in its own
//! process, so the process-wide database starts fresh, as it does when the app starts.
// Integration tests: unwrapping and panicking on failure is fine here, unlike in shipped code.
#![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

use wordcraft_fonts::{FontDb, system_font_dirs};

#[test]
fn a_fresh_session_finds_installed_fonts_by_name() {
    let bundled = FontDb::with_font_dirs(vec![]).families();
    let probe = FontDb::with_font_dirs(system_font_dirs());
    probe.load_system_fonts();
    // An installed family that isn't bundled and that loads.
    let installed = probe.families();
    let Some(family) = installed.iter().filter(|f| !bundled.contains(f)).find(|f| probe.face(f, "Regular").family == **f) else {
        eprintln!("no system fonts installed: nothing to check");
        return;
    };
    // The first lookup in the session: nothing has scanned the font folders yet.
    assert!(FontDb::global().has_family(family));
    assert_eq!(&FontDb::global().face(family, "Regular").family, family);
    assert!(FontDb::global().families().contains(family));
}

#[test]
fn a_fresh_session_resolves_hangul_fallback() {
    let probe = FontDb::global();
    let fb = probe.fallback_for('한', 0);
    assert!(fb.is_some(), "Hangul fallback font must be resolved");
    let run_fb = probe.fallback_for_run(&['한', '글', '테', '스', '트'], 0, false, false);
    assert!(run_fb.is_some(), "Hangul run fallback font must be resolved");
}
