describe('Connect Four', function () {
    describe('table setup', function () {
        before(function () {
            connect.HEIGHT = 4;
            connect.WIDTH = 6;
            connect.start();
        });
        it('rows should equal height of 4', function () {
            chai.expect(connect.rows.length).to.equal(connect.HEIGHT);
            chai.expect(connect.rows.length).to.equal(4);
        });
        it('cols should equal width of 6', function () {
            chai.expect(connect.cols.length).to.equal(connect.WIDTH);
            chai.expect(connect.cols.length).to.equal(6);
        });
        it('players should have 12 coins each', function () {
            chai.expect(connect.numOfCoins()).to.equal(12);
        });
    });
});
