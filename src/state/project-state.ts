import { ProjectStatus } from '../enums/project-status';
import { Project } from './../models/project';
type Listener<T> = (items: T[]) => void;

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

export const state = ProjectState.getInstance();
