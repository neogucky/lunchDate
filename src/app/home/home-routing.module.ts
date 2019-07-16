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
                    loadChildren: '../settings/settings.module#SettingsPageModule'
                  }
                ]
          },
          {
            path: '',
            redirectTo: '/home',
            pathMatch: 'full'
          }
        ]
  },
  {
    path: '',
    redirectTo: '/home',
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
