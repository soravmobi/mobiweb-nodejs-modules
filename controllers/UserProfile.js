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

/**
 * To upload user profile & cover images
 * @param {string} userLoginSessionKey
 * @param {file} userFile
 * @param {string} fileUploadType
 */

UserProfile.uploadUserImage = function(req, res) {
	let ejs     = require('ejs');
    let path    = require('path');
    let multer  = require('multer');
    let uploadPath = './uploads/users/';

    /* Set file destination path */
	let storage = multer.diskStorage({
		destination: function(req, file, callback) {
			callback(null, uploadPath)
		},
		filename: function(req, file, callback) {
			let uploadedFileName = 'user-'+ Date.now() + '-' + custom.getGuid() + path.extname(file.originalname);
			callback(null, uploadedFileName)
		}
	});

	var upload = multer({
						storage: storage,
						fileFilter: function(req, file, callback) {
							let ext = path.extname(file.originalname)
							if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
						        req.fileValidationError = 'goes wrong on the mimetype';
						        return callback(null, false, new Error('goes wrong on the mimetype'))
							}else{
								callback(null, true)
							}
						}
				}).single('userFile');
	
	/* Upload file */
    upload(req, res, function(err) {
    	if(req.fileValidationError) {
            return  res.send({
				            "code": 200,
				            "response": {},
				            "status": 0,
				            "message": 'You can upload only png, jpg, gif & jpeg files.'
				        });
        }else{
        	let uploadedFileName = req.file.filename;
        	let uploadedFilePath = req.file.path;
        	req.sanitize("userLoginSessionKey").trim();
			req.sanitize("fileUploadType").trim();
		    req.check('userLoginSessionKey', 'The User login session key field is required').notEmpty();
		    req.check('fileUploadType', 'Required File Upload Type').inList(['PROFILE_IMG', 'COVER_IMG']);
		    let errors = req.validationErrors();
		    if (errors) {
		    	
		    	/* To delete uploaded file */
		    	custom.unlinkFile(uploadedFilePath);
		        res.send({
		            "code": 200,
		            "response": {},
		            "status": 0,
		            "message": custom.manageValidationMessages(errors)
		        });
		    } else {
				let userLoginSessionKey   = req.sanitize('userLoginSessionKey').escape().trim();
				let fileUploadType        = req.sanitize('fileUploadType').escape().trim();
				if(fileUploadType === 'PROFILE_IMG'){
					var thumbailWidth = 150;
				}else{
					var thumbailWidth = 400;
				}

				async.waterfall([
				    function(callback) {
				    	/* To validate user login session key */
						custom.handleLoggedInUser(function(respType,respObj) {
							if(parseInt(respType) === 0){
								/* To delete uploaded file */
				                custom.unlinkFile(uploadedFilePath);
								res.send(respObj);
								return false;
							}else{
								callback(null, respObj);
							}
						},userLoginSessionKey);
				    },
				    function(userDetailsObj, callback) {

				        /* Generate uploaded image thumbnail */
						custom.getImgThumbnail(function(respType,resp){
							if(parseInt(respType) === 0){
				                /* To delete uploaded file */
				                custom.unlinkFile(uploadedFilePath);
				                return res.send(resp);
							}else{
								let thumbnailUploadedImgPath = resp;
								callback(null, userDetailsObj,thumbnailUploadedImgPath);
							}
						},uploadedFilePath,uploadPath,thumbailWidth);
				    }
				], function (err,userDetailsObj,thumbnailUploadedImgPath) {
				    
				    var updateDataObj = {};
				    if(fileUploadType === 'PROFILE_IMG'){
						updateDataObj.userImage = uploadedFilePath;
						updateDataObj.userImageThumbnail = thumbnailUploadedImgPath;
						updateDataObj.userProfileImageStatus = 1;
					}else{
						updateDataObj.userCoverImage = uploadedFilePath;
						updateDataObj.userCoverImageThumbnail = thumbnailUploadedImgPath;
						updateDataObj.userCoverImageStatus = 1;
					}
					model.updateData(function(err,resp){
	                    if(err){
	                    	/* To delete uploaded files */
				            custom.unlinkFile(uploadedFilePath);
				            custom.unlinkFile(thumbnailUploadedImgPath);
	                        return res.send(custom.dbErrorResponse());
	                    }else{
	                    	var successResp   = {};
	                    	if(fileUploadType === 'PROFILE_IMG'){
	                    		/* To delete old images */
	                    		if(userDetailsObj[0].userImage) custom.unlinkFile(userDetailsObj[0].userImage);
	                    		if(userDetailsObj[0].userImageThumbnail) custom.unlinkFile(userDetailsObj[0].userImageThumbnail);
	                    		var successMsg = 'Profile image uploaded scuccessfully.';
								successResp.userImage = constant.base_url + uploadedFilePath;
								successResp.userImageThumbnail = constant.base_url + thumbnailUploadedImgPath;
	                    	}else{
	                    		/* To delete old images */
	                    		if(userDetailsObj[0].userCoverImage) custom.unlinkFile(userDetailsObj[0].userCoverImage);
	                    		if(userDetailsObj[0].userCoverImageThumbnail) custom.unlinkFile(userDetailsObj[0].userCoverImageThumbnail);
								var successMsg = 'Cover image uploaded scuccessfully.';
								successResp.userCoverImage = constant.base_url + uploadedFilePath;
								successResp.userCoverImageThumbnail = constant.base_url + thumbnailUploadedImgPath;
	                    	}
	                        return  res.send({
							            "code": 200,
							            "response": successResp,
							            "status": 1,
							            "message":successMsg 
							        });
	                    }
	                },constant.user_details,updateDataObj,{userId:userDetailsObj[0].userId});
				});
			}
        }
    });
}

/**
 * To upload user gallery images
 * @param {string} userLoginSessionKey
 * @param {file} userFile
 */

UserProfile.uploadGalleryImage = function(req, res) {
	let ejs     = require('ejs');
    let path    = require('path');
    let multer  = require('multer');
    let uploadPath = './uploads/gallery/';

    /* Set file destination path */
	let storage = multer.diskStorage({
		destination: function(req, file, callback) {
			callback(null, uploadPath)
		},
		filename: function(req, file, callback) {
			let uploadedFileName = 'user-'+ Date.now() + '-' + custom.getGuid() + path.extname(file.originalname);
			callback(null, uploadedFileName)
		}
	});

	var upload = multer({
						storage: storage,
						fileFilter: function(req, file, callback) {
							let ext = path.extname(file.originalname)
							if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
						        req.fileValidationError = 'goes wrong on the mimetype';
						        return callback(null, false, new Error('goes wrong on the mimetype'))
							}else{
								callback(null, true)
							}
						}
				}).single('userFile');
	
	/* Upload file */
    upload(req, res, function(err) {
    	if(req.fileValidationError) {
            return  res.send({
				            "code": 200,
				            "response": {},
				            "status": 0,
				            "message": 'You can upload only png, jpg, gif & jpeg files.'
				        });
        }else{
        	let uploadedFileName = req.file.filename;
        	let uploadedFilePath = req.file.path;
        	req.sanitize("userLoginSessionKey").trim();
		    req.check('userLoginSessionKey', 'The User login session key field is required').notEmpty();
		    let errors = req.validationErrors();
		    if (errors) {
		    	
		    	/* To delete uploaded file */
		    	custom.unlinkFile(uploadedFilePath);
		        res.send({
		            "code": 200,
		            "response": {},
		            "status": 0,
		            "message": custom.manageValidationMessages(errors)
		        });
		    } else {
				let userLoginSessionKey   = req.sanitize('userLoginSessionKey').escape().trim();

				async.waterfall([
				    function(callback) {
				    	/* To validate user login session key */
						custom.handleLoggedInUser(function(respType,respObj) {
							if(parseInt(respType) === 0){
								/* To delete uploaded file */
				                custom.unlinkFile(uploadedFilePath);
								res.send(respObj);
								return false;
							}else{

								/* Check number of upload images limit */
								let userMaxImageUploadStatus = parseInt(respObj[0].userMaxImageUploadStatus);

								/* Get all uploaded gallery images */
								model.getCount(function(err,resp){
									if(err){
				                    	/* To delete uploaded files */
							            custom.unlinkFile(uploadedFilePath);
				                        return res.send(custom.dbErrorResponse());
				                    }else{

				                    	/* Total uploaded images */
				                    	let totalUploadedImages = parseInt(resp);
				                    	if(userMaxImageUploadStatus === 0 && totalUploadedImages >= constant.gallery_image_limit){
				                    		/* To delete uploaded files */
							            	custom.unlinkFile(uploadedFilePath);
				                    		return  res.send({
											            "code": 200,
											            "response": {},
											            "status": 0,
											            "message": 'You can upload maximum '+constant.gallery_image_limit+' images'
											        });
				                    	}else{
											callback(null, respObj);
				                    	}
				                    }
								},constant.user_gallery_images,{userId:respObj[0].userId});
							}
						},userLoginSessionKey);
				    },
				    function(userDetailsObj, callback) {

				        /* Generate uploaded image thumbnail */
						custom.getImgThumbnail(function(respType,resp){
							if(parseInt(respType) === 0){
				                /* To delete uploaded file */
				                custom.unlinkFile(uploadedFilePath);
				                return res.send(resp);
							}else{
								let thumbnailUploadedImgPath = resp;
								callback(null, userDetailsObj,thumbnailUploadedImgPath);
							}
						},uploadedFilePath,uploadPath,250);
				    }
				], function (err,userDetailsObj,thumbnailUploadedImgPath) {
				    
				    var insertDataObj = {};
					insertDataObj.userId = userDetailsObj[0].userId;
					insertDataObj.userOriginalImage  = uploadedFilePath;
					insertDataObj.userThumbnailImage = thumbnailUploadedImgPath;
					insertDataObj.userGalleryImageCreatedDate  = constant.current_time;
					insertDataObj.userGalleryImageModifiedDate = constant.current_time;
					model.insertData(function(err,resp){
	                    if(err){
	                    	/* To delete uploaded files */
				            custom.unlinkFile(uploadedFilePath);
				            custom.unlinkFile(thumbnailUploadedImgPath);
	                        return res.send(custom.dbErrorResponse());
	                    }else{
	                        return  res.send({
							            "code": 200,
							            "response": {},
							            "status": 1,
							            "message":'Image uploaded successfully.' 
							        });
	                    }
	                },constant.user_gallery_images,insertDataObj);
				});
			}
        }
    });
}

/**
 * To get user gallery images
 * @param {string} userLoginSessionKey
 * @param {integer} pageNo
*/

UserProfile.galleryImagesListing = function(req, res) {
	req.sanitize("userLoginSessionKey").trim();
	req.sanitize("pageNo").trim();
    req.check('userLoginSessionKey', 'The User login session key field is required').notEmpty();
    req.check('pageNo', 'Required page number').notEmpty();
    req.check('pageNo', 'Page number minimum value should be 1').minValue(1);
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
		let pageNo                = parseInt(req.sanitize('pageNo').escape().trim());

		async.waterfall([
		    function(callback) {
		    	/* To validate user login session key */
				custom.handleLoggedInUser(function(respType,respObj) {
					if(parseInt(respType) === 0){
						res.send(respObj);
						return false;
					}else{
						callback(null, respObj);
					}
				},userLoginSessionKey);
		    },
		    function(userDetailsObj, callback) {

		    	/* To get offset */
		    	let offset = custom.getOffset(pageNo);

		    	/* To get user gallery images */
		        model.getAllWhere(function(err,galleryImagesObj){
		        	if(err){
	                    return res.send(custom.dbErrorResponse());
	                }else{
	                	if(galleryImagesObj != ""){
	                		callback(null, userDetailsObj, galleryImagesObj);
	                	}else{
	                		return res.send({
							            "code": 200,
							            "response": [],
							            "status": 0,
							            "message": "Gallery images not found."
							        });
	                	}
	                }
		        },constant.user_gallery_images,{userId:userDetailsObj[0].userId},'userGalleryImageId','DESC','*',10,offset);
		    }
		], function (err,userDetailsObj,galleryImagesObj) {
		    let responseObj = [];
		    for (var i = 0; i < parseInt(galleryImagesObj.length); i++) 
		    {
		    	let row = {};
		    	row.userGalleryImageId  = parseInt(galleryImagesObj[i].userGalleryImageId);
		    	row.userOriginalImage   = constant.base_url + galleryImagesObj[i].userOriginalImage;
		    	row.userThumbnailImage  = constant.base_url + galleryImagesObj[i].userThumbnailImage;
		    	row.userGalleryImageCreatedDate  = custom.changeDateFormat(galleryImagesObj[i].userGalleryImageCreatedDate);
		    	responseObj.push(row);
		    }
		    return res.send({
				            "code": 200,
				            "response": responseObj,
				            "status": 1,
				            "message": "success"
				        });
		});
	}
}


/**
 * To delete user gallery image
 * @param {string} userLoginSessionKey
 * @param {integer} userGalleryImageId
*/

UserProfile.deleteGalleryImage = function(req, res) {
	req.sanitize("userLoginSessionKey").trim();
	req.sanitize("userGalleryImageId").trim();
    req.check('userLoginSessionKey', 'The User login session key field is required').notEmpty();
    req.check('userGalleryImageId', 'Required page number').notEmpty();
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
		let userGalleryImageId    = parseInt(req.sanitize('userGalleryImageId').escape().trim());

		async.waterfall([
		    function(callback) {
		    	/* To validate user login session key */
				custom.handleLoggedInUser(function(respType,respObj) {
					if(parseInt(respType) === 0){
						res.send(respObj);
						return false;
					}else{
						callback(null, respObj);
					}
				},userLoginSessionKey);
		    }
		], function (err,userDetailsObj) {

		    /* To delete user gallery image */
	        model.deleteData(function(err,resp){
	        	if(err){
	                return res.send(custom.dbErrorResponse());
	            }else{
	            	if(parseInt(resp.affectedRows) > 0){
	            		return res.send({
						            "code": 200,
						            "response": {},
						            "status": 1,
						            "message": "Gallery images deleted successfully."
						        });
	            	}else{
	            		return res.send({
						            "code": 200,
						            "response": {},
						            "status": 0,
						            "message": "Failed to delete image."
						        });
	            	}
	            }
	        },constant.user_gallery_images,{userGalleryImageId:userGalleryImageId,userId:userDetailsObj[0].userId});
		});
	}
}