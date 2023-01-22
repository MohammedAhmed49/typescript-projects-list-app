import { state } from './../state/project-state.js';
import { AutoBind } from "../decorators/auto-bind.js";
import { ProjectComponent } from "./base-component.js";
import { Validatable } from '../interfaces/validatable.js';
import { validate } from '../utils/validate.js';

// ProjectInput class for the form of adding a new project
export class ProjectInput extends ProjectComponent<
  HTMLDivElement,
  HTMLFormElement
> {
  titleInput: HTMLInputElement;
  descInput: HTMLInputElement;
  peopleInput: HTMLInputElement;

  constructor() {
    super("project-input", "app", "afterbegin", "user-input");

    this.titleInput = <HTMLInputElement>this.contentEl.querySelector("#title");
    this.descInput = <HTMLInputElement>(
      this.contentEl.querySelector("#description")
    );
    this.peopleInput = <HTMLInputElement>(
      this.contentEl.querySelector("#people")
    );

    this.configure();
  }

  configure() {
    this.contentEl.addEventListener("submit", this.onSubmitHandler);
  }

  renderContent() {}

  @AutoBind
  private onSubmitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.getInputs();
    if (userInput) {
      state.addProject(userInput[0], userInput[1], userInput[2]);
      this.clearInputs();
    }
  }

  private getInputs(): [string, string, number] | void {
    const title = this.titleInput.value;
    const description = this.descInput.value;
    const people = this.peopleInput.value;

    const validatableTitle: Validatable = {
      value: title,
      required: true,
      minLength: 2,
    };
    const validatableDesc: Validatable = {
      value: description,
      required: true,
      minLength: 3,
    };
    const validatablePeople: Validatable = {
      value: people,
      required: true,
      min: 1,
    };
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
