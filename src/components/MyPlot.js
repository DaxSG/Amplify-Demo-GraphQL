import React from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

class MyPlot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            dataEEG1: [],
            dataEEG2: [],
            shapesEEG1: [],
            shapesEEG2: []
        };
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        if (this.props.dataFile !== prevProps.dataFile) {
            this.loadData();
        }
    }

    loadData = () => {
        fetch(this.props.dataFile)
            .then(response => {
                if (!response.ok) {
                    console.log("Error in fetching data");
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                Papa.parse(blob, {
                    download: true,
                    header: true,
                    dynamicTyping: true,
                    trimHeaders: true,
                    skipEmptyLines: true,
                    complete: (result) => {
                        const { data } = result;
                        const plotDataEEG1 = {
                            x: data.map(row => row['Order']),
                            y: data.map(row => row['EEG1']),
                            type: 'scatter',
                            mode: 'lines',
                            name: 'EEG1',
                            line: { color: 'red' }
                        };
                        const plotDataEEG2 = {
                            x: data.map(row => row['Order']),
                            y: data.map(row => row['EEG2']),
                            type: 'scatter',
                            mode: 'lines',
                            name: 'EEG2',
                            line: { color: 'blue' }
                        };

                        let shapesEEG1 = [];
                        let shapesEEG2 = [];

                        data.forEach((row, index) => {
                            if (row.EEG1_abnormality === 1) {
                                if (shapesEEG1.length === 0 || shapesEEG1[shapesEEG1.length - 1].x1 !== row.Order - 1) {
                                    shapesEEG1.push({
                                        type: 'rect',
                                        x0: row.Order,
                                        x1: row.Order,
                                        y0: 0,
                                        y1: 1,
                                        yref: 'paper',
                                        fillcolor: 'red',
                                        opacity: 0.2,
                                        line: {
                                            width: 0
                                        }
                                    });
                                } else {
                                    shapesEEG1[shapesEEG1.length - 1].x1 = row.Order;
                                }
                            }
                            if (row.EEG2_abnormality === 1) {
                                if (shapesEEG2.length === 0 || shapesEEG2[shapesEEG2.length - 1].x1 !== row.Order - 1) {
                                    shapesEEG2.push({
                                        type: 'rect',
                                        x0: row.Order,
                                        x1: row.Order,
                                        y0: 0,
                                        y1: 1,
                                        yref: 'paper',
                                        fillcolor: 'blue',
                                        opacity: 0.2,
                                        line: {
                                            width: 0
                                        }
                                    });
                                } else {
                                    shapesEEG2[shapesEEG2.length - 1].x1 = row.Order;
                                }
                            }
                        });

                        this.setState({ dataEEG1: [plotDataEEG1], dataEEG2: [plotDataEEG2], shapesEEG1, shapesEEG2 });
                    },
                });
            })
            .catch(error => {
                console.error("Error fetching and parsing the data:", error);
            });
    };

    render() {
        return (
            <div>
            <h2>User EEG Data</h2>
            <Plot
                style={{ width: '100%', height: '400px' }}
                data={this.state.dataEEG1}
                layout={{
                    autosize: true,
                    title: 'EEG1 Data Visualization',
                    xaxis: { title: 'Time (s)', autorange: true, tickformat: 's' }, // Specify format if needed
                    yaxis: { title: 'MicroVolts (μV)', automargin: true },
                    margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
                    legend: { orientation: 'h', y: -0.2 },
                    shapes: this.state.shapesEEG1.map(shape => ({...shape, fillcolor: 'red'}))
                }}
                config={{ responsive: true }}
                useResizeHandler={true}
                />
                <Plot
                style={{ width: '100%', height: '400px' }}
                data={this.state.dataEEG2}
                layout={{
                    autosize: true,
                    title: 'EEG2 Data Visualization',
                    xaxis: { title: 'Time (s)', autorange: true, tickformat: 's' }, // Consistent formatting with EEG1
                    yaxis: { title: 'MicroVolts (μV)', automargin: true },
                    margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
                    legend: { orientation: 'h', y: -0.2 },
                    shapes: this.state.shapesEEG2.map(shape => ({...shape, fillcolor: 'blue'}))
                }}
                config={{ responsive: true }}
                useResizeHandler={true}
                />
                </div>

        );
    }
}

export default MyPlot;
