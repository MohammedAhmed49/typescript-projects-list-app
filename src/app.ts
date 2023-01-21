// Interfaces
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

// Draggable interface for draggable items (project item)
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

// DragTarget interface for drag areas (project list)
interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  drageLeaveHandler(event: DragEvent): void;
}

// Decorators
// AutoBind decorator is used to bing "this" key word on methods like event listeners
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

type Listener<T> = (items: T[]) => void;

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

// Abstract State class in case we are creating multible classes in the future
abstract class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// Singletone pattern is used to make sure only one instance of ProjectState is created
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  // List of listener functions used from outside this class to listen to any change in projects

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  updateListeners() {
    for (let listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
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
    this.updateListeners();
  }

  updateProjectStauts(id: string, status: ProjectStatus) {
    const selectedProject = <Project>(
      this.projects.find((project) => project.id === id)
    );
    selectedProject!.status = status;
    const updatedProjects = this.projects.filter((project) => project.id != id);
    this.projects = [selectedProject, ...updatedProjects];

    // Call all listeners from outside to see the changes to projects
    this.updateListeners();
  }
}

// Abstract class is created to be inhereted in ProjectInput and ProjectList as both are using same features to create component and append it in HTML
// Generics here are used because hostEl and contentElement might be differet in both ProjectInput and ProjectList
type InsertAt = "beforeend" | "afterbegin";
abstract class ProjectComponent<T extends HTMLElement, U extends HTMLElement> {
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

// ProjectInput class for the form of adding a new project
class ProjectInput extends ProjectComponent<HTMLDivElement, HTMLFormElement> {
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

// ProjectItem class is used to manage project li items in HTML
class ProjectItem
  extends ProjectComponent<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  constructor(hostId: string, private project: Project) {
    super("single-project", hostId, "afterbegin", project.id);
    this.renderContent();
    this.configure();
  }

  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} persons`;
    }
  }

  @AutoBind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  @AutoBind
  dragEndHandler(_: DragEvent) {
    console.log("Drag Ended");
  }

  configure() {
    this.contentEl.addEventListener("dragstart", this.dragStartHandler);
    this.contentEl.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    this.contentEl.querySelector("h2")!.textContent = this.project.title;
    this.contentEl.querySelector("h3")!.textContent =
      this.persons + " attached";
    this.contentEl.querySelector("p")!.textContent = this.project.description;
  }
}

// ProjectList class for acitve and finished lists
class ProjectList
  extends ProjectComponent<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[] = [];
  listElId: string;

  constructor(private type: "active" | "finished") {
    super("project-list", "app", "beforeend", `${type}-projects`);

    this.listElId = `${this.type}-projects-list`;

    this.renderContent();
    this.configure();
  }

  @AutoBind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.contentEl.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @AutoBind
  drageLeaveHandler(_: DragEvent) {
    const listEl = this.contentEl.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  @AutoBind
  dropHandler(event: DragEvent) {
    const projectId = event.dataTransfer!.getData("text/plain");
    const projectNewStatus =
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished;
    state.updateProjectStauts(projectId, projectNewStatus);

    const listEl = this.contentEl.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure() {
    state.addListener((projects: Project[]) => {
      this.assignedProjects = projects.filter((project) => {
        if (this.type === "active") {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });
      this.renderProjects();
    });

    this.contentEl.addEventListener("dragover", this.dragOverHandler);
    this.contentEl.addEventListener("dragleave", this.drageLeaveHandler);
    this.contentEl.addEventListener("drop", this.dropHandler);
  }

  renderContent() {
    this.contentEl.querySelector("ul")!.id = this.listElId;
    this.contentEl.querySelector("h2")!.textContent =
      this.type.toUpperCase() + "PROJECTS";
  }

  private renderProjects() {
    const listEl = <HTMLElement>document.getElementById(this.listElId);
    listEl.innerHTML = "";
    for (let project of this.assignedProjects) {
      new ProjectItem(this.contentEl.querySelector("ul")!.id, project);
    }
  }
}

const state = ProjectState.getInstance();

const project = new ProjectInput();
const activeProjects = new ProjectList("active");
const finishedProjects = new ProjectList("finished");
