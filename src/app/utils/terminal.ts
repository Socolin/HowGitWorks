import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

interface TerminalLine {
  text: string;
  level: 'std' | 'error';
}

@Injectable()
export class Terminal {
  public lines: TerminalLine[] = [];
  private lineSubject: Subject<TerminalLine> = new Subject<TerminalLine>();
  public onLineWrite: Observable<TerminalLine> = this.lineSubject;

  write(text: string) {
    this.writeLine({text, level: 'std'});
  }

  writeError(text: string) {
    this.writeLine({text, level: 'error'});
  }

  private writeLine(line: TerminalLine) {
    this.lines.push(line);
    this.lineSubject.next(line);
  }
}
