describe('Connect Four', function () {
    before(function () {
        connect.HEIGHT = 4;
        connect.WIDTH = 5;
        connect.start();
    });
    describe('table setup', function () {
        it('rows should equal height of 4', function () {
            chai.expect(connect.rows.length).to.equal(connect.HEIGHT);
            chai.expect(connect.rows.length).to.equal(4);
        });
        it('cols should equal width of 5', function () {
            chai.expect(connect.cols.length).to.equal(connect.WIDTH);
            chai.expect(connect.cols.length).to.equal(5);
        });
        it('players should have 10 coins each', function () {
            chai.expect(connect.numOfCoins()).to.equal(10);
        });
    });
    describe('game play', function () {
        it('dropping a coin in a slot should put it at the bottom', function () {
            var col = 0,
                slotsLeft = connect.reserveSlot(connect._genCoin('red'), col);
            chai.expect(slotsLeft).to.equal(3);
            chai.expect(connect.rows[slotsLeft][0]).to.equal('r');
        });
        it('further coins in the same slot should stack', function () {
            var col = 0,
                slotsLeft = connect.reserveSlot(connect._genCoin('yellow'), col);
            chai.expect(slotsLeft).to.equal(2);
            chai.expect(connect.rows[slotsLeft][0]).to.equal('y');
        });
        it('other slots should be completely empty', function () {
            for (var i=1; i<connect.WIDTH; i++) {
                chai.expect(connect.cols[i].indexOf('r')).to.equal(-1);
                chai.expect(connect.cols[i].indexOf('y')).to.equal(-1);
            }
        });
        it('a player can only go on her turn', function () {
            var col = 0,
                slotsLeft = connect.reserveSlot(connect._genCoin('yellow'), col);
            chai.expect(slotsLeft).to.be.equal(-1);
            chai.expect(connect.rows[1][0]).to.not.equal('y');
            slotsLeft = connect.reserveSlot(connect._genCoin('red'), col);
            chai.expect(slotsLeft).to.be.equal(1);
            chai.expect(connect.rows[1][0]).to.be.equal('r');
        });
    });
    describe('win scenarios', function () {
        beforeEach(function () {
            connect.HEIGHT = 4;
            connect.WIDTH = 5;
            connect.start();
        });
        it('horizontal win', function () {
            connect.rows = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 'r', 'r', 'r', 0]
            ];
            chai.expect(connect.currentPlayer).to.be.equal('red');
            chai.expect(connect.won).to.be.false;
            connect.reserveSlot(connect._genCoin('red'), 4);
            chai.expect(connect.won).to.be.true;
        });
        it('vertical win', function () {
            connect.cols= [
                [0, 0, 0, 0],
                ['r', 'r', 'r', 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            chai.expect(connect.currentPlayer).to.be.equal('red');
            chai.expect(connect.won).to.be.false;
            connect.reserveSlot(connect._genCoin('red'), 1);
            chai.expect(connect.won).to.be.true;
        });
        it('positive-slope diagonal win', function () {
            connect.rows = [
                [0,  0,   0,   0, 'r'],
                [0,  0,   0,  'r', 0],
                [0,  0,  'r',  0,  0],
                [0,  0,  0,  0, 0]
            ];
            chai.expect(connect.currentPlayer).to.be.equal('red');
            chai.expect(connect.won).to.be.false;
            connect.reserveSlot(connect._genCoin('red'), 1);
            chai.expect(connect.won).to.be.true;
        });
        it('negative-slope diagonal win', function () {
            connect.rows = [
                ['r', 0,  0,  0, 0],
                [0,  'r', 0,  0, 0],
                [0,   0, 'r', 0, 0],
                [0,   0,  0,  0, 0]
            ];
            chai.expect(connect.currentPlayer).to.be.equal('red');
            chai.expect(connect.won).to.be.false;
            connect.reserveSlot(connect._genCoin('red'), 3);
            chai.expect(connect.won).to.be.true;
        });
    });
});
