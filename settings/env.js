
// linux => export NODE_ENV=development
// windows => set NODE_ENV=development
const LOAD_ENV = process.env.NODE_ENV == 'development' ? require("./application.dev.json") : require("./application.local.json");

exports.DB_CONFIG = LOAD_ENV.aws_mysql_db;
exports.FACEBOOK_APP = LOAD_ENV.facebook_app;