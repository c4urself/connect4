window.connect = window.connect || {
    WIDTH: 7,
    HEIGHT: 6,
    board: null,
    rows: [],
    cols: [],
    filled: [],
    currentPlayer: 'red',

    pageX: function () {
        return $('.page').offset().left;
    },

    info: function (msg) {
        var $info = $('.toolbar h1').text(msg).slideDown();
        /*
        setTimeout(function () {
            $info.slideUp('slow');
        }, 2000);
        */
    },

    numOfCoins: function () {
        return this.WIDTH * this.HEIGHT / 2;
    },

    genCoins: function (color) {
        var $stack = $('.stack.' + color);
        for (var i=0; i<this.numOfCoins(); i++) {
            var $coin = $('<div class="coin ' + color + '"></div>');
            $coin.draggable();
            $stack.append($coin);
        }
        $('.coin.yellow').draggable('disable');
    },

    onCoinDrop: function (e, ui) {
        var that = this,
            $entry = $(e.target),
            $coin = ui.draggable,
            pos = $coin.offset(),
            col = $entry.data('col'),
            slot = this.reserveSlot(col),
            dy = this.board.offset().top + this.board.height() - ($coin.height() * (this.HEIGHT - slot));

        $entry.removeClass('droppable');

        $coin.css({
            'display': 'block',
            'position': 'absolute',
            'top': pos.top,
            'left': ($entry.offset().left) - this.pageX()
        });

        this.saveSlot($coin, slot, col);

        if (this.check()) {
            this.info('Finished: ' + this.currentPlayer + ' won!');
        }

        $coin.animate({
            top: dy
        }, 500, function () {
            //console.log('cycle player');
            that.cyclePlayer.apply(that);
        });
    },

    cyclePlayer: function () {
        var that = this;
        var previousPlayer = this.currentPlayer;
        this.currentPlayer = this.currentPlayer === 'red' ? 'yellow' : 'red';
        //console.log('New player: ' + this.currentPlayer);
        //console.log('Old player: ' + previousPlayer);
        $('.coin.' + previousPlayer).draggable('disable').on('dblclick click', function () {
            that.info('It\'s ' + that.currentPlayer + '\'s turn!');
        });
        $('.coin.' + this.currentPlayer).off('click dblclick').draggable('enable');
    },

    reserveSlot: function (col) {
        this.filled[col] = this.filled[col] || 0;
        if (this.filled[col] === this.HEIGHT) {
            alert('Already full');
        } else {
            return this.HEIGHT - ++this.filled[col];
        }
    },

    saveSlot: function ($coin, row, col) {
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
