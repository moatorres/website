'use client'

import { print } from '@blog/utils'
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertTitle,
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@shadcn/ui'
import {
  AlertCircleIcon,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  Edit2,
  File,
  FilePlus,
  Folder,
  FolderPlus,
  XIcon,
} from 'lucide-react'
import type React from 'react'
import { useState } from 'react'

import type { FileNode } from '../services/types'
import { getWebContainerInstance, readAllFiles } from '../services/webcontainer'

interface FileTreeProps {
  nodes: FileNode[]
  onFileSelect: (path: string) => void
  selectedFile: string | null
  onCreateFile?: (path: string) => Promise<void>
  onCreateFolder?: (path: string) => Promise<void>
  onDelete?: (path: string, isDirectory: boolean) => Promise<void>
  onRename?: (
    oldPath: string,
    newPath: string,
    isDirectory: boolean
  ) => Promise<void>
  onMove?: (
    sourcePath: string,
    targetPath: string,
    isDirectory: boolean
  ) => Promise<void>
}

interface DragState {
  path: string
  isDirectory: boolean
  name: string
}

export function FileTree({
  nodes,
  onFileSelect,
  selectedFile,
  onCreateFile,
  onCreateFolder,
  onDelete,
  onRename,
  onMove,
}: FileTreeProps) {
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [isRootDragOver, setIsRootDragOver] = useState(false)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [highlightedFolderPath, setHighlightedFolderPath] = useState<
    string | null
  >(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(nodes.filter((n) => n.type === 'directory').map((n) => n.path))
  )

  const checkIfPathExists = (path: string): boolean => {
    const checkNodes = (nodeList: FileNode[]): boolean => {
      for (const node of nodeList) {
        if (node.path === path) return true
        if (node.type === 'directory' && node.children) {
          if (checkNodes(node.children)) return true
        }
      }
      return false
    }
    return checkNodes(nodes)
  }

  const isFileNameInvalid =
    newItemName.trim() !== '' && checkIfPathExists(newItemName.trim())
  const isFolderNameInvalid =
    newItemName.trim() !== '' && checkIfPathExists(newItemName.trim())

  const handleCollapseAll = () => {
    setExpandedFolders(new Set())
  }

  const handleCreateFile = async () => {
    if (!newItemName.trim() || !onCreateFile || isFileNameInvalid) return

    await onCreateFile(newItemName.trim())
    setNewItemName('')
    setShowNewFileDialog(false)
  }

  const handleCreateFolder = async () => {
    if (!newItemName.trim() || !onCreateFolder || isFolderNameInvalid) return

    await onCreateFolder(newItemName.trim())
    setNewItemName('')
    setShowNewFolderDialog(false)
  }

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (dragState && dragState.path.includes('/')) {
      const hasCollision = nodes.some((n) => n.name === dragState.name)
      if (hasCollision) {
        e.dataTransfer.dropEffect = 'none'
        return
      }
    }

    e.dataTransfer.dropEffect = 'move'
    setIsRootDragOver(true)
    setHighlightedFolderPath('')
  }

  const handleRootDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsRootDragOver(false)
      setHighlightedFolderPath(null)
    }
  }

  const handleRootDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsRootDragOver(false)
    setHighlightedFolderPath(null)

    if (!onMove || !dragState) return

    const hasCollision = nodes.some((n) => n.name === dragState.name)
    if (hasCollision) {
      print.warn('Cannot move to root: item with same name already exists')
      return
    }

    try {
      const sourcePath = dragState.path
      const isDirectory = dragState.isDirectory

      if (sourcePath.includes('/')) {
        const fileName = sourcePath.split('/').pop()
        if (!fileName) return

        const targetPath = ''

        try {
          const webcontainer = await getWebContainerInstance()

          if (!webcontainer) return

          if (isDirectory) {
            const files = await readAllFiles(webcontainer)
            const filesToMove = Object.keys(files.files).filter((f) =>
              f.startsWith(sourcePath + '/')
            )

            await webcontainer.fs.mkdir(fileName, { recursive: true })

            for (const file of filesToMove) {
              const relPath = file.substring(sourcePath.length + 1)
              const newFilePath = `${fileName}/${relPath}`
              const content = await webcontainer.fs.readFile(file, 'utf-8')
              const newFileDir = newFilePath.split('/').slice(0, -1).join('/')
              if (newFileDir) {
                await webcontainer.fs.mkdir(newFileDir, { recursive: true })
              }
              await webcontainer.fs.writeFile(newFilePath, content)
            }

            await webcontainer.fs.rm(sourcePath, {
              recursive: true,
              force: true,
            })
          } else {
            const content = await webcontainer.fs.readFile(sourcePath, 'utf-8')
            await webcontainer.fs.writeFile(fileName, content)
            await webcontainer.fs.rm(sourcePath)
          }

          await onMove(sourcePath, targetPath, isDirectory)
        } catch (error) {
          print.error('Failed to move to root:', error)
        }
      }
    } catch (error) {
      print.error('Failed to parse drag data:', error)
    }
  }

  const handleRootDragEnd = () => {
    setIsRootDragOver(false)
    setHighlightedFolderPath(null)
    setDragState(null)
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-1 p-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNewFileDialog(true)}
          className="h-7 px-2 text-xs"
          title="New File"
        >
          <FilePlus className="w-3.5 h-3.5 mr-1" />
          File
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNewFolderDialog(true)}
          className="h-7 px-2 text-xs"
          title="New Folder"
        >
          <FolderPlus className="w-3.5 h-3.5 mr-1" />
          Folder
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCollapseAll}
          className="h-7 px-2 text-xs ml-auto"
          title="Collapse All Folders"
        >
          <ChevronsDownUp className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div
        className={`transition-colors min-h-[200px] ${isRootDragOver ? 'bg-primary/10' : ''}`}
        onDragOver={handleRootDragOver}
        onDragLeave={handleRootDragLeave}
        onDrop={handleRootDrop}
        onDragEnd={handleRootDragEnd}
      >
        {nodes.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
            onDelete={onDelete}
            onRename={onRename}
            onMove={onMove}
            level={0}
            expandedFolders={expandedFolders}
            setExpandedFolders={setExpandedFolders}
            dragState={dragState}
            setDragState={setDragState}
            highlightedFolderPath={highlightedFolderPath}
            setHighlightedFolderPath={setHighlightedFolderPath}
            allNodes={nodes} // Pass all nodes to FileTreeNode for collision detection
          />
        ))}
        {isRootDragOver && (
          <div className="p-4 text-center text-sm text-muted-foreground border-2 border-dashed border-primary rounded m-2">
            Drop here to move to root folder
          </div>
        )}
      </div>

      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create File</DialogTitle>
            <DialogDescription>
              Enter the file name (e.g.,{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded">
                src/utils.ts
              </code>{' '}
              or
              <code className="bg-muted px-1.5 py-0.5 rounded">README.md</code>)
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="filename" className="mb-1">
              File Name
            </Label>
            <Input
              id="filename"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="src/example.ts"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile()
              }}
              className={cn(
                'focus-visible:ring-accent',
                isFileNameInvalid && 'opacity-50 bg-foreground/10'
              )}
              autoFocus
            />
            {isFileNameInvalid && (
              <p className="text-xs opacity-50 -mt-2">
                A file or folder with this path already exists
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFileDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFile}
              disabled={!newItemName.trim() || isFileNameInvalid}
              className={'bg-green-600 hover:bg-green-700'}
            >
              Create File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter the folder path (e.g.,{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded">
                src/components
              </code>{' '}
              or
              <code className="bg-muted px-1.5 py-0.5 rounded">utils</code>)
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="foldername">Folder Path</Label>
            <Input
              id="foldername"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="src/components"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder()
              }}
              className={cn(
                'focus-visible:ring-accent',
                isFolderNameInvalid && 'opacity-50 bg-foreground/10'
              )}
              autoFocus
            />
            {isFolderNameInvalid && (
              <p className="text-xs opacity-50 -mt-2">
                A file or folder with this path already exists
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFolderDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newItemName.trim() || isFolderNameInvalid}
              className={'bg-green-600 hover:bg-green-700'}
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface FileTreeNodeProps {
  node: FileNode
  onFileSelect: (path: string) => void
  selectedFile: string | null
  onDelete?: (path: string, isDirectory: boolean) => Promise<void>
  onRename?: (
    oldPath: string,
    newPath: string,
    isDirectory: boolean
  ) => Promise<void>
  onMove?: (
    sourcePath: string,
    targetPath: string,
    isDirectory: boolean
  ) => Promise<void>
  level: number
  expandedFolders: Set<string>
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>
  dragState: DragState | null
  setDragState: React.Dispatch<React.SetStateAction<DragState | null>>
  highlightedFolderPath: string | null
  setHighlightedFolderPath: React.Dispatch<React.SetStateAction<string | null>>
  allNodes?: FileNode[]
}

function FileTreeNode({
  node,
  onFileSelect,
  selectedFile,
  onDelete,
  onRename,
  onMove,
  level,
  expandedFolders,
  setExpandedFolders,
  dragState,
  setDragState,
  highlightedFolderPath,
  setHighlightedFolderPath,
  allNodes,
}: FileTreeNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(node.name)
  const [isDragOver, setIsDragOver] = useState(false)
  const isSelected = selectedFile === node.path
  const isExpanded = expandedFolders.has(node.path)

  const isHighlighted =
    highlightedFolderPath !== null &&
    (node.path === highlightedFolderPath ||
      (node.path.startsWith(highlightedFolderPath + '/') &&
        highlightedFolderPath !== '') ||
      (highlightedFolderPath === '' && !node.path.includes('/')))

  const checkRenameConflict = (): boolean => {
    if (!renameValue.trim() || renameValue === node.name) return false

    const pathParts = node.path.split('/')
    pathParts[pathParts.length - 1] = renameValue.trim()
    const newPath = pathParts.join('/')

    // Check if the new path already exists
    const checkNodes = (nodeList: FileNode[]): boolean => {
      for (const n of nodeList) {
        if (n.path === newPath) return true
        if (n.type === 'directory' && n.children) {
          if (checkNodes(n.children)) return true
        }
      }
      return false
    }
    return allNodes ? checkNodes(allNodes) : false
  }

  const isRenameInvalid = renameValue.trim() !== '' && checkRenameConflict()

  const getNodesInFolder = (folderPath: string): FileNode[] => {
    if (!allNodes) return []

    const findFolder = (nodes: FileNode[], path: string): FileNode | null => {
      for (const n of nodes) {
        if (n.path === path && n.type === 'directory') return n
        if (n.type === 'directory' && n.children) {
          const found = findFolder(n.children, path)
          if (found) return found
        }
      }
      return null
    }

    if (folderPath === '') {
      return allNodes
    }

    const folder = findFolder(allNodes, folderPath)
    return folder?.children || []
  }

  const handleClick = () => {
    if (isRenaming) return
    if (node.type === 'directory') {
      setExpandedFolders((prev) => {
        const newFolders = new Set(prev)
        if (isExpanded) {
          newFolders.delete(node.path)
        } else {
          newFolders.add(node.path)
        }
        return newFolders
      })
    } else {
      onFileSelect(node.path)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    await onDelete(node.path, node.type === 'directory')
    setShowDeleteDialog(false)
  }

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRenaming(true)
    setRenameValue(node.name)
  }

  const handleRename = async () => {
    if (
      !onRename ||
      !renameValue.trim() ||
      renameValue === node.name ||
      isRenameInvalid
    ) {
      setIsRenaming(false)
      setRenameValue(node.name)
      return
    }

    const pathParts = node.path.split('/')
    pathParts[pathParts.length - 1] = renameValue.trim()
    const newPath = pathParts.join('/')

    await onRename(node.path, newPath, node.type === 'directory')
    setIsRenaming(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setIsRenaming(false)
      setRenameValue(node.name)
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        path: node.path,
        isDirectory: node.type === 'directory',
      })
    )
    setDragState({
      path: node.path,
      isDirectory: node.type === 'directory',
      name: node.name,
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!dragState) return

    let targetFolder: string
    if (node.type === 'directory') {
      targetFolder = node.path
    } else {
      const pathParts = node.path.split('/')
      targetFolder =
        pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : ''
    }

    const sourceParent = dragState.path.includes('/')
      ? dragState.path.substring(0, dragState.path.lastIndexOf('/'))
      : ''

    const isSameParent = sourceParent === targetFolder
    const isMovingIntoSelf =
      dragState.path === targetFolder ||
      node.path.startsWith(dragState.path + '/')

    const targetChildren =
      node.type === 'directory'
        ? node.children || []
        : getNodesInFolder(targetFolder)
    const hasCollision = targetChildren.some(
      (child) => child.name === dragState.name
    )

    if (isSameParent || isMovingIntoSelf || hasCollision) {
      e.dataTransfer.dropEffect = 'none'
      setIsDragOver(false)
      setHighlightedFolderPath(null)
    } else {
      e.dataTransfer.dropEffect = 'move'
      setIsDragOver(true)
      setHighlightedFolderPath(targetFolder)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragOver(false)
      setHighlightedFolderPath(null)
    }
  }

  const handleDragEnd = () => {
    setIsDragOver(false)
    setHighlightedFolderPath(null)
    setDragState(null)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setHighlightedFolderPath(null)

    if (!onMove || !dragState) return

    try {
      const sourcePath = dragState.path
      const isDirectory = dragState.isDirectory
      const sourceName = dragState.name

      let targetFolder: string

      if (node.type === 'directory') {
        targetFolder = node.path
      } else {
        const pathParts = node.path.split('/')
        targetFolder =
          pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : ''
      }

      const sourceParent = sourcePath.includes('/')
        ? sourcePath.substring(0, sourcePath.lastIndexOf('/'))
        : ''

      if (
        sourcePath === targetFolder ||
        node.path.startsWith(sourcePath + '/')
      ) {
        return
      }

      if (sourceParent === targetFolder) {
        return
      }

      const targetChildren =
        node.type === 'directory'
          ? node.children || []
          : getNodesInFolder(targetFolder)
      const hasCollision = targetChildren.some(
        (child) => child.name === sourceName
      )

      if (hasCollision) {
        print.warn(
          'Cannot move: item with same name already exists in target folder'
        )
        return
      }

      await onMove(sourcePath, targetFolder, isDirectory)
    } catch (error) {
      print.error('Failed to parse drag data:', error)
    }
  }

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-accent transition-colors group ${
          isSelected ? 'bg-accent text-accent-foreground' : ''
        } ${isDragOver ? 'border-l-2 border-primary' : ''} ${isHighlighted ? 'bg-primary/10' : ''}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable={!isRenaming}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      >
        {node.type === 'directory' ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <Folder className="w-4 h-4 text-primary" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="w-4 h-4 text-muted-foreground" />
          </>
        )}

        {isRenaming ? (
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleRenameKeyDown}
            className={`h-5 px-1 py-0 text-sm flex-1 rounded-xs border-none focus-visible:ring-0 ${isRenameInvalid ? 'opacity-50' : ''}`}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1">{node.name}</span>
        )}

        {isHovered && !isRenaming && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onRename && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartRename}
                className="h-5 w-5 p-0 hover:opacity-70 transition-opacity ease-in-out duration-200"
                title="Rename"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteDialog(true)
                }}
                className="h-5 w-5 p-0 hover:opacity-70 transition-opacity ease-in-out duration-200"
                title="Delete"
              >
                <XIcon className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              onDelete={onDelete}
              onRename={onRename}
              onMove={onMove}
              level={level + 1}
              expandedFolders={expandedFolders}
              setExpandedFolders={setExpandedFolders}
              dragState={dragState}
              setDragState={setDragState}
              highlightedFolderPath={highlightedFolderPath}
              setHighlightedFolderPath={setHighlightedFolderPath}
              allNodes={allNodes}
            />
          ))}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {node.type === 'directory' ? 'Folder' : 'File'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>
                <code className="bg-muted px-1.5 py-0.5 rounded">
                  {node.path}
                </code>
              </strong>
              ?
              <Alert
                variant="destructive"
                className="mt-4 bg-destructive/5 border-destructive"
              >
                <AlertCircleIcon />
                <AlertTitle>This action cannot be undone.</AlertTitle>
                <AlertDescription>
                  {node.type === 'directory'
                    ? ' This will permanently remove all files inside this folder.'
                    : `This will permanently remove the ${node.type} from your
                  project.`}
                </AlertDescription>
              </Alert>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
