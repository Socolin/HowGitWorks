import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Directory, File} from './models/files';
import {Context} from './models/context';
import {FileSystemUtil} from './utils/file-system-util';

@Component({
  selector: 'app-filesystem-node',
  templateUrl: './filesystem-node.component.html',
  styleUrls: ['./filesystem-node.component.scss']
})
export class FilesystemNodeComponent implements OnInit {
  @Input()
  file: File;

  displayContent = false;
  editMode = false;

  @ViewChild('editor', {static: false})
  editor: ElementRef;

  constructor(
    private readonly context: Context,
    private readonly fileSystemUtil: FileSystemUtil,
  ) {
  }

  save(): void {
    this.fileSystemUtil.updateFileContent(this.file, this.editor.nativeElement.value);
    this.editMode = false;
  }

  deleteFile() {
    this.fileSystemUtil.deleteFile(this.file);
    this.editMode = false;
  }


  openCreateFile() {
    const name = prompt('File name');
    if (name) {
      this.fileSystemUtil.writeFileAt(this.file as Directory, name, '');
    }
  }

  openCreateFolder() {
    const name = prompt('Directory name');
    if (name) {
      this.fileSystemUtil.mkDirAt(this.file as Directory, name);
    }
  }

  ngOnInit() {
  }
}
