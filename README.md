# HA Energy Sunburst Visualizer

This project provides a custom Home Assistant card that visualizes hierarchical energy data using a Sunburst chart created with Plotly. It helps analyze energy consumption, production, and storage relationships with detailed visual insights.

## Features
- Dynamically generates multi-level Sunburst charts for energy data.
- Displays values and percentages directly within chart segments.
- Offers a clean and modern integration with Home Assistant.
- Customizable color schemes for energy categories.

## Update 2.3.5
 - Added state values as values in the grid, so everything is dynamic and not static
 - Added kWh unit
 - Added transparant background
 - Debug several issues
 - Polished code Fixed following HA styling, transparancy, dark and light theme's

![preview](/images/preview.png)

## Requirements
- **Home Assistant** with Lovelace UI.

## Installation

### 1. Add Plotly as a Local Module
Download and add the Plotly library to your Home Assistant's `www` directory:

```bash
wget https://cdn.plot.ly/plotly-2.35.2.min.js
mv plotly-2.35.2.min.js /config/www/plotly.min.js
```

### 2. Add the Custom Card
Download the custom Sunburst card and place it in the `www` directory of your Home Assistant configuration:

```bash
wget https://raw.githubusercontent.com/RoyOltmans/ha_energysunburstchart/refs/heads/main/energy-sunburst-card.js
mv sunburst-chart-card.js /config/www/energy-sunburst-card.js
```

### 3. Configure Lovelace Resources
Add the custom card as a resource in your `ui-lovelace.yaml` file:

```yaml
resources:
  - url: /local/energy-sunburst-card.js
    type: module
```

### 4. Configure the Card
Add the card to your Home Assistant dashboard with a configuration that suits your energy visualization needs:

```yaml
type: custom:energy-sunburst-card
debug: false
data:
  labels:
    - Total Energy
    - Solar
    - Wind
    - Grid
    - Household
    - Lighting
    - Heating
    - Cooling
    - Battery
  parents:
    - ""
    - Total Energy
    - Total Energy
    - Total Energy
    - Grid
    - Household
    - Household
    - Household
    - Total Energy
  values:
    - 2000
    - 1000
    - 202
    - 304
    - 151
    - 51
    - 51
    - 40
    - 10
  energycolors:
    Solar: "#FFD700"
    Wind: "#87CEEB"
    Grid: "#FF6347"
    Battery: "#32CD32"
    Other: "#8A2BE2"
    Household: "#FFA07A"
    Lighting: "#FFDAB9"
    Heating: "#FF4500"
    Cooling: "#000000"
```

### 4.a Configure the Card advanced card
Add the card to your Home Assistant dashboard with a configuration that suits your energy visualization needs:

```yaml
type: custom:energy-sunburst-card
debug: false
data:
  labels:
    - Total Energy
    - Grid
    - Solar
    - Low Carbon Grid
    - Fossil Feul Grid
  parents:
    - ""
    - Total Energy
    - Total Energy
    - Grid
    - Grid
  values:
    - sensor.total_energy_consumed
    - sensor.consumed_and_produced_energy_grid
    - sensor.solaredge_energy_today_kwh
    - sensor.avarage_low_carbon_energy_grid_consumed
    - sensor.avarage_fossil_feul_energy_grid_consumed
  energycolors:
    Solar: "#FFD700"
    Grid: "#A7C7E0"
    Low Carbon Grid: "#4F9F4E"
    Fossil Feul Grid: "#FF5733"
    Total Energy: "#8AB1C7"
```

## To add the energy sensors I recommend using utility meter as sensor and template sensors

See for utility meter: https://www.home-assistant.io/integrations/utility_meter/ for accurate day measurements.

Example sensor template For total energy Solar plus grid:
```yaml
{{(states('sensor.consumed_and_produced_energy_grid') | float(0,0) ) + (states('sensor.solar_energy_today_kwh') | float)}}
```

Example sensor template for average energy via fossil fuel:
```yaml
{{(states('sensor.consumed_and_produced_energy_grid') | float(0,0)) * (states('sensor.average_grid_fossil_fuel_percentage') | float(0,0) /100)}}
```
IMPORTANT: For an average sensor you will need an extra custom integration https://github.com/Limych/ha-average

Example sensor template for average energy via less-carbon fuel:
```yaml
{{(states('sensor.consumed_and_produced_energy_grid') | float(0,0) - ((states('sensor.consumed_and_produced_energy_grid') | float(0,0)) * (states('sensor.average_grid_fossil_fuel_percentage') | float /100))) | round(2)}}
```
IMPORTANT: For an average sensor you will need an extra custom integration https://github.com/Limych/ha-average

Example sensor template for average energy via less-carbon fuel:
```yaml
{{((((states('sensor.electricity_meter_energy_consumption_tarif_1') | float(0,0)) + (states('sensor.electricity_meter_energy_consumption_tarif_2') | float(0,0))) -
((states('sensor.electricity_meter_energy_production_tarif_1') | float(0,0)) + (states('sensor.electricity_meter_energy_production_tarif_2') | float(0,0))))/1000) | round(2)}}
```
IMPORTANT: To get accurate values you will need to use utility meter for energy consumption and production, because of offsync day measurements.

### 5. Restart Home Assistant

Restart Home Assistant to apply the changes.

## Disclaimer

**Use this tool at your own risk.**  
The authors and contributors of this project are not responsible for any damage, data loss, or issues caused by using this software.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

```
MIT License

Copyright (c) 2025 Roy Oltmans

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Contributions
Contributions are welcome! Please fork the repository and submit a pull request.

## Issues
If you encounter any problems or have suggestions for improvement, please open an issue in this repository.

## Acknowledgments
- [Plotly.js](https://plotly.com/javascript/) for providing the charting library.
- The Home Assistant community for inspiration and support.
