"use strict";

/*
 * Purpose: To define all constants
 * Authur : Sorav Garg
 * Company: Mobiweb Technology Pvt. Ltd.
*/

const dateTime = require('date-time'),
	  uniqid   = require('uniqid');

var appConstant = function () {

	/* Site Details */
	this.site_name      = "Quick Love";
	this.from_email     = "support@site.com";

	/* Push Notification */
	this.fcm_server_key = "AIzaSyDEiGNYzs9FYa9M7L7u6dOTM9vtdukLTJg";
	this.apns_key_file  = "conf/key.pem";  
	this.apns_cert_file = "conf/cert.pem";  
	this.apns_sound     = "default";  

	/* Messages */
	this.general_error = 'Some error occured, please try again.';

	/* Datetime */
	this.current_time      = dateTime("Y-MM-dd HH:mm:SS", new Date());
	this.current_timestamp = new Date().getTime();

	/* Upload Files */
	this.file_upload_path  = __dirname + '/uploads/';
	this.random_image_name = 'user-'+ uniqid.time() + '-' + new Date().getTime();

	/* Database Constants */
	this.users        = 'users';
	this.user_details = 'user_details';
	this.users_device_history = 'users_device_history';

	return this;
}

module.exports = new appConstant();

/* End of file constant.js */
/* Location: ./constant.js */