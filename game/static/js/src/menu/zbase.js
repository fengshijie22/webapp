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
