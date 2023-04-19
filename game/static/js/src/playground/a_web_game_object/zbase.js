let WEB_GAME_OBJECTS = [];

class WebGameObject {
    constructor() {
        WEB_GAME_OBJECTS.push(this);

        this.has_called_start = false; // 是否执行过start函数
        this.timedelta = 0; // 当前距离上一帧的时间间隔 ms
    }

    start() { // 只会在第一帧执行
    }

    update() { // 每一帧都执行
    }

    on_destroy() { // 在被删除之前会执行一次
    }

    destroy() { // 删除该物体
        this.on_destroy();
        for (let i = 0; i < WEB_GAME_OBJECTS.length; i ++ ) {
            if (WEB_GAME_OBJECTS[i] === this) {
                WEB_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let WEB_GAME_ANIMATION = function(timestamp) {
    for (let i = 0; i < WEB_GAME_OBJECTS.length; i ++ ) {
        let obj = WEB_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(WEB_GAME_ANIMATION);
}

requestAnimationFrame(WEB_GAME_ANIMATION);
