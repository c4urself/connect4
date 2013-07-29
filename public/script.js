window.connect = window.connect || {
    WIDTH: 7,
    HEIGHT: 6,
    board: null,
    rows: [],
    cols: [],
    filled: [],
    won: false,
    currentPlayer: 'red',

    pageX: function () {
        return $('.page').offset().left;
    },

    info: function (msg, log) {
        var $info = $('.toolbar h1').text(msg).slideDown();
        if (log) {
            console.warn(msg);
        }
    },

    numOfCoins: function () {
        return this.WIDTH * this.HEIGHT / 2;
    },

    _genCoin: function (color) {
        var $coin = $('<div class="coin ' + color + '"></div>');
        $coin.draggable();
        return $coin;
    },

    genCoins: function (color) {
        var $stack = $('.stack.' + color);
        for (var i=0; i<this.numOfCoins(); i++) {
            $stack.append(this._genCoin(color));
        }
        $('.coin.yellow').draggable('disable');
    },

    onCoinDrop: function (e, ui) {
        var that = this,
            b = this.board,
            $entry = $(e.target),
            $coin = ui.draggable,
            pos = $coin.offset(),
            col = $entry.data('col');

        var slotsLeft = this.reserveSlot($coin, col);

        if (!slotsLeft) return;

        $entry.removeClass('droppable');

        $coin.css({
            'display': 'block',
            'position': 'absolute',
            'top': pos.top,
            'left': ($entry.offset().left) - this.pageX()
        }).animate({
            top: b.offset().top + b.height() - ($coin.height() * (this.HEIGHT - slotsLeft))
        }, 500);
    },

    cyclePlayer: function () {
        if (this.check()) {
            this.finish();
            return;
        }

        var previousPlayer = this.currentPlayer,
            that = this;

        this.currentPlayer = this.currentPlayer === 'red' ? 'yellow' : 'red';
        $('.coin.' + previousPlayer).draggable('disable').on('dblclick click', function () {
            that.info('It\'s ' + that.currentPlayer + '\'s turn!', 1);
        });
        $('.coin.' + this.currentPlayer).off('click dblclick').draggable('enable');
    },

    /**
     * Given a `$coin` and a `col` reserves a row and updates matrix values
     *
     * returns
     */
    reserveSlot: function ($coin, col) {
        this.filled[col] = this.filled[col] || 0;
        if (!$coin.hasClass(this.currentPlayer)) {
            this.info('Not your turn', 1);
            return -1;
        } else if (this.filled[col] === this.HEIGHT) {
            this.info('Already full', 1);
            return -1;
        } else {
            var slot = this.HEIGHT - ++this.filled[col];
            this._saveSlot($coin, slot, col);
            this.cyclePlayer();
            return slot;
        }
    },

    _saveSlot: function ($coin, row, col) {
        var val = $coin.hasClass('yellow') ? 'y' : 'r';
        this.cols[col][row] = val;
        this.rows[row][col] = val;
    },

    check: function () {
        var that = this,
            win = false,
            negdiag = [],
            posdiag = [],
            w = this.WIDTH,
            h = this.HEIGHT;

        var hasCombination = function (s, p) {
            var r = new RegExp(p+'{4}', 'gi');
            return r.test(s);
        };

        // vertical
        for (var i=0; i<this.cols.length; i++) {
            var s = this.cols[i].join('');
            var win = hasCombination(s, this.currentPlayer[0]);
            if (win) return win;
        }

        // horizontal
        for (var i=0; i<this.rows.length; i++) {
            var s = this.rows[i].join('');
            var win = hasCombination(s, this.currentPlayer[0]);
            if (win) return win;
        }

        // negative-slope diagonal
        for (var k=0; k < h + w - 1; k++) {
            var s = '';
            var cs = k < h ? 0 : k - h + 1; // where to start the col index
            var ce = k < w ? k : w - 1;     // where to end the col index

            for (var j = cs; j <= ce; j++) {
                if (cs === 0) {
                    s += this.rows[j + ((h - 1) - k)][j];
                } else {
                    s += this.rows[j - cs][j];
                }
            }
            var win = hasCombination(s, this.currentPlayer[0]);
            if (win) return win;
        }

        // positive-slope diagonal
        for (var k=0; k < h + w - 1; k++) {
            var s = '';
            var ch = k < h ? 0 : k - h + 1;   // cutoff height
            var cw = k < w ? 0 : k - w + 1;   // cutoff width
            for (var j = k - ch; j >= cw; j--) {
                //console.log('r:', j, 'c:', k - j);
                s += this.rows[j][k - j];
            }
            //console.log(s);
            var win = hasCombination(s, this.currentPlayer[0]);
            if (win) return win;
        }

        return win;
    },

    init: function () {
        $('button').on('click dblclick', function (e) {
            $(e.currentTarget).text('Restart');
            connect.start();
        });
    },

    reset: function () {
        this.board.html('');
        this.entries.html('');
        $('.stack').html('');
        this.rows = [];
        this.cols = [];
        this.filled = [];
        this.won = false;
        this.currentPlayer = 'red';
    },

    finish: function () {
        this.won = true;
        $('.coin').draggable('disable');
        this.info('Finished: ' + this.currentPlayer + ' won!');
    },

    start: function () {
        var that = this,
            $table = this.board = $('table.slots'),
            $entries = this.entries = $('table.entries'),
            $tr;

        this.reset();

        // Render entries
        var $tr = $('<tr>');
        $entries.append($tr);
        for (var j=0; j<this.WIDTH; j++) {
            var $td = $('<td data-col="' + j + '">');
            $tr.append($td);
            $td.droppable({
                accept: '.coin',
                drop: function (e, ui) {that.onCoinDrop.apply(that, [e, ui]);},
                tolerance: 'intersect',
                over: function (e, ui) {
                    $(this).addClass('droppable');
                },
                out: function (e, ui) {
                    $(this).removeClass('droppable');
                }
            });
        }

        // Make column list
        for (var a=0; a<this.WIDTH; a++) {
            this.cols.push([]);
            for (var b=0; b<this.HEIGHT; b++) {
                this.cols[a].push(0);
            }
        }

        // Render slots; make rows list
        for (var i=0; i<this.HEIGHT; i++) {
            var $tr = $('<tr>');
            this.rows.push([]);
            $table.append($tr);

            for (var j=0; j<this.WIDTH; j++) {

                var $td = $('<td data-row="' + i + '" data-col="' + j + '"/>');
                $tr.append($td);

                this.rows[i].push(0);
            }
        }

        this.genCoins('yellow');
        this.genCoins('red');

        this.info('New Connect Four game. Red to start!');
    }
};

$(document).ready(function () {
    connect.init();
});
