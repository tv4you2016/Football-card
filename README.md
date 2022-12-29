# FootBall Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)




FootBall Cardfor [Home Assistant](https://www.home-assistant.io) Lovelace UI.

![FootBall-card](https://user-images.githubusercontent.com/83761813/209712028-2a522f7b-06ce-4a79-9dd2-44af41d31ded.png)

##   Pre-requisites:

| Plugin | README |
| ------ | ------ |
| Node-Red | https://github.com/hassio-addons/addon-node-red|
| Dark-mode | Select the theme dark-mode in Home-Assistant |

## Installing

### HACS

This card is available in [HACS](https://hacs.xyz) (Home Assistant Community Store).

Just search for `FootBall Card` in HACS `Frontend` tab.

### Manual

1. Download football-card.js` file from the [latest release](https://github.com/tv4you2016/football-card/releases).
2. Put `football-card.js` file into your `config/www` folder.
3. Add a reference to `football-card.js` in Lovelace. There's two way to do that:
   1. **Using UI:** _Configuration_ → _Lovelace Dashboards_ → _Resources_ → Click Plus button → Set _Url_ as `/local/football-card.js` → Set _Resource type_ as `JavaScript Module`.
   2. **Using YAML:** Add the following code to `lovelace` section.
      ```yaml
      resources:
        - url: /local/football-card.js
          type: module
      ```
4. Add `custom:football-card` to Lovelace UI as any other card (using either editor or YAML configuration).

## Using the card

This card can be configured using Lovelace UI editor.


1. In Home Assistant, we create a shell_command and an automation that will run it.
```
shell_command:
  ha_start: 'curl http://localhost:1880/hastart'
  # http://localhost:1880/endpoint/hastart if you're using the Node-RED Community Hass.io Add-on.

automation:
  - alias: homeassistant_start
    trigger:
      - platform: homeassistant
        event: start
    action:
      - service: shell_command.ha_start
```


2. In Node Red, import to the [flow](https://github.com/tv4you2016/football-card/blob/main/flows.json)

3. Lovelace UI add to entrys 

![entrys](https://user-images.githubusercontent.com/83761813/209712512-bb134a52-b772-4c8a-86c5-d352a77e1a6d.PNG)

4. done! 

![done](https://user-images.githubusercontent.com/83761813/209712871-7bdac6df-48f1-4d61-ae2c-c8ab7e3b1ad5.gif)



