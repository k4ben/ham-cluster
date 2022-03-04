const net = require('net');

interface ClusterOptions {
  hostname: string
  port: number
  type?: "rbn"
}

type ClusterEventLabels = "connected" | "spot" | "error";

module.exports = class {
  private sentCall: boolean = false;
  private options: ClusterOptions;
  private handlers = {} as {[key in ClusterEventLabels]: Function};

  /**
   * Creates a new HamCluster instance.
   * 
   * @param callsign Your callsign (for logging into the cluster).
   * @param options Cluster configuration.
   */
  constructor(callsign: string, options: ClusterOptions) {
    this.options = options;
    const client = new net.Socket();
    
    client.on('error', (e: any) => this.trigger("error", e));
    client.connect(this.options.port, this.options.hostname, ()=> {
      this.trigger("connected");
    });

    client.on('data', (data: Buffer | string) => {
      if (this.sentCall) this.interpretLine(data.toString());
      else {
        client.write(callsign + "\n");
        this.sentCall = true;
      }
    });
  }

  private interpretLine(line: string) {
    try {
      if (line.startsWith("DX de")) {
        let lastChar = "";
        let newString = "";
        for (let i = 0; i < line.length; i++) {
          if (lastChar != " " || line[i] != " ") {
            newString += line[i];
          }
          lastChar = line[i];
        }
        const spotArr = newString.split(" ");
        if (spotArr.length < 6) throw "Invalid Spot. Less than 6 segments found.";
        let spotObj = {
          deCall: spotArr[2].includes("#") ? spotArr[2].slice(0, spotArr[2].length - 3) : spotArr[2].slice(0, spotArr[2].length - 1),
          freq: spotArr[3],
          dxCall: spotArr[4],
          time: spotArr[spotArr.length-1].slice(0, 5)
        } as {[key: string]: string};
        if (this.options?.type) {
          spotObj.mode = spotArr[5];
          spotObj.snr = spotArr[6];
          spotObj.wpm = spotArr[8];
          spotObj.type = spotArr[10];
        } else spotObj.comments = line.substring(39, 69).trim();
        this.trigger("spot", spotObj);
      }
    } catch(e) {
      this.trigger("error", e);
    }
  }

  private trigger(label: ClusterEventLabels, args?: any) {
    this.handlers[label]?.(args);
  }

  /**
   * @param label of the event.
   * @param event function that is triggered by the event.
   */
  on(label: ClusterEventLabels, event: Function) {
    this.handlers[label] = event;
  }

  /**
   * @returns cluster hostname.
   */
  public get hostname() {
    return this.options.hostname;
  }

  /**
   * @returns cluster port.
   */
  public get port() {
    return this.options.port;
  }

}