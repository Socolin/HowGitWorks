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
  private command: ElementRef;

  constructor(
    public readonly terminal: Terminal,
    private readonly shellExecutor: ShellExecutor,
  ) {
  }

  execute(command: string) {
    this.terminal.write('$ ' + command);
    const result = this.shellExecutor.execute(command);
  }

  upHistory() {
    if (this.historyLocation >= this.shellExecutor.commandHistory.length) {
      return;
    }
    this.command.nativeElement.value = this.shellExecutor.commandHistory[this.historyLocation++];
  }

  downHistory() {
    if (this.historyLocation <= 0) {
      this.command.nativeElement.value = '';
      return;
    }
    this.command.nativeElement.value = this.shellExecutor.commandHistory[--this.historyLocation];
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
