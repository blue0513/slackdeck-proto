# SlackDeck Proto

This provides the Slack viewer that looks like Tweetedeck.

[![Image from Gyazo](https://i.gyazo.com/0613980a28e63cfcb3a3a194c6d48875.gif)](https://gyazo.com/0613980a28e63cfcb3a3a194c6d48875)

NOTE: As this is a prototype, we do destructive changes from time to time

## Requirements

+ Slack Account
+ Electron: `v5.x` or above

## Quick Start

1. Install [electron](https://electronjs.org/docs/tutorial/installation)
2. Rename `settings.sample.json` to `settings.json`
3. Edit `url` value in `settings.json` like `https://your-private.slack.com/`
4. Run `npm start` in terminal

## Customize

`settings.json` includes all the your settings.
You can edit these variables bellow.

+ **url**: Slack's Web URL like `https://your-private.slack.com/`
+ **channel**: Channel' name like `general`
+ **style**: CSS style for each column
  + `channel-only`: only channel's list showing up
  + `body-only`: only messages showing up
  + `sidebar-only`: only sidebar (contains Threads, Activity etc)  showing up
+ **width**: Width of each column
  + `small-tab`: recommend to use with `channel-only` or `sidebar-only`
  + `large-tab`: recomment to use with `body-only`

## Tips on Use

+ Messages overflow the column
  + use `Cmd + -` to make the font smallers
+ Channel Switch
  + use `Cmd + k` to switch channels
  + NOTE: even the style is `channel-only`, you can't switch channels by pushing buttons

## Contribute

You can use [issues](https://github.com/blue0513/slackdeck-proto/issues) as you like.
Not only suggestions but also questions are welcome!
