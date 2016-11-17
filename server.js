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

const HODINN_US_DETECTOR = /([A-Za-z]+\-[1-9][0-9]*)/gi; //case insensitive (i) and multiple times (g)
const HODINN_DEEP_LINK = "https://humediq.jira.com/browse/";

var userStoryIdentifiersFromMessage = function(message, regexToUse) {
  var matches = [];
  var match = null;
  while ((match = regexToUse.exec( message )) != null)
    {
      matches.push(match[0]);
    };
  return matches;

};

var formatDeepLink = function(baseUrl, storyIdentifier) {
  return "<" + baseUrl + storyIdentifier + "|" + storyIdentifier + ">";
};

//*********************************************
// Setup different handlers for messages
//*********************************************
// /^.*(INN-\d+).*/i
slapp.message(/^.*([A-Za-z]+\-[1-9][0-9]*).*/i, ['ambient'], (msg,text) => {
   msg.say("Let me help you with that :)")
  var allUSLinks = "";
  var word = "Issue";
  var userStories = userStoryIdentifiersFromMessage(text,HODINN_US_DETECTOR);
    userStories.forEach(story => {
      if (allUSLinks.length > 0) { word = "Issues"; allUSLinks = allUSLinks.concat(", ");}
      allUSLinks = allUSLinks.concat(formatDeepLink(HODINN_DEEP_LINK,story));
    });
  msg.say("> " + word + ": " + allUSLinks);
});

slapp.message('introduce', ['direct_mention', 'direct_message'], (msg) => {
    msg.say("Hey, I am your new colleague robomediQ and I can help you with deep-linking Jira issues.")
})

slapp.message('.*', ['direct_mention', 'direct_message'], (msg) => {
  msg.say([':wave:', ':pray:', ':raised_hands:'])
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
