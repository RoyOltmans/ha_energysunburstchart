class EnergySunburstCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = null;
    this._lastPreparedData = null;
  }

  set hass(hass) {
    if (this._hass !== hass) {
      this._hass = hass;
      if (this._config && this.shadowRoot) {
        if (this.shadowRoot.getElementById("chart")) {
          this._updateChart();
        }
      }
    }
  }

  setConfig(config) {
    if (!config.data) {
      throw new Error("You must define 'data' for the Energy Sunburst chart.");
    }

    this._config = config;

    if (!window.Plotly) {
      const script = document.createElement("script");
      script.src = "/local/plotly.min.js";
      script.type = "text/javascript";
      script.onload = () => this._renderChart();
      script.onerror = () => console.error("Failed to load Plotly.js");
      document.head.appendChild(script);
    } else {
      this._renderChart();
    }
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
        }
        #chart {
          flex: 1;
          width: 100%;
          height: 100%;
        }
        .version-label {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 12px;
          color: gray;
          font-family: Arial, sans-serif;
        }
      </style>
      <div class="sunburst-container">
        <div id="chart"></div>
        <div class="version-label">Version 1.3.1</div>
      </div>
    `;

    const chartContainer = this.shadowRoot.getElementById("chart");
    const data = this._prepareData();

    const layout = {
      margin: { t: 0, l: 0, r: 0, b: 0 },
      uniformtext: { minsize: 10, mode: "hide" },
      paper_bgcolor: "rgba(0,0,0,0)", // Transparent background
      plot_bgcolor: "rgba(0,0,0,0)", // Transparent plot area
      transition: {
        duration: 200,
        easing: "cubic-in-out",
      },
      showlegend: false, // Remove legend
    };

    const config = {
      staticPlot: false,
      scrollZoom: true,
      editable: false,
      displayModeBar: true,
    };

    Plotly.newPlot(chartContainer, data, layout, config);
  }

  _updateChart() {
    const chartContainer = this.shadowRoot.getElementById("chart");
    if (chartContainer) {
      const newData = this._prepareData();
      const layout = {
        margin: { t: 0, l: 0, r: 0, b: 0 },
        uniformtext: { minsize: 10, mode: "hide" },
        paper_bgcolor: "rgba(0,0,0,0)", // Transparent background
        plot_bgcolor: "rgba(0,0,0,0)", // Transparent plot area
        transition: {
          duration: 200,
          easing: "cubic-in-out",
        },
        showlegend: false, // Remove legend
      };

      Plotly.react(chartContainer, newData, layout);
    }
  }

  _prepareData() {
    const { labels, parents, values } = this._config.data;

    // Calculate values proportionally based on parent relationships
    const calculatedValues = [...values];
    const valueMap = {};

    labels.forEach((label, index) => {
      valueMap[label] = values[index];
    });

    parents.forEach((parent, index) => {
      if (parent && valueMap[parent]) {
        const proportion = values[index] / valueMap[parent];
        calculatedValues[index] = proportion * valueMap[parent];
      }
    });

    this._lastPreparedData = [
      {
        type: "sunburst",
        labels,
        parents,
        values: calculatedValues,
        branchvalues: "total",
        textinfo: "label+value+percent", // Display percentages, values, and names inside segments
        insidetexttemplate: "%{label}<br>%{value} kWh<br>%{percentParent:.1%}", // Show value and percentage in correct format
        insidetextorientation: "horizontal", // Ensure labels are inside segments
        hoverinfo: "none", // Disable floating hover labels
        marker: {
          line: {
            width: 0.5, // Thinner border
            color: "#ffffff", // White border color
          },
        },
      },
    ];

    return this._lastPreparedData;
  }

  _generateEnergyColors(labels) {
    // Generate a color palette based on energy categories
    const colors = {
      "Solar": "#FFD700",
      "Wind": "#87CEEB",
      "Grid": "#FF6347",
      "Battery": "#32CD32",
      "Other": "#8A2BE2",
      "Household": "#FFA07A",
      "Lighting": "#FFDAB9",
      "Heating": "#FF4500",
      "Cooling": "#ADD8E6",
    };
    return labels.map(label => colors[label] || "#CCCCCC");
  }

  getCardSize() {
    return 4;
  }
}

customElements.define("energy-sunburst-card", EnergySunburstCard);

// Version 1.3.1: Real energy values are proportionally distributed in parent-child relationships.
