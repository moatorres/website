'use client'

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

  const handleCreateFile = async () => {
    if (!newItemName.trim() || !onCreateFile) return

    await onCreateFile(newItemName.trim())
    setNewItemName('')
    setShowNewFileDialog(false)
  }

  const handleCreateFolder = async () => {
    if (!newItemName.trim() || !onCreateFolder) return

    await onCreateFolder(newItemName.trim())
    setNewItemName('')
    setShowNewFolderDialog(false)
  }

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setIsRootDragOver(true)
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
    }
  }

  const handleRootDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsRootDragOver(false)

    if (!onMove) return

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      const sourcePath = data.path
      const isDirectory = data.isDirectory

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
          console.error('[v0] Failed to move to root:', error)
        }
      }
    } catch (error) {
      console.error('[v0] Failed to parse drag data:', error)
    }
  }

  const handleRootDragEnd = () => {
    setIsRootDragOver(false)
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
          <div className="py-4">
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
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFileDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFile} disabled={!newItemName.trim()}>
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
              Enter the folder path (e.g., &quot;src/components&quot; or
              &quot;utils&quot;)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="foldername">Folder Path</Label>
            <Input
              id="foldername"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="src/components"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder()
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFolderDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newItemName.trim()}>
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
}

function FileTreeNode({
  node,
  onFileSelect,
  selectedFile,
  onDelete,
  onRename,
  onMove,
  level,
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0)
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(node.name)
  const [isDragOver, setIsDragOver] = useState(false)
  const isSelected = selectedFile === node.path

  const handleClick = () => {
    if (isRenaming) return
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded)
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
    if (!onRename || !renameValue.trim() || renameValue === node.name) {
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
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (node.type === 'directory') {
      e.preventDefault()
      e.stopPropagation() // Prevent parent folder from also highlighting
      e.dataTransfer.dropEffect = 'move'
      setIsDragOver(true)
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
    }
  }

  const handleDragEnd = () => {
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false) // Reset immediately when drop happens

    if (node.type !== 'directory' || !onMove) return

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      const sourcePath = data.path
      const isDirectory = data.isDirectory

      const sourceParent = sourcePath.includes('/')
        ? sourcePath.substring(0, sourcePath.lastIndexOf('/'))
        : ''

      if (sourcePath === node.path || node.path.startsWith(sourcePath + '/')) {
        return
      }

      if (sourceParent === node.path) {
        return
      }

      await onMove(sourcePath, node.path, isDirectory)
    } catch (error) {
      console.error('[v0] Failed to parse drag data:', error)
    }
  }

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-accent transition-colors group ${
          isSelected ? 'bg-accent text-accent-foreground' : ''
        } ${isDragOver ? 'bg-primary/20 border-l-2 border-primary' : ''}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable={!isRenaming}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd} // Added drag end handler
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
            className="h-5 px-1 py-0 text-sm flex-1"
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
                className="h-5 w-5 p-0"
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
                className="h-5 w-5 p-0"
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
                className="mt-4 border-destructive bg-destructive/5"
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
