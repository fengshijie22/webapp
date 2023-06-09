class WebGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="web_game_menu">
    <div class="web_game_menu_field">
        <div class="web_game_menu_field_item web_game_menu_field_item_single_mode">
            单人游戏
        </div>
        <br>
        <div class="web_game_menu_field_item web_game_menu_field_item_multi_mode">
            多人游戏
        </div>
        <br>
        <div class="web_game_menu_field_item web_game_menu_field_item_settings">
            设置
        </div>
    </div>
</div>
`);
        this.root.$web_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.web_game_menu_field_item_single_mode');
        this.$multi_mode = this.$menu.find('.web_game_menu_field_item_multi_mode');
        this.$settings = this.$menu.find('.web_game_menu_field_item_settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi");
        });
        this.$settings.click(function(){
            console.log("click settings");
        });

    }


    show() { // 显示menu界面
        this.$menu.show();
    }

    hide() { // 关闭menu界面
        this.$menu.hide();
    }

}
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
class GameMap extends WebGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
    }

    update() {
        this.render();
    }

    render() { 
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class Particle extends WebGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.friction = 0.9;
        this.move_length = move_length
        this.eps = 1;
    }

    start() {
    }

    update() {
        if (this.speed < this.eps || this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends WebGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        this.friction = 0.9;
        this.spent_time = 0;
        this.flag_die = false;

        this.cur_skill = null;
    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (!outer.flag_die) {
                if (e.which === 3) {
                    outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
                } else if (e.which === 1) {
                    if (outer.spent_time > 5 && outer.cur_skill === "fireball") {
                        outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                    }

                    outer.cur_skill = null;
                }
            }
        });

        $(window).keydown(function(e) { // q键
            if (e.which === 81) {
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x;
        let y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, color, vx,vy,speed, move_length, this.playground.height * 0.01);
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 20 + Math.random() * 5; i ++ ) {
            let x = this.x;
            let y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if (this.radius < this.playground.height * 0.01) {
            this.destroy();
            this.flag_die = true;
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 1.2;
        // console.log(this.damage_speed);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        if (this.spent_time > 5 && Math.random() < 1 / 180.0 && !this.flag_die) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];

            if (!this.is_me && !player.flag_die && this !== player)
                this.shoot_fireball(player.x, player.y);
        }

        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            // console.log(this.damage_speed);
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }

}
class FireBall extends WebGameObject {
    constructor(playground, player, x, y, radius, color, vx, vy, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.radius = radius;
        this.color = color;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.1;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(obj) {
        let distance = this.get_dist(this.x, this.y, obj.x, obj.y);
        if (distance < this.radius + obj.radius) {
            return true;
        }
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();

    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class WebGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="web_game_playground"></div>`);

        this.hide();

        this.start();
    }

    get_random_color() {
        let color = ["blue", "red", "pink", "grey", "green"];
        return color[Math.floor(Math.random() * 5)];
    }

    start() {
    }

    show() { // 打开playground界面
        this.$playground.show();
        this.root.$web_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();

        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        for (let i = 0; i < 5; i ++ ) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }

    }

    hide() { // 关闭playground界面
        this.$playground.hide();
    }

}
export class WebGame {
    constructor(id) {
        this.id = id;
        this.$web_game = $('#' + id);
        this.menu = new WebGameMenu(this);
        this.playground = new WebGamePlayground(this);

        this.start();
    }

    start() {
    }
}
