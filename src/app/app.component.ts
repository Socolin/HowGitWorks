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
import {IGitObject} from './git/objects/git-object';
import {GitBranchUtil} from './git/utils/git-branch-util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
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
    GitObjectUtil,
    ContextSerializer,
    ContextDeserializer,
    InitExecutor,
    SaveExecutor,
    LoadExecutor,
    GitBranchUtil
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  @ViewChild('terminalOutput', {static: true})
  private terminalOutput: ElementRef;
  public expandedFile: { [path: string]: boolean } = {};
  public highlightedObject?: string;

  constructor(
    private readonly shellExecutor: ShellExecutor,
    private readonly terminal: Terminal,
    private readonly contextDeserializer: ContextDeserializer,
    public readonly context: Context,
    public readonly gitBranchUtil: GitBranchUtil,
  ) {
  }

  execute(command: string) {
    this.terminal.write('$ ' + command);
    const result = this.shellExecutor.execute(command);
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
    this.subscription.add(this.terminal.onLineWrite.subscribe(() => {
      setTimeout(() => {
        this.terminalOutput.nativeElement.scrollTop = this.terminalOutput.nativeElement.scrollHeight;
      }, 0);
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getHistory(): GitCommitObject[] {
    const history = [];
    const currentBranch = this.gitBranchUtil.getActiveBranch(this.context.repository);
    let currentHash = currentBranch ? this.context.repository.refs.heads[currentBranch] : this.context.repository.HEAD;
    while (currentHash) {
      const commitObject = this.context.repository.objects[currentHash];
      if (!commitObject) {
        console.error('Missing commit object: ' + currentHash);
        break;
      }
      if (!(commitObject instanceof GitCommitObject)) {
        console.error(`Invalid object found. Expected ${currentHash} to be a commit but was ${commitObject.type}`);
        break;
      }

      history.push(commitObject);
      // FIXME: handle merge
      currentHash = commitObject.parents[0];
    }
    return history;
  }

  toggleExpandFile(path: string) {
    this.expandedFile[path] = !this.expandedFile[path];
  }

  highlightHead(head: string) {
    if (head.startsWith('ref:')) {
      this.highlightedObject = head.split(' ')[1];
    } else {
      this.highlightedObject = head;
    }
  }

  isHeadHighlighted(head: string) {
    if (head.startsWith('ref:')) {
      return this.highlightedObject === head.split(' ')[1];
    } else {
      return this.highlightedObject === head;
    }
  }
}
