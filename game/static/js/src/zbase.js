class WebGame {
    constructor(id) {
        this.id = id;
        this.$web_game = $('#' + id);
        this.menu = new WebGameMenu(this);
    }
}
