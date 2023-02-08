import React,{Component} from 'react';
import blessed from 'blessed';
import { render } from 'react-blessed';
import { Grid,Log,Donut,GridItem } from 'react-blessed-contrib';


function updateDonut(pct) {
  if (pct > 0.99) pct = 0.00;
  var color = "green";
  if (pct >= 0.25) color = "cyan";
  if (pct >= 0.5) color = "yellow";
  if (pct >= 0.75) color = "red";
  return [{percent: parseFloat((pct+0.00) % 1).toFixed(2), label: 'Mem%', 'color': color}];
}

class App extends Component {
  constructor() {
      super();
      this.state = {
        MemoriaPct: 0.00,
        StatusMonitoramento: '',
        StatusMqtt: '',
        StatusMySQL: '',
      };
    }
    componentDidMount() {
        var os = require('os');
        const { exec } = require('child_process')
        const log = this.refs.log.widget;
        const mqtt = require('mqtt')
        const client = mqtt.connect('mqtt://192.168.18.176:1883')
        client.on('connect', () => {
            client.subscribe(['#'])
        })
        client.on('message', (topic, payload) => {
            log.log('Topico: '+topic+'  Valor: '+payload.toString())
            screen.render()
        })

        setInterval(() => {
          this.setState({ MemoriaPct: ((os.totalmem() - os.freemem()) * 100 / os.totalmem()) / 100 });
       }, 500);

       setInterval(() => {
          exec("systemctl show -p SubState mosquitto | cut -d'=' -f2", (err, output) => {
            if (err) {
              this.setState({ StatusMqtt: 'NULL' });
            }else
            {
              this.setState({ StatusMqtt: output });
            }});
        }, 500);

        setInterval(() => {
          exec("systemctl show -p SubState mariadb | cut -d'=' -f2", (err, output) => {
            if (err) {
              this.setState({ StatusMySQL: 'NULL' });
            }else
            {
              this.setState({ StatusMySQL: output });
            }});
        }, 500);

        setInterval(() => {
          exec("systemctl show -p SubState monitoramento.service | cut -d'=' -f2", (err, output) => {
            if (err) {
              this.setState({ StatusMonitoramento: 'NULL' });
            }else
            {
              this.setState({ StatusMonitoramento: output });
            }});
        }, 500);

    }
  render() {
    return (
      <Grid rows={12} cols={12}>
        <Log ref='log' row={0} col={0} rowSpan={6} colSpan={12} {...{ label: 'Log MQTT' }}/>
        <Donut row={6} col={0} rowSpan={6} colSpan={6} {...{ label: 'Uso Memoria', radius: 14, arcWidth: 4, yPadding: 1, data: updateDonut(this.state.MemoriaPct) }}/>
        <GridItem row={6} col={6} rowSpan={2} colSpan={6} component={'box'} options={{content: this.state.StatusMqtt,label: 'Status Service MQTT'}} />
        <GridItem row={8} col={6} rowSpan={2} colSpan={6} component={'box'} options={{content: this.state.StatusMySQL,label: 'Status Service MySQL'}} />
        <GridItem row={10} col={6} rowSpan={2} colSpan={6} component={'box'} options={{content: this.state.StatusMonitoramento,label: 'Status Service Monit.'}} />
      </Grid>
    );
  }
}

const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  title: 'Monitoramento'
});

screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  return process.exit(0);
});

const component = render(<App />, screen);