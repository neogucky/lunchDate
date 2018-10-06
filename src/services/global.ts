import { Injectable } from '@angular/core';

@Injectable()
export class Global {
  public participantName:String;
  public registeredNewUser: boolean;
  public allowPush: boolean = true; /* Indicates wether the user allows push (only for settings purpose, will be handled with subscriptions */
  public datePool: string; /* The pool of people in the same lunch group */
  public user: any; /* user object */
}