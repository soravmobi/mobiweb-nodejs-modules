"use strict";

/*
 * Purpose: To send emails
 * Authur : Sorav Garg
 * Company: Mobiweb Technology Pvt. Ltd.
*/

var request  = require('request'),
	fcm      = require('node-fcm'),
	appRoot  = require('app-root-path'),
	appConst = require(appRoot + '/config/constant.js');

var apns = require("apns"), options, connection, notification;

class Notification {

	/* Notification Constructor */
	constructor() {
	}

	/**
	 * To send android push notifications
	 * @param {string} device_token
	 * @param {object} params
	 * @param {string} message
	*/
    sendAndroidNotification(reqData){
    	var message = {
		    to: reqData.device_token, 
		    collapse_key: appConst.site_name, 
		    data: {
		        'params': reqData.params
		    },
		    notification: {
		        body: reqData.message
		    }
		};

		/* Notification send method */
		var fcmSender = new fcm(appConst.fcm_server_key);
		fcmSender.send(message, function(err, response){
		    if (err) {
		        console.log("Fcm notification error", err);
		    } else {
		        console.log("Fcm notification sent successfully ", response);
		    }
		});
    }

    /**
	 * To send IOS push notifications
	 * @param {string} device_token
	 * @param {object} params
	 * @param {string} message
	 * @param {int} badges
	*/
    sendIOSNotification(reqData){
    	var options   = {
							keyFile  : appConst.apns_key_file,
							certFile : appConst.apns_cert_file,
							debug : true
						};
    	connection   		= new apns.Connection(options);
    	notification 		= new apns.Notification();
		notification.device = new apns.Device(reqData.device_token);
		notification.alert  = reqData.message;
		notification.sound  = appConst.apns_sound;
		notification.badge  = reqData.badges;
		notification.params = reqData.params;
		connection.sendNotification(notification, function(err, response){
			if (err) {
		        console.log("Apns notification error", err);
		    } else {
		        console.log("Apns notification sent successfully ", response);
		    }
		});
    }

}

module.exports = new Notification();

/* End of file notification.js */
/* Location: ./lib/notification.js */