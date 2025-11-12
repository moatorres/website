export interface FileNode {
  name: string
  type: 'file' | 'directory'
  path: string
  children?: FileNode[]
  content?: string
}

export interface Project {
  id: string
  name: string
  description: string
  initialFile: string
  files: Record<string, string>
}
