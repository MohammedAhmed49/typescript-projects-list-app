// Decorators
function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };

  return adjDescriptor;
}

// Classes
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

  private configure() {
    this.contentElement.addEventListener("submit", this.onSubmitHandler);
  }

  private attachElemnt() {
    this.hostEl.insertAdjacentElement("afterbegin", this.contentElement);
  }

  @AutoBind
  private onSubmitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.getInputs();
    if (userInput) {
      console.log(userInput);
      this.clearInputs();
    }
  }

  private getInputs(): [string, string, number] | void {
    const title = this.titleInput.value;
    const description = this.descInput.value;
    const people = this.peopleInput.value;

    if (
      title.trim().length === 0 ||
      description.trim().length === 0 ||
      people.trim().length === 0
    ) {
      alert("Please fill all inputs");
    } else {
      return [title, description, +people];
    }
  }

  private clearInputs() {
    this.titleInput.value = "";
    this.descInput.value = "";
    this.peopleInput.value = "";
  }
}

const project = new ProjectInput();
