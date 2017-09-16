# Mobiweb Node.Js Modules  
[![](https://www.mobiwebtech.com/wp-content/themes/mobiweb/images/mobinew.png)](https://www.mobiwebtech.com/)  

Mobiweb basic modules utilities for node.js

## Installation

###  npm
```shell
npm install mobiweb-nodejs-modules
```

### git

```shell
git clone https://github.com/soravmobi/mobiweb-nodejs-modules.git
```

### npmjs

```shell
https://www.npmjs.com/package/mobiweb-nodejs-modules
```

## Usage
Basic modules like user signup, verify account, login, social login, frogot password, reset password etc.

```js
var mobiweb = require('mobiweb-nodejs-modules');
```

### For Signup

```js
app.post('/user/signup', function (req,res) {
    mobiweb.userSignup(req,res);
});


#### Required Parameters

* userFirstName   - [FIRST NAME]
* userLastName    - [LAST NAME]
* userEmail       - [UNIQUE EMAIL ID]
* userPassword    - [MD5 - ALPHA NUMERIC & 1 SPECIAL CHARACTER LIKE - Mobiweb@123]
* userGender      - [MALE,FEMALE,OTHER]
* userDOB         - [Y-M-D Format]
* userDeviceToken - [USER DEVICE TOKEN]
* userDeviceType  - [ANDROID,IOS]
* userDeviceId    - [UNIQUE DEVICE ID]

#### Note:- A temporary verification code will send on registered email id.

```

### For Login

```js
app.post('/user/login', function (req,res) {
    mobiweb.userLogin(req,res);
});


#### Required Parameters

* userEmail       - [UNIQUE EMAIL ID]
* userPassword    - [MD5 - ALPHA NUMERIC & 1 SPECIAL CHARACTER LIKE - Mobiweb@123]
* userDeviceToken - [USER DEVICE TOKEN]
* userDeviceType  - [ANDROID,IOS]
* userDeviceId    - [UNIQUE DEVICE ID]


```
