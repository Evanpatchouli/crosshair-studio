declare function historyPlugin(): {
  name: string;
  configureServer(server: any): void;
}

export default historyPlugin;