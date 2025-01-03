function sealed(ctor: any) {
  Object.seal(ctor);
  Object.seal(ctor.prototype);
}

@sealed
export class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}
