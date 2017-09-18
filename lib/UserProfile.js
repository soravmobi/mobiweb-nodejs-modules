'use strict';

/*
 * Purpose : For User Profile
 * Company : Mobiweb Technology Pvt. Ltd.
 * Developed By  : Sorav Garg
 * Package : UserProfile
 */

var UserProfile = exports;
var async    = require('async');
var appRoot  = require('app-root-path');
var constant = require(appRoot + '/config/constant.js');
var custom   = require(appRoot + '/lib/custom.js');
var database = require(appRoot + '/config/database.js');
var model    = require(appRoot + '/lib/model.js');

/**
 * To manage user registration
 * @param {string} userLoginSessionKey
 */

UserProfile.viewProfile = function(req, res) {
	req.sanitize("userLoginSessionKey").trim();
    req.check('userLoginSessionKey', 'The User login session key field is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.send({
            "code": 200,
            "response": {},
            "status": 0,
            "message": custom.manageValidationMessages(errors)
        });
    } else {
		let userLoginSessionKey = req.sanitize('userLoginSessionKey').escape().trim();

		/* To validate user login session key */
		custom.handleLoggedInUser(function(respType,respObj) {
			if(parseInt(respType) === 0){
				res.send(respObj);
				return false;
			}else{
				/* To get user profile response */
				res.send(custom.getUserProfileResponse(respObj));
				return false;
			}
		},userLoginSessionKey);
	}
}