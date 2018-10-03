import { Injectable } from '@angular/core';

@Injectable()
export class Global {
  public participantName:String;
  public registeredNewUser: boolean;
  public allowPush: boolean = true;
}