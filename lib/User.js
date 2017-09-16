'use strict';

/*
 * Purpose : For User Basic Api
 * Company : Mobiweb Technology Pvt. Ltd.
 * Developed By  : Sorav Garg
 * Package : User
 */

var User     = exports;
var async    = require('async');
var appRoot  = require('app-root-path');
var constant = require(appRoot + '/config/constant.js');
var custom   = require(appRoot + '/lib/custom.js');
var database = require(appRoot + '/config/database.js');
var model    = require(appRoot + '/lib/model.js');

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

User.userSignup = function(req, res) {

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
    req.check('userGender', 'The user gender field must be one of MALE,FEMALE,OTHER').inList(['MALE', 'FEMALE', 'OTHER']);
    req.check('userDOB', 'The user dob field is required').notEmpty();
    req.check('userDeviceToken', 'The user device token field is required').notEmpty();
    req.check('userDeviceType', 'The user device type field is required').notEmpty();
    req.check('userDeviceType', 'The user device type field must be one of ANDROID,IOS').inList(['ANDROID', 'IOS']);
    req.check('userDeviceId', 'The user device id field is required').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.send({
            "code": 200,
            "response": {},
            "status": 0,
            "message": custom.manageValidationMessages(errors)
        });
    } else {
        /* To get user email */
        let userEmail   = req.sanitize('userEmail').escape().trim();
        let getTempCode = constant.temp_code;

        /* Check Unique Email Id */
        database.getConn('SELECT * FROM ' + constant.users + ' WHERE userEmail = "' + userEmail + '"', function(err, rows) {
            if (err) {
                res.send({
                    "code": 200,
                    "response": {},
                    "status": 0,
                    "message": err.sqlMessage
                });
                return false;
            } else {
                if (rows != '') {
                    res.send({
                        "code": 200,
                        "response": {},
                        "status": 0,
                        "message": 'Email Id already taken'
                    });
                    return false;
                } else {
                    /* Filter User Requested Data */
                    let user_data = {};
                    user_data.userFirstName = req.sanitize('userFirstName').escape().trim();
                    user_data.userLastName = req.sanitize('userLastName').escape().trim();
                    user_data.userEmail = userEmail;
                    user_data.userPassword = custom.getMd5Value(req.sanitize('userPassword').escape().trim());
                    user_data.userGender = req.sanitize('userGender').escape().trim();
                    user_data.userDOB = req.sanitize('userDOB').escape().trim();
                    user_data.userDeviceToken = req.sanitize('userDeviceToken').escape().trim();
                    user_data.userDeviceType = req.sanitize('userDeviceType').escape().trim();
                    user_data.userDeviceId = req.sanitize('userDeviceId').escape().trim();

                    /* Insert data */
                    database.pool.getConnection(function(err, connection) {

                        /* Begin transaction */
                        connection.beginTransaction(function(err) {
                            if (err) {
                                res.send({
                                    "code": 200,
                                    "response": {},
                                    "status": 0,
                                    "message": 'Database error'
                                });
                                return false;
                            }

                            /* Insert master user data */
                            let user_query = "INSERT INTO " + constant.users + " (userEmail,userPassword,userType) VALUES ('" + user_data.userEmail + "','" + user_data.userPassword + "','NORMAL_USER')";
                            connection.query(user_query, function(err, result) {
                                if (err) {
                                    connection.rollback(function() {
                                        res.send({
                                            "code": 200,
                                            "response": {},
                                            "status": 0,
                                            "message": err.sqlMessage
                                        });
                                        return false;
                                    });
                                }

                                /* Get master user id */
                                let masterUserId = result.insertId;
                                var userLoginSessionKey = masterUserId + custom.getGuid();

                                /* Insert user details data */
                                let user_details_query = "INSERT INTO " + constant.user_details + " (userId,userFirstName,userLastName,userDOB,userGender,userLoginSessionKey,userRegistrationDate,userLastIpAddress,userTempCode,userTempCodeSentTime) VALUES ('" + masterUserId + "','" + user_data.userFirstName + "','" + user_data.userLastName + "','" + user_data.userDOB + "','" + user_data.userGender + "','" + userLoginSessionKey + "','" + constant.current_time + "','" + custom.getUserIp() + "','" + getTempCode + "','" + constant.current_time + "')";
                                connection.query(user_details_query, function(err, result) {
                                    if (err) {
                                        connection.rollback(function() {
                                            res.send({
                                                "code": 200,
                                                "response": {},
                                                "status": 0,
                                                "message": err.sqlMessage
                                            });
                                            return false;
                                        });
                                    }

                                    /* Manage user devices history */
                                    let userDeviceId = user_data.userDeviceId;
                                    let user_device_select_query = "SELECT * FROM " + constant.users_device_history + " WHERE userDeviceId = '" + userDeviceId + "'";
                                    connection.query(user_device_select_query, function(err, result) {
                                        if (err) {
                                            connection.rollback(function() {
                                                res.send({
                                                    "code": 200,
                                                    "response": {},
                                                    "status": 0,
                                                    "message": err.sqlMessage
                                                });
                                                return false;
                                            });
                                        } else {
                                            if (result != '') {
                                                var user_device_query = "UPDATE " + constant.users_device_history + " SET userId = " + masterUserId + " ,userDeviceToken='" + user_data.userDeviceToken + "' ,userDeviceType='" + user_data.userDeviceType + "' ,deviceModifiedDate='" + constant.current_time + "'";
                                            } else {
                                                var user_device_query = "INSERT INTO " + constant.users_device_history + " (userId,userDeviceToken,userDeviceType,userDeviceId,deviceAddedDate,deviceModifiedDate) VALUES ('" + masterUserId + "','" + user_data.userDeviceToken + "','" + user_data.userDeviceType + "','" + user_data.userDeviceId + "','" + constant.current_time + "','" + constant.current_time + "')";
                                            }
                                        }
                                        connection.query(user_device_query, function(err, result) {
                                            if (err) {
                                                connection.rollback(function() {
                                                    res.send({
                                                        "code": 200,
                                                        "response": {},
                                                        "status": 0,
                                                        "message": err.sqlMessage
                                                    });
                                                    return false;
                                                });
                                            }

                                            connection.commit(function(err) {
                                                if (err) {
                                                    connection.rollback(function() {
                                                        res.send({
                                                            "code": 200,
                                                            "response": {},
                                                            "status": 0,
                                                            "message": 'Database error'
                                                        });
                                                        return false;
                                                    });
                                                }
                                                connection.release();

                                                /* Send verification email to user */
                                                let siteName = constant.site_name;
                                                let mailData = {};
                                                mailData.to_email = userEmail;
                                                mailData.subject  = constant.verification_subject;
                                                mailData.message  = custom.verificationMailMsg(user_data.userFirstName,getTempCode);
                                                custom.sendEmail(mailData);
                                                res.send({
                                                    "code": 200,
                                                    "response": {"userLoginSessionKey":userLoginSessionKey},
                                                    "status": 5,
                                                    "message": "User registered successfully, Please check your registered mail to verify account."
                                                });
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

/**
 * To manage user login
 * @param {string} userEmail
 * @param {string} userPassword
 */

User.userLogin = function(req, res) {

    /* Manage all validations */
    req.sanitize("userEmail").trim();
    req.sanitize("userPassword").trim();
    req.check('userEmail', 'The Email field is required').notEmpty();
    req.check('userEmail', 'The Email field must contain a valid email address').isEmail();
    req.check('userPassword', 'The Password field is required').notEmpty();
    req.check('userDeviceToken', 'The user device token field is required').notEmpty();
    req.check('userDeviceType', 'The user device type field is required').notEmpty();
    req.check('userDeviceType', 'The user device type field must be one of ANDROID,IOS').inList(['ANDROID', 'IOS']);
    req.check('userDeviceId', 'The user device id field is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.send({
            "code": 200,
            "response": {},
            "status": 0,
            "message": custom.manageValidationMessages(errors)
        });
    } else {

        let userEmail    = req.sanitize('userEmail').escape().trim();
        let userPassword = custom.getMd5Value(req.sanitize('userPassword').escape().trim());

        /* Check User Email Id and Password */
        async.waterfall([
            function(callback) {
                var user_query = 'SELECT * FROM ' + constant.users+ ' WHERE userEmail="'+userEmail+'"  AND userPassword = "'+userPassword+'" AND userType = "NORMAL_USER" ';
                database.getConn(user_query, function (err, results) {
                    if(err){
                        res.send({
                            "code": 200,
                            "response": {},
                            "status": 0,
                            "message": err.sqlMessage
                        });
                    }else{
                        if(results != ''){
                            callback(null, results);
                        }else{
                            res.send({
                                "code": 200,
                                "response": {},
                                "status": 0,
                                "message": 'Invalid Email-id Or Password'
                            });
                        }
                    }
                });
            },
            function(results, callback) {

                /* To get master user id */
                var masterUserId = parseInt(results[0].masterUserId);
                var user_details_query = 'SELECT * FROM ' + constant.user_details+ ' WHERE userId='+masterUserId;
                database.getConn(user_details_query, function (err, detail_results) {
                    if(err){
                        res.send({
                            "code": 200,
                            "response": {},
                            "status": 0,
                            "message": err.sqlMessage
                        });
                    }else{
                        if(detail_results != ''){
                            callback(null, results,detail_results,masterUserId);
                        }else{
                            res.send({
                                "code": 200,
                                "response": {},
                                "status": 0,
                                "message": constant.general_error
                            });
                        }
                    }
                });
            },
            function(results,detail_results,masterUserId, callback) {
                if(parseInt(detail_results[0].userEmailVerified) === 0){
                    res.send({
                            "code": 200,
                            "response": {"userLoginSessionKey":detail_results[0].userLoginSessionKey},
                            "status": 5,
                            "message": constant.email_verify
                        });
                    return false;
                }else if(parseInt(detail_results[0].isUserBlocked) === 1){
                    res.send({
                            "code": 405,
                            "response": {},
                            "status": 0,
                            "message": constant.user_blocked
                        });
                    return false;
                }else if(parseInt(detail_results[0].isUserDeactivated) === 1){
                    res.send({
                            "code": 405,
                            "response": {},
                            "status": 0,
                            "message": constant.user_deactivated
                        });
                    return false;
                }else{
                    callback(null, results,detail_results);
                }
            }
        ], function (err, results,detail_results) {

            var masterUserId = parseInt(results[0].masterUserId);

            database.pool.getConnection(function(err, connection) {
                /* Begin transaction */
                connection.beginTransaction(function(err) {
                    if (err) {
                        res.send({
                            "code": 200,
                            "response": {},
                            "status": 0,
                            "message": 'Database error'
                        });
                        return false;
                    }

                    /* Update user details data */
                    let user_details_query = "UPDATE " + constant.user_details + " SET userLastLogin = '"+constant.current_time+"' , userLastIpAddress = '"+custom.getUserIp()+ "' WHERE userId ="+masterUserId;
                    connection.query(user_details_query, function(err, result) {
                        if (err) {
                            connection.rollback(function() {
                                res.send({
                                    "code": 200,
                                    "response": {},
                                    "status": 0,
                                    "message": err.sqlMessage
                                });
                                return false;
                            });
                        }

                        /* Manage user devices history */
                        let userDeviceId    = req.sanitize('userDeviceId').escape().trim();
                        let user_device_select_query = "SELECT * FROM " + constant.users_device_history + " WHERE userDeviceId = '" + userDeviceId + "'";
                        connection.query(user_device_select_query, function(err, result) {
                            if (err) {
                                connection.rollback(function() {
                                    res.send({
                                        "code": 200,
                                        "response": {},
                                        "status": 0,
                                        "message": err.sqlMessage
                                    });
                                    return false;
                                });
                            } else {
                                let userDeviceType  = req.sanitize('userDeviceType').escape().trim();
                                let userDeviceToken = req.sanitize('userDeviceToken').escape().trim();
                                if (result != '') {
                                    var user_device_query = "UPDATE " + constant.users_device_history + " SET userId = " + masterUserId + " ,userDeviceToken='" + userDeviceToken + "' ,userDeviceType='" + userDeviceType + "' ,deviceModifiedDate='" + constant.current_time + "'";
                                } else {
                                    var user_device_query = "INSERT INTO " + constant.users_device_history + " (userId,userDeviceToken,userDeviceType,userDeviceId,deviceAddedDate,deviceModifiedDate) VALUES ('" + masterUserId + "','" + userDeviceToken + "','" + userDeviceType + "','" + userDeviceId + "','" + constant.current_time + "','" + constant.current_time + "')";
                                }
                            }
                            connection.query(user_device_query, function(err, result) {
                                if (err) {
                                    connection.rollback(function() {
                                        res.send({
                                            "code": 200,
                                            "response": {},
                                            "status": 0,
                                            "message": err.sqlMessage
                                        });
                                        return false;
                                    });
                                }

                                connection.commit(function(err) {
                                    if (err) {
                                        connection.rollback(function() {
                                            res.send({
                                                "code": 200,
                                                "response": {},
                                                "status": 0,
                                                "message": 'Database error'
                                            });
                                            return false;
                                        });
                                    }
                                    connection.release();

                                    /* Return user response */
                                    let user_response  = {};
                                    user_response.userEmail = results[0].userEmail;
                                    user_response.userType  = results[0].userType;
                                    user_response.masterUserId  = parseInt(results[0].masterUserId);
                                    user_response.userFirstName = detail_results[0].userFirstName;
                                    user_response.userLastName  = detail_results[0].userLastName;
                                    user_response.userLoginSessionKey  = detail_results[0].userLoginSessionKey;
                                    res.send({
                                        "code": 200,
                                        "response": user_response,
                                        "status": 1,
                                        "message": "User loggedin successfully."
                                    });
                                    return false;
                                });
                            });
                        });
                    });
                });
                /* End transaction */
            });
        });
    }
}

/**
 * To verify user account
 * @param {string} userTempCode
 * @param {string} userLoginSessionKey
*/

User.verifyAccount = function(req, res) {

    req.sanitize("userTempCode").trim();
    req.sanitize("userLoginSessionKey").trim();
    req.check('userTempCode', 'The User verification code is required').notEmpty();
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
        let userTempCode        = req.sanitize('userTempCode').escape().trim();
        let userLoginSessionKey = req.sanitize('userLoginSessionKey').escape().trim();

        async.waterfall([
            function(callback) {
                var user_query = 'SELECT * FROM ' + constant.user_details+ ' WHERE userLoginSessionKey="'+userLoginSessionKey+'"';
                database.getConn(user_query, function (err, results) {
                    if(err){
                        res.send({
                            "code": 200,
                            "response": {},
                            "status": 0,
                            "message": err.sqlMessage
                        });
                    }else{
                        if(results != ''){
                            callback(null, results);
                        }else{
                            res.send({
                                "code": 200,
                                "response": {},
                                "status": 0,
                                "message": constant.invalid_login_session_key
                            });
                        }
                    }
                });
            },
            function(results, callback) {
                var user_query = 'SELECT * FROM ' + constant.user_details+ ' WHERE userTempCode="'+userTempCode+'"';
                database.getConn(user_query, function (err, code_results) {
                    if(err){
                        res.send({
                            "code": 200,
                            "response": {},
                            "status": 0,
                            "message": err.sqlMessage
                        });
                    }else{
                        if(code_results != ''){
                            if(results[0].userId == code_results[0].userId){
                                if(code_results[0].userEmailVerified == 1){
                                    res.send({
                                        "code": 200,
                                        "response": {},
                                        "status": 0,
                                        "message": constant.already_verified
                                    }); 
                                    return false;
                                }else if(code_results[0].isUserBlocked == 1){
                                    res.send({
                                        "code": 405,
                                        "response": {},
                                        "status": 0,
                                        "message": constant.user_blocked
                                    }); 
                                    return false;
                                }else{
                                    callback(null, results,code_results);
                                }
                            }else{
                                res.send({
                                    "code": 200,
                                    "response": {},
                                    "status": 0,
                                    "message": constant.invalid_code
                                }); 
                            }
                        }else{
                            res.send({
                                "code": 200,
                                "response": {},
                                "status": 0,
                                "message": constant.invalid_code
                            });
                        }
                    }
                });               
            }
        ], function (err, results,code_results) {
            
            /* Update User Status */
            let update_query = 'UPDATE '+ constant.user_details+ ' SET userEmailVerified = 1, userTempCode = NULL, userTempCodeSentTime = NULL WHERE userId = '+code_results[0].userId;
            database.getConn(update_query, function (err, rows) {
                if(err){
                    res.send({"code" : '200', "response" : {},"status" : '0',"message" : err.sqlMessage});
                    return false;
                }else{
                    res.send({"code" : '200', "response" : {},"status" : '1',"message" : 'Congratulation !! your profile has been successfully verified.'});
                    return false;
                }
            });
        });
    }
}

/**
 * To re-send account verification code
 * @param {string} userLoginSessionKey
*/

User.resendAccountVerificationCode = function(req, res) {

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
        
        async.waterfall([
            function(callback) {

                /* Get user details */
                model.getAllWhere(function(err,resp){
                    if(err){
                        res.send(custom.dbErrorResponse());
                        return false;
                    }else{
                        if(resp != ""){
                            if(resp[0].userEmailVerified == 1){
                                res.send({
                                    "code": 200,
                                    "response": {},
                                    "status": 0,
                                    "message": constant.already_verified
                                }); 
                                return false;
                            }else if(resp[0].isUserBlocked == 1){
                                res.send({
                                    "code": 405,
                                    "response": {},
                                    "status": 0,
                                    "message": constant.user_blocked
                                }); 
                                return false;
                            }else{

                                /* Get user email id */
                                model.getAllWhere(function(err,main_results){
                                    if(err){
                                        res.send(custom.dbErrorResponse());
                                        return false;
                                    }else{
                                        if(main_results != ""){
                                            callback(null,resp,main_results[0].userEmail);
                                        }else{
                                            res.send({"code" : '200', "response" : {},"status" : '0',"message" : constant.user_detais_not_found});
                                            return false;
                                        }
                                    }
                                },constant.users,{masterUserId:resp[0].userId},'','','userEmail');
                            }
                        }else{
                            res.send({"code" : '200', "response" : {},"status" : '0',"message" : constant.invalid_login_session_key});
                            return false;
                        }
                    }
                },constant.user_details,{userLoginSessionKey:userLoginSessionKey});
            },
            function(results,userEmail, callback) {
                let getTempCode = constant.temp_code;    

                /* Update user details */
                var dataObj = {};
                dataObj.userTempCode = getTempCode;
                dataObj.userTempCodeSentTime = constant.current_time;
                model.updateData(function(err,resp){
                    if(err){
                        res.send(custom.dbErrorResponse());
                        return false;
                    }else{
                        callback(null,results,getTempCode,userEmail);
                    }
                },constant.user_details,dataObj,{userId:results[0].userId});
            }
        ], function (err, results,getTempCode,userEmail) {

            /* Send verification email to user */
            let siteName = constant.site_name;
            let mailData = {};
            mailData.to_email = userEmail;
            mailData.subject  = constant.verification_subject;
            mailData.message  = custom.verificationMailMsg(results[0].userFirstName,getTempCode);
            custom.sendEmailCallBack(mailData,function(err,resp){
                if(err){
                    res.send(custom.mailErrorResponse());
                    return false;
                }else{
                    res.send({
                        "code": 200,
                        "response": {},
                        "status": 5,
                        "message": "Account verification code resent successfully, Please check your registered mail to verify account."
                    });
                    return false; 
                }
            });
        });
    }
}

/**
 * To forgot password request
 * @param {string} userEmail
*/

User.forgotPassword = function(req, res) {

    req.sanitize("userEmail").trim();
    req.check('userEmail', 'The Email field is required').notEmpty();
    req.check('userEmail', 'The Email field must contain a valid email address').isEmail();
    let errors = req.validationErrors();
    if (errors) {
        res.send({
            "code": 200,
            "response": {},
            "status": 0,
            "message": custom.manageValidationMessages(errors)
        });
    } else {
        let userEmail = req.sanitize('userEmail').escape().trim();
        
        async.waterfall([
            function(callback) {

                /* Get user email id */
                model.getAllWhere(function(err,resp){
                    if(err){
                        res.send(custom.dbErrorResponse());
                        return false;
                    }else{
                        if(resp != ""){
                            callback(null,resp,resp[0].masterUserId);
                        }else{
                            res.send({"code" : '200', "response" : {},"status" : '0',"message" : 'Email-id does not exist'});
                            return false;
                        }
                    }
                },constant.users,{userEmail:userEmail});              
            },
            function(results,masterUserId, callback) {

                /* Get user details */
                model.getAllWhere(function(err,resp){
                    if(err){
                        res.send(custom.dbErrorResponse());
                        return false;
                    }else{
                        if(resp != ""){
                            if(resp[0].userEmailVerified == 0){
                                res.send({
                                    "code": 200,
                                    "response": {},
                                    "status": 0,
                                    "message": constant.email_verify
                                }); 
                                return false;
                            }else if(resp[0].isUserBlocked == 1){
                                res.send({
                                    "code": 405,
                                    "response": {},
                                    "status": 0,
                                    "message": constant.user_blocked
                                }); 
                                return false;
                            }else if(resp[0].isUserDeactivated == 1){
                                res.send({
                                    "code": 405,
                                    "response": {},
                                    "status": 0,
                                    "message": constant.user_deactivated
                                }); 
                                return false;
                            }else{
                                let getTempCode = constant.temp_code;    

                                /* Update user details */
                                var dataObj = {};
                                dataObj.userTempCode = getTempCode;
                                dataObj.userTempCodeSentTime = constant.current_time;
                                model.updateData(function(err,update_resp){
                                    if(err){
                                        res.send(custom.dbErrorResponse());
                                        return false;
                                    }else{
                                        callback(null,resp[0].userLoginSessionKey,resp[0].userFirstName,results[0].userEmail,results[0].masterUserId,getTempCode);
                                    }
                                },constant.user_details,dataObj,{userId:resp[0].userId});
                
                            }
                        }else{
                            res.send({"code" : '200', "response" : {},"status" : '0',"message" : constant.user_detais_not_found});
                            return false;
                        }
                    }
                },constant.user_details,{userId:masterUserId});
            }
        ], function (err,userLoginSessionKey,userFirstName,userEmail,masterUserId,getTempCode) {

            /* Send temporary code on user email id */
            let siteName = constant.site_name;
            let forgotPasswordMsg = custom.forgotPasswordMsg(userFirstName,getTempCode);
            let mailData = {};
            mailData.to_email = userEmail;
            mailData.subject  = constant.forgot_password_subject;
            mailData.message  = forgotPasswordMsg;
            custom.sendEmailCallBack(mailData,function(err,resp){
                if(err){
                    res.send(custom.mailErrorResponse());
                    return false;
                }else{
                    res.send({
                        "code": 200,
                        "response": {userLoginSessionKey:userLoginSessionKey},
                        "status": 5,
                        "message": constant.forgot_pswd_msg
                    });
                    return false; 
                }
            });
        });
    }
}

/**
 * To verify user forgot password code
 * @param {string} userTempCode
 * @param {string} userLoginSessionKey
*/

User.verifyForgotPasswordCode = function(req, res) {

    req.sanitize("userTempCode").trim();
    req.sanitize("userLoginSessionKey").trim();
    req.check('userTempCode', 'The User verification code is required').notEmpty();
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
        let userTempCode        = req.sanitize('userTempCode').escape().trim();
        let userLoginSessionKey = req.sanitize('userLoginSessionKey').escape().trim();

        async.waterfall([
            function(callback) {

               /* Get user details */
                model.getAllWhere(function(err,results){
                    if(err){
                        res.send(custom.dbErrorResponse());
                        return false;
                    }else{
                        if(results != ""){
                            model.getAllWhere(function(err,code_results){
                                if(err){
                                    res.send(custom.dbErrorResponse());
                                    return false;
                                }else{
                                    if(code_results != ""){
                                        if(results[0].userId == code_results[0].userId){
                                            if(code_results[0].userEmailVerified == 0){
                                                res.send({
                                                    "code": 200,
                                                    "response": {},
                                                    "status": 0,
                                                    "message": constant.email_verify
                                                }); 
                                                return false;
                                            }else if(code_results[0].isUserBlocked == 1){
                                                res.send({
                                                    "code": 405,
                                                    "response": {},
                                                    "status": 0,
                                                    "message": constant.user_blocked
                                                }); 
                                                return false;
                                            }else{
                                                let userTempCodeSentTime  = code_results[0].userTempCodeSentTime;
                                                let currentTime  = constant.current_time;
                                                let timeDifferece = custom.getDateTimeDifference(userTempCodeSentTime,currentTime,'minutes');
                                                if(timeDifferece > constant.code_valid_time){
                                                    res.send({
                                                        "code": 200,
                                                        "response": {userLoginSessionKey:userLoginSessionKey},
                                                        "status": 0,
                                                        "message": constant.code_limit_msg
                                                    });
                                                }else{
                                                    callback(null,results,results[0].userId);
                                                }
                                            }
                                        }else{
                                            res.send({
                                                "code": 200,
                                                "response": {},
                                                "status": 0,
                                                "message": constant.invalid_code
                                            });
                                        }
                                    }else{
                                        res.send({"code" : '200', "response" : {},"status" : '0',"message" : constant.user_detais_not_found});
                                        return false;
                                    }
                                }
                            },constant.user_details,{userTempCode:userTempCode});
                        }else{
                            res.send({"code" : '200', "response" : {},"status" : '0',"message" : constant.invalid_login_session_key});
                            return false;
                        }
                    }
                },constant.user_details,{userLoginSessionKey:userLoginSessionKey}); 
            }
        ], function (err, results,userId) {
            
            /* Update user details */
            var dataObj = {};
            dataObj.userTempCode = null;
            dataObj.userTempCodeSentTime = null;
            model.updateData(function(err,update_resp){
                if(err){
                    res.send(custom.dbErrorResponse());
                    return false;
                }else{
                    res.send({
                        "code": 200,
                        "response": {userLoginSessionKey:results[0].userLoginSessionKey},
                        "status": 1,
                        "message": 'Your temporary code successfully verified with us, please reset your password.'
                    });
                }
            },constant.user_details,dataObj,{userId:userId});

        });
    }
}

/**
 * To reset user password
 * @param {string} userLoginSessionKey
 * @param {string} newPassword
 * @param {string} confirmPassword
*/

User.resetPassword = function(req, res) {

    req.sanitize("userLoginSessionKey").trim();
    req.sanitize("newPassword").trim();
    req.sanitize("confirmPassword").trim();
    req.check('userLoginSessionKey', 'The User login session key field is required').notEmpty();
    req.check('newPassword', 'The User new password field is required').notEmpty();
    req.check('newPassword', 'The New Password field must contain at least 6 characters, including UPPER/lower case & numbers & at-least a special character').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/, "i");;
    req.check('confirmPassword', 'The User confirm password field is required').notEmpty();
    req.check('confirmPassword', 'The Confirm Password field must contain at least 6 characters, including UPPER/lower case & numbers & at-least a special character').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/, "i");;
    req.check('confirmPassword', 'The Confirm Password field does not match the password field').equals(req.body.newPassword);
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
        let newPassword         = req.sanitize('newPassword').escape().trim();
        let confirmPassword     = req.sanitize('confirmPassword').escape().trim();

        async.waterfall([
            function(callback) {
               
                /* Get user details */
                model.getAllWhere(function(err,results){
                    if(err){
                        res.send(custom.dbErrorResponse());
                        return false;
                    }else{
                        if(results != ""){
                            if(results[0].userEmailVerified == 0){
                                res.send({
                                    "code": 200,
                                    "response": {},
                                    "status": 0,
                                    "message": constant.email_verify
                                }); 
                                return false;
                            }else if(results[0].isUserBlocked == 1){
                                res.send({
                                    "code": 405,
                                    "response": {},
                                    "status": 0,
                                    "message": constant.user_blocked
                                }); 
                                return false;
                            }else{
                                callback(null,results,results[0].userId);
                            }
                        }else{
                            res.send({"code" : '200', "response" : {},"status" : '0',"message" : constant.invalid_login_session_key});
                            return false;
                        }
                    }
                },constant.user_details,{userLoginSessionKey:userLoginSessionKey}); 
            }
        ], function (err,results,userId) {

            /* Update user details */
            var dataObj = {};
            dataObj.userPassword = custom.getMd5Value(newPassword);
            model.updateData(function(err,update_resp){
                if(err){
                    res.send(custom.dbErrorResponse());
                    return false;
                }else{
                    res.send({
                        "code": 200,
                        "response": {},
                        "status": 1,
                        "message": 'Your password changed successfully.'
                    });
                }
            },constant.users,dataObj,{masterUserId:userId});
        });
    }
}

/**
 * To re-send forgot password code
 * @param {string} userLoginSessionKey
*/

User.resendForgotPasswordCode = function(req, res) {

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
        
        async.waterfall([
            function(callback) {

                /* Get user details */
                model.getAllWhere(function(err,resp){
                    if(err){
                        res.send(custom.dbErrorResponse());
                        return false;
                    }else{
                        if(resp != ""){
                            if(resp[0].userEmailVerified == 0){
                                res.send({
                                    "code": 200,
                                    "response": {},
                                    "status": 0,
                                    "message": constant.email_verify
                                }); 
                                return false;
                            }else if(resp[0].isUserBlocked == 1){
                                res.send({
                                    "code": 405,
                                    "response": {},
                                    "status": 0,
                                    "message": constant.user_blocked
                                }); 
                                return false;
                            }else{
                                let userLastTempCodeSentTime  = resp[0].userTempCodeSentTime;
                                let currentTime  = constant.current_time;
                                let timeDifferece = custom.getDateTimeDifference(userLastTempCodeSentTime,currentTime,'minutes');
                                if(timeDifferece < 5){
                                    res.send({
                                        "code": 200,
                                        "response": {userLoginSessionKey:userLoginSessionKey},
                                        "status": 0,
                                        "message": 'Sorry !! you can make new request after 5 minutes.'
                                    });
                                    return false;
                                }else{
                                   /* Get user email id */
                                    model.getAllWhere(function(err,main_results){
                                        if(err){
                                            res.send(custom.dbErrorResponse());
                                            return false;
                                        }else{
                                            if(main_results != ""){
                                                callback(null,resp,main_results[0].userEmail);
                                            }else{
                                                res.send({"code" : '200', "response" : {},"status" : '0',"message" : constant.user_detais_not_found});
                                                return false;
                                            }
                                        }
                                    },constant.users,{masterUserId:resp[0].userId},'','','userEmail');
                                }
                            }
                        }else{
                            res.send({"code" : '200', "response" : {},"status" : '0',"message" : constant.invalid_login_session_key});
                            return false;
                        }
                    }
                },constant.user_details,{userLoginSessionKey:userLoginSessionKey});
            },
            function(results,userEmail, callback) {
                let getTempCode = constant.temp_code;    

                /* Update user details */
                var dataObj = {};
                dataObj.userTempCode = getTempCode;
                dataObj.userTempCodeSentTime = constant.current_time;
                model.updateData(function(err,resp){
                    if(err){
                        res.send(custom.dbErrorResponse());
                        return false;
                    }else{
                        callback(null,results,getTempCode,userEmail);
                    }
                },constant.user_details,dataObj,{userId:results[0].userId});
            }
        ], function (err, results,getTempCode,userEmail) {

            /* Send verification email to user */
            let siteName = constant.site_name;
            let forgotPasswordMsg = custom.forgotPasswordMsg(results[0].userFirstName,getTempCode);
            let mailData = {};
            mailData.to_email = userEmail;
            mailData.subject  = constant.forgot_password_subject;
            mailData.message  = forgotPasswordMsg;
            custom.sendEmailCallBack(mailData,function(err,resp){
                if(err){
                    res.send(custom.mailErrorResponse());
                    return false;
                }else{
                    res.send({
                        "code": 200,
                        "response": {userLoginSessionKey:userLoginSessionKey},
                        "status": 5,
                        "message": constant.forgot_pswd_msg
                    });
                    return false; 
                }
            });
        });
    }
}



