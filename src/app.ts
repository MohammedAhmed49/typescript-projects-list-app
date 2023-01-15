// Code goes here!

class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLElement;
  contentElement: HTMLElement;
  titleInput: HTMLInputElement;
  descInput: HTMLInputElement;
  peopleInput: HTMLInputElement;

  constructor() {
    this.templateEl = <HTMLTemplateElement>(
      document.getElementById("project-input")
    );

    this.hostEl = <HTMLElement>document.getElementById("app");

    const importedNode = document.importNode(this.templateEl.content, true);

    this.contentElement = <HTMLElement>importedNode.firstElementChild;
    this.contentElement.id = "user-input";

    this.titleInput = <HTMLInputElement>(
      this.contentElement.querySelector("#title")
    );
    this.descInput = <HTMLInputElement>(
      this.contentElement.querySelector("#description")
    );
    this.peopleInput = <HTMLInputElement>(
      this.contentElement.querySelector("#people")
    );

    this.configure();
    this.attachElemnt();
  }

  private onSubmitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInput.value);
  }

  private configure() {
    this.contentElement.addEventListener(
      "submit",
      this.onSubmitHandler.bind(this)
    );
  }

  private attachElemnt() {
    this.hostEl.insertAdjacentElement("afterbegin", this.contentElement);
  }
}

const project = new ProjectInput();
