import {Injectable} from '@angular/core';

@Injectable()
export class Global {
  public user: any;
  public registeredNewUser: boolean;
  public offline: boolean;
  public language: string;
  public group: any;

  updateGroup(group, groupID) {
    if (group !== undefined && group.name !== undefined) {
      this.group = group;
    } else {
      this.group = {name: 'none', roles: []};
    }
    this.group.id = groupID;
  }
}
