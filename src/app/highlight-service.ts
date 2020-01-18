export class HighlightService {
  public highlightedObject?: string;

  highlight(object: string) {
    this.highlightedObject = object;
  }

  isHighlighted(object: string) {
    return this.highlightedObject === object;
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
