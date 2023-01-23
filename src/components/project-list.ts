import { AutoBind } from "../decorators/auto-bind";
import { ProjectStatus } from "../enums/project-status";
import { DragTarget } from "../interfaces/drag-drop";
import { Project } from "../models/project";
import { state } from "../state/project-state";
import { ProjectComponent } from "./base-component";
import { ProjectItem } from "./project-item";

// ProjectList class for acitve and finished lists
export class ProjectList
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
