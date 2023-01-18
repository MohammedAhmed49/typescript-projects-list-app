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

  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length != 0;
  }

  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }

  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }

  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

// Classes

// Project status is only active or finished
enum ProjectStatus {
  Active,
  Finished,
}

type Listener = (items: Project[]) => void;

// Project class to use it in other classes
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Singletone pattern is used to make sure only one instance of ProjectState is created
class ProjectState {
  private projects: Project[] = [];
  private static instance: ProjectState;

  // List of listener functions used from outside this class to listen to any change in projects
  private listeners: Listener[] = [];

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    const project = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );
    this.projects.push(project);

    // Call all listeners from outside to see the changes to projects
    for (let listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }
}

// ProjectInput class for the form of adding a new project
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

// ProjectList class for acitve and finished lists
class ProjectList {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLElement;
  contentEl: HTMLElement;
  assignedProjects: Project[] = [];
  listElId: string;

  constructor(private type: "active" | "finished") {
    this.templateEl = <HTMLTemplateElement>(
      document.getElementById("project-list")
    );
    this.hostEl = <HTMLElement>document.getElementById("app");

    const importedNode = document.importNode(this.templateEl.content, true);
    this.contentEl = <HTMLElement>importedNode.firstElementChild;

    this.contentEl.id = `${this.type}-projects`;

    this.listElId = `${this.type}-projects-list`;

    this.attatchElement();
    this.renderContent();

    state.addListener((projects: Project[]) => {
      this.assignedProjects = projects.filter((project) => {
        if (this.type === "active") {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });
      this.renderProjects();
    });
  }

  private attatchElement() {
    this.hostEl.insertAdjacentElement("beforeend", this.contentEl);
  }

  private renderContent() {
    this.contentEl.querySelector("ul")!.id = this.listElId;
    this.contentEl.querySelector("h2")!.textContent =
      this.type.toUpperCase() + "PROJECTS";
  }

  private renderProjects() {
    const listEl = <HTMLElement>document.getElementById(this.listElId);
    listEl.innerHTML = "";
    for (let project of this.assignedProjects) {
      const newNode = document.createElement("li");
      newNode.textContent = project.title;
      listEl?.appendChild(newNode);
    }
  }
}

const state = ProjectState.getInstance();

const project = new ProjectInput();
const activeProjects = new ProjectList("active");
const finishedProjects = new ProjectList("finished");
