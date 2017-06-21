/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* Lambda Function to use AWS IoT button to send check-in/check-out notifications using an SNS Topic. */

'use strict';
const AWS = require('aws-sdk');
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });

// !!CHANGE THIS (1 of 3)!! Enter the ARN of your SNS Topic
const TOPIC_ARN = 'arn:aws:sns:us-west-2:XXXXXXXXXXXX:IoT-Button-CheckIn';

// !!CHANGE THIS (2 of 3)!! Enter difference in hours between your local time and UTC.
var localTimeZone = -7;
/* Example: For PST (UTC -7), enter -7. For CET (UTC +1), enter 1. 
NOTE: Timezones with half and quarter hour offset such as IST are not supported. Enter nearest timezone with full hour offset, or enter 0 to keep it in UTC
NOTE 2.0: Do not try to enter invalid timezone values like numbers > 12, or letters. Your code will NOT work! */

// !!CHANGE THIS (3 of 3)!! Edit this message if you prefer a different subject for your notification emails.
var emailSubject = 'Airbnb Guest Notification';

exports.handler = (event, context, callback) => {
    
    // Messages for single click, double click and long click
    const singleClick = 'CHECK-IN ALERT! Guest in Room 1 has checked in at ';
    const doubleClick = 'CHECK-OUT ALERT! Guest in Room 2 has checked out at ';
    const longClick = 'HELP ALERT! Guest in Room 1 needs help! Help requested at ';
    
    console.log('Received event:', event);
    console.log(`Sending SMS to ${TOPIC_ARN}`);

    var currentTime = new Date();
    // NOTE: all Lambda functions run on UTC

    // Extracts hour, minutes, seconds to transform to local format
    var currentHour = currentTime.getHours();
    var currentMin =  currentTime.getMinutes();
    var currentSec =  currentTime.getSeconds();

    // UTC to local timezone conversion
    var localHour = 0;
    var absLocalTimeZone = 0;

    // Part 1: For timezones UTC-XX
    if (localTimeZone < 0){
        // Get absolute value of timezone difference
        absLocalTimeZone = localTimeZone * (-1);

        if(currentHour >= 0 && currentHour < absLocalTimeZone){
            localHour = currentHour + localTimeZone +24;
        }

        if(currentHour >= absLocalTimeZone && currentHour < 24){
            localHour = currentHour + localTimeZone;
        }
    }
    // Part 2: For timezones UTC+XX
    else if (localTimeZone > 0){
        if(currentHour >= 0 && currentHour < (24 - localTimeZone)){
            localHour = currentHour + localTimeZone;
        }
        if(currentHour >= (24 - localTimeZone) && currentHour < 24){
            localHour = currentHour + localTimeZone - 24;
        }
    }
    // Part 3: For UTC
    else{
        localHour = currentHour;
    }

    // Convert minutes to 2 digits. eg: 5 to 05
    if (currentMin.toString().length == 1) {
            currentMin = "0" + currentMin;
    }

    // Convert seconds to 2 digits. eg: 5 to 05
    if (currentSec.toString().length == 1) {
            currentSec = "0" + currentSec;
    }

    // Construct time in proper format
    var currentLocalTime = localHour + ':' + currentMin + ':' + currentSec;
    
    // Default is single click
    var doorMessage = singleClick + currentLocalTime;
    
    // If button clicked twice
    if(event.clickType == "DOUBLE"){
        doorMessage = doubleClick + currentLocalTime;
    }

    // If button long pressed
    if(event.clickType == "LONG"){
        doorMessage = longClick + currentLocalTime;
    }
    
    // Send notification to all phone numbers and email IDs defined in the SNS Topic
    const params = {
        TopicArn: TOPIC_ARN,
        Message: doorMessage,
    };
    SNS.publish(params, callback);
};