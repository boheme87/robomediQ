'use strict'

const express = require('express')
const Slapp = require('slapp')
const ConvoStore = require('slapp-convo-beepboop')
const Context = require('slapp-context-beepboop')

// use `PORT` env var on Beep Boop - default to 3000 locally
var port = process.env.PORT || 3000

var slapp = Slapp({
  // Beep Boop sets the SLACK_VERIFY_TOKEN env var
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore(),
  context: Context()
})



const HODINN_US_DETECTOR = /^.*(INN-\d+)+.*/gi; //case insensitive (i) and multiple times (g)
const HODINN_DEEP_LINK = "https://humediq.jira.com/browse/";

var userStoryIdentifiersFromMessage = function(message, regexToUse) {
  return regexToUse.exec(message);
};

var formatDeepLink = function(baseUrl, storyIdentifier) {
  return "<" + baseUrl + storyIdentifier + "|" + storyIdentifier + ">";
};

// var userstories = "hello INN-123 I have also INN-6 and INN-123123 ass";
// var messageRegex = HODINN_US_DETECTOR;
// var hodinnmatch = messageRegex.exec(userstories);


//*********************************************
// Setup different handlers for messages
//*********************************************

slapp.message(HODINN_US_DETECTOR, ['ambient'], (msg) => {
  msg.say("Let me help you with that :)");
  var userStories = userStoryIdentifiersFromMessage(msg,HODINN_US_DETECTOR);
    userStories.forEach(story => {
    msg.say("> " + formatDeepLink(HODINN_DEEP_LINK,story));
  })
})


// attach Slapp to express server
var server = slapp.attachToExpress(express())

// start http server
server.listen(port, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log(`Listening on port ${port}`)
})
