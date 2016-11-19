
const Tweener = imports.ui.tweener;

let connections = [];
let geoMap = new Map();

function enable() {
    connections.push({
        obj: global.display.connect("window-created", (display, window) => onWindowCreated(window)),
        disconnect: cxn => global.display.disconnect(cxn)
    });

    for (let window of global.get_window_actors()) {
        onWindowCreated(window.get_children()[0]);
    }
}

function disable() {
    for (let i = 0; i < connections.length; i++) {
        let cxn = connections[i];

        if (cxn.disconnect) {
            cxn.disconnect();

            connections.splice(i--, 1);
        }
    }
}

function onWindowCreated(window) {
    connections.push({
        obj: window.connect("position-changed", () => onWindowPositionChanged(window)),
        disconnect: cxn => window.disconnect(cxn)
    });
    connections.push({
        obj: window.connect("size-changed", () => onWindowSizeChanged(window)),
        disconnect: cxn => window.disconnect(cxn)
    });

    onWindowPositionChanged(window);
}

function onWindowPositionChanged(window) {
    let windowFrameRect = window.get_frame_rect();
    let geo;

    if (geoMap.has(window)) {
        geo = geoMap.get(window);
    } else {
        geo = {};
        geoMap.set(window, geo);
    }

    geo.oldHeight = geo.height;
    geo.oldWidth = geo.width;
    geo.oldX = geo.x;
    geo.oldY = geo.y;

    geo.height = windowFrameRect.height;
    geo.width = windowFrameRect.width;
    geo.x = windowFrameRect.x;
    geo.y = windowFrameRect.y;
}

function onWindowSizeChanged(window) {
    let geo = geoMap.get(window);
    let lever = window.get_compositor_private().get_first_child();

    lever.scale_x = geo.oldWidth / geo.width;
    lever.scale_y = geo.oldHeight / geo.height;
    lever.x += geo.oldX - geo.x;
    lever.y += geo.oldY - geo.y;

    Tweener.addTween(lever, {
        transition: "easeOutQuad",
        time: 0.1,
        scale_x: 1,
        scale_y: 1,
        x: 0,
        y: 0
    });
}

