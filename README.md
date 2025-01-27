# HA Energy Sunburst Visualizer

This project provides a custom Home Assistant card that visualizes hierarchical energy data using a Sunburst chart created with Plotly. It helps analyze energy consumption, production, and storage relationships with detailed visual insights.

## Features
- Dynamically generates multi-level Sunburst charts for energy data.
- Displays values and percentages directly within chart segments.
- Offers a clean and modern integration with Home Assistant.
- Customizable color schemes for energy categories.

![preview](https://raw.githubusercontent.com/RoyOltmans/ha_sunburstchart/refs/heads/main/sunburst.png)

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
wget https://raw.githubusercontent.com/RoyOltmans/ha_sunburstchart/refs/heads/main/sunburst-chart-card.js
mv sunburst-chart-card.js /config/www/sunburst-chart-card.js
```

### 3. Configure Lovelace Resources
Add the custom card as a resource in your `ui-lovelace.yaml` file:

```yaml
resources:
  - url: /local/sunburst-chart-card.js
    type: module
```

### 4. Configure the Card
Add the card to your Home Assistant dashboard with a configuration that suits your energy visualization needs:

```yaml
type: custom:energy-sunburst-card
data:
  labels: ["Total Energy", "Solar", "Wind", "Grid", "Household", "Lighting", "Heating"]
  parents: ["", "Total Energy", "Total Energy", "Total Energy", "Grid", "Household", "Household"]
  values: [100, 40, 20, 30, 10, 6, 4]

OR

type: custom:energy-sunburst-card
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
    - 1010
    - 402
    - 202
    - 304
    - 151
    - 51
    - 51
    - 40
    - 10

```

### 5. Restart Home Assistant
Restart Home Assistant to apply the changes:

```bash
ha core restart
```

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
