import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'

import { renameFiles } from './files.js'

jest.mock('fs/promises')
jest.mock('crypto')

describe('renameFiles', () => {
  const mockReaddir = fs.readdir as jest.Mock
  const mockStat = fs.stat as jest.Mock
  const mockRename = fs.rename as jest.Mock
  const mockRandomUUID = randomUUID as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should rename all files in the directory using randomUUID', async () => {
    const dirPath = '/mock/directory'
    const files = ['file1.txt', 'file2.jpg']
    const stats = { isFile: jest.fn(() => true) }

    mockReaddir.mockResolvedValue(files)
    mockStat.mockResolvedValue(stats)
    mockRandomUUID.mockReturnValueOnce('uuid1').mockReturnValueOnce('uuid2')

    await renameFiles(dirPath)

    expect(mockReaddir).toHaveBeenCalledWith(dirPath)
    expect(mockStat).toHaveBeenCalledTimes(files.length)
    expect(mockRename).toHaveBeenCalledWith(
      path.join(dirPath, 'file1.txt'),
      path.join(dirPath, 'uuid1.txt')
    )
    expect(mockRename).toHaveBeenCalledWith(
      path.join(dirPath, 'file2.jpg'),
      path.join(dirPath, 'uuid2.jpg')
    )
  })

  it('should use a custom naming function if provided', async () => {
    const dirPath = '/mock/directory'
    const files = ['file1.txt']
    const stats = { isFile: jest.fn(() => true) }
    const customNamingFunction = jest.fn(() => 'customName')

    mockReaddir.mockResolvedValue(files)
    mockStat.mockResolvedValue(stats)

    await renameFiles(dirPath, customNamingFunction)

    expect(customNamingFunction).toHaveBeenCalled()
    expect(mockRename).toHaveBeenCalledWith(
      path.join(dirPath, 'file1.txt'),
      path.join(dirPath, 'customName.txt')
    )
  })

  it('should skip directories and only rename files', async () => {
    const dirPath = '/mock/directory'
    const files = ['file1.txt', 'subdir']
    const fileStats = { isFile: jest.fn(() => true) }
    const dirStats = { isFile: jest.fn(() => false) }

    mockReaddir.mockResolvedValue(files)
    mockStat.mockResolvedValueOnce(fileStats).mockResolvedValueOnce(dirStats)
    mockRandomUUID.mockReturnValue('uuid1')

    await renameFiles(dirPath)

    expect(mockRename).toHaveBeenCalledTimes(1)
    expect(mockRename).toHaveBeenCalledWith(
      path.join(dirPath, 'file1.txt'),
      path.join(dirPath, 'uuid1.txt')
    )
  })

  it('should log an error if an exception occurs', async () => {
    const dirPath = '/mock/directory'
    const error = new Error('Test error')
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    mockReaddir.mockRejectedValue(error)

    await renameFiles(dirPath)

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error renaming files:', error)

    consoleErrorSpy.mockRestore()
  })
})
