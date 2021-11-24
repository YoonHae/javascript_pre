module.exports = function() {
    const mysql = require('mysql');
    const conn = mysql.createConnection({
        host: global.custom_env.DB_CONFIG.host,
        user: global.custom_env.DB_CONFIG.user,
        password: global.custom_env.DB_CONFIG.password,
        database: global.custom_env.DB_CONFIG.database
    });
    
    conn.connect(function(err, args) {
        if (err)
        {
            console.log(err);
        }
    });
    
    return conn;
}