import { AutoBind } from "../decorators/auto-bind.js";
import { Draggable } from "../interfaces/drag-drop.js";
import { Project } from "../models/project.js";
import { ProjectComponent } from "./base-component.js";

// ProjectItem class is used to manage project li items in HTML
export class ProjectItem
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
