import React from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

class MyPlot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            shapes: [], // Add state for shapes
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
        // Fetch the CSV data from the URL
        fetch(this.props.dataFile)
            .then(response => {
                if (!response.ok) {
                    console.log("Error in fetching data")
                    throw new Error('Network response was not ok');
                }
                //console.log('Fetching data from URL:', this.props.dataFile);
                return response.blob(); // Convert the response to a Blob
            })
            .then(blob => {
                // Now parse the Blob with Papa Parse
                Papa.parse(blob, {
                    download: true,
                    header: true,
                    complete: (result) => {
                        //console.log('Parsed data:', result);
                        const { data } = result;
                        const plotData = ['Channel_1', 'Channel_2', 'Channel_3', 'Channel_4'].map((channel) => ({
                            x: data.map(row => parseFloat(row['Time'])),
                            y: data.map(row => parseFloat(row[channel])),
                            type: 'scatter',
                            mode: 'lines',
                            name: channel,
                        }));
                        
                        const shapes = data.reduce((acc, row, index, arr) => {
                            if (row.Highlighted === '1') {
                                // Check if it's the beginning of a highlighted region or the end of the dataset
                                if (index === 0 || arr[index - 1].Highlighted === '0') {
                                    acc.push({ type: 'rect', x0: row.Time, x1: row.Time, y0: 0, y1: 1, yref: 'paper', fillcolor: 'red', opacity: 0.2, line: { width: 0 } });
                                }
                                // Extend the x1 of the last shape to the current time if we are in a highlighted region
                                acc[acc.length - 1].x1 = row.Time;
                            }
                            return acc;
                        }, []);
    
                        this.setState({ data: plotData, shapes });
                        //console.log(plotData,shapes)
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
                    style={{ width: '100%', height: '100%' }}
                    data={this.state.data}
                    layout={{
                        autosize: true,
                        title: 'EEG Data Visualization',
                        xaxis: { title: 'Time (s)', autorange: true },
                        yaxis: { title: 'Amplitude', automargin: true },
                        margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
                        legend: { orientation: 'h', y: -0.2 },
                        shapes: this.state.shapes, // Include shapes in the layout
                    }}
                    config={{ responsive: true }}
                    useResizeHandler={true}
                />
            </div>
        );
    }
}

export default MyPlot;
