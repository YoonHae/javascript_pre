module.exports = function(app) {
    console.log("app 으로 setting 할거 있음 하시구려");
    return {       
        a: function(req, res) {
            res.send("A에 대하여...");
        },

        b: function(req, res) {
            res.send("B에 대하여...");
        }
    };
}