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
      this._ensurePlotly(() => this._renderChart());
    }
  }

  setConfig(config) {
    if (!config.data) {
      throw new Error("You must define 'data' for the Energy Sunburst chart.");
    }
    this._config = config;
    this._ensurePlotly(() => this._renderChart());
  }

  _ensurePlotly(callback) {
    if (window.Plotly) {
      //console.log("Plotly already loaded.");
      callback();
    } else {
      if (!this._loadingPlotly) {
        this._loadingPlotly = true;
        const script = document.createElement("script");
        script.src = "/local/plotly.min.js";
        script.type = "text/javascript";
        script.onload = () => {
          //console.log("Plotly loaded successfully.");
          this._loadingPlotly = false;
          callback();
        };
        script.onerror = () => {
          //console.error("Failed to load Plotly.js");
          this._loadingPlotly = false;
        };
        document.head.appendChild(script);
      }
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
          overflow: hidden;
          background-color: #f9f9f9;
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
        <div class="version-label">Version 2.2.2</div>
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

    if (!window.Plotly) {
      //console.error("Plotly is not available. Chart rendering skipped.");
      return;
    }

    Plotly.newPlot(chartContainer, data, layout, config).then(() => {
      chartContainer.on("plotly_sunburstclick", (event) => {
        const clickedLabel = event.points[0].label;

        if (this._currentDrilldown === clickedLabel) {
          // Drill back logic: move one level up to the parent or reset at the top level
          const currentIndex = this._config.data.labels.indexOf(clickedLabel);
          const parentLabel = this._config.data.parents[currentIndex] || null;

          if (parentLabel === null) {
            // Reset to top-level view when no parent
            this._currentDrilldown = null;
          } else {
            // Move one level up
            this._currentDrilldown = parentLabel;
          }
        } else {
          // Drill down logic: move to the clicked segment
          this._currentDrilldown = clickedLabel;
        }

        this._updateChart(this._currentDrilldown);
      });
    }).catch((error) => {
      //console.error("Error rendering chart:", error);
    });
  }

  _updateChart(drilldownLabel) {
    //console.log("Drilldown state:", drilldownLabel);

    const chartContainer = this.shadowRoot.getElementById("chart");
    const data = this._prepareData(drilldownLabel);

    const layout = {
      margin: { t: 0, l: 0, r: 0, b: 0 },
      uniformtext: { minsize: 10, mode: "hide" },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      showlegend: false,
      pathbar: { visible: false },
      sunburstcolorway: Object.values(this._generateDefaultEnergyColors()),
    };

    Plotly.react(chartContainer, data, layout).catch((error) => {
      //console.error("Error updating chart:", error);
    });
  }

  _prepareData(drilldownLabel = null) {
    const { labels, parents, values, energycolors } = this._config.data;

    let filteredLabels = [];
    let filteredParents = [];
    let filteredValues = [];
    const colors = energycolors || this._generateDefaultEnergyColors();

    if (drilldownLabel) {
      // Include the drilldownLabel as the center/root
      const rootIndex = labels.indexOf(drilldownLabel);
      filteredLabels.push(labels[rootIndex]);
      filteredParents.push(""); // Root has no parent
      filteredValues.push(values[rootIndex]);

      // Include its direct children and their children
      const childIndices = [];
      labels.forEach((label, index) => {
        if (parents[index] === drilldownLabel) {
          filteredLabels.push(label);
          filteredParents.push(drilldownLabel);
          filteredValues.push(values[index]);
          childIndices.push(index);
        }
      });

      // Add grandchildren (second-level children of drilldownLabel)
      childIndices.forEach((childIndex) => {
        labels.forEach((label, index) => {
          if (parents[index] === labels[childIndex]) {
            filteredLabels.push(label);
            filteredParents.push(labels[childIndex]);
            filteredValues.push(values[index]);
          }
        });
      });
    } else {
      // No drilldownLabel means show the entire dataset (top-level view)
      filteredLabels = labels;
      filteredParents = parents;
      filteredValues = values;
    }

    const segmentColors = filteredLabels.map((label) => colors[label] || "#CCCCCC");

    return [
      {
        type: "sunburst",
        labels: filteredLabels,
        parents: filteredParents,
        values: filteredValues,
        branchvalues: "total",
        textinfo: "label+value+percent",
        insidetexttemplate: "%{label}<br>%{value} kWh<br>%{percentParent:.1%}",
        marker: {
          colors: segmentColors,
        },
        hoverinfo: "skip",
      },
    ];
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

  getCardSize() {
    return 4;
  }
}

customElements.define("energy-sunburst-card", EnergySunburstCard);