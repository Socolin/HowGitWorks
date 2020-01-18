import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FilesystemNodeComponent } from './filesystem-node.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RepositoryComponent } from './repository.component';
import { GitObjectBlobComponent } from './git-object-blob.component';
import { GitObjectCommitComponent } from './git-object-commit.component';
import { GitObjectTreeComponent } from './git-object-tree.component';
import {MatIconModule, MatTooltipModule} from '@angular/material';
import { GitIndexComponent } from './git-index.component';
import { TerminalComponent } from './terminal.component';

@NgModule({
  declarations: [
    AppComponent,
    FilesystemNodeComponent,
    RepositoryComponent,
    GitObjectBlobComponent,
    GitObjectCommitComponent,
    GitObjectTreeComponent,
    GitIndexComponent,
    TerminalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatTooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
