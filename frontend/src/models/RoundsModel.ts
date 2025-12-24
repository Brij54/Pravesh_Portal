class RoundsModelModel {

  private _id: any;

  private _name: any;

  private _startdate: any;

  private _enddate: any;

  private _details: any;

  private _drive_id: any;


  constructor(data: any) {

    this._id = data["id"];

    this._name = data["name"];

    this._startdate = data["startdate"];

    this._enddate = data["enddate"];

    this._details = data["details"];

    this._drive_id = data["drive_id"];

  }


  public getId(): any {
    return this._id;
  }

  public setId(value: any) {
    this._id = value;
  }


  public getName(): any {
    return this._name;
  }

  public setName(value: any) {
    this._name = value;
  }


  public getStartdate(): any {
    return this._startdate;
  }

  public setStartdate(value: any) {
    this._startdate = value;
  }


  public getEnddate(): any {
    return this._enddate;
  }

  public setEnddate(value: any) {
    this._enddate = value;
  }


  public getDetails(): any {
    return this._details;
  }

  public setDetails(value: any) {
    this._details = value;
  }


  public getDrive_id(): any {
    return this._drive_id;
  }

  public setDrive_id(value: any) {
    this._drive_id = value;
  }



  public toJson(): any {
    return {

      "id": this._id,

      "name": this._name,

      "startdate": this._startdate,

      "enddate": this._enddate,

      "details": this._details,

      "drive_id": this._drive_id,

    };
  }

  public static fromJson(json: any): RoundsModelModel {
    return new RoundsModelModel(json);
  }
}

export default RoundsModelModel;
