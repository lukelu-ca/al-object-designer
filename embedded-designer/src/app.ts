const vscode = (window as any).vscode;
const panelMode = (window as any).panelMode;
const objectInfo = (window as any).objectInfo;
const vsSettings = (window as any).vsSettings;
import { observable } from 'aurelia-framework';

export class App {

  data: Array<any> = [];
  results: Array<any> = [];
  query: string = "";
  activeType: string = "";
  count: number = 0;
  loaded: boolean = false;

  mode: string;
  customLinks: Array<any> = [];
  events: Array<any> = [];
  showEvents: boolean = false;
  headerType: string = 'object';

  vsSettings: any;

  @observable
  objectInfo: any;

  @observable
  currentProject: boolean;

  @observable
  showMenu: boolean = false;

  @observable
  selectedObject: any;

  @observable
  hoverObject: any;

  dragOptions: any;

  constructor() {
    
  }

  attached() {
    this.mode = panelMode;
    this.objectInfo = objectInfo;
    this.activeType = "";
    this.currentProject = false;
    this.vsSettings = vsSettings;
    
    window.addEventListener('message', event => {
      this.loaded = false;
      const message = event.data; // The JSON data our extension sent

      switch (message.command) {
        case 'data':
          this.data = message.data;
          this.customLinks = message.customLinks;
          this.events = message.events;
          this.loaded = true;
          this.filterType("");
          break;
        case 'designer':
          this.objectInfo = message.objectInfo;
          break;
      }

      this.loaded = true;
    });

    window.addEventListener('field-onmove', (event: any) => {
      let message = Object.assign({}, this.objectInfo);
      message.SourceCodeAnchor = event.detail.anchor;
      message.SourceCodeAnchorInfo = event.detail;
      this.sendCommand(message, 'MoveSource');
    });

    window.addEventListener('field-onclick', (event: any) => {
      let message = Object.assign({}, this.objectInfo);
      message.SourceCodeAnchorInfo = event.detail;
      this.sendCommand(message, 'SelectSource');
    });

    if (this.loaded !== true) {
      this.refreshDesigner();
    }
  }

  search(newQuery?: string) {
    if (newQuery && newQuery != "") {
      this.query = newQuery;
    }

    let source = this.showEvents === true ? this.events : this.data;

    this.results = source
      .filter(f =>
        (this.activeType != "" ? f.Type == this.activeType : true)
        &&
        (this.currentProject == true ? f.FsPath != "" : true)
        &&
        (f.Id.toString().indexOf(this.query.toLowerCase()) != -1
          || f.Publisher.toLowerCase().indexOf(this.query.toLowerCase()) != -1
          || f.Version.toLowerCase().indexOf(this.query.toLowerCase()) != -1
          || this.searchParts(this.query, `${f.Type}${f.Id}`) == true
          || this.searchParts(this.query, this.showEvents ? `${f.Name} ${f.FieldName != '' ? f.FieldName+' ' : ''}${f.EventName}` : f.Name) == true)
      );

    this.count = this.results.length;
  }

  filterType(type, reset?) {
    if (type == "") {
      this.activeType = "";
      if (reset === true || this.currentProject)
        this.query = "";
      this.search("");
    } else {
      this.activeType = type;
      this.search("");
    }

    if (this.query != "") {
      this.search();
    }

    this.count = this.results.length;
  }

  sendCommand(element, command, additionalCommands?: any) {
    let name = element.Name;
    let type = element.Type;
    let id = element.Id;

    if (command == 'Run' && element.TargetObject) {
      let parent = this.data.filter(f => f.Type == type.replace('Extension', '').replace('Customization', '') && f.Name == element.TargetObject);
      if (parent.length > 0) {
        name = element.Name;
        type = element.Type.replace('Extension', '');
        id = parent[0].Id;
      }
    }

    this.showMenu = false;

    let message = {
      Type: type,
      Id: id,
      Name: name,
      FsPath: element.FsPath,
      Command: command,
      EventData: element
    };

    let messages = [message];

    if (additionalCommands) {
      messages = messages.concat(additionalCommands);
    }

    vscode.postMessage(messages);
  }

  searchParts(searchString: string, what: string) {
    let search: any = new RegExp(searchString, "gi"); // one-word searching

    // multiple search words
    if (searchString.indexOf(' ') != -1) {
      search = "";
      var words = searchString.split(" ");

      for (var i = 0; i < words.length; i++) {
        search += "(?=.*" + words[i] + ")";
      }

      search = new RegExp(search + ".+", "gi");

    }

    return search.test(what) == true;
  }

  selectRow(elem, target) {
    if (this.selectedObject == elem) {
      return;
    }

    console.log(target.tagName);

    this.showMenu = target.tagName.toLowerCase() == "a" && target.className.indexOf("context-menu-btn") != -1;
    this.selectedObject = elem;
  }

  setContextBtnVisible(elem) {
    if (elem == null || elem == this.selectedObject) {
      this.hoverObject = {};
      return;
    }

    this.hoverObject = elem;
  }

  setContextMenuVisible() {
    this.showMenu = !this.showMenu;
  }

  setEventsView() {
    this.showEvents = !this.showEvents;
    this.headerType = this.showEvents ? 'event' : 'object';
    this.search();
  }

  setCurrentProjectFilter() {
    this.currentProject = !this.currentProject;
    this.search('');
  }

  showAll() {
    this.currentProject = false;
    this.filterType('');
  }

  addNewObject(type) {
    this.sendCommand({ Type: type }, 'NewEmpty');
  }

  addNewCustomObject(link) {
    this.sendCommand({ FsPath: link.path }, 'NewCustomSnippet');
  }

  refreshDesigner() {
    this.loaded = false;
    this.sendCommand({}, 'Refresh');
  }

  openPageDesigner(element) {
    this.sendCommand(element, 'Design');
  }

  showEventParams(element) {
    this.sendCommand(element, 'CopyEvent');
  }

  designerFieldOnClick(event) {
    console.log(event);
  }
}
