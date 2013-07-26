window.connect = window.connect || {
    WIDTH: 7,
    HEIGHT: 6,
    board: null,
    pageX: function () {
        return $('.page').offset().left;
    },
    rows: [],
    cols: [],
    filled: [],
    numOfCoins: function () {
        return this.WIDTH * this.HEIGHT / 2;
    },

    genCoins: function (color) {
        $stack = $('.stack.' + color);
        for (var i=0; i<this.numOfCoins(); i++) {
            $coin = $('<div class="coin ' + color + '"></div>');
            $coin.draggable();
            $stack.append($coin);
        }
    },

    onCoinDrop: function (e, ui) {
        var $entry = $(e.target),
            $coin = ui.draggable,
            pos = $coin.offset(),
            col = $entry.data('col'),
            slot = this.reserveSlot(col),
            dy = this.board.offset().top + this.board.height() - ($coin.height() * slot);

        $entry.removeClass('droppable');
        $coin.css({
            'display': 'block',
            'position': 'absolute',
            'top': pos.top,
            'left': pos.left - this.pageX()
        });

        $coin.animate({
            top: dy,
        }, 500)

        this.saveSlot(slot, col);

    },

    reserveSlot: function (col) {
        this.filled[col] = this.filled[col] || 1;
        if (this.filled[col] > this.HEIGHT) {
            alert('Already full');
        } else {
            return this.filled[col]++;
        }
    },

    saveSlot: function (row, col) {
        $td = $('.coin').find('[data-row=' + row + ']').find('[data-col=' + col + ']');
        $td.data('val', $coin.hasClass('yellow') ? 1 : 0);
    },

    init: function () {
        var that = this,
            $table = this.board = $('table.slots'),
            $tr;

        for (var a=0; a<this.WIDTH; a++) {
            this.cols.push([]);
            for (var b=0; b<this.HEIGHT; b++) {
                this.cols[a].push(0);
            }
        }

        for (var i=0; i<this.HEIGHT + 1; i++) {
            $tr = $('<tr>');
            if (i === 0) {
                $('table.entries').append($tr);
            } else {
                this.rows.push([]);
                $table.append($tr);
            }
            for (var j=0; j<this.WIDTH; j++) {

                var $td = $('<td data-row="' + i + '" data-col="' + j + '"/>');
                $.data($td, 'val', -1);
                $tr.append($td);

                if (i === 0) {
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
                } else {
                    this.rows[i - 1].push(0);
                }
            }
        }

        this.genCoins('yellow');
        this.genCoins('red');
    }
};

$(document).ready(function () {
    connect.init();
});
