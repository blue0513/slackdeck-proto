# SlackDeck Proto

This provides the Slack viewer that looks like TweetDeck.

[![Image from Gyazo](https://i.gyazo.com/0613980a28e63cfcb3a3a194c6d48875.gif)](https://gyazo.com/0613980a28e63cfcb3a3a194c6d48875)

NOTE: As this is a prototype, we do destructive changes from time to time

## Features

+ Multiple columns like TweetDeck
+ Multiple workspaces
+ Add/Remove columns by button
+ Selectable CSS styles for each column
+ Customizable settings as JSON

## Requirements

+ Slack Account
+ Electron: `v5.x` or above

## Quick Start

1. Run `npm install` to install packages
2. Rename `settings.json.sample` to `settings.json`
3. Edit `url` value in `settings.json` like `https://your-private.slack.com/`
4. Run `npm start` in terminal

## Customize

`settings.json` includes all the your settings.
You can edit these variables bellow.

+ **url**: Slack's Web URL like `https://your-private.slack.com/`
+ **other_urls**: Other workspaces' URL
+ **channel**: Channel' name like `general`
+ **style**: CSS style for each column
  + `channel-only`: only channel's list showing up
  + `body-only`: only messages showing up
  + `sidebar-only`: only sidebar (contains Threads, Activity etc)  showing up
+ **width**: Width of each column
  + `small-tab`: recommend to use with `channel-only` or `sidebar-only`
  + `large-tab`: recommend to use with `body-only`

## Tips on Use

+ Messages overflow the column
  + use `Cmd + -` to make the font smallers
+ Channel Switch
  + use `Cmd + k` to switch channels
  + NOTE: even the style is `channel-only`, you can't switch channels by pushing buttons
+ Add other workspaces in columns
  + select the workspace in `Workspaces` on menu bar

## Build as Application

### Build for Mac

1. Run `node build-mac.js`
2. In `./dist/mac`, you can fild `slackdeck-proto.app`
3. Copy `settings.json` to the same directory of `slackdeck-proto.app`
4. Double click `slackdeck-proto.app` and start the app!

## Contribute

You can use [issues](https://github.com/blue0513/slackdeck-proto/issues) as you like.
Not only suggestions but also questions are welcome!
