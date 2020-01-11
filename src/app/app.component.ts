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
    CatExecutor
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  @ViewChild('terminalOutput', {static: true})
  private terminalOutput: ElementRef;

  constructor(
    private readonly shellExecutor: ShellExecutor,
    private readonly terminal: Terminal,
    public readonly context: Context,
  ) {
  }

  execute(command: string) {
    this.terminal.write('$ ' + command);
    const result = this.shellExecutor.execute(command);
  }

  ngOnInit(): void {
    this.subscription.add(this.terminal.onLineWrite.subscribe(() => {
      setTimeout(() => {
        this.terminalOutput.nativeElement.scrollTop = this.terminalOutput.nativeElement.scrollHeight;
      }, 0);
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
