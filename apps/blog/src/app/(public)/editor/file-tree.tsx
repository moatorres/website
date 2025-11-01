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
  File,
  FilePlus,
  Folder,
  FolderPlus,
  XIcon,
} from 'lucide-react'
import { useState } from 'react'

import type { FileNode } from './types'

interface FileTreeProps {
  nodes: FileNode[]
  onFileSelect: (path: string) => void
  selectedFile: string | null
  onCreateFile?: (path: string) => Promise<void>
  onCreateFolder?: (path: string) => Promise<void>
  onDelete?: (path: string, isDirectory: boolean) => Promise<void>
}

export function FileTree({
  nodes,
  onFileSelect,
  selectedFile,
  onCreateFile,
  onCreateFolder,
  onDelete,
}: FileTreeProps) {
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newItemName, setNewItemName] = useState('')

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

      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
          onDelete={onDelete}
          level={0}
        />
      ))}

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
  level: number
}

function FileTreeNode({
  node,
  onFileSelect,
  selectedFile,
  onDelete,
  level,
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0)
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const isSelected = selectedFile === node.path

  const handleClick = () => {
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

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-accent transition-colors group ${
          isSelected ? 'bg-accent text-accent-foreground' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
        <span className="truncate flex-1">{node.name}</span>

        {isHovered && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteDialog(true)
            }}
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <XIcon className="w-3 h-3" />
          </Button>
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
              <Alert variant="destructive" className="mt-4 border-destructive">
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
