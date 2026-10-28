//! The `postMessage` bridge to a same-origin parent page (`?host=parent`) or VS Code (`?host=vscode`),
//! for pages that embed WordCraft in an `<iframe>` or VS Code Webview and keep its files.
//! The same messages as GridCraft's and PdfCraft's bridges; each is a plain object with a `type`:
//!
//! - `wordcraft:ready` (to the parent/VS Code): `{ version }`, sent once the app is running and
//!   listening; send a file now.
//! - `wordcraft:open` (from the parent/VS Code): `{ name, bytes }`, bytes an `ArrayBuffer` or
//!   `Uint8Array`. It opens like a document picked with File › Open or dropped on the window.
//! - `wordcraft:save` (to the parent/VS Code): `{ name, saveAs, bytes }` (a transferred `ArrayBuffer`) for
//!   every file WordCraft would otherwise download. The parent/VS Code stores it and reports failures.
//! - `wordcraft:dirty` (to the parent/VS Code): `{ dirty }` whenever unsaved changes appear or go away.
//! - `wordcraft:failed` (to the parent/VS Code): `{ error }` when the app couldn't start.

use std::cell::Cell;
use std::rc::Rc;

use wasm_bindgen::JsCast as _;
use wasm_bindgen::JsValue;
use wasm_bindgen::closure::Closure;
use wordcraft_ui_egui::{Inbox, Services, WordApp};

/// The longest user name taken from `?author=`.
const MAX_AUTHOR_CHARS: usize = 200;

#[derive(Clone)]
pub struct Bridge {
    window: web_sys::Window,
    parent: Option<web_sys::Window>,
    origin: Option<String>,
    vscode_post: Option<js_sys::Function>,
}

impl Bridge {
    /// Connects to a host: either VS Code (`window.__WORDCRAFT_VSCODE_POST__`) or a same-origin parent frame.
    pub fn new() -> Option<Self> {
        let window = web_sys::window()?;

        // 1. Check for direct VS Code Webview bridge
        if let Ok(val) = js_sys::Reflect::get(&window, &JsValue::from_str("__WORDCRAFT_VSCODE_POST__"))
            && let Ok(func) = val.dyn_into::<js_sys::Function>()
        {
            return Some(Self {
                window,
                parent: None,
                origin: None,
                vscode_post: Some(func),
            });
        }

        // 2. Check for framed parent window
        let parent = window.parent().ok().flatten()?;
        if js_sys::Object::is(&parent, &window) {
            return None;
        }
        let origin = window.location().origin().ok()?;
        // An opaque origin (a `file://` page in some browsers) can't be a `postMessage` target.
        if origin == "null" {
            return None;
        }
        // Reading another origin's location throws, which is `None` too.
        if parent.location().origin().ok()? != origin {
            return None;
        }
        Some(Self {
            window,
            parent: Some(parent),
            origin: Some(origin),
            vscode_post: None,
        })
    }

    /// Hand saved and exported files to the host instead of downloading them, report unsaved
    /// changes to it, and hear the files it sends.
    pub fn connect(&self, services: &mut Services, inbox: Inbox, ctx: egui::Context) {
        self.listen(inbox, ctx);
        let bridge = self.clone();
        services.host_save = Some(Box::new(move |name: &str, bytes: &[u8], save_as: bool| bridge.post_save(name, bytes, save_as)));
        // Anything else that would download goes to the host too.
        let bridge = self.clone();
        services.download = Some(Box::new(move |name: &str, bytes: &[u8]| bridge.post_save(name, bytes, false)));
        // The browser's save picker is never used, so no save finishes later.
        services.async_saves = None;
        let bridge = self.clone();
        let reported: Rc<Cell<Option<bool>>> = Rc::default();
        services.on_dirty = Some(Box::new(move |dirty: bool| {
            if reported.get() != Some(dirty) && bridge.send(&[("type", "wordcraft:dirty".into()), ("dirty", dirty.into())]) {
                reported.set(Some(dirty));
            }
        }));
    }

    /// `?author=`: the host's name for the user signs comments and tracked changes.
    pub fn set_author(app: &mut WordApp, author: &str) {
        let author: String = author.trim().chars().take(MAX_AUTHOR_CHARS).collect();
        if !author.is_empty() {
            app.session.author = author;
        }
    }

    pub fn is_vscode(&self) -> bool {
        self.vscode_post.is_some()
    }

    pub fn post_ready(&self) {
        self.send(&[("type", "wordcraft:ready".into()), ("version", env!("CARGO_PKG_VERSION").into())]);
    }

    /// The app couldn't start (no WebGPU or WebGL2, for example): let the host say so.
    pub fn post_failed(&self, error: &str) {
        self.send(&[("type", "wordcraft:failed".into()), ("error", error.into())]);
    }

    fn post_save(&self, path: &str, bytes: &[u8], save_as: bool) -> Result<(), String> {
        let name = std::path::Path::new(path).file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_else(|| path.to_string());
        let buffer = js_sys::Uint8Array::from(bytes).buffer();
        let message = message(&[
            ("type", "wordcraft:save".into()),
            ("name", name.as_str().into()),
            ("saveAs", save_as.into()),
            ("bytes", buffer.clone().into()),
        ])
        .ok_or_else(|| "couldn't build the message".to_string())?;

        // If VS Code direct post
        if let Some(post) = &self.vscode_post {
            return post.call1(&JsValue::NULL, &message).map(|_| ()).map_err(|e| format!("{e:?}"));
        }

        // If parent frame
        if let (Some(parent), Some(origin)) = (&self.parent, &self.origin) {
            return parent
                .post_message_with_transfer(&message, origin, &js_sys::Array::of1(&buffer))
                .map_err(|e| e.as_string().unwrap_or_else(|| format!("{e:?}")));
        }

        Err("no host available to save".to_string())
    }

    /// Hear `wordcraft:open` from the host and queue the file like a dropped one.
    fn listen(&self, inbox: Inbox, ctx: egui::Context) {
        let parent = self.parent.clone();
        let origin = self.origin.clone();
        let is_vscode = self.vscode_post.is_some();
        let on_message = Closure::<dyn FnMut(web_sys::MessageEvent)>::new(move |event: web_sys::MessageEvent| {
            if !is_vscode {
                if let (Some(origin), Some(parent)) = (&origin, &parent) {
                    if event.origin() != *origin || !event.source().is_some_and(|s| js_sys::Object::is(&s, parent)) {
                        return;
                    }
                } else {
                    return;
                }
            }
            let data = event.data();
            if string(&data, "type").as_deref() != Some("wordcraft:open") {
                return;
            }
            let name = string(&data, "name").filter(|n| !n.trim().is_empty()).unwrap_or_else(|| "Document.docx".to_string());
            let Some(bytes) = bytes(&data) else { return };
            inbox.lock().unwrap_or_else(|e| e.into_inner()).push((name, bytes));
            ctx.request_repaint();
        });
        if self.window.add_event_listener_with_callback("message", on_message.as_ref().unchecked_ref()).is_ok() {
            // The listener lives as long as the page.
            on_message.forget();
        }
    }

    /// Post a message to the host; false if it couldn't be sent.
    fn send(&self, fields: &[(&str, JsValue)]) -> bool {
        let Some(m) = message(fields) else { return false };
        if let Some(post) = &self.vscode_post {
            return post.call1(&JsValue::NULL, &m).is_ok();
        }
        if let (Some(parent), Some(origin)) = (&self.parent, &self.origin) {
            return parent.post_message(&m, origin).is_ok();
        }
        false
    }
}

fn message(fields: &[(&str, JsValue)]) -> Option<js_sys::Object> {
    let m = js_sys::Object::new();
    for (key, value) in fields {
        js_sys::Reflect::set(&m, &JsValue::from_str(key), value).ok()?;
    }
    Some(m)
}

fn string(data: &JsValue, key: &str) -> Option<String> {
    js_sys::Reflect::get(data, &JsValue::from_str(key)).ok()?.as_string()
}

/// `bytes` as an `ArrayBuffer` or `Uint8Array`.
fn bytes(data: &JsValue) -> Option<Vec<u8>> {
    let bytes = js_sys::Reflect::get(data, &JsValue::from_str("bytes")).ok()?;
    if let Some(array) = bytes.dyn_ref::<js_sys::Uint8Array>() {
        Some(array.to_vec())
    } else if bytes.is_instance_of::<js_sys::ArrayBuffer>() {
        Some(js_sys::Uint8Array::new(&bytes).to_vec())
    } else if js_sys::Array::is_array(&bytes) {
        let arr = js_sys::Array::from(&bytes);
        let len = arr.length() as usize;
        let mut v = Vec::with_capacity(len);
        for i in 0..arr.length() {
            v.push(arr.get(i).as_f64()? as u8);
        }
        Some(v)
    } else {
        None
    }
}
