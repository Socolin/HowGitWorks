import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Terminal} from './utils/terminal';
import {ShellExecutor} from './shell-executor';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  private historyLocation = 0;

  @ViewChild('terminalOutput', {static: true})
  private terminalOutput: ElementRef;
  @ViewChild('command', {static: true})
  private command: ElementRef<HTMLInputElement>;

  constructor(
    public readonly terminal: Terminal,
    private readonly shellExecutor: ShellExecutor,
  ) {
  }

  execute(command: string) {
    this.terminal.write('$ ' + command);
    const result = this.shellExecutor.execute(command);
    this.historyLocation = -1;
  }

  upHistory() {
    if (++this.historyLocation >= this.shellExecutor.commandHistory.length) {
      this.historyLocation = this.shellExecutor.commandHistory.length - 1;
      this.setCaretToEnd();
      return;
    }
    this.command.nativeElement.value = this.shellExecutor.commandHistory[this.historyLocation];
    this.setCaretToEnd();
  }

  downHistory() {
    if (--this.historyLocation < 0) {
      this.historyLocation = -1;
      this.command.nativeElement.value = '';
      return;
    }
    this.command.nativeElement.value = this.shellExecutor.commandHistory[this.historyLocation];
    this.setCaretToEnd();
  }

  private setCaretToEnd() {
    setTimeout(() => {
      this.command.nativeElement.focus();
      this.command.nativeElement.setSelectionRange(this.command.nativeElement.value.length, this.command.nativeElement.value.length);
    }, 0);
  }

  ngOnInit() {
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
