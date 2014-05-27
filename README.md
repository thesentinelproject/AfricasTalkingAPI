Sentinel Project's consumper for Africa's Talking API Make sure that a Config file exists for the API along with the following params:

A HEADER: ApiKey, whose value you shall set to your api key string generated earlier. A GET parameter: username, whose value is you account username. A GET parameter: lastReceivedId, whose value is the id of the message that you last processed. If this is your first call, pass in 0 A HEADER: Accept, whose value shall indicate the media type you would like for the server response. You may specify application/xml or application/json, the default being application/xml.

More Doc: http://api.africastalking.com/version1/messaging
Based upon: https://github.com/madhums/node-express-mongoose-demo
