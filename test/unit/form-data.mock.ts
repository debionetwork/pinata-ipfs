export default class NodeFormData {
  data: any;
  _boundary: string = "BOUNDARY";
  
  constructor(){
    this.data = {}
  }

  append(key: string, value: any) {
    this.data[key] = value;  
  }
}