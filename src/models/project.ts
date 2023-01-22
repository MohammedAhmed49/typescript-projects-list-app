import { ProjectStatus } from "../enums/project-status.js";

// Project class to use it in other classes
export class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}
