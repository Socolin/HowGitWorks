import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FilesystemNodeComponent} from './filesystem-node.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RepositoryComponent} from './repository.component';
import {GitObjectBlobComponent} from './git-object-blob.component';
import {GitObjectCommitComponent} from './git-object-commit.component';
import {GitObjectTreeComponent} from './git-object-tree.component';
import {MatIconModule, MatTooltipModule} from '@angular/material';
import {GitIndexComponent} from './git-index.component';
import {TerminalComponent} from './terminal.component';
import {AppConfigService} from './app-config.service';
import {GitHashPipe} from './git-hash.pipe';
import {GitHashFormatter} from './utils/git-hash-formatter';
import {GitModeUtil} from './git/utils/git-mode-util';
import {GitObjectUtil} from './git/utils/git-object-util';
import {GitBranchUtil} from './git/utils/git-branch-util';
import {GitTreeUtil} from './git/utils/git-tree-util';
import {GitIndexUtil} from './git/utils/git-index-util';
import {GitDiffTreeUtil} from './git/utils/git-diff-tree-util';

@NgModule({
  declarations: [
    AppComponent,
    FilesystemNodeComponent,
    RepositoryComponent,
    GitObjectBlobComponent,
    GitObjectCommitComponent,
    GitObjectTreeComponent,
    GitIndexComponent,
    TerminalComponent,
    GitHashPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatTooltipModule
  ],
  providers: [
    AppConfigService,
    GitHashFormatter,

    GitModeUtil,
    GitObjectUtil,
    GitBranchUtil,
    GitTreeUtil,
    GitIndexUtil,
    GitDiffTreeUtil,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
