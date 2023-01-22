// Abstract class is created to be inhereted in ProjectInput and ProjectList as both are using same features to create component and append it in HTML
// Generics here are used because hostEl and contentElement might be differet in both ProjectInput and ProjectList
type InsertAt = "beforeend" | "afterbegin";
export abstract class ProjectComponent<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T;
  contentEl: U;

  constructor(
    tempelateId: string,
    hostId: string,
    appendPosition: InsertAt,
    newElementId?: string
  ) {
    this.templateEl = <HTMLTemplateElement>document.getElementById(tempelateId);

    this.hostEl = <T>document.getElementById(hostId);

    const importedNode = document.importNode(this.templateEl.content, true);

    this.contentEl = <U>importedNode.firstElementChild;
    if (newElementId) {
      this.contentEl.id = newElementId;
    }
    this.attachElement(appendPosition);
  }

  private attachElement(appendPosition: InsertAt) {
    this.hostEl.insertAdjacentElement(appendPosition, this.contentEl);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}
