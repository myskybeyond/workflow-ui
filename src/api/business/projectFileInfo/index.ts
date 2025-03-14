import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectFileInfoVO, ProjectFileInfoForm, ProjectFileInfoQuery } from '@/api/business/projectFileInfo/types';

/**
 * 查询项目文件信息列表
 * @param query
 * @returns {*}
 */

export const listProjectFileInfo = (query?: ProjectFileInfoQuery): AxiosPromise<ProjectFileInfoVO[]> => {
  return request({
    url: '/business/projectFileInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询项目文件信息详细
 * @param id
 */
export const getProjectFileInfo = (id: string | number): AxiosPromise<ProjectFileInfoVO> => {
  return request({
    url: '/business/projectFileInfo/' + id,
    method: 'get'
  });
};

/**
 * 新增项目文件信息
 * @param data
 */
export const addProjectFileInfo = (data: ProjectFileInfoForm) => {
  return request({
    url: '/business/projectFileInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改项目文件信息
 * @param data
 */
export const updateProjectFileInfo = (data: ProjectFileInfoForm) => {
  return request({
    url: '/business/projectFileInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除项目文件信息
 * @param id
 */
export const delProjectFileInfo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/projectFileInfo/' + id,
    method: 'delete'
  });
};
/**
 * 查询项目文件版本信息列表
 * @param query
 * @returns {*}
 */

export const listProjectFileVersionInfo = (query?: any): AxiosPromise<any[]> => {
  return request({
    url: '/business/projectFileVersionInfo/versionList',
    method: 'get',
    params: query
  });
};

/**
 * 查询我的项目文件信息列表
 * @param query
 * @returns {*}
 */

export const myListProjectFileInfo = (query?: ProjectFileInfoQuery): AxiosPromise<ProjectFileInfoVO[]> => {
  return request({
    url: '/business/projectFileInfo/myList',
    method: 'get',
    params: query
  });
};

/**
 * 根据任务Id查询文件信息
 * @param query
 * @returns {*}
 */

export const taskListProjectFileInfo = (query?: ProjectFileInfoQuery): AxiosPromise<ProjectFileInfoVO[]> => {
  return request({
    url: '/business/projectFileInfo/getListByTaskId',
    method: 'get',
    params: query
  });
};
