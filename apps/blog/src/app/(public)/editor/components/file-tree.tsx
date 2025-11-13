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
  Input,
} from '@shadcn/ui'
import {
  AlertCircleIcon,
  ChevronDown,
  ChevronRight,
  CopyMinus,
  Edit2,
  File,
  FilePlus,
  Folder,
  FolderPlus,
  XIcon,
} from 'lucide-react'
import type React from 'react'
import { useCallback, useState } from 'react'

import { useCurrentFile } from '../atoms/current-file'
import { useDraggableNode, useFileTreeStore } from '../atoms/file-tree'
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
  const {
    newItem,
    setNewItem,
    lastClickedItem,
    setLastClickedItem,
    setHighlightedFolderPath,
  } = useFileTreeStore()
  const draggable = useDraggableNode()

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(nodes.filter((n) => n.type === 'directory').map((n) => n.path))
  )

  const currentFile = useCurrentFile()

  const checkIfPathExists = useCallback(
    (path: string): boolean => {
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
    },
    [nodes]
  )

  const handleCollapseAll = () => {
    setExpandedFolders(new Set())
  }

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggable.active && draggable.path.includes('/')) {
      const hasCollision = nodes.some((n) => n.name === draggable.name)
      if (hasCollision) {
        e.dataTransfer.dropEffect = 'none'
        return
      }
    }

    e.dataTransfer.dropEffect = 'move'
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
      setHighlightedFolderPath(null)
    }
  }

  const handleRootDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setHighlightedFolderPath(null)

    if (!onMove || !draggable.active) return

    const hasCollision = nodes.some((n) => n.name === draggable.name)
    if (hasCollision) {
      print.warn('Cannot move to root: item with same name already exists')
      return
    }

    try {
      const sourcePath = draggable.path
      const isDirectory = draggable.isDirectory

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
    setHighlightedFolderPath(null)
    draggable.reset()
  }

  const handleStartCreateItem = (type: 'file' | 'folder') => {
    let targetDir = ''

    if (lastClickedItem !== null) {
      const findNode = (
        nodeList: FileNode[],
        path: string
      ): FileNode | null => {
        for (const node of nodeList) {
          if (node.path === path) return node
          if (node.type === 'directory' && node.children) {
            const found = findNode(node.children, path)
            if (found) return found
          }
        }
        return null
      }

      const clickedNode = findNode(nodes, lastClickedItem)

      if (clickedNode) {
        if (clickedNode.type === 'directory') {
          targetDir = clickedNode.path
        } else {
          targetDir = clickedNode.path.includes('/')
            ? clickedNode.path.split('/').slice(0, -1).join('/')
            : ''
        }
      }
    } else if (currentFile.path) {
      targetDir = currentFile.path.includes('/')
        ? currentFile.path.split('/').slice(0, -1).join('/')
        : ''
    }

    setNewItem({ name: '', type, path: targetDir })

    if (targetDir) {
      setExpandedFolders((prev) => new Set([...prev, targetDir]))
    }
  }

  const handleCreateItem = async () => {
    if (!newItem.name.trim()) {
      setNewItem({ type: null })
      return
    }

    const fullPath = newItem.path
      ? `${newItem.path}/${newItem.name.trim()}`
      : newItem.name.trim()

    if (checkIfPathExists(fullPath)) {
      return
    }

    if (newItem.type === 'file' && onCreateFile) {
      await onCreateFile(fullPath)
    } else if (newItem.type === 'folder' && onCreateFolder) {
      await onCreateFolder(fullPath)
    }

    setNewItem({ name: '', type: null })
  }

  const handleCancelCreateItem = () => {
    setNewItem({ name: '', type: null })
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-1 p-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleStartCreateItem('file')}
          className="h-7 px-2 text-xs"
          title="New File"
        >
          <FilePlus className="w-3.5 h-3.5 mr-1" />
          File
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleStartCreateItem('folder')}
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
          <CopyMinus className="w-3.5 h-3.5 scale-x-[-1]" />
        </Button>
      </div>

      <div
        className="transition-colors min-h-[200px]"
        onDragOver={handleRootDragOver}
        onDragLeave={handleRootDragLeave}
        onDrop={handleRootDrop}
        onDragEnd={handleRootDragEnd}
      >
        {newItem.type === 'folder' && newItem.path === '' && (
          <div
            className="flex items-center gap-1 px-2 py-1 bg-accent/50"
            style={{ paddingLeft: '8px' }}
          >
            <span className="w-4" />
            <Folder className="w-4 h-4 text-primary" />
            <Input
              value={newItem.name}
              onChange={(e) => setNewItem({ name: e.target.value })}
              onBlur={handleCreateItem}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateItem()
                else if (e.key === 'Escape') handleCancelCreateItem()
              }}
              className={cn(
                'h-5 px-1 py-0 text-sm flex-1 rounded-xs border-none focus-visible:ring-1',
                newItem.name.trim() &&
                  checkIfPathExists(newItem.name.trim()) &&
                  'border-destructive focus-visible:ring-destructive'
              )}
              autoFocus
            />
          </div>
        )}

        {(() => {
          const folders = nodes.filter((n) => n.type === 'directory')
          const files = nodes.filter((n) => n.type === 'file')

          return (
            <>
              {folders.map((node) => (
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
                  allNodes={nodes}
                  onCreateItem={handleCreateItem}
                  onCancelCreateItem={handleCancelCreateItem}
                  checkIfPathExists={checkIfPathExists}
                  onItemClick={setLastClickedItem}
                  lastClickedItemPath={lastClickedItem}
                />
              ))}

              {newItem.type === 'file' && newItem.path === '' && (
                <div
                  className="flex items-center gap-1 px-2 py-1 bg-accent/50"
                  style={{ paddingLeft: '8px' }}
                >
                  <span className="w-4" />
                  <File className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ name: e.target.value })}
                    onBlur={handleCreateItem}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateItem()
                      else if (e.key === 'Escape') handleCancelCreateItem()
                    }}
                    className={cn(
                      'h-5 px-1 py-0 text-sm flex-1 rounded-xs border-none focus-visible:ring-1',
                      newItem.name.trim() &&
                        checkIfPathExists(newItem.name.trim()) &&
                        'border-destructive focus-visible:ring-destructive'
                    )}
                    autoFocus
                  />
                </div>
              )}

              {files.map((node) => (
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
                  allNodes={nodes}
                  onCreateItem={handleCreateItem}
                  onCancelCreateItem={handleCancelCreateItem}
                  checkIfPathExists={checkIfPathExists}
                  onItemClick={setLastClickedItem}
                  lastClickedItemPath={lastClickedItem}
                />
              ))}
            </>
          )
        })()}
      </div>
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
  allNodes?: FileNode[]
  onCreateItem?: () => Promise<void>
  onCancelCreateItem?: () => void
  checkIfPathExists?: (path: string) => boolean
  onItemClick?: (folderPath: string) => void
  lastClickedItemPath?: string | null
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
  allNodes,
  onCreateItem,
  onCancelCreateItem,
  checkIfPathExists,
  onItemClick,
  lastClickedItemPath,
}: FileTreeNodeProps) {
  const {
    newItem,
    setNewItem,
    highlightedFolderPath,
    setHighlightedFolderPath,
  } = useFileTreeStore()
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(node.name)
  const isSelected = selectedFile === node.path
  const isExpanded = expandedFolders.has(node.path)
  const isLastClickedItem = lastClickedItemPath === node.path
  const draggable = useDraggableNode()

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
    onItemClick?.(node.path)
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
    draggable.set({
      name: node.name,
      isDirectory: node.type === 'directory',
      path: node.path,
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggable.active) return

    let targetFolder: string
    if (node.type === 'directory') {
      targetFolder = node.path
    } else {
      const pathParts = node.path.split('/')
      targetFolder =
        pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : ''
    }

    const sourceParent = draggable.path.includes('/')
      ? draggable.path.substring(0, draggable.path.lastIndexOf('/'))
      : ''

    const isSameParent = sourceParent === targetFolder
    const isMovingIntoSelf =
      draggable.path === targetFolder ||
      node.path.startsWith(draggable.path + '/')

    const targetChildren =
      node.type === 'directory'
        ? node.children || []
        : getNodesInFolder(targetFolder)
    const hasCollision = targetChildren.some(
      (child) => child.name === draggable.name
    )

    if (isSameParent || isMovingIntoSelf || hasCollision) {
      e.dataTransfer.dropEffect = 'none'
      setHighlightedFolderPath(null)
    } else {
      e.dataTransfer.dropEffect = 'move'
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
      setHighlightedFolderPath(null)
    }
  }

  const handleDragEnd = () => {
    setHighlightedFolderPath(null)
    draggable.reset()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setHighlightedFolderPath(null)

    if (!onMove || !draggable.active) return

    try {
      const sourcePath = draggable.path
      const isDirectory = draggable.isDirectory
      const sourceName = draggable.name

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

  const shouldShowNewItemInput =
    newItem.type &&
    newItem.path === node.path &&
    node.type === 'directory' &&
    isExpanded

  const getNewItemPath = () => {
    if (!newItem.name?.trim()) return ''

    return newItem.path
      ? `${newItem.path}/${newItem.name.trim()}`
      : newItem.name.trim()
  }

  const isExistingItemPath =
    getNewItemPath() && checkIfPathExists?.(getNewItemPath())

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-accent transition-colors group border-l-2 border-transparent',
          isSelected && 'bg-accent text-accent-foreground',
          isLastClickedItem && 'bg-accent text-accent-foreground',
          isHighlighted && 'border-primary bg-primary/10'
        )}
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
          {(() => {
            const childFolders = node.children.filter(
              (c) => c.type === 'directory'
            )

            const childFiles = node.children.filter((c) => c.type === 'file')

            return (
              <>
                {shouldShowNewItemInput && newItem.type === 'folder' && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 bg-accent/50"
                    style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
                  >
                    <span className="w-4" />
                    <Folder className="w-4 h-4 text-primary" />
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ name: e.target.value })}
                      onBlur={() => onCreateItem?.()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && onCreateItem) onCreateItem()
                        else if (e.key === 'Escape' && onCancelCreateItem)
                          onCancelCreateItem()
                      }}
                      className={cn(
                        'h-5 px-1 py-0 text-sm flex-1 rounded-xs border-none focus-visible:ring-1',
                        isExistingItemPath &&
                          'border-destructive focus-visible:ring-destructive'
                      )}
                      autoFocus
                    />
                  </div>
                )}

                {childFolders.map((child) => (
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
                    allNodes={allNodes}
                    onCreateItem={onCreateItem}
                    onCancelCreateItem={onCancelCreateItem}
                    checkIfPathExists={checkIfPathExists}
                    onItemClick={onItemClick}
                    lastClickedItemPath={lastClickedItemPath}
                  />
                ))}

                {shouldShowNewItemInput && newItem.type === 'file' && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 bg-accent/50"
                    style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
                  >
                    <span className="w-4" />
                    <File className="w-4 h-4 text-muted-foreground" />
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ name: e.target.value })}
                      onBlur={() => onCreateItem?.()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && onCreateItem) onCreateItem()
                        else if (e.key === 'Escape' && onCancelCreateItem)
                          onCancelCreateItem()
                      }}
                      className={cn(
                        'h-5 px-1 py-0 text-sm flex-1 rounded-xs border-none focus-visible:ring-1',
                        isExistingItemPath &&
                          'border-destructive focus-visible:ring-destructive'
                      )}
                      autoFocus
                    />
                  </div>
                )}

                {childFiles.map((child) => (
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
                    allNodes={allNodes}
                    onCreateItem={onCreateItem}
                    onCancelCreateItem={onCancelCreateItem}
                    checkIfPathExists={checkIfPathExists}
                    onItemClick={onItemClick}
                    lastClickedItemPath={lastClickedItemPath}
                  />
                ))}
              </>
            )
          })()}
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
