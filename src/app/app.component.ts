import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ShellExecutor} from './shell-executor';
import {Terminal} from './utils/terminal';
import {CommandParser} from './utils/command-parser';
import {Subscription} from 'rxjs';
import {GitExecutor} from './git/git-executor';
import {Context} from './models/context';
import {MkdirExecutor} from './basic-commands/mkdir-executor';
import {EchoExecutor} from './basic-commands/echo-executor';
import {FileSystemUtil} from './utils/file-system-util';
import {CdExecutor} from './basic-commands/cd-executor';
import {LsExecutor} from './basic-commands/ls-executor';
import {CatExecutor} from './basic-commands/cat-executor';
import {GitObjectUtil} from './git/utils/git-object-util';
import {GitCommitObject} from './git/objects/git-commit-object';
import {SaveExecutor} from './basic-commands/save-executor';
import {LoadExecutor} from './basic-commands/load-executor';
import {ContextSerializer} from './utils/context-serializer';
import {ContextDeserializer} from './utils/context-deserializer';
import {InitExecutor} from './basic-commands/init-executor';
import {GitBranchUtil} from './git/utils/git-branch-util';
import {HighlightService} from './highlight-service';
import {GitModeUtil} from './git/utils/git-mode-util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', './object-highlightable.scss'],
  providers: [
    ShellExecutor,
    Terminal,
    CommandParser,
    GitExecutor,
    MkdirExecutor,
    EchoExecutor,
    Context,
    FileSystemUtil,
    CdExecutor,
    LsExecutor,
    CatExecutor,
    ContextSerializer,
    ContextDeserializer,
    InitExecutor,
    SaveExecutor,
    LoadExecutor,

    HighlightService
  ]
})
export class AppComponent implements OnInit {
  constructor(
    private readonly terminal: Terminal,
    private readonly contextDeserializer: ContextDeserializer,
    public readonly context: Context,
    public readonly gitBranchUtil: GitBranchUtil,
    public readonly gitObjectUtil: GitObjectUtil,
    public readonly highlightService: HighlightService,
  ) {
  }


  ngOnInit(): void {
    const lastContextName = localStorage.getItem('lastContext');
    if (lastContextName) {
      const data = localStorage.getItem('savedContext:' + lastContextName);
      if (data === null) {
        this.terminal.writeError(`Context ${lastContextName} not found`);
      }

      const loadedContext = this.contextDeserializer.deserialize(data);
      this.context.repository = loadedContext.repository;
      this.context.workingDirectory = loadedContext.workingDirectory;
      this.context.root = loadedContext.root;
      this.terminal.write('Context loaded: ' + lastContextName + ' To reset to an init state, type `init`');

    }
  }

  getHistory(): GitCommitObject[] {
    const history = [];
    const currentBranch = this.gitBranchUtil.getActiveBranch(this.context.repository);
    let currentHash = currentBranch ? this.context.repository.refs.heads[currentBranch] : this.context.repository.HEAD;
    while (currentHash) {
      try {
        const commitObject = this.gitObjectUtil.getCommit(this.context.repository, currentHash);
        history.push(commitObject);
        // FIXME: handle merge
        currentHash = commitObject.parents[0];
      } catch (e) {
        console.log(e.message);
        currentHash = undefined;
      }
    }
    return history;
  }
}
