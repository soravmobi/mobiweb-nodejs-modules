"use strict";

/*
 * Purpose: For database connection 
 * Authur : Sorav Garg
 * Company: Mobiweb Technology Pvt. Ltd.
*/

var mysql    = require('mysql'),
	appConst = require('./Constant.js');

class Database {

	/* Constructor To Define Database Connection */
	constructor() {
		this.MsgDb = null;
		this.pool = mysql.createPool({
			host: appConst.host,
			user: appConst.username,
			password: appConst.password,
			database: appConst.database,
			multipleStatements: true,
		});
	}

	/**
	 * To fire mysql queries
	 * @param {string} query
	*/
	getConn(query, callBack) {
		this.pool.getConnection(function (err, connection) {
			connection.query(query, function (err, rows) {
				connection.release();
				return callBack(err, rows);
			});
		});
	}

}

module.exports = new Database();

/* End of file database.js */
/* Location: ./database.js */