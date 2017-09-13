'use strict';

/*
 * Purpose : For User Basic Api
 * Company : Mobiweb Technology Pvt. Ltd.
 * Developed By  : Sorav Garg
 * Package : User
*/

var User     = exports;
var constant = require('../config/Constant.js')
var database = require('../config/Database.js');
var custom   = require('./Custom.js');
/**
 * To manage user registration
 * @param {string} userFirstName
 * @param {string} userLastName
 * @param {string} userEmail
 * @param {string} userPassword
 * @param {string} userGender
 * @param {string} userDOB
 * @param {string} userDeviceToken
 * @param {string} userDeviceType
 * @param {string} userDeviceId
*/

User.userSignup = function(req,res) {

	/* Manage all validations */
    req.sanitize("userFirstName").trim();
    req.sanitize("userLastName").trim();
    req.sanitize("userEmail").trim();
    req.sanitize("userPassword").trim();
    req.sanitize("userGender").trim();
    req.sanitize("userDOB").trim();
    req.sanitize("userDeviceToken").trim();
    req.sanitize("userDeviceType").trim();
    req.sanitize("userDeviceId").trim();
	req.check('userFirstName', 'The User first name field is required').notEmpty();
	req.check('userLastName', 'The User last name field is required').notEmpty();
	req.check('userEmail', 'The Email field is required').notEmpty();
	req.check('userEmail', 'The Email field must contain a valid email address').isEmail();
	req.check('userPassword', 'The Password field is required').notEmpty();
	req.check('userPassword', 'The Password field must contain at least 6 characters, including UPPER/lower case & numbers & at-least a special character').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/, "i");;
	req.check('userGender', 'The user gender field must be one of MALE,FEMALE,OTHER').inList(['MALE','FEMALE','OTHER']);
    req.check('userDOB', 'The user dob field is required').notEmpty();
    req.check('userDeviceToken', 'The user device token field is required').notEmpty();
    req.check('userDeviceType', 'The user device type field is required').notEmpty();
    req.check('userDeviceType', 'The user device type field must be one of ANDROID,IOS').inList(['ANDROID','IOS']);
	req.check('userDeviceId', 'The user device id field is required').notEmpty();
	var errors = req.validationErrors();
	if(errors)
	{
		res.send({"code" : '200', "response" : {},"status" : '0',"message" : custom.manageValidationMessages(errors)});
	}
	else
	{
		/* To get user email */
		let userEmail = req.sanitize('userEmail').escape().trim();

		/* Check Unique Email Id */
		database.getConn('SELECT * FROM '+ constant.users +' WHERE userEmail = "'+userEmail+'"', function (err, rows) {
			if(err){
				res.send({"code" : '200', "response" : {},"status" : '0',"message" : err.sqlMessage});
				return false;
			}else{
				if(rows != ''){
					res.send({"code" : '200', "response" : {},"status" : '0',"message" : 'Email Id already taken'});
					return false;
				}else{
					/* Filter User Requested Data */
			        let user_data = {};
			        user_data.userFirstName   = req.sanitize('userFirstName').escape().trim();
			        user_data.userLastName    = req.sanitize('userLastName').escape().trim();
			        user_data.userEmail       = userEmail;
			        user_data.userPassword    = custom.getMd5Value(req.sanitize('userPassword').escape().trim());
			        user_data.userGender      = req.sanitize('userGender').escape().trim();
			        user_data.userDOB         = req.sanitize('userDOB').escape().trim();
			        user_data.userDeviceToken = req.sanitize('userDeviceToken').escape().trim();
			        user_data.userDeviceType  = req.sanitize('userDeviceType').escape().trim();
			        user_data.userDeviceId    = req.sanitize('userDeviceId').escape().trim();

			        /* Insert data */
			        database.pool.getConnection(function (err, connection) {
			            
			            /* Begin transaction */
			            connection.beginTransaction(function(err) {
			              if (err) { 
			                res.send({"code" : '200', "response" : {},"status" : '0',"message" : 'Database error'});
			                return false;
			              }

			              /* Insert master user data */
			              let user_query = "INSERT INTO "+constant.users+" (userEmail,userPassword,userType) VALUES ('"+user_data.userEmail+"','"+user_data.userPassword+"','NORMAL_USER')";
			                connection.query(user_query, function(err, result) {
			                if (err) { 
			                    connection.rollback(function() {
			                    res.send({"code" : '200', "response" : {},"status" : '0',"message" : err.sqlMessage});
			                    return false;
			                  });
			                }
			                
			                /* Get master user id */
			                let masterUserId = result.insertId;

			                /* Insert user details data */
			                let user_details_query = "INSERT INTO "+constant.user_details+" (userId,userFirstName,userLastName,userDOB,userGender,userLoginSessionKey,userRegistrationDate,userLastIpAddress) VALUES ('"+masterUserId+"','"+user_data.userFirstName+"','"+user_data.userLastName+"','"+user_data.userDOB+"','"+user_data.userGender+"','"+custom.getGuid()+"','"+constant.current_time+"','"+custom.getUserIp()+"')";
			                  connection.query(user_details_query, function(err, result) {
			                  if (err) { 
			                    connection.rollback(function() {
			                      res.send({"code" : '200', "response" : {},"status" : '0',"message" : err.sqlMessage});
			                      return false;
			                    });
			                  }

			                /* Manage user devices history */
			                let userDeviceId = user_data.userDeviceId;
			                let user_device_select_query = "SELECT * FROM "+constant.users_device_history+" WHERE userDeviceId = '"+userDeviceId+"'";
			                connection.query(user_device_select_query, function(err, result) {
			                if (err) { 
			                    connection.rollback(function() {
			                    res.send({"code" : '200', "response" : {},"status" : '0',"message" : err.sqlMessage});
			                    return false;
			                });
			                }else{
			                	if(result != ''){
			                		var user_device_query = "UPDATE "+constant.users_device_history+ " SET userId = "+masterUserId+" ,userDeviceToken='"+user_data.userDeviceToken+"' ,userDeviceType='"+user_data.userDeviceType+"' ,deviceModifiedDate='"+constant.current_time+"'";
			                	}else{
			                		var user_device_query = "INSERT INTO "+constant.users_device_history+" (userId,userDeviceToken,userDeviceType,userDeviceId,deviceAddedDate,deviceModifiedDate) VALUES ('"+masterUserId+"','"+user_data.userDeviceToken+"','"+user_data.userDeviceType+"','"+user_data.userDeviceId+"','"+constant.current_time+"','"+constant.current_time+"')";
			                	}
			                }
			                connection.query(user_device_query, function(err, result) {
			                if (err) { 
			                    connection.rollback(function() {
			                    res.send({"code" : '200', "response" : {},"status" : '0',"message" : err.sqlMessage});
			                    return false;
			                  });
			                }

				              connection.commit(function(err) {
				                if (err) { 
				                    connection.rollback(function() {
				                    res.send({"code" : '200', "response" : {},"status" : '0',"message" : 'Database error'});
				                    return false;
				                  });
				                }
				                connection.release();
				                res.send({"code" : '200', "response" : {},"status" : '1',"message" : "User registered successfully, Please check your mail to verify account"});
				                return false;
				              });
			                 });
			                });
			                });
			              });
			            });
			            /* End transaction */
			        }); 
				}
			}
		});
	}
}