class EnergySunburstCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = null;
    this._currentDrilldown = null; // Track drilldown state
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) {
      this._updateDynamicValues();
      this._ensurePlotly(() => this._renderChart());
    }
  }

  setConfig(config) {
    if (!config.data) {
      throw new Error("You must define 'data' for the Energy Sunburst chart.");
    }
    this._config = config;
    this._debug = config.debug || false; // Enable debug mode if 'debug' is true

    this._ensurePlotly(() => this._renderChart());
  }

  _updateDynamicValues() {
    if (!this._config || !this._hass) return;

    let updatedConfig = JSON.parse(JSON.stringify(this._config));

    updatedConfig.data.values = updatedConfig.data.values.map(value => {
        if (typeof value === "string" && value.startsWith("sensor.")) {
            const sensorState = this._hass.states[value]?.state;
            
            if (this._debug) console.log(`Fetching value for ${value}:`, sensorState);

            if (sensorState === undefined || sensorState === null) {
                if (this._debug) console.warn(`Sensor ${value} is not available in Home Assistant.`);
                return 0.00; // Fallback to 0.00 if sensor is unavailable
            }

            const numericValue = parseFloat(sensorState);
            
            if (isNaN(numericValue)) {
                if (this._debug) console.warn(`Sensor ${value} returned non-numeric value:`, sensorState);
                return 0.00;
            }

            return Number(numericValue.toFixed(2)); // Ensure two decimal places as a number
        }
        return value;
    });

    this._config = { ...this._config, data: { ...this._config.data, values: updatedConfig.data.values } };
  }

  _ensurePlotly(callback) {
    if (window.Plotly) {
      callback();
    } else {
      if (!this._loadingPlotly) {
        this._loadingPlotly = true;
        const script = document.createElement("script");
        script.src = "/local/plotly.min.js";
        script.type = "text/javascript";
        script.onload = () => {
          this._loadingPlotly = false;
          callback();
        };
        script.onerror = () => {
          this._loadingPlotly = false;
        };
        document.head.appendChild(script);
      }
    }
  }

  _updateChart(drilldownLabel) {
    const chartContainer = this.shadowRoot.getElementById("chart");
    const data = this._prepareData(drilldownLabel);

    const layout = {
      margin: { t: 0, l: 0, r: 0, b: 0 },
      uniformtext: { minsize: 10, mode: "hide" },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
	  transition: {
        duration: 200,
        easing: "cubic-in-out",
      },
      showlegend: false,
      pathbar: { visible: false },
      sunburstcolorway: Object.values(this._generateDefaultEnergyColors()),
    };
	console.log("Plotly Data:", data);
    Plotly.react(chartContainer, data, layout);
  }

  _generateDefaultEnergyColors() {
    return {
      Solar: "#FFD700",
      Wind: "#87CEEB",
      Grid: "#FF6347",
      Battery: "#32CD32",
      Other: "#8A2BE2",
      Household: "#FFA07A",
      Lighting: "#FFDAB9",
      Heating: "#FF4500",
      Cooling: "#ADD8E6",
    };
  }

  _prepareData(drilldownLabel = null) {
    const { labels, parents, values, energycolors } = this._config.data;
    const colors = energycolors || this._generateDefaultEnergyColors();

    let filteredLabels = [];
    let filteredParents = [];
    let filteredValues = [];

    if (drilldownLabel) {
      const rootIndex = labels.indexOf(drilldownLabel);
      filteredLabels.push(labels[rootIndex]);
      filteredParents.push("");
      filteredValues.push(parseFloat(values[rootIndex]));

      labels.forEach((label, index) => {
        if (parents[index] === drilldownLabel) {
          filteredLabels.push(label);
          filteredParents.push(drilldownLabel);
          filteredValues.push(parseFloat(values[index]));
        }
      });
    } else {
      filteredLabels = labels;
      filteredParents = parents;
      filteredValues = values.map(value => parseFloat(value));
    }

    if (this._debug) {
      console.log("Processed Plotly Data:", {
        labels: filteredLabels,
        parents: filteredParents,
        values: filteredValues
      });
    }

    return [{
      type: "sunburst",
      labels: filteredLabels,
      parents: filteredParents,
      values: filteredValues,
      branchvalues: "total",
      textinfo: "label+text+percent",
      text: filteredValues.map(value => `${value.toFixed(2)} kWh`), // Append "kWh"
      insidetexttemplate: "%{label}<br>%{text}<br>%{percentParent:.1%}",
      marker: { 
		colors: filteredLabels.map(label => colors[label] || "#CCCCCC") ,
        line: {
          width: 0.5, // Thinner border
          color: "#ffffff", // White border color
        },
      },
      hoverinfo: "label+text",
    }];
  }

  _renderChart() {
    if (!this._config) return;

    this.shadowRoot.innerHTML = `
      <style>
        .sunburst-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          background-color: transparent;
          border-radius: 12px;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }

        #chart {
          flex: 1;
          max-width: 100%;
          max-height: 100%;
          margin: 10px;
        }

        .version-label {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 12px;
          color: #888;
          font-family: Arial, sans-serif;
          opacity: 0.8;
          background: rgba(255, 255, 255, 0.7);
          padding: 2px 6px;
          border-radius: 4px;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .version-label:hover {
          opacity: 1;
        }
      </style>
      <div class="sunburst-container">
        <div id="chart"></div>
        <div class="version-label">Version 2.3.4</div>
      </div>
    `;

    const chartContainer = this.shadowRoot.getElementById("chart");
    const data = this._prepareData(this._currentDrilldown);

    const layout = {
      margin: { t: 0, l: 0, r: 0, b: 0 },
      uniformtext: { minsize: 10, mode: "hide" },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      showlegend: false,
      pathbar: { visible: false },
      sunburstcolorway: Object.values(this._generateDefaultEnergyColors()),
    };

    const config = {
      staticPlot: false,
      scrollZoom: true,
      editable: false,
      displayModeBar: true,
    };

    if (!window.Plotly) return;

    Plotly.newPlot(chartContainer, data, layout, config).then(() => {
      chartContainer.on("plotly_sunburstclick", (event) => {
        const clickedLabel = event.points[0].label;
        this._currentDrilldown = this._currentDrilldown === clickedLabel ? null : clickedLabel;
        this._updateChart(this._currentDrilldown);
      });
    });
  }
}

customElements.define("energy-sunburst-card", EnergySunburstCard);
