# Fronius Auth Proxy

This serves as a proxy for requests to your Fronius inverter.

The local REST API is read-only, and some features are not available via the modbus interface. This allows to perform requests to a Fronius inverter without handling their HTTP digest mechanism.

## Notes

- I am not responsable of the usage of this code, be careful while using it.

- This uses a currently unmaintained library to generate the HTTP digest headers. It is the same one that the Fronius web UI uses, and I have not been able to make any other work with their system.

- Fronius might release a firmware update that breaks this functionallity [as they did before](http://solcellforum.207.s1.nabble.com/Set-Fronius-Dynamic-power-reduction-using-a-script-td5017239.html#a5017251)

- The code might not be the cleanest one you'll find on the Internet :)

## Motivation

I want dinamically control to be able to control how much energy does a Fronius inverter serves to the electricity network of my provider.

## Requirements

```
podman - Although it will work with other tools as Docker, but this guide follows the procedure with Podman.
```

## Usage

0. Clone this repo

```
git clone https://github.com/sergioperez/fronius-auth-proxy.git
```

1. Build the container image

```
podman build . -t localhost/fronius-auth-proxy:latest
```

2. Run it alongside your Home Assistant installation

```
podman run -p 127.0.0.1:30072:3000 localhost/fronius-auth-proxy:latest
```

3. (OPTIONAL) Test changing values from `http://yourFroniusIp/#/settings/evu` with curl (Replace `EXPORT_POWER_LIMIT`, `SYSTEM_TOTAL_POWER`, `SERVICE_USER_PASSWORD`, `FRONIUS_IP`. Check the output and if this was changed in your system (remember to refresh the page).

```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "powerLimits": {
      "exportLimits": {
        "activePower": {
          "hardLimit": {
            "enabled": false,
            "powerLimit": 0
          },
          "mode": "entireSystem",
          "softLimit": {
            "enabled": true,
            "powerLimit": EXPORT_POWER_LIMIT
          }
        },
        "failSafeModeEnabled": false
      },
      "visualization": {
        "exportLimits": {
          "activePower": {
            "displayModeHardLimit": "absolute",
            "displayModeSoftLimit": "absolute"
          }
        },
        "wattPeakReferenceValue": SYSTEM_TOTAL_POWER
      }
    }
  }' \
  "http://localhost:30072/request?username=service&password=SERVICE_USER_PASSWORD%&port=80&hostname=FRONUS_IP&path=/config/exportlimit/?method=save"
```

4. Run it as a container, and create a systemd unit 

```
podman create --name fronius-auth-proxy localhost/fronius-auth-proxy:latest
podman generate systemd --restart-policy=always -t 1 fronius-auth-proxy >> /etc/systemd/system/fronius-auth-proxy.service
systemctl enable --now fronius-auth-proxy
```

5. Add a custom input to Home Assistant via configuration.yaml

```
input_number:
  fronius_soft_limit:
    name: "Fronius soft limit"
    initial: 4000
    min: 150
    max: 4000
    step: 50

rest_command:
  fronius_soft_limit:
    url: "http://localhost:30072/request?username=service&password=FRONIUS_SERVICE_PASSWORD&port=80&hostname=FRONIUS_IP&path=/config/exportlimit/?method=save"
    method: POST
    content_type: application/json  # Specify the content type
    payload: >
      {
        "powerLimits": {
          "exportLimits": {
            "activePower": {
              "hardLimit": {
                "enabled": false,
                "powerLimit": 0
              },
              "mode": "entireSystem",
              "softLimit": {
                "enabled": true,
                "powerLimit": {{ states('input_number.fronius_soft_limit') | int }}
              }
            },
            "failSafeModeEnabled": false
          },
          "visualization": {
            "exportLimits": {
              "activePower": {
                "displayModeHardLimit": "absolute",
                "displayModeSoftLimit": "absolute"
              }
            },
            "wattPeakReferenceValue": MAX_SYSTEM_POWER
          }
        }
      }
```

6. Test the integration from your HomeAssistant :)

