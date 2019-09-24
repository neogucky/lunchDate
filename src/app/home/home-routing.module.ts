import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
    children:
        [
          {
            path: 'meal',
            children:
                [
                  {
                    path: '',
                    loadChildren: '../meal/meal.module#MealPageModule'
                  }
                ]
          },
          {
            path: 'time',
            children:
                [
                  {
                    path: '',
                    loadChildren: '../time/time.module#TimePageModule'
                  }
                ]
          },
          {
            path: 'settings',
            children:
              [
                {
                  path: '',
                  loadChildren: '../settings/settings.module#SettingsPageModule',
                }
              ]
          },
          {
            path: 'settings/create-group',
            children:
              [
                {
                  path: '',
                  loadChildren: '../settings/create-group/create-group.module#CreateGroupPageModule',
                }
              ]
          },
          {
            path: 'settings/join-group',
            children:
              [
                {
                  path: '',
                  loadChildren: '../settings/join-group/join-group.module#JoinGroupPageModule',
                }
              ]
          },
          {
            path: '',
            redirectTo: '/home/time',
            pathMatch: 'full'
          }
        ]
  },
  {
    path: '',
    redirectTo: '/home/time',
    pathMatch: 'full'
  }
];

@NgModule({
  imports:
      [
        RouterModule.forChild(routes)
      ],
  exports:
      [
        RouterModule
      ]
})
export class HomePageRoutingModule {}
