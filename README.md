# SlackDeck Proto

![](https://img.shields.io/badge/SlackDeck-Proto-blue)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/blue0513/slackdeck-proto)
![GitHub All Releases](https://img.shields.io/github/downloads/blue0513/slackdeck-proto/total?color=blue)
![](https://github.com/blue0513/slackdeck-proto/workflows/eslint/badge.svg)
![](https://github.com/blue0513/slackdeck-proto/workflows/jest/badge.svg)

This provides the Slack viewer that looks like TweetDeck.

[![Image from Gyazo](https://i.gyazo.com/0613980a28e63cfcb3a3a194c6d48875.gif)](https://gyazo.com/0613980a28e63cfcb3a3a194c6d48875)

NOTE: As this is a prototype, we do destructive changes from time to time

## Releases

You can download the application [here](https://github.com/blue0513/slackdeck-proto/releases).

+ [v0.15.0](https://github.com/blue0513/slackdeck-proto/releases/tag/0.15.0): Update Style for new Slack UI
+ [v0.14.0](https://github.com/blue0513/slackdeck-proto/releases/tag/0.14.0): Jump the message via link & Fix bugs
+ [v0.13.0](https://github.com/blue0513/slackdeck-proto/releases/tag/0.13.0): Application distribution for macOS & Windows
+ [v0.12.0](https://github.com/blue0513/slackdeck-proto/releases/tag/0.12.0): Fix Channel Settings: adjusted for new slack's URL
+ [v0.11.0](https://github.com/blue0513/slackdeck-proto/releases/tag/0.11.0): Fix Style: adjusted for new slack's css style
+ [v0.10.1](https://github.com/blue0513/slackdeck-proto/releases/tag/0.10.1): Update for security reason
+ [v0.10.0](https://github.com/blue0513/slackdeck-proto/releases/tag/0.10.0): Application distribution for macOS

## Features

+ Multiple columns like TweetDeck
+ Multiple workspaces
+ Add/Remove columns by button
+ Selectable CSS styles for each column
+ Customizable settings as JSON
+ Settings are saved and persisted

## Requirements

+ Slack Account
+ Electron: `v5.x` or above

## Quick Start

1. Run `npm install` to install packages
2. Rename `settings.json.sample` to `settings.json`
3. Edit `url` value in `settings.json` like `https://your-private.slack.com/`
4. Run `npm start` in terminal
5. Import `settings.json`

## Customize

`settings.json` includes all the your settings.
You can edit these variables bellow.

+ **url**: Slack's Web URL like `https://your-private.slack.com/`
+ **other_urls**: Other workspaces' URL
+ **channel_id**: Channel's ID. You can get it by ...
  + Open Slack for web. Then go to the channel. The URL's last word is ID
  + Open Slack for desktop. Then right click & `copy link` on the channel-list.
+ **style**: CSS style for each column
  + `channel-only`: only channel's list showing up
  + `body-only`: only messages showing up
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
+ Jump to the message via link
  + Input URL in `Message URL` on menubar
+ Reset settings
  + click `Settings` on menu bar

## Build as Application

### Build for Mac

1. Run `node build/build-mac.js`
2. In `./dist/mac`, you can find `slackdeck-proto.app`
3. Double click `slackdeck-proto.app` and start the app
4. Import `settings.json`

### Build for Windows

1. Run `node build/build-win.js`
2. In `./dist/`, you can find `slackdeck-proto Setup.exe`
3. Double click `slackdeck-proto Setup.exe` and start the app
4. Import `settings.json`

## Contribute

You can use [issues](https://github.com/blue0513/slackdeck-proto/issues) as you like.
Not only suggestions but also questions are welcome!
