class WebGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="web_game_menu">
    <div class="web_game_menu_field">
        <div class="web_game_menu_field_item web_game_menu_field_item_single">
            单人模式
        </div>
        <br>
        <div class="web_game_menu_field_item web_game_menu_field_item_multi">
            多人模式
        </div>
        <br>
        <div class="web_game_menu_field_item web_game_menu_field_item_settings">
            设置
        </div>
    </div>
</div>
`);
        this.root.$web_game.append(this.$menu);
        this.$single = this.$menu.find('.web_game_menu_field_item_single');
        this.$multi = this.$multi.find('.web_game_menu_field_item_multi');
        this.$settings = this.$settings.find('.web_game_menu_field_item_settings');
    }
}
