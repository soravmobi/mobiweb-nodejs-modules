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
 * To get user profile details
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
				let profileResponse = custom.getUserProfileResponse(respObj);
				res.send({
		            "code": 200,
		            "response": profileResponse,
		            "status": 1,
		            "message": 'success'
		        });
				return false;
			}
		},userLoginSessionKey);
	}
}

/**
 * To update user profile
 * @param {string} userLoginSessionKey
 * @param {string} userFirstName
 * @param {string} userLastName
 * @param {string} userGender
 * @param {string} userDOB
 * @param {string} userCountry
 * @param {string} userCity
 * @param {string} userAddress
 * @param {double} userLatitude
 * @param {double} userLongitude
 */

UserProfile.updateProfile = function(req, res) {
	req.sanitize("userLoginSessionKey").trim();
	req.sanitize("userFirstName").trim();
	req.sanitize("userLastName").trim();
	req.sanitize("userGender").trim();
	req.sanitize("userDOB").trim();
	req.sanitize("userCountry").trim();
	req.sanitize("userCity").trim();
	req.sanitize("userAddress").trim();
	req.sanitize("userLatitude").trim();
	req.sanitize("userLongitude").trim();
    req.check('userLoginSessionKey', 'The User login session key field is required').notEmpty();
    req.check('userFirstName', 'Enter first name').notEmpty();
    req.check('userLastName', 'Enter last name').notEmpty();
    req.check('userGender', 'Select gender').inList(['MALE', 'FEMALE', 'OTHER']);
    req.check('userDOB', 'Select date of birth.').notEmpty();
    req.check('userCountry', 'Enter country name').notEmpty();
    req.check('userCity', 'Enter city name').notEmpty();
    req.check('userAddress', 'Enter address').notEmpty();
    req.check('userLatitude', 'Enter latitude').notEmpty();
    req.check('userLongitude', 'Enter longitude').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.send({
            "code": 200,
            "response": {},
            "status": 0,
            "message": custom.manageValidationMessages(errors)
        });
    } else {
		let userLoginSessionKey   = req.sanitize('userLoginSessionKey').escape().trim();
		let userFirstName         = req.sanitize('userFirstName').escape().trim();
		let userLastName          = req.sanitize('userLastName').escape().trim();
		let userGender            = req.sanitize('userGender').escape().trim();
		let userDOB               = req.sanitize('userDOB').escape().trim();
		let userCountry           = req.sanitize('userCountry').escape().trim();
		let userCity              = req.sanitize('userCity').escape().trim();
		let userAddress           = req.sanitize('userAddress').escape().trim();
		let userLatitude          = req.sanitize('userLatitude').escape().trim();
		let userLongitude         = req.sanitize('userLongitude').escape().trim();

		/* To validate user login session key */
		custom.handleLoggedInUser(function(respType,respObj) {
			if(parseInt(respType) === 0){
				res.send(respObj);
				return false;
			}else{
				/* Update user data */
	            var dataObj = {};
	            dataObj.userFirstName = userFirstName;
	            dataObj.userLastName = userLastName;
	            dataObj.userGender = userGender;
	            dataObj.userDOB = userDOB;
	            dataObj.userCountry = userCountry;
	            dataObj.userCity = userCity;
	            dataObj.userAddress = userAddress;
	            dataObj.userLatitude = userLatitude;
	            dataObj.userLongitude = userLongitude;
	            model.updateData(function(err,resp){
	                if(err){
	                    res.send(custom.dbErrorResponse());
	                    return false;
	                }else{
	                    res.send({
				            "code": 200,
				            "response": {},
				            "status": 1,
				            "message": 'Profile updated successfully.'
				        });
				        return false;
	                }
	            },constant.user_details,dataObj,{userId:respObj[0].userId});
			}
		},userLoginSessionKey);
	}
}