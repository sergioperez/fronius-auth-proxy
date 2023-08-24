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
            "powerLimit": 4000
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
        "wattPeakReferenceValue": 4000
      }
    }
  }' \
  "http://localhost:30072/request?username=myuser&password=mypass%&port=80&hostname=192.168.10.10&path=/config/exportlimit/?method=save"

