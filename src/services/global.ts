import { Injectable } from '@angular/core';

@Injectable()
export class Global {
  public user:any;
  public registeredNewUser: boolean;
  public datePool: string; /* The pool of people in the same lunch group */
}