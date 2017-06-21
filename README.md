# iot-button-notifications
This is an AWS Lambda function to be used in association with an [AWS IoT button](https://aws.amazon.com/iotbutton/). It configures the IoT button to send customized email and text messages using the Amazon Simple Notification Service (SNS).

### How to use

1. Download the `iot_button_notifications.js` file
2. Copy and paste the entire code in your Lambda function on the AWS console, and make the following three changes-
  a. Find `const TOPIC_ARN` in the code and replace the existing ARN text string with your SNS topic ARN
  
    b. Find `var localTimeZone` in the code and enter the UTC time offset of your local time zone.
  
    c. Find `var emailSubject` in the code and edit the message if you prefer a different subject for your notification emails.
  
This code can also be modified and used for other use-cases involving the AWS IoT button.
