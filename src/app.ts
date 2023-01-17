// Interfaces
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

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

// Functions
function validate(validatableInput: Validatable): boolean {
  let isValid = true;

  if(validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length != 0;
  }

  if(validatableInput.minLength != null && typeof validatableInput.value === "string") {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength
  }

  if(validatableInput.maxLength != null && typeof validatableInput.value === "string") {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
  }

  if(validatableInput.min != null && typeof validatableInput.value === "number") {
    isValid = isValid && validatableInput.value >= validatableInput.min
  }

  if(validatableInput.max != null && typeof validatableInput.value === "number") {
    isValid = isValid && validatableInput.value <= validatableInput.max
  }

  return isValid;
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

    const validatableTitle: Validatable = {value: title, required: true, minLength: 6};
    const validatableDesc: Validatable = {value: description, required: true, minLength: 10};
    const validatablePeople: Validatable = {value: people, required: true, min: 1};
    if (
      !validate(validatableTitle) ||
      !validate(validatableDesc) ||
      !validate(validatablePeople)
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
