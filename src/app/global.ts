import {Injectable} from '@angular/core';

@Injectable()
export class Global {
  public user: any;
  public registeredNewUser: boolean;
  public offline: boolean;
  public language: string;
  public group: any;
}