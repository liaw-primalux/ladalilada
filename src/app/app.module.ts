import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from 'src/environments/environment';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { SorterComponent } from './sorter/sorter.component';

const routes: Routes = [
  { path: ':id', component: SorterComponent },
  { path: '', component: SorterComponent },

];

@NgModule({
  declarations: [
    AppComponent,
    SorterComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, { anchorScrolling: 'enabled' }),
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideClientHydration(withEventReplay()),
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
