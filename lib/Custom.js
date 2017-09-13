"use strict";

/*
 * Purpose: For manage custom functions
 * Company: Mobiweb Technology Pvt. Ltd.
 * Developed By : Sorav Garg
*/

var appConst = require('../config/Constant.js');

class Custom {

	/* Custom Functions Constructor */
	constructor() {
	}

	/**
	 * To manage validation messages
	 * @param {object} reqData
	*/
    manageValidationMessages(reqData){

    	/* Count object length */
    	var count = Object.keys(reqData).length;
    	if(count > 0){
    		for (var i = 0; i < count; i++) {
    			if(reqData[i]['msg'] != ''){
    				return reqData[i]['msg'];
    			}
    		}
    	}else{
    		return '';
    	}
    }

    /**
     * To get md5 value
     * @param {string} value
    */
    getMd5Value(value){
        var md5    = require('md5');
        var crypto = require('crypto');
        return crypto.createHash('md5').update(value).digest("hex");
    }

    /**
     * To get image extension from base64 image
     * @param {string} value
    */
    getImgExtension(value){
        var extension  = '';
        var base64_arr = value.split(';');
        if(base64_arr != '' && base64_arr[0] != ''){
            var first_segment = base64_arr[0];
            var first_segment_arr = first_segment.split('/');
            if(first_segment_arr != '' && first_segment_arr[1] != '')
            {
                return first_segment_arr[1].toLowerCase();
            }
        }
        return extension;
    }

    /**
     * To get unique player name
    */
    getUniquePlayer(){
        var uniqid = require('uniqid');
        return uniqid.time('Guest');
    }

    /**
     * To change date time format
     * @param {string} datetime 
     * @param {string} format 
    */
    changeDateFormat(datetime,format = 'YYYY-MM-DD HH:mm:ss'){
       let date = require('date-and-time');
       return date.parse(datetime, format); 
    }

    /**
     * To get unique alpha numeric string
    */
    s4(){
        return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
    }

    /**
     * To get unique guid
    */
    getGuid(){
        return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
                this.s4() + '-' + this.s4() + this.s4() + this.s4();
    }

    /**
     * To get user ip address
    */
    getUserIp(name = 'public'){
        var ip = require('ip');
        return ip.address(name);
    }
    
}

module.exports = new Custom();

/* End of file custom.js */
/* Location: ./custom.js */